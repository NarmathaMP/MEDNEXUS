import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PhoneCall, AlertTriangle, ArrowLeft, CheckCircle2, ShieldAlert } from 'lucide-react';

const HIGH_RISK_KEYWORDS = [
  'unconscious',
  'not breathing',
  'difficulty breathing',
  'breathless',
  'severe bleeding',
  'seizure',
  'chest pain',
  'cardiac',
  'stroke',
  'unresponsive',
  'ventilator',
  'heart attack',
  'choking',
];

export const AmbulanceView: React.FC = () => {
  const { t, setView, citizenUser, addAmbulanceRequest } = useApp();

  const [patientName, setPatientName] = useState(citizenUser?.name || '');
  const [condition, setCondition] = useState<'Normal' | 'Serious'>('Normal');
  const [symptoms, setSymptoms] = useState('');
  const [matchResult, setMatchResult] = useState<{
    type: 'Normal' | 'Ventilator-support';
    confidence: number;
    hits: string[];
  } | null>(null);

  const [submitted, setSubmitted] = useState(false);

  const handlePredict = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim()) {
      alert('Please enter patient name.');
      return;
    }

    const text = symptoms.toLowerCase();
    const hits = HIGH_RISK_KEYWORDS.filter((k) => text.includes(k));
    const isVentilator = condition === 'Serious' || hits.length > 0;
    const confidence = Math.min(98, 58 + hits.length * 12 + (condition === 'Serious' ? 18 : 0));

    setMatchResult({
      type: isVentilator ? 'Ventilator-support' : 'Normal',
      confidence,
      hits,
    });
  };

  const handleDispatch = () => {
    if (!matchResult) return;

    addAmbulanceRequest({
      patientName: patientName.trim(),
      condition,
      type: matchResult.type,
      citizen: citizenUser?.name || patientName.trim(),
      patientId: citizenUser?.patientId,
      symptoms,
      status: 'Awaiting dispatch',
      etaMinutes: matchResult.type === 'Ventilator-support' ? 4 : 8,
    });

    setSubmitted(true);
  };

  const handleEmergencyCall = () => {
    alert('Calling Emergency Dispatch Center (108 / 112)... Connecting to local ambulance grid.');
  };

  return (
    <div className="min-h-screen text-slate-100 py-10 px-4 sm:px-8 max-w-5xl mx-auto space-y-8">
      {/* Back button */}
      <div>
        <button
          onClick={() => setView(citizenUser ? 'citizenDash' : 'home')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('backToSearch', 'Back to Portal')}</span>
        </button>
      </div>

      {/* Hero Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/40 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-400">
            {t('emergencyServices', '🚑 Emergency Services')}
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">
            {t('ambulanceBooking', 'Ambulance Booking')}
          </h2>
          <p className="text-xs text-slate-300 max-w-lg leading-relaxed">
            {t(
              'ambulanceSub',
              'One-tap emergency call, or a quick request form matched to the right ambulance type based on your condition and symptoms.'
            )}
          </p>
        </div>

        <div className="flex flex-col items-center sm:items-end gap-1.5 shrink-0">
          <button
            onClick={handleEmergencyCall}
            className="inline-flex items-center gap-2 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white font-bold text-sm shadow-xl shadow-rose-600/30 transition-all cursor-pointer animate-pulse"
          >
            <PhoneCall className="w-4 h-4" />
            <span>{t('emergencyCallNow', 'Emergency Call Now')}</span>
          </button>
          <span className="text-[10px] text-slate-400">{t('callsLocalDispatch', 'Calls local ambulance dispatch')}</span>
        </div>
      </div>

      {/* Main Grid: Form + Match Result */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Request Form */}
        <div className="md:col-span-7 p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-5 text-xs">
          <h3 className="text-sm font-bold text-white font-serif flex items-center gap-2">
            <span>🩺</span>
            <span>{t('quickRequestForm', 'Quick Request Form')}</span>
          </h3>

          <form onSubmit={handlePredict} className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                {t('patientName', 'Patient name')} *
              </label>
              <input
                type="text"
                required
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="Full name of patient"
                className="w-full py-2.5 px-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                {t('condition', 'Condition')}
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setCondition('Normal')}
                  className={`py-2.5 px-4 rounded-xl border text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-2 ${
                    condition === 'Normal'
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-400'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  <span>🟢</span>
                  <span>{t('normal', 'Normal')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCondition('Serious')}
                  className={`py-2.5 px-4 rounded-xl border text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-2 ${
                    condition === 'Serious'
                      ? 'bg-rose-950 text-rose-300 border-rose-400'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  <span>🔴</span>
                  <span>{t('serious', 'Serious')}</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                {t('symptoms', 'Symptoms & Signs')}
              </label>
              <textarea
                rows={4}
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder={t(
                  'symptomsPlaceholder',
                  'e.g. conscious but severe chest pain, struggling to breathe…'
                )}
                className="w-full py-2.5 px-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 transition-all cursor-pointer shadow-lg shadow-amber-500/20"
            >
              {t('getSmartMatch', 'Get Smart Ambulance Match')} &rarr;
            </button>
          </form>
        </div>

        {/* Prediction / Match Result Panel */}
        <div className="md:col-span-5 p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col justify-between min-h-[380px] text-xs">
          {matchResult ? (
            <div className="space-y-6">
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase font-bold text-cyan-400 tracking-widest">
                  Smart Ambulance Match
                </span>
                <h4
                  className={`text-xl font-bold font-serif ${
                    matchResult.type === 'Ventilator-support' ? 'text-rose-400' : 'text-emerald-400'
                  }`}
                >
                  {matchResult.type === 'Ventilator-support'
                    ? t('ventilatorAmbulance', 'Ventilator-support ambulance')
                    : t('normalAmbulance', 'Normal ambulance')}
                </h4>
              </div>

              {/* Confidence Meter */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>Match Confidence</span>
                  <span className="font-mono font-bold text-white">{matchResult.confidence}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full ${
                      matchResult.type === 'Ventilator-support'
                        ? 'bg-gradient-to-r from-amber-400 to-rose-500'
                        : 'bg-gradient-to-r from-cyan-400 to-emerald-400'
                    }`}
                    style={{ width: `${matchResult.confidence}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-500">
                  {matchResult.confidence}% {t('matchConfidence', 'match to reported condition & symptoms')}
                </p>
              </div>

              {matchResult.hits.length > 0 && (
                <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-amber-400 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    High-Risk Keywords Detected
                  </span>
                  <p className="text-[11px] text-slate-300">{matchResult.hits.join(', ')}</p>
                </div>
              )}

              {submitted ? (
                <div className="p-4 rounded-xl bg-emerald-950/70 border border-emerald-500/30 text-emerald-300 space-y-1 text-center">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto" />
                  <p className="font-bold text-sm">Ambulance Request Dispatched!</p>
                  <p className="text-[11px] text-slate-300">
                    Hospital admin has received your alert. Tracking is active in your portal.
                  </p>
                </div>
              ) : (
                <button
                  onClick={handleDispatch}
                  className={`w-full py-3 px-4 rounded-xl font-bold text-slate-950 transition-all cursor-pointer shadow-lg ${
                    matchResult.type === 'Ventilator-support'
                      ? 'bg-rose-400 hover:bg-rose-300 shadow-rose-500/20'
                      : 'bg-emerald-400 hover:bg-emerald-300 shadow-emerald-500/20'
                  }`}
                >
                  {t('confirmRequest', 'Confirm request & Alert Admin')}
                </button>
              )}
            </div>
          ) : (
            <div className="my-auto text-center space-y-3 py-10">
              <span className="text-4xl block opacity-30">🚑</span>
              <p className="text-slate-400">
                Fill the quick request form with the patient's condition, then run the match.
              </p>
            </div>
          )}

          {/* Mini Flow Indicator */}
          <div className="pt-6 border-t border-slate-800 space-y-2 text-[11px] text-slate-500 font-mono">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[10px] text-slate-300">
                1
              </span>
              <span>Patient request captured</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[10px] text-slate-300">
                2
              </span>
              <span>Matched to required vehicle type</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[10px] text-slate-300">
                3
              </span>
              <span>Synced instantly to hospital admin</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
