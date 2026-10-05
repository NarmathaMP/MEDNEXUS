import React, { useState } from 'react';
import { BillInvoice } from '../types';
import { useApp } from '../context/AppContext';
import { CreditCard, X, CheckCircle, Receipt, DollarSign } from 'lucide-react';

interface RecordPaymentModalProps {
  invoice: BillInvoice;
  onClose: () => void;
  onPaymentSaved: (updatedInvoiceId: string) => void;
}

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  invoice,
  onClose,
  onPaymentSaved,
}) => {
  const { t, recordInvoicePayment, formatCurrency } = useApp();

  const [amount, setAmount] = useState<number>(invoice.balanceDue);
  const [method, setMethod] = useState<BillInvoice['paymentMethod']>('Cash');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      alert('Please enter a valid payment amount greater than zero.');
      return;
    }
    const payAmt = Math.min(invoice.balanceDue, amount);
    recordInvoicePayment(invoice.id, payAmt, method, reference.trim(), notes.trim());
    onPaymentSaved(invoice.id);
    onClose();
  };

  const newBalance = Math.max(0, invoice.balanceDue - (amount || 0));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200 text-xs">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/95">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800/80 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Record Patient Payment</h3>
              <p className="text-[11px] text-slate-400 font-mono">Invoice #{invoice.invoiceNumber}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Invoice Summary Box */}
        <div className="p-6 space-y-4">
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Patient:</span>
              <strong className="text-white text-sm">{invoice.patientName}</strong>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Patient ID:</span>
              <span className="font-mono text-cyan-400 font-bold">{invoice.patientId}</span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-slate-700 text-[11px] font-mono">
              <span className="text-slate-400">Total Billed:</span>
              <span className="text-white">{formatCurrency(invoice.totalAmount)}</span>
            </div>
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-slate-400">Already Paid:</span>
              <span className="text-emerald-400">{formatCurrency(invoice.amountPaid)}</span>
            </div>
            <div className="flex items-center justify-between text-xs font-mono font-bold bg-rose-950/40 p-2 rounded border border-rose-900/50">
              <span className="text-rose-300">Remaining Balance:</span>
              <span className="text-rose-400">{formatCurrency(invoice.balanceDue)}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Amount input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                  Payment Amount Received (₹) *
                </label>
                <button
                  type="button"
                  onClick={() => setAmount(invoice.balanceDue)}
                  className="text-[10px] text-cyan-400 hover:underline font-mono cursor-pointer"
                >
                  Pay Full ({formatCurrency(invoice.balanceDue)})
                </button>
              </div>
              <input
                type="number"
                required
                min="1"
                max={invoice.balanceDue}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full py-2.5 px-3 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono font-bold text-sm focus:outline-none focus:border-emerald-400"
              />
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Payment Method
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Cash', 'Card', 'UPI', 'Insurance', 'NetBanking'] as const).map((m) => (
                  <button
                    type="button"
                    key={m}
                    onClick={() => setMethod(m)}
                    className={`py-2 px-2 rounded-lg border font-semibold transition-colors cursor-pointer text-center text-xs ${
                      method === m
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-400 font-bold'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Reference */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Transaction / Cheque / Auth Ref (Optional)
              </label>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="e.g. POS Auth 90812 or UPI Ref 498102"
                className="w-full py-2 px-3 bg-slate-800 border border-slate-700 rounded-xl text-white"
              />
            </div>

            {/* Cashier Notes */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Cashier / Accounting Notes (Optional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Received at OPD Counter 2"
                className="w-full py-2 px-3 bg-slate-800 border border-slate-700 rounded-xl text-white"
              />
            </div>

            {/* Remaining Balance Indicator */}
            <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-center justify-between text-xs">
              <span className="text-slate-400">Balance after this payment:</span>
              <span
                className={`font-mono font-bold ${
                  newBalance === 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {newBalance === 0 ? 'Fully Paid (₹0 Due) ✓' : formatCurrency(newBalance)}
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="py-2 px-4 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="py-2.5 px-5 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-300 hover:from-emerald-300 hover:to-teal-200 transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
              >
                Record {formatCurrency(amount)} & Save &rarr;
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
