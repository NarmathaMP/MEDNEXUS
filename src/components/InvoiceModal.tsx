import React, { useEffect } from 'react';
import { BillInvoice } from '../types';
import { useApp } from '../context/AppContext';
import { Printer, X, CheckCircle, Clock, ShieldCheck, CreditCard, Building2, User } from 'lucide-react';

interface InvoiceModalProps {
  invoice: BillInvoice | null;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ invoice, onClose }) => {
  const { t } = useApp();

  useEffect(() => {
    if (!invoice) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [invoice, onClose]);

  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const isPaid = invoice.paymentStatus === 'Paid';
  const isPartial = invoice.paymentStatus === 'Partial';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative flex max-h-[calc(100dvh-2rem)] w-full max-w-2xl flex-col bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Top Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-4 border-b border-slate-800 bg-slate-900/95 print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-mono tracking-widest text-cyan-400">
              {t('receiptTitle', 'Official Hospital Medical Receipt')}
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-cyan-400" />
              {t('printReceipt', 'Print / Save Receipt')}
            </button>
            <button
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              {t('backToBills', 'Back to bills')}
            </button>
            <button
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-lg transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
              aria-label="Close"
              title={t('close', 'Close')}
            >
              <X className="w-4 h-4" />
              <span>{t('close', 'Close')}</span>
            </button>
          </div>
        </div>

        {/* Printable Receipt Body */}
        <div className="min-h-0 overflow-y-auto p-6 md:p-8 bg-slate-900 text-slate-200 font-sans print:overflow-visible print:p-0 print:bg-white print:text-black">
          {/* Hospital Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-800 print:border-slate-300">
            <div>
              <div className="flex items-center gap-2.5 mb-1.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-fuchsia-600 to-cyan-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-fuchsia-500/20">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold font-serif text-white print:text-black">
                    {invoice.hospitalName}
                  </h2>
                  <p className="text-xs text-slate-400 print:text-slate-600">
                    Smart Health Network &middot; Multispecialty Medical Center
                  </p>
                </div>
              </div>
            </div>

            <div className="sm:text-right">
              <span className="inline-block px-2.5 py-1 text-xs font-mono font-bold tracking-wider rounded-md bg-cyan-950/60 text-cyan-400 border border-cyan-500/30 print:border-black print:text-black print:bg-transparent">
                {invoice.invoiceNumber}
              </span>
              <p className="text-xs text-slate-400 print:text-slate-600 mt-1">
                {t('dateLabel', 'Date')}: <span className="font-mono text-slate-200 print:text-black font-semibold">{invoice.date}</span> &middot; {invoice.time}
              </p>
            </div>
          </div>

          {/* Patient & Billing Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-5 border-b border-slate-800 print:border-slate-300 text-xs">
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 print:text-slate-600">
                {t('billedTo', 'Billed To')}
              </span>
              <div className="flex items-center gap-1.5 text-sm font-semibold text-white print:text-black">
                <User className="w-4 h-4 text-cyan-400 print:text-black" />
                {invoice.patientName}
              </div>
              <p className="text-slate-400 print:text-slate-700">
                {t('patientIdLabel', 'Patient ID')}: <span className="font-mono font-medium text-slate-200 print:text-black">{invoice.patientId}</span>
              </p>
              {invoice.patientContact && (
                <p className="text-slate-400 print:text-slate-700">Contact: {invoice.patientContact}</p>
              )}
            </div>

            <div className="space-y-1.5 sm:text-right">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 print:text-slate-600">
                Department & Doctor
              </span>
              <p className="text-sm font-semibold text-white print:text-black">{invoice.department}</p>
              {invoice.doctorName && (
                <p className="text-slate-400 print:text-slate-700">Attending: {invoice.doctorName}</p>
              )}
              <div className="sm:flex sm:justify-end gap-2 items-center pt-1">
                <span className="text-[10px] text-slate-400 print:text-slate-600 uppercase font-semibold">Payment:</span>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold ${
                  isPaid
                    ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30'
                    : isPartial
                    ? 'bg-amber-950/60 text-amber-400 border border-amber-500/30'
                    : 'bg-rose-950/60 text-rose-400 border border-rose-500/30'
                }`}>
                  {isPaid ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                  {invoice.paymentStatus} via {invoice.paymentMethod}
                </span>
              </div>
            </div>
          </div>

          {/* Itemized Services Table */}
          <div className="py-5">
            <h4 className="text-xs uppercase font-bold tracking-wider text-slate-400 print:text-slate-700 mb-3">
              Itemized Medical Services & Supplies
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 print:border-slate-300 text-slate-400 print:text-slate-700">
                    <th className="py-2 font-medium">#</th>
                    <th className="py-2 font-medium">Item & Description</th>
                    <th className="py-2 font-medium">Category</th>
                    <th className="py-2 text-center font-medium">Qty</th>
                    <th className="py-2 text-right font-medium">Unit Rate</th>
                    <th className="py-2 text-right font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 print:divide-slate-200">
                  {invoice.items.map((item, idx) => (
                    <tr key={item.id || idx} className="hover:bg-slate-800/30">
                      <td className="py-2.5 font-mono text-slate-500 print:text-slate-600">{idx + 1}</td>
                      <td className="py-2.5 font-medium text-slate-100 print:text-black">
                        {item.description}
                      </td>
                      <td className="py-2.5 text-slate-400 print:text-slate-600 text-[11px]">
                        {item.category}
                      </td>
                      <td className="py-2.5 text-center font-mono text-slate-300 print:text-black">
                        {item.quantity}
                      </td>
                      <td className="py-2.5 text-right font-mono text-slate-400 print:text-black">
                        ₹{item.unitPrice.toLocaleString()}
                      </td>
                      <td className="py-2.5 text-right font-mono font-semibold text-slate-100 print:text-black">
                        ₹{item.total.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals Summary */}
          <div className="pt-4 border-t border-slate-800 print:border-slate-300 flex flex-col sm:flex-row justify-between items-start gap-4">
            <div className="text-xs text-slate-400 print:text-slate-600 max-w-xs space-y-1">
              {invoice.insuranceProvider && (
                <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60 print:border-slate-300">
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-cyan-400 print:text-black">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Insurance Claim
                  </div>
                  <p className="text-[11px] text-slate-300 print:text-black mt-0.5">{invoice.insuranceProvider}</p>
                </div>
              )}
              {invoice.notes && (
                <p className="text-[11px] italic mt-1 text-slate-400 print:text-slate-700">
                  Note: {invoice.notes}
                </p>
              )}
            </div>

            <div className="w-full sm:w-64 space-y-1.5 text-xs font-mono">
              <div className="flex justify-between py-1 text-slate-400 print:text-slate-600">
                <span>{t('subtotal', 'Subtotal')}:</span>
                <span>₹{invoice.subtotal.toLocaleString()}</span>
              </div>
              {invoice.discount > 0 && (
                <div className="flex justify-between py-1 text-emerald-400 print:text-emerald-700">
                  <span>{t('discount', 'Discount')}:</span>
                  <span>-₹{invoice.discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between py-1 text-slate-400 print:text-slate-600">
                <span>{t('taxGst', 'Tax / GST (5%)')}:</span>
                <span>₹{invoice.tax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-2 border-t border-slate-700 print:border-slate-400 text-sm font-bold text-white print:text-black">
                <span>{t('grandTotal', 'Grand Total')}:</span>
                <span>₹{invoice.totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 font-semibold text-cyan-400 print:text-black bg-cyan-950/30 px-2 rounded">
                <span>{t('amountPaidLabel', 'Amount Paid')}:</span>
                <span>₹{invoice.amountPaid.toLocaleString()}</span>
              </div>
              {invoice.balanceDue > 0 ? (
                <div className="flex justify-between py-1 font-bold text-rose-400 print:text-rose-700 bg-rose-950/30 px-2 rounded">
                  <span>{t('balanceDueLabel', 'Balance Due')}:</span>
                  <span>₹{invoice.balanceDue.toLocaleString()}</span>
                </div>
              ) : (
                <div className="flex justify-between py-1 font-semibold text-emerald-400 print:text-emerald-700 bg-emerald-950/30 px-2 rounded">
                  <span>Status:</span>
                  <span>Paid in Full ✓</span>
                </div>
              )}
            </div>
          </div>

          {/* Hospital Stamp & Signature Sign-off */}
          <div className="mt-8 pt-6 border-t border-slate-800/80 print:border-slate-300 flex justify-between items-end text-[11px] text-slate-500 print:text-slate-600">
            <div>
              <p>Generated by MedNexus Healthcare OS</p>
              <p className="text-[10px]">Computer generated tax invoice &middot; No physical signature required</p>
            </div>
            <div className="text-right">
              <div className="inline-block border-b border-slate-600 print:border-slate-400 pb-1 px-8 text-center text-slate-400 print:text-black font-serif italic text-xs">
                Dr. / Hospital Cashier
              </div>
              <p className="text-[10px] mt-1">Authorized Billing Officer</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
