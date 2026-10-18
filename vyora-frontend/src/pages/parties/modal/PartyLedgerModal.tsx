import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  MessageSquare,
  Phone,
  Printer,
  FileText,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  Clock,
  User,
  MapPin,
  Building2,
  Calendar,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Party, Invoice, Payment } from '@/types';
import { formatCurrency, formatDateReadable } from '@/utils';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/components/ui/Toast';

interface PartyLedgerModalProps {
  isOpen: boolean;
  party: Party | null;
  onClose: () => void;
  onRecordPaymentClick?: (party: Party) => void;
}

export const PartyLedgerModal: React.FC<PartyLedgerModalProps> = ({
  isOpen,
  party,
  onClose,
  onRecordPaymentClick,
}) => {
  const { t } = useTranslation(['parties', 'common']);
  const { business } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!isOpen || !party) return;

    const loadData = async () => {
      try {
        setIsLoading(true);
        const [invRes, payRes] = await Promise.all([
          api.get<{ items: Invoice[] }>(`/invoices?customerId=${party.id}&limit=50`).catch(() => ({ items: [] })),
          api.get<{ items: Payment[] }>(`/payments?partyId=${party.id}&limit=50`).catch(() => ({ items: [] })),
        ]);
        setInvoices(invRes.items || []);
        setPayments(payRes.items || []);
      } catch (err) {
        console.warn('Failed to load party ledger:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [isOpen, party]);

  if (!party) return null;

  const currentBalanceMinor = party.currentBalanceMinor || 0;
  const isDue = currentBalanceMinor > 0;
  const isAdvance = currentBalanceMinor < 0;

  // Build merged chronological ledger transactions
  const ledgerEntries = [
    ...invoices.map((inv) => ({
      id: inv.id,
      date: inv.issueDate,
      type: 'INVOICE' as const,
      refNumber: inv.invoiceNumber,
      debitMinor: inv.grandTotalMinor,
      creditMinor: 0,
      notes: inv.notes,
      status: inv.status,
    })),
    ...payments.map((p) => ({
      id: p.id,
      date: p.paymentDate,
      type: 'PAYMENT' as const,
      refNumber: p.referenceNumber || 'RC-PAY',
      debitMinor: 0,
      creditMinor: p.amountMinor,
      notes: p.notes,
      status: p.paymentMethod,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleSendWhatsAppReminder = () => {
    if (!party.phone) {
      toast.error('No phone number recorded for this customer.');
      return;
    }

    const cleanPhone = party.phone.replace(/[^0-9]/g, '');
    const phoneWithCountry = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const businessName = business?.name || 'Vyora Store';
    const amountRupees = (currentBalanceMinor / 100).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
    });

    const upiDetails = business?.upiId ? `\nUPI ID: *${business.upiId}*` : '';

    const message = `Namaste ${party.name} Ji,\n\nThis is a friendly payment reminder from *${businessName}*.\n\nPending Ledger Balance: *₹${amountRupees}*${upiDetails}\n\nKindly clear via UPI or Cash at the counter. For bill details, reply to this message.\n\nThank you!`;
    const url = `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handlePrintStatement = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${party.name} — Khata Statement`}
      maxWidth="4xl"
    >
      <div className="p-5 sm:p-6 space-y-6">
        {/* Customer Header Info */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border border-[#D7E5E2] dark:border-[#1E3B38] bg-[#F4F8F7]/70 dark:bg-[#142B2A]/70">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-[#123B3A] dark:text-[#F0FDFA]">
                {party.name}
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#0F766E]/10 text-[#0F766E] dark:text-[#14B8A6] uppercase">
                {party.type}
              </span>
            </div>
            <p className="text-xs text-[#566B69] dark:text-[#8FA8A4] mt-0.5 flex items-center gap-3">
              {party.phone && <span>📞 {party.phone}</span>}
              {party.email && <span>✉️ {party.email}</span>}
              {party.gstin && <span>GSTIN: <span className="font-mono">{party.gstin}</span></span>}
            </p>
          </div>

          {/* Balance Pill */}
          <div className="text-left sm:text-right">
            <span className="text-[11px] font-medium text-[#566B69] dark:text-[#8FA8A4] block">
              Outstanding Khata Balance
            </span>
            <span
              className={`text-xl font-black ${
                isDue
                  ? 'text-rose-600 dark:text-rose-400'
                  : isAdvance
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              {formatCurrency(Math.abs(currentBalanceMinor))}
              <span className="text-xs ml-1 font-semibold">
                {isDue ? '(Due)' : isAdvance ? '(Advance)' : '(Settled)'}
              </span>
            </span>
          </div>
        </div>

        {/* Quick Action Bar */}
        <div className="flex flex-wrap items-center gap-2">
          {party.phone && isDue && (
            <button
              type="button"
              onClick={handleSendWhatsAppReminder}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-2xs transition-colors"
            >
              <MessageSquare className="w-4 h-4 fill-white" />
              <span>Send WhatsApp Reminder</span>
            </button>
          )}

          {party.phone && (
            <a
              href={`tel:${party.phone}`}
              className="px-3.5 py-2 bg-white dark:bg-[#112322] border border-[#D7E5E2] dark:border-[#1E3B38] text-[#123B3A] dark:text-[#F0FDFA] hover:bg-[#F4F8F7] rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-[#0F766E]" />
              <span>Call Customer</span>
            </a>
          )}

          <button
            type="button"
            onClick={handlePrintStatement}
            className="px-3.5 py-2 bg-white dark:bg-[#112322] border border-[#D7E5E2] dark:border-[#1E3B38] text-[#123B3A] dark:text-[#F0FDFA] hover:bg-[#F4F8F7] rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Print Statement</span>
          </button>
        </div>

        {/* Ledger Transactions Table */}
        <div className="border border-[#D7E5E2] dark:border-[#1E3B38] rounded-xl overflow-hidden shadow-2xs">
          <div className="p-3 bg-[#F4F8F7]/80 dark:bg-[#142B2A]/80 border-b border-[#D7E5E2] dark:border-[#1E3B38] flex items-center justify-between">
            <h4 className="text-xs font-bold text-[#123B3A] dark:text-[#F0FDFA] flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-[#0F766E]" />
              <span>Transaction History & Dues Timeline</span>
            </h4>
            <span className="text-[11px] text-[#566B69] dark:text-[#8FA8A4]">
              {ledgerEntries.length} entries
            </span>
          </div>

          {isLoading ? (
            <div className="p-8 text-center text-xs text-[#566B69] dark:text-[#8FA8A4]">
              Loading ledger transactions...
            </div>
          ) : ledgerEntries.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#566B69] dark:text-[#8FA8A4]">
              No transactions recorded for this customer yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#D7E5E2] dark:border-[#1E3B38] text-[10px] font-bold uppercase tracking-wider text-[#566B69] dark:text-[#8FA8A4] bg-white dark:bg-[#112322]">
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Ref / Invoice #</th>
                    <th className="py-2.5 px-3 text-right">Debit (₹)</th>
                    <th className="py-2.5 px-3 text-right">Credit (₹)</th>
                    <th className="py-2.5 px-3">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D7E5E2] dark:divide-[#1E3B38]">
                  {ledgerEntries.map((row) => (
                    <tr
                      key={row.id}
                      className="hover:bg-[#F4F8F7] dark:hover:bg-[#142B2A] transition-colors"
                    >
                      <td className="py-2.5 px-3 whitespace-nowrap text-[#566B69] dark:text-[#8FA8A4]">
                        {formatDateReadable(row.date)}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        {row.type === 'INVOICE' ? (
                          <span className="inline-flex items-center gap-1 font-bold text-rose-600 dark:text-rose-400">
                            <ArrowUpRight className="w-3 h-3" />
                            <span>Bill (Debit)</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                            <ArrowDownLeft className="w-3 h-3" />
                            <span>Receipt (Credit)</span>
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap font-mono font-semibold text-[#123B3A] dark:text-[#F0FDFA]">
                        {row.refNumber}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap text-right font-bold text-rose-600 dark:text-rose-400">
                        {row.debitMinor > 0 ? formatCurrency(row.debitMinor) : '—'}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap text-right font-bold text-emerald-600 dark:text-emerald-400">
                        {row.creditMinor > 0 ? formatCurrency(row.creditMinor) : '—'}
                      </td>
                      <td className="py-2.5 px-3 text-[#566B69] dark:text-[#8FA8A4] max-w-xs truncate">
                        {row.notes || row.status || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-2 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
