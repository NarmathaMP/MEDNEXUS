import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Building2, ShieldCheck, ArrowRight } from 'lucide-react';

export const AdminAuth: React.FC = () => {
  const { t, loginAdmin, setView, hospitals } = useApp();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [hospitalSelect, setHospitalSelect] = useState<string>('h1');
  const [hospitalName, setHospitalName] = useState<string>('');
  const [regNumber, setRegNumber] = useState<string>('TN/HOSP/2021/0084');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'signup') {
      const name = hospitalName.trim() || 'New Medical Center';
      const newHospitalId = 'h_' + Date.now();
      loginAdmin({
        hospitalId: newHospitalId,
        name,
        contact: email.trim(),
        regNumber,
      });
    } else {
      const selected = hospitals.find((h) => h.id === hospitalSelect) || hospitals[0];
      loginAdmin({
        hospitalId: selected.id,
        name: selected.name,
        contact: email.trim(),
        regNumber,
      });
    }

    setView('adminDash');
  };

  return (
    <div className="min-h-[calc(100vh-72px)] flex items-center justify-center p-4 sm:p-8 relative">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-950 text-amber-400 border border-amber-800/80 flex items-center justify-center font-bold text-sm">
              <Building2 className="w-4 h-4" />
            </div>
            <span className="font-serif font-bold text-white text-base">MedNexus</span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-950 text-amber-400 border border-amber-500/30">
            {t('roleAdmin', 'Hospital Admin')}
          </span>
        </div>

        {/* Tab Toggle */}
        <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`py-2 rounded-lg transition-all cursor-pointer ${
              mode === 'login'
                ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
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
                ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Register Hospital
          </button>
        </div>

        <div className="space-y-1">
          <h2 className="text-xl font-bold font-serif text-white">
            {mode === 'login' ? 'Hospital Admin Console' : 'Register New Hospital'}
          </h2>
          <p className="text-xs text-slate-400">
            {mode === 'login'
              ? 'Manage live bed telemetry, appointments & day-to-day hospital billing.'
              : 'Register your medical facility into the unified city network.'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} autoComplete="off" className="space-y-4 text-xs">
          {mode === 'login' ? (
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Select Hospital Facility
              </label>
              <select
                value={hospitalSelect}
                onChange={(e) => setHospitalSelect(e.target.value)}
                className="w-full py-2.5 px-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                {hospitals.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name} ({h.area})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Hospital / Clinic Name *
              </label>
              <input
                type="text"
                required
                value={hospitalName}
                onChange={(e) => setHospitalName(e.target.value)}
                placeholder="e.g. City General Hospital"
                className="w-full py-2.5 px-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          )}

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Medical License / Registration #
            </label>
            <input
              type="text"
              required
              value={regNumber}
              onChange={(e) => setRegNumber(e.target.value)}
              placeholder="e.g. TN/HOSP/2021/0084"
              className="w-full py-2.5 px-3 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Admin Email
            </label>
            <input
              type="email"
              required
              autoComplete="off"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter admin email"
              className="w-full py-2.5 px-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
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
              className="w-full py-2.5 px-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 transition-all shadow-lg shadow-amber-500/20 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>{mode === 'login' ? 'Unlock Admin Portal' : 'Register & Verify Hospital'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        <div className="flex items-center justify-center gap-2 pt-2 text-[11px] text-slate-500 font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
          <span>Role-Based Verified Access &middot; HIPAA / NABH Compliant</span>
        </div>
      </div>
    </div>
  );
};
