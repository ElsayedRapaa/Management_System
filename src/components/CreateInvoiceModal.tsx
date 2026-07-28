import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Product, Customer } from '../types';
import { formatCurrency } from '../lib/formatters';
import {
  X,
  Plus,
  Trash2,
  FileCheck2,
  User,
  Package,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';

interface CreateInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface LineItemInput {
  id: string;
  product_id: string;
  product_code: string;
  product_name: string;
  unit_price: number;
  quantity: number;
  available_stock: number;
  total: number;
}

export const CreateInvoiceModal: React.FC<CreateInvoiceModalProps> = ({ isOpen, onClose }) => {
  const { customers, products, createInvoice, setPrintInvoiceModal } = useApp();

  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [lineItems, setLineItems] = useState<LineItemInput[]>([]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Selected customer details
  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  // Add line item row
  const handleAddLineItem = () => {
    if (products.length === 0) {
      setErrorMsg('لا توجد منتجات متاحة في المخزن للإضافة.');
      return;
    }

    const firstProduct = products[0];
    const initialQty = 1;

    setLineItems((prev) => [
      ...prev,
      {
        id: Date.now().toString() + Math.random().toString(36).substring(2, 5),
        product_id: firstProduct.id,
        product_code: firstProduct.code,
        product_name: firstProduct.name,
        unit_price: firstProduct.selling_price,
        quantity: initialQty,
        available_stock: firstProduct.quantity,
        total: firstProduct.selling_price * initialQty,
      },
    ]);
  };

  // Change product in line item
  const handleProductChange = (lineId: string, newProductId: string) => {
    const product = products.find((p) => p.id === newProductId);
    if (!product) return;

    setLineItems((prev) =>
      prev.map((item) => {
        if (item.id === lineId) {
          const qty = Math.min(item.quantity, product.quantity > 0 ? product.quantity : 1);
          return {
            ...item,
            product_id: product.id,
            product_code: product.code,
            product_name: product.name,
            unit_price: product.selling_price,
            quantity: qty,
            available_stock: product.quantity,
            total: product.selling_price * qty,
          };
        }
        return item;
      })
    );
  };

  // Change quantity in line item
  const handleQuantityChange = (lineId: string, newQty: number) => {
    setLineItems((prev) =>
      prev.map((item) => {
        if (item.id === lineId) {
          const qty = Math.max(1, newQty);
          return {
            ...item,
            quantity: qty,
            total: item.unit_price * qty,
          };
        }
        return item;
      })
    );
  };

  // Remove line item
  const handleRemoveLineItem = (lineId: string) => {
    setLineItems((prev) => prev.filter((item) => item.id !== lineId));
  };

  // Grand Total
  const grandTotal = lineItems.reduce((sum, item) => sum + item.total, 0);

  // Submit Invoice Creation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!selectedCustomerId || !selectedCustomer) {
      setErrorMsg('يرجى اختيار العميل أو الصيدلية قبل حفظ الفاتورة.');
      return;
    }

    if (lineItems.length === 0) {
      setErrorMsg('يرجى إضافة بند واحد على الأقل إلى الفاتورة.');
      return;
    }

    // Validate Stock for each item
    for (const item of lineItems) {
      if (item.quantity > item.available_stock) {
        setErrorMsg(
          `الكمية المطلوبة للمنتج (${item.product_name}) هي ${item.quantity} ولكن المتاح بالمخزن ${item.available_stock} فقط!`
        );
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const createdInvoice = await createInvoice({
        customer_id: selectedCustomer.id,
        customer_name: selectedCustomer.name,
        customer_type: selectedCustomer.type,
        customer_phone: selectedCustomer.phone,
        customer_address: selectedCustomer.address,
        items: lineItems.map((item) => ({
          product_id: item.product_id,
          product_code: item.product_code,
          product_name: item.product_name,
          unit_price: item.unit_price,
          quantity: item.quantity,
          total: item.total,
        })),
        notes,
      });

      setIsSubmitting(false);

      if (createdInvoice) {
        onClose();
        // Offer print modal directly
        setPrintInvoiceModal(createdInvoice);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('حدث خطأ أثناء حفظ الفاتورة. يرجى إعادة المحاولة.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full my-auto shadow-2xl border border-slate-200 animate-slide-in relative flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 sm:p-8 pb-4 border-b border-slate-100 shrink-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-emerald-50 text-emerald-700 rounded-2xl flex items-center justify-center border border-emerald-200">
                <FileCheck2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-slate-900">إنشاء فاتورة صيدلانية جديدة</h3>
                <p className="text-slate-500 text-xs mt-0.5">خصم الآلي للكميات المتاحة من المخزن فور الاعتماد</p>
              </div>
            </div>

            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-xl cursor-pointer">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Error Alert */}
          {errorMsg && (
            <div className="mt-4 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-2xl flex items-center gap-2.5 shrink-0">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span className="font-bold">{errorMsg}</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 max-h-[85vh] sm:max-h-[90vh] overflow-y-auto p-4 sm:p-8 pb-20 space-y-6">
          {/* Customer Selection Row */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 shrink-0 space-y-3">
            <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <User className="w-4 h-4 text-emerald-600" />
              <span>اختر العميل / الصيدلية / المستشفى</span>
            </label>

            <select
              required
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="w-full bg-white border border-slate-200 text-slate-900 text-xs font-bold rounded-xl px-3.5 py-3 focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="">-- اختر من قائمة العملاء المسجلين ({customers.length}) --</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.type}) - {c.phone}
                </option>
              ))}
            </select>

            {selectedCustomer && (
              <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs flex flex-wrap justify-between gap-2 text-slate-700">
                <div>العنوان: <span className="font-semibold text-slate-900">{selectedCustomer.address}</span></div>
                <div>الهاتف: <span className="font-mono font-semibold text-slate-900">{selectedCustomer.phone}</span></div>
                <div>النوع: <span className="font-bold text-emerald-700">{selectedCustomer.type}</span></div>
              </div>
            )}
          </div>

          {/* Line Items Table */}
          <div className="flex-1 overflow-y-auto min-h-[200px] border border-slate-200 rounded-2xl p-4 bg-slate-50/50 space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                <Package className="w-4 h-4 text-emerald-600" />
                <span>بنود الأصناف والكميات</span>
              </h4>

              <button
                type="button"
                onClick={handleAddLineItem}
                className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة بند منتج</span>
              </button>
            </div>

            {lineItems.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-xs border border-dashed border-slate-300 rounded-xl">
                انقر على زر "إضافة بند منتج" لإضافة الأصناف المطلوبة للفاتورة.
              </div>
            ) : (
              <div className="space-y-3">
                {lineItems.map((item) => {
                  const isOverStock = item.quantity > item.available_stock;

                  return (
                    <div
                      key={item.id}
                      className={`p-3 rounded-xl border transition-all ${
                        isOverStock ? 'bg-rose-50 border-rose-300' : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-3 items-center text-xs">
                        {/* Select Product */}
                        <div className="md:col-span-5">
                          <label className="block text-[10px] text-slate-400 mb-1">المنتج</label>
                          <select
                            value={item.product_id}
                            onChange={(e) => handleProductChange(item.id, e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs font-bold rounded-lg p-2 focus:outline-none focus:border-emerald-500 cursor-pointer"
                          >
                            {products.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name} ({p.code}) - {p.selling_price} ج.م - المتاح: {p.quantity}{p.expiry_dates && p.expiry_dates.length > 0 ? ` [صلاحية: ${p.expiry_dates.join('، ')}]` : ''}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Unit Price */}
                        <div className="md:col-span-2">
                          <label className="block text-[10px] text-slate-400 mb-1">سعر الوحدة</label>
                          <div className="font-mono font-bold text-slate-900 p-2 bg-slate-100 rounded-lg text-center">
                            {formatCurrency(item.unit_price)}
                          </div>
                        </div>

                        {/* Quantity */}
                        <div className="md:col-span-2">
                          <label className="block text-[10px] text-slate-400 mb-1">
                            الكمية (المتاح: {item.available_stock})
                          </label>
                          <input
                            type="number"
                            min="1"
                            max={item.available_stock}
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value, 10) || 1)}
                            className={`w-full text-center font-mono font-bold rounded-lg p-2 text-xs border focus:outline-none ${
                              isOverStock
                                ? 'bg-rose-100 border-rose-400 text-rose-900'
                                : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-emerald-500'
                            }`}
                          />
                        </div>

                        {/* Line Total */}
                        <div className="md:col-span-2">
                          <label className="block text-[10px] text-slate-400 mb-1">الإجمالي</label>
                          <div className="font-mono font-black text-emerald-700 p-2 bg-emerald-50 rounded-lg text-center">
                            {formatCurrency(item.total)}
                          </div>
                        </div>

                        {/* Delete row */}
                        <div className="md:col-span-1 flex justify-end">
                          <button
                            type="button"
                            onClick={() => handleRemoveLineItem(item.id)}
                            className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer Summary & Submit */}
          <div className="sticky bottom-0 bg-white border-t border-slate-200 p-4 z-10 shrink-0 space-y-4 shadow-lg rounded-b-3xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 text-white p-4 rounded-2xl shadow-inner">
              <div>
                <span className="text-slate-400 text-xs block">إجمالي قيمة الفاتورة النهائي:</span>
                <span className="text-2xl font-black text-emerald-400 font-mono">
                  {formatCurrency(grandTotal)}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting || lineItems.length === 0}
                  className="py-3 px-6 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>اعتماد وحفظ الفاتورة</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
