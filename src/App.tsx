import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { HomeView } from './components/HomeView';
import { CitizenAuth } from './components/CitizenAuth';
import { AdminAuth } from './components/AdminAuth';
import { CitizenDash } from './components/CitizenDash';
import { AdminDash } from './components/AdminDash';
import { AmbulanceView } from './components/AmbulanceView';
import { CareAiView } from './components/CareAiView';
import { ToastContainer } from './components/Toast';

const MainContent: React.FC = () => {
  const { view } = useApp();

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      <Navbar />
      <main className="flex-1">
        {view === 'home' && <HomeView />}
        {view === 'citizenAuth' && <CitizenAuth />}
        {view === 'adminAuth' && <AdminAuth />}
        {view === 'citizenDash' && <CitizenDash />}
        {view === 'adminDash' && <AdminDash />}
        {view === 'ambulance' && <AmbulanceView />}
        {view === 'careAi' && <CareAiView />}
      </main>
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
