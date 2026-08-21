import { useState, useRef, useEffect } from "react";
import { authService } from "@/services/AuthServices";
import { LogOut, MoreVertical } from "lucide-react";

interface SidebarProfileProps {
  isCollapsed?: boolean;
  onNavigate?: () => void;
}

export const SidebarProfile = ({
  isCollapsed = false,
  onNavigate,
}: SidebarProfileProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Ambil data user dari localStorage jika tersedia
  const userRole = localStorage.getItem("user_role") || "CASHIER";
  const userName = localStorage.getItem("user_name") || "Pengguna POS";
  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  // Menutup popover saat klik di luar area
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Menutup popover saat prop isCollapsed berubah
  const [prevIsCollapsed, setPrevIsCollapsed] = useState(isCollapsed);
  if (isCollapsed !== prevIsCollapsed) {
    setPrevIsCollapsed(isCollapsed);
    setIsOpen(false);
  }

  const handleLinkClick = () => {
    setIsOpen(false);
    if (onNavigate) onNavigate();
  };

  const handleLogout = () => {
    handleLinkClick();
    authService.logout(); // Eksekusi fungsi logout
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Popover Menu Atas */}
      {isOpen && (
        <div
          className={`absolute bottom-full left-0 mb-2 bg-sidebar-bg border border-sidebar-border rounded-2xl shadow-xl p-1.5 z-50 transition-all ${
            isCollapsed ? "w-56" : "w-full"
          }`}
        >
          <div className="px-3 py-2 border-b border-sidebar-border mb-1">
            <p className="text-xs font-bold text-brand-title">{userName}</p>
            <p className="text-[11px] text-muted truncate">
              Role: {userRole === "ADMIN" ? "Administrator" : "Kasir"}
            </p>
          </div>

          <div className="my-1 border-t border-sidebar-border" />

          {/* Tombol Logout Berfungsi */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut size={16} />
            <span>Keluar</span>
          </button>
        </div>
      )}

      {/* Profile Card Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        title={isCollapsed ? `${userName} — ${userRole}` : undefined}
        className={`w-full flex items-center rounded-2xl hover:bg-sidebar-hover-bg transition-all text-left ${
          isCollapsed ? "justify-center p-2" : "gap-3 p-2"
        }`}
      >
        <div className="w-9 h-9 rounded-xl bg-linear-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm">
          {userInitials}
        </div>

        {!isCollapsed && (
          <>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-brand-title truncate">
                {userName}
              </p>
              <p className="text-[10px] text-muted font-medium truncate">
                {userRole === "ADMIN" ? "Administrator" : "Kasir"}
              </p>
            </div>
            <MoreVertical size={16} className="text-muted shrink-0" />
          </>
        )}
      </button>
    </div>
  );
};
