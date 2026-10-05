import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ArrowLeft, Mic, MicOff, Send, Bot, Trash2, Volume2, Shield } from 'lucide-react';

interface ChatMsg {
  id: string;
  who: 'user' | 'bot';
  text: string;
}

const QUICK_PROMPTS = [
  'I have a cold since yesterday',
  "I've had a fever for 2 days",
  'Headache and fatigue since morning',
  'Sore throat and mild cough',
  'Stomach ache and feeling nauseous',
];

export const CareAiView: React.FC = () => {
  const { t, setView, citizenUser, hospitals } = useApp();

  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      id: 'm1',
      who: 'bot',
      text: "Hello! I am your Care Assistant 🩺 Tell me your symptom and how many days it has lasted. I provide safe, non-medicinal self-care guidance and will point you to the nearest hospital if needed.",
    },
  ]);

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const chatBottomRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Voice recognition setup
  const toggleListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Voice input is not supported in this browser.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-IN';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onresult = (e: any) => {
        const transcript = e.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
      recognitionRef.current = recognition;
      setIsListening(true);
    } catch {
      setIsListening(false);
    }
  };

  const speakText = (text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  const generateReply = (raw: string): string => {
    const text = raw.toLowerCase();
    const dayMatch = text.match(/(\d+)\s*day/);
    const days = dayMatch ? parseInt(dayMatch[1], 10) : null;

    const highRisk = [
      'unconscious',
      'severe chest pain',
      "can't breathe",
      'cannot breathe',
      'bleeding heavily',
      'seizure',
      'stroke',
      'heart attack',
    ];

    if (highRisk.some((k) => text.includes(k))) {
      return "That sounds critical and requires immediate emergency attention! Please use our Ambulance Booking section right away or call emergency dispatch.";
    }

    if (days !== null && days >= 3) {
      const nearest = hospitals[0]?.name || 'City Care Hospital';
      return `Since your symptom has persisted for ${days} days (crossing the 3-day threshold), self-care is no longer recommended. Please visit ${nearest} (${hospitals[0]?.distanceKm || 1.2} km away) for an in-person clinical checkup.`;
    }

    if (text.includes('cold') || text.includes('runny nose')) {
      return "For an early cold: get plenty of rest, drink warm fluids, try gentle steam inhalation, and keep yourself warm. If symptoms last beyond 3 days or fever spikes, consult a doctor.";
    }

    if (text.includes('fever')) {
      return "For a mild fever: stay well hydrated with water and warm soups, rest in a cool, ventilated room, and use a cool damp cloth on the forehead. If the fever crosses 3 days or exceeds 102°F, visit a hospital.";
    }

    if (text.includes('cough') || text.includes('sore throat')) {
      return "Warm salt water gargles 2-3 times daily, warm honey water, and steam inhalation often soothe mild throat discomfort. Avoid very cold drinks. If coughing persists past 3 days or you experience shortness of breath, please book an appointment.";
    }

    if (text.includes('headache')) {
      return "Rest in a quiet, dimly lit room, stay well hydrated, and avoid prolonged screen time. If the headache is sudden, severe, or accompanied by visual changes, visit the hospital immediately.";
    }

    if (text.includes('stomach') || text.includes('nausea') || text.includes('vomit')) {
      return "Sip Oral Rehydration Salts (ORS) or electrolyte water slowly in small amounts. Eat small, bland meals like rice porridge or toast. If you cannot keep fluids down for over 24 hours, seek clinical care.";
    }

    return "Thank you for sharing your symptom. Could you mention how many days you have had this symptom? (If anything feels acute or severe, please use Ambulance Booking instead of waiting.)";
  };

  const handleSend = (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text) return;

    const userMsg: ChatMsg = {
      id: 'm_' + Date.now(),
      who: 'user',
      text,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const replyText = generateReply(text);
      const botMsg: ChatMsg = {
        id: 'bot_' + Date.now(),
        who: 'bot',
        text: replyText,
      };
      setMessages((prev) => [...prev, botMsg]);
    }, 800);
  };

  return (
    <div className="min-h-screen text-slate-100 py-10 px-4 sm:px-8 max-w-5xl mx-auto space-y-6">
      {/* Back Button */}
      <div>
        <button
          onClick={() => setView(citizenUser ? 'citizenDash' : 'home')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('backToSearch', 'Back to Portal')}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left Side: Bot Profile, Disclaimers & Quick Prompts */}
        <div className="md:col-span-4 p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-5 text-xs">
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-fuchsia-950/80 border border-fuchsia-500/30 flex items-center justify-center text-3xl shadow-lg shadow-fuchsia-500/10">
              🤖
            </div>
            <h3 className="text-base font-bold font-serif text-white">{t('careAssistantTitle', 'Care Assistant')}</h3>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              {t(
                'careAssistantSub',
                'Symptom-based guidance only. Tell me how long a symptom has lasted — past 3 days, I will point you to the nearest hospital.'
              )}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1.5 text-slate-300">
            <div className="flex items-center gap-1.5 font-bold text-amber-400 text-[11px]">
              <Shield className="w-3.5 h-3.5" />
              <span>Safe Medical Design</span>
            </div>
            <p className="text-[11px] text-slate-400">
              {t('careDisclaimer', 'Never suggests medicines or dosages — safe by design. Not a doctor.')}
            </p>
          </div>

          {/* Quick Prompts */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <span className="text-[10px] font-mono uppercase font-bold text-slate-400 tracking-wider">
              {t('quickPrompts', 'Quick Prompts')}
            </span>
            <div className="space-y-1.5">
              {QUICK_PROMPTS.map((q) => (
                <button
                  key={q}
                  onClick={() => handleSend(q)}
                  className="w-full text-left p-2 rounded-lg bg-slate-800/40 hover:bg-slate-800 border border-slate-700/50 hover:border-cyan-400/50 text-[11px] text-slate-300 transition-colors cursor-pointer"
                >
                  &ldquo;{q}&rdquo;
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Chat Window */}
        <div className="md:col-span-8 rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden flex flex-col h-[600px] shadow-2xl">
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <div>
                <h4 className="text-xs font-bold text-white">Care Assistant AI</h4>
                <p className="text-[10px] text-emerald-400 font-mono">
                  {t('onlineSafeMode', 'Online · Safe guidance mode')}
                </p>
              </div>
            </div>

            <button
              onClick={() =>
                setMessages([
                  {
                    id: 'm_reset',
                    who: 'bot',
                    text: 'Chat cleared. How can I help you with your symptoms today?',
                  },
                ])
              }
              className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1 cursor-pointer"
              title="Clear Chat"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{t('clearChat', 'Clear chat')}</span>
            </button>
          </div>

          {/* Chat Messages Log */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 max-w-[85%] ${
                  m.who === 'user' ? 'ml-auto flex-row-reverse' : ''
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                    m.who === 'user'
                      ? 'bg-cyan-500 text-slate-950'
                      : 'bg-fuchsia-950 text-fuchsia-400 border border-fuchsia-800/60'
                  }`}
                >
                  {m.who === 'user' ? 'U' : '🤖'}
                </div>
                <div
                  className={`p-3.5 rounded-2xl leading-relaxed ${
                    m.who === 'user'
                      ? 'bg-cyan-950 text-cyan-100 border border-cyan-800/80 rounded-tr-none'
                      : 'bg-slate-800/80 text-slate-200 border border-slate-700/60 rounded-tl-none'
                  }`}
                >
                  <p>{m.text}</p>
                  {m.who === 'bot' && (
                    <button
                      onClick={() => speakText(m.text)}
                      className="mt-2 text-[10px] text-slate-400 hover:text-cyan-400 inline-flex items-center gap-1 cursor-pointer"
                      title="Listen aloud"
                    >
                      <Volume2 className="w-3 h-3" />
                      <span>Listen</span>
                    </button>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 text-slate-400 text-xs">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.4s]" />
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* Chat Input Bar */}
          <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center gap-2">
            <button
              onClick={toggleListening}
              className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
                isListening
                  ? 'bg-rose-950 text-rose-300 border-rose-500 animate-pulse'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
              }`}
              title="Voice Input"
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={t('chatPlaceholder', 'e.g. I have a cold since yesterday…')}
              className="flex-1 py-2.5 px-4 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
            />

            <button
              onClick={() => handleSend()}
              className="py-2.5 px-4 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs transition-colors cursor-pointer flex items-center gap-1 shadow-md shadow-cyan-500/20"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
