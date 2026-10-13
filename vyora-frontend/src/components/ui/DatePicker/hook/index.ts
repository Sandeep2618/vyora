import { useState, useRef, useEffect } from 'react';
import { getDaysInMonth, getFirstDayOfWeek } from '../util';

export interface UseDatePickerOptions {
  value?: string;
  onChange?: (val: string) => void;
  minDate?: string;
  maxDate?: string;
}

export const useDatePicker = ({ value, onChange }: UseDatePickerOptions) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const parsedValue = value ? new Date(value + 'T00:00:00') : null;
  const isValidDate = parsedValue && !isNaN(parsedValue.getTime());

  const [viewYear, setViewYear] = useState(() =>
    isValidDate ? parsedValue.getFullYear() : new Date().getFullYear(),
  );
  const [viewMonth, setViewMonth] = useState(() =>
    isValidDate ? parsedValue.getMonth() : new Date().getMonth(),
  );

  useEffect(() => {
    if (isValidDate) {
      setViewYear(parsedValue.getFullYear());
      setViewMonth(parsedValue.getMonth());
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const selectDate = (dayStr: string) => {
    onChange?.(dayStr);
    setIsOpen(false);
  };

  const clearDate = () => {
    onChange?.('');
    setIsOpen(false);
  };

  const setToday = () => {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    onChange?.(todayStr);
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
    setIsOpen(false);
  };

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDayOfWeek = getFirstDayOfWeek(viewYear, viewMonth);

  return {
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
  };
};
