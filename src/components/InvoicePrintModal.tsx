import React from 'react';
import { Invoice } from '../types';
import { formatCurrency, formatDate } from '../lib/formatters';
import { X, Printer, Download, CheckCircle2, Building2, Phone, MapPin } from 'lucide-react';

interface InvoicePrintModalProps {
  invoice: Invoice | null;
  onClose: () => void;
}

export const InvoicePrintModal: React.FC<InvoicePrintModalProps> = ({ invoice, onClose }) => {
  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full my-auto shadow-2xl border border-slate-200 animate-scale-up overflow-hidden">
        {/* Modal Top Control Bar (Hidden when printing) */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-emerald-400" />
            <span className="font-bold text-sm">معاينة وإصدار طباعة الفاتورة</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="py-2 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة الفاتورة (Print / PDF)</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div id="printable-invoice" className="p-8 sm:p-12 space-y-8 bg-white text-slate-900 dir-rtl">
          {/* Invoice Header / Brand */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b-2 border-slate-900">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900">شركة محمود للمستلزمات والأدوية</h1>
              <p className="text-xs text-slate-600 mt-1">الموزع المعتمد للصيدليات والمستشفيات</p>
              <div className="mt-3 text-[11px] text-slate-500 space-y-0.5">
                <div>المركز الرئيسي: شارع النصر، القاهرة، مصر</div>
                <div className="dir-ltr text-right">هاتف: 01012345678 | 0223456789</div>
              </div>
            </div>

            <div className="text-left sm:text-left dir-ltr bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">رقم الفاتورة Official Invoice</span>
              <div className="text-xl font-black text-emerald-700 font-mono tracking-wider mt-0.5">{invoice.code}</div>
              <div className="text-xs text-slate-600 mt-1 font-mono">{formatDate(invoice.created_at)}</div>
            </div>
          </div>

          {/* Customer Info Card */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">فاتورة موجهة إلى:</span>
              <div className="font-black text-slate-900 text-sm">{invoice.customer_name}</div>
              {invoice.customer_type && (
                <span className="inline-block mt-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                  {invoice.customer_type}
                </span>
              )}
            </div>

            <div className="space-y-1">
              {invoice.customer_phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-mono text-slate-800">{invoice.customer_phone}</span>
                </div>
              )}
              {invoice.customer_address && (
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span className="text-slate-700">{invoice.customer_address}</span>
                </div>
              )}
            </div>
          </div>

          {/* Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-slate-900 text-white font-bold">
                  <th className="py-3 px-4 rounded-r-xl">م</th>
                  <th className="py-3 px-4">كود المنتج</th>
                  <th className="py-3 px-4">بيان الصنف / الدواء</th>
                  <th className="py-3 px-4 text-center">الكمية</th>
                  <th className="py-3 px-4 text-left">سعر الوحدة</th>
                  <th className="py-3 px-4 text-left rounded-l-xl">الإجمالي (ج.م)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium text-slate-800">
                {invoice.items.map((item, idx) => (
                  <tr key={item.id || idx}>
                    <td className="py-3 px-4 font-mono font-bold text-slate-500">{idx + 1}</td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-700">{item.product_code}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{item.product_name}</td>
                    <td className="py-3 px-4 font-mono text-center font-bold">{item.quantity}</td>
                    <td className="py-3 px-4 font-mono text-left">{formatCurrency(item.unit_price)}</td>
                    <td className="py-3 px-4 font-mono font-black text-left text-slate-900">
                      {formatCurrency(item.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Grand Total Breakdown */}
          <div className="pt-4 border-t-2 border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div className="text-xs text-slate-500 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-emerald-700">
                <CheckCircle2 className="w-4 h-4" />
                <span>حالة الفاتورة: مدفوعة بالكامل</span>
              </div>
              <p>تم استلام المنتجات ومراجعة الصلاحيات والأسعار بواسطة العميل.</p>
            </div>

            <div className="w-full sm:w-72 bg-slate-900 text-white p-5 rounded-2xl space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>عدد البنود الموردة:</span>
                <span className="font-mono text-white font-bold">{invoice.item_count} قطعة</span>
              </div>
              <div className="flex justify-between text-base font-black pt-2 border-t border-slate-800">
                <span>الإجمالي الصافي:</span>
                <span className="font-mono text-emerald-400">{formatCurrency(invoice.total_amount)}</span>
              </div>
            </div>
          </div>

          {/* Footer Barcode Look & Signature */}
          <div className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
            <div className="text-center sm:text-right">
              <div className="font-bold text-slate-800">توقيع المسؤول / المبيعات:</div>
              <div className="text-slate-600 font-serif italic mt-1">محمود - المدير العام</div>
            </div>

            <div className="font-mono text-[10px] tracking-widest text-slate-400 text-center">
              *||||| | ||||| || |||||| | |||||||*
              <div className="text-[9px]">{invoice.code} - {invoice.created_at}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
