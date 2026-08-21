import type { Supplier } from "./Suppliers";
import type { Product } from "./Products";

export interface PurchaseItemPayload {
  productId: string;
  quantity: number;
  buyPrice: number;
}

export interface PurchasePayload {
  supplierId: string;
  items: PurchaseItemPayload[];
}

export interface PurchaseItem {
  id: string;
  purchaseId: string;
  productId: string;
  quantity: number;
  buyPrice: number;
  product?: Product;
}

export interface Purchase {
  id: string;
  supplierId: string;
  totalAmount: number;
  createdAt?: string;
  supplier?: Supplier;
  items?: PurchaseItem[];
}

export interface RestockItem {
  product: Product;
  quantity: number;
  buyPrice: number;
}
