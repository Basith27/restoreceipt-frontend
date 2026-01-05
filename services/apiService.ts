import { log } from "console";
import { ReceiptItem, Receipt, ReceiptStatus } from "../types";

// The URL of our running Flask API
const API_URL = "http://127.0.0.1:5000";

interface BackendItem {
  description: [string | null, number];
  total_price: [number | null, number];
  quantity: [number | null, number];
}

// This is the data structure our Python back-end sends
interface ApiResponse {
  merchant_name: [string | null, number];
  transaction_date: [string | null, number];
  total: [number | null, number];
  tax_amount: [number | null, number];
  items: BackendItem[];
  gstin: [string | null, number];
  hsn: [string | null, number];
  overall_confidence: number;
  category: string;
  status: ReceiptStatus
  currency: string;  
}

export const uploadAndParseReceipt = async (file: File): Promise<Partial<Receipt>> => {
  const formData = new FormData();
  formData.append("receipt", file);

  try {
    const response = await fetch(`${API_URL}/analyze`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Something went wrong on the server.');
    }

    const result = await response.json();
    const backendData: ApiResponse = result.data;

    // --- IMPORTANT: Data Mapping ---
    // We must map the data from our Python format to the format the frontend expects.
    const frontendItems: ReceiptItem[] = backendData.items.map(item => ({
        name: item.description?.[0] || 'N/A',
        price: item.total_price?.[0] || 0,
        qty: item.quantity?.[0] || 1,
    }));

    const frontendData: Partial<Receipt> = {
      vendorName: backendData.merchant_name?.[0],
      totalAmount: backendData.total?.[0] || 0,
      taxAmount: backendData.tax_amount?.[0] || 0,
      date: backendData.transaction_date?.[0],
      items: frontendItems,
      confidence: backendData.overall_confidence,
      category: backendData.category,
      status: backendData.status,
      currency: backendData.currency || '₹',
    };
    return frontendData;

  } catch (error) {
    console.error("Error uploading or parsing receipt:", error);
    throw error;
  }
};

export type ExportFormat = 'csv' | 'json' | 'xml';

export const exportReceipts = async (format: ExportFormat, receiptIds: string[], filename: string) => {
  try {
    const response = await fetch(`${API_URL}/export`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        format: format,
        receipt_ids: receiptIds,
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