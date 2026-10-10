import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Users, Phone, Mail, MapPin } from 'lucide-react';
import { api } from '../../lib/api';
import { formatCurrency } from '@vyora/utils';
import { Party, PartyType } from '@vyora/shared-types';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';

export const PartiesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<PartyType>('CUSTOMER');
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [gstin, setGstin] = useState('');
  const [line1, setLine1] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Maharashtra');
  const [pincode, setPincode] = useState('400001');

  const { data, isLoading } = useQuery<{ items: Party[]; total: number }>({
    queryKey: ['parties', activeTab, search],
    queryFn: () => {
      const q = new URLSearchParams();
      if (activeTab) q.set('type', activeTab);
      if (search) q.set('search', search);
      return api.get(`/parties?${q.toString()}`);
    },
  });

  const createMutation = useMutation({
    mutationFn: () =>
      api.post('/parties', {
        type: activeTab,
        name,
        phone,
        email: email || undefined,
        gstin: gstin || undefined,
        billingAddress: {
          line1,
          city,
          state,
          pincode,
        },
      }),
    onSuccess: () => {
      setIsModalOpen(false);
      setName('');
      setPhone('');
      setEmail('');
      setGstin('');
      setLine1('');
      setCity('');
      queryClient.invalidateQueries({ queryKey: ['parties'] });
    },
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#123B3A]">
            {activeTab === 'CUSTOMER' ? 'Customers' : 'Suppliers'}
          </h2>
          <p className="text-xs sm:text-sm text-[#566B69] mt-0.5">
            Manage your customer accounts, supplier contacts, and balance ledgers
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-1.5">
            <Plus className="w-4 h-4" />
            <span>Add {activeTab === 'CUSTOMER' ? 'Customer' : 'Supplier'}</span>
          </Button>
        </div>
      </div>

      {/* Tabs and Search */}
      <div className="bg-white border border-[#D7E5E2] rounded-xl p-4 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 bg-[#F4F8F7] p-1 rounded-lg border border-[#D7E5E2]">
            <button
              onClick={() => setActiveTab('CUSTOMER')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                activeTab === 'CUSTOMER'
                  ? 'bg-[#0F766E] text-white shadow-2xs'
                  : 'text-[#566B69] hover:text-[#123B3A]'
              }`}
            >
              Customers
            </button>
            <button
              onClick={() => setActiveTab('SUPPLIER')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                activeTab === 'SUPPLIER'
                  ? 'bg-[#0F766E] text-white shadow-2xs'
                  : 'text-[#566B69] hover:text-[#123B3A]'
              }`}
            >
              Suppliers
            </button>
          </div>

          <div className="relative max-w-xs w-full">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#566B69]" />
            <input
              type="text"
              placeholder="Search name, phone, or GSTIN..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#F4F8F7] border border-[#D7E5E2] rounded-lg text-[#123B3A] focus:outline-none focus:border-[#0F766E] focus:bg-white"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#D7E5E2] text-[#566B69] font-semibold bg-[#F4F8F7]/50">
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">GSTIN</th>
                <th className="py-3 px-4 text-right">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D7E5E2]">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-[#566B69]">
                    Loading records...
                  </td>
                </tr>
              ) : data?.items && data.items.length > 0 ? (
                data.items.map((party) => (
                  <tr key={party.id} className="hover:bg-[#F4F8F7]/60 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-[#123B3A]">
                      {party.name}
                      {party.contactPerson && (
                        <p className="text-[10px] text-[#566B69] font-normal">
                          Attn: {party.contactPerson}
                        </p>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-[#566B69]">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-[#0F766E]" />
                        <span>{party.phone}</span>
                      </div>
                      {party.email && (
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Mail className="w-3 h-3 text-[#566B69]" />
                          <span>{party.email}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-[#566B69]">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 text-[#566B69]" />
                        <span>
                          {party.billingAddress.city}, {party.billingAddress.state}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[#566B69]">
                      {party.gstin || '-'}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold">
                      <span
                        className={
                          party.currentBalanceMinor > 0
                            ? 'text-[#B91C1C]' // Customer owes business (receivable)
                            : party.currentBalanceMinor < 0
                            ? 'text-[#A16207]' // Business owes supplier (payable)
                            : 'text-[#15803D]'
                        }
                      >
                        {formatCurrency(Math.abs(party.currentBalanceMinor))}
                        <span className="text-[10px] ml-1 font-normal">
                          {party.currentBalanceMinor > 0 ? 'Due' : party.currentBalanceMinor < 0 ? 'Payable' : 'Settled'}
                        </span>
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-[#566B69]">
                    No records found. Click "Add" to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Add ${activeTab === 'CUSTOMER' ? 'Customer' : 'Supplier'}`}
        description="Enter contact details and billing address"
      >
        <div className="space-y-4">
          <Input
            label="Legal / Trade Name *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Reliance Retail"
            required
          />
          <Input
            label="Phone Number *"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="e.g. 9820012345"
            required
          />
          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="billing@partner.com"
          />
          <Input
            label="GSTIN (Optional)"
            value={gstin}
            onChange={(e) => setGstin(e.target.value.toUpperCase())}
            placeholder="27ABCDE1234F1Z5"
          />
          <Input
            label="Address Line 1 *"
            value={line1}
            onChange={(e) => setLine1(e.target.value)}
            placeholder="Street address / Shop No."
            required
          />
          <div className="grid grid-cols-3 gap-2">
            <Input
              label="City *"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Mumbai"
              required
            />
            <Input
              label="State *"
              value={state}
              onChange={(e) => setState(e.target.value)}
              placeholder="Maharashtra"
              required
            />
            <Input
              label="Pincode *"
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              placeholder="400001"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              isLoading={createMutation.isPending}
              disabled={!name.trim() || !phone.trim() || !line1.trim() || !city.trim()}
              onClick={() => createMutation.mutate()}
            >
              Save Record
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
