import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Customer, CustomerType } from '../types';
import { generateCode } from '../lib/formatters';
import {
  Plus,
  Search,
  UserPlus,
  Phone,
  MapPin,
  Building2,
  Stethoscope,
  User,
  Edit2,
  Trash2,
  X,
  FileText
} from 'lucide-react';

export const CustomersView: React.FC = () => {
  const { customers, addCustomer, updateCustomer, deleteCustomer, invoices, setActiveTab } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    phone: '',
    address: '',
    type: 'صيدلية' as CustomerType,
  });

  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone.includes(searchTerm) ||
        c.address.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = filterType === 'all' || c.type === filterType;

      return matchesSearch && matchesType;
    });
  }, [customers, searchTerm, filterType]);

  const handleOpenAddModal = () => {
    setFormData({
      code: generateCode('CST', customers.length),
      name: '',
      phone: '',
      address: '',
      type: 'صيدلية',
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      code: customer.code,
      name: customer.name,
      phone: customer.phone,
      address: customer.address,
      type: customer.type,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.address) return;

    if (editingCustomer) {
      await updateCustomer(editingCustomer.id, {
        code: formData.code,
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        type: formData.type,
      });
      setEditingCustomer(null);
    } else {
      await addCustomer({
        code: formData.code || generateCode('CST', customers.length),
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        type: formData.type,
      });
      setIsAddModalOpen(false);
    }
  };

  const getTypeBadge = (type: CustomerType) => {
    switch (type) {
      case 'صيدلية':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Building2 className="w-3.5 h-3.5" />
            <span>صيدلية</span>
          </span>
        );
      case 'مستشفى':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
            <Stethoscope className="w-3.5 h-3.5" />
            <span>مستشفى</span>
          </span>
        );
      case 'عميل':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200">
            <User className="w-3.5 h-3.5" />
            <span>عميل عادي</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Header Controls */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">قاعدة بيانات العملاء والجهات</h2>
          <p className="text-slate-500 text-xs mt-1">
            إجمالي المسجلين: <span className="font-extrabold text-slate-900">{customers.length} عميل</span> (صيدليات، مستشفيات، عيادات وأفراد)
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="py-3 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg shadow-emerald-600/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <UserPlus className="w-5 h-5" />
          <span>إضافة عميل جديد</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ابحث باسم العميل، الصيدلية، كود العميل، أو رقم الهاتف..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-10 pl-4 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500 w-full sm:w-48 cursor-pointer"
          >
            <option value="all">كل الأنواع ({customers.length})</option>
            <option value="صيدلية">صيدلية</option>
            <option value="مستشفى">مستشفى</option>
            <option value="عميل">عميل عادي</option>
          </select>
        </div>
      </div>

      {/* Customer List Grid / Cards */}
      {filteredCustomers.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center text-slate-500 text-sm border border-slate-200 shadow-sm">
          لا يوجد عملاء يطابقون معلومات البحث الحالية. يمكنك إضافة عميل جديد.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCustomers.map((customer) => {
            const customerInvoices = invoices.filter((i) => i.customer_id === customer.id);
            const totalPurchases = customerInvoices.reduce((sum, i) => sum + i.total_amount, 0);

            return (
              <div
                key={customer.id}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 relative group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                      {customer.code}
                    </span>
                    {getTypeBadge(customer.type)}
                  </div>

                  <h3 className="text-base font-extrabold text-slate-900 leading-snug">{customer.name}</h3>

                  <div className="mt-4 space-y-2 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="font-mono text-slate-800 font-semibold dir-ltr text-right">{customer.phone}</span>
                    </div>

                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      <span className="text-slate-600 line-clamp-2">{customer.address}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">إجمالي فواتيره:</span>
                    <span className="font-bold text-slate-900 font-mono text-xs">
                      {customerInvoices.length} فواتير ({totalPurchases.toLocaleString('ar-EG')} ج.م)
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEditModal(customer)}
                      title="تعديل العميل"
                      className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeletingCustomer(customer)}
                      title="حذف العميل"
                      className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-colors cursor-pointer"
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

      {/* Modal Add / Edit Customer */}
      {(isAddModalOpen || editingCustomer) && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 animate-slide-in">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <h3 className="text-lg font-extrabold text-slate-900">
                {editingCustomer ? 'تعديل بيانات العميل' : 'إضافة عميل / صيدلية جديدة'}
              </h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingCustomer(null);
                }}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">كود العميل</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-mono font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">نوع العميل</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as CustomerType })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="صيدلية">صيدلية</option>
                    <option value="مستشفى">مستشفى</option>
                    <option value="عميل">عميل عادي</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">اسم العميل / اسم الصيدلية</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="مثال: صيدلية العزبي - فرع المعادي"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">رقم الهاتف التواصل</label>
                <input
                  type="text"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="01012345678"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-emerald-500 dir-ltr text-right"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">العنوان بالتفصيل</label>
                <textarea
                  rows={2}
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="شارع النصر، المعادي، القاهرة..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                >
                  {editingCustomer ? 'حفظ التغييرات' : 'إضافة العميل فوراً'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingCustomer(null);
                  }}
                  className="py-3 px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Customer Confirmation */}
      {deletingCustomer && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 text-center space-y-4 border border-slate-100 shadow-2xl animate-scale-up">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-extrabold text-slate-900">حذف بيانات العميل؟</h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              هل أنت تأكد من حذف العميل "{deletingCustomer.name}"؟ لن يؤثر الحذف على سجلات الفواتير المطبوعة السابقة.
            </p>

            <div className="flex gap-3 pt-2">
              <button
                onClick={async () => {
                  await deleteCustomer(deletingCustomer.id);
                  setDeletingCustomer(null);
                }}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer"
              >
                تأكيد الحذف
              </button>
              <button
                onClick={() => setDeletingCustomer(null)}
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
