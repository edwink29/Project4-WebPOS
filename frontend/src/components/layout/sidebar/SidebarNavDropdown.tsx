import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { SubMenuItem } from "./types";

interface SidebarNavDropdownProps {
  label: string;
  icon: React.ReactNode;
  items: SubMenuItem[];
  isOpen: boolean;
  isCollapsed?: boolean;
  onToggle: () => void;
  onNavigate?: () => void;
}

export const SidebarNavDropdown = ({
  label,
  icon,
  items,
  isOpen,
  isCollapsed = false,
  onToggle,
  onNavigate,
}: SidebarNavDropdownProps) => {
  const { pathname } = useLocation();
  const isChildActive = items.some((item) => item.href === pathname);

  if (isCollapsed) {
    return (
      <li>
        <div
          title={label}
          className={`flex items-center justify-center rounded-xl py-2.5 cursor-default select-none transition-colors duration-200 ${
            isChildActive
              ? "text-primary bg-primary-light font-semibold"
              : "text-sidebar-text"
          }`}
        >
          <span className="shrink-0">{icon}</span>
        </div>
      </li>
    );
  }

  return (
    <li>
      <button
        onClick={onToggle}
        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
          isChildActive
            ? "text-primary bg-primary-light font-semibold"
            : "text-sidebar-text hover:bg-sidebar-hover-bg hover:text-sidebar-text-hover"
        }`}
      >
        <div className="flex items-center gap-3">
          <span className="shrink-0">{icon}</span>
          <span className="truncate">{label}</span>
        </div>
        <span className="text-muted">
          {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </span>
      </button>

      {isOpen && (
        <ul className="mt-1 ml-5 pl-3 border-l-2 border-sidebar-border space-y-1">
          {items.map((sub, index) => (
            <li key={index}>
              <NavLink
                to={sub.href}
                onClick={onNavigate}
                className={({ isActive }) =>
                  `block px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-primary-light text-primary font-semibold"
                      : "text-muted hover:bg-sidebar-hover-bg hover:text-sidebar-text-hover"
                  }`
                }
              >
                {sub.label}
              </NavLink>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
};
