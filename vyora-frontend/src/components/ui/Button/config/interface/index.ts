import React from 'react';
import { ButtonVariant, ButtonSize } from '../enum';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant | 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: ButtonSize | 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}
