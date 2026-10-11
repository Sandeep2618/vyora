import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Building2,
  ShieldCheck,
  CreditCard,
  History,
  Save,
  UserPlus,
  Users,
  CheckCircle2,
  AlertCircle,
  QrCode,
  Sparkles,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  UserCheck,
  Mail,
  Phone,
  MapPin,
  FileText,
  BadgeCheck,
  Trash2,
} from 'lucide-react';
import { api } from '../../lib/api';
import { businessApi } from '../../api/business';
import { useAuth } from '../../context/AuthContext';
import { StaffMember, UserRole, SubscriptionPlan, BusinessProfile } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { PlanPurchaseModal } from '../../components/subscription/PlanPurchaseModal';
import { cn } from '../../lib/utils';
import { toast } from '../../components/ui/Toast';

export type AccountTabKey = 'PROFILE' | 'ROLES' | 'BILLING' | 'AUDIT';

export const AccountHubPage: React.FC = () => {
  const { user, business, refreshBusiness, isOwner, plan, updateSubscriptionPlan, updateStaffPermissions } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const initialTab = (searchParams.get('tab')?.toUpperCase() as AccountTabKey) || 'PROFILE';
  const [activeTab, setActiveTab] = useState<AccountTabKey>(initialTab);

  useEffect(() => {
    const tabParam = searchParams.get('tab')?.toUpperCase() as AccountTabKey;
    if (tabParam && ['PROFILE', 'ROLES', 'BILLING', 'AUDIT'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleTabChange = (tab: AccountTabKey) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  // --- PROFILE TAB STATE ---
  const [name, setName] = useState(business?.name || '');
  const [legalName, setLegalName] = useState(business?.legalName || '');
  const [phone, setPhone] = useState(business?.phone || '');
  const [email, setEmail] = useState(business?.email || '');
  const [gstin, setGstin] = useState(business?.gstin || '');
  const [pan, setPan] = useState(business?.pan || '');
  const [addressLine1, setAddressLine1] = useState(business?.addressLine1 || '');
  const [addressLine2, setAddressLine2] = useState(business?.addressLine2 || '');
  const [city, setCity] = useState(business?.city || '');
  const [state, setState] = useState(business?.state || 'Maharashtra');
  const [pincode, setPincode] = useState(business?.pincode || '400001');
  const [invoicePrefix, setInvoicePrefix] = useState(business?.invoicePrefix || 'INV-');
  const [invoicePadding, setInvoicePadding] = useState<number | string>(business?.invoiceNumberPadding || 4);
  const [purchasePrefix, setPurchasePrefix] = useState(business?.purchasePrefix || 'BILL-');
  const [terms, setTerms] = useState(business?.termsAndConditions || '');

  useEffect(() => {
    if (business) {
      setName(business.name || '');
      setLegalName(business.legalName || '');
      setPhone(business.phone || '');
      setEmail(business.email || '');
      setGstin(business.gstin || '');
      setPan(business.pan || '');
      setAddressLine1(business.addressLine1 || '');
      setAddressLine2(business.addressLine2 || '');
      setCity(business.city || '');
      setState(business.state || 'Maharashtra');
      setPincode(business.pincode || '400001');
      setInvoicePrefix(business.invoicePrefix || 'INV-');
      setInvoicePadding(business.invoiceNumberPadding || 4);
      setPurchasePrefix(business.purchasePrefix || 'BILL-');
      setTerms(business.termsAndConditions || '');
    }
  }, [business]);

  // --- ROLES & PERMISSIONS STATE ---
  const [permissions, setPermissions] = useState<Record<string, boolean>>({
    invoices: business?.staffPermissions?.invoices ?? true,
    parties: business?.staffPermissions?.parties ?? true,
    products: business?.staffPermissions?.products ?? true,
    inventory: business?.staffPermissions?.inventory ?? true,
    purchases: business?.staffPermissions?.purchases ?? true,
    payments: business?.staffPermissions?.payments ?? true,
    reports: business?.staffPermissions?.reports ?? false,
  });

  useEffect(() => {
    if (business?.staffPermissions) {
      setPermissions({
        invoices: business.staffPermissions.invoices ?? true,
        parties: business.staffPermissions.parties ?? true,
        products: business.staffPermissions.products ?? true,
        inventory: business.staffPermissions.inventory ?? true,
        purchases: business.staffPermissions.purchases ?? true,
        payments: business.staffPermissions.payments ?? true,
        reports: business.staffPermissions.reports ?? false,
      });
    }
  }, [business?.staffPermissions]);

  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [staffName, setStaffName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffRole, setStaffRole] = useState<UserRole>('STAFF');
  const [updatingMemberId, setUpdatingMemberId] = useState<string | null>(null);

  // --- BILLING TAB STATE ---
  const [isPlanPurchaseModalOpen, setIsPlanPurchaseModalOpen] = useState(false);
  const [selectedPlanForUpgrade, setSelectedPlanForUpgrade] = useState<SubscriptionPlan>('growth');

  // --- QUERIES ---
  const { data: staffList = [], isLoading: isLoadingStaff } = useQuery<StaffMember[]>({
    queryKey: ['business-staff'],
    queryFn: () => businessApi.getStaff(),
    enabled: activeTab === 'ROLES',
  });

  const { data: auditLogs, isLoading: isLoadingAudit } = useQuery<{ items: any[]; total: number }>({
    queryKey: ['audit-logs'],
    queryFn: () => api.get('/audit/logs'),
    enabled: activeTab === 'AUDIT',
  });

  // --- MUTATIONS ---
  const updateProfileMutation = useMutation({
    mutationFn: () =>
      businessApi.updateCurrent({
        name,
        legalName: legalName || undefined,
        phone,
        email,
        gstin: gstin || undefined,
        pan: pan || undefined,
        addressLine1,
        addressLine2: addressLine2 || undefined,
        city,
        state,
        pincode,
        invoicePrefix,
        invoiceNumberPadding: Number(invoicePadding) || 4,
        purchasePrefix,
        termsAndConditions: terms || undefined,
      }),
    onSuccess: async () => {
      await refreshBusiness();
      toast.success('Business and user profile saved successfully!');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to update business profile');
    },
  });

  const updatePermissionsMutation = useMutation({
    mutationFn: (updated: Record<string, boolean>) => updateStaffPermissions(updated),
    onSuccess: () => {
      toast.success('Staff module rights updated! Staff accounts will see changes immediately.');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to update staff permissions');
    },
  });

  const addStaffMutation = useMutation({
    mutationFn: () =>
      businessApi.addStaff({
        name: staffName,
        email: staffEmail,
        role: staffRole,
      }),
    onSuccess: () => {
      setIsStaffModalOpen(false);
      setStaffName('');
      setStaffEmail('');
      queryClient.invalidateQueries({ queryKey: ['business-staff'] });
      toast.success(`Staff member ${staffName} added successfully!`);
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to add staff member');
    },
  });

  const handleTogglePermission = (moduleKey: string) => {
    if (!isOwner) return;
    const updated = {
      ...permissions,
      [moduleKey]: !permissions[moduleKey],
    };
    setPermissions(updated);
    updatePermissionsMutation.mutate(updated);
  };

  const handleRoleToggle = async (member: StaffMember) => {
    if (!isOwner) return;
    if (member.isPrimaryOwner) {
      toast.error('The Primary Owner is permanently protected and cannot be demoted.');
      return;
    }
    const newRole: UserRole = member.role === 'OWNER' ? 'STAFF' : 'OWNER';
    try {
      setUpdatingMemberId(member.id);
      await businessApi.updateStaffRole(member.id, newRole);
      queryClient.invalidateQueries({ queryKey: ['business-staff'] });
      toast.success(`Updated ${member.name}'s role to ${newRole === 'OWNER' ? 'Owner (Full Access)' : 'Staff Member'}.`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update member role');
    } finally {
      setUpdatingMemberId(null);
    }
  };

  const handleRemoveStaff = async (member: StaffMember) => {
    if (member.isPrimaryOwner) {
      toast.error('Primary owner cannot be removed.');
      return;
    }
    if (!window.confirm(`Are you sure you want to remove ${member.name} from this business?`)) return;
    try {
      await businessApi.removeStaff(member.id);
      queryClient.invalidateQueries({ queryKey: ['business-staff'] });
      toast.success(`Member ${member.name} removed from business.`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to remove member');
    }
  };

  const MODULE_RIGHTS_METADATA = [
    {
      key: 'invoices',
      title: 'Sales Invoices & Billing',
      desc: 'Create counter bills, manage GST invoices, and track customer receivables.',
      icon: FileText,
    },
    {
      key: 'parties',
      title: 'Customers & Suppliers',
      desc: 'Access party directory, phone contacts, and outstanding ledger balances.',
      icon: Users,
    },
    {
      key: 'products',
      title: 'Products & Services Catalog',
      desc: 'Browse inventory catalog, prices, and stock quantities.',
      icon: Building2,
    },
    {
      key: 'inventory',
      title: 'Inventory Movements & Audit',
      desc: 'Track live stock movement history, adjustments, and reorder alerts.',
      icon: History,
    },
    {
      key: 'purchases',
      title: 'Purchase Bills & Vendors',
      desc: 'Record supplier purchase bills and receive incoming inventory.',
      icon: CreditCard,
    },
    {
      key: 'payments',
      title: 'Counter Payments & Receipts',
      desc: 'Record cash, UPI, and bank receipts with settlement tracking.',
      icon: BadgeCheck,
    },
    {
      key: 'reports',
      title: 'Financial Reports & Tax Summary',
      desc: 'View sales register, tax computation, customer dues, and financial summaries.',
      icon: Sparkles,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-[#D7E5E2] rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#0F766E] text-white flex items-center justify-center font-black text-2xl shadow-md">
            {business?.name ? business.name[0].toUpperCase() : 'V'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-[#123B3A]">{business?.name || 'Vyora Enterprise'}</h1>
              <Badge variant={plan === 'enterprise' ? 'paid' : plan === 'growth' ? 'neutral' : 'draft'}>
                {plan === 'enterprise' ? 'BUSINESS PRO' : plan === 'growth' ? 'GROWTH' : 'STARTER FREE'}
              </Badge>
            </div>
            <p className="text-xs text-[#566B69] mt-0.5">
              Signed in as <span className="font-semibold text-[#123B3A]">{user?.name}</span> ({user?.email}) •{' '}
              <span className="font-bold text-[#0F766E]">{isOwner ? 'Owner (Full Admin Access)' : 'Staff Member'}</span>
            </p>
          </div>
        </div>

        {isOwner && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedPlanForUpgrade('enterprise');
              setIsPlanPurchaseModalOpen(true);
            }}
            className="flex items-center gap-2 border-[#0F766E] text-[#0F766E] hover:bg-[#E6F4F2]"
          >
            <QrCode className="w-4 h-4" />
            <span>Renew / Upgrade via UPI</span>
          </Button>
        )}
      </div>

      {/* Navigation Tabs Bar */}
      <div className="flex border-b border-[#D7E5E2] bg-white rounded-t-xl px-4 pt-2 gap-2 overflow-x-auto">
        <button
          onClick={() => handleTabChange('PROFILE')}
          className={cn(
            'flex items-center gap-2 px-4 py-3 border-b-2 font-bold text-xs transition-colors shrink-0',
            activeTab === 'PROFILE'
              ? 'border-[#0F766E] text-[#0F766E]'
              : 'border-transparent text-[#566B69] hover:text-[#123B3A]',
          )}
        >
          <Building2 className="w-4 h-4" />
          <span>Business & User Profile</span>
        </button>

        <button
          onClick={() => handleTabChange('ROLES')}
          className={cn(
            'flex items-center gap-2 px-4 py-3 border-b-2 font-bold text-xs transition-colors shrink-0',
            activeTab === 'ROLES'
              ? 'border-[#0F766E] text-[#0F766E]'
              : 'border-transparent text-[#566B69] hover:text-[#123B3A]',
          )}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Roles & Module Rights</span>
        </button>

        <button
          onClick={() => handleTabChange('BILLING')}
          className={cn(
            'flex items-center gap-2 px-4 py-3 border-b-2 font-bold text-xs transition-colors shrink-0',
            activeTab === 'BILLING'
              ? 'border-[#0F766E] text-[#0F766E]'
              : 'border-transparent text-[#566B69] hover:text-[#123B3A]',
          )}
        >
          <CreditCard className="w-4 h-4" />
          <span>Billing & Plans</span>
        </button>

        <button
          onClick={() => handleTabChange('AUDIT')}
          className={cn(
            'flex items-center gap-2 px-4 py-3 border-b-2 font-bold text-xs transition-colors shrink-0',
            activeTab === 'AUDIT'
              ? 'border-[#0F766E] text-[#0F766E]'
              : 'border-transparent text-[#566B69] hover:text-[#123B3A]',
          )}
        >
          <History className="w-4 h-4" />
          <span>Audit Activity Log</span>
        </button>
      </div>

      {/* --- TAB 1: BUSINESS & USER PROFILE --- */}
      {activeTab === 'PROFILE' && (
        <div className="bg-white border border-[#D7E5E2] rounded-b-2xl p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-[#D7E5E2] pb-4">
            <div>
              <h2 className="text-base font-bold text-[#123B3A]">Business Profile & Billing Settings</h2>
              <p className="text-xs text-[#566B69] mt-0.5">Manage your legal tax identity, counter prefix, and default invoice terms.</p>
            </div>
            {isOwner && (
              <Button
                variant="primary"
                size="sm"
                isLoading={updateProfileMutation.isPending}
                onClick={() => updateProfileMutation.mutate()}
                className="flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Profile Changes</span>
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input
              label="Business Name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sharma Retail & Supplies"
              disabled={!isOwner}
            />

            <Input
              label="Legal Registered Name"
              value={legalName}
              onChange={(e) => setLegalName(e.target.value)}
              placeholder="e.g. Sharma Retail & Supplies Pvt. Ltd."
              disabled={!isOwner}
            />

            <Input
              label="Business Phone Number"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 9876543210"
              disabled={!isOwner}
            />

            <Input
              label="Contact Email Address"
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. billing@company.com"
              disabled={!isOwner}
            />

            <Input
              label="GSTIN (15 Digits)"
              value={gstin}
              onChange={(e) => setGstin(e.target.value.toUpperCase())}
              placeholder="e.g. 27AABCU9603R1ZM"
              disabled={!isOwner}
            />

            <Input
              label="Permanent Account Number (PAN)"
              value={pan}
              onChange={(e) => setPan(e.target.value.toUpperCase())}
              placeholder="e.g. AABCU9603R"
              disabled={!isOwner}
            />
          </div>

          <div className="border-t border-[#D7E5E2] pt-5">
            <h3 className="text-sm font-bold text-[#123B3A] mb-4">Counter Document & Sequence Defaults</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <Input
                label="Sales Invoice Prefix"
                required
                value={invoicePrefix}
                onChange={(e) => setInvoicePrefix(e.target.value)}
                placeholder="INV-"
                disabled={!isOwner}
              />
              <Input
                label="Invoice Number Digits (Padding)"
                type="number"
                value={invoicePadding}
                onChange={(e) => setInvoicePadding(e.target.value)}
                placeholder="4 (e.g. 0001)"
                disabled={!isOwner}
              />
              <Input
                label="Purchase Bill Prefix"
                required
                value={purchasePrefix}
                onChange={(e) => setPurchasePrefix(e.target.value)}
                placeholder="BILL-"
                disabled={!isOwner}
              />
            </div>
          </div>

          <div className="border-t border-[#D7E5E2] pt-5">
            <h3 className="text-sm font-bold text-[#123B3A] mb-4">Official Registered Address</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input
                label="Address Line 1"
                required
                value={addressLine1}
                onChange={(e) => setAddressLine1(e.target.value)}
                placeholder="e.g. Shop 14, Commercial Plaza"
                disabled={!isOwner}
              />
              <Input
                label="Address Line 2 (Optional)"
                value={addressLine2}
                onChange={(e) => setAddressLine2(e.target.value)}
                placeholder="e.g. Andheri East"
                disabled={!isOwner}
              />
              <Input
                label="City"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Mumbai"
                disabled={!isOwner}
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="State"
                  required
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="e.g. Maharashtra"
                  disabled={!isOwner}
                />
                <Input
                  label="PIN Code"
                  required
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="e.g. 400069"
                  disabled={!isOwner}
                />
              </div>
            </div>
          </div>

          <div className="border-t border-[#D7E5E2] pt-5">
            <h3 className="text-sm font-bold text-[#123B3A] mb-2">Default Invoice Terms & Conditions</h3>
            <textarea
              rows={3}
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              placeholder="e.g. 1. Goods once sold will not be returned. 2. Subject to Mumbai Jurisdiction."
              disabled={!isOwner}
              className="w-full rounded-xl border border-[#D7E5E2] px-3.5 py-2.5 text-xs text-[#123B3A] focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E]"
            />
          </div>
        </div>
      )}

      {/* --- TAB 2: ROLES & MODULE RIGHTS --- */}
      {activeTab === 'ROLES' && (
        <div className="space-y-6">
          {/* Module-level rights configuration (Owner Only) */}
          <div className="bg-white border border-[#D7E5E2] rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#D7E5E2] pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-[#123B3A]">Staff Module Access Rights</h2>
                  <Badge variant="paid">Owner Managed</Badge>
                </div>
                <p className="text-xs text-[#566B69] mt-0.5">
                  Configure which ERP modules are visible and accessible to Staff members. Owners always retain 100% full administrative access.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {MODULE_RIGHTS_METADATA.map((mod) => {
                const isAllowed = permissions[mod.key] ?? true;
                const Icon = mod.icon;

                return (
                  <div
                    key={mod.key}
                    className={cn(
                      'p-4 rounded-xl border transition-all flex flex-col justify-between',
                      isAllowed
                        ? 'bg-white border-[#D7E5E2] hover:border-[#0F766E]/40'
                        : 'bg-[#F9FBFA] border-[#E2EBE9] opacity-80',
                    )}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-8 h-8 rounded-lg bg-[#E6F4F2] text-[#0F766E] flex items-center justify-center">
                          <Icon className="w-4 h-4" />
                        </div>
                        <button
                          type="button"
                          disabled={!isOwner}
                          onClick={() => handleTogglePermission(mod.key)}
                          className={cn(
                            'px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 transition-colors',
                            isAllowed
                              ? 'bg-[#DCFCE7] text-[#15803D] hover:bg-[#BBF7D0]'
                              : 'bg-[#FEE2E2] text-[#B91C1C] hover:bg-[#FECACA]',
                          )}
                        >
                          {isAllowed ? (
                            <>
                              <Eye className="w-3 h-3" />
                              <span>Enabled for Staff</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3 h-3" />
                              <span>Hidden for Staff</span>
                            </>
                          )}
                        </button>
                      </div>

                      <h4 className="text-xs font-bold text-[#123B3A]">{mod.title}</h4>
                      <p className="text-[11px] text-[#566B69] mt-1 leading-relaxed">{mod.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Team Members List */}
          <div className="bg-white border border-[#D7E5E2] rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D7E5E2] pb-4">
              <div>
                <h2 className="text-base font-bold text-[#123B3A]">Team Staff & Ownership Directory</h2>
                <p className="text-xs text-[#566B69] mt-0.5">
                  Primary Owner is immutable and protected. Secondary owners can be promoted or demoted by the Primary Owner.
                </p>
              </div>

              {isOwner && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsStaffModalOpen(true)}
                  className="flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Add Team Member</span>
                </Button>
              )}
            </div>

            {isLoadingStaff ? (
              <div className="p-8 text-center text-xs text-[#566B69]">Loading business team members...</div>
            ) : staffList.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#566B69]">No team members registered yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[#D7E5E2] text-[#566B69] font-semibold">
                      <th className="py-2.5 px-3">Name & Email</th>
                      <th className="py-2.5 px-3">Role Tier</th>
                      <th className="py-2.5 px-3">Rights Scope</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5EFEB]">
                    {staffList.map((m) => {
                      const isMemberOwner = m.role === 'OWNER' || m.role === 'ADMIN';

                      return (
                        <tr key={m.id} className="hover:bg-[#F4F8F7]/60">
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-[#E6F4F2] text-[#0F766E] flex items-center justify-center font-bold text-xs">
                                {m.name[0].toUpperCase()}
                              </div>
                              <div>
                                <p className="font-bold text-[#123B3A]">{m.name}</p>
                                <p className="text-[11px] text-[#566B69]">{m.email}</p>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-3">
                            <div className="flex items-center gap-1.5">
                              <Badge variant={isMemberOwner ? 'paid' : 'neutral'}>
                                {isMemberOwner ? 'OWNER' : 'STAFF'}
                              </Badge>
                              {m.isPrimaryOwner && (
                                <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded">
                                  Primary Owner
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="py-3 px-3 text-[11px] text-[#566B69]">
                            {isMemberOwner
                              ? '100% Administrative & Financial Access'
                              : 'Restricted according to Staff Module Rights'}
                          </td>

                          <td className="py-3 px-3 text-right">
                            {isOwner && !m.isPrimaryOwner ? (
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled={updatingMemberId === m.id}
                                  onClick={() => handleRoleToggle(m)}
                                  className="text-[11px] py-1 h-7"
                                >
                                  {isMemberOwner ? 'Demote to Staff' : 'Promote to Owner'}
                                </Button>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveStaff(m)}
                                  className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                                  title="Remove member"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <span className="text-[11px] text-[#8CA19F] italic">Protected</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- TAB 3: BILLING & PLANS --- */}
      {activeTab === 'BILLING' && (
        <div className="space-y-6">
          {/* Current Subscription Card */}
          <div className="bg-[#123B3A] text-white rounded-2xl p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-bold tracking-widest text-[#A0BDB8]">Active Plan</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#0F766E] text-white">LIVE</span>
              </div>
              <h2 className="text-2xl font-black mt-1">
                {plan === 'enterprise' ? 'Business Pro Cloud' : plan === 'growth' ? 'Growth Business Plan' : 'Starter Free Plan'}
              </h2>
              <p className="text-xs text-[#A0BDB8] mt-1 max-w-xl">
                Multi-user business subscription with real-time cloud database synchronization. All invoices, stock deductions, and customer balances are instantly available across web and mobile apps.
              </p>
            </div>

            {isOwner && (
              <Button
                variant="primary"
                onClick={() => {
                  setSelectedPlanForUpgrade('enterprise');
                  setIsPlanPurchaseModalOpen(true);
                }}
                className="bg-[#0F766E] hover:bg-[#0D665F] text-white flex items-center gap-2 shrink-0"
              >
                <QrCode className="w-4 h-4" />
                <span>Instant Bharat UPI Renewal</span>
              </Button>
            )}
          </div>

          {/* 3-Tier Comparison Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Starter Free */}
            <div
              className={cn(
                'bg-white border rounded-2xl p-5 shadow-xs flex flex-col justify-between',
                plan === 'starter' ? 'border-[#0F766E] ring-2 ring-[#0F766E]/20' : 'border-[#D7E5E2]',
              )}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-sm text-[#123B3A]">Starter Plan</h3>
                  {plan === 'starter' && <Badge variant="paid">Current</Badge>}
                </div>
                <div className="text-2xl font-black text-[#123B3A] mb-1">Free</div>
                <p className="text-[11px] text-[#566B69] mb-4">Forever free for small shops and solo counters.</p>

                <ul className="space-y-2 text-xs text-[#123B3A]">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#0F766E]" />
                    <span>Up to 50 GST Sales Invoices / mo</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#0F766E]" />
                    <span>Product Catalog & Customers</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#0F766E]" />
                    <span>1 Business Owner Account</span>
                  </li>
                  <li className="flex items-center gap-2 text-[#8CA19F]">
                    <span className="w-4 h-4 text-center">✕</span>
                    <span>No Purchase or Report Modules</span>
                  </li>
                </ul>
              </div>

              {plan !== 'starter' && isOwner && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateSubscriptionPlan('starter')}
                  className="mt-6 w-full"
                >
                  Downgrade to Free
                </Button>
              )}
            </div>

            {/* Growth */}
            <div
              className={cn(
                'bg-white border rounded-2xl p-5 shadow-xs flex flex-col justify-between',
                plan === 'growth' ? 'border-[#0F766E] ring-2 ring-[#0F766E]/20' : 'border-[#D7E5E2]',
              )}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-sm text-[#123B3A]">Growth Plan</h3>
                  {plan === 'growth' && <Badge variant="paid">Current</Badge>}
                </div>
                <div className="text-2xl font-black text-[#0F766E] mb-1">₹999 <span className="text-xs text-[#566B69] font-normal">/ year</span></div>
                <p className="text-[11px] text-[#566B69] mb-4">Ideal for retail shops & growing trading businesses.</p>

                <ul className="space-y-2 text-xs text-[#123B3A]">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#0F766E]" />
                    <span>Unlimited GST Sales Invoices</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#0F766E]" />
                    <span>Purchases, Expenses & Reports</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#0F766E]" />
                    <span>Up to 3 Team Staff Members</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#0F766E]" />
                    <span>Bharat UPI QR Counter Payments</span>
                  </li>
                </ul>
              </div>

              {plan !== 'growth' && isOwner && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setSelectedPlanForUpgrade('growth');
                    setIsPlanPurchaseModalOpen(true);
                  }}
                  className="mt-6 w-full"
                >
                  Switch to Growth (₹999/yr)
                </Button>
              )}
            </div>

            {/* Business Pro */}
            <div
              className={cn(
                'bg-white border rounded-2xl p-5 shadow-xs flex flex-col justify-between relative overflow-hidden',
                plan === 'enterprise' ? 'border-purple-600 ring-2 ring-purple-600/20' : 'border-[#D7E5E2]',
              )}
            >
              <div className="absolute top-0 right-0 bg-purple-600 text-white text-[9px] font-bold px-3 py-1 rounded-bl-lg">
                RECOMMENDED
              </div>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-sm text-[#123B3A]">Business Pro</h3>
                  {plan === 'enterprise' && <Badge variant="paid">Current</Badge>}
                </div>
                <div className="text-2xl font-black text-purple-700 mb-1">₹1,999 <span className="text-xs text-[#566B69] font-normal">/ year</span></div>
                <p className="text-[11px] text-[#566B69] mb-4">Complete enterprise power for multi-counter operations.</p>

                <ul className="space-y-2 text-xs text-[#123B3A]">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-600" />
                    <span>Unlimited Staff & Multi-Counter Sync</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-600" />
                    <span>Granular Staff Module-Rights Control</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-600" />
                    <span>Full Audit Trail & Stock Adjustments</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-600" />
                    <span>Priority Support & Mobile Sync</span>
                  </li>
                </ul>
              </div>

              {plan !== 'enterprise' && isOwner && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setSelectedPlanForUpgrade('enterprise');
                    setIsPlanPurchaseModalOpen(true);
                  }}
                  className="mt-6 w-full bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Upgrade to Pro (₹1,999/yr)
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 4: AUDIT TRAIL --- */}
      {activeTab === 'AUDIT' && (
        <div className="bg-white border border-[#D7E5E2] rounded-2xl p-6 shadow-xs space-y-4">
          <div className="border-b border-[#D7E5E2] pb-4">
            <h2 className="text-base font-bold text-[#123B3A]">System Activity Audit Trail</h2>
            <p className="text-xs text-[#566B69] mt-0.5">
              Comprehensive chronological log of user actions, role changes, invoices created, and stock alterations.
            </p>
          </div>

          {isLoadingAudit ? (
            <div className="p-8 text-center text-xs text-[#566B69]">Loading system audit records...</div>
          ) : !auditLogs || auditLogs.items?.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#566B69]">No activity logged yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#D7E5E2] text-[#566B69] font-semibold">
                    <th className="py-2.5 px-3">Date & Time</th>
                    <th className="py-2.5 px-3">Actor / User</th>
                    <th className="py-2.5 px-3">Action Event</th>
                    <th className="py-2.5 px-3">Entity Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5EFEB]">
                  {auditLogs.items.map((log: any, idx: number) => (
                    <tr key={log._id || idx} className="hover:bg-[#F4F8F7]/60">
                      <td className="py-3 px-3 text-[#566B69]">
                        {log.createdAt ? new Date(log.createdAt).toLocaleString('en-IN') : '-'}
                      </td>
                      <td className="py-3 px-3 font-semibold text-[#123B3A]">
                        {log.userName || log.actor || 'System'}
                      </td>
                      <td className="py-3 px-3">
                        <Badge variant="draft">{log.action || 'MUTATION'}</Badge>
                      </td>
                      <td className="py-3 px-3 text-[#566B69]">{log.entity || log.collectionName || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Add Staff Modal */}
      <Modal
        isOpen={isStaffModalOpen}
        onClose={() => setIsStaffModalOpen(false)}
        title="Add Business Staff Member"
      >
        <div className="space-y-4">
          <Input
            label="Staff Full Name"
            required
            value={staffName}
            onChange={(e) => setStaffName(e.target.value)}
            placeholder="e.g. Priya Patel"
          />

          <Input
            label="Email Address"
            required
            type="email"
            value={staffEmail}
            onChange={(e) => setStaffEmail(e.target.value)}
            placeholder="e.g. priya@company.com"
          />

          <div>
            <label className="block text-xs font-bold text-[#123B3A] mb-1.5">
              Role Assignment <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setStaffRole('STAFF')}
                className={cn(
                  'p-3 rounded-xl border text-left transition-all',
                  staffRole === 'STAFF'
                    ? 'border-[#0F766E] bg-[#E6F4F2] text-[#0F766E]'
                    : 'border-[#D7E5E2] bg-white text-[#566B69]',
                )}
              >
                <p className="font-bold text-xs">Staff Member</p>
                <p className="text-[10px] mt-0.5">Operates counter based on enabled module rights</p>
              </button>

              <button
                type="button"
                onClick={() => setStaffRole('OWNER')}
                className={cn(
                  'p-3 rounded-xl border text-left transition-all',
                  staffRole === 'OWNER'
                    ? 'border-[#0F766E] bg-[#E6F4F2] text-[#0F766E]'
                    : 'border-[#D7E5E2] bg-white text-[#566B69]',
                )}
              >
                <p className="font-bold text-xs">Secondary Owner</p>
                <p className="text-[10px] mt-0.5">Full admin access, billing & user management</p>
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-[#D7E5E2]">
            <Button variant="outline" size="sm" onClick={() => setIsStaffModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={!staffName || !staffEmail}
              isLoading={addStaffMutation.isPending}
              onClick={() => addStaffMutation.mutate()}
            >
              Add Member
            </Button>
          </div>
        </div>
      </Modal>

      {/* Plan Purchase UPI Modal */}
      <PlanPurchaseModal
        isOpen={isPlanPurchaseModalOpen}
        onClose={() => setIsPlanPurchaseModalOpen(false)}
        targetPlan={selectedPlanForUpgrade}
        onSuccess={async (newPlan) => {
          setIsPlanPurchaseModalOpen(false);
          await refreshBusiness();
          toast.success(`Subscription upgraded to ${newPlan.toUpperCase()}!`);
        }}
      />
    </div>
  );
};
