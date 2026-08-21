import type { Product } from "./Products";
import type { Customer } from "./Customers";

// 1. State UI Keranjang
export interface CartItem {
  product: Product;
  quantity: number;
}

// 2. Payload Request API (Ke Backend)
export interface OrderItemPayload {
  productId: string;
  quantity: number;
}

export interface OrderPayload {
  customerId?: string;
  payment: number;
  items: OrderItemPayload[];
}

// 3. Response API (Dari Backend)
export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  sellPrice: number;
  buyPrice: number;
  product?: Product;
}

export interface Order {
  id: string;
  customerId?: string | null;
  totalAmount: number;
  payment: number;
  change: number;
  createdAt?: string;
  customer?: Customer;
  items?: OrderItem[];
}
