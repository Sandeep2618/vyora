import React from 'react';
import { PaymentRecord } from '@vyora/shared-types';

export interface PaymentsTableProps {
  payments: PaymentRecord[];
  headerActions?: React.ReactNode;
}
