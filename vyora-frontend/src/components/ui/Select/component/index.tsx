import React, { forwardRef } from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SelectProps } from '../config/interface';
import { DEFAULT_SELECT_PLACEHOLDER } from '../config/constant';

// --- Primitive shadcn/ui Select Components ---

export const SelectRoot = SelectPrimitive.Root;
export const SelectGroup = SelectPrimitive.Group;
export const SelectValue = SelectPrimitive.Value;

export interface SelectTriggerProps
  extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> {
  size?: 'sm' | 'md' | 'lg';
}

export const SelectTrigger = forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  SelectTriggerProps
>(({ className, children, size = 'md', ...props }, ref) => {
  const sizeClasses = {
    sm: 'h-8 px-2.5 py-1 text-xs rounded-lg',
    md: 'h-9.5 px-3 py-1.5 text-xs rounded-xl',
    lg: 'h-11 px-3.5 py-2 text-sm rounded-xl',
  }[size];

  return (
    <SelectPrimitive.Trigger
      ref={ref}
      className={cn(
        'flex w-full items-center justify-between border border-[#D7E5E2] dark:border-[#1E3B38] bg-white dark:bg-[#0D1C1B] font-semibold text-[#123B3A] dark:text-[#F0FDFA] shadow-2xs transition-all',
        'hover:border-[#A0BDB8] dark:hover:border-[#2E5A56] focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 dark:focus:ring-[#14B8A6]/20 focus:border-[#0F766E] dark:focus:border-[#14B8A6]',
        'disabled:cursor-not-allowed disabled:bg-[#F4F8F7] dark:disabled:bg-[#112322] disabled:text-[#566B69]/60 dark:disabled:text-[#8FA8A4]/50',
        '[&>span]:line-clamp-1 text-left',
        sizeClasses,
        className,
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDown className="h-3.5 w-3.5 text-[#566B69] dark:text-[#8FA8A4] opacity-70 shrink-0 ml-1.5 transition-transform duration-200" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
});
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

export const SelectScrollUpButton = forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn(
      'flex cursor-default items-center justify-center py-1 text-[#566B69] dark:text-[#8FA8A4]',
      className,
    )}
    {...props}
  >
    <ChevronUp className="h-4 w-4" />
  </SelectPrimitive.ScrollUpButton>
));
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;

export const SelectScrollDownButton = forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn(
      'flex cursor-default items-center justify-center py-1 text-[#566B69] dark:text-[#8FA8A4]',
      className,
    )}
    {...props}
  >
    <ChevronDown className="h-4 w-4" />
  </SelectPrimitive.ScrollDownButton>
));
SelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName;

export const SelectContent = forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = 'popper', ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        'relative z-50 max-h-80 min-w-[8rem] overflow-hidden rounded-xl border border-[#D7E5E2] dark:border-[#1E3B38] bg-white dark:bg-[#112322] text-[#123B3A] dark:text-[#F0FDFA] shadow-lg animate-in fade-in-80',
        position === 'popper' &&
          'data-[side=bottom]:translate-y-1 data-[side=top]:-translate-y-1',
        className,
      )}
      position={position}
      {...props}
    >
      <SelectScrollUpButton />
      <SelectPrimitive.Viewport
        className={cn(
          'p-1.5',
          position === 'popper' && 'w-full min-w-[var(--radix-select-trigger-width)]',
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = SelectPrimitive.Content.displayName;

export const SelectLabel = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'py-1.5 px-3 text-[10px] font-bold text-[#566B69] dark:text-[#8FA8A4] uppercase tracking-wider select-none',
      className,
    )}
    {...props}
  />
));
SelectLabel.displayName = 'SelectLabel';

export const SelectItem = forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      'relative flex w-full cursor-pointer select-none items-center rounded-lg py-1.5 pl-7 pr-2.5 text-xs font-medium text-[#123B3A] dark:text-[#F0FDFA] outline-none transition-colors',
      'hover:bg-[#E6F4F2] dark:hover:bg-[#142B2A] hover:text-[#0F766E] dark:hover:text-[#14B8A6] focus:bg-[#E6F4F2] dark:focus:bg-[#142B2A] focus:text-[#0F766E] dark:focus:text-[#14B8A6]',
      'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      className,
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-3.5 w-3.5 text-[#0F766E] dark:text-[#14B8A6]" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

export const SelectSeparator = forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn('-mx-1 my-1 h-px bg-[#D7E5E2] dark:border-[#1E3B38]', className)}
    {...props}
  />
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

// --- High-Level Backward-Compatible Select Component ---

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  helperText,
  options,
  value,
  defaultValue,
  placeholder = DEFAULT_SELECT_PLACEHOLDER,
  required,
  disabled,
  id,
  name,
  className,
  size = 'md',
  onChange,
  onValueChange,
}) => {
  const selectId = id || (label ? label.toLowerCase().replace(/[^a-z0-9]/g, '-') : undefined);
  const cleanLabel = label?.replace(/\s*\*$/, '');
  const isRequired = required || label?.includes('*');

  const stringValue = value !== undefined ? String(value) : undefined;
  const stringDefault = defaultValue !== undefined ? String(defaultValue) : undefined;

  const handleValueChange = (val: string) => {
    if (onValueChange) {
      onValueChange(val);
    }
    if (onChange) {
      onChange({ target: { value: val, name } });
    }
  };

  const placeholderFromEmptyOption = options.find((opt) => String(opt.value) === '')?.label;
  const effectivePlaceholder =
    placeholder !== DEFAULT_SELECT_PLACEHOLDER
      ? placeholder
      : (placeholderFromEmptyOption || placeholder);

  return (
    <div className="w-full space-y-1 text-left">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-xs font-semibold text-[#123B3A] dark:text-[#F0FDFA] select-none"
        >
          {cleanLabel}
          {isRequired && (
            <span
              className="text-[#B91C1C] dark:text-rose-400 font-bold ml-1 text-xs"
              title="Required field"
            >
              *
            </span>
          )}
        </label>
      )}

      <SelectRoot
        value={stringValue && stringValue !== '' ? stringValue : undefined}
        defaultValue={stringDefault && stringDefault !== '' ? stringDefault : undefined}
        onValueChange={handleValueChange}
        disabled={disabled}
      >
        <SelectTrigger
          id={selectId}
          size={size}
          className={cn(
            error &&
              'border-[#B91C1C] dark:border-rose-500 bg-[#FEF2F2]/30 dark:bg-rose-950/30 focus:border-[#B91C1C]',
            className,
          )}
        >
          <SelectValue placeholder={effectivePlaceholder} />
        </SelectTrigger>
        <SelectContent>
          {options
            .filter((opt) => String(opt.value) !== '')
            .map((opt) => (
              <SelectItem key={String(opt.value)} value={String(opt.value)}>
                {opt.label}
              </SelectItem>
            ))}
        </SelectContent>
      </SelectRoot>

      {error && (
        <p className="text-[11px] font-medium text-[#B91C1C] dark:text-rose-400 mt-0.5">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-[11px] text-[#566B69] dark:text-[#8FA8A4] mt-0.5">{helperText}</p>
      )}
    </div>
  );
};
