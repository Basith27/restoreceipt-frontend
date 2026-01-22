import { Receipt, ReceiptItem, ReceiptStatus } from "../types";

const API_URL = "http://127.0.0.1:5000"; // Flask port

interface BackendTuple {
  0: any; // Value
  1: number; // Confidence
}

export const uploadAndAnalyze = async (file: File): Promise<Partial<Receipt>> => {
  const formData = new FormData();
  formData.append("receipt", file);

  try {
    const response = await fetch(`${API_URL}/analyze`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to analyze receipt');
    }

    const result = await response.json();
    const b = result.data;

    // Map Backend items to Frontend items
    const mappedItems: ReceiptItem[] = (b.items || []).map((item: any) => ({
      name: item.description?.[0] || 'Unknown Item',
      price: item.total_price?.[0] || 0,
      qty: item.quantity?.[0] || 1
    }));

    // Unified Mapping Logic
    return {
      vendorName: b.merchant_name?.[0] || 'Unknown Vendor',
      vendorAddress: b.vendor_address?.[0] || '',
      totalAmount: b.total?.[0] || 0,
      taxAmount: b.tax_amount?.[0] || 0,
      date: b.transaction_date?.[0] || new Date().toISOString().split('T')[0],
      gstin: b.gstin?.[0] || '',
      items: mappedItems,
      confidence: b.overall_confidence || 0,
      status: b.status as ReceiptStatus,
      currency: b.currency || '₹',
      extractionSource: b.extraction_source
    };

  } catch (error) {
    console.error("Analysis Error:", error);
    throw error;
  }
};

export type ExportFormat = 'csv' | 'json' | 'xml';

export const exportReceipts = async (format: ExportFormat, receipts: Receipt[], filename: string) => {
  try {
    const response = await fetch(`${API_URL}/export`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        format: format,
        data: receipts,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to generate export.');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error during export:", error);
    throw error;
  }
};