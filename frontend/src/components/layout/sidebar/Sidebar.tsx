import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Menu, X, Store } from "lucide-react";
import { MENU_CONFIG } from "./config";
import { SidebarNavItem } from "./SidebarNavItem";
import { SidebarNavDropdown } from "./SidebarNavDropdown";
import { SidebarProfile } from "./SidebarProfile";

export const Sidebar = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { pathname } = useLocation();
  const userRole = localStorage.getItem("user_role") as "ADMIN" | "CASHIER" | null;
  const visibleMenu = MENU_CONFIG
    .filter((item) => !item.allowedRoles || (userRole !== null && item.allowedRoles.includes(userRole)))
    .map((item) => ({
      ...item,
      subItems: item.subItems?.filter((sub) => !sub.allowedRoles || (userRole !== null && sub.allowedRoles.includes(userRole))),
    }))
    .filter((item) => !item.subItems || item.subItems.length > 0);

  // Accordion state: Buka dropdown yang sesuai dengan URL aktif secara otomatis
  const [openDropdown, setOpenDropdown] = useState<string | null>(() => {
    const activeParent = visibleMenu.find((item) =>
      item.subItems?.some((sub) => sub.href === pathname),
    );
    return activeParent ? activeParent.label : null;
  });

  const closeMobile = () => setIsMobileOpen(false);

  const handleDropdownToggle = (label: string) => {
    setOpenDropdown((prev) => (prev === label ? null : label));
  };

  return (
    <>
      {/* Tombol Hamburger (Khusus Layar HP/Mobile) */}
      <div className="md:hidden fixed top-3 left-3 z-50">
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 rounded-xl bg-sidebar-bg border border-sidebar-border shadow-md text-sidebar-text hover:bg-sidebar-hover-bg transition-colors"
          aria-label={isMobileOpen ? "Tutup menu" : "Buka menu"}
        >
          {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Latar Belakang Gelap di Mobile */}
      {isMobileOpen && (
        <div
          onClick={closeMobile}
          className="md:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 transition-opacity"
        />
      )}

      {/* Container Sidebar (Lebar Tetap w-64) */}
      <aside
        className={`fixed md:static top-0 left-0 z-40 h-screen w-64 bg-sidebar-bg border-r border-sidebar-border flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div>
          {/* Header Brand */}
          <div className="p-4 border-b border-sidebar-border flex items-center gap-3 h-16">
            <div className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center font-black text-lg shrink-0 shadow-md shadow-primary/30">
              <Store size={20} />
            </div>
            <div className="min-w-0">
              <h1 className="font-extrabold text-brand-title text-base leading-tight tracking-tight truncate">
                RossyWin Store
              </h1>
            </div>
          </div>

          {/* List Navigasi */}
          <nav className="p-3 overflow-y-auto max-h-[calc(100vh-130px)]">
            <ul className="space-y-1">
              {visibleMenu.map((item, index) =>
                item.subItems ? (
                  <SidebarNavDropdown
                    key={index}
                    label={item.label}
                    icon={item.icon}
                    items={item.subItems}
                    isOpen={openDropdown === item.label}
                    onToggle={() => handleDropdownToggle(item.label)}
                    onNavigate={closeMobile}
                  />
                ) : (
                  <SidebarNavItem
                    key={index}
                    label={item.label}
                    icon={item.icon}
                    href={item.href || "/"}
                    onNavigate={closeMobile}
                  />
                ),
              )}
            </ul>
          </nav>
        </div>

        {/* Profil User di Bawah */}
        <div className="p-3 border-t border-sidebar-border bg-sidebar-bg">
          <SidebarProfile onNavigate={closeMobile} />
        </div>
      </aside>
    </>
  );
};
