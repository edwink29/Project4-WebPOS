// src/layouts/MainLayout.tsx
import { Outlet } from "react-router-dom";
import { Sidebar } from "./components/layout/sidebar/Sidebar";

export const MainLayout = () => {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-y-auto">
        <main className="p-6 pt-16 md:pt-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
