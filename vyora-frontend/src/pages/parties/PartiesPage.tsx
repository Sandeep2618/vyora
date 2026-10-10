import React, { useState, useMemo } from 'react';
import { Plus, Filter, X } from 'lucide-react';
import { PartyType } from '../../types';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { PageHeader } from '../../components/ui/PageHeader';
import { SearchInput } from '../../components/ui/SearchInput';
import { useParties } from '../../hooks/useParties';
import { PartyTable } from './PartyTable';
import { PartyFormModal } from './PartyFormModal';

export const PartiesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<PartyType>('CUSTOMER');
  const [search, setSearch] = useState('');
  const [balanceFilter, setBalanceFilter] = useState<'ALL' | 'DUE' | 'SETTLED'>('ALL');
  const [stateFilter, setStateFilter] = useState<string>('ALL');
  const [showFilters, setShowFilters] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, isLoading } = useParties({ type: activeTab });

  const isCustomer = activeTab === 'CUSTOMER';
  const label = isCustomer ? 'Customer' : 'Supplier';
  const pluralLabel = isCustomer ? 'Customers' : 'Suppliers';

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
      // Search
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        party.name.toLowerCase().includes(q) ||
        party.phone.toLowerCase().includes(q) ||
        (party.gstin && party.gstin.toLowerCase().includes(q)) ||
        (party.billingAddress?.city && party.billingAddress.city.toLowerCase().includes(q));

      // Balance status
      let matchesBalance = true;
      if (balanceFilter === 'DUE') {
        matchesBalance = party.currentBalanceMinor > 0;
      } else if (balanceFilter === 'SETTLED') {
        matchesBalance = party.currentBalanceMinor <= 0;
      }

      // State filter
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
        title={pluralLabel}
        description={`Manage your ${label.toLowerCase()} accounts, contact info, and balance ledgers`}
      >
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-1.5 w-full sm:w-auto justify-center">
          <Plus className="w-4 h-4" />
          <span>Add {label}</span>
        </Button>
      </PageHeader>

      <Card className="p-3.5 sm:p-5 space-y-4">
        {/* Responsive Toolbar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1 bg-[#F4F8F7] p-1 rounded-xl border border-[#D7E5E2]">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('CUSTOMER');
                  clearAllFilters();
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  activeTab === 'CUSTOMER'
                    ? 'bg-[#0F766E] text-white shadow-2xs'
                    : 'text-[#566B69] hover:text-[#123B3A]'
                }`}
              >
                Customers
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('SUPPLIER');
                  clearAllFilters();
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  activeTab === 'SUPPLIER'
                    ? 'bg-[#0F766E] text-white shadow-2xs'
                    : 'text-[#566B69] hover:text-[#123B3A]'
                }`}
              >
                Suppliers
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors flex items-center gap-1.5 ${
                showFilters || balanceFilter !== 'ALL' || stateFilter !== 'ALL'
                  ? 'bg-[#E6F4F2] border-[#0F766E] text-[#0F766E]'
                  : 'bg-[#F4F8F7] border-[#D7E5E2] text-[#566B69] hover:text-[#123B3A]'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filters</span>
              {(balanceFilter !== 'ALL' || stateFilter !== 'ALL') && (
                <span className="w-2 h-2 rounded-full bg-[#0F766E]" />
              )}
            </button>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="px-2.5 py-1.5 text-xs font-medium text-[#B91C1C] hover:bg-[#FEF2F2] rounded-lg transition-colors flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>

          <div className="w-full lg:w-72 shrink-0">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder={`Search ${label.toLowerCase()} name, phone, GSTIN...`}
            />
          </div>
        </div>

        {/* Filter Toolbar Drawer */}
        {showFilters && (
          <div className="p-3.5 bg-[#F4F8F7] border border-[#D7E5E2] rounded-xl grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in fade-in">
            {/* Balance Status */}
            <div>
              <label className="block text-[11px] font-semibold text-[#123B3A] mb-1">
                Ledger Balance Status
              </label>
              <select
                value={balanceFilter}
                onChange={(e) => setBalanceFilter(e.target.value as any)}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#D7E5E2] rounded-lg text-[#123B3A] focus:outline-none focus:border-[#0F766E]"
              >
                <option value="ALL">All Accounts</option>
                <option value="DUE">⚠️ Has Outstanding Balance (Due &gt; 0)</option>
                <option value="SETTLED">✅ Settled / Advance (₹0 or Credit)</option>
              </select>
            </div>

            {/* State Filter */}
            <div>
              <label className="block text-[11px] font-semibold text-[#123B3A] mb-1">
                State Location
              </label>
              <select
                value={stateFilter}
                onChange={(e) => setStateFilter(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#D7E5E2] rounded-lg text-[#123B3A] focus:outline-none focus:border-[#0F766E]"
              >
                <option value="ALL">All States</option>
                {availableStates.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        <PartyTable
          parties={filteredParties}
          isLoading={isLoading}
          partyType={activeTab}
          hasActiveFilters={hasActiveFilters}
          onResetFilters={clearAllFilters}
          onAddFirst={() => setIsModalOpen(true)}
        />
      </Card>

      <PartyFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        partyType={activeTab}
      />
    </div>
  );
};
