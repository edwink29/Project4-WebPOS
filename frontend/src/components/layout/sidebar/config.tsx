import {
  LayoutDashboard,
  Database,
  ShoppingCart,
  // FileText,
} from "lucide-react";
import type { MenuItem } from "./types";

export const MENU_CONFIG: MenuItem[] = [
  {
    label: "Dashboard",
    icon: <LayoutDashboard size={20} />,
    href: "/dashboard",
    allowedRoles: ["ADMIN"],
  },
  {
    label: "Master Data",
    icon: <Database size={20} />,
    allowedRoles: ["ADMIN"],
    subItems: [
      { label: "Data Produk", href: "/products" },
      { label: "Kategori", href: "/categories" },
      { label: "Pelanggan", href: "/customers" },
      { label: "Supplier", href: "/suppliers" },
    ],
  },
  {
    label: "Transaksi",
    icon: <ShoppingCart size={20} />,
    allowedRoles: ["ADMIN", "CASHIER"],
    subItems: [
      {
        label: "Penjualan",
        href: "/transactions/sales",
      },
      {
        label: "Pembelian",
        href: "/transactions/purchases",
      },
    ],
  },
  // {
  //   label: "Laporan",
  //   icon: <FileText size={20} />,
  //   subItems: [
  //     { label: "Laporan Penjualan", href: "/reports/sales" },
  //     { label: "Laporan Pembelian", href: "/reports/purchases" },
  //     { label: "Untung Rugi", href: "/reports/profit-loss" },
  //   ],
  // },
];
