# Vyora Theme B: Teal Ledger Design Tokens

> **Theme**: Theme B — Teal Ledger  
> **Mandatory Rule**: All user interface elements across `vyora-frontend` and `vyora-app` must consume these tokens. Raw hardcoded color hex codes are forbidden.

---

## 1. Color Tokens Reference

### Light Mode (Default)
| Token Name | Hex Code | Purpose / Usage |
| :--- | :--- | :--- |
| `primary` | `#0F766E` | Main branding, primary action buttons, active tab indicators |
| `primaryHover` | `#115E59` | Hover state for primary buttons |
| `primaryMuted` | `#E6F4F2` | Subtle badges, active navigation background, selected row tint |
| `background` | `#F4F8F7` | Main application background (canvas) |
| `card` / `surface` | `#FFFFFF` | Cards, modal sheets, tables, input fields background |
| `surfaceElevated` | `#FFFFFF` | Dropdowns, popovers, floating menus |
| `border` | `#D7E5E2` | Table dividers, input borders, card borders |
| `borderSubtle` | `#E6ECEB` | Secondary borders, inner item separators |
| `text` | `#123B3A` | High contrast primary text (headings, table values) |
| `textMuted` | `#566B69` | Secondary text, field helper hints, labels, timestamps |
| `error` | `#B91C1C` | Form validation errors, required field asterisks, delete actions |
| `errorBg` | `#FEF2F2` | Error banner background |
| `success` | `#047857` | Paid invoice status, positive balance, success toast |
| `successBg` | `#ECFDF5` | Success badge background |
| `warning` | `#B45309` | Low stock alert, partially paid badges |
| `warningBg` | `#FFFBEB` | Warning badge background |

---

### Dark Mode (Elevated Slate & Teal)
| Token Name | Hex Code | Purpose / Usage |
| :--- | :--- | :--- |
| `primary` | `#14B8A6` | Main branding, primary action buttons (vibrant teal for contrast) |
| `primaryHover` | `#0D9488` | Hover state for primary buttons in dark mode |
| `primaryMuted` | `#1A3331` | Dark badges, active navigation tint |
| `background` | `#0B1313` | Deep charcoal/teal canvas |
| `card` / `surface` | `#111C1B` | Modal sheets, cards, tables background |
| `surfaceElevated` | `#1A2826` | Floating modals, dropdown menus |
| `border` | `#1F3330` | Borders & dividers |
| `borderSubtle` | `#162725` | Inner list separators |
| `text` | `#E8F4F2` | High contrast headings and primary labels |
| `textMuted` | `#8CA4A0` | Secondary descriptions, timestamps, subtle captions |
| `error` | `#F87171` | High contrast error text & badges |
| `errorBg` | `#2D1515` | Dark error banner background |
| `success` | `#34D399` | Paid status, stock received |
| `successBg` | `#0E2A20` | Dark success badge background |
| `warning` | `#FBBF24` | Warning highlights & low-stock tags |
| `warningBg` | `#2E220D` | Dark warning banner background |

---

## 2. Web Usage Pattern (`vyora-frontend`)

In Tailwind CSS 4, configure or consume semantic color utilities:

```tsx
// Example Table or Card Container
<div className="bg-white dark:bg-[#111C1B] border border-[#D7E5E2] dark:border-[#1F3330] rounded-xl p-4 shadow-sm">
  <h2 className="text-[#123B3A] dark:text-[#E8F4F2] font-semibold text-lg">
    {t('products.catalog')}
  </h2>
  <p className="text-[#566B69] dark:text-[#8CA4A0] text-sm">
    {t('products.subtitle')}
  </p>
  <button className="bg-[#0F766E] hover:bg-[#115E59] dark:bg-[#14B8A6] dark:hover:bg-[#0D9488] text-white px-4 py-2 rounded-lg font-medium">
    {t('common.save')}
  </button>
</div>
```

---

## 3. Mobile Usage Pattern (`vyora-app`)

In React Native, consume `useTheme()` hook:

```tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export const MyComponent: React.FC = () => {
  const { theme, isDark } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <Text style={[styles.title, { color: theme.text }]}>Item Header</Text>
      <Text style={[styles.subtitle, { color: theme.textMuted }]}>Details</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
});
```
