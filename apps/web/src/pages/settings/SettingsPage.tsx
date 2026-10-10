import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Save, UserPlus, Shield, History, Building2 } from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';

export const SettingsPage: React.FC = () => {
  const { user, business, refreshBusiness } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'PROFILE' | 'STAFF' | 'AUDIT'>('PROFILE');

  // Business profile form state
  const [name, setName] = useState(business?.name || '');
  const [phone, setPhone] = useState(business?.phone || '');
  const [email, setEmail] = useState(business?.email || '');
  const [gstin, setGstin] = useState(business?.gstin || '');
  const [addressLine1, setAddressLine1] = useState(business?.addressLine1 || '');
  const [city, setCity] = useState(business?.city || '');
  const [state, setState] = useState(business?.state || 'Maharashtra');
  const [pincode, setPincode] = useState(business?.pincode || '400001');
  const [invoicePrefix, setInvoicePrefix] = useState(business?.invoicePrefix || 'INV-');
  const [invoicePadding, setInvoicePadding] = useState(business?.invoiceNumberPadding || 4);
  const [terms, setTerms] = useState(business?.termsAndConditions || '');

  // Staff Modal
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [staffName, setStaffName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffRole, setStaffRole] = useState<'STAFF' | 'OWNER'>('STAFF');

  // Queries
  const { data: staffList } = useQuery<{ items: any[] } | any[]>({
    queryKey: ['staff'],
    queryFn: () => api.get('/business/staff'),
    enabled: activeTab === 'STAFF',
  });

  const { data: auditLogs } = useQuery<{ items: any[]; total: number }>({
    queryKey: ['audit-logs'],
    queryFn: () => api.get('/audit/logs'),
    enabled: activeTab === 'AUDIT',
  });

  const updateProfileMutation = useMutation({
    mutationFn: () =>
      api.put('/business/current', {
        name,
        phone,
        email,
        gstin: gstin || undefined,
        addressLine1,
        city,
        state,
        pincode,
        invoicePrefix,
        invoiceNumberPadding: Number(invoicePadding),
        termsAndConditions: terms || undefined,
      }),
    onSuccess: async () => {
      await refreshBusiness();
      alert('Business profile updated successfully!');
    },
  });

  const addStaffMutation = useMutation({
    mutationFn: () =>
      api.post('/business/staff', {
        name: staffName,
        email: staffEmail,
        role: staffRole,
      }),
    onSuccess: () => {
      setIsStaffModalOpen(false);
      setStaffName('');
      setStaffEmail('');
      queryClient.invalidateQueries({ queryKey: ['staff'] });
    },
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-[#123B3A]">Settings & Administration</h2>
        <p className="text-xs sm:text-sm text-[#566B69] mt-0.5">
          Configure business identity, tax credentials, invoice sequencing, staff roles, and audit trail
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-[#D7E5E2] shadow-2xs w-fit">
        <button
          onClick={() => setActiveTab('PROFILE')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
            activeTab === 'PROFILE' ? 'bg-[#0F766E] text-white' : 'text-[#566B69] hover:text-[#123B3A]'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Business Profile</span>
        </button>
        <button
          onClick={() => setActiveTab('STAFF')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
            activeTab === 'STAFF' ? 'bg-[#0F766E] text-white' : 'text-[#566B69] hover:text-[#123B3A]'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Staff & Permissions</span>
        </button>
        <button
          onClick={() => setActiveTab('AUDIT')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
            activeTab === 'AUDIT' ? 'bg-[#0F766E] text-white' : 'text-[#566B69] hover:text-[#123B3A]'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Audit Log Trail</span>
        </button>
      </div>

      {/* TAB 1: BUSINESS PROFILE */}
      {activeTab === 'PROFILE' && (
        <div className="bg-white border border-[#D7E5E2] rounded-xl p-6 shadow-2xs space-y-6">
          <div className="border-b border-[#D7E5E2] pb-4">
            <h3 className="text-sm font-bold text-[#123B3A]">Business Identity & Address</h3>
            <p className="text-xs text-[#566B69]">These details appear on your printed tax invoices</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Business Trade Name *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              label="GSTIN (Optional)"
              value={gstin}
              onChange={(e) => setGstin(e.target.value.toUpperCase())}
              placeholder="27ABCDE1234F1Z5"
            />
            <Input
              label="Official Phone *"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
            <Input
              label="Billing Email *"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-4">
            <Input
              label="Address Line 1 *"
              value={addressLine1}
              onChange={(e) => setAddressLine1(e.target.value)}
              required
            />
            <div className="grid grid-cols-3 gap-3">
              <Input
                label="City *"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
              />
              <Input
                label="State *"
                value={state}
                onChange={(e) => setState(e.target.value)}
                required
              />
              <Input
                label="Pincode *"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="border-t border-[#D7E5E2] pt-6 space-y-4">
            <h3 className="text-sm font-bold text-[#123B3A]">Invoice Numbering & Defaults</h3>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Invoice Prefix"
                value={invoicePrefix}
                onChange={(e) => setInvoicePrefix(e.target.value)}
                helperText="Appended to sequence (e.g. INV-)"
              />
              <Input
                label="Digit Padding"
                type="number"
                min="1"
                max="8"
                value={invoicePadding}
                onChange={(e) => setInvoicePadding(parseInt(e.target.value, 10) || 4)}
                helperText="4 outputs INV-0001"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#123B3A] mb-1">
                Standard Terms & Conditions
              </label>
              <textarea
                rows={3}
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
                className="w-full p-3 text-xs bg-[#F4F8F7] border border-[#D7E5E2] rounded-lg text-[#123B3A] focus:outline-none focus:border-[#0F766E]"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-[#D7E5E2]">
            <Button
              isLoading={updateProfileMutation.isPending}
              onClick={() => updateProfileMutation.mutate()}
            >
              <Save className="w-4 h-4 mr-1.5" />
              Save Settings
            </Button>
          </div>
        </div>
      )}

      {/* TAB 2: STAFF & PERMISSIONS */}
      {activeTab === 'STAFF' && (
        <div className="bg-white border border-[#D7E5E2] rounded-xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-[#D7E5E2]">
            <div>
              <h3 className="text-sm font-bold text-[#123B3A]">Authorized Staff Members</h3>
              <p className="text-xs text-[#566B69]">
                Backend enforces role permissions strictly on endpoints
              </p>
            </div>
            <Button size="sm" onClick={() => setIsStaffModalOpen(true)}>
              <UserPlus className="w-3.5 h-3.5 mr-1" />
              Add Staff Member
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#D7E5E2] text-[#566B69] font-semibold bg-[#F4F8F7]/50">
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4 text-center">Assigned Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D7E5E2]">
                {Array.isArray(staffList) && staffList.map((st: any) => (
                  <tr key={st.id} className="hover:bg-[#F4F8F7]/60">
                    <td className="py-3.5 px-4 font-bold text-[#123B3A]">{st.name}</td>
                    <td className="py-3.5 px-4 text-[#566B69]">{st.email}</td>
                    <td className="py-3.5 px-4 text-center">
                      <Badge variant={st.role === 'OWNER' ? 'neutral' : 'pending'}>
                        {st.role}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: AUDIT LOG */}
      {activeTab === 'AUDIT' && (
        <div className="bg-white border border-[#D7E5E2] rounded-xl p-6 shadow-2xs space-y-4">
          <div className="pb-4 border-b border-[#D7E5E2]">
            <h3 className="text-sm font-bold text-[#123B3A]">System Audit History</h3>
            <p className="text-xs text-[#566B69]">
              Captures actor, action timestamp, and entity parameters for all financial events
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#D7E5E2] text-[#566B69] font-semibold bg-[#F4F8F7]/50">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Entity</th>
                  <th className="py-3 px-4">Actor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D7E5E2]">
                {auditLogs?.items?.map((log) => (
                  <tr key={log.id} className="hover:bg-[#F4F8F7]/60">
                    <td className="py-3.5 px-4 text-[#566B69]">
                      {new Date(log.createdAt).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-[#0F766E]">
                      {log.action}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-[#123B3A]">
                      {log.entityType} ({log.entityId.slice(-6)})
                    </td>
                    <td className="py-3.5 px-4 font-medium text-[#123B3A]">{log.userName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Staff Modal */}
      <Modal
        isOpen={isStaffModalOpen}
        onClose={() => setIsStaffModalOpen(false)}
        title="Invite Staff Member"
        description="Add a member with role-based access"
      >
        <div className="space-y-4">
          <Input
            label="Full Name *"
            value={staffName}
            onChange={(e) => setStaffName(e.target.value)}
            placeholder="e.g. Priya Patel"
            required
          />
          <Input
            label="Email Address *"
            type="email"
            value={staffEmail}
            onChange={(e) => setStaffEmail(e.target.value)}
            placeholder="priya@company.com"
            required
          />
          <div>
            <label className="block text-xs font-semibold text-[#123B3A] mb-1">Role *</label>
            <select
              value={staffRole}
              onChange={(e) => setStaffRole(e.target.value as any)}
              className="w-full px-3 py-2 text-xs bg-white border border-[#D7E5E2] rounded-lg text-[#123B3A] focus:outline-none focus:border-[#0F766E]"
            >
              <option value="STAFF">Staff (Sales & Invoicing)</option>
              <option value="OWNER">Owner / Admin (Full Access)</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setIsStaffModalOpen(false)}>
              Cancel
            </Button>
            <Button
              isLoading={addStaffMutation.isPending}
              disabled={!staffName.trim() || !staffEmail.trim()}
              onClick={() => addStaffMutation.mutate()}
            >
              Add Staff
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
