export type CustomerType = 'صيدلية' | 'مستشفى' | 'عميل';

export interface User {
  email: string;
  name: string;
  role: string;
}

export interface Product {
  id: string;
  code: string;
  name: string;
  purchase_price: number; // سعر الشراء
  selling_price: number;  // سعر البيع
  quantity: number;       // الكمية المتاحة
  category?: string;
  created_at: string;
  updated_at?: string;
}

export interface Customer {
  id: string;
  code: string;
  name: string;
  phone: string;
  address: string;
  type: CustomerType;
  created_at: string;
}

export interface InvoiceItem {
  id: string;
  invoice_id?: string;
  product_id: string;
  product_code: string;
  product_name: string;
  unit_price: number;
  quantity: number;
  total: number;
}

export interface Invoice {
  id: string;
  code: string;
  customer_id: string;
  customer_name: string;
  customer_type?: CustomerType;
  customer_phone?: string;
  customer_address?: string;
  created_at: string; // ISO Date
  total_amount: number;
  item_count: number;
  items: InvoiceItem[];
  notes?: string;
  status?: 'مدفوعة' | 'معلقة' | 'ملغاة';
}

export interface SalesAnalyticsData {
  month: string;
  sales: number;
  invoicesCount: number;
}
