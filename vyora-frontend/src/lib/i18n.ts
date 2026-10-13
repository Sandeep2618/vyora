import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enCommon from '../locales/en/common.json';
import enInvoices from '../locales/en/invoices.json';
import enParties from '../locales/en/parties.json';
import enProducts from '../locales/en/products.json';
import enDashboard from '../locales/en/dashboard.json';
import enInventory from '../locales/en/inventory.json';
import enPayments from '../locales/en/payments.json';
import enPurchases from '../locales/en/purchases.json';
import enReports from '../locales/en/reports.json';
import enAccount from '../locales/en/account.json';

import hiCommon from '../locales/hi/common.json';
import hiInvoices from '../locales/hi/invoices.json';
import hiParties from '../locales/hi/parties.json';
import hiProducts from '../locales/hi/products.json';
import hiDashboard from '../locales/hi/dashboard.json';
import hiInventory from '../locales/hi/inventory.json';
import hiPayments from '../locales/hi/payments.json';
import hiPurchases from '../locales/hi/purchases.json';
import hiReports from '../locales/hi/reports.json';
import hiAccount from '../locales/hi/account.json';

import guCommon from '../locales/gu/common.json';
import guInvoices from '../locales/gu/invoices.json';
import guParties from '../locales/gu/parties.json';
import guProducts from '../locales/gu/products.json';
import guDashboard from '../locales/gu/dashboard.json';
import guInventory from '../locales/gu/inventory.json';
import guPayments from '../locales/gu/payments.json';
import guPurchases from '../locales/gu/purchases.json';
import guReports from '../locales/gu/reports.json';
import guAccount from '../locales/gu/account.json';

const resources = {
  en: {
    common: enCommon,
    invoices: enInvoices,
    parties: enParties,
    products: enProducts,
    dashboard: enDashboard,
    inventory: enInventory,
    payments: enPayments,
    purchases: enPurchases,
    reports: enReports,
    account: enAccount,
  },
  hi: {
    common: hiCommon,
    invoices: hiInvoices,
    parties: hiParties,
    products: hiProducts,
    dashboard: hiDashboard,
    inventory: hiInventory,
    payments: hiPayments,
    purchases: hiPurchases,
    reports: hiReports,
    account: hiAccount,
  },
  gu: {
    common: guCommon,
    invoices: guInvoices,
    parties: guParties,
    products: guProducts,
    dashboard: guDashboard,
    inventory: guInventory,
    payments: guPayments,
    purchases: guPurchases,
    reports: guReports,
    account: guAccount,
  },
};

const savedLang = localStorage.getItem('vyora-language') || 'en';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLang,
    fallbackLng: 'en',
    defaultNS: 'common',
    interpolation: {
      escapeValue: false,
    },
  });

export const changeLanguage = (lang: 'en' | 'hi' | 'gu') => {
  localStorage.setItem('vyora-language', lang);
  i18n.changeLanguage(lang);
};

export default i18n;
