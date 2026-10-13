import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, CreditCard } from 'lucide-react';
import { api } from '@/lib/api';
import { formatCurrency, majorToMinor } from '@vyora/utils';
import { Party, PaymentRecord, PaymentMethod, PaymentType } from '@vyora/shared-types';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { toast } from '@/components/ui/Toast';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import { PaymentsFilterToolbar, PaymentsTable } from './components';
import { RecordVoucherModal } from './modal';

export const PaymentsPage: React.FC = () => {
  const { isOwner } = useAuth();
  const { t } = useTranslation(['payments', 'common']);
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');
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

  // Client-side filtering
  const filteredPayments = useMemo(() => {
    if (!paymentsData?.items) return [];

    return paymentsData.items.filter((p) => {
      let matchesType = true;
      if (typeFilter !== 'ALL') {
        matchesType = p.type === typeFilter;
      }
      const matchesMethod = methodFilter === 'ALL' || p.paymentMethod === methodFilter;
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.paymentNumber.toLowerCase().includes(q) ||
        p.partyName.toLowerCase().includes(q) ||
        (p.referenceNumber && p.referenceNumber.toLowerCase().includes(q));

      return matchesType && matchesMethod && matchesSearch;
    });
  }, [paymentsData?.items, typeFilter, methodFilter, search]);

  const hasActiveFilters = typeFilter !== 'ALL' || methodFilter !== 'ALL' || search !== '';
  const showToolbar = (paymentsData?.items && paymentsData.items.length > 0) || hasActiveFilters;

  const clearAllFilters = () => {
    setTypeFilter('ALL');
    setMethodFilter('ALL');
    setSearch('');
  };

  const partyOptions = [
    { label: '-- Choose Party --', value: '' },
    ...(parties?.items.map((p) => ({
      label: `${p.name} (${p.phone}) — Balance: ${formatCurrency(Math.abs(p.currentBalanceMinor))}`,
      value: p.id,
    })) || []),
  ];

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
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

      {/* Payments Table Card */}
      <Card className="p-3.5 sm:p-5 space-y-4">
        {isLoading ? (
          <div className="py-12 text-center text-xs text-[#566B69] dark:text-[#8FA8A4]">
            {t('status.loading', { ns: 'common' })}
          </div>
        ) : !showToolbar ? (
          <EmptyState
            icon={CreditCard}
            title={t('empty.title')}
            description={t('empty.description')}
            actionLabel={isOwner ? t('empty.action') : undefined}
            onAction={isOwner ? () => setIsModalOpen(true) : undefined}
          />
        ) : (
          <>
            <PaymentsFilterToolbar
              search={search}
              onSearchChange={setSearch}
              typeFilter={typeFilter}
              onTypeFilterChange={setTypeFilter}
              methodFilter={methodFilter}
              onMethodFilterChange={setMethodFilter}
              showFilters={showFilters}
              onToggleFilters={() => setShowFilters(!showFilters)}
              onClearFilters={clearAllFilters}
              hasActiveFilters={hasActiveFilters}
              totalCount={filteredPayments.length}
            />
            <PaymentsTable payments={filteredPayments} />
          </>
        )}
      </Card>

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
