import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Eye, EyeOff, Mail } from 'lucide-react';
import { api } from '@/lib/api';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inviteBiz = searchParams.get('inviteBiz');
  const initialEmail = searchParams.get('email') || '';

  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanPhone = phone.trim().replace(/[^0-9]/g, '');
    if (!cleanPhone || cleanPhone.length !== 10) {
      setError('Please enter a valid 10-digit Indian mobile number');
      return;
    }

    setIsLoading(true);

    try {
      await register({
        name: name.trim(),
        businessName: businessName.trim() || (inviteBiz ? 'My Business' : undefined),
        phone: cleanPhone,
        email: email.trim().toLowerCase() || undefined,
        password,
      });
      if (inviteBiz) {
        try {
          await api.post('/auth/accept-invite', { businessId: inviteBiz });
        } catch {}
      }
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check your details.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F8F7] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white border border-[#D7E5E2] rounded-2xl shadow-sm p-5 sm:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#0F766E] flex items-center justify-center shadow-sm">
            <span className="text-white font-black text-2xl tracking-tighter">V</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#123B3A]">Vyora</h1>
            <p className="text-xs text-[#566B69]">Simple Business. Bigger Dreams.</p>
          </div>
        </div>

        <h2 className="text-lg font-bold text-[#123B3A] mb-1">Create your business account</h2>
        <p className="text-xs text-[#566B69] mb-6">Set up your business profile, invoicing, and tax defaults</p>

        {inviteBiz && (
          <div className="mb-4 p-3 bg-[#E6F4F2] border border-[#D7E5E2] rounded-lg flex items-center gap-2.5 text-xs text-[#0F766E] font-medium">
            <Mail className="w-4 h-4 shrink-0 text-[#0F766E]" />
            <span>You've been invited! Enter your details to complete setup and join the workspace.</span>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-[#FEE2E2] border border-[#FECACA] rounded-lg text-xs text-[#B91C1C]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Rahul Sharma"
          />

          <Input
            label="Business Legal / Trade Name"
            required
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            placeholder="e.g. Sharma Retail & Supplies"
          />

          <div>
            <label className="block text-xs font-semibold text-[#123B3A] mb-1.5">
              Mobile Number *
            </label>
            <div className="relative flex rounded-xl border border-[#D7E5E2] bg-white overflow-hidden focus-within:ring-2 focus-within:ring-[#0F766E] focus-within:border-transparent transition-all">
              <span className="inline-flex items-center px-3 bg-[#F4F8F7] border-r border-[#D7E5E2] text-xs font-bold text-[#123B3A]">
                🇮🇳 +91
              </span>
              <input
                type="tel"
                required
                maxLength={10}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
                placeholder="9876543210"
                className="w-full px-3 py-2 text-sm bg-transparent text-[#123B3A] placeholder-[#8FA8A4] focus:outline-none"
              />
            </div>
            <p className="text-[11px] text-[#566B69] mt-1">Used for WhatsApp invoices, customer receipts & sign-in</p>
          </div>

          <Input
            label="Work Email (Optional)"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="rahul@sharmaretail.com"
          />

          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimum 6 characters"
            rightElement={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="p-1 text-[#566B69] hover:text-[#123B3A] transition-colors focus:outline-none"
                title={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
          />

          <Button type="submit" className="w-full" isLoading={isLoading}>
            Create Business & Start Invoicing
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-[#D7E5E2] text-center text-xs text-[#566B69]">
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-[#0F766E] hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};
