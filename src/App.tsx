import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
import { LoginForm } from './components/LoginForm';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { ProductsView } from './components/ProductsView';
import { CustomersView } from './components/CustomersView';
import { InvoicesView } from './components/InvoicesView';
import { ToastContainer } from './components/ToastContainer';
import { CreateInvoiceModal } from './components/CreateInvoiceModal';
import { InvoicePrintModal } from './components/InvoicePrintModal';
import { InvoiceDetailModal } from './components/InvoiceDetailModal';

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const {
    activeTab,
    viewInvoiceModal,
    setViewInvoiceModal,
    printInvoiceModal,
    setPrintInvoiceModal
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCreateInvoiceOpen, setIsCreateInvoiceOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white dir-rtl p-4">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-bold text-slate-300">جاري تحميل نظام إدارة المخازن والفواتير...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 font-['Cairo',sans-serif] flex dir-rtl">
      {/* Toast Notifications */}
      <ToastContainer />

      {/* RTL Sidebar */}
      <Sidebar
        mobileOpen={mobileMenuOpen}
        setMobileOpen={setMobileMenuOpen}
        onOpenCreateInvoice={() => setIsCreateInvoiceOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pr-72 transition-all">
        {/* Top Header */}
        <Header
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onOpenCreateInvoice={() => setIsCreateInvoiceOpen(true)}
        />

        {/* View Router */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <DashboardView onOpenCreateInvoice={() => setIsCreateInvoiceOpen(true)} />
          )}
          {activeTab === 'products' && <ProductsView />}
          {activeTab === 'customers' && <CustomersView />}
          {activeTab === 'invoices' && (
            <InvoicesView onOpenCreateInvoice={() => setIsCreateInvoiceOpen(true)} />
          )}
        </main>
      </div>

      {/* Create Invoice Modal */}
      <CreateInvoiceModal
        isOpen={isCreateInvoiceOpen}
        onClose={() => setIsCreateInvoiceOpen(false)}
      />

      {/* Print Invoice Modal */}
      <InvoicePrintModal
        invoice={printInvoiceModal}
        onClose={() => setPrintInvoiceModal(null)}
      />

      {/* Detail Invoice Modal */}
      <InvoiceDetailModal
        invoice={viewInvoiceModal}
        onClose={() => setViewInvoiceModal(null)}
        onOpenPrintModal={(inv) => setPrintInvoiceModal(inv)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </AuthProvider>
  );
}
