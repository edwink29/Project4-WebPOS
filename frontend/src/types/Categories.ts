export interface Category {
  id: string;
  name: string;
  createdAt?: string;
}

export interface AddCategoryProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export interface EditCategoryProps {
  isOpen: boolean;
  category: Category | null;
  onClose: () => void;
  onSuccess: () => void;
}
