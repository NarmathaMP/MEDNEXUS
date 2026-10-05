import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Hospital, BillInvoice } from '../types';
import { InvoiceModal } from './InvoiceModal';
import {
  Search,
  Calendar,
  CreditCard,
  FileText,
  User,
  MapPin,
  Bed,
  CheckCircle2,
  Clock,
  Copy,
  Receipt,
  Download,
  AlertCircle,
  Upload,
  X,
} from 'lucide-react';

const SPECIALTIES = ['All', 'Cardiology', 'Orthopedics', 'Pediatrics', 'General', 'Neurology', 'ENT'];
const TIME_SLOTS = ['09:00 AM', '10:30 AM', '12:00 PM', '02:00 PM', '03:30 PM', '05:00 PM'];

export const CitizenDash: React.FC = () => {
  const {
    t,
    citizenUser,
    citizenTab,
    setCitizenTab,
    hospitals,
    invoices,
    appointments,
    addAppointment,
    payCitizenInvoice,
    getPatientCase,
    addCaseVisit,
    addCasePrescription,
    addCaseReport,
    accessRequests,
    updateCaseAccessRequest,
    setView,
    setActiveHospitalId,
    formatCurrency,
    formatDate,
    showToast,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');

  // Appointment Modal state
  const [bookingHospital, setBookingHospital] = useState<Hospital | null>(null);
  const [bookDept, setBookDept] = useState('');
  const [bookDoctor, setBookDoctor] = useState('');
  const [bookDate, setBookDate] = useState('2026-10-05');
  const [bookTime, setBookTime] = useState(TIME_SLOTS[0]);
  const [bookReason, setBookReason] = useState('');

  // Receipt Modal state
  const [activeReceipt, setActiveReceipt] = useState<BillInvoice | null>(null);

  // Online Pay Modal state
  const [payingInvoice, setPayingInvoice] = useState<BillInvoice | null>(null);
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState<BillInvoice['paymentMethod']>('UPI');

  // Case Tracker form states
  const [showAddVisit, setShowAddVisit] = useState(false);
  const [visitHosp, setVisitHosp] = useState('');
  const [visitDate, setVisitDate] = useState('2026-10-02');
  const [visitReason, setVisitReason] = useState('');
  const [activeDocumentForm, setActiveDocumentForm] = useState<'prescription' | 'report' | null>(null);
  const [documentTitle, setDocumentTitle] = useState('');
  const [documentDate, setDocumentDate] = useState(new Date().toISOString().slice(0, 10));
  const [documentDetails, setDocumentDetails] = useState('');
  const [documentFile, setDocumentFile] = useState<File | null>(null);

  const patientId = citizenUser?.patientId || 'MN-P8921';
  const patientCase = getPatientCase(patientId);
  const myAccessRequests = accessRequests.filter((request) => request.patientId === patientId);

  const handleSaveCaseDocument = async (event: React.FormEvent) => {
    event.preventDefault();
    const documentType = activeDocumentForm;
    if (!documentType) return;
    const title = documentTitle.trim();
    if (!title) {
      showToast('Enter a title for this medical document.', 'error');
      return;
    }

    let fileData: string | undefined;
    if (documentFile) {
      if (documentFile.type !== 'application/pdf' && !documentFile.type.startsWith('image/')) {
        showToast('Attach a PDF or image file.', 'error');
        return;
      }
      if (documentFile.size > 2 * 1024 * 1024) {
        showToast('Choose a file smaller than 2 MB.', 'error');
        return;
      }

      try {
        fileData = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () =>
            typeof reader.result === 'string'
              ? resolve(reader.result)
              : reject(new Error('The selected file could not be read.'));
          reader.onerror = () => reject(reader.error || new Error('The selected file could not be read.'));
          reader.readAsDataURL(documentFile);
        });
      } catch (error) {
        showToast(error instanceof Error ? error.message : 'The selected file could not be read.', 'error');
        return;
      }
    }

    const document = {
      title,
      date: documentDate,
      details: documentDetails.trim(),
      fileName: documentFile?.name,
      fileData,
    };

    if (documentType === 'prescription') {
      addCasePrescription(patientId, document);
    } else {
      addCaseReport(patientId, document);
    }

    setActiveDocumentForm(null);
    setDocumentTitle('');
    setDocumentDate(new Date().toISOString().slice(0, 10));
    setDocumentDetails('');
    setDocumentFile(null);
  };

  // Filter Hospitals
  const filteredHospitals = hospitals.filter((h) => {
    const term = searchTerm.toLowerCase();
    const matchTerm =
      !term ||
      h.name.toLowerCase().includes(term) ||
      h.area.toLowerCase().includes(term) ||
      h.specialties.some((s) => s.toLowerCase().includes(term));
    const matchSpec = selectedSpecialty === 'All' || h.specialties.includes(selectedSpecialty);
    return matchTerm && matchSpec;
  });

  // Filter citizen's bills
  const myInvoices = invoices.filter(
    (inv) =>
      inv.patientId === patientId ||
      inv.patientName.toLowerCase() === (citizenUser?.name || '').toLowerCase()
  );

  const totalBilled = myInvoices.reduce((s, inv) => s + inv.totalAmount, 0);
  const totalPaid = myInvoices.reduce((s, inv) => s + inv.amountPaid, 0);
  const totalDue = myInvoices.reduce((s, inv) => s + inv.balanceDue, 0);

  // Filter citizen's appointments
  const myAppointments = appointments.filter(
    (a) =>
      (a.patientId && a.patientId === patientId) ||
      a.patientName.toLowerCase() === (citizenUser?.name || '').toLowerCase()
  );

  const handleStartBooking = (h: Hospital) => {
    setBookingHospital(h);
    setBookDept(h.specialties[0] || 'General');
    setBookDoctor(h.doctors[0]?.name || 'Attending Physician');
  };

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingHospital) return;

    addAppointment({
      hospitalId: bookingHospital.id,
      hospitalName: bookingHospital.name,
      patientName: citizenUser?.name || 'Citizen',
      patientId,
      dept: bookDept,
      doctor: bookDoctor,
      date: bookDate,
      time: bookTime,
      reason: bookReason || 'General medical consultation',
      status: 'Pending',
    });

    setBookingHospital(null);
    setCitizenTab('appts');
  };

  const handleOpenPay = (inv: BillInvoice) => {
    setPayingInvoice(inv);
    setPayAmount(inv.balanceDue);
  };

  const handleExecutePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingInvoice) return;
    payCitizenInvoice(payingInvoice.id, payAmount, payMethod);
    setPayingInvoice(null);
  };

  return (
    <div className="min-h-screen text-slate-100 pb-20">
      {/* Top Header */}
      <div className="bg-slate-950/80 border-b border-slate-800/80 py-8 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">
                {t('hello', 'Hello')}, {citizenUser?.name || 'Citizen'}
              </h2>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-500/30">
                {patientId}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {t('citizenDashSub', 'Search by specialty, distance or availability, then book straight from the list.')}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setView('ambulance')}
              className="inline-flex items-center gap-2 py-2 px-3.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-xs font-bold text-amber-300 transition-colors cursor-pointer"
            >
              <span>🚑</span>
              <span>{t('ambulance', 'Ambulance')}</span>
            </button>
            <button
              onClick={() => setView('careAi')}
              className="inline-flex items-center gap-2 py-2 px-3.5 rounded-xl bg-fuchsia-500/10 hover:bg-fuchsia-500/20 border border-fuchsia-500/30 text-xs font-bold text-fuchsia-300 transition-colors cursor-pointer"
            >
              <span>🤖</span>
              <span>{t('careAi', 'Care AI')}</span>
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="max-w-6xl mx-auto mt-6 flex overflow-x-auto gap-2 border-b border-slate-800">
          {[
            { id: 'search', label: t('searchHospitals', 'Search Hospitals'), icon: Search },
            { id: 'appts', label: t('myAppointments', 'My Appointments'), icon: Calendar, badge: myAppointments.length },
            { id: 'bills', label: t('myBills', 'My Bills & Payments'), icon: CreditCard, badge: myInvoices.length },
            { id: 'cases', label: t('caseTracker', 'Case Tracker'), icon: FileText },
            { id: 'profile', label: t('myProfile', 'My Profile'), icon: User },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = citizenTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setCitizenTab(tab.id)}
                className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  active
                    ? 'border-cyan-400 text-cyan-400 font-bold bg-cyan-950/20'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    active ? 'bg-cyan-400 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Tab View Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 mt-8">
        {/* ================= TAB: SEARCH HOSPITALS ================= */}
        {citizenTab === 'search' && (
          <div className="space-y-6">
            {/* Search Input & Specialty Filters */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={t('searchPlaceholder', 'Search hospitals by name, area or specialty…')}
                  className="w-full pl-11 pr-4 py-3 bg-slate-800/80 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
                />
              </div>

              {/* Specialty Chips */}
              <div className="flex items-center gap-2 flex-wrap text-xs">
                <span className="text-slate-400 font-medium mr-1">{t('filterLabel', 'Specialty:')}</span>
                {SPECIALTIES.map((spec) => (
                  <button
                    key={spec}
                    onClick={() => setSelectedSpecialty(spec)}
                    className={`py-1.5 px-3 rounded-lg border transition-colors cursor-pointer ${
                      selectedSpecialty === spec
                        ? 'bg-cyan-950 text-cyan-300 border-cyan-400 font-bold'
                        : 'bg-slate-800/60 text-slate-400 border-slate-700 hover:text-white'
                    }`}
                  >
                    {spec === 'All' ? t('all', 'All') : spec}
                  </button>
                ))}
              </div>
            </div>

            {/* Hospital Cards List */}
            {filteredHospitals.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-slate-900 border border-dashed border-slate-800 space-y-2">
                <p className="text-sm font-semibold text-slate-300">
                  {t('noHospitalsFound', 'No hospitals match that search.')}
                </p>
                <p className="text-xs text-slate-500">
                  {t('tryDifferentSearch', 'Try a different name, area, or specialty.')}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredHospitals.map((h) => {
                  const g = h.beds.General || { total: 0, available: 0 };
                  const icu = h.beds.ICU || { total: 0, available: 0 };
                  const low = g.total ? g.available / g.total <= 0.15 : true;
                  const occ = g.total ? Math.round(((g.total - g.available) / g.total) * 100) : 0;

                  return (
                    <div
                      key={h.id}
                      className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col justify-between space-y-5"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="text-base font-bold text-white font-serif">{h.name}</h3>
                            <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                              {h.area} &middot; {h.distanceKm} km away
                            </p>
                          </div>
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                            ★ {h.rating || 4.7}
                          </span>
                        </div>

                        {/* Specialties */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {h.specialties.map((s) => (
                            <span
                              key={s}
                              className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-800/80 text-cyan-400 border border-cyan-900/40"
                            >
                              {s}
                            </span>
                          ))}
                        </div>

                        {/* Beds Indicator */}
                        <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                low ? 'bg-rose-400 shadow-rose-400' : 'bg-emerald-400 shadow-emerald-400'
                              } shadow-sm`}
                            />
                            <span className={low ? 'text-rose-300 font-semibold' : 'text-emerald-300 font-semibold'}>
                              {g.available > 0
                                ? `${g.available} ${t('generalBedsAvailable', 'general beds available')}`
                                : t('noGeneralBedsFree', 'No general beds free')}
                            </span>
                          </div>
                          <span className="text-[11px] font-mono text-slate-400">
                            ICU: <strong className="text-white">{icu.available}/{icu.total}</strong>
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                        <span className="text-slate-400 font-mono">
                          {occ}% {t('occupied', 'occupied')}
                        </span>
                        <button
                          onClick={() => handleStartBooking(h)}
                          className="py-2 px-4 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-cyan-300 hover:from-cyan-300 hover:to-cyan-200 transition-all cursor-pointer shadow-md shadow-cyan-500/10"
                        >
                          {t('viewAndBook', 'View & book →')}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ================= TAB: MY APPOINTMENTS ================= */}
        {citizenTab === 'appts' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-bold text-white font-serif">
                {t('myAppointments', 'My Appointments')} ({myAppointments.length})
              </h3>
              <button
                onClick={() => setCitizenTab('search')}
                className="text-xs font-semibold text-cyan-400 hover:underline cursor-pointer"
              >
                + Book New Appointment
              </button>
            </div>

            {myAppointments.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-slate-900 border border-dashed border-slate-800 space-y-2">
                <Calendar className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-sm font-semibold text-slate-300">No appointments booked yet.</p>
                <p className="text-xs text-slate-500">
                  Search a hospital in the catalog and request an appointment.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {myAppointments.map((appt) => (
                  <div
                    key={appt.id}
                    className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{appt.hospitalName}</span>
                        <span className="text-slate-500">&middot;</span>
                        <span className="text-xs font-semibold text-cyan-400">{appt.dept}</span>
                      </div>
                      <p className="text-xs text-slate-300">
                        Doctor: <strong>{appt.doctor}</strong> &middot; 📅 {appt.date} @ {appt.time}
                      </p>
                      {appt.reason && (
                        <p className="text-xs text-slate-500 italic">Note: {appt.reason}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 sm:self-center">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                          appt.status === 'Confirmed'
                            ? 'bg-emerald-950/70 text-emerald-400 border border-emerald-500/30'
                            : appt.status === 'Rejected'
                            ? 'bg-rose-950/70 text-rose-400 border border-rose-500/30'
                            : 'bg-amber-950/70 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {appt.status === 'Confirmed' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                        {appt.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= TAB: MY BILLS & PAYMENTS ================= */}
        {citizenTab === 'bills' && (
          <div className="space-y-6">
            {/* KPI Summary for Citizen */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-xs uppercase font-semibold text-slate-400">Total Invoiced</span>
                <p className="font-serif text-2xl font-bold text-white">{formatCurrency(totalBilled)}</p>
                <p className="text-[11px] text-slate-500">Across all hospitals & visits</p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-xs uppercase font-semibold text-slate-400">Total Paid by You</span>
                <p className="font-serif text-2xl font-bold text-emerald-400">{formatCurrency(totalPaid)}</p>
                <p className="text-[11px] text-emerald-500/80">Confirmed cleared payments</p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-xs uppercase font-semibold text-slate-400">Outstanding Balance</span>
                <p className={`font-serif text-2xl font-bold ${totalDue > 0 ? 'text-rose-400' : 'text-slate-300'}`}>
                  {formatCurrency(totalDue)}
                </p>
                <p className="text-[11px] text-slate-500">{totalDue > 0 ? 'Pay online or at hospital desk' : 'All accounts settled'}</p>
              </div>
            </div>

            {/* Invoices List */}
            <div className="space-y-4">
              <h3 className="text-base font-bold text-white font-serif flex items-center justify-between">
                <span>Treatment Invoices &amp; Receipts ({myInvoices.length})</span>
                <span className="text-xs font-normal text-slate-400 font-sans">
                  Patient ID: <strong className="text-cyan-400 font-mono">{patientId}</strong>
                </span>
              </h3>

              {myInvoices.length === 0 ? (
                <div className="p-12 text-center rounded-2xl bg-slate-900 border border-dashed border-slate-800 space-y-2">
                  <Receipt className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-sm font-semibold text-slate-300">No medical bills recorded yet.</p>
                  <p className="text-xs text-slate-500">
                    When hospitals bill you for consultations, beds, or medicines, they will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {myInvoices.map((inv) => {
                    const isFullyPaid = inv.balanceDue === 0;

                    return (
                      <div
                        key={inv.id}
                        className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                              {inv.invoiceNumber}
                            </span>
                            <span className="text-sm font-bold text-white">{inv.hospitalName}</span>
                            <span className="text-slate-500">&middot;</span>
                            <span className="text-xs text-slate-400">{inv.department}</span>
                          </div>

                          <p className="text-xs text-slate-400">
                            📅 {formatDate(inv.date)} &middot; Items: {inv.items.map((i) => i.description).join(', ')}
                          </p>

                          <div className="flex items-center gap-3 text-xs pt-1 font-mono">
                            <span className="text-slate-300">
                              Billed: <strong className="text-white">{formatCurrency(inv.totalAmount)}</strong>
                            </span>
                            <span className="text-emerald-400">
                              Paid: <strong>{formatCurrency(inv.amountPaid)}</strong>
                            </span>
                            {inv.balanceDue > 0 && (
                              <span className="text-rose-400">
                                Due: <strong>{formatCurrency(inv.balanceDue)}</strong>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 sm:self-center">
                          <button
                            onClick={() => setActiveReceipt(inv)}
                            className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
                          >
                            <FileText className="w-3.5 h-3.5 text-cyan-400" />
                            {t('viewReceipt', 'View Receipt')}
                          </button>

                          {!isFullyPaid && (
                            <button
                              onClick={() => handleOpenPay(inv)}
                              className="inline-flex items-center gap-1.5 py-1.5 px-4 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-emerald-500/10 cursor-pointer"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                              Pay {formatCurrency(inv.balanceDue)}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= TAB: CASE TRACKER ================= */}
        {citizenTab === 'cases' && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-gradient-to-r from-cyan-950/60 to-slate-900 border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold tracking-widest text-cyan-400 uppercase">
                  {t('uniquePatientId', 'YOUR UNIQUE PATIENT ID')}
                </span>
                <h3 className="text-2xl font-mono font-bold text-white tracking-wider">{patientId}</h3>
                <p className="text-xs text-slate-300 max-w-lg">
                  {t(
                    'shareIdNotice',
                    'Share this ID with a hospital only when you want them to request access. You approve every edit.'
                  )}
                </p>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(patientId);
                  alert('Patient ID copied to clipboard!');
                }}
                className="inline-flex items-center gap-1.5 py-2 px-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-white transition-colors cursor-pointer self-start sm:self-center"
              >
                <Copy className="w-3.5 h-3.5 text-cyan-400" />
                Copy ID
              </button>
            </div>

            <section className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div>
                <h4 className="text-sm font-bold text-white font-serif">
                  {t('hospitalAccessRequests', 'Hospital access requests')} ({myAccessRequests.filter((request) => request.status === 'pending').length})
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Review and approve hospitals that request access to your case.
                </p>
              </div>
              {myAccessRequests.length === 0 ? (
                <p className="text-xs text-slate-500">No hospitals have requested access to your case.</p>
              ) : (
                <div className="space-y-3">
                  {myAccessRequests.map((request) => (
                    <div
                      key={request.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-800/60 border border-slate-700"
                    >
                      <div className="space-y-1">
                        <strong className="text-sm text-white">{request.hospitalName}</strong>
                        <p className="text-[11px] text-slate-400">
                          Requested {formatDate(request.createdAt.slice(0, 10))} · Patient ID {request.patientId}
                        </p>
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            request.status === 'approved'
                              ? 'bg-emerald-950 text-emerald-400'
                              : request.status === 'denied'
                                ? 'bg-rose-950 text-rose-400'
                                : 'bg-amber-950 text-amber-400'
                          }`}
                        >
                          {request.status}
                        </span>
                      </div>
                      {request.status === 'pending' && (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => updateCaseAccessRequest(request.id, 'approved')}
                            className="py-2 px-3 rounded-lg bg-emerald-400 text-slate-950 text-xs font-bold hover:bg-emerald-300 cursor-pointer"
                          >
                            {t('allowAccess', 'Allow access')}
                          </button>
                          <button
                            type="button"
                            onClick={() => updateCaseAccessRequest(request.id, 'denied')}
                            className="py-2 px-3 rounded-lg bg-slate-700 text-slate-200 text-xs font-semibold hover:bg-slate-600 cursor-pointer"
                          >
                            {t('decline', 'Decline')}
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Visits Section */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white font-serif">
                  {t('hospitalVisits', 'Hospital Visits')} ({patientCase.visits.length})
                </h4>
                <button
                  onClick={() => setShowAddVisit((prev) => !prev)}
                  className="text-xs text-cyan-400 hover:underline cursor-pointer"
                >
                  {showAddVisit ? 'Cancel' : '+ Add Visit Note'}
                </button>
              </div>

              {showAddVisit && (
                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 space-y-3 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Hospital Name (e.g. City Care)"
                      value={visitHosp}
                      onChange={(e) => setVisitHosp(e.target.value)}
                      className="py-2 px-3 bg-slate-800 border border-slate-700 rounded-lg text-white"
                    />
                    <input
                      type="date"
                      value={visitDate}
                      onChange={(e) => setVisitDate(e.target.value)}
                      className="py-2 px-3 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono"
                    />
                  </div>
                  <textarea
                    rows={2}
                    placeholder="Reason or diagnosis details"
                    value={visitReason}
                    onChange={(e) => setVisitReason(e.target.value)}
                    className="w-full py-2 px-3 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                  <button
                    onClick={() => {
                      if (!visitHosp || !visitReason) return;
                      addCaseVisit(patientId, { hospital: visitHosp, date: visitDate, reason: visitReason });
                      setShowAddVisit(false);
                      setVisitHosp('');
                      setVisitReason('');
                    }}
                    className="py-1.5 px-4 rounded-lg bg-cyan-400 text-slate-950 font-bold cursor-pointer"
                  >
                    Save Visit Record
                  </button>
                </div>
              )}

              {patientCase.visits.length === 0 ? (
                <p className="text-xs text-slate-500">No hospital visits recorded yet.</p>
              ) : (
                <div className="divide-y divide-slate-800">
                  {patientCase.visits.map((v) => (
                    <div key={v.id} className="py-3 space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <strong className="text-white">{v.hospital}</strong>
                        <span className="text-slate-500 font-mono">{v.date}</span>
                      </div>
                      <p className="text-slate-400">{v.reason}</p>
                      {v.diagnosis && <p className="text-cyan-400 text-[11px]">Diagnosis: {v.diagnosis}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Prescriptions & Reports */}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setActiveDocumentForm(activeDocumentForm === 'prescription' ? null : 'prescription')}
                className="inline-flex items-center gap-2 py-2 px-3 rounded-lg bg-cyan-400 text-slate-950 text-xs font-bold hover:bg-cyan-300 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                {t('addPrescription', 'Add prescription')}
              </button>
              <button
                type="button"
                onClick={() => setActiveDocumentForm(activeDocumentForm === 'report' ? null : 'report')}
                className="inline-flex items-center gap-2 py-2 px-3 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 text-xs font-bold hover:bg-slate-700 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-cyan-400" />
                {t('addReport', 'Add report')}
              </button>
            </div>

            {activeDocumentForm && (
              <form
                onSubmit={handleSaveCaseDocument}
                className="p-5 rounded-2xl bg-slate-900 border border-cyan-500/30 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white">
                    {activeDocumentForm === 'prescription' ? 'Add prescription' : 'Add medical report'}
                  </h4>
                  <button
                    type="button"
                    onClick={() => setActiveDocumentForm(null)}
                    className="p-1 text-slate-400 hover:text-white cursor-pointer"
                    aria-label="Cancel adding document"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    required
                    value={documentTitle}
                    onChange={(event) => setDocumentTitle(event.target.value)}
                    placeholder={activeDocumentForm === 'prescription' ? 'Prescription or medicine name' : 'Report name'}
                    className="py-2 px-3 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs"
                  />
                  <input
                    required
                    type="date"
                    value={documentDate}
                    onChange={(event) => setDocumentDate(event.target.value)}
                    className="py-2 px-3 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs"
                  />
                </div>
                <textarea
                  rows={2}
                  value={documentDetails}
                  onChange={(event) => setDocumentDetails(event.target.value)}
                  placeholder="Dosage, instructions, findings, or notes"
                  className="w-full py-2 px-3 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs"
                />
                <label className="block text-xs text-slate-300">
                  Attach file (PDF or image, up to 2 MB)
                  <input
                    type="file"
                    accept="application/pdf,image/*"
                    onChange={(event) => setDocumentFile(event.target.files?.[0] || null)}
                    className="block w-full mt-1 text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-slate-700 file:text-white file:font-semibold"
                  />
                </label>
                {documentFile && <p className="text-[11px] text-cyan-300">{documentFile.name}</p>}
                <button
                  type="submit"
                  className="py-2 px-4 rounded-lg bg-cyan-400 text-slate-950 text-xs font-bold hover:bg-cyan-300 cursor-pointer"
                >
                  Save {activeDocumentForm}
                </button>
              </form>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <h4 className="text-sm font-bold text-white font-serif">
                  {t('prescriptions', 'Prescriptions')} ({patientCase.prescriptions.length})
                </h4>
                {patientCase.prescriptions.length === 0 ? (
                  <p className="text-xs text-slate-500">No prescriptions stored.</p>
                ) : (
                  <div className="divide-y divide-slate-800">
                    {patientCase.prescriptions.map((pr) => (
                      <div key={pr.id} className="py-2.5 text-xs space-y-0.5">
                        <strong className="text-white block">{pr.title}</strong>
                        <p className="text-slate-400 text-[11px]">{pr.details}</p>
                        <span className="text-slate-500 font-mono text-[10px]">{pr.date}</span>
                        {pr.fileData && pr.fileName && (
                          <a href={pr.fileData} download={pr.fileName} className="block text-cyan-400 hover:underline">
                            Download {pr.fileName}
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <h4 className="text-sm font-bold text-white font-serif">
                  {t('reportsDocs', 'Medical Reports & Lab Tests')} ({patientCase.reports.length})
                </h4>
                {patientCase.reports.length === 0 ? (
                  <p className="text-xs text-slate-500">No medical test reports uploaded.</p>
                ) : (
                  <div className="divide-y divide-slate-800">
                    {patientCase.reports.map((rp) => (
                      <div key={rp.id} className="py-2.5 text-xs space-y-0.5">
                        <strong className="text-white block">{rp.title}</strong>
                        <p className="text-slate-400 text-[11px]">{rp.details}</p>
                        <span className="text-slate-500 font-mono text-[10px]">{rp.date}</span>
                        {rp.fileData && rp.fileName && (
                          <a href={rp.fileData} download={rp.fileName} className="block text-cyan-400 hover:underline">
                            Download {rp.fileName}
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB: MY PROFILE ================= */}
        {citizenTab === 'profile' && (
          <div className="max-w-xl mx-auto p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
            <div className="space-y-1">
              <h3 className="text-xl font-bold font-serif text-white">Patient Profile</h3>
              <p className="text-xs text-slate-400">Keep your personal contact information accurate.</p>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  defaultValue={citizenUser?.name || 'Priya Sharma'}
                  className="w-full py-2.5 px-3 bg-slate-800 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Phone / Email
                </label>
                <input
                  type="text"
                  defaultValue={citizenUser?.contact || ''}
                  className="w-full py-2.5 px-3 bg-slate-800 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  MedNexus Patient ID
                </label>
                <input
                  type="text"
                  disabled
                  value={patientId}
                  className="w-full py-2.5 px-3 bg-slate-800/50 border border-slate-700 rounded-xl text-cyan-400 font-mono font-bold"
                />
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => alert('Profile changes saved successfully!')}
                  className="py-2.5 px-6 rounded-xl text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition-colors cursor-pointer"
                >
                  Save Profile Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Appointment Booking Modal */}
      {bookingHospital && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white font-serif">
                  {t('bookAppointment', 'Book an Appointment')}
                </h3>
                <p className="text-xs text-slate-400">
                  {bookingHospital.name} &middot; {bookingHospital.area}
                </p>
              </div>
              <button
                onClick={() => setBookingHospital(null)}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmBooking} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  {t('department', 'Department')}
                </label>
                <select
                  value={bookDept}
                  onChange={(e) => setBookDept(e.target.value)}
                  className="w-full py-2 px-3 bg-slate-800 border border-slate-700 rounded-lg text-white"
                >
                  {bookingHospital.specialties.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  {t('doctor', 'Doctor')}
                </label>
                <select
                  value={bookDoctor}
                  onChange={(e) => setBookDoctor(e.target.value)}
                  className="w-full py-2 px-3 bg-slate-800 border border-slate-700 rounded-lg text-white"
                >
                  {bookingHospital.doctors.map((d) => (
                    <option key={d.id} value={d.name}>
                      {d.name} ({d.role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    {t('preferredDate', 'Preferred Date')}
                  </label>
                  <input
                    type="date"
                    required
                    value={bookDate}
                    onChange={(e) => setBookDate(e.target.value)}
                    className="w-full py-2 px-3 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    {t('timeSlot', 'Time Slot')}
                  </label>
                  <select
                    value={bookTime}
                    onChange={(e) => setBookTime(e.target.value)}
                    className="w-full py-2 px-3 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  >
                    {TIME_SLOTS.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  {t('reasonForVisit', 'Reason for visit')}
                </label>
                <textarea
                  rows={2}
                  value={bookReason}
                  onChange={(e) => setBookReason(e.target.value)}
                  placeholder="Brief note for the attending doctor…"
                  className="w-full py-2 px-3 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setBookingHospital(null)}
                  className="py-2 px-4 rounded-lg bg-slate-800 text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-5 rounded-lg bg-cyan-400 text-slate-950 font-bold hover:bg-cyan-300 transition-colors cursor-pointer"
                >
                  {t('requestAppointment', 'Request appointment →')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Online Pay Modal */}
      {payingInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-400" />
                Pay Medical Bill Online
              </h3>
              <button
                onClick={() => setPayingInvoice(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 space-y-1">
              <p className="text-slate-300 font-semibold">{payingInvoice.hospitalName}</p>
              <p className="text-slate-400 font-mono text-[11px]">Invoice: {payingInvoice.invoiceNumber}</p>
              <div className="flex justify-between pt-1 text-sm font-bold">
                <span className="text-slate-300">Remaining Balance:</span>
                <span className="text-rose-400 font-mono">₹{payingInvoice.balanceDue.toLocaleString()}</span>
              </div>
            </div>

            <form onSubmit={handleExecutePayment} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Amount to Pay (₹)
                </label>
                <input
                  type="number"
                  min="1"
                  max={payingInvoice.balanceDue}
                  required
                  value={payAmount}
                  onChange={(e) => setPayAmount(Math.min(payingInvoice.balanceDue, Number(e.target.value)))}
                  className="w-full py-2 px-3 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono font-bold text-sm"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Payment Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['UPI', 'Card', 'NetBanking'] as const).map((m) => (
                    <button
                      type="button"
                      key={m}
                      onClick={() => setPayMethod(m)}
                      className={`py-2 px-2 text-xs font-semibold rounded-lg border transition-colors cursor-pointer text-center ${
                        payMethod === m
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-400 font-bold'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPayingInvoice(null)}
                  className="py-2 px-4 rounded-lg bg-slate-800 text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-5 rounded-lg bg-emerald-400 text-slate-950 font-bold hover:bg-emerald-300 transition-colors cursor-pointer"
                >
                  Confirm Payment of ₹{payAmount.toLocaleString()} &rarr;
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoice Receipt Modal */}
      <InvoiceModal invoice={activeReceipt} onClose={() => setActiveReceipt(null)} />
    </div>
  );
};
