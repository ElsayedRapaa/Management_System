import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Product, Customer, Invoice, CustomerType } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { notifyProductAdded, notifyInvoiceCreated } from '../lib/telegram';

export type ActiveTab = 'dashboard' | 'products' | 'customers' | 'invoices' | 'users';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
}

interface AppContextType {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  
  // Products
  products: Product[];
  addProduct: (productData: Omit<Product, 'id' | 'created_at'>) => Promise<boolean>;
  updateProduct: (id: string, productData: Partial<Product>) => Promise<boolean>;
  deleteProduct: (id: string) => Promise<boolean>;
  
  // Customers
  customers: Customer[];
  addCustomer: (customerData: Omit<Customer, 'id' | 'created_at'>) => Promise<boolean>;
  updateCustomer: (id: string, customerData: Partial<Customer>) => Promise<boolean>;
  deleteCustomer: (id: string) => Promise<boolean>;
  
  // Invoices
  invoices: Invoice[];
  createInvoice: (invoiceData: {
    customer_id: string;
    customer_name: string;
    customer_type?: CustomerType;
    customer_phone?: string;
    customer_address?: string;
    items: {
      product_id: string;
      product_code: string;
      product_name: string;
      unit_price: number;
      quantity: number;
      total: number;
    }[];
    notes?: string;
  }) => Promise<Invoice | null>;
  deleteInvoice: (id: string) => Promise<boolean>;
  
  // Dashboard Metrics
  bankTotalValue: number; // SUM(product.quantity * product.purchase_price)
  totalSalesValue: number; // SUM(invoice.total_amount)
  recentInvoices: Invoice[]; // Latest 3
  
  // Toast notifications
  toasts: ToastMessage[];
  showToast: (type: ToastMessage['type'], title: string, message: string) => void;
  removeToast: (id: string) => void;
  
  // Active Invoice Modals
  viewInvoiceModal: Invoice | null;
  setViewInvoiceModal: (invoice: Invoice | null) => void;
  printInvoiceModal: Invoice | null;
  setPrintInvoiceModal: (invoice: Invoice | null) => void;
  
  isLoadingData: boolean;
  refreshData: () => Promise<void>;
  
  // Users management synchronized with Supabase
  users: any[];
  addUser: (userData: { name: string; email: string; password: string; role: string }) => Promise<{ success: boolean; error?: string }>;
  deleteUser: (idOrEmail: string) => Promise<{ success: boolean; error?: string }>;
  updateUser: (idOrEmail: string, updateData: { name?: string; password?: string; role?: string; email?: string }) => Promise<{ success: boolean; error?: string }>;
}

const STORAGE_KEYS = {
  PRODUCTS: 'inventory_app_products_v2',
  CUSTOMERS: 'inventory_app_customers_v2',
  INVOICES: 'inventory_app_invoices_v2',
};

const AppContext = createContext<AppContextType | undefined>(undefined);

const mapCustomerTypeToDb = (type: string) => {
  if (type === 'صيدلية' || type === 'pharmacy') return 'pharmacy';
  if (type === 'مستشفى' || type === 'hospital') return 'hospital';
  if (type === 'عميل' || type === 'client') return 'client';
  return type || 'client';
};

const mapCustomerTypeFromDb = (type: string): CustomerType => {
  if (type === 'pharmacy' || type === 'صيدلية') return 'صيدلية';
  if (type === 'hospital' || type === 'مستشفى') return 'مستشفى';
  if (type === 'client' || type === 'عميل') return 'عميل';
  return 'عميل';
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Modals for Invoice Details & Print
  const [viewInvoiceModal, setViewInvoiceModal] = useState<Invoice | null>(null);
  const [printInvoiceModal, setPrintInvoiceModal] = useState<Invoice | null>(null);

  const showToast = (type: ToastMessage['type'], title: string, message: string) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    
    // Auto dismiss after 4 seconds
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Initial Load from Supabase or LocalStorage fallback
  const loadInitialData = async () => {
    setIsLoadingData(true);
    try {
      if (isSupabaseConfigured) {
        // Fetch from Supabase
        const { data: pData } = await supabase.from('products').select('*').order('created_at', { ascending: false });
        const { data: cData } = await supabase.from('customers').select('*').order('created_at', { ascending: false });
        const { data: iData } = await supabase.from('invoices').select('*, invoice_items(*)').order('created_at', { ascending: false });

        if (pData) {
          const formattedProducts: Product[] = pData.map((p: any) => ({
            ...p,
            expiry_dates: Array.isArray(p.expiry_dates)
              ? p.expiry_dates.filter((d: any) => d && typeof d === 'string' && d.trim() !== '')
              : p.expiry_dates && typeof p.expiry_dates === 'string' && p.expiry_dates.trim() !== ''
              ? [p.expiry_dates.trim()]
              : [],
          }));
          setProducts(formattedProducts);
        }
        else setProducts(loadLocal(STORAGE_KEYS.PRODUCTS, []));

        if (cData) {
          const formattedCustomers: Customer[] = cData.map((c: any) => ({
            id: c.id,
            code: c.code,
            name: c.name,
            phone: c.phone || '',
            address: c.address || '',
            type: mapCustomerTypeFromDb(c.type),
            created_at: c.created_at || new Date().toISOString(),
          }));
          setCustomers(formattedCustomers);
        } else {
          setCustomers(loadLocal(STORAGE_KEYS.CUSTOMERS, []));
        }

        if (iData) {
          // Format invoices matching the exact DB schema
          const formattedInvoices: Invoice[] = iData.map((inv: any) => ({
            id: inv.id,
            code: inv.invoice_code || inv.code || `INV-${inv.id}`,
            customer_id: inv.customer_id,
            customer_name: inv.customer_name || 'عميل محلي',
            customer_type: inv.customer_type,
            customer_phone: inv.customer_phone,
            customer_address: inv.customer_address,
            created_at: inv.created_at || new Date().toISOString(),
            total_amount: Number(inv.total_amount) || 0,
            item_count: inv.item_count || (inv.invoice_items ? inv.invoice_items.length : 0),
            status: inv.status || 'مدفوعة',
            notes: inv.notes,
            items: (inv.invoice_items || inv.items || []).map((item: any) => ({
              id: item.id || `item-${Math.random()}`,
              invoice_id: item.invoice_id || inv.id,
              product_id: item.product_id,
              product_code: item.product_code || 'PRD',
              product_name: item.product_name || 'منتج',
              unit_price: Number(item.unit_price) || 0,
              quantity: Number(item.quantity) || 1,
              total: Number(item.total_price || item.total) || 0,
            })),
          }));
          // Ensure DESC sort by created_at timestamp
          formattedInvoices.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          setInvoices(formattedInvoices);
        } else {
          setInvoices(loadLocalInvoices());
        }
      } else {
        // Local storage fallback
        setProducts(loadLocal(STORAGE_KEYS.PRODUCTS, []));
        setCustomers(loadLocal(STORAGE_KEYS.CUSTOMERS, []));
        setInvoices(loadLocalInvoices());
      }
    } catch (error) {
      console.warn('Error loading initial data from Supabase, fallback to local storage:', error);
      setProducts(loadLocal(STORAGE_KEYS.PRODUCTS, []));
      setCustomers(loadLocal(STORAGE_KEYS.CUSTOMERS, []));
      setInvoices(loadLocalInvoices());
    } finally {
      setIsLoadingData(false);
    }
  };

  const loadLocal = <T,>(key: string, defaultData: T): T => {
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return defaultData;
      }
    }
    return defaultData;
  };

  const loadLocalInvoices = (): Invoice[] => {
    const list = loadLocal<Invoice[]>(STORAGE_KEYS.INVOICES, []);
    // Sort DESC
    return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Save to Local Storage helper
  const saveLocalProducts = (updated: Product[]) => {
    setProducts(updated);
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(updated));
  };

  const saveLocalCustomers = (updated: Customer[]) => {
    setCustomers(updated);
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(updated));
  };

  const saveLocalInvoices = (updated: Invoice[]) => {
    // ALWAYS ENFORCE DESCENDING ORDER BY CREATED_AT
    const sorted = [...updated].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    setInvoices(sorted);
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(sorted));
  };

  // Add Product
  const addProduct = async (productData: Omit<Product, 'id' | 'created_at'>): Promise<boolean> => {
    const cleanExpiryDates = (productData.expiry_dates || []).filter((d) => d && d.trim() !== '');
    let newProduct: Product = {
      ...productData,
      expiry_dates: cleanExpiryDates,
      id: 'prod-' + Date.now(),
      created_at: new Date().toISOString(),
    };

    try {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase
          .from('products')
          .insert([
            {
              code: productData.code,
              name: productData.name,
              purchase_price: Number(productData.purchase_price),
              selling_price: Number(productData.selling_price),
              quantity: Number(productData.quantity),
              expiry_dates: cleanExpiryDates,
            },
          ])
          .select();

        if (error) {
          console.error('Supabase product insert error:', error);
        } else if (data && data[0]) {
          newProduct = {
            ...productData,
            expiry_dates: Array.isArray(data[0].expiry_dates) ? data[0].expiry_dates : cleanExpiryDates,
            id: data[0].id,
            created_at: data[0].created_at || newProduct.created_at,
          };
        }
      }
      saveLocalProducts([newProduct, ...products]);
      showToast('success', 'تمت الإضافة بنجاح', `تم إضافة المنتج "${newProduct.name}" إلى المخزن.`);
      notifyProductAdded(newProduct).catch((err) => console.error('Telegram product notify error:', err));
      return true;
    } catch (error) {
      console.error('Add product error:', error);
      saveLocalProducts([newProduct, ...products]);
      showToast('success', 'تمت الإضافة بنجاح', `تم إضافة المنتج "${newProduct.name}" (محلياً).`);
      notifyProductAdded(newProduct).catch((err) => console.error('Telegram product notify error:', err));
      return true;
    }
  };

  // Update Product
  const updateProduct = async (id: string, productData: Partial<Product>): Promise<boolean> => {
    const cleanExpiryDates = productData.expiry_dates
      ? productData.expiry_dates.filter((d) => d && d.trim() !== '')
      : undefined;
    const finalProductData = {
      ...productData,
      ...(cleanExpiryDates !== undefined ? { expiry_dates: cleanExpiryDates } : {}),
    };

    try {
      if (isSupabaseConfigured && !id.startsWith('prod-')) {
        const { id: _id, created_at: _c, ...updatePayload } = finalProductData as any;
        const { error } = await supabase.from('products').update(updatePayload).eq('id', id);
        if (error) console.error('Supabase update product error:', error);
      }
      const updated = products.map((p) => (p.id === id ? { ...p, ...finalProductData } : p));
      saveLocalProducts(updated);
      showToast('success', 'تم التحديث بنجاح', 'تم تحديث بيانات المنتج بنجاح.');
      return true;
    } catch (error) {
      console.error(error);
      const updated = products.map((p) => (p.id === id ? { ...p, ...finalProductData } : p));
      saveLocalProducts(updated);
      showToast('success', 'تم التحديث بنجاح', 'تم تحديث البيانات.');
      return true;
    }
  };

  // Delete Product
  const deleteProduct = async (id: string): Promise<boolean> => {
    try {
      if (isSupabaseConfigured && !id.startsWith('prod-')) {
        await supabase.from('products').delete().eq('id', id);
      }
      const updated = products.filter((p) => p.id !== id);
      saveLocalProducts(updated);
      showToast('warning', 'تم الحذف', 'تم حذف المنتج من المخزن.');
      return true;
    } catch {
      const updated = products.filter((p) => p.id !== id);
      saveLocalProducts(updated);
      showToast('warning', 'تم الحذف', 'تم حذف المنتج.');
      return true;
    }
  };

  // Add Customer
  const addCustomer = async (customerData: Omit<Customer, 'id' | 'created_at'>): Promise<boolean> => {
    let newCustomer: Customer = {
      ...customerData,
      id: 'cust-' + Date.now(),
      created_at: new Date().toISOString(),
    };

    try {
      if (isSupabaseConfigured) {
        const payload = {
          code: customerData.code,
          name: customerData.name,
          phone: customerData.phone || '',
          address: customerData.address || '',
          type: mapCustomerTypeToDb(customerData.type),
        };

        const { data, error } = await supabase
          .from('customers')
          .insert([payload])
          .select();

        if (error) {
          console.error('Supabase customer insert error:', error.message);
          // Fallback to local storage
          saveLocalCustomers([newCustomer, ...customers]);
          showToast('success', 'تم إضافة العميل', `تم إضافة العميل "${newCustomer.name}" (محلياً).`);
          return true;
        } else if (data && data[0]) {
          newCustomer = {
            id: data[0].id,
            code: data[0].code || customerData.code,
            name: data[0].name || customerData.name,
            phone: data[0].phone || customerData.phone,
            address: data[0].address || customerData.address,
            type: mapCustomerTypeFromDb(data[0].type || customerData.type),
            created_at: data[0].created_at || newCustomer.created_at,
          };
        }
      }
      saveLocalCustomers([newCustomer, ...customers]);
      showToast('success', 'تم إضافة العميل', `تم إضافة العميل "${newCustomer.name}" بنجاح.`);
      return true;
    } catch (err: any) {
      console.error('Network/Database error adding customer:', err);
      // Fallback: If network fails (e.g. Failed to fetch), save locally to prevent blocking the user UI
      saveLocalCustomers([newCustomer, ...customers]);
      showToast('warning', 'حفظ محلي', 'تعذر الاتصال بالخادم، تم حفظ العميل محلياً بنجاح.');
      return true;
    }
  };

  // Update Customer
  const updateCustomer = async (id: string, customerData: Partial<Customer>): Promise<boolean> => {
    try {
      if (isSupabaseConfigured && !id.startsWith('cust-')) {
        const { id: _id, created_at: _c, ...updatePayload } = customerData as any;
        if (updatePayload.type) {
          updatePayload.type = mapCustomerTypeToDb(updatePayload.type);
        }
        const { error } = await supabase.from('customers').update(updatePayload).eq('id', id);
        if (error) {
          console.error('Supabase customer update error:', error.message);
        }
      }
      const updated = customers.map((c) => (c.id === id ? { ...c, ...customerData } : c));
      saveLocalCustomers(updated);
      showToast('success', 'تم التحديث', 'تم تعديل بيانات العميل بنجاح.');
      return true;
    } catch (error: any) {
      console.error('Update customer error:', error);
      const updated = customers.map((c) => (c.id === id ? { ...c, ...customerData } : c));
      saveLocalCustomers(updated);
      showToast('success', 'تم التحديث', 'تم تعديل بيانات العميل محلياً.');
      return true;
    }
  };

  // Delete Customer
  const deleteCustomer = async (id: string): Promise<boolean> => {
    try {
      if (isSupabaseConfigured && !id.startsWith('cust-')) {
        const { error } = await supabase.from('customers').delete().eq('id', id);
        if (error) {
          console.error('Supabase customer delete error:', error.message);
        }
      }
      const updated = customers.filter((c) => c.id !== id);
      saveLocalCustomers(updated);
      showToast('warning', 'تم الحذف', 'تم حذف بيانات العميل.');
      return true;
    } catch (error) {
      console.error('Delete customer error:', error);
      const updated = customers.filter((c) => c.id !== id);
      saveLocalCustomers(updated);
      showToast('warning', 'تم الحذف', 'تم حذف بيانات العميل محلياً.');
      return true;
    }
  };

  // Create Invoice
  const createInvoice = async (invoiceData: {
    customer_id: string;
    customer_name: string;
    customer_type?: CustomerType;
    customer_phone?: string;
    customer_address?: string;
    items: {
      product_id: string;
      product_code: string;
      product_name: string;
      unit_price: number;
      quantity: number;
      total: number;
    }[];
    notes?: string;
  }): Promise<Invoice | null> => {
    // 1. Calculate grand total
    const total_amount = invoiceData.items.reduce((sum, item) => sum + item.total, 0);
    const item_count = invoiceData.items.reduce((sum, item) => sum + item.quantity, 0);

    // 2. Generate code
    const invCount = invoices.length;
    const year = new Date().getFullYear();
    const code = `INV-${year}-${(invCount + 1).toString().padStart(3, '0')}`;
    const invId = 'inv-' + Date.now();

    const newInvoice: Invoice = {
      id: invId,
      code,
      customer_id: invoiceData.customer_id,
      customer_name: invoiceData.customer_name,
      customer_type: invoiceData.customer_type,
      customer_phone: invoiceData.customer_phone,
      customer_address: invoiceData.customer_address,
      created_at: new Date().toISOString(), // CRITICAL: Current timestamp
      total_amount,
      item_count,
      status: 'مدفوعة',
      notes: invoiceData.notes,
      items: invoiceData.items.map((item, idx) => ({
        ...item,
        id: `item-${invId}-${idx}`,
        invoice_id: invId,
      })),
    };

    // 3. Decrement Product Quantities in Products state / Supabase
    const updatedProducts = [...products];
    for (const item of invoiceData.items) {
      const prodIndex = updatedProducts.findIndex((p) => p.id === item.product_id);
      if (prodIndex !== -1) {
        const currentQty = updatedProducts[prodIndex].quantity;
        const newQty = Math.max(0, currentQty - item.quantity);
        updatedProducts[prodIndex] = {
          ...updatedProducts[prodIndex],
          quantity: newQty,
        };

        if (isSupabaseConfigured) {
          try {
            await supabase.from('products').update({ quantity: newQty }).eq('id', item.product_id);
          } catch (e) {
            console.error('Error updating stock in Supabase:', e);
          }
        }
      }
    }

    // Save updated products
    saveLocalProducts(updatedProducts);

    // 4. Save Invoice (Put NEWEST at the VERY TOP!)
    const updatedInvoices = [newInvoice, ...invoices];
    saveLocalInvoices(updatedInvoices);

    if (isSupabaseConfigured) {
      try {
        const invoicePayload: any = {
          invoice_code: newInvoice.code,
          customer_name: newInvoice.customer_name,
          total_amount: newInvoice.total_amount,
        };
        if (newInvoice.customer_id && !newInvoice.customer_id.startsWith('cust-')) {
          invoicePayload.customer_id = newInvoice.customer_id;
        }

        const { data: invData, error: invErr } = await supabase
          .from('invoices')
          .insert([invoicePayload])
          .select();

        if (invErr) {
          console.error('Supabase invoice insert error:', invErr);
        } else if (invData && invData[0]) {
          const dbInvId = invData[0].id;
          newInvoice.id = dbInvId;
          if (invData[0].created_at) {
            newInvoice.created_at = invData[0].created_at;
          }

          // Insert items matching schema (invoice_id, product_id, product_name, quantity, unit_price, total_price)
          const itemsPayload = newInvoice.items.map((item) => {
            const itemObj: any = {
              invoice_id: dbInvId,
              product_name: item.product_name,
              quantity: item.quantity,
              unit_price: item.unit_price,
              total_price: item.total,
            };
            if (item.product_id && !item.product_id.startsWith('prod-')) {
              itemObj.product_id = item.product_id;
            }
            return itemObj;
          });

          const { error: itemsErr } = await supabase
            .from('invoice_items')
            .insert(itemsPayload);

          if (itemsErr) {
            console.error('Supabase invoice items insert error:', itemsErr);
          }
        }
      } catch (e) {
        console.error('Error inserting invoice to Supabase:', e);
      }
    }

    showToast('success', 'تم إنشاء الفاتورة بنجاح!', `فاتورة رقم ${newInvoice.code} بمبلغ ${total_amount.toLocaleString('ar-EG')} ج.م`);
    notifyInvoiceCreated(newInvoice).catch((err) => console.error('Telegram invoice notify error:', err));
    
    return newInvoice;
  };

  // Delete Invoice
  const deleteInvoice = async (id: string): Promise<boolean> => {
    try {
      if (isSupabaseConfigured && !id.startsWith('inv-')) {
        await supabase.from('invoices').delete().eq('id', id);
      }
      const updated = invoices.filter((i) => i.id !== id);
      saveLocalInvoices(updated);
      showToast('warning', 'تم حذف الفاتورة', 'تم إلغاء الفاتورة وإزالتها من النظام.');
      return true;
    } catch {
      const updated = invoices.filter((i) => i.id !== id);
      saveLocalInvoices(updated);
      showToast('warning', 'تم الحذف', 'تم حذف الفاتورة.');
      return true;
    }
  };

  // 1. Bank Total Value Calculation: SUM(product.quantity * product.purchase_price)
  const bankTotalValue = useMemo(() => {
    return products.reduce((acc, prod) => {
      const qty = Number(prod.quantity) || 0;
      const purchasePrice = Number(prod.purchase_price) || 0;
      return acc + qty * purchasePrice;
    }, 0);
  }, [products]);

  // Total Revenue Calculation
  const totalSalesValue = useMemo(() => {
    return invoices.reduce((acc, inv) => acc + (Number(inv.total_amount) || 0), 0);
  }, [invoices]);

  // Latest 3 Invoices sorted DESC
  const recentInvoices = useMemo(() => {
    return [...invoices]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 3);
  }, [invoices]);

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        customers,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        invoices,
        createInvoice,
        deleteInvoice,
        bankTotalValue,
        totalSalesValue,
        recentInvoices,
        toasts,
        showToast,
        removeToast,
        viewInvoiceModal,
        setViewInvoiceModal,
        printInvoiceModal,
        setPrintInvoiceModal,
        isLoadingData,
        refreshData: loadInitialData,
        users: auth.users,
        addUser: auth.addUser,
        deleteUser: auth.deleteUser,
        updateUser: auth.updateUser,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
