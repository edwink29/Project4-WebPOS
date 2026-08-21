import React from "react";

export interface SubMenuItem {
  label: string;
  href: string;
  allowedRoles?: Array<"ADMIN" | "CASHIER">;
}

export interface MenuItem {
  label: string;
  icon: React.ReactNode;
  href?: string;
  subItems?: SubMenuItem[];
  allowedRoles?: Array<"ADMIN" | "CASHIER">;
}
