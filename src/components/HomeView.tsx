import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Activity,
  Bed,
  Bot,
  Truck,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Receipt,
  Users,
} from 'lucide-react';

export const HomeView: React.FC = () => {
  const { t, setView, citizenUser, adminUser, hospitals } = useApp();

  const totalBeds = hospitals.reduce(
    (sum, h) => sum + Object.values(h.beds).reduce((s, b) => s + b.total, 0),
    0
  );
  const availBeds = hospitals.reduce(
    (sum, h) => sum + Object.values(h.beds).reduce((s, b) => s + b.available, 0),
    0
  );
  const icuAvail = hospitals.reduce(
    (sum, h) => sum + (h.beds.ICU?.available || 0),
    0
  );

  return (
    <div className="min-h-screen text-slate-100 overflow-hidden">
      {/* ===================== HERO SECTION ===================== */}
      <section className="relative min-h-[90vh] flex items-center justify-center py-16 px-4 sm:px-8 border-b border-slate-800/60">
        {/* Background Image with Ambient Gradient Overlay */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img
            src="/src/assets/images/hero_medical_network_1790940288085.jpg"
            alt="MedNexus Network"
            className="w-full h-full object-cover object-center opacity-15 filter saturate-150"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-950/85 to-slate-950" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Hero Left Content */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-950/70 border border-cyan-500/30 text-cyan-400 text-xs font-semibold tracking-wide uppercase">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              {t('heroEyebrow', 'Citizen & Admin · One shared platform')}
            </div>

            <h1 className="text-4xl sm:text-6xl font-serif font-bold text-white tracking-tight leading-[1.08]">
              {t('heroTitle1', 'Healthcare,')} <br />
              <span className="bg-gradient-to-r from-fuchsia-400 via-cyan-400 to-amber-300 bg-clip-text text-transparent">
                {t('heroTitle2', 'Reimagined')}
              </span>{' '}
              <br />
              {t('heroTitle3', 'For Everyone.')}
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-xl font-normal leading-relaxed">
              {t(
                'heroLede',
                'MedNexus connects hospital admins and citizens through a single live platform — real-time beds, smart ambulance matching, safe AI care assistant, and unified patient billing in sync.'
              )}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => setView(citizenUser ? 'citizenDash' : 'citizenAuth')}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm text-slate-950 bg-gradient-to-r from-cyan-400 to-cyan-300 hover:from-cyan-300 hover:to-cyan-200 transition-all shadow-xl shadow-cyan-500/20 cursor-pointer"
              >
                <span>👤</span>
                {t('citizenPortal', 'Citizen Portal')}
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>

              <button
                onClick={() => setView(adminUser ? 'adminDash' : 'adminAuth')}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 hover:border-slate-600 transition-all cursor-pointer backdrop-blur-md"
              >
                <span>🏥</span>
                {t('adminPortal', 'Admin Portal')}
              </button>
            </div>

            {/* Trust Markers */}
            <div className="flex flex-wrap items-center gap-5 pt-3 text-xs text-slate-400 font-medium">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400" />
                {t('liveBedTracking', 'Live bed tracking')}
              </div>
              <span className="text-slate-700">&middot;</span>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 shadow-sm shadow-amber-400" />
                {t('smartAmbulanceMatch', 'Smart ambulance match')}
              </div>
              <span className="text-slate-700">&middot;</span>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-fuchsia-400 shadow-sm shadow-fuchsia-400" />
                {t('aiCareAssistant', 'AI care assistant')}
              </div>
            </div>
          </div>

          {/* Hero Right Visuals - Interactive Floating Cards */}
          <div className="lg:col-span-5 relative space-y-4">
            {/* Card 1: Bed Status */}
            <div className="p-5 rounded-2xl bg-slate-900/80 backdrop-blur-xl border border-cyan-500/20 shadow-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[11px] font-mono font-bold text-emerald-400 tracking-wider">
                    LIVE HOSPITAL BEDS
                  </span>
                </div>
                <span className="text-xs text-slate-400 font-medium">City Care & 3 others</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center pt-1">
                <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/40">
                  <span className="block font-serif text-2xl font-bold text-cyan-400 tabular-nums">
                    {availBeds}
                  </span>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Available</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/40">
                  <span className="block font-serif text-2xl font-bold text-amber-400 tabular-nums">
                    {icuAvail}
                  </span>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">ICU Free</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/40">
                  <span className="block font-serif text-2xl font-bold text-slate-300 tabular-nums">
                    {totalBeds}
                  </span>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Total</span>
                </div>
              </div>
            </div>

            {/* Card 2: Ambulance Dispatch */}
            <div className="p-4 rounded-2xl bg-slate-900/80 backdrop-blur-xl border border-amber-500/20 shadow-2xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-xl">
                  🚑
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Smart Ambulance Dispatch</h4>
                  <p className="text-[11px] text-slate-400">Condition-based triage &amp; tracking</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-950/70 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                ETA 4 MIN &middot; ON ROUTE
              </span>
            </div>

            {/* Card 3: Billing & Payments */}
            <div className="p-4 rounded-2xl bg-slate-900/80 backdrop-blur-xl border border-fuchsia-500/20 shadow-2xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-fuchsia-500/10 border border-fuchsia-500/20 flex items-center justify-center text-xl text-fuchsia-400">
                  <Receipt className="w-5 h-5 text-fuchsia-400" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Transparent Hospital Billing</h4>
                  <p className="text-[11px] text-slate-400">Day-wise collections &amp; patient ledger</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-cyan-950/70 border border-cyan-500/30 text-cyan-300 text-[10px] font-bold">
                INSTANT RECEIPTS
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== STATS STRIP ===================== */}
      <section className="border-b border-slate-800/80 bg-slate-900/40 py-8 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="space-y-1">
            <span className="text-2xl font-serif font-bold text-cyan-400">4+</span>
            <p className="text-xs uppercase font-semibold text-slate-400 tracking-wider">
              {t('hospitalsCount', 'Hospitals Connected')}
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-2xl font-serif font-bold text-cyan-400">
              {availBeds} / {totalBeds}
            </span>
            <p className="text-xs uppercase font-semibold text-slate-400 tracking-wider">
              {t('liveBedStatus', 'Live Beds Available')}
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-2xl font-serif font-bold text-amber-400">100%</span>
            <p className="text-xs uppercase font-semibold text-slate-400 tracking-wider">
              {t('aiAssistantStat', 'Safe Care AI Guidance')}
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-2xl font-serif font-bold text-fuchsia-400">&lt; 10 Sec</span>
            <p className="text-xs uppercase font-semibold text-slate-400 tracking-wider">
              {t('twoTapAmbulance', 'Fast Ambulance Match')}
            </p>
          </div>
        </div>
      </section>

      {/* ===================== PORTAL CHOICE ===================== */}
      <section className="py-20 px-4 sm:px-8 max-w-6xl mx-auto">
        <div className="text-center space-y-3 mb-12">
          <span className="text-xs font-mono font-bold text-cyan-400 tracking-widest uppercase">
            Two Portals &middot; One Shared Database
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white">
            {t('choosePortal', 'Choose Your Portal')}
          </h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            {t(
              'portalSub',
              'Real-time sync — whatever a citizen requests, the admin sees instantly and vice versa.'
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Citizen Portal Card */}
          <div className="rounded-3xl bg-slate-900/70 border border-slate-800 hover:border-cyan-500/40 transition-all overflow-hidden flex flex-col group shadow-xl">
            <div className="relative h-48 overflow-hidden">
              <img
                src="/src/assets/images/citizen_patient_care_1790940298820.jpg"
                alt="Citizen Portal"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
              <div className="absolute bottom-4 left-4">
                <span className="px-2.5 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-[10px] font-bold tracking-wider uppercase">
                  Citizen Portal
                </span>
              </div>
            </div>

            <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <h3 className="text-xl font-bold font-serif text-white">
                  {t('citizenCardTitle', 'Search, Book & View Care Bills')}
                </h3>
                <ul className="space-y-2.5 text-xs text-slate-300 font-medium">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span>{t('citizenFeat1', 'Search hospitals by specialty, distance & live beds')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span>{t('citizenFeat2', 'Book, confirm and track appointments in one flow')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span>{t('citizenFeat3', 'One-tap emergency call or smart ambulance request')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span>{t('citizenFeat4', 'Track your treatment bills & download receipts easily')}</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => setView(citizenUser ? 'citizenDash' : 'citizenAuth')}
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-cyan-300 hover:from-cyan-300 hover:to-cyan-200 transition-all cursor-pointer shadow-lg shadow-cyan-500/10"
              >
                {t('enterCitizenPortal', 'Enter Citizen Portal')}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Admin Portal Card */}
          <div className="rounded-3xl bg-slate-900/70 border border-slate-800 hover:border-amber-500/40 transition-all overflow-hidden flex flex-col group shadow-xl">
            <div className="relative h-48 overflow-hidden">
              <img
                src="/src/assets/images/admin_hospital_console_1790940311889.jpg"
                alt="Hospital Admin Portal"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
              <div className="absolute bottom-4 left-4">
                <span className="px-2.5 py-1 rounded-full bg-amber-950/80 border border-amber-500/40 text-amber-300 text-[10px] font-bold tracking-wider uppercase">
                  Admin Portal
                </span>
              </div>
            </div>

            <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <h3 className="text-xl font-bold font-serif text-white">
                  {t('adminCardTitle', 'Manage Capacity, Staff & Hospital Billing')}
                </h3>
                <ul className="space-y-2.5 text-xs text-slate-300 font-medium">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>{t('adminFeat1', 'Live bed tracking — vacant, occupied, ICU by department')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>{t('adminFeat2', 'On-duty / off-duty staff scheduling and appointments queue')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>{t('adminFeat3', 'Daily hospital billing summary & individual patient ledger')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>{t('adminFeat4', 'Reports & analytics — inflow trends and occupancy KPIs')}</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => setView(adminUser ? 'adminDash' : 'adminAuth')}
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all cursor-pointer shadow-lg"
              >
                {t('enterAdminPortal', 'Enter Admin Portal')}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== FLOW STRIP ===================== */}
      <section className="py-16 px-4 sm:px-8 border-t border-slate-800/80 bg-slate-900/30">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-2">
            <span className="text-xs font-mono font-bold text-cyan-400 tracking-widest uppercase">
              End-to-End Workflow
            </span>
            <h2 className="text-3xl font-serif font-bold text-white">
              {t('endToEndSeconds', 'End-to-End in Seconds')}
            </h2>
            <p className="text-xs text-slate-400">
              {t('flowSub', 'A real request as it moves through the platform, citizen to admin dispatch.')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center font-bold text-xs">
                01
              </div>
              <h4 className="text-sm font-bold text-white">{t('step1Title', 'Citizen Requests')}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                {t('step1Desc', 'One-tap request captures patient condition & symptoms.')}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="w-9 h-9 rounded-xl bg-amber-950 text-amber-400 border border-amber-800 flex items-center justify-center font-bold text-xs">
                02
              </div>
              <h4 className="text-sm font-bold text-white">{t('step2Title', 'Smart Matching')}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                {t('step2Desc', 'Logic matches condition to Normal or Ventilator-support.')}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="w-9 h-9 rounded-xl bg-fuchsia-950 text-fuchsia-400 border border-fuchsia-800 flex items-center justify-center font-bold text-xs">
                03
              </div>
              <h4 className="text-sm font-bold text-white">{t('step3Title', 'Synced Instantly')}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                {t('step3Desc', 'Saved to shared database and pushed live to hospital admins.')}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center justify-center font-bold text-xs">
                04
              </div>
              <h4 className="text-sm font-bold text-white">{t('step4Title', 'Dispatch & Track')}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                {t('step4Desc', 'Admin confirms dispatch; citizen tracks status in real time.')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== FOOTER ===================== */}
      <footer className="border-t border-slate-800 py-8 px-4 sm:px-8 bg-slate-950">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-fuchsia-600 to-cyan-500 flex items-center justify-center text-white font-bold text-xs">
              M
            </div>
            <span className="font-serif font-bold text-slate-300">MedNexus</span>
            <span>&middot;</span>
            <span>{t('brandTagline', 'SMART MED-PLATFORM')}</span>
          </div>
          <p className="text-center sm:text-right">
            {t('footerNote', 'Smart Med-Platform · Project Demonstration · Not a substitute for professional medical advice.')}
          </p>
        </div>
      </footer>
    </div>
  );
};
