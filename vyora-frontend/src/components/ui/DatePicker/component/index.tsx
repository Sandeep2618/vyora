import React from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DatePickerProps } from '../config/interface';
import {
  MONTH_NAMES,
  WEEKDAYS,
  DEFAULT_DATE_PICKER_PLACEHOLDER,
} from '../config/constant';
import { formatDisplayDate, formatDayString } from '../util';
import { useDatePicker } from '../hook';

export const DatePicker: React.FC<DatePickerProps> = ({
  label,
  value,
  onChange,
  required,
  disabled,
  error,
  helperText,
  placeholder = DEFAULT_DATE_PICKER_PLACEHOLDER,
  minDate,
  maxDate,
  className,
  id,
}) => {
  const {
    isOpen,
    setIsOpen,
    containerRef,
    viewYear,
    viewMonth,
    daysInMonth,
    firstDayOfWeek,
    prevMonth,
    nextMonth,
    selectDate,
    clearDate,
    setToday,
  } = useDatePicker({ value, onChange, minDate, maxDate });

  const inputId = id || (label ? label.toLowerCase().replace(/[^a-z0-9]/g, '-') : undefined);
  const cleanLabel = label?.replace(/\s*\*$/, '');
  const isRequired = required || label?.includes('*');

  const today = new Date();
  const todayStr = formatDayString(today.getFullYear(), today.getMonth(), today.getDate());

  const isDayDisabled = (dayStr: string) => {
    if (minDate && dayStr < minDate) return true;
    if (maxDate && dayStr > maxDate) return true;
    return false;
  };

  return (
    <div ref={containerRef} className="w-full space-y-1.5 text-left relative">
      {label && (
        <label
          htmlFor={inputId}
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

      {/* Input Trigger Button */}
      <div className="relative">
        <button
          type="button"
          id={inputId}
          disabled={disabled}
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'flex h-10 w-full items-center justify-between rounded-xl border bg-white dark:bg-[#0D1C1B] px-3.5 py-2 text-xs font-semibold shadow-2xs transition-all text-left cursor-pointer',
            'focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 dark:focus:ring-[#14B8A6]/20 focus:border-[#0F766E] dark:focus:border-[#14B8A6]',
            value
              ? 'text-[#123B3A] dark:text-[#F0FDFA]'
              : 'text-[#566B69]/60 dark:text-[#8FA8A4]/50 font-normal',
            error
              ? 'border-[#B91C1C] dark:border-rose-500 bg-[#FEF2F2]/30 dark:bg-rose-950/30'
              : 'border-[#D7E5E2] dark:border-[#1E3B38] hover:border-[#A0BDB8] dark:hover:border-[#2E5A56]',
            disabled &&
              'bg-[#F4F8F7] dark:bg-[#112322] text-[#566B69]/60 dark:text-[#8FA8A4]/50 cursor-not-allowed opacity-60',
            className,
          )}
        >
          <span className="truncate">{value ? formatDisplayDate(value) : placeholder}</span>
          <div className="flex items-center gap-1.5 shrink-0 ml-2">
            {value && !disabled && (
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation();
                  clearDate();
                }}
                className="p-0.5 rounded-full hover:bg-[#E6F4F2] dark:hover:bg-[#162E2D] text-[#566B69] dark:text-[#8FA8A4] hover:text-[#B91C1C] transition-colors"
                title="Clear date"
              >
                <X className="w-3.5 h-3.5" />
              </span>
            )}
            <CalendarIcon className="w-4 h-4 text-[#0F766E] dark:text-[#14B8A6]" />
          </div>
        </button>
      </div>

      {error && (
        <p className="text-[11px] font-medium text-[#B91C1C] dark:text-rose-400 mt-0.5">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-[11px] text-[#566B69] dark:text-[#8FA8A4] mt-0.5">{helperText}</p>
      )}

      {/* Popup Calendar Dropdown */}
      {isOpen && !disabled && (
        <div className="absolute left-0 top-full mt-1.5 z-50 w-72 rounded-2xl border border-[#D7E5E2] dark:border-[#1E3B38] bg-white dark:bg-[#112322] p-4 shadow-xl shadow-[#123B3A]/10 dark:shadow-black/40 animate-in fade-in zoom-in-95 duration-150">
          {/* Month & Year Navigation Header */}
          <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-[#D7E5E2] dark:border-[#1E3B38]">
            <button
              type="button"
              onClick={prevMonth}
              className="p-1 rounded-lg hover:bg-[#E6F4F2] dark:hover:bg-[#162E2D] text-[#566B69] dark:text-[#8FA8A4] hover:text-[#0F766E] dark:hover:text-[#14B8A6] transition-colors cursor-pointer"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-[#123B3A] dark:text-[#F0FDFA]">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              className="p-1 rounded-lg hover:bg-[#E6F4F2] dark:hover:bg-[#162E2D] text-[#566B69] dark:text-[#8FA8A4] hover:text-[#0F766E] dark:hover:text-[#14B8A6] transition-colors cursor-pointer"
              aria-label="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Weekday Labels */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1.5">
            {WEEKDAYS.map((wd) => (
              <span
                key={wd}
                className="text-[10px] font-bold text-[#566B69] dark:text-[#8FA8A4] py-0.5"
              >
                {wd}
              </span>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {/* Empty cells before month start */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="h-7 w-7" />
            ))}

            {/* Days of month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dayStr = formatDayString(viewYear, viewMonth, dayNum);
              const isSelected = value === dayStr;
              const isToday = todayStr === dayStr;
              const isDisabled = isDayDisabled(dayStr);

              return (
                <button
                  key={`day-${dayNum}`}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => selectDate(dayStr)}
                  className={cn(
                    'h-7 w-7 rounded-lg text-xs font-medium transition-all flex items-center justify-center mx-auto cursor-pointer select-none',
                    isSelected &&
                      'bg-[#0F766E] text-white font-bold shadow-xs dark:bg-[#14B8A6] dark:text-[#0A1615]',
                    !isSelected &&
                      isToday &&
                      'border border-[#0F766E] text-[#0F766E] dark:border-[#14B8A6] dark:text-[#14B8A6] font-semibold',
                    !isSelected &&
                      !isToday &&
                      !isDisabled &&
                      'text-[#123B3A] dark:text-[#E6F4F1] hover:bg-[#E6F4F2] dark:hover:bg-[#162E2D] hover:text-[#0F766E] dark:hover:text-[#14B8A6]',
                    isDisabled &&
                      'text-[#566B69]/30 dark:text-[#8FA8A4]/30 cursor-not-allowed hover:bg-transparent',
                  )}
                >
                  {dayNum}
                </button>
              );
            })}
          </div>

          {/* Footer Quick Actions */}
          <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#D7E5E2] dark:border-[#1E3B38] text-[11px]">
            <button
              type="button"
              onClick={setToday}
              className="text-[#0F766E] dark:text-[#14B8A6] font-semibold hover:underline cursor-pointer"
            >
              Today
            </button>
            {value && (
              <button
                type="button"
                onClick={clearDate}
                className="text-[#B91C1C] dark:text-rose-400 font-semibold hover:underline cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
