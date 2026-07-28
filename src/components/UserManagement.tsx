import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Shield, User as UserIcon, Trash2, Mail, Lock, CheckCircle2, AlertTriangle, ShieldCheck, Edit3 } from 'lucide-react';

export const UserManagement: React.FC = () => {
  const { user: currentUser, users, addUser, deleteUser, updateUser } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'manager' | 'employee'>('employee');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingEmail, setDeletingEmail] = useState<string | null>(null);

  // Edit user state
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [editName, setEditName] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editRole, setEditRole] = useState<'manager' | 'employee'>('employee');

  // Security check: Only mahmoud@management.com (super_admin) can access
  const isSuperAdmin = currentUser?.email?.toLowerCase() === 'mahmoud@management.com' || currentUser?.role === 'super_admin';

  if (!isSuperAdmin) {
    return (
      <div className="p-8 text-center bg-rose-50 border border-rose-200 rounded-3xl max-w-xl mx-auto mt-12">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
        <h2 className="text-xl font-black text-rose-900 mb-2">غير مصرح لك بالوصول</h2>
        <p className="text-rose-700 text-sm">هذه الصفحة مخصصة للمدير العام فقط لإدارة صلاحيات ومستخدمي النظام.</p>
      </div>
    );
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!name.trim() || !email.trim() || !password.trim()) {
      setErrorMsg('يرجى ملء جميع الحقول المطلوبة.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await addUser({
        name: name.trim(),
        email: email.trim(),
        password: password.trim(),
        role,
      });

      setIsSubmitting(false);

      if (!result.success) {
        const errText = result.error || 'حدث خطأ أثناء إضافة المستخدم.';
        setErrorMsg(errText);
        alert(errText);
      } else {
        setSuccessMsg(`تم إضافة المستخدم "${name}" بنجاح.`);
        setName('');
        setEmail('');
        setPassword('');
        setRole('employee');
        setTimeout(() => {
          setIsModalOpen(false);
          setSuccessMsg(null);
        }, 1500);
      }
    } catch (err: any) {
      setIsSubmitting(false);
      const errText = err?.message || 'حدث خطأ أثناء إضافة المستخدم';
      setErrorMsg(errText);
      alert(errText);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setIsSubmitting(true);
    try {
      const res = await updateUser(editingUser.id || editingUser.email, {
        name: editName.trim(),
        ...(editPassword.trim() && { password: editPassword.trim() }),
        role: editRole,
      });
      setIsSubmitting(false);

      if (!res.success) {
        alert(res.error || 'فشل تحديث بيانات المستخدم');
      } else {
        setEditingUser(null);
      }
    } catch (err: any) {
      setIsSubmitting(false);
      alert('فشل تحديث بيانات المستخدم: ' + (err?.message || 'خطأ غير معروف'));
    }
  };

  const handleDelete = async (u: any) => {
    if (u.email.toLowerCase() === 'mahmoud@management.com') {
      alert('لا يمكن حذف حساب المدير العام الرئيسي.');
      return;
    }
    if (confirm(`هل أنت متأكد من حذف المستخدم (${u.name || u.email})؟`)) {
      setDeletingEmail(u.email);
      try {
        const res = await deleteUser(u.id || u.email);
        setDeletingEmail(null);
        if (!res.success) {
          alert(res.error || 'فشل حذف المستخدم من قاعدة البيانات');
        }
      } catch (err: any) {
        setDeletingEmail(null);
        alert('فشل حذف المستخدم من قاعدة البيانات: ' + (err?.message || 'خطأ غير معروف'));
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
              <Shield className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">إدارة المستخدمين والصلاحيات</h1>
          </div>
          <p className="text-slate-500 text-sm">إضافة وإدارة حسابات طاقم العمل وتحديد صلاحياتهم في النظام (المدير العام فقط)</p>
        </div>
        <button
          onClick={() => {
            setErrorMsg(null);
            setSuccessMsg(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-bold rounded-2xl shadow-lg shadow-emerald-500/20 transition-all cursor-pointer text-sm"
        >
          <UserPlus className="w-5 h-5 stroke-[2.5]" />
          <span>إضافة مستخدم جديد</span>
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-extrabold text-slate-900 text-base">قائمة المستخدمين المسجلين ({users.length})</h2>
          <span className="text-xs bg-emerald-50 text-emerald-800 font-bold px-3 py-1 rounded-full border border-emerald-200">
            صلاحية مطلقة للمدير العام
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-slate-50 text-slate-600 font-extrabold text-xs border-b border-slate-200">
              <tr>
                <th className="py-4 px-6">المستخدم</th>
                <th className="py-4 px-6">البريد الإلكتروني</th>
                <th className="py-4 px-6">الدور / الصلاحية</th>
                <th className="py-4 px-6">الحالة</th>
                <th className="py-4 px-6 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => {
                const isSuper = u.email.toLowerCase() === 'mahmoud@management.com' || u.role === 'super_admin';
                const isManager = u.role === 'manager';
                return (
                  <tr key={u.email} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6 font-bold text-slate-900 flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${isSuper ? 'bg-emerald-100 text-emerald-800' : isManager ? 'bg-sky-100 text-sky-800' : 'bg-slate-100 text-slate-700'}`}>
                        {isSuper ? <ShieldCheck className="w-5 h-5" /> : <UserIcon className="w-5 h-5" />}
                      </div>
                      <div>
                        <div>{u.name}</div>
                        {isSuper && <span className="text-[11px] font-normal text-emerald-600">المالك الرئيسي للنظام</span>}
                      </div>
                    </td>
                    <td className="py-4 px-6 font-mono text-slate-600 dir-ltr text-right">{u.email}</td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold border ${
                          isSuper
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : isManager
                            ? 'bg-sky-100 text-sky-800 border-sky-300'
                            : 'bg-amber-100 text-amber-800 border-amber-300'
                        }`}
                      >
                        {isSuper ? 'المدير العام (Super Admin)' : isManager ? 'شريك / مسئول (Manager)' : 'موظف مبيعات (Employee)'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        نشط
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      {!isSuper ? (
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => {
                              setEditingUser(u);
                              setEditName(u.name || '');
                              setEditPassword('');
                              setEditRole(u.role || 'employee');
                            }}
                            className="p-2 text-sky-600 hover:bg-sky-50 rounded-xl transition-colors cursor-pointer inline-flex items-center gap-1 text-xs font-bold"
                            title="تعديل بيانات المستخدم"
                          >
                            <Edit3 className="w-4 h-4" />
                            <span>تعديل</span>
                          </button>
                          <button
                            onClick={() => handleDelete(u)}
                            disabled={deletingEmail === u.email}
                            className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer inline-flex items-center gap-1 text-xs font-bold"
                            title="حذف المستخدم"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>{deletingEmail === u.email ? 'جاري الحذف...' : 'حذف'}</span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs italic">محمي</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 dir-rtl">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-fade-in">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg">إضافة مستخدم جديد</h3>
                  <p className="text-xs text-slate-500">إنشاء حساب جديد وتحديد الصلاحيات</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-bold">
                {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1.5">الاسم بالكامل</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: أحمد محمد"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-950 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1.5">البريد الإلكتروني</label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@management.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-10 pl-4 py-3 text-sm text-slate-950 focus:outline-none focus:border-emerald-500 dir-ltr text-right"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1.5">كلمة المرور المؤقتة</label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-10 pl-4 py-3 text-sm text-slate-950 focus:outline-none focus:border-emerald-500 dir-ltr text-right"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1.5">الصلاحية والدور في النظام</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-950 focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="manager">شريك / مسئول (Manager - صلاحيات كاملة باستثناء إدارة المستخدمين)</option>
                  <option value="employee">موظف (Employee - إضافة منتجات وبيع وفحص المخزن فقط بدون حذف)</option>
                </select>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'جاري الحفظ...' : 'حفظ وإضافة المستخدم'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 dir-rtl">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-fade-in">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-sky-100 text-sky-700 rounded-2xl flex items-center justify-center">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg">تعديل بيانات المستخدم</h3>
                  <p className="text-xs text-slate-500">{editingUser.email}</p>
                </div>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1.5">الاسم بالكامل</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-950 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1.5">كلمة المرور الجديدة (أتركها فارغة للإبقاء على الحالية)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    placeholder="أتركها فارغة للإبقاء على الحالية"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-10 pl-4 py-3 text-sm text-slate-950 focus:outline-none focus:border-sky-500 dir-ltr text-right"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1.5">الصلاحية والدور في النظام</label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-950 focus:outline-none focus:border-sky-500 cursor-pointer"
                >
                  <option value="manager">شريك / مسئول (Manager)</option>
                  <option value="employee">موظف (Employee)</option>
                </select>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md shadow-sky-600/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'جاري التحديث...' : 'حفظ التعديلات'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
