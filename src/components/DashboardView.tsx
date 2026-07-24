import React from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../lib/formatters';
import {
  TrendingUp,
  Landmark,
  FileCheck2,
  Boxes,
  Plus,
  Eye,
  Printer,
  ArrowUpRight,
  AlertTriangle,
  Users,
  CheckCircle2,
  DollarSign
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface DashboardViewProps {
  onOpenCreateInvoice: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onOpenCreateInvoice }) => {
  const {
    bankTotalValue,
    totalSalesValue,
    recentInvoices,
    products,
    customers,
    invoices,
    setActiveTab,
    setViewInvoiceModal,
    setPrintInvoiceModal
  } = useApp();

  // Low Stock Items (Quantity < 30)
  const lowStockProducts = products.filter((p) => p.quantity < 30);

  // Total Retail Selling Value: SUM(product.quantity * product.selling_price)
  const totalRetailValue = products.reduce((acc, p) => acc + (p.quantity * p.selling_price), 0);

  // Profit Margin Potential: Retail Value - Bank Purchase Value
  const estimatedProfitMargin = Math.max(0, totalRetailValue - bankTotalValue);

  // Recharts Monthly Sales Analytics Data
  const chartData = [
    { month: 'يناير', sales: 14500, invoicesCount: 12 },
    { month: 'فبراير', sales: 18200, invoicesCount: 15 },
    { month: 'مارس', sales: 22400, invoicesCount: 19 },
    { month: 'أبريل', sales: 29800, invoicesCount: 22 },
    { month: 'مايو', sales: 26500, invoicesCount: 18 },
    { month: 'يونيو', sales: 34100, invoicesCount: 25 },
    { month: 'يوليو', sales: totalSalesValue > 0 ? Math.max(33050, totalSalesValue) : 33050, invoicesCount: invoices.length },
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Top Banner Alert / Welcome */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 rounded-3xl p-6 lg:p-8 text-white shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>نظام إدارة المخزن يعمل بكفاءة عالية</span>
            </div>
            <h2 className="text-2xl lg:text-3xl font-black tracking-tight">مرحباً بك، محمود!</h2>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              إليك النشرة الإحصائية المباشرة لإجمالي قيمة الأدوية والمستلزمات في المخزن، معدل حركة الفواتير، ونشاط المبيعات.
            </p>
          </div>

          <button
            onClick={onOpenCreateInvoice}
            className="py-3.5 px-6 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-2xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-2.5 shrink-0 cursor-pointer text-sm"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
            <span>إصدار فاتورة جديدة الآن</span>
          </button>
        </div>
      </div>

      {/* 4 Primary Visual Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {/* Card 1: Bank Total Value (إجمالي البنك - EGP) */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">إجمالي البنك (سعر الشراء)</span>
              <h3 className="text-2xl lg:text-3xl font-black text-slate-900 mt-2 font-mono tracking-tight text-emerald-700">
                {formatCurrency(bankTotalValue)}
              </h3>
            </div>
            <div className="w-12 h-12 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Landmark className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>حساب التكلفة الفعلية للمخزن</span>
            <span className="font-bold text-emerald-700 font-mono">{products.length} صنف</span>
          </div>
        </div>

        {/* Card 2: Sales Rate & Revenue (نسبة المبيعات) */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">نسبة المبيعات والإيراد</span>
              <h3 className="text-2xl lg:text-3xl font-black text-slate-900 mt-2 font-mono tracking-tight text-sky-700">
                {formatCurrency(totalSalesValue)}
              </h3>
            </div>
            <div className="w-12 h-12 bg-sky-50 border border-sky-200 text-sky-700 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">إجمالي الفواتير المصدرة</span>
            <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+{invoices.length} فاتورة</span>
            </span>
          </div>
        </div>

        {/* Card 3: Total Products in Inventory */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">إجمالي أصناف المخزن</span>
              <h3 className="text-2xl lg:text-3xl font-black text-slate-900 mt-2 font-mono tracking-tight">
                {products.length} <span className="text-sm font-sans text-slate-500">منتج</span>
              </h3>
            </div>
            <div className="w-12 h-12 bg-amber-50 border border-amber-200 text-amber-700 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Boxes className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>القيمة التقديرية بسعر البيع</span>
            <span className="font-bold text-slate-800 font-mono">{formatCurrency(totalRetailValue)}</span>
          </div>
        </div>

        {/* Card 4: Customers & Clients Count */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">شبكة العملاء والمعاملات</span>
              <h3 className="text-2xl lg:text-3xl font-black text-slate-900 mt-2 font-mono tracking-tight">
                {customers.length} <span className="text-sm font-sans text-slate-500">عميل وصيدلية</span>
              </h3>
            </div>
            <div className="w-12 h-12 bg-purple-50 border border-purple-200 text-purple-700 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>هامش الربح المتوقع</span>
            <span className="font-bold text-emerald-700 font-mono">{formatCurrency(estimatedProfitMargin)}</span>
          </div>
        </div>
      </div>

      {/* Analytics Chart & Low Stock Side Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Analytics Chart Card (2 Columns) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                <span>رسم بياني لتحليل المبيعات الشهرية (EGP)</span>
              </h3>
              <p className="text-slate-500 text-xs mt-1">معدل الإيرادات والفواتير المحصلة خلال الأشهر الأخيرة</p>
            </div>
            <span className="text-xs font-bold bg-slate-100 text-slate-700 px-3 py-1.5 rounded-xl border border-slate-200">
              2026
            </span>
          </div>

          <div className="h-64 w-full dir-ltr">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  formatter={(val: number) => [`${val.toLocaleString('ar-EG')} ج.م`, 'المبيعات']}
                  labelStyle={{ fontWeight: 'bold', color: '#0f172a' }}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                />
                <Area type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Low Stock Warning Box (1 Column) */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <span>تنبيهات نواقص المخزن</span>
              </h3>
              <span className="text-xs font-extrabold bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full border border-amber-200">
                {lowStockProducts.length} أصناف
              </span>
            </div>
            <p className="text-slate-500 text-xs mb-4">المنتجات التي اقتربت كمياتها المتاحة من النفاد (&lt; 30 قطعة)</p>

            {lowStockProducts.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-500 text-xs">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <span>جميع المنتجات متوفرة بكميات جيدة!</span>
              </div>
            ) : (
              <div className="space-y-3 max-h-52 overflow-y-auto pr-1">
                {lowStockProducts.map((p) => (
                  <div key={p.id} className="p-3 bg-amber-50/50 border border-amber-200/80 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-900">{p.name}</div>
                      <div className="text-slate-500 font-mono text-[11px] mt-0.5">{p.code}</div>
                    </div>
                    <span className="font-bold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-lg">
                      {p.quantity} قطعة
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => setActiveTab('products')}
            className="w-full mt-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl border border-slate-200 transition-colors cursor-pointer text-center"
          >
            الانتقال لإدارة المنتجات بالكامل
          </button>
        </div>
      </div>

      {/* Recent 3 Invoices Table (آخر 3 فواتير - sorted DESC) */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-emerald-600" />
              <span>آخر 3 فواتير صادرة حديثاً</span>
            </h3>
            <p className="text-slate-500 text-xs mt-0.5">مرتبة تلقائياً من الأحدث للأقدم حسب تاريخ الإنشاء</p>
          </div>

          <button
            onClick={() => setActiveTab('invoices')}
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer self-start sm:self-auto"
          >
            <span>عرض كل الفواتير ({invoices.length})</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        {recentInvoices.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            لا توجد فواتير صيدلانية مصدرة حتى الآن. يمكنك إنشاء أول فاتورة بالنقر على زر "إنشاء فاتورة جديدة".
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50/80 text-slate-600 font-bold border-b border-slate-100">
                <tr>
                  <th className="py-4 px-6">رقم الفاتورة</th>
                  <th className="py-4 px-6">اسم العميل / الصيدلية</th>
                  <th className="py-4 px-6">التاريخ والوقت</th>
                  <th className="py-4 px-6">عدد البنود</th>
                  <th className="py-4 px-6">الإجمالي (EGP)</th>
                  <th className="py-4 px-6 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {recentInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-emerald-700">{inv.code}</td>
                    <td className="py-4 px-6 font-bold">{inv.customer_name}</td>
                    <td className="py-4 px-6 text-slate-500">
                      {new Date(inv.created_at).toLocaleDateString('ar-EG', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-4 px-6 font-mono">{inv.item_count} قطعة</td>
                    <td className="py-4 px-6 font-bold font-mono text-slate-900 text-sm">
                      {formatCurrency(inv.total_amount)}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setViewInvoiceModal(inv)}
                          title="معاينة التفاصيل"
                          className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setPrintInvoiceModal(inv)}
                          title="طباعة / PDF"
                          className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition-colors cursor-pointer"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
