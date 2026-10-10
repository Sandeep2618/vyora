import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Save, UserPlus, Shield, History, Building2, Sparkles, ExternalLink, AlertCircle, CheckCircle2 } from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { SubscriptionPlan } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';

export const SettingsPage: React.FC = () => {
  const { user, business, refreshBusiness, isOwner, plan, updateSubscriptionPlan } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'PROFILE' | 'PLANS' | 'STAFF' | 'AUDIT'>('PROFILE');
  const [planSuccessMsg, setPlanSuccessMsg] = useState<string | null>(null);
  const [isSwitchingPlan, setIsSwitchingPlan] = useState(false);

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

  const handlePlanChange = async (targetPlan: SubscriptionPlan) => {
    try {
      setIsSwitchingPlan(true);
      await updateSubscriptionPlan(targetPlan);
      setPlanSuccessMsg(`Business subscription switched to ${targetPlan === 'enterprise' ? 'Business Pro' : targetPlan === 'growth' ? 'Growth' : 'Starter Free'}. Features updated instantly.`);
      setTimeout(() => setPlanSuccessMsg(null), 5000);
    } catch (err: any) {
      alert(err.message || 'Failed to update plan');
    } finally {
      setIsSwitchingPlan(false);
    }
  };

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
      <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-[#D7E5E2] shadow-2xs w-fit max-w-full overflow-x-auto">
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
          onClick={() => setActiveTab('PLANS')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
            activeTab === 'PLANS' ? 'bg-[#0F766E] text-white' : 'text-[#566B69] hover:text-[#123B3A]'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Subscription & Plans</span>
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

          {!isOwner && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>Staff Account: You have view-only access. Only business owners can modify business settings.</span>
            </div>
          )}

          {isOwner && (
            <div className="flex justify-end pt-4 border-t border-[#D7E5E2]">
              <Button
                isLoading={updateProfileMutation.isPending}
                onClick={() => updateProfileMutation.mutate()}
                className="w-full sm:w-auto"
              >
                <Save className="w-4 h-4 mr-1.5" />
                Save Settings
              </Button>
            </div>
          )}
        </div>
      )}

      {/* TAB: SUBSCRIPTION & PLANS */}
      {activeTab === 'PLANS' && (
        <div className="space-y-6">
          {planSuccessMsg && (
            <div className="p-3.5 bg-green-50 border border-green-200 rounded-xl text-xs sm:text-sm text-[#15803D] flex items-center gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <p className="flex-1 font-medium">{planSuccessMsg}</p>
              <button onClick={() => setPlanSuccessMsg(null)} className="text-[#15803D] font-bold">
                ✕
              </button>
            </div>
          )}

          <div className="bg-white border border-[#D7E5E2] rounded-xl p-6 shadow-2xs space-y-4">
            <div>
              <h3 className="text-base font-bold text-[#123B3A]">Subscription Tiers & Feature Gating</h3>
              <p className="text-xs text-[#566B69] mt-0.5">
                Features automatically adjust based on active tier. Owners can switch tiers anytime.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {/* 1. Starter */}
              <div
                className={`p-5 rounded-xl border flex flex-col justify-between transition-all ${
                  plan === 'starter'
                    ? 'border-[#0F766E] bg-teal-50/20 shadow-md ring-2 ring-[#0F766E]'
                    : 'border-[#D7E5E2] bg-white'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-base font-bold text-[#123B3A]">Starter</h4>
                    {plan === 'starter' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#0F766E] text-white">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#566B69] mb-3">For solo proprietors & basic counter sales</p>
                  <p className="text-2xl font-black text-[#123B3A] mb-4">
                    ₹0<span className="text-xs font-normal text-[#566B69]">/forever</span>
                  </p>

                  <ul className="text-xs text-[#566B69] space-y-2 mb-6">
                    <li>✓ Up to 50 GST Invoices / month</li>
                    <li>✓ Product catalog (100 items)</li>
                    <li>✓ Standard A4 PDF printing</li>
                    <li>✓ Basic Customer ledger balances</li>
                    <li className="text-gray-400">✗ Supplier purchases & payables</li>
                    <li className="text-gray-400">✗ Monthly GSTR tax reports</li>
                    <li className="text-gray-400">✗ Staff user delegation (1 user only)</li>
                  </ul>
                </div>

                {plan === 'starter' ? (
                  <Button size="sm" variant="outline" disabled className="w-full">
                    Current Active Plan
                  </Button>
                ) : isOwner ? (
                  <Button
                    size="sm"
                    variant="outline"
                    isLoading={isSwitchingPlan}
                    onClick={() => handlePlanChange('starter')}
                    className="w-full"
                  >
                    Switch to Starter
                  </Button>
                ) : (
                  <Button size="sm" variant="outline" disabled className="w-full">
                    Owner Only
                  </Button>
                )}
              </div>

              {/* 2. Growth */}
              <div
                className={`p-5 rounded-xl border flex flex-col justify-between relative transition-all ${
                  plan === 'growth'
                    ? 'border-[#0F766E] bg-teal-50/20 shadow-md ring-2 ring-[#0F766E]'
                    : 'border-[#0F766E]/40 bg-white'
                }`}
              >
                <span className="absolute -top-2.5 right-4 bg-[#0F766E] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                  Most Popular
                </span>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-base font-bold text-[#123B3A]">Growth</h4>
                    {plan === 'growth' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#0F766E] text-white">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#566B69] mb-3">For thriving retailers, wholesalers & traders</p>
                  <p className="text-2xl font-black text-[#0F766E] mb-4">
                    ₹499<span className="text-xs font-normal text-[#566B69]">/month</span>
                  </p>

                  <ul className="text-xs text-[#566B69] space-y-2 mb-6">
                    <li className="font-semibold text-[#123B3A]">✓ Unlimited GST Invoices & Bills</li>
                    <li className="font-semibold text-[#123B3A]">✓ Supplier purchases & payables</li>
                    <li className="font-semibold text-[#123B3A]">✓ Customer credit limits & receipts</li>
                    <li className="font-semibold text-[#123B3A]">✓ GSTR-1 & GSTR-3B tax reports</li>
                    <li className="font-semibold text-[#123B3A]">✓ Up to 3 Staff user accounts</li>
                    <li>✓ Automated low stock alerts</li>
                    <li className="text-gray-400">✗ Audited Stock adjustments</li>
                  </ul>
                </div>

                {plan === 'growth' ? (
                  <Button size="sm" variant="outline" disabled className="w-full">
                    Current Active Plan
                  </Button>
                ) : isOwner ? (
                  <Button
                    size="sm"
                    isLoading={isSwitchingPlan}
                    onClick={() => handlePlanChange('growth')}
                    className="w-full"
                  >
                    Switch to Growth
                  </Button>
                ) : (
                  <Button size="sm" variant="outline" disabled className="w-full">
                    Owner Only
                  </Button>
                )}
              </div>

              {/* 3. Business Pro */}
              <div
                className={`p-5 rounded-xl border flex flex-col justify-between transition-all ${
                  plan === 'enterprise'
                    ? 'border-purple-600 bg-purple-50/20 shadow-md ring-2 ring-purple-600'
                    : 'border-purple-200 bg-white'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-base font-bold text-[#123B3A]">Business Pro</h4>
                    {plan === 'enterprise' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-700 text-white">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#566B69] mb-3">For multi-counter outlets & high-volume merchants</p>
                  <p className="text-2xl font-black text-purple-700 mb-4">
                    ₹999<span className="text-xs font-normal text-[#566B69]">/month</span>
                  </p>

                  <ul className="text-xs text-[#566B69] space-y-2 mb-6">
                    <li className="font-semibold text-[#123B3A]">✓ Everything in Growth plan</li>
                    <li className="font-semibold text-purple-800">✓ Unlimited Staff accounts</li>
                    <li className="font-semibold text-purple-800">✓ Audited Stock Adjustment workflows</li>
                    <li className="font-semibold text-purple-800">✓ Complete financial audit trail</li>
                    <li>✓ Custom invoice prefixes & auto-padding</li>
                    <li>✓ Multi-device simultaneous access</li>
                    <li>✓ Priority WhatsApp & phone SLA</li>
                  </ul>
                </div>

                {plan === 'enterprise' ? (
                  <Button size="sm" variant="outline" disabled className="w-full">
                    Current Active Plan
                  </Button>
                ) : isOwner ? (
                  <Button
                    size="sm"
                    isLoading={isSwitchingPlan}
                    onClick={() => handlePlanChange('enterprise')}
                    className="w-full bg-purple-700 hover:bg-purple-800 text-white"
                  >
                    Switch to Business Pro
                  </Button>
                ) : (
                  <Button size="sm" variant="outline" disabled className="w-full">
                    Owner Only
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: STAFF & PERMISSIONS */}
      {activeTab === 'STAFF' && (
        <div className="bg-white border border-[#D7E5E2] rounded-xl p-6 shadow-2xs space-y-4">
          <div className="p-4 bg-[#E6F4F2] border border-[#A0D2CA] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-[#123B3A]">Full Team Roles & Switches Management</p>
              <p className="text-[11px] text-[#566B69] mt-0.5">
                Switch member roles between Owner (Full Access) and Staff (View Only) with individual toggle switches.
              </p>
            </div>
            <Button size="sm" onClick={() => navigate('/roles')} className="shrink-0">
              Open Team Roles Page
              <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </div>

          <div className="flex items-center justify-between pb-4 border-b border-[#D7E5E2]">
            <div>
              <h3 className="text-sm font-bold text-[#123B3A]">Authorized Staff Members</h3>
              <p className="text-xs text-[#566B69]">
                Backend enforces role permissions strictly on endpoints
              </p>
            </div>
            {isOwner && (
              <Button size="sm" onClick={() => setIsStaffModalOpen(true)}>
                <UserPlus className="w-3.5 h-3.5 mr-1" />
                Add Staff Member
              </Button>
            )}
          </div>

          <div className="overflow-x-auto -mx-1 sm:mx-0">
            <table className="w-full text-left text-xs min-w-[500px] whitespace-nowrap">
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

          <div className="overflow-x-auto -mx-1 sm:mx-0">
            <table className="w-full text-left text-xs min-w-[550px] whitespace-nowrap">
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
            label="Full Name"
            value={staffName}
            onChange={(e) => setStaffName(e.target.value)}
            placeholder="e.g. Priya Patel"
            required
          />
          <Input
            label="Email Address"
            type="email"
            value={staffEmail}
            onChange={(e) => setStaffEmail(e.target.value)}
            placeholder="priya@company.com"
            required
          />
          <div>
            <label className="block text-xs font-semibold text-[#123B3A] mb-1">Role <span className="text-[#B91C1C] font-bold">*</span></label>
            <select
              value={staffRole}
              onChange={(e) => setStaffRole(e.target.value as any)}
              className="w-full px-3 py-2 text-xs bg-white border border-[#D7E5E2] rounded-lg text-[#123B3A] focus:outline-none focus:border-[#0F766E]"
            >
              <option value="STAFF">Staff (Sales & Invoicing)</option>
              <option value="OWNER">Owner / Admin (Full Access)</option>
            </select>
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setIsStaffModalOpen(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button
              isLoading={addStaffMutation.isPending}
              disabled={!staffName.trim() || !staffEmail.trim()}
              onClick={() => addStaffMutation.mutate()}
              className="w-full sm:w-auto"
            >
              Add Staff
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
