import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Hospital, BillInvoice, Staff } from '../types';
import { InvoiceModal } from './InvoiceModal';
import { CreateBillModal } from './CreateBillModal';
import { RecordPaymentModal } from './RecordPaymentModal';
import { DailyReportPrintModal } from './DailyReportPrintModal';
import {
  Bed,
  Users,
  Calendar,
  Truck,
  Receipt,
  FileText,
  Building2,
  BarChart3,
  Search,
  Plus,
  Printer,
  CheckCircle2,
  AlertCircle,
  Clock,
  CreditCard,
  DollarSign,
  CalendarDays,
  UserCheck,
  Download,
  Filter,
} from 'lucide-react';

export const AdminDash: React.FC = () => {
  const {
    t,
    adminUser,
    adminTab,
    setAdminTab,
    hospitals,
    invoices,
    appointments,
    ambulanceRequests,
    accessRequests,
    updateBed,
    addWard,
    deleteWard,
    addStaff,
    updateStaff,
    deleteStaff,
    updateAppointmentStatus,
    updateAmbulanceStatus,
    updateHospital,
    getPatientCase,
    requestCaseAccess,
    formatCurrency,
    formatDate,
  } = useApp();

  const currentHospital: Hospital =
    hospitals.find((h) => h.id === adminUser?.hospitalId) || hospitals[0];

  // Billing Tab States
  const [billingSubView, setBillingSubView] = useState<'day' | 'patient'>('day');
  const [selectedBillingDate, setSelectedBillingDate] = useState<string>('2026-10-02');
  const [daySearchTerm, setDaySearchTerm] = useState<string>('');
  const [patientSearchTerm, setPatientSearchTerm] = useState<string>('');
  const [selectedPatientId, setSelectedPatientId] = useState<string>('MN-P8921');
  const [patientBillFilter, setPatientBillFilter] = useState<'All' | 'Due' | 'Paid'>('All');

  // Modals
  const [viewingReceipt, setViewingReceipt] = useState<BillInvoice | null>(null);
  const [showCreateBillModal, setShowCreateBillModal] = useState<boolean>(false);
  const [recordingPaymentInvoice, setRecordingPaymentInvoice] = useState<BillInvoice | null>(null);
  const [showDailyPrintReport, setShowDailyPrintReport] = useState<boolean>(false);

  // Ward Add Form State
  const [newWardName, setNewWardName] = useState('');
  const [newWardTotal, setNewWardTotal] = useState(10);

  // Staff Add Form State
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffRole, setNewStaffRole] = useState('');
  const [newStaffShift, setNewStaffShift] = useState<'Day' | 'Night'>('Day');

  // Hospital Profile Form State
  const [profName, setProfName] = useState(currentHospital.name);
  const [profArea, setProfArea] = useState(currentHospital.area);
  const [profSpecialties, setProfSpecialties] = useState(currentHospital.specialties.join(', '));

  // Case Tracker Search State
  const [caseSearchId, setCaseSearchId] = useState('');
  const [caseSearchResult, setCaseSearchResult] = useState<any>(null);

  // Hospital-specific Invoices
  const hospitalInvoices = invoices.filter((inv) => inv.hospitalId === currentHospital.id);

  // 1. Day-Wise Invoices
  const dayInvoices = hospitalInvoices.filter((inv) => inv.date === selectedBillingDate);
  const dayTotalCollected = dayInvoices.reduce((sum, inv) => sum + inv.amountPaid, 0);
  const dayTotalBilled = dayInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
  const dayInvoicesCount = dayInvoices.length;
  const uniquePatientsOnDay = new Set(dayInvoices.map((inv) => inv.patientId)).size;
  const avgBillSize = dayInvoicesCount > 0 ? Math.round(dayTotalBilled / dayInvoicesCount) : 0;

  // Day Payment Mode Breakdown
  const paymentModeStats = {
    Cash: dayInvoices.filter((i) => i.paymentMethod === 'Cash').reduce((s, i) => s + i.amountPaid, 0),
    Card: dayInvoices.filter((i) => i.paymentMethod === 'Card').reduce((s, i) => s + i.amountPaid, 0),
    UPI: dayInvoices.filter((i) => i.paymentMethod === 'UPI' || i.paymentMethod === 'NetBanking').reduce((s, i) => s + i.amountPaid, 0),
    Insurance: dayInvoices.filter((i) => i.paymentMethod === 'Insurance').reduce((s, i) => s + i.amountPaid, 0),
  };

  // 2. Patient-Wise Invoices (All unique patients treated at this hospital)
  const patientMap = new Map<string, { name: string; patientId: string; contact?: string; totalBilled: number; totalPaid: number; balanceDue: number; invoiceCount: number }>();
  hospitalInvoices.forEach((inv) => {
    const existing = patientMap.get(inv.patientId) || {
      name: inv.patientName,
      patientId: inv.patientId,
      contact: inv.patientContact,
      totalBilled: 0,
      totalPaid: 0,
      balanceDue: 0,
      invoiceCount: 0,
    };
    existing.totalBilled += inv.totalAmount;
    existing.totalPaid += inv.amountPaid;
    existing.balanceDue += inv.balanceDue;
    existing.invoiceCount += 1;
    patientMap.set(inv.patientId, existing);
  });

  const patientList = Array.from(patientMap.values()).filter((p) => {
    const term = patientSearchTerm.toLowerCase();
    return (
      !term ||
      p.name.toLowerCase().includes(term) ||
      p.patientId.toLowerCase().includes(term) ||
      (p.contact && p.contact.includes(term))
    );
  });

  // Filtered Day Invoices
  const filteredDayInvoices = dayInvoices.filter((inv) => {
    const term = daySearchTerm.toLowerCase();
    return (
      !term ||
      inv.invoiceNumber.toLowerCase().includes(term) ||
      inv.patientName.toLowerCase().includes(term) ||
      inv.patientId.toLowerCase().includes(term) ||
      inv.department.toLowerCase().includes(term)
    );
  });

  // Selected Patient's Billing History at this hospital
  const selectedPatientInvoices = hospitalInvoices.filter((inv) => inv.patientId === selectedPatientId);
  const selectedPatientSummary = patientMap.get(selectedPatientId);

  const filteredPatientInvoices = selectedPatientInvoices.filter((inv) => {
    if (patientBillFilter === 'Due') return inv.balanceDue > 0;
    if (patientBillFilter === 'Paid') return inv.balanceDue === 0;
    return true;
  });

  // Hospital Appointments
  const hospitalAppointments = appointments.filter((a) => a.hospitalId === currentHospital.id);

  // Beds Calculation
  const totalBeds = Object.values(currentHospital.beds).reduce((s, b) => s + b.total, 0);
  const availBeds = Object.values(currentHospital.beds).reduce((s, b) => s + b.available, 0);
  const occupancyPct = totalBeds ? Math.round(((totalBeds - availBeds) / totalBeds) * 100) : 0;

  return (
    <div className="min-h-screen text-slate-100 pb-20">
      {/* Top Bar Banner */}
      <div className="bg-slate-950/90 border-b border-slate-800 py-6 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold font-serif text-white">{currentHospital.name}</h2>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-950 text-amber-400 border border-amber-500/30">
                {t('roleAdmin', 'Hospital Admin')}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {t('adminTopSub', 'Verified hospital administrator console')} &middot; Area: {currentHospital.area}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-400 px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              LIVE TELEMETRY
            </span>
          </div>
        </div>

        {/* Admin Tabs */}
        <div className="max-w-6xl mx-auto mt-6 flex overflow-x-auto gap-2 border-b border-slate-800">
          {[
            { id: 'billing', label: t('tabBilling', 'Billing & Invoices'), icon: Receipt, highlight: true },
            { id: 'beds', label: t('tabBeds', 'Beds'), icon: Bed },
            { id: 'staff', label: t('tabStaff', 'Staff'), icon: Users },
            { id: 'appts', label: t('tabAppointments', 'Appointments'), icon: Calendar, badge: hospitalAppointments.filter((a) => a.status === 'Pending').length },
            { id: 'ambulance', label: t('tabAmbulance', 'Ambulance'), icon: Truck, badge: ambulanceRequests.filter((r) => r.status === 'Awaiting dispatch').length },
            { id: 'cases', label: t('tabCaseTracker', 'Case Tracker'), icon: FileText },
            { id: 'profile', label: t('tabHospitalProfile', 'Hospital Profile'), icon: Building2 },
            { id: 'reports', label: t('tabReports', 'Reports & Analytics'), icon: BarChart3 },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = adminTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setAdminTab(tab.id)}
                className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  active
                    ? tab.highlight
                      ? 'border-cyan-400 text-cyan-300 font-bold bg-cyan-950/30'
                      : 'border-amber-400 text-amber-300 font-bold bg-amber-950/20'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-rose-500 text-white font-bold">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Tab Body */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 mt-8">
        {/* =========================================================================
            TAB: BILLING & INVOICES (User's Primary Request)
           ========================================================================= */}
        {adminTab === 'billing' && (
          <div className="space-y-6">
            {/* Top Bar for Billing: Mode Selector + Generate Bill Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="space-y-1">
                <h3 className="text-lg font-bold font-serif text-white flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-cyan-400" />
                  {t('billingTitle', 'Hospital Billing & Invoices')}
                </h3>
                <p className="text-xs text-slate-400">
                  {t('billingSub', 'Track daily collections across the hospital and inspect itemized payment history for each patient.')}
                </p>
              </div>

              <div className="flex items-center gap-3">
                {/* Switch between Daily View and Patient-Wise Ledger */}
                <div className="flex p-1 rounded-xl bg-slate-800 border border-slate-700 text-xs font-semibold">
                  <button
                    onClick={() => setBillingSubView('day')}
                    className={`py-1.5 px-3 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                      billingSubView === 'day'
                        ? 'bg-cyan-500 text-slate-950 font-bold shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <CalendarDays className="w-3.5 h-3.5" />
                    <span>{t('dailyBillingSummary', 'Daily View (By Date)')}</span>
                  </button>
                  <button
                    onClick={() => setBillingSubView('patient')}
                    className={`py-1.5 px-3 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                      billingSubView === 'patient'
                        ? 'bg-cyan-500 text-slate-950 font-bold shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>{t('patientLedger', 'Separate Patient Ledger')}</span>
                  </button>
                </div>

                <button
                  onClick={() => setShowCreateBillModal(true)}
                  className="inline-flex items-center gap-1.5 py-2 px-4 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-fuchsia-400 hover:opacity-90 transition-all shadow-md shadow-cyan-500/20 cursor-pointer whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t('createNewBill', '+ Create Bill / Payment')}</span>
                </button>
              </div>
            </div>

            {/* -------------------------------------------------------------
                SUB-MODE 1: DAILY BILLING VIEW (Choose a specific day)
               ------------------------------------------------------------- */}
            {billingSubView === 'day' && (
              <div className="space-y-6">
                {/* Date Picker Bar with Presets */}
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-slate-300 whitespace-nowrap">
                      {t('chooseDay', 'Choose a date to view billing:')}
                    </span>
                    <input
                      type="date"
                      value={selectedBillingDate}
                      onChange={(e) => setSelectedBillingDate(e.target.value)}
                      className="py-1.5 px-3 bg-slate-800 border border-slate-700 rounded-lg text-xs font-mono font-bold text-cyan-300 focus:outline-none focus:border-cyan-400 cursor-pointer"
                    />
                  </div>

                  {/* Date Quick Presets + Print Action */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => setSelectedBillingDate('2026-10-02')}
                      className={`py-1 px-3 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                        selectedBillingDate === '2026-10-02'
                          ? 'bg-cyan-950 text-cyan-300 border-cyan-500 font-bold'
                          : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                      }`}
                    >
                      {t('today', 'Today')} (Oct 02)
                    </button>
                    <button
                      onClick={() => setSelectedBillingDate('2026-10-01')}
                      className={`py-1 px-3 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                        selectedBillingDate === '2026-10-01'
                          ? 'bg-cyan-950 text-cyan-300 border-cyan-500 font-bold'
                          : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                      }`}
                    >
                      {t('yesterday', 'Yesterday')} (Oct 01)
                    </button>
                    <button
                      onClick={() => setSelectedBillingDate('2026-09-28')}
                      className={`py-1 px-3 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                        selectedBillingDate === '2026-09-28'
                          ? 'bg-cyan-950 text-cyan-300 border-cyan-500 font-bold'
                          : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                      }`}
                    >
                      Sep 28
                    </button>
                    <button
                      onClick={() => setShowDailyPrintReport(true)}
                      className="inline-flex items-center gap-1.5 py-1 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 border border-cyan-800/80 text-cyan-300 text-xs font-semibold cursor-pointer shadow-sm transition-colors"
                      title="Print or Export Full Daily Statement"
                    >
                      <Printer className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Print Day Statement</span>
                    </button>
                  </div>
                </div>

                {/* Day Summary KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                    <span className="text-xs uppercase font-semibold text-slate-400">
                      {t('totalCollectionsOnDay', 'Total Collections on this Day')}
                    </span>
                    <p className="font-serif text-2xl font-bold text-emerald-400">
                      ₹{dayTotalCollected.toLocaleString()}
                    </p>
                    <p className="text-[11px] text-slate-500 font-mono">
                      Gross Billed: ₹{dayTotalBilled.toLocaleString()}
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                    <span className="text-xs uppercase font-semibold text-slate-400">
                      {t('totalInvoicesCount', 'Total Invoices / Receipts')}
                    </span>
                    <p className="font-serif text-2xl font-bold text-white">
                      {dayInvoicesCount}
                    </p>
                    <p className="text-[11px] text-slate-500">Processed on {selectedBillingDate}</p>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                    <span className="text-xs uppercase font-semibold text-slate-400">
                      {t('patientsBilled', 'Patients Billed')}
                    </span>
                    <p className="font-serif text-2xl font-bold text-cyan-400">
                      {uniquePatientsOnDay}
                    </p>
                    <p className="text-[11px] text-slate-500">Unique patients received care</p>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                    <span className="text-xs uppercase font-semibold text-slate-400">
                      {t('averageBillSize', 'Average Bill Size')}
                    </span>
                    <p className="font-serif text-2xl font-bold text-fuchsia-400">
                      ₹{avgBillSize.toLocaleString()}
                    </p>
                    <p className="text-[11px] text-slate-500">Per patient consultation / stay</p>
                  </div>
                </div>

                {/* Day Payment Methods Breakdown Strip */}
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                  <h4 className="text-xs uppercase font-bold tracking-wider text-slate-300">
                    {t('paymentModeBreakdown', 'Collections by Payment Method for ' + selectedBillingDate)}
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
                      <div>
                        <span className="text-[11px] text-slate-400 font-semibold">{t('upi', 'UPI / Online')}</span>
                        <p className="text-sm font-mono font-bold text-cyan-400">₹{paymentModeStats.UPI.toLocaleString()}</p>
                      </div>
                      <span className="text-lg">📱</span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
                      <div>
                        <span className="text-[11px] text-slate-400 font-semibold">{t('card', 'Card (POS)')}</span>
                        <p className="text-sm font-mono font-bold text-fuchsia-400">₹{paymentModeStats.Card.toLocaleString()}</p>
                      </div>
                      <span className="text-lg">💳</span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
                      <div>
                        <span className="text-[11px] text-slate-400 font-semibold">{t('cash', 'Cash Counter')}</span>
                        <p className="text-sm font-mono font-bold text-amber-400">₹{paymentModeStats.Cash.toLocaleString()}</p>
                      </div>
                      <span className="text-lg">💵</span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
                      <div>
                        <span className="text-[11px] text-slate-400 font-semibold">{t('insurance', 'TPA Insurance')}</span>
                        <p className="text-sm font-mono font-bold text-emerald-400">₹{paymentModeStats.Insurance.toLocaleString()}</p>
                      </div>
                      <span className="text-lg">🛡️</span>
                    </div>
                  </div>
                </div>

                {/* Day Invoices Table */}
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-bold text-white font-serif">
                        {t('allInvoicesOnDate', 'Invoices & Receipts on Selected Date')} ({filteredDayInvoices.length})
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Date: <span className="font-mono text-cyan-300 font-semibold">{formatDate(selectedBillingDate)}</span> ({selectedBillingDate})
                      </p>
                    </div>

                    <div className="relative w-full sm:w-64">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={daySearchTerm}
                        onChange={(e) => setDaySearchTerm(e.target.value)}
                        placeholder="Search invoice #, patient, dept…"
                        className="w-full pl-8 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                  </div>

                  {filteredDayInvoices.length === 0 ? (
                    <div className="p-12 text-center rounded-xl bg-slate-800/40 border border-dashed border-slate-700 space-y-2">
                      <Receipt className="w-8 h-8 text-slate-600 mx-auto" />
                      <p className="text-sm font-semibold text-slate-300">
                        {daySearchTerm
                          ? 'No transactions match your search on this date.'
                          : t('noBillsFoundOnDate', 'No billing records or payments found for this selected date.')}
                      </p>
                      <p className="text-xs text-slate-500">
                        Select a date with records (e.g. 2026-10-02 or 2026-10-01) or click "+ Create Bill / Payment" to add one.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-400 uppercase font-semibold tracking-wider text-[11px]">
                            <th className="py-3 px-3">Invoice #</th>
                            <th className="py-3 px-3">Patient</th>
                            <th className="py-3 px-3">Department / Doctor</th>
                            <th className="py-3 px-3">Services</th>
                            <th className="py-3 px-3 text-right">Billed</th>
                            <th className="py-3 px-3 text-right">Amount Paid</th>
                            <th className="py-3 px-3 text-right">Due</th>
                            <th className="py-3 px-3 text-center">Method</th>
                            <th className="py-3 px-3 text-center">Status</th>
                            <th className="py-3 px-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 font-sans">
                          {filteredDayInvoices.map((inv) => (
                            <tr key={inv.id} className="hover:bg-slate-800/40 transition-colors">
                              <td className="py-3 px-3 font-mono font-bold text-cyan-400 whitespace-nowrap">
                                {inv.invoiceNumber}
                              </td>
                              <td className="py-3 px-3 whitespace-nowrap">
                                <strong className="text-white block">{inv.patientName}</strong>
                                <span className="text-[10px] font-mono text-slate-400">{inv.patientId}</span>
                              </td>
                              <td className="py-3 px-3 text-slate-300 whitespace-nowrap">
                                <div>{inv.department}</div>
                                {inv.doctorName && <span className="text-[11px] text-slate-400">{inv.doctorName}</span>}
                              </td>
                              <td className="py-3 px-3 max-w-[220px] text-slate-400 truncate">
                                {inv.items.map((i) => i.description).join(', ')}
                              </td>
                              <td className="py-3 px-3 text-right font-mono text-slate-300">
                                {formatCurrency(inv.totalAmount)}
                              </td>
                              <td className="py-3 px-3 text-right font-mono font-bold text-emerald-400">
                                {formatCurrency(inv.amountPaid)}
                              </td>
                              <td className="py-3 px-3 text-right font-mono text-rose-400">
                                {inv.balanceDue > 0 ? formatCurrency(inv.balanceDue) : '-'}
                              </td>
                              <td className="py-3 px-3 text-center font-medium text-slate-300">
                                {inv.paymentMethod}
                              </td>
                              <td className="py-3 px-3 text-center whitespace-nowrap">
                                <span
                                  className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                                    inv.paymentStatus === 'Paid'
                                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                                      : inv.paymentStatus === 'Partial'
                                      ? 'bg-amber-950 text-amber-400 border border-amber-500/30'
                                      : 'bg-rose-950 text-rose-400 border border-rose-500/30'
                                  }`}
                                >
                                  {inv.paymentStatus}
                                </span>
                              </td>
                              <td className="py-3 px-3 text-right whitespace-nowrap">
                                <div className="flex items-center justify-end gap-1.5">
                                  {inv.balanceDue > 0 && (
                                    <button
                                      onClick={() => setRecordingPaymentInvoice(inv)}
                                      className="inline-flex items-center gap-1 py-1 px-2.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 text-xs font-semibold cursor-pointer"
                                      title="Record Payment"
                                    >
                                      <CreditCard className="w-3.5 h-3.5" />
                                      <span>Pay</span>
                                    </button>
                                  )}
                                  <button
                                    onClick={() => setViewingReceipt(inv)}
                                    className="inline-flex items-center gap-1 py-1 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-semibold cursor-pointer"
                                  >
                                    <Printer className="w-3.5 h-3.5" />
                                    <span>{t('viewReceipt', 'Receipt')}</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* -------------------------------------------------------------
                SUB-MODE 2: SEPARATE PATIENT BILLING LEDGER (Individual patient)
               ------------------------------------------------------------- */}
            {billingSubView === 'patient' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left: Patient List & Search */}
                <div className="lg:col-span-4 p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                  <div>
                    <h4 className="text-sm font-bold text-white font-serif">Patient Directory</h4>
                    <p className="text-xs text-slate-400">Search patient to view their complete hospital billing ledger</p>
                  </div>

                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={patientSearchTerm}
                      onChange={(e) => setPatientSearchTerm(e.target.value)}
                      placeholder={t('searchPatientBilling', 'Search by name, ID or phone…')}
                      className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div className="space-y-2 max-h-[500px] overflow-y-auto">
                    {patientList.length === 0 ? (
                      <p className="text-xs text-slate-500 py-4 text-center">No patients match that search.</p>
                    ) : (
                      patientList.map((p) => {
                        const selected = selectedPatientId === p.patientId;
                        return (
                          <div
                            key={p.patientId}
                            onClick={() => setSelectedPatientId(p.patientId)}
                            className={`p-3.5 rounded-xl border transition-all cursor-pointer text-xs space-y-1 ${
                              selected
                                ? 'bg-cyan-950/40 border-cyan-400 text-white shadow-lg'
                                : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800 hover:border-slate-600'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <strong className="text-white text-sm">{p.name}</strong>
                              <span className="font-mono text-[10px] text-cyan-400 bg-cyan-950 px-1.5 py-0.2 rounded border border-cyan-800">
                                {p.patientId}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-[11px] pt-1 text-slate-400">
                              <span>Total Billed: ₹{p.totalBilled.toLocaleString()}</span>
                              <span className="font-bold text-emerald-400">Paid: ₹{p.totalPaid.toLocaleString()}</span>
                            </div>
                            {p.balanceDue > 0 && (
                              <div className="text-[11px] font-bold text-rose-400">
                                Balance Due: ₹{p.balanceDue.toLocaleString()}
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Right: Selected Patient's Hospital Ledger & History */}
                <div className="lg:col-span-8 space-y-6">
                  {selectedPatientSummary ? (
                    <>
                      {/* Patient Summary Header Card */}
                      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="space-y-1">
                            <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
                              Individual Patient Billing Ledger
                            </span>
                            <h3 className="text-xl font-bold font-serif text-white flex items-center gap-2">
                              {selectedPatientSummary.name}
                              <span className="text-xs font-mono font-normal text-slate-400">
                                ({selectedPatientSummary.patientId})
                              </span>
                            </h3>
                            {selectedPatientSummary.contact && (
                              <p className="text-xs text-slate-400">Contact: {selectedPatientSummary.contact}</p>
                            )}
                          </div>

                          <div className="flex items-center gap-4 text-xs font-mono self-start sm:self-center">
                            <div className="text-right">
                              <span className="text-slate-400 text-[10px] uppercase font-semibold block">Total Billed</span>
                              <strong className="text-white text-sm">{formatCurrency(selectedPatientSummary.totalBilled)}</strong>
                            </div>
                            <div className="text-right">
                              <span className="text-slate-400 text-[10px] uppercase font-semibold block">Total Paid</span>
                              <strong className="text-emerald-400 text-sm">{formatCurrency(selectedPatientSummary.totalPaid)}</strong>
                            </div>
                            <div className="text-right">
                              <span className="text-slate-400 text-[10px] uppercase font-semibold block">Balance</span>
                              <strong className={`text-sm ${selectedPatientSummary.balanceDue > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                                {formatCurrency(selectedPatientSummary.balanceDue)}
                              </strong>
                            </div>
                          </div>
                        </div>

                        {/* Settlement Progress Bar */}
                        {(() => {
                          const pct = selectedPatientSummary.totalBilled > 0
                            ? Math.min(100, Math.round((selectedPatientSummary.totalPaid / selectedPatientSummary.totalBilled) * 100))
                            : 100;
                          return (
                            <div className="space-y-1 pt-2 border-t border-slate-800">
                              <div className="flex justify-between text-[11px] text-slate-400">
                                <span>Patient Settlement Rate: <strong className="text-white font-mono">{pct}%</strong></span>
                                <span className={selectedPatientSummary.balanceDue > 0 ? 'text-rose-400 font-semibold' : 'text-emerald-400 font-semibold'}>
                                  {selectedPatientSummary.balanceDue > 0 ? `${formatCurrency(selectedPatientSummary.balanceDue)} Pending` : 'All Accounts Settled ✓'}
                                </span>
                              </div>
                              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                                <div
                                  className={`h-full transition-all duration-500 ${
                                    pct === 100
                                      ? 'bg-emerald-400'
                                      : 'bg-gradient-to-r from-amber-400 to-emerald-400'
                                  }`}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>
                          );
                        })()}
                      </div>

                      {/* Chronological Invoices for this Patient */}
                      <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <h4 className="text-sm font-bold text-white font-serif">
                            <span>Billing &amp; Payment Records at {currentHospital.name} ({filteredPatientInvoices.length})</span>
                          </h4>

                          <div className="flex items-center gap-2">
                            {/* Filter Pills */}
                            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-800 border border-slate-700 text-xs">
                              {(['All', 'Due', 'Paid'] as const).map((filterOpt) => (
                                <button
                                  key={filterOpt}
                                  onClick={() => setPatientBillFilter(filterOpt)}
                                  className={`py-1 px-2.5 rounded-lg font-medium transition-colors cursor-pointer text-xs ${
                                    patientBillFilter === filterOpt
                                      ? 'bg-cyan-500 text-slate-950 font-bold'
                                      : 'text-slate-400 hover:text-white'
                                  }`}
                                >
                                  {filterOpt === 'All' ? 'All Bills' : filterOpt === 'Due' ? 'Balance Due' : 'Paid in Full'}
                                </button>
                              ))}
                            </div>

                            <button
                              onClick={() => setShowCreateBillModal(true)}
                              className="py-1.5 px-3 rounded-lg bg-cyan-950 text-cyan-300 border border-cyan-800 hover:bg-cyan-900 text-xs font-semibold cursor-pointer whitespace-nowrap"
                            >
                              + New Bill
                            </button>
                          </div>
                        </div>

                        {filteredPatientInvoices.length === 0 ? (
                          <div className="p-8 text-center rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-500">
                            {patientBillFilter !== 'All'
                              ? `No ${patientBillFilter === 'Due' ? 'unpaid' : 'paid'} invoices match this filter.`
                              : t('noBillsFoundForPatient', 'No bills found for this patient yet.')}
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {filteredPatientInvoices.map((inv) => (
                              <div
                                key={inv.id}
                                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all space-y-3"
                              >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                                      {inv.invoiceNumber}
                                    </span>
                                    <span className="text-xs font-semibold text-slate-300">
                                      📅 {formatDate(inv.date)} @ {inv.time}
                                    </span>
                                    <span className="text-slate-500">&middot;</span>
                                    <span className="text-xs text-cyan-400 font-medium">{inv.department}</span>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <span
                                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                                        inv.paymentStatus === 'Paid'
                                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                                          : inv.paymentStatus === 'Partial'
                                          ? 'bg-amber-950 text-amber-400 border border-amber-500/30'
                                          : 'bg-rose-950 text-rose-400 border border-rose-500/30'
                                      }`}
                                    >
                                      {inv.paymentStatus}
                                    </span>

                                    {inv.balanceDue > 0 && (
                                      <button
                                        onClick={() => setRecordingPaymentInvoice(inv)}
                                        className="inline-flex items-center gap-1 py-1 px-2.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 text-xs font-semibold cursor-pointer"
                                        title="Record payment for this bill"
                                      >
                                        <CreditCard className="w-3.5 h-3.5" />
                                        <span>Record Payment</span>
                                      </button>
                                    )}

                                    <button
                                      onClick={() => setViewingReceipt(inv)}
                                      className="inline-flex items-center gap-1 py-1 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-semibold cursor-pointer"
                                    >
                                      <Printer className="w-3.5 h-3.5" />
                                      <span>Receipt</span>
                                    </button>
                                  </div>
                                </div>

                                {/* Items Breakdown */}
                                <div className="space-y-1 text-xs">
                                  {inv.items.map((it, idx) => (
                                    <div key={idx} className="flex justify-between text-slate-300">
                                      <span>
                                        {it.description} <span className="text-[11px] text-slate-500">({it.category} &times; {it.quantity})</span>
                                      </span>
                                      <span className="font-mono text-slate-200">{formatCurrency(it.total)}</span>
                                    </div>
                                  ))}
                                </div>

                                {/* Bottom Totals */}
                                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
                                  <span className="text-slate-400">
                                    Method: <strong className="text-white">{inv.paymentMethod}</strong>
                                    {inv.insuranceProvider && ` (${inv.insuranceProvider})`}
                                  </span>
                                  <div className="flex items-center gap-4">
                                    <span className="text-slate-400">
                                      Total: <strong className="text-white">{formatCurrency(inv.totalAmount)}</strong>
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
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-400">
                      {t('selectPatientToViewLedger', 'Select a patient from the left directory to view their complete hospital billing ledger')}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            TAB: BEDS
           ========================================================================= */}
        {adminTab === 'beds' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-xs uppercase font-semibold text-slate-400">Total Bed Capacity</span>
                <p className="font-serif text-2xl font-bold text-white">{totalBeds}</p>
              </div>
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-xs uppercase font-semibold text-slate-400">Available Beds Now</span>
                <p className="font-serif text-2xl font-bold text-emerald-400">{availBeds}</p>
              </div>
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-xs uppercase font-semibold text-slate-400">Occupancy Rate</span>
                <p className="font-serif text-2xl font-bold text-cyan-400">{occupancyPct}%</p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white font-serif">Bed Availability by Ward</h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase font-semibold text-[11px]">
                      <th className="py-2.5 px-3">Ward</th>
                      <th className="py-2.5 px-3">Available Beds</th>
                      <th className="py-2.5 px-3">Total Capacity</th>
                      <th className="py-2.5 px-3">Occupancy</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-sans">
                    {Object.entries(currentHospital.beds).map(([ward, b]) => {
                      const occ = b.total ? Math.round(((b.total - b.available) / b.total) * 100) : 0;
                      return (
                        <tr key={ward}>
                          <td className="py-3 px-3 font-semibold text-white">{ward}</td>
                          <td className="py-3 px-3">
                            <input
                              type="number"
                              min="0"
                              max={b.total}
                              value={b.available}
                              onChange={(e) => updateBed(currentHospital.id, ward, 'available', Number(e.target.value))}
                              className="w-20 py-1 px-2 bg-slate-800 border border-slate-700 rounded text-cyan-400 font-mono font-bold"
                            />
                          </td>
                          <td className="py-3 px-3">
                            <input
                              type="number"
                              min="1"
                              value={b.total}
                              onChange={(e) => updateBed(currentHospital.id, ward, 'total', Number(e.target.value))}
                              className="w-20 py-1 px-2 bg-slate-800 border border-slate-700 rounded text-slate-200 font-mono font-bold"
                            />
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2">
                              <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
                                <div
                                  className={`h-full ${
                                    occ >= 85 ? 'bg-rose-400' : occ >= 60 ? 'bg-amber-400' : 'bg-emerald-400'
                                  }`}
                                  style={{ width: `${occ}%` }}
                                />
                              </div>
                              <span className="font-mono text-slate-400">{occ}%</span>
                            </div>
                          </td>
                          <td className="py-3 px-3 text-right">
                            {!['General', 'ICU'].includes(ward) ? (
                              <button
                                onClick={() => deleteWard(currentHospital.id, ward)}
                                className="text-rose-400 hover:underline cursor-pointer"
                              >
                                Delete
                              </button>
                            ) : (
                              <span className="text-[11px] text-slate-500">Core</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Add Ward Form */}
              <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center gap-3">
                <input
                  type="text"
                  placeholder="New Ward Name (e.g. Maternity)"
                  value={newWardName}
                  onChange={(e) => setNewWardName(e.target.value)}
                  className="py-1.5 px-3 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
                />
                <input
                  type="number"
                  min="1"
                  placeholder="Total Beds"
                  value={newWardTotal}
                  onChange={(e) => setNewWardTotal(Number(e.target.value))}
                  className="w-24 py-1.5 px-3 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!newWardName.trim()) return;
                    addWard(currentHospital.id, newWardName.trim(), newWardTotal);
                    setNewWardName('');
                  }}
                  className="py-1.5 px-3 rounded-lg bg-cyan-400 text-slate-950 font-bold text-xs cursor-pointer"
                >
                  + Add Ward
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB: STAFF
           ========================================================================= */}
        {adminTab === 'staff' && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white font-serif">Staff Roster &amp; Shift Duty</h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase font-semibold text-[11px]">
                      <th className="py-2.5 px-3">Name</th>
                      <th className="py-2.5 px-3">Role</th>
                      <th className="py-2.5 px-3">Shift</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-sans">
                    {currentHospital.staff.map((s) => (
                      <tr key={s.id}>
                        <td className="py-2.5 px-3 font-semibold text-white">{s.name}</td>
                        <td className="py-2.5 px-3 text-slate-300">{s.role}</td>
                        <td className="py-2.5 px-3">
                          <select
                            value={s.shift}
                            onChange={(e) => updateStaff(currentHospital.id, s.id, { shift: e.target.value as any })}
                            className="py-1 px-2 bg-slate-800 border border-slate-700 rounded text-slate-200 text-xs"
                          >
                            <option value="Day">Day</option>
                            <option value="Night">Night</option>
                          </select>
                        </td>
                        <td className="py-2.5 px-3">
                          <select
                            value={s.status}
                            onChange={(e) => updateStaff(currentHospital.id, s.id, { status: e.target.value as any })}
                            className="py-1 px-2 bg-slate-800 border border-slate-700 rounded text-slate-200 text-xs"
                          >
                            <option value="Available">Available</option>
                            <option value="On Duty">On Duty</option>
                            <option value="Off">Off</option>
                          </select>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => deleteStaff(currentHospital.id, s.id)}
                            className="text-rose-400 hover:underline cursor-pointer"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Add Staff Form */}
              <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center gap-3">
                <input
                  type="text"
                  placeholder="Staff Name"
                  value={newStaffName}
                  onChange={(e) => setNewStaffName(e.target.value)}
                  className="py-1.5 px-3 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
                />
                <input
                  type="text"
                  placeholder="Role (e.g. ICU Nurse)"
                  value={newStaffRole}
                  onChange={(e) => setNewStaffRole(e.target.value)}
                  className="py-1.5 px-3 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
                />
                <select
                  value={newStaffShift}
                  onChange={(e) => setNewStaffShift(e.target.value as any)}
                  className="py-1.5 px-3 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
                >
                  <option value="Day">Day Shift</option>
                  <option value="Night">Night Shift</option>
                </select>
                <button
                  type="button"
                  onClick={() => {
                    if (!newStaffName.trim() || !newStaffRole.trim()) return;
                    addStaff(currentHospital.id, {
                      name: newStaffName.trim(),
                      role: newStaffRole.trim(),
                      shift: newStaffShift,
                      status: 'Available',
                    });
                    setNewStaffName('');
                    setNewStaffRole('');
                  }}
                  className="py-1.5 px-3 rounded-lg bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer"
                >
                  + Add Staff
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB: APPOINTMENTS
           ========================================================================= */}
        {adminTab === 'appts' && (
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white font-serif">
              Appointment Requests Queue ({hospitalAppointments.length})
            </h3>

            {hospitalAppointments.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No appointment requests at this hospital.</p>
            ) : (
              <div className="space-y-3">
                {hospitalAppointments.map((a) => (
                  <div
                    key={a.id}
                    className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <strong className="text-white text-sm">{a.patientName}</strong>
                        <span className="text-slate-500">&middot;</span>
                        <span className="text-cyan-400">{a.dept}</span>
                      </div>
                      <p className="text-slate-400">
                        Doctor: <strong>{a.doctor}</strong> &middot; 📅 {a.date} @ {a.time}
                      </p>
                      {a.reason && <p className="text-slate-500 italic">Reason: {a.reason}</p>}
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                          a.status === 'Confirmed'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                            : a.status === 'Rejected'
                            ? 'bg-rose-950 text-rose-400 border border-rose-500/30'
                            : 'bg-amber-950 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {a.status}
                      </span>
                      {a.status === 'Pending' && (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => updateAppointmentStatus(a.id, 'Confirmed')}
                            className="py-1 px-2.5 rounded bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 cursor-pointer"
                          >
                            ✓ Accept
                          </button>
                          <button
                            onClick={() => updateAppointmentStatus(a.id, 'Rescheduled')}
                            className="py-1 px-2.5 rounded bg-slate-700 text-slate-200 hover:bg-slate-600 cursor-pointer"
                          >
                            ↺ Reschedule
                          </button>
                          <button
                            onClick={() => updateAppointmentStatus(a.id, 'Rejected')}
                            className="py-1 px-2.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30 cursor-pointer"
                          >
                            ✕ Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            TAB: AMBULANCE
           ========================================================================= */}
        {adminTab === 'ambulance' && (
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white font-serif">
              Emergency Ambulance Dispatch Central ({ambulanceRequests.length})
            </h3>

            {ambulanceRequests.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No active ambulance requests.</p>
            ) : (
              <div className="space-y-3">
                {ambulanceRequests.map((r) => {
                  const isVentilator = r.type === 'Ventilator-support';
                  return (
                    <div
                      key={r.id}
                      className={`p-4 rounded-xl bg-slate-800/60 border ${
                        isVentilator ? 'border-rose-500/50' : 'border-emerald-500/40'
                      } flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{isVentilator ? '🔴' : '🟢'}</span>
                          <strong className="text-white text-sm">{r.patientName}</strong>
                          <span className="text-slate-500">&middot;</span>
                          <span className="font-semibold text-amber-400">{r.type}</span>
                        </div>
                        <p className="text-slate-400">
                          Condition: <strong>{r.condition}</strong> &middot; Requested by: {r.citizen}
                        </p>
                        {r.symptoms && <p className="text-slate-500 italic">Symptoms: {r.symptoms}</p>}
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                            r.status === 'Dispatched'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                              : 'bg-amber-950 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {r.status}
                        </span>
                        {r.status !== 'Dispatched' && (
                          <button
                            onClick={() => updateAmbulanceStatus(r.id, 'Dispatched')}
                            className="py-1 px-3 rounded-lg bg-cyan-400 text-slate-950 font-bold hover:bg-cyan-300 transition-colors cursor-pointer"
                          >
                            🚑 Confirm Dispatch
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            TAB: CASE TRACKER
           ========================================================================= */}
        {adminTab === 'cases' && (
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
            <div>
              <h3 className="text-sm font-bold text-white font-serif">Patient Health Records Lookup</h3>
              <p className="text-xs text-slate-400">
                Search with patient's unique MedNexus ID to review clinical history and records.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="e.g. MN-P8921"
                value={caseSearchId}
                onChange={(e) => setCaseSearchId(e.target.value)}
                className="py-2 px-3 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-mono uppercase"
              />
              <button
                type="button"
                onClick={() => {
                  const id = caseSearchId.trim().toUpperCase();
                  if (!id) return;
                  const res = getPatientCase(id);
                  setCaseSearchResult(res);
                }}
                className="py-2 px-4 rounded-xl bg-cyan-400 text-slate-950 font-bold text-xs cursor-pointer"
              >
                Search Records
              </button>
            </div>

            {caseSearchResult && (
              <div className="p-5 rounded-xl bg-slate-800/40 border border-slate-700 space-y-4 text-xs">
                <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                  <span className="font-mono text-cyan-400 font-bold">Patient Case: {caseSearchResult.patientId}</span>
                </div>
                {(() => {
                  const caseAccessRequest = accessRequests.find(
                    (request) =>
                      request.patientId === caseSearchResult.patientId &&
                      request.hospitalId === currentHospital.id &&
                      (request.status === 'pending' || request.status === 'approved')
                  );

                  if (caseAccessRequest?.status === 'approved') {
                    return (
                      <div className="space-y-2">
                        <h5 className="font-semibold text-white">Hospital Visits ({caseSearchResult.visits.length})</h5>
                        {caseSearchResult.visits.map((visit: { id: string; hospital: string; date: string; reason: string }) => (
                          <div key={visit.id} className="p-2 rounded bg-slate-800 text-slate-300">
                            <strong>{visit.hospital}</strong> &middot; {visit.date}: {visit.reason}
                          </div>
                        ))}
                      </div>
                    );
                  }

                  if (caseAccessRequest?.status === 'pending') {
                    return <p className="text-amber-300">Access request sent. Waiting for patient approval.</p>;
                  }

                  return (
                    <div className="space-y-2">
                      <p className="text-slate-300">Patient approval is required before this case can be viewed.</p>
                      <button
                        type="button"
                        onClick={() => requestCaseAccess(caseSearchResult.patientId, currentHospital.id)}
                        className="py-2 px-4 rounded-lg bg-cyan-400 text-slate-950 font-bold cursor-pointer"
                      >
                        {t('requestCaseAccess', 'Request case access')}
                      </button>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            TAB: HOSPITAL PROFILE
           ========================================================================= */}
        {adminTab === 'profile' && (
          <div className="max-w-xl p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 text-xs">
            <h3 className="text-sm font-bold text-white font-serif">Hospital Facility Profile</h3>
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Hospital Name
              </label>
              <input
                type="text"
                value={profName}
                onChange={(e) => setProfName(e.target.value)}
                className="w-full py-2 px-3 bg-slate-800 border border-slate-700 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Area / City
              </label>
              <input
                type="text"
                value={profArea}
                onChange={(e) => setProfArea(e.target.value)}
                className="w-full py-2 px-3 bg-slate-800 border border-slate-700 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Specialties (comma separated)
              </label>
              <input
                type="text"
                value={profSpecialties}
                onChange={(e) => setProfSpecialties(e.target.value)}
                className="w-full py-2 px-3 bg-slate-800 border border-slate-700 rounded-lg text-white"
              />
            </div>
            <button
              onClick={() => {
                updateHospital(currentHospital.id, {
                  name: profName,
                  area: profArea,
                  specialties: profSpecialties.split(',').map((s) => s.trim()).filter(Boolean),
                });
              }}
              className="py-2 px-4 rounded-lg bg-amber-400 text-slate-950 font-bold cursor-pointer"
            >
              Save Profile Changes
            </button>
          </div>
        )}

        {/* =========================================================================
            TAB: REPORTS & ANALYTICS
           ========================================================================= */}
        {adminTab === 'reports' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-center">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-xs text-slate-400 uppercase font-semibold">Bed Occupancy</span>
                <p className="text-xl font-bold font-serif text-cyan-400">{occupancyPct}%</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-xs text-slate-400 uppercase font-semibold">Available Beds</span>
                <p className="text-xl font-bold font-serif text-emerald-400">{availBeds} / {totalBeds}</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-xs text-slate-400 uppercase font-semibold">Pending Appts</span>
                <p className="text-xl font-bold font-serif text-amber-400">
                  {hospitalAppointments.filter((a) => a.status === 'Pending').length}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-xs text-slate-400 uppercase font-semibold">Total Bills Logged</span>
                <p className="text-xl font-bold font-serif text-fuchsia-400">{hospitalInvoices.length}</p>
              </div>
            </div>

            {/* Weekly Inflow Bar Chart */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <h4 className="text-sm font-bold text-white font-serif">Daily Patient Inflow (Last 7 Days)</h4>
              <div className="flex items-end gap-3 h-32 pt-4">
                {[
                  { day: 'Mon', count: 18 },
                  { day: 'Tue', count: 24 },
                  { day: 'Wed', count: 21 },
                  { day: 'Thu', count: 29 },
                  { day: 'Fri', count: 26 },
                  { day: 'Sat', count: 34 },
                  { day: 'Sun', count: 28 },
                ].map((item) => (
                  <div key={item.day} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                    <span className="text-[10px] font-mono text-cyan-400">{item.count}</span>
                    <div
                      className="w-full bg-gradient-to-t from-cyan-600 to-cyan-400 rounded-t"
                      style={{ height: `${(item.count / 35) * 100}%` }}
                    />
                    <span className="text-[10px] text-slate-400">{item.day}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Invoice Receipt Modal */}
      <InvoiceModal invoice={viewingReceipt} onClose={() => setViewingReceipt(null)} />

      {/* Record Payment Quick Modal */}
      {recordingPaymentInvoice && (
        <RecordPaymentModal
          invoice={recordingPaymentInvoice}
          onClose={() => setRecordingPaymentInvoice(null)}
          onPaymentSaved={(invId) => {
            const updated = invoices.find((i) => i.id === invId);
            if (updated) setViewingReceipt(updated);
          }}
        />
      )}

      {/* Daily Summary Report Printable Modal */}
      {showDailyPrintReport && (
        <DailyReportPrintModal
          hospital={currentHospital}
          date={selectedBillingDate}
          invoices={dayInvoices}
          onClose={() => setShowDailyPrintReport(false)}
        />
      )}

      {/* Create New Bill Modal */}
      {showCreateBillModal && (
        <CreateBillModal
          hospitalId={currentHospital.id}
          hospitalName={currentHospital.name}
          defaultDate={selectedBillingDate}
          onClose={() => setShowCreateBillModal(false)}
          onInvoiceCreated={(newInv) => {
            setViewingReceipt(newInv);
          }}
        />
      )}
    </div>
  );
};
