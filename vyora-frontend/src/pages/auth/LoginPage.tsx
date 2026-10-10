import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Building2, ShieldCheck } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('demo@vyora.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login({ email, password });
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
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

        <h2 className="text-lg font-bold text-[#123B3A] mb-1">Welcome back</h2>
        <p className="text-xs text-[#566B69] mb-6">Sign in to your business ledger and invoicing portal</p>

        {error && (
          <div className="mb-4 p-3 bg-[#FEE2E2] border border-[#FECACA] rounded-lg text-xs text-[#B91C1C]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
          />

          <Input
            label="Password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />

          <Button type="submit" className="w-full" isLoading={isLoading}>
            Sign In to Dashboard
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-[#D7E5E2] text-center text-xs text-[#566B69]">
          Don't have an account yet?{' '}
          <Link to="/register" className="font-semibold text-[#0F766E] hover:underline">
            Register your business
          </Link>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-2 text-xs text-[#566B69]">
        <ShieldCheck className="w-4 h-4 text-[#0F766E]" />
        <span>Authoritative multi-tenant isolation & server calculations</span>
      </div>
    </div>
  );
};
