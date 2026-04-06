'use client';

import { signOut } from 'next-auth/react';
import { User, Info, Moon, LogOut, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

const cardClass = 'bg-[#0B1B2E] rounded-xl border border-[#1A3550] p-5';

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-[#050E1A] text-[#F0F4F8] p-4 sm:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>

        {/* Profile Section */}
        <div className={cardClass}>
          <div className="flex items-center gap-3 mb-4">
            <User className="w-5 h-5 text-[#00D4AA]" />
            <h2 className="text-lg font-semibold">Profile</h2>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-[#829AB1]">Name</label>
              <p className="mt-1">Admin User</p>
            </div>
            <div>
              <label className="text-sm text-[#829AB1]">Email</label>
              <p className="mt-1">admin@accountos.io</p>
            </div>
          </div>
        </div>

        {/* App Info Section */}
        <div className={cardClass}>
          <div className="flex items-center gap-3 mb-4">
            <Info className="w-5 h-5 text-[#00D4AA]" />
            <h2 className="text-lg font-semibold">App Info</h2>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-[#829AB1]">Version</span>
              <span>0.1.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#829AB1]">Platform</span>
              <span>Web</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#829AB1]">Environment</span>
              <span>Production</span>
            </div>
          </div>
        </div>

        {/* Theme Section */}
        <div className={cardClass}>
          <div className="flex items-center gap-3 mb-4">
            <Moon className="w-5 h-5 text-[#00D4AA]" />
            <h2 className="text-lg font-semibold">Theme</h2>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p>Dark Mode</p>
              <p className="text-sm text-[#829AB1]">Always enabled</p>
            </div>
            <button
              className={cn(
                'relative inline-flex h-6 w-11 items-center rounded-full',
                'bg-[#00D4AA] transition-colors cursor-default'
              )}
              aria-label="Dark mode toggle"
            >
              <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6 transition-transform" />
            </button>
          </div>
        </div>

        {/* Security / Logout */}
        <div className={cardClass}>
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-5 h-5 text-[#00D4AA]" />
            <h2 className="text-lg font-semibold">Security</h2>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className={cn(
              'flex items-center gap-2 w-full justify-center',
              'bg-red-500/10 text-red-400 border border-red-500/20',
              'rounded-lg px-4 py-3 font-semibold',
              'hover:bg-red-500/20 transition-colors'
            )}
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
