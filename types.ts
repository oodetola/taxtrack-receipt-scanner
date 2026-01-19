
export interface ReceiptItem {
  description: string;
  amount: number;
}

export interface Receipt {
  id: string;
  merchantName: string;
  date: string;
  totalAmount: number;
  currency: string;
  category: string;
  items: ReceiptItem[];
  imageUrl: string;
  createdAt: number;
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  HISTORY = 'HISTORY',
  CAPTURE = 'CAPTURE',
  DETAILS = 'DETAILS'
}

export interface ExtractionResult {
  merchantName: string;
  date: string;
  totalAmount: number;
  currency: string;
  category: string;
  items: ReceiptItem[];
}

export interface AppError {
  type: 'IMAGE_QUALITY' | 'NETWORK' | 'API_LIMIT' | 'UNKNOWN' | 'INVALID_FILE';
  message: string;
  suggestions: string[];
}

export const STANDARD_TAX_CATEGORIES = [
  'Meals & Entertainment',
  'Travel',
  'Office Supplies',
  'Software & Subscriptions',
  'Utilities',
  'Rent/Lease',
  'Professional Services',
  'Marketing/Advertising',
  'Insurance',
  'Taxes & Licenses',
  'Maintenance & Repairs',
  'Other Business Expense'
];
