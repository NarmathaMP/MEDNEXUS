import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { User, ShieldCheck, ArrowRight } from 'lucide-react';

export const CitizenAuth: React.FC = () => {
  const { t, loginCitizen, setView } = useApp();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanContact = contact.trim();
    if (!cleanContact) return;
    const cleanName =
      mode === 'signup' && name.trim()
        ? name.trim()
        : cleanContact.split('@')[0] || 'Citizen';

    // Check if known demo patient
    let patientId = 'MN-P8921';
    if (cleanContact.includes('rajesh')) patientId = 'MN-P4410';
    else if (cleanContact.includes('ananya')) patientId = 'MN-P3192';
    else if (cleanContact.includes('karthik')) patientId = 'MN-P7725';
    else if (mode === 'signup') {
      patientId = 'MN-P' + Math.random().toString(36).slice(2, 6).toUpperCase();
    }

    loginCitizen({
      name: cleanName,
      contact: cleanContact,
      patientId,
    });

    setView('citizenDash');
  };

  return (
    <div className="min-h-[calc(100vh-72px)] flex items-center justify-center p-4 sm:p-8 relative">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-8 shadow-2xl space-y-6 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800/80 flex items-center justify-center font-bold text-sm">
              <User className="w-4 h-4" />
            </div>
            <span className="font-serif font-bold text-white text-base">MedNexus</span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-500/30">
            {t('roleCitizen', 'Citizen')}
          </span>
        </div>

        {/* Tab Toggle */}
        <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`py-2 rounded-lg transition-all cursor-pointer ${
              mode === 'login'
                ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {t('signIn', 'Sign In')}
          </button>
          <button
            type="button"
            onClick={() => setMode('signup')}
            className={`py-2 rounded-lg transition-all cursor-pointer ${
              mode === 'signup'
                ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign Up
          </button>
        </div>

        <div className="space-y-1">
          <h2 className="text-xl font-bold font-serif text-white">
            {mode === 'login' ? 'Welcome Back' : 'Create Citizen Account'}
          </h2>
          <p className="text-xs text-slate-400">
            {mode === 'login'
              ? 'Access hospital bed tracking, booking & your treatment bills.'
              : 'Register to manage medical appointments and health bills.'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} autoComplete="off" className="space-y-4 text-xs">
          {mode === 'signup' && (
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Priya Sharma"
                className="w-full py-2.5 px-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
          )}

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Email or Phone Number
            </label>
            <input
              type="text"
              required
              autoComplete="off"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="Enter email or phone number"
              className="w-full py-2.5 px-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Password
            </label>
            <input
              type="password"
              required
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full py-2.5 px-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-cyan-300 hover:from-cyan-300 hover:to-cyan-200 transition-all shadow-lg shadow-cyan-500/20 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>{mode === 'login' ? 'Sign In to Citizen Portal' : 'Create Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        <div className="flex items-center justify-center gap-2 pt-2 text-[11px] text-slate-500 font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
          <span>Encrypted Patient Access &middot; Zero Data Leaks</span>
        </div>
      </div>
    </div>
  );
};
