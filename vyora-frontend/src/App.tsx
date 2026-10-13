import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { AppLayout } from './components/layout/AppLayout';
import { LoginPage, RegisterPage } from './pages/auth';
import { DashboardPage } from './pages/dashboard';
import { InvoiceListPage, CreateInvoicePage, InvoiceViewPage } from './pages/invoices';
import { PartiesPage } from './pages/parties';
import { ProductsPage } from './pages/products';
import { InventoryPage } from './pages/inventory';
import { PurchasesPage } from './pages/purchases';
import { PaymentsPage } from './pages/payments';
import { ReportsPage } from './pages/reports';
import { AccountHubPage } from './pages/account';

import { ToastProvider } from './components/ui/Toast';
import { Analytics } from '@vercel/analytics/react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5000,
    },
  },
});

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#F4F8F7]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0F766E] flex items-center justify-center text-white font-black text-xl animate-bounce">
            V
          </div>
          <p className="text-xs font-semibold text-[#123B3A]">Loading Vyora Ledger...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <AuthProvider>
            <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<DashboardPage />} />
                <Route path="invoices" element={<InvoiceListPage />} />
                <Route path="invoices/create" element={<CreateInvoicePage />} />
                <Route path="invoices/:id" element={<InvoiceViewPage />} />
                <Route path="parties" element={<PartiesPage />} />
                <Route path="products" element={<ProductsPage />} />
                <Route path="inventory" element={<InventoryPage />} />
                <Route path="purchases" element={<PurchasesPage />} />
                <Route path="payments" element={<PaymentsPage />} />
                <Route path="reports" element={<ReportsPage />} />
                <Route path="account" element={<AccountHubPage />} />
                <Route path="roles" element={<AccountHubPage />} />
                <Route path="settings" element={<AccountHubPage />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <Analytics />
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </QueryClientProvider>
  </ThemeProvider>
);
};

export default App;
