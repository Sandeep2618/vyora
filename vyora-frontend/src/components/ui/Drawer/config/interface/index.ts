import React from 'react';
import { DrawerPlacement, DrawerSize } from '../enum';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  placement?: DrawerPlacement | 'right' | 'left' | 'bottom' | 'top';
  size?: DrawerSize | 'sm' | 'md' | 'lg' | 'xl' | 'full';
}
