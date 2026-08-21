export interface Supplier {
  id: string;
  name: string;
  phone?: string | null;
  address?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface AddSupplierProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export interface EditSupplierProps {
  isOpen: boolean;
  supplier: Supplier | null;
  onClose: () => void;
  onSuccess: () => void;
}
