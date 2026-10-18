// Party (Customer / Supplier) Domain Types
export type PartyType = 'CUSTOMER' | 'SUPPLIER' | 'BOTH';

export interface Party {
  id: string;
  businessId: string;
  type: PartyType;
  name: string;
  contactPerson?: string;
  phone?: string;
  isWalkIn?: boolean;
  email?: string;
  gstin?: string;
  pan?: string;
  billingAddress: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    stateCode?: string;
    pincode: string;
  };
  shippingAddress?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    stateCode?: string;
    pincode: string;
  };
  openingBalanceMinor: number;
  currentBalanceMinor: number;
  creditLimitMinor?: number;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PartyInput {
  type: PartyType;
  name: string;
  contactPerson?: string;
  phone: string;
  email?: string;
  gstin?: string;
  pan?: string;
  billingAddress: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
  };
  shippingAddress?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
  };
  openingBalanceMinor?: number;
  creditLimitMinor?: number;
}
