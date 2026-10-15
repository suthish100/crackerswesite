'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: identifier, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Login failed');
      }

      router.push('/admin/dashboard');
    } catch (err: unknown) {
      console.error('Login error:', err);
      setErrorMsg(err instanceof Error ? err.message : 'Invalid username/phone or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-100 flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 shadow-xl space-y-6 text-slate-900">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 text-amber-400 font-black flex items-center justify-center text-3xl mx-auto shadow-md border border-slate-800">
            👑
          </div>
          <h1 className="text-2xl font-black text-slate-900">Admin Staff Portal</h1>
          <p className="text-slate-500 text-xs">Sivakasi Crackers Management Login</p>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold text-center">
            ⚠️ {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
              Phone Number or Username
            </label>
            <input
              data-testid="admin-phone"
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="e.g. 9999999999 or Akash Kumar"
              className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
              Password
            </label>
            <input
              data-testid="admin-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
            />
          </div>

          <button
            data-testid="admin-login-submit"
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm shadow-md shadow-slate-900/10 transition-all disabled:opacity-50 mt-2"
          >
            {loading ? 'Authenticating...' : 'Sign In to Console →'}
          </button>
        </form>

        {process.env.NODE_ENV !== 'production' && (
          <div className="p-3 rounded-xl bg-slate-50 text-[11px] text-slate-600 text-center border border-slate-200">
            Dev seed helper: <span className="text-slate-900 font-mono font-bold">9999999999</span> / <span className="text-slate-900 font-mono font-bold">Akashkumar@2006</span>
          </div>
        )}
      </div>
    </div>
  );
}
