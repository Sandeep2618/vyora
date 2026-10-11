import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Eye, EyeOff } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await register({
        name,
        businessName,
        email,
        password,
      });
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

          <Input
            label="Work Email"
            type="email"
            required
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
