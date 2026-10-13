import React from 'react';
import { BadgeVariantEnum } from '../enum';

export type BadgeVariant =
  | 'paid'
  | 'pending'
  | 'overdue'
  | 'draft'
  | 'cancelled'
  | 'neutral'
  | 'success'
  | BadgeVariantEnum;

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}
