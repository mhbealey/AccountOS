'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password');
      } else {
        router.push('/');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = cn(
    'w-full bg-[#0D2137] border border-[#1A3550] rounded-lg px-4 py-3',
    'text-[#F0F4F8] placeholder-[#829AB1]',
    'focus:border-[#00D4AA] focus:outline-none transition-colors'
  );

  return (
    <div className="min-h-screen bg-[#050E1A] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo / Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-[#00D4AA]/10 mb-4">
            <Shield className="w-7 h-7 text-[#00D4AA]" />
          </div>
          <h1 className="text-3xl font-bold text-[#F0F4F8] tracking-tight">
            AccountOS
          </h1>
          <p className="text-[#829AB1] mt-1">Cyber Account Management</p>
        </div>

        {/* Login Card */}
        <div className="bg-[#0B1B2E] rounded-xl border border-[#1A3550] p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-red-400 text-sm text-center">
                {error}
              </div>
            )}

            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-[#829AB1]">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#829AB1]" />
                <input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={cn(inputClass, 'pl-10')}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-[#829AB1]">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#829AB1]" />
                <input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={cn(inputClass, 'pl-10')}
                  required
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={cn(
                'w-full bg-[#00D4AA] text-[#050E1A] font-semibold rounded-lg px-4 py-3',
                'hover:bg-[#00E8BC] transition-colors',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
