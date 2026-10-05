import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Language,
  CitizenUser,
  AdminUser,
  Hospital,
  BillInvoice,
  Appointment,
  AmbulanceRequest,
  PatientCase,
  CaseVisit,
  CaseDocument,
  AccessRequest,
  Staff,
} from '../types';
import { translations } from '../translations';
import {
  SEED_HOSPITALS,
  SEED_INVOICES,
  SEED_APPOINTMENTS,
  SEED_AMBULANCE_REQUESTS,
  SEED_CASES,
} from '../data/seedData';

export type AppView =
  | 'home'
  | 'citizenAuth'
  | 'adminAuth'
  | 'citizenDash'
  | 'adminDash'
  | 'ambulance'
  | 'careAi'
  | 'hospitalDetail';

export interface ToastMessage {
  id: string;
  text: string;
  kind?: 'success' | 'amber' | 'error';
}

interface AppContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string, fallback?: string) => string;
  view: AppView;
  setView: (v: AppView) => void;
  activeHospitalId: string | null;
  setActiveHospitalId: (id: string | null) => void;
  citizenTab: string;
  setCitizenTab: (t: string) => void;
  adminTab: string;
  setAdminTab: (t: string) => void;

  citizenUser: CitizenUser | null;
  adminUser: AdminUser | null;
  loginCitizen: (user: CitizenUser) => void;
  logoutCitizen: () => void;
  loginAdmin: (user: AdminUser) => void;
  logoutAdmin: () => void;

  hospitals: Hospital[];
  invoices: BillInvoice[];
  appointments: Appointment[];
  ambulanceRequests: AmbulanceRequest[];
  cases: Record<string, PatientCase>;
  accessRequests: AccessRequest[];

  // Billing Actions
  addInvoice: (invoice: Omit<BillInvoice, 'id' | 'createdAt'>) => BillInvoice;
  updateInvoice: (id: string, updates: Partial<BillInvoice>) => void;
  recordInvoicePayment: (
    invoiceId: string,
    amount: number,
    paymentMethod: BillInvoice['paymentMethod'],
    reference?: string,
    notes?: string
  ) => void;
  payCitizenInvoice: (id: string, amount: number, method: BillInvoice['paymentMethod']) => void;
  formatCurrency: (amount: number) => string;
  formatDate: (dateStr: string) => string;

  // Appointment Actions
  addAppointment: (appt: Omit<Appointment, 'id' | 'createdAt'>) => Appointment;
  updateAppointmentStatus: (id: string, status: Appointment['status']) => void;

  // Ambulance Actions
  addAmbulanceRequest: (req: Omit<AmbulanceRequest, 'id' | 'createdAt'>) => AmbulanceRequest;
  updateAmbulanceStatus: (id: string, status: AmbulanceRequest['status']) => void;

  // Hospital Admin Actions
  updateBed: (hospitalId: string, ward: string, field: 'available' | 'total', val: number) => void;
  addWard: (hospitalId: string, wardName: string, total: number) => void;
  deleteWard: (hospitalId: string, wardName: string) => void;
  addStaff: (hospitalId: string, staff: Omit<Staff, 'id'>) => void;
  updateStaff: (hospitalId: string, staffId: string, updates: Partial<Staff>) => void;
  deleteStaff: (hospitalId: string, staffId: string) => void;
  updateHospital: (hospitalId: string, updates: Partial<Hospital>) => void;

  // Case Tracker Actions
  getPatientCase: (patientId: string) => PatientCase;
  addCaseVisit: (patientId: string, visit: Omit<CaseVisit, 'id'>) => void;
  addCasePrescription: (patientId: string, doc: Omit<CaseDocument, 'id'>) => void;
  addCaseReport: (patientId: string, doc: Omit<CaseDocument, 'id'>) => void;
  requestCaseAccess: (patientId: string, hospitalId: string) => void;
  updateCaseAccessRequest: (id: string, status: AccessRequest['status']) => void;

  // Toasts
  toasts: ToastMessage[];
  showToast: (text: string, kind?: 'success' | 'amber' | 'error') => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Dynamic Browser Language Detection
  const detectBrowserLanguage = (): Language => {
    try {
      const navLangs = navigator.languages || [navigator.language];
      for (const l of navLangs) {
        if (!l) continue;
        const code = l.slice(0, 2).toLowerCase();
        if (['en', 'hi', 'ta', 'es', 'fr', 'de'].includes(code)) {
          return code as Language;
        }
      }
    } catch {}
    return 'en';
  };

  // Language with preference or dynamic browser auto-detection
  const [lang, setLangState] = useState<Language>(() => {
    const saved = localStorage.getItem('mednexus_lang');
    if (saved && ['en', 'hi', 'ta', 'es', 'fr', 'de'].includes(saved)) {
      return saved as Language;
    }
    return detectBrowserLanguage();
  });

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('mednexus_lang', newLang);
  };

  const t = (key: string, fallback?: string): string => {
    const langDict = translations[lang] || translations.en;
    if (langDict && langDict[key]) return langDict[key];
    if (translations.en[key]) return translations.en[key];
    return fallback || key;
  };

  // View Routing
  const [view, setViewState] = useState<AppView>('home');
  const [activeHospitalId, setActiveHospitalId] = useState<string | null>('h1');
  const [citizenTab, setCitizenTab] = useState<string>('search');
  const [adminTab, setAdminTab] = useState<string>('billing');

  const setView = (newView: AppView) => {
    setViewState(newView);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Auth
  const [citizenUser, setCitizenUser] = useState<CitizenUser | null>(() => {
    try {
      const saved = localStorage.getItem('mednexus_citizen');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [adminUser, setAdminUser] = useState<AdminUser | null>(() => {
    try {
      const saved = localStorage.getItem('mednexus_admin');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const loginCitizen = (user: CitizenUser) => {
    setCitizenUser(user);
    localStorage.setItem('mednexus_citizen', JSON.stringify(user));
  };

  const logoutCitizen = () => {
    setCitizenUser(null);
    localStorage.removeItem('mednexus_citizen');
    setView('home');
  };

  const loginAdmin = (user: AdminUser) => {
    setAdminUser(user);
    setActiveHospitalId(user.hospitalId);
    localStorage.setItem('mednexus_admin', JSON.stringify(user));
  };

  const logoutAdmin = () => {
    setAdminUser(null);
    localStorage.removeItem('mednexus_admin');
    setView('home');
  };

  // Data Store with LocalStorage backup
  const [hospitals, setHospitals] = useState<Hospital[]>(() => {
    try {
      const saved = localStorage.getItem('mednexus_hospitals');
      return saved ? JSON.parse(saved) : SEED_HOSPITALS;
    } catch {
      return SEED_HOSPITALS;
    }
  });

  const [invoices, setInvoices] = useState<BillInvoice[]>(() => {
    try {
      const saved = localStorage.getItem('mednexus_invoices');
      return saved ? JSON.parse(saved) : SEED_INVOICES;
    } catch {
      return SEED_INVOICES;
    }
  });

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    try {
      const saved = localStorage.getItem('mednexus_appointments');
      return saved ? JSON.parse(saved) : SEED_APPOINTMENTS;
    } catch {
      return SEED_APPOINTMENTS;
    }
  });

  const [ambulanceRequests, setAmbulanceRequests] = useState<AmbulanceRequest[]>(() => {
    try {
      const saved = localStorage.getItem('mednexus_ambulance');
      return saved ? JSON.parse(saved) : SEED_AMBULANCE_REQUESTS;
    } catch {
      return SEED_AMBULANCE_REQUESTS;
    }
  });

  const [cases, setCases] = useState<Record<string, PatientCase>>(() => {
    try {
      const saved = localStorage.getItem('mednexus_cases');
      return saved ? JSON.parse(saved) : SEED_CASES;
    } catch {
      return SEED_CASES;
    }
  });

  const [accessRequests, setAccessRequests] = useState<AccessRequest[]>(() => {
    try {
      const saved = localStorage.getItem('mednexus_case_access_requests');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('mednexus_hospitals', JSON.stringify(hospitals));
  }, [hospitals]);

  useEffect(() => {
    localStorage.setItem('mednexus_invoices', JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem('mednexus_appointments', JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    localStorage.setItem('mednexus_ambulance', JSON.stringify(ambulanceRequests));
  }, [ambulanceRequests]);

  useEffect(() => {
    localStorage.setItem('mednexus_cases', JSON.stringify(cases));
  }, [cases]);

  useEffect(() => {
    localStorage.setItem('mednexus_case_access_requests', JSON.stringify(accessRequests));
  }, [accessRequests]);

  // Subtle real-time bed fluctuation simulation (shared hospital network)
  useEffect(() => {
    const timer = setInterval(() => {
      setHospitals((prev) =>
        prev.map((h) => {
          const updatedBeds = { ...h.beds };
          Object.keys(updatedBeds).forEach((wardKey) => {
            const ward = updatedBeds[wardKey];
            if (Math.random() < 0.25) {
              const delta = Math.random() < 0.5 ? -1 : 1;
              const nextAvail = Math.max(0, Math.min(ward.total, ward.available + delta));
              updatedBeds[wardKey] = { ...ward, available: nextAvail };
            }
          });
          return { ...h, beds: updatedBeds };
        })
      );
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (text: string, kind: 'success' | 'amber' | 'error' = 'success') => {
    const id = 't_' + Math.random().toString(36).slice(2, 9);
    setToasts((prev) => [...prev, { id, text, kind }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Billing Actions
  const addInvoice = (inv: Omit<BillInvoice, 'id' | 'createdAt'>): BillInvoice => {
    const newInv: BillInvoice = {
      ...inv,
      id: 'inv_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      createdAt: new Date().toISOString(),
    };
    setInvoices((prev) => [newInv, ...prev]);
    showToast(`Invoice ${newInv.invoiceNumber} recorded successfully!`, 'success');
    return newInv;
  };

  const updateInvoice = (id: string, updates: Partial<BillInvoice>) => {
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === id ? { ...inv, ...updates } : inv))
    );
  };

  const recordInvoicePayment = (
    invoiceId: string,
    amount: number,
    paymentMethod: BillInvoice['paymentMethod'],
    reference?: string,
    notes?: string
  ) => {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    const timeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}`;

    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id === invoiceId) {
          const newPaid = Math.min(inv.totalAmount, inv.amountPaid + amount);
          const newBal = Math.max(0, inv.totalAmount - newPaid);
          const newTx = {
            id: 'tx_' + Date.now(),
            invoiceId,
            amount,
            paymentMethod,
            date: dateStr,
            time: timeStr,
            reference: reference || undefined,
            recordedBy: adminUser?.name || 'Hospital Cashier',
            notes: notes || undefined,
          };
          return {
            ...inv,
            amountPaid: newPaid,
            balanceDue: newBal,
            paymentStatus: newBal === 0 ? 'Paid' : 'Partial',
            paymentMethod,
            transactions: [...(inv.transactions || []), newTx],
          };
        }
        return inv;
      })
    );
    showToast(`Payment of ₹${amount.toLocaleString()} recorded successfully!`, 'success');
  };

  const payCitizenInvoice = (id: string, amount: number, method: BillInvoice['paymentMethod']) => {
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id === id) {
          const newPaid = Math.min(inv.totalAmount, inv.amountPaid + amount);
          const newBal = Math.max(0, inv.totalAmount - newPaid);
          return {
            ...inv,
            amountPaid: newPaid,
            balanceDue: newBal,
            paymentStatus: newBal === 0 ? 'Paid' : 'Partial',
            paymentMethod: method,
          };
        }
        return inv;
      })
    );
    showToast(`Payment of ₹${amount.toLocaleString()} completed successfully!`, 'success');
  };

  // Appointments
  const addAppointment = (appt: Omit<Appointment, 'id' | 'createdAt'>): Appointment => {
    const newAppt: Appointment = {
      ...appt,
      id: 'appt_' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    setAppointments((prev) => [newAppt, ...prev]);
    showToast('Appointment request sent to the hospital.', 'success');
    return newAppt;
  };

  const updateAppointmentStatus = (id: string, status: Appointment['status']) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status } : a))
    );
    showToast(`Appointment status updated to ${status}.`, 'success');
  };

  // Ambulance
  const addAmbulanceRequest = (req: Omit<AmbulanceRequest, 'id' | 'createdAt'>): AmbulanceRequest => {
    const newReq: AmbulanceRequest = {
      ...req,
      id: 'amb_' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    setAmbulanceRequests((prev) => [newReq, ...prev]);
    showToast('Ambulance request dispatched to hospital network.', 'amber');
    return newReq;
  };

  const updateAmbulanceStatus = (id: string, status: AmbulanceRequest['status']) => {
    setAmbulanceRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    );
    showToast(`Ambulance dispatch updated: ${status}.`, 'success');
  };

  // Hospital Admin Actions
  const updateBed = (hospitalId: string, ward: string, field: 'available' | 'total', val: number) => {
    setHospitals((prev) =>
      prev.map((h) => {
        if (h.id === hospitalId) {
          const w = h.beds[ward] || { total: 0, available: 0 };
          const updated = { ...w, [field]: Math.max(0, val) };
          if (field === 'total' && updated.available > updated.total) {
            updated.available = updated.total;
          }
          return { ...h, beds: { ...h.beds, [ward]: updated } };
        }
        return h;
      })
    );
    showToast('Bed capacity updated.', 'success');
  };

  const addWard = (hospitalId: string, wardName: string, total: number) => {
    setHospitals((prev) =>
      prev.map((h) => {
        if (h.id === hospitalId) {
          return {
            ...h,
            beds: {
              ...h.beds,
              [wardName]: { total, available: total },
            },
          };
        }
        return h;
      })
    );
    showToast(`Ward "${wardName}" added.`, 'success');
  };

  const deleteWard = (hospitalId: string, wardName: string) => {
    setHospitals((prev) =>
      prev.map((h) => {
        if (h.id === hospitalId) {
          const nextBeds = { ...h.beds };
          delete nextBeds[wardName];
          return { ...h, beds: nextBeds };
        }
        return h;
      })
    );
    showToast(`Ward "${wardName}" removed.`, 'amber');
  };

  const addStaff = (hospitalId: string, staff: Omit<Staff, 'id'>) => {
    setHospitals((prev) =>
      prev.map((h) => {
        if (h.id === hospitalId) {
          return {
            ...h,
            staff: [...h.staff, { ...staff, id: 's_' + Date.now() }],
          };
        }
        return h;
      })
    );
    showToast('Staff member added to roster.', 'success');
  };

  const updateStaff = (hospitalId: string, staffId: string, updates: Partial<Staff>) => {
    setHospitals((prev) =>
      prev.map((h) => {
        if (h.id === hospitalId) {
          return {
            ...h,
            staff: h.staff.map((s) => (s.id === staffId ? { ...s, ...updates } : s)),
          };
        }
        return h;
      })
    );
    showToast('Staff details updated.', 'success');
  };

  const deleteStaff = (hospitalId: string, staffId: string) => {
    setHospitals((prev) =>
      prev.map((h) => {
        if (h.id === hospitalId) {
          return {
            ...h,
            staff: h.staff.filter((s) => s.id !== staffId),
          };
        }
        return h;
      })
    );
    showToast('Staff member removed.', 'amber');
  };

  const updateHospital = (hospitalId: string, updates: Partial<Hospital>) => {
    setHospitals((prev) =>
      prev.map((h) => (h.id === hospitalId ? { ...h, ...updates } : h))
    );
    showToast('Hospital profile updated.', 'success');
  };

  // Case Tracker
  const getPatientCase = (patientId: string): PatientCase => {
    return (
      cases[patientId] || {
        patientId,
        visits: [],
        prescriptions: [],
        reports: [],
      }
    );
  };

  const addCaseVisit = (patientId: string, visit: Omit<CaseVisit, 'id'>) => {
    setCases((prev) => {
      const current = prev[patientId] || { patientId, visits: [], prescriptions: [], reports: [] };
      return {
        ...prev,
        [patientId]: {
          ...current,
          visits: [{ ...visit, id: 'v_' + Date.now() }, ...current.visits],
        },
      };
    });
    showToast('Medical visit logged.', 'success');
  };

  const addCasePrescription = (patientId: string, doc: Omit<CaseDocument, 'id'>) => {
    setCases((prev) => {
      const current = prev[patientId] || { patientId, visits: [], prescriptions: [], reports: [] };
      return {
        ...prev,
        [patientId]: {
          ...current,
          prescriptions: [{ ...doc, id: 'pr_' + Date.now() }, ...current.prescriptions],
        },
      };
    });
    showToast('Prescription saved.', 'success');
  };

  const addCaseReport = (patientId: string, doc: Omit<CaseDocument, 'id'>) => {
    setCases((prev) => {
      const current = prev[patientId] || { patientId, visits: [], prescriptions: [], reports: [] };
      return {
        ...prev,
        [patientId]: {
          ...current,
          reports: [{ ...doc, id: 'rp_' + Date.now() }, ...current.reports],
        },
      };
    });
    showToast('Medical report saved.', 'success');
  };

  const requestCaseAccess = (patientId: string, hospitalId: string) => {
    const existingRequest = accessRequests.find(
      (request) =>
        request.patientId === patientId &&
        request.hospitalId === hospitalId &&
        (request.status === 'pending' || request.status === 'approved')
    );
    if (existingRequest) {
      showToast('An active access request already exists for this patient.', 'amber');
      return;
    }

    const hospital = hospitals.find((item) => item.id === hospitalId);
    if (!hospital) {
      showToast('Unable to identify this hospital for the access request.', 'error');
      return;
    }

    setAccessRequests((prev) => [
      {
        id: 'ar_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
        patientId,
        hospitalId,
        hospitalName: hospital.name,
        status: 'pending',
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);
    showToast('Case access request sent to the patient.', 'success');
  };

  const updateCaseAccessRequest = (id: string, status: AccessRequest['status']) => {
    setAccessRequests((prev) =>
      prev.map((request) => (request.id === id ? { ...request, status } : request))
    );
    showToast(
      status === 'approved' ? 'Hospital access approved.' : 'Hospital access request declined.',
      status === 'approved' ? 'success' : 'amber'
    );
  };

  const formatCurrency = (val: number): string => {
    return '₹' + (val || 0).toLocaleString();
  };

  const formatDate = (dateStr: string): string => {
    if (!dateStr) return '';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        return d.toLocaleDateString(
          lang === 'ta'
            ? 'ta-IN'
            : lang === 'hi'
            ? 'hi-IN'
            : lang === 'es'
            ? 'es-ES'
            : lang === 'fr'
            ? 'fr-FR'
            : lang === 'de'
            ? 'de-DE'
            : 'en-US',
          {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          }
        );
      }
    } catch {}
    return dateStr;
  };

  return (
    <AppContext.Provider
      value={{
        lang,
        setLang,
        t,
        view,
        setView,
        activeHospitalId,
        setActiveHospitalId,
        citizenTab,
        setCitizenTab,
        adminTab,
        setAdminTab,
        citizenUser,
        adminUser,
        loginCitizen,
        logoutCitizen,
        loginAdmin,
        logoutAdmin,
        hospitals,
        invoices,
        appointments,
        ambulanceRequests,
        cases,
        accessRequests,
        addInvoice,
        updateInvoice,
        recordInvoicePayment,
        payCitizenInvoice,
        formatCurrency,
        formatDate,
        addAppointment,
        updateAppointmentStatus,
        addAmbulanceRequest,
        updateAmbulanceStatus,
        updateBed,
        addWard,
        deleteWard,
        addStaff,
        updateStaff,
        deleteStaff,
        updateHospital,
        getPatientCase,
        addCaseVisit,
        addCasePrescription,
        addCaseReport,
        requestCaseAccess,
        updateCaseAccessRequest,
        toasts,
        showToast,
        removeToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
