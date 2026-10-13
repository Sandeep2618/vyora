const fs = require('fs');
const path = require('path');

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

const root = 'C:/Users/sande/vyora/vyora-frontend/src';

const bridges = [
  { dir: 'components/subscription/PlanPurchaseModal', target: '../modal/PlanPurchaseModal' },
  { dir: 'pages/account/components/roles/StaffInviteModal', target: '../modal/StaffInviteModal' },
  { dir: 'pages/inventory/components/StockAdjustmentModal', target: '../../modal/StockAdjustmentModal' },
  { dir: 'pages/parties/components/PartyFormModal', target: '../../modal/PartyFormModal' },
  { dir: 'pages/parties/components/DeletePartyModal', target: '../../modal/DeletePartyModal' },
  { dir: 'pages/products/components/ProductFormModal', target: '../../modal/ProductFormModal' },
  { dir: 'pages/products/components/DeleteProductModal', target: '../../modal/DeleteProductModal' },
  { dir: 'pages/payments/components/RecordVoucherModal', target: '../../modal/RecordVoucherModal' },
  { dir: 'pages/purchases/components/RecordPurchaseBillModal', target: '../../modal/RecordPurchaseBillModal' },
  { dir: 'pages/invoices/components/create/NewCustomerModal', target: '../modal/NewCustomerModal' },
  { dir: 'pages/invoices/components/list/CancelInvoiceModal', target: '../modal/CancelInvoiceModal' },
  { dir: 'pages/invoices/components/view/RecordPaymentModal', target: '../modal/RecordPaymentModal' },
];

bridges.forEach(b => {
  const full = path.join(root, b.dir);
  ensureDir(full);
  fs.writeFileSync(path.join(full, 'index.ts'), `export * from '${b.target}';\n`);
});

console.log('Bridges created!');
