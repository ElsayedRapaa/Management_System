import React from 'react';
import { Invoice } from '../types';
import { formatCurrency, formatDate } from '../lib/formatters';
import { X, Printer, FileText, User, Calendar, CheckCircle2, Phone, MapPin, Package } from 'lucide-react';

interface InvoiceDetailModalProps {
  invoice: Invoice | null;
  onClose: () => void;
  onOpenPrintModal: (invoice: Invoice) => void;
}

export const InvoiceDetailModal: React.FC<InvoiceDetailModalProps> = ({ invoice, onClose, onOpenPrintModal }) => {
  if (!invoice) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full my-auto p-6 sm:p-8 shadow-2xl border border-slate-200 animate-slide-in relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-700 rounded-2xl flex items-center justify-center border border-emerald-200">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">تفاصيل الفاتورة</h3>
              <p className="text-slate-500 font-mono text-xs font-bold text-emerald-700">{invoice.code}</p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-xl cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Info Card */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">العميل / الجهة المستلمة:</span>
              <div className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                <User className="w-4 h-4 text-emerald-600" />
                <span>{invoice.customer_name}</span>
              </div>
              {invoice.customer_type && (
                <span className="inline-block mt-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                  {invoice.customer_type}
                </span>
              )}
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">تاريخ الإصدار:</span>
              <div className="font-bold text-slate-800 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <span>{formatDate(invoice.created_at)}</span>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div>
            <h4 className="text-xs font-extrabold text-slate-900 mb-3 flex items-center gap-1.5">
              <Package className="w-4 h-4 text-emerald-600" />
              <span>قائمة الأصناف بالفاتورة ({invoice.items.length})</span>
            </h4>

            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-100 text-slate-600 font-bold">
                  <tr>
                    <th className="py-2.5 px-4">الكود</th>
                    <th className="py-2.5 px-4">المنتج</th>
                    <th className="py-2.5 px-4 text-center">الكمية</th>
                    <th className="py-2.5 px-4 text-left">سعر القطعة</th>
                    <th className="py-2.5 px-4 text-left">الإجمالي</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {invoice.items.map((item, idx) => (
                    <tr key={item.id || idx}>
                      <td className="py-2.5 px-4 font-mono font-bold text-emerald-700">{item.product_code}</td>
                      <td className="py-2.5 px-4 font-bold">{item.product_name}</td>
                      <td className="py-2.5 px-4 font-mono text-center font-bold">{item.quantity}</td>
                      <td className="py-2.5 px-4 font-mono text-left">{formatCurrency(item.unit_price)}</td>
                      <td className="py-2.5 px-4 font-mono font-extrabold text-left text-slate-900">
                        {formatCurrency(item.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Grand Total Bar */}
          <div className="bg-slate-900 text-white p-4 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-slate-400 text-xs block">إجمالي الفاتورة النهائي:</span>
              <span className="text-xl font-black text-emerald-400 font-mono">
                {formatCurrency(invoice.total_amount)}
              </span>
            </div>

            <button
              onClick={() => {
                onClose();
                onOpenPrintModal(invoice);
              }}
              className="py-2.5 px-5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة الفاتورة</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
