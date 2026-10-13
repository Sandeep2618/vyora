import React from 'react';
import { ModalMaxWidth } from '../enum';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: ModalMaxWidth | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl';
}
