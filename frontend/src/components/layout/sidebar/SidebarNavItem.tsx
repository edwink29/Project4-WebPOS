import React from "react";
import { NavLink, useLocation } from "react-router-dom";

interface SidebarNavItemProps {
  label: string;
  icon: React.ReactNode;
  href: string;
  isCollapsed?: boolean;
  onNavigate?: () => void;
}

export const SidebarNavItem = ({
  label,
  icon,
  href,
  isCollapsed = false,
  onNavigate,
}: SidebarNavItemProps) => {
  const { pathname } = useLocation();
  const isActive = pathname === href;

  const activeClasses = "bg-primary text-white shadow-md shadow-primary/20";
  const inactiveClasses =
    "text-sidebar-text hover:bg-sidebar-hover-bg hover:text-sidebar-text-hover";

  // Mode collapsed: hanya tampilan, bukan elemen interaktif
  if (isCollapsed) {
    return (
      <li>
        <div
          title={label}
          className={`flex items-center justify-center rounded-xl py-2.5 cursor-default select-none transition-colors duration-200 ${
            isActive ? activeClasses : inactiveClasses
          }`}
        >
          <span className="shrink-0">{icon}</span>
        </div>
      </li>
    );
  }

  return (
    <li>
      <NavLink
        to={href}
        onClick={onNavigate}
        className={({ isActive }) =>
          `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
            isActive ? activeClasses : inactiveClasses
          }`
        }
      >
        <span className="shrink-0">{icon}</span>
        <span className="truncate">{label}</span>
      </NavLink>
    </li>
  );
};
