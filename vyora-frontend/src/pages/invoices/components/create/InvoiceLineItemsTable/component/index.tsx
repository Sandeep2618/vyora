import React from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2, ChevronDown, AlertCircle, PackagePlus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { InvoiceLineItemsTableProps } from '../config/interface';
import { calculateLineTotal } from '../util';

export const InvoiceLineItemsTable: React.FC<InvoiceLineItemsTableProps> = ({
  lines,
  products,
  onProductSelect,
  onUpdateLine,
  onAddLine,
  onRemoveLine,
  onAddNewProduct,
}) => {
  const { t } = useTranslation('invoices');

  const handleSelectChange = (index: number, value: string) => {
    if (value === '__NEW_PRODUCT__') {
      onAddNewProduct?.();
      return;
    }
    onProductSelect(index, value);
  };

  return (
    <div className="bg-white dark:bg-[#112322] border border-[#D7E5E2] dark:border-[#1E3B38] rounded-xl p-4 sm:p-5 shadow-2xs space-y-3.5">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#D7E5E2] dark:border-[#1E3B38]">
        <h3 className="text-sm font-bold text-[#123B3A] dark:text-[#E6F4F1]">
          {t('createPage.addItems', { defaultValue: 'Add Items' })}
        </h3>
        <div className="flex items-center gap-2">
          {onAddNewProduct && (
            <Button
              size="sm"
              variant="outline"
              type="button"
              onClick={onAddNewProduct}
              className="text-xs h-8 px-2.5 flex items-center gap-1 border-[#0F766E]/40 text-[#0F766E] dark:text-[#14B8A6] hover:bg-[#E6F4F2] dark:hover:bg-[#162E2D]"
            >
              <PackagePlus className="w-3.5 h-3.5" />
              <span>{t('createPage.newProduct', { defaultValue: '+ New Product' })}</span>
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            type="button"
            onClick={onAddLine}
            className="text-xs h-8 px-2.5 flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t('createPage.addItem', { defaultValue: 'Add Item' })}</span>
          </Button>
        </div>
      </div>

      {products.length === 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800 rounded-xl text-xs text-amber-900 dark:text-amber-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              {t('createPage.noProductsBanner', {
                defaultValue: 'No products in catalog. Add items now to include them in this invoice.',
              })}
            </span>
          </div>
          {onAddNewProduct && (
            <button
              type="button"
              onClick={onAddNewProduct}
              className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg bg-[#0F766E] text-white hover:bg-[#0D665F] transition-colors shadow-2xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t('createPage.addProductNow', { defaultValue: '+ Add Product to Catalog' })}</span>
            </button>
          )}
        </div>
      )}

      <div className="overflow-x-auto -mx-1 sm:mx-0">
        <table className="w-full text-left text-xs min-w-[580px] border-collapse">
          <thead>
            <tr className="border-b border-[#D7E5E2] dark:border-[#1E3B38] text-[#566B69] dark:text-slate-400 font-semibold bg-[#F4F8F7]/70 dark:bg-[#162E2D]">
              <th className="py-2 px-2 w-8 text-center">{t('createPage.colNum', { defaultValue: '#' })}</th>
              <th className="py-2 px-2 min-w-[180px]">{t('createPage.colProduct', { defaultValue: 'Product / Service' })}</th>
              <th className="py-2 px-2 w-20">{t('createPage.colHsn', { defaultValue: 'HSN/SAC' })}</th>
              <th className="py-2 px-2 w-16 text-center">{t('createPage.colQty', { defaultValue: 'Qty' })}</th>
              <th className="py-2 px-2 w-24 text-right">{t('createPage.colRate', { defaultValue: 'Rate (₹)' })}</th>
              <th className="py-2 px-2 w-24 text-right">{t('createPage.colAmount', { defaultValue: 'Amount (₹)' })}</th>
              <th className="py-2 px-1 w-8 text-center"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#D7E5E2]/80 dark:divide-[#1E3B38]">
            {lines.map((line, idx) => {
              const lineTotal = calculateLineTotal(line.quantity, line.rateMajor);

              return (
                <tr key={idx} className="hover:bg-[#F4F8F7]/50 dark:hover:bg-[#162E2D]/40 transition-colors">
                  <td className="py-2 px-2 text-[#566B69] dark:text-slate-400 font-medium text-center">{idx + 1}</td>
                  <td className="py-2 px-2">
                    <div className="relative">
                      <select
                        value={line.productId}
                        onChange={(e) => handleSelectChange(idx, e.target.value)}
                        className="w-full h-8.5 appearance-none pl-2.5 pr-7 bg-white dark:bg-[#0D1C1B] border border-[#D7E5E2] dark:border-[#1E3B38] rounded-lg text-xs font-medium text-[#123B3A] dark:text-[#E6F4F1] focus:outline-none focus:ring-1.5 focus:ring-[#0F766E] focus:border-[#0F766E] dark:focus:border-[#14B8A6] cursor-pointer shadow-2xs"
                      >
                        <option value="">
                          {products.length === 0
                            ? t('createPage.noItemsInCatalog', { defaultValue: 'No items in catalog' })
                            : t('createPage.selectItem', { defaultValue: 'Select item...' })}
                        </option>
                        {onAddNewProduct && (
                          <option value="__NEW_PRODUCT__">
                            + {t('createPage.newProduct', { defaultValue: 'Add New Product...' })}
                          </option>
                        )}
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({t('createPage.stock', { defaultValue: 'Stock' })}: {p.currentStock} {p.unit})
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#566B69] dark:text-[#8FA8A4] pointer-events-none opacity-70" />
                    </div>
                  </td>
                  <td className="py-2 px-2">
                    <input
                      type="text"
                      placeholder="HSN"
                      value={line.hsnCode || ''}
                      onChange={(e) => onUpdateLine(idx, 'hsnCode', e.target.value)}
                      className="w-full h-8.5 px-2 bg-[#F4F8F7]/60 dark:bg-[#0D1C1B] border border-[#D7E5E2] dark:border-[#1E3B38] rounded-lg text-xs text-[#123B3A] dark:text-[#E6F4F1] focus:outline-none focus:ring-1.5 focus:ring-[#0F766E] focus:border-[#0F766E]"
                    />
                  </td>
                  <td className="py-2 px-2 text-center">
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={line.quantity}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => onUpdateLine(idx, 'quantity', e.target.value)}
                      onBlur={(e) => {
                        const qty = Math.max(1, parseInt(e.target.value, 10) || 1);
                        onUpdateLine(idx, 'quantity', qty);
                      }}
                      className="w-16 h-8.5 px-1.5 bg-white dark:bg-[#0D1C1B] border border-[#D7E5E2] dark:border-[#1E3B38] rounded-lg text-xs text-center font-bold text-[#123B3A] dark:text-[#E6F4F1] focus:outline-none focus:ring-1.5 focus:ring-[#0F766E] focus:border-[#0F766E] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none shadow-2xs"
                    />
                  </td>
                  <td className="py-2 px-2 text-right">
                    <input
                      type="number"
                      min="0"
                      step="any"
                      placeholder="0.00"
                      value={line.rateMajor ?? ''}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => onUpdateLine(idx, 'rateMajor', e.target.value)}
                      className="w-20 h-8.5 px-2 bg-white dark:bg-[#0D1C1B] border border-[#D7E5E2] dark:border-[#1E3B38] rounded-lg text-xs text-right font-bold text-[#123B3A] dark:text-[#E6F4F1] focus:outline-none focus:ring-1.5 focus:ring-[#0F766E] focus:border-[#0F766E] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none shadow-2xs"
                    />
                  </td>
                  <td className="py-2 px-2 text-right font-bold text-[#123B3A] dark:text-[#E6F4F1]">
                    {lineTotal.toFixed(2)}
                  </td>
                  <td className="py-2 px-1 text-center">
                    <button
                      type="button"
                      disabled={lines.length === 1}
                      onClick={() => onRemoveLine(idx)}
                      className="text-[#566B69] hover:text-red-600 dark:hover:text-rose-400 p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-950/40 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                      title="Remove row"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="pt-1">
        <Button size="sm" variant="ghost" type="button" onClick={onAddLine} className="text-xs h-8">
          <Plus className="w-3.5 h-3.5 mr-1" />
          <span>{t('createPage.addItem', { defaultValue: 'Add Item' })}</span>
        </Button>
      </div>
    </div>
  );
};
