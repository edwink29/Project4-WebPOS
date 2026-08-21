export interface Customer {
  id: string;
  name: string;
  phone?: string | null;
  address?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface AddCustomerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export interface EditCustomerProps {
  isOpen: boolean;
  customer: Customer | null;
  onClose: () => void;
  onSuccess: () => void;
}
