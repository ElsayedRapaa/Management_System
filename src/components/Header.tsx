import React from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { Menu, Plus, Calendar, RefreshCw, FileText, Boxes, Users, LayoutDashboard, ShieldCheck, ShieldAlert } from 'lucide-react';

interface HeaderProps {
  onOpenMobileMenu: () => void;
  onOpenCreateInvoice: () => void;
}

const ROLE_CONFIG: Record<string, { label: string; badgeClass: string; icon: any }> = {
  super_admin: {
    label: 'المدير العام',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    icon: ShieldCheck,
  },
  manager: {
    label: 'شريك / مسئول',
    badgeClass: 'bg-sky-100 text-sky-800 border-sky-300',
    icon: ShieldCheck,
  },
  employee: {
    label: 'موظف مبيعات',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
    icon: ShieldAlert,
  },
};

export const Header: React.FC<HeaderProps> = ({ onOpenMobileMenu, onOpenCreateInvoice }) => {
  const { activeTab, refreshData, isLoadingData } = useApp();
  const { user: currentUser } = useAuth();

  const currentRole = currentUser?.role || 'employee';
  const roleInfo = ROLE_CONFIG[currentRole] || {
    label: 'مستخدم',
    badgeClass: 'bg-slate-100 text-slate-800 border-slate-200',
    icon: ShieldAlert,
  };
  const RoleIcon = roleInfo.icon;

  const getTabTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return {
          title: 'الرئيسية والتحليلات',
          sub: 'متابعة حركة المخزن، إجمالي البنك الفعلي، وآخر الفواتير',
          icon: <LayoutDashboard className="w-6 h-6 text-emerald-600" />,
        };
      case 'products':
        return {
          title: 'إدارة المخزن والمنتجات',
          sub: 'إضافة الأدوية والأجهزة والمستلزمات ومتابعة أسعار الشراء والبيع والكميات',
          icon: <Boxes className="w-6 h-6 text-emerald-600" />,
        };
      case 'customers':
        return {
          title: 'سجل العملاء والصيدليات',
          sub: 'قاعدة بيانات الصيدليات، المستشفيات، والعملاء المباشرين',
          icon: <Users className="w-6 h-6 text-emerald-600" />,
        };
      case 'invoices':
        return {
          title: 'سجل الفواتير والمبيعات',
          sub: 'عرض الفواتير مرتبة من الأحدث إلى الأقدم وإنشاء فواتير طبية جديدة',
          icon: <FileText className="w-6 h-6 text-emerald-600" />,
        };
      case 'users':
        return {
          title: 'إدارة المستخدمين والصلاحيات',
          sub: 'إضافة وإدارة حسابات طاقم العمل وتحديد صلاحياتهم في النظام',
          icon: <ShieldCheck className="w-6 h-6 text-emerald-600" />,
        };
      default:
        return {
          title: 'لوحة التحكم',
          sub: 'نظام إدارة المخازن والفواتير الطبية',
          icon: <LayoutDashboard className="w-6 h-6 text-emerald-600" />,
        };
    }
  };

  const currentTab = getTabTitle() || {
    title: 'لوحة التحكم',
    sub: 'نظام إدارة المخازن',
    icon: <LayoutDashboard className="w-6 h-6 text-emerald-600" />,
  };

  const todayArabic = new Intl.DateTimeFormat('ar-EG', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 lg:px-8 py-4 shadow-2xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left/Right Section: Mobile Hamburger & Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="p-2.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl lg:hidden transition-colors cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 items-center justify-center shrink-0">
              {currentTab.icon}
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">{currentTab.title}</h1>
              <p className="text-slate-500 text-xs hidden sm:block mt-0.5">{currentTab.sub}</p>
            </div>
          </div>
        </div>

        {/* Action Controls & Date Badge */}
        <div className="flex items-center gap-3">
          {/* Today Date */}
          <div className="hidden md:flex items-center gap-2 bg-slate-100 text-slate-700 px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-200/80">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <span>{todayArabic}</span>
          </div>

          {/* Refresh Data Button */}
          <button
            onClick={() => refreshData()}
            disabled={isLoadingData}
            title="تحديث البيانات"
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-200 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingData ? 'animate-spin text-emerald-600' : ''}`} />
          </button>

          {/* Quick Invoice Button */}
          <button
            onClick={onOpenCreateInvoice}
            className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-emerald-600/20 active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>فاتورة جديدة</span>
          </button>
        </div>
      </div>
    </header>
  );
};
