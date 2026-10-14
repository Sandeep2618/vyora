import { useState, useCallback, useEffect } from 'react';
import { STORAGE_PREFIX } from '../../config/constant';
import { PREFERENCE_SCOPE } from '../../config/enum';

interface IUseTablePreferenceOptions<T> {
  module: string;
  key: string;
  defaultValue: T;
  scope?: PREFERENCE_SCOPE | `${PREFERENCE_SCOPE}`;
  enabled?: boolean;
}

export function useTablePreference<T>(options: IUseTablePreferenceOptions<T>): [T, (val: T | ((prev: T) => T)) => void] {
  const { module, key, defaultValue, scope = PREFERENCE_SCOPE.LOCAL, enabled = true } = options;
  const storageKey = `${STORAGE_PREFIX}${module}:${key}`;

  const getStorage = useCallback(() => {
    if (typeof window === 'undefined' || !enabled || scope === PREFERENCE_SCOPE.MEMORY) {
      return null;
    }
    try {
      return scope === PREFERENCE_SCOPE.SESSION ? window.sessionStorage : window.localStorage;
    } catch {
      return null;
    }
  }, [scope, enabled]);

  const [state, setState] = useState<T>(() => {
    const storage = getStorage();
    if (!storage) return defaultValue;

    try {
      const item = storage.getItem(storageKey);
      if (item !== null) {
        return JSON.parse(item);
      }
    } catch (e) {
      console.warn(`[TablePreference] Failed to read ${storageKey}:`, e);
    }
    return defaultValue;
  });

  const setValue = useCallback(
    (valueOrFn: T | ((prev: T) => T)) => {
      setState((prev) => {
        const next = typeof valueOrFn === 'function' ? (valueOrFn as (prev: T) => T)(prev) : valueOrFn;
        const storage = getStorage();
        if (storage) {
          try {
            storage.setItem(storageKey, JSON.stringify(next));
          } catch (e) {
            console.warn(`[TablePreference] Failed to save ${storageKey}:`, e);
          }
        }
        return next;
      });
    },
    [getStorage, storageKey]
  );

  return [state, setValue];
}
