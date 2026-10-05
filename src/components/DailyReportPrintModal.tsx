import React from 'react';
import { BillInvoice, Hospital } from '../types';
import { useApp } from '../context/AppContext';
import { Printer, X, Building2, Download } from 'lucide-react';

interface DailyReportPrintModalProps {
  hospital: Hospital;
  date: string;
  invoices: BillInvoice[];
  onClose: () => void;
}

export const DailyReportPrintModal: React.FC<DailyReportPrintModalProps> = ({
  hospital,
  date,
  invoices,
  onClose,
}) => {
  const { t, formatCurrency, formatDate } = useApp();

  const totalCollected = invoices.reduce((s, i) => s + i.amountPaid, 0);
  const totalBilled = invoices.reduce((s, i) => s + i.totalAmount, 0);
  const totalBalance = invoices.reduce((s, i) => s + i.balanceDue, 0);
  const patientCount = new Set(invoices.map((i) => i.patientId)).size;

  const modeTotals = {
    Cash: invoices.filter((i) => i.paymentMethod === 'Cash').reduce((s, i) => s + i.amountPaid, 0),
    Card: invoices.filter((i) => i.paymentMethod === 'Card').reduce((s, i) => s + i.amountPaid, 0),
    UPI: invoices.filter((i) => i.paymentMethod === 'UPI' || i.paymentMethod === 'NetBanking').reduce((s, i) => s + i.amountPaid, 0),
    Insurance: invoices.filter((i) => i.paymentMethod === 'Insurance').reduce((s, i) => s + i.amountPaid, 0),
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Top Action Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/95 print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-mono tracking-widest text-cyan-400 font-bold">
              Daily Hospital Billing &amp; Revenue Report
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-cyan-400" />
              Print / Save Daily Statement
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Document */}
        <div className="p-8 bg-slate-900 text-slate-200 font-sans print:p-0 print:bg-white print:text-black space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-800 print:border-slate-300">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-fuchsia-600 to-cyan-500 flex items-center justify-center text-white font-bold text-lg">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold font-serif text-white print:text-black">
                    {hospital.name}
                  </h2>
                  <p className="text-xs text-slate-400 print:text-slate-600">
                    Hospital Administration &middot; Accounting &amp; Revenue Department &middot; Area: {hospital.area}
                  </p>
                </div>
              </div>
            </div>

            <div className="sm:text-right">
              <span className="inline-block px-3 py-1 rounded bg-slate-800 print:bg-slate-100 font-mono text-xs font-bold text-cyan-400 print:text-black border border-slate-700 print:border-slate-300">
                DAILY FINANCIAL STATEMENT
              </span>
              <p className="text-xs text-slate-400 print:text-slate-700 mt-1 font-mono">
                Audit Date: <strong className="text-white print:text-black">{formatDate(date)}</strong> ({date})
              </p>
            </div>
          </div>

          {/* KPI Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 print:grid-cols-4">
            <div className="p-3.5 rounded-xl bg-slate-800/60 print:bg-slate-100 border border-slate-700/80 print:border-slate-300">
              <span className="text-[10px] text-slate-400 print:text-slate-600 uppercase font-semibold block">Total Revenue Collected</span>
              <strong className="text-lg font-mono font-bold text-emerald-400 print:text-black">{formatCurrency(totalCollected)}</strong>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/60 print:bg-slate-100 border border-slate-700/80 print:border-slate-300">
              <span className="text-[10px] text-slate-400 print:text-slate-600 uppercase font-semibold block">Gross Billed Total</span>
              <strong className="text-lg font-mono font-bold text-white print:text-black">{formatCurrency(totalBilled)}</strong>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/60 print:bg-slate-100 border border-slate-700/80 print:border-slate-300">
              <span className="text-[10px] text-slate-400 print:text-slate-600 uppercase font-semibold block">Invoices / Receipts</span>
              <strong className="text-lg font-mono font-bold text-cyan-400 print:text-black">{invoices.length}</strong>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/60 print:bg-slate-100 border border-slate-700/80 print:border-slate-300">
              <span className="text-[10px] text-slate-400 print:text-slate-600 uppercase font-semibold block">Patients Treated &amp; Billed</span>
              <strong className="text-lg font-mono font-bold text-fuchsia-400 print:text-black">{patientCount}</strong>
            </div>
          </div>

          {/* Payment Method Breakdown Box */}
          <div className="p-4 rounded-xl bg-slate-800/40 print:bg-slate-50 border border-slate-700/60 print:border-slate-300 space-y-2 text-xs">
            <h4 className="text-[11px] uppercase font-bold tracking-wider text-slate-300 print:text-slate-700">
              Payment Method Breakdown
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono">
              <div className="p-2 rounded bg-slate-800/70 print:bg-white border border-slate-700/40 print:border-slate-200">
                <span className="text-[10px] text-slate-400 print:text-slate-600 block">Cash:</span>
                <strong className="text-white print:text-black">{formatCurrency(modeTotals.Cash)}</strong>
              </div>
              <div className="p-2 rounded bg-slate-800/70 print:bg-white border border-slate-700/40 print:border-slate-200">
                <span className="text-[10px] text-slate-400 print:text-slate-600 block">Card (POS):</span>
                <strong className="text-white print:text-black">{formatCurrency(modeTotals.Card)}</strong>
              </div>
              <div className="p-2 rounded bg-slate-800/70 print:bg-white border border-slate-700/40 print:border-slate-200">
                <span className="text-[10px] text-slate-400 print:text-slate-600 block">UPI / Online:</span>
                <strong className="text-white print:text-black">{formatCurrency(modeTotals.UPI)}</strong>
              </div>
              <div className="p-2 rounded bg-slate-800/70 print:bg-white border border-slate-700/40 print:border-slate-200">
                <span className="text-[10px] text-slate-400 print:text-slate-600 block">TPA Insurance:</span>
                <strong className="text-white print:text-black">{formatCurrency(modeTotals.Insurance)}</strong>
              </div>
            </div>
          </div>

          {/* Invoices List Table */}
          <div className="space-y-2">
            <h4 className="text-xs uppercase font-bold tracking-wider text-slate-300 print:text-slate-700">
              Detailed Transaction Journal for {formatDate(date)}
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 print:border-slate-300 text-slate-400 print:text-slate-700 font-semibold text-[11px]">
                    <th className="py-2 font-mono">Invoice #</th>
                    <th className="py-2">Time</th>
                    <th className="py-2">Patient</th>
                    <th className="py-2">Department</th>
                    <th className="py-2 text-right">Billed</th>
                    <th className="py-2 text-right">Paid</th>
                    <th className="py-2 text-right">Balance</th>
                    <th className="py-2 text-center">Method</th>
                    <th className="py-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 print:divide-slate-200 font-sans">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="text-slate-200 print:text-black">
                      <td className="py-2 font-mono font-semibold text-cyan-400 print:text-black whitespace-nowrap">
                        {inv.invoiceNumber}
                      </td>
                      <td className="py-2 font-mono text-[11px] text-slate-400 print:text-slate-600 whitespace-nowrap">
                        {inv.time}
                      </td>
                      <td className="py-2 whitespace-nowrap">
                        <strong>{inv.patientName}</strong> <span className="font-mono text-[10px] text-slate-400 print:text-slate-600">({inv.patientId})</span>
                      </td>
                      <td className="py-2 text-slate-300 print:text-slate-700 whitespace-nowrap">
                        {inv.department}
                      </td>
                      <td className="py-2 text-right font-mono text-slate-300 print:text-black whitespace-nowrap">
                        {formatCurrency(inv.totalAmount)}
                      </td>
                      <td className="py-2 text-right font-mono font-bold text-emerald-400 print:text-black whitespace-nowrap">
                        {formatCurrency(inv.amountPaid)}
                      </td>
                      <td className="py-2 text-right font-mono text-rose-400 print:text-black whitespace-nowrap">
                        {inv.balanceDue > 0 ? formatCurrency(inv.balanceDue) : '-'}
                      </td>
                      <td className="py-2 text-center text-[11px] whitespace-nowrap">
                        {inv.paymentMethod}
                      </td>
                      <td className="py-2 text-center text-[11px] font-semibold whitespace-nowrap">
                        {inv.paymentStatus}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Signatures Block for Hospital Accounting */}
          <div className="pt-8 border-t border-slate-800 print:border-slate-300 grid grid-cols-3 gap-6 text-center text-xs text-slate-400 print:text-slate-700">
            <div>
              <div className="border-b border-slate-700 print:border-slate-400 pb-1 mb-1 font-serif italic text-slate-300 print:text-black">
                Priya M. / Cash Desk
              </div>
              <p className="text-[10px] uppercase tracking-wider font-semibold">Hospital Cashier / Billing Staff</p>
            </div>
            <div>
              <div className="border-b border-slate-700 print:border-slate-400 pb-1 mb-1 font-serif italic text-slate-300 print:text-black">
                R. Venkataraman, ACA
              </div>
              <p className="text-[10px] uppercase tracking-wider font-semibold">Chief Financial Auditor</p>
            </div>
            <div>
              <div className="border-b border-slate-700 print:border-slate-400 pb-1 mb-1 font-serif italic text-slate-300 print:text-black">
                Dr. K. Iyer, MD, FRCS
              </div>
              <p className="text-[10px] uppercase tracking-wider font-semibold">Medical Superintendent</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
