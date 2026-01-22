export enum AppView {
  DASHBOARD = 'DASHBOARD',
  CAPTURE = 'CAPTURE',
  VERIFIER = 'VERIFIER',
  LEDGER = 'LEDGER',
  EXPORT = 'EXPORT',
}

export enum ReceiptStatus {
  PROCESSING = 'Processing',
  NEEDS_REVIEW = 'Needs Review',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
}

export enum ConfidenceLevel {
  HIGH = 'HIGH',
  LOW = 'LOW',
}

export interface ReceiptItem {
  name: string;
  qty: number;
  price: number;
}

export interface Receipt {
  id: string;
  vendorName: string;
  vendorAddress?: string;
  totalAmount: number;
  date: string;
  category: string;
  gstin?: string; 
  taxAmount: number;
  status: ReceiptStatus;
  imageUrl: string;
  confidence: number;
  items?: ReceiptItem[];
  uploadedBy: string;
  fileType?: string;
  currency?: string;
  extractionSource?: 'Custom-LLM' | 'Azure-DI';
}

export interface Outlet {
  id: string;
  name: string;
  location: string;
}

export interface Stats {
  pendingCount: number;
  approvedCount: number;
  monthSpend: number;
  projectedTax: number;
}
