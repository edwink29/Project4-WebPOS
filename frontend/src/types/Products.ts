import type { Category } from "./Categories";

export interface Product {
  id: string;
  categoryId: string;
  name: string;
  stock: number;
  buyPrice: number;
  sellPrice: number;
  category?: Category;
  createdAt?: string;
  updatedAt?: string;
}

export type ProductFormInput = Omit<
  Product,
  "id" | "category" | "createdAt" | "updatedAt"
>;

export interface AddProductProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export interface EditProductProps {
  isOpen: boolean;
  product: Product | null;
  onClose: () => void;
  onSuccess: () => void;
}
