import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { Invoice } from '../types';
import { formatCurrency, formatDate } from '../lib/formatters';
import {
  FileText,
  Plus,
  Search,
  Eye,
  Printer,
  Trash2,
  Calendar,
  CheckCircle2,
  Building2,
  ArrowDownUp
} from 'lucide-react';

interface InvoicesViewProps {
  onOpenCreateInvoice: () => void;
}

export const InvoicesView: React.FC<InvoicesViewProps> = ({ onOpenCreateInvoice }) => {
  const { invoices, deleteInvoice, setViewInvoiceModal, setPrintInvoiceModal, totalSalesValue } = useApp();
  const { user } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [deletingInvoice, setDeletingInvoice] = useState<Invoice | null>(null);

  // CRITICAL ORDERING RULE: Always sorted DESC by created_at timestamp
  const sortedInvoices = useMemo(() => {
    return [...invoices].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [invoices]);

  const filteredInvoices = useMemo(() => {
    return sortedInvoices.filter((inv) => {
      const matchCode = inv.code.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCust = inv.customer_name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchCode || matchCust;
    });
  }, [sortedInvoices, searchTerm]);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Header & Metrics Bar */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>سجل الفواتير والمبيعات المصدرة</span>
            <span className="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full font-bold border border-emerald-200">
              مرتبة من الأحدث إلى الأقدم
            </span>
          </h2>
          <p className="text-slate-500 text-xs mt-1">
            إجمالي قيمة المبيعات المكتملة: <span className="font-extrabold text-emerald-700 font-mono text-sm">{formatCurrency(totalSalesValue)}</span>
          </p>
        </div>

        <button
          onClick={onOpenCreateInvoice}
          className="py-3 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg shadow-emerald-600/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
          <span>إنشاء فاتورة جديدة</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
        <div className="relative w-full">
          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ابحث برقم الفاتورة (INV-2026-001) أو اسم العميل / الصيدلية..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-10 pl-4 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Invoices List Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {filteredInvoices.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            لا توجد فواتير تطابق شروط البحث. انقر على زر "إنشاء فاتورة جديدة" لإصدار فاتورة.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-4 px-6">رقم الفاتورة</th>
                  <th className="py-4 px-6">اسم العميل / الجهة</th>
                  <th className="py-4 px-6">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>تاريخ الإصدار (الأحدث أولاً)</span>
                    </div>
                  </th>
                  <th className="py-4 px-6">عدد البنود</th>
                  <th className="py-4 px-6">الإجمالي (EGP)</th>
                  <th className="py-4 px-6">الحالة</th>
                  <th className="py-4 px-6 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-emerald-700">{inv.code}</td>
                    <td className="py-4 px-6 font-bold text-slate-900">
                      <div>{inv.customer_name}</div>
                      {inv.customer_type && (
                        <span className="text-[10px] text-slate-400 font-normal">{inv.customer_type}</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-slate-600 font-mono">
                      {new Date(inv.created_at).toLocaleDateString('ar-EG', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-4 px-6 font-mono font-bold text-slate-700">{inv.item_count} قطعة</td>
                    <td className="py-4 px-6 font-mono font-black text-slate-900 text-sm">
                      {formatCurrency(inv.total_amount)}
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>مدفوعة</span>
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setViewInvoiceModal(inv)}
                          title="عرض تفاصيل الفاتورة"
                          className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setPrintInvoiceModal(inv)}
                          title="طباعة / PDF"
                          className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl transition-colors cursor-pointer"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        {user?.role !== 'employee' && (
                          <button
                            onClick={() => setDeletingInvoice(inv)}
                            title="حذف الفاتورة"
                            className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Invoice Modal */}
      {deletingInvoice && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 text-center space-y-4 border border-slate-100 shadow-2xl animate-scale-up">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-extrabold text-slate-900">إلغاء وحذف الفاتورة؟</h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              هل أنت تأكد من حذف الفاتورة رقم "{deletingInvoice.code}" الخاصة بـ ({deletingInvoice.customer_name})؟
            </p>

            <div className="flex gap-3 pt-2">
              <button
                onClick={async () => {
                  await deleteInvoice(deletingInvoice.id);
                  setDeletingInvoice(null);
                }}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer"
              >
                تأكيد الحذف
              </button>
              <button
                onClick={() => setDeletingInvoice(null)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
