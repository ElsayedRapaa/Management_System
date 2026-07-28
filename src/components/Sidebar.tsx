import React from 'react';
import { useApp, ActiveTab } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Boxes,
  Users,
  FileText,
  LogOut,
  PackageCheck,
  TrendingUp,
  ShieldCheck,
  Plus
} from 'lucide-react';

interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  onOpenCreateInvoice: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, setMobileOpen, onOpenCreateInvoice }) => {
  const { activeTab, setActiveTab, bankTotalValue, products, invoices } = useApp();
  const { user, logout } = useAuth();

  const isSuperAdmin = user?.email?.toLowerCase() === 'mahmoud@management.com' || user?.role === 'super_admin';

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: string | number }[] = [
    {
      id: 'dashboard',
      label: 'الرئيسية',
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      id: 'products',
      label: 'المخزن والمنتجات',
      icon: <Boxes className="w-5 h-5" />,
      badge: products.length,
    },
    {
      id: 'customers',
      label: 'العملاء',
      icon: <Users className="w-5 h-5" />,
    },
    {
      id: 'invoices',
      label: 'الفواتير',
      icon: <FileText className="w-5 h-5" />,
      badge: invoices.length,
    },
    ...(isSuperAdmin
      ? [
          {
            id: 'users' as ActiveTab,
            label: 'إدارة المستخدمين',
            icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
          },
        ]
      : []),
  ];

  const handleNavClick = (tab: ActiveTab) => {
    setActiveTab(tab);
    setMobileOpen(false);
  };

  const getRoleBadgeLabel = (role?: string) => {
    if (role === 'super_admin') return 'المدير العام';
    if (role === 'manager') return 'مسؤول / شريك';
    return 'موظف مبيعات';
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 right-0 z-50 w-72 bg-slate-900 border-l border-slate-800 text-slate-200 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div>
          {/* Logo & Brand Header */}
          <div className="p-6 border-b border-slate-800 flex items-center gap-3.5">
            <div className="w-11 h-11 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-xl flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/20 shrink-0">
              <PackageCheck className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="font-extrabold text-white text-base tracking-tight leading-snug">نظام المخازن</h2>
              <p className="text-slate-400 text-xs font-medium">لوحة تحكّم إدارة المخزن</p>
            </div>
          </div>

          {/* Quick Action Button */}
          <div className="p-4">
            <button
              onClick={() => {
                onOpenCreateInvoice();
                setMobileOpen(false);
              }}
              className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>إنشاء فاتورة جديدة</span>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-2">القائمة الرئيسية</p>
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                    isActive
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={isActive ? 'text-slate-950' : 'text-slate-400'}>{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-mono ${
                        isActive
                          ? 'bg-slate-950 text-emerald-400 font-bold'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer & User Profile Section */}
        <div className="p-4 border-t border-slate-800 space-y-3">
          {/* Mini Inventory Value Stat */}
          <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3 text-right">
            <div className="text-[11px] font-medium text-slate-400 flex items-center justify-between">
              <span>إجمالي قيمة البنك:</span>
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-emerald-400 font-extrabold text-sm mt-1 dir-ltr text-right">
              {bankTotalValue.toLocaleString('ar-EG', { minimumFractionDigits: 2 })} ج.م
            </div>
          </div>

          {/* User Profile Info */}
          <div className="flex items-center justify-between bg-slate-800/40 p-3 rounded-xl border border-slate-800/60">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-950 border border-emerald-700/50 flex items-center justify-center text-emerald-400 font-bold text-sm">
                {user?.name ? user.name.charAt(0) : 'م'}
              </div>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1">
                  <span>{user?.name || 'مستخدم النظام'}</span>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="text-[10px] text-emerald-400 font-semibold">
                  {getRoleBadgeLabel(user?.role)}
                </div>
              </div>
            </div>

            <button
              onClick={logout}
              title="تسجيل الخروج"
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-950/50 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
