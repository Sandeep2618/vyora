import { Product } from '@/types';

export interface DeleteProductModalProps {
  product: Product | null;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}
