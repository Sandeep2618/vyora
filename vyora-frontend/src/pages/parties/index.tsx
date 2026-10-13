import React, { useState, useMemo } from 'react';
import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Party, PartyType } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { useAuth } from '@/context/AuthContext';
import { useParties, useDeleteParty } from '@/hooks/useParties';
import { BalanceFilter } from './config';
import { PartyFilterToolbar, PartyTable } from './components';
import { PartyFormModal, DeletePartyModal } from './modal';

export const PartiesPage: React.FC = () => {
  const { isOwner } = useAuth();
  const { t } = useTranslation(['parties', 'common']);
  const [activeTab, setActiveTab] = useState<PartyType>('CUSTOMER');
  const [search, setSearch] = useState('');
  const [balanceFilter, setBalanceFilter] = useState<BalanceFilter>('ALL');
  const [stateFilter, setStateFilter] = useState<string>('ALL');
  const [showFilters, setShowFilters] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [partyToEdit, setPartyToEdit] = useState<Party | null>(null);
  const [partyToDelete, setPartyToDelete] = useState<Party | null>(null);

  const { data, isLoading } = useParties({ type: activeTab });
  const deleteMutation = useDeleteParty();

  const isCustomer = activeTab === 'CUSTOMER';

  // Extract unique states for dropdown filter
  const availableStates = useMemo(() => {
    if (!data?.items) return [];
    const set = new Set<string>();
    data.items.forEach((p) => {
      if (p.billingAddress?.state) set.add(p.billingAddress.state);
    });
    return Array.from(set).sort();
  }, [data?.items]);

  // Client-side instant filtering
  const filteredParties = useMemo(() => {
    if (!data?.items) return [];

    return data.items.filter((party) => {
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        party.name.toLowerCase().includes(q) ||
        party.phone.toLowerCase().includes(q) ||
        (party.gstin && party.gstin.toLowerCase().includes(q)) ||
        (party.billingAddress?.city && party.billingAddress.city.toLowerCase().includes(q));

      let matchesBalance = true;
      if (balanceFilter === 'DUE') {
        matchesBalance = party.currentBalanceMinor > 0;
      } else if (balanceFilter === 'SETTLED') {
        matchesBalance = party.currentBalanceMinor <= 0;
      }

      const matchesState = stateFilter === 'ALL' || party.billingAddress?.state === stateFilter;

      return matchesSearch && matchesBalance && matchesState;
    });
  }, [data?.items, search, balanceFilter, stateFilter]);

  const hasActiveFilters = balanceFilter !== 'ALL' || stateFilter !== 'ALL' || search !== '';

  const clearAllFilters = () => {
    setSearch('');
    setBalanceFilter('ALL');
    setStateFilter('ALL');
  };

  return (
    <div className="space-y-4 sm:space-y-5 max-w-7xl mx-auto">
      <PageHeader
        title={t('title')}
        description={t('subtitle')}
      >
        {isOwner && (
          <Button
            onClick={() => {
              setPartyToEdit(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-1.5 w-full sm:w-auto justify-center shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>{isCustomer ? t('actions.addCustomer', { ns: 'common' }) : t('actions.addSupplier', { ns: 'common' })}</span>
          </Button>
        )}
      </PageHeader>

      <Card className="p-3.5 sm:p-5 space-y-4">
        <PartyFilterToolbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          search={search}
          setSearch={setSearch}
          balanceFilter={balanceFilter}
          setBalanceFilter={setBalanceFilter}
          stateFilter={stateFilter}
          setStateFilter={setStateFilter}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          availableStates={availableStates}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={clearAllFilters}
        />

        <PartyTable
          parties={filteredParties}
          isLoading={isLoading}
          partyType={activeTab}
          hasActiveFilters={hasActiveFilters}
          isOwner={isOwner}
          onResetFilters={clearAllFilters}
          onEdit={(party) => {
            setPartyToEdit(party);
            setIsModalOpen(true);
          }}
          onDelete={(party) => setPartyToDelete(party)}
          onAddFirst={() => {
            setPartyToEdit(null);
            setIsModalOpen(true);
          }}
        />
      </Card>

      {/* Add / Edit Party Modal */}
      <PartyFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setPartyToEdit(null);
        }}
        partyType={activeTab}
        partyToEdit={partyToEdit}
      />

      {/* Delete Confirmation Modal */}
      <DeletePartyModal
        party={partyToDelete}
        onClose={() => setPartyToDelete(null)}
        onConfirm={() => {
          if (partyToDelete) {
            deleteMutation.mutate(partyToDelete.id, {
              onSuccess: () => setPartyToDelete(null),
            });
          }
        }}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};

export default PartiesPage;
