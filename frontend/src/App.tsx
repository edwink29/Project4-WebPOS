import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "./Layout";
import { ProtectedRoute } from "./routes/ProtectedRoute";

import LoginPage from "./components/pages/Auth/Login";
import DashboardPage from "./components/pages/Dashboard";
import ProductsPage from "./components/pages/Products";
import CategoriesPage from "./components/pages/Categories";
import CustomersPage from "./components/pages/Customers";
import SuppliersPage from "./components/pages/Suppliers";
import OrdersPage from "./components/pages/Orders";
import PurchasePage from "./components/pages/Purchases/Purchases";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 1. Route Publik */}
        <Route path="/login" element={<LoginPage />} />

        {/* 2. Group Route Terproteksi (Wajib Login) */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/categories" element={<CategoriesPage />} />
              <Route path="/customers" element={<CustomersPage />} />
              <Route path="/suppliers" element={<SuppliersPage />} />
              <Route
                path="/transactions/purchases"
                element={<PurchasePage />}
              />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={["CASHIER"]} />}>
              <Route path="/transactions/sales" element={<OrdersPage />} />
            </Route>
          </Route>
        </Route>

        {/* 3. Fallback jika URL tidak ditemukan */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
