export interface DatePickerProps {
  label?: string;
  value?: string; // Format: 'YYYY-MM-DD'
  onChange?: (dateStr: string) => void;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helperText?: string;
  placeholder?: string;
  minDate?: string;
  maxDate?: string;
  className?: string;
  id?: string;
}
