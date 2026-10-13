const fs = require('fs');
const path = require('path');

function moveDir(src, dest) {
  if (!fs.existsSync(src)) return false;
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.cpSync(src, dest, { recursive: true });
  fs.rmSync(src, { recursive: true, force: true });
  return true;
}

const root = 'C:/Users/sande/vyora/vyora-frontend/src';

// 1. Parties
moveDir(path.join(root, 'pages/parties/components/DeletePartyModal'), path.join(root, 'pages/parties/modal/DeletePartyModal'));
moveDir(path.join(root, 'pages/parties/components/PartyFormModal'), path.join(root, 'pages/parties/modal/PartyFormModal'));
fs.writeFileSync(path.join(root, 'pages/parties/modal/index.ts'), `export * from './DeletePartyModal';\nexport * from './PartyFormModal';\n`);
fs.writeFileSync(path.join(root, 'pages/parties/components/index.ts'), `export * from './PartyFilterToolbar';\nexport * from './PartyTable';\nexport * from '../modal';\n`);

// 2. Products
moveDir(path.join(root, 'pages/products/components/DeleteProductModal'), path.join(root, 'pages/products/modal/DeleteProductModal'));
moveDir(path.join(root, 'pages/products/components/ProductFormModal'), path.join(root, 'pages/products/modal/ProductFormModal'));
fs.writeFileSync(path.join(root, 'pages/products/modal/index.ts'), `export * from './DeleteProductModal';\nexport * from './ProductFormModal';\n`);
fs.writeFileSync(path.join(root, 'pages/products/components/index.ts'), `export * from './ProductFilterToolbar';\nexport * from './ProductTable';\nexport * from '../modal';\n`);

// 3. Inventory
moveDir(path.join(root, 'pages/inventory/components/StockAdjustmentModal'), path.join(root, 'pages/inventory/modal/StockAdjustmentModal'));
fs.writeFileSync(path.join(root, 'pages/inventory/modal/index.ts'), `export * from './StockAdjustmentModal';\n`);
fs.writeFileSync(path.join(root, 'pages/inventory/components/index.ts'), `export * from './InventoryFilterToolbar';\nexport * from './StockMovementTable';\nexport * from '../modal';\n`);

// 4. Payments
moveDir(path.join(root, 'pages/payments/components/RecordVoucherModal'), path.join(root, 'pages/payments/modal/RecordVoucherModal'));
fs.writeFileSync(path.join(root, 'pages/payments/modal/index.ts'), `export * from './RecordVoucherModal';\n`);
fs.writeFileSync(path.join(root, 'pages/payments/components/index.ts'), `export * from './PaymentsFilterToolbar';\nexport * from './PaymentsTable';\nexport * from '../modal';\n`);

// 5. Purchases
moveDir(path.join(root, 'pages/purchases/components/RecordPurchaseBillModal'), path.join(root, 'pages/purchases/modal/RecordPurchaseBillModal'));
fs.writeFileSync(path.join(root, 'pages/purchases/modal/index.ts'), `export * from './RecordPurchaseBillModal';\n`);
fs.writeFileSync(path.join(root, 'pages/purchases/components/index.ts'), `export * from './PurchasesTable';\nexport * from '../modal';\n`);

// 6. Invoices Create
moveDir(path.join(root, 'pages/invoices/components/create/NewCustomerModal'), path.join(root, 'pages/invoices/components/create/modal/NewCustomerModal'));
fs.writeFileSync(path.join(root, 'pages/invoices/components/create/modal/index.ts'), `export * from './NewCustomerModal';\n`);
fs.writeFileSync(path.join(root, 'pages/invoices/components/create/index.ts'), `export * from './InvoiceCustomerHeader';\nexport * from './InvoiceLineItemsTable';\nexport * from './InvoiceTotalsSummary';\nexport * from './modal';\n`);

// 7. Invoices List
moveDir(path.join(root, 'pages/invoices/components/list/CancelInvoiceModal'), path.join(root, 'pages/invoices/components/list/modal/CancelInvoiceModal'));
fs.writeFileSync(path.join(root, 'pages/invoices/components/list/modal/index.ts'), `export * from './CancelInvoiceModal';\n`);
fs.writeFileSync(path.join(root, 'pages/invoices/components/list/index.ts'), `export * from './InvoiceFilterToolbar';\nexport * from './InvoiceTable';\nexport * from './modal';\n`);

// 8. Invoices View
moveDir(path.join(root, 'pages/invoices/components/view/RecordPaymentModal'), path.join(root, 'pages/invoices/components/view/modal/RecordPaymentModal'));
fs.writeFileSync(path.join(root, 'pages/invoices/components/view/modal/index.ts'), `export * from './RecordPaymentModal';\n`);
fs.writeFileSync(path.join(root, 'pages/invoices/components/view/index.ts'), `export * from './InvoicePrintTemplate';\nexport * from './modal';\n`);

// 9. Account Roles
moveDir(path.join(root, 'pages/account/components/roles/StaffInviteModal'), path.join(root, 'pages/account/components/roles/modal/StaffInviteModal'));
fs.writeFileSync(path.join(root, 'pages/account/components/roles/modal/index.ts'), `export * from './StaffInviteModal';\n`);

// 10. Subscription
moveDir(path.join(root, 'components/subscription/PlanPurchaseModal'), path.join(root, 'components/subscription/modal/PlanPurchaseModal'));
fs.writeFileSync(path.join(root, 'components/subscription/modal/index.ts'), `export * from './PlanPurchaseModal';\n`);
fs.writeFileSync(path.join(root, 'components/subscription/index.ts'), `export * from './PaymentMethodForm';\nexport * from './PlanCheckoutStatus';\nexport * from './PlanPricingSelector';\nexport * from './modal';\n`);

console.log('Modals reorganization completed successfully!');
