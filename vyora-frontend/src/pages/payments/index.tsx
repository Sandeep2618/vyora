import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, CreditCard, Filter, X } from 'lucide-react';
import { api } from '@/lib/api';
import { formatCurrency, majorToMinor } from '@vyora/utils';
import { Party, PaymentRecord, PaymentMethod, PaymentType } from '@vyora/shared-types';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { Select } from '@/components/ui/Select';
import { EmptyState } from '@/components/ui/EmptyState';
import { toast } from '@/components/ui/Toast';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import { PaymentsTable } from './components';
import { RecordVoucherModal } from './modal';

export const PaymentsPage: React.FC = () => {
  const { isOwner } = useAuth();
  const { t } = useTranslation(['payments', 'common']);
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'RECEIPT' | 'PAYMENT'>('ALL');
  const [methodFilter, setMethodFilter] = useState<string>('ALL');
  const [showFilters, setShowFilters] = useState(false);

  // Form State
  const [type, setType] = useState<PaymentType>('RECEIPT');
  const [partyId, setPartyId] = useState('');
  const [amountMajor, setAmountMajor] = useState<number | string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('BANK_TRANSFER');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [paymentDate, setPaymentDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const { data: parties } = useQuery<{ items: Party[] }>({
    queryKey: ['parties', type === 'RECEIPT' ? 'CUSTOMER' : 'SUPPLIER'],
    queryFn: () => api.get(`/parties?type=${type === 'RECEIPT' ? 'CUSTOMER' : 'SUPPLIER'}`),
  });

  const { data: paymentsData, isLoading } = useQuery<{ items: PaymentRecord[]; total: number }>({
    queryKey: ['payments'],
    queryFn: () => api.get('/payments'),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      api.post('/payments', {
        type,
        partyId,
        amountMinor: majorToMinor(Number(amountMajor) || 0),
        paymentMethod,
        referenceNumber: referenceNumber || undefined,
        paymentDate,
        notes: notes || undefined,
        idempotencyKey: `pay-${partyId}-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      }),
    onSuccess: () => {
      setIsModalOpen(false);
      setPartyId('');
      setAmountMajor('');
      setReferenceNumber('');
      setNotes('');
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['parties'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
      toast.success(
        type === 'RECEIPT' ? 'Receipt Voucher Recorded' : 'Payment Voucher Recorded',
        `₹${(Number(amountMajor) || 0).toFixed(2)} recorded in party ledger.`
      );
    },
    onError: (err: any) => {
      toast.error('Failed to Record Voucher', err?.response?.data?.message || err?.message || 'Could not record payment.');
    },
  });

  // Client-side filtering by type and method
  const filteredPayments = useMemo(() => {
    if (!paymentsData?.items) return [];

    return paymentsData.items.filter((p) => {
      let matchesType = true;
      if (typeFilter !== 'ALL') {
        matchesType = p.type === typeFilter;
      }
      const matchesMethod = methodFilter === 'ALL' || p.paymentMethod === methodFilter;
      return matchesType && matchesMethod;
    });
  }, [paymentsData?.items, typeFilter, methodFilter]);

  const hasActiveFilters = typeFilter !== 'ALL' || methodFilter !== 'ALL';

  const clearAllFilters = () => {
    setTypeFilter('ALL');
    setMethodFilter('ALL');
  };

  const partyOptions = [
    { label: '-- Choose Party --', value: '' },
    ...(parties?.items.map((p) => ({
      label: `${p.name} (${p.phone}) — Balance: ${formatCurrency(Math.abs(p.currentBalanceMinor))}`,
      value: p.id,
    })) || []),
  ];

  const headerActions = (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={() => setShowFilters((prev) => !prev)}
        className={`h-8.5 px-2.5 rounded-lg text-xs font-semibold border transition-colors flex items-center gap-1.5 cursor-pointer ${
          showFilters || hasActiveFilters
            ? 'bg-[#E6F4F2] dark:bg-[#162E2D] border-[#0F766E] text-[#0F766E] dark:text-[#14B8A6]'
            : 'bg-white dark:bg-[#112322] border-[#D7E5E2] dark:border-[#1E3B38] text-[#566B69] dark:text-[#8FA8A4] hover:text-[#123B3A] dark:hover:text-[#F0FDFA]'
        }`}
        title={t('actions.filter', { ns: 'common' })}
      >
        <Filter className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">{t('actions.filter', { ns: 'common' })}</span>
        {hasActiveFilters && (
          <span className="w-2 h-2 rounded-full bg-[#0F766E] dark:bg-[#14B8A6]" />
        )}
      </button>

      {hasActiveFilters && (
        <button
          type="button"
          onClick={clearAllFilters}
          className="h-8.5 px-2.5 text-xs font-medium text-[#B91C1C] dark:text-rose-400 hover:bg-[#FEF2F2] dark:hover:bg-rose-950/40 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
          title={t('actions.reset', { ns: 'common' })}
        >
          <X className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{t('actions.reset', { ns: 'common' })}</span>
        </button>
      )}
    </div>
  );

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Header */}
      <PageHeader
        title={t('title')}
        description={t('subtitle')}
      >
        {isOwner && (
          <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-1.5 w-full sm:w-auto shadow-sm">
            <Plus className="w-4 h-4" />
            <span>{t('button.recordVoucher')}</span>
          </Button>
        )}
      </PageHeader>

      {/* Filter Toolbar Drawer */}
      {showFilters && (
        <div className="p-3.5 bg-[#F4F8F7] dark:bg-[#162E2D] border border-[#D7E5E2] dark:border-[#1E3B38] rounded-xl grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in fade-in">
          <Select
            label={t('filter.voucherType', { defaultValue: 'Voucher Type' })}
            value={typeFilter}
            onValueChange={(val) => setTypeFilter(val as any)}
            options={[
              { label: t('filter.all'), value: 'ALL' },
              { label: t('filter.receipt'), value: 'RECEIPT' },
              { label: t('filter.payment'), value: 'PAYMENT' },
            ]}
          />

          <Select
            label={t('filter.paymentMethod', { defaultValue: 'Payment Method' })}
            value={methodFilter}
            onValueChange={setMethodFilter}
            options={[
              { label: t('filter.allMethods'), value: 'ALL' },
              { label: t('filter.bankTransfer'), value: 'BANK_TRANSFER' },
              { label: t('filter.upi'), value: 'UPI' },
              { label: t('filter.cash'), value: 'CASH' },
              { label: t('filter.cheque'), value: 'CHEQUE' },
            ]}
          />
        </div>
      )}

      {/* Payments Content */}
      {isLoading ? (
        <div className="py-12 text-center text-xs text-[#566B69] dark:text-[#8FA8A4]">
          {t('status.loading', { ns: 'common' })}
        </div>
      ) : !paymentsData?.items?.length && !hasActiveFilters ? (
        <EmptyState
          icon={CreditCard}
          title={t('empty.title')}
          description={t('empty.description')}
          actionLabel={isOwner ? t('empty.action') : undefined}
          onAction={isOwner ? () => setIsModalOpen(true) : undefined}
        />
      ) : (
        <PaymentsTable payments={filteredPayments} headerActions={headerActions} />
      )}

      {/* Record Payment Voucher Modal */}
      <RecordVoucherModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        type={type}
        onTypeChange={setType}
        partyId={partyId}
        onPartyIdChange={setPartyId}
        partyOptions={partyOptions}
        amountMajor={amountMajor}
        onAmountChange={setAmountMajor}
        paymentMethod={paymentMethod}
        onPaymentMethodChange={setPaymentMethod}
        paymentDate={paymentDate}
        onPaymentDateChange={setPaymentDate}
        referenceNumber={referenceNumber}
        onReferenceNumberChange={setReferenceNumber}
        notes={notes}
        onNotesChange={setNotes}
        onSubmit={() => createMutation.mutate()}
        isSubmitting={createMutation.isPending}
      />
    </div>
  );
};

export default PaymentsPage;
