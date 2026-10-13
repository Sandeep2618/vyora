export const validateIndianPhone = (phone: string): boolean => {
  return phone.length === 10 && /^[6-9]/.test(phone);
};
