import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { LANGUAGES } from '../translations';
import { Language } from '../types';
import { Globe, Activity, ChevronDown, LogOut, User, Building } from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    lang,
    setLang,
    t,
    view,
    setView,
    citizenUser,
    adminUser,
    logoutCitizen,
    logoutAdmin,
  } = useApp();

  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLangObj = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setLangMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full h-[72px] bg-slate-950/85 backdrop-blur-xl border-b border-slate-800/80 px-4 sm:px-8 flex items-center justify-between transition-colors">
      {/* Zone 1: Brand Wordmark */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setView('home')}
          className="flex items-center gap-2.5 text-left group cursor-pointer focus:outline-none"
          aria-label="MedNexus Home"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-fuchsia-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-fuchsia-500/20 group-hover:scale-105 transition-transform">
            <Activity className="w-5 h-5 text-white stroke-[2.2]" />
          </div>
          <div>
            <span className="font-serif font-bold text-lg tracking-tight text-white group-hover:text-cyan-400 transition-colors">
              MedNexus
            </span>
            <span className="hidden sm:block text-[9px] font-mono tracking-widest text-cyan-400 uppercase font-semibold">
              Smart Med-Platform
            </span>
          </div>
        </button>
      </div>

      {/* Zone 2: Navigation Links (single-line, clean typography) */}
      <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-slate-300">
        <button
          onClick={() => {
            if (citizenUser) setView('citizenDash');
            else setView('citizenAuth');
          }}
          className={`hover:text-cyan-400 transition-colors cursor-pointer whitespace-nowrap ${
            view === 'citizenDash' || view === 'citizenAuth' ? 'text-cyan-400' : ''
          }`}
        >
          {t('citizenPortal', 'Citizen Portal')}
        </button>

        <button
          onClick={() => {
            if (adminUser) setView('adminDash');
            else setView('adminAuth');
          }}
          className={`hover:text-cyan-400 transition-colors cursor-pointer whitespace-nowrap ${
            view === 'adminDash' || view === 'adminAuth' ? 'text-cyan-400' : ''
          }`}
        >
          {t('adminPortal', 'Admin Portal')}
        </button>

        <button
          onClick={() => setView('ambulance')}
          className={`hover:text-amber-400 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            view === 'ambulance' ? 'text-amber-400' : ''
          }`}
        >
          <span>🚑</span>
          <span>{t('ambulance', 'Ambulance')}</span>
        </button>

        <button
          onClick={() => setView('careAi')}
          className={`hover:text-fuchsia-400 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            view === 'careAi' ? 'text-fuchsia-400' : ''
          }`}
        >
          <span>🤖</span>
          <span>{t('careAi', 'Care AI')}</span>
        </button>
      </nav>

      {/* Zone 3: Actions + Multilingual Switcher */}
      <div className="flex items-center gap-3">
        {/* Language Switcher Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setLangMenuOpen((prev) => !prev)}
            className="flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-slate-900 border border-slate-700/80 text-xs font-medium text-slate-200 hover:border-cyan-400 transition-all cursor-pointer"
            aria-label="Change Language"
          >
            <span className="text-sm">{currentLangObj.flag}</span>
            <span className="font-sans font-semibold text-slate-100">{currentLangObj.native}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {langMenuOpen && (
            <div className="absolute right-0 mt-1.5 w-44 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl py-1 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                Language / भाषा / மொழி
              </div>
              {LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  onClick={() => {
                    setLang(l.code);
                    setLangMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left transition-colors cursor-pointer ${
                    lang === l.code
                      ? 'bg-cyan-950/60 text-cyan-300 font-bold'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-sm">{l.flag}</span>
                    <span>{l.native}</span>
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">{l.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* User Status / Login Buttons */}
        {citizenUser ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setView('citizenDash')}
              className="hidden sm:flex items-center gap-1.5 text-xs text-slate-300 hover:text-cyan-400 font-medium px-2 py-1 rounded cursor-pointer"
            >
              <User className="w-3.5 h-3.5 text-cyan-400" />
              <span className="truncate max-w-[120px]">{citizenUser.name}</span>
            </button>
            <button
              onClick={logoutCitizen}
              className="inline-flex items-center gap-1 py-1.5 px-3 rounded-lg border border-slate-700 text-xs font-semibold text-slate-300 hover:text-rose-400 hover:border-rose-500/50 bg-slate-900 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t('signOut', 'Sign Out')}</span>
            </button>
          </div>
        ) : adminUser ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setView('adminDash')}
              className="hidden sm:flex items-center gap-1.5 text-xs text-slate-300 hover:text-cyan-400 font-medium px-2 py-1 rounded cursor-pointer"
            >
              <Building className="w-3.5 h-3.5 text-amber-400" />
              <span className="truncate max-w-[130px]">{adminUser.name}</span>
            </button>
            <button
              onClick={logoutAdmin}
              className="inline-flex items-center gap-1 py-1.5 px-3 rounded-lg border border-slate-700 text-xs font-semibold text-slate-300 hover:text-rose-400 hover:border-rose-500/50 bg-slate-900 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t('signOut', 'Sign Out')}</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setView('citizenAuth')}
              className="py-1.5 px-3 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 transition-colors cursor-pointer whitespace-nowrap"
            >
              {t('citizenSignIn', 'Citizen')}
            </button>
            <button
              onClick={() => setView('adminAuth')}
              className="py-1.5 px-3 rounded-lg text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-fuchsia-400 hover:opacity-90 transition-opacity cursor-pointer whitespace-nowrap shadow-sm shadow-cyan-500/20"
            >
              {t('adminSignIn', 'Hospital Admin')}
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
