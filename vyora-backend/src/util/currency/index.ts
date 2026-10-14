export function majorToMinor(amount: number): number {
  return Math.round(amount * 100);
}

export function minorToMajor(amountMinor: number): number {
  return amountMinor / 100;
}

export function formatCurrency(amountMinor: number, currency: string = 'INR'): string {
  const major = minorToMajor(amountMinor);
  if (currency === 'INR') {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(major);
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(major);
}
