import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BillItem, BillInvoice } from '../types';
import { Plus, Trash2, X, Calculator } from 'lucide-react';

interface CreateBillModalProps {
  hospitalId: string;
  hospitalName: string;
  defaultDate?: string;
  onClose: () => void;
  onInvoiceCreated: (newInvoice: BillInvoice) => void;
}

const PRESET_PATIENTS = [
  { name: 'Priya Sharma', patientId: 'MN-P8921', contact: '+91 98401 23456' },
  { name: 'Rajesh Kumar', patientId: 'MN-P4410', contact: '+91 98840 98765' },
  { name: 'Ananya Sen', patientId: 'MN-P3192', contact: '+91 97110 54321' },
  { name: 'Karthik Venkat', patientId: 'MN-P7725', contact: '+91 94440 11223' },
  { name: 'Meenakshi Sundaram', patientId: 'MN-P5519', contact: '+91 98410 77665' },
];

const DEPARTMENTS = [
  'Cardiology',
  'General Ward / OPD',
  'ICU / Critical Care',
  'Orthopedics',
  'Pediatrics',
  'Neurology',
  'Emergency',
  'Diagnostics & Lab',
  'Pharmacy',
];

export const CreateBillModal: React.FC<CreateBillModalProps> = ({
  hospitalId,
  hospitalName,
  defaultDate = '2026-10-02',
  onClose,
  onInvoiceCreated,
}) => {
  const { t, addInvoice } = useApp();

  const [selectedPreset, setSelectedPreset] = useState<string>('Priya Sharma');
  const [patientName, setPatientName] = useState<string>('Priya Sharma');
  const [patientId, setPatientId] = useState<string>('MN-P8921');
  const [patientContact, setPatientContact] = useState<string>('+91 98401 23456');
  const [department, setDepartment] = useState<string>('Cardiology');
  const [doctorName, setDoctorName] = useState<string>('Dr. Kavya Iyer');
  const [date, setDate] = useState<string>(defaultDate);
  const [paymentMethod, setPaymentMethod] = useState<BillInvoice['paymentMethod']>('UPI');
  const [insuranceProvider, setInsuranceProvider] = useState<string>('');
  const [discount, setDiscount] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');

  const [items, setItems] = useState<BillItem[]>([
    {
      id: 'itm_' + Math.random().toString(36).slice(2, 7),
      description: 'Specialist Consultation & Clinical Examination',
      category: 'Consultation',
      quantity: 1,
      unitPrice: 1200,
      total: 1200,
    },
    {
      id: 'itm_' + Math.random().toString(36).slice(2, 7),
      description: 'Diagnostic Blood Work & Routine Panel',
      category: 'Diagnostics & Lab',
      quantity: 1,
      unitPrice: 850,
      total: 850,
    },
  ]);

  const [amountPaidCustom, setAmountPaidCustom] = useState<string>('');

  // Preset Selection handler
  const handlePresetChange = (name: string) => {
    setSelectedPreset(name);
    const found = PRESET_PATIENTS.find((p) => p.name === name);
    if (found) {
      setPatientName(found.name);
      setPatientId(found.patientId);
      setPatientContact(found.contact);
    } else if (name === 'custom') {
      setPatientName('');
      setPatientId('MN-P' + Math.random().toString(36).slice(2, 6).toUpperCase());
      setPatientContact('');
    }
  };

  // Item Updates
  const handleItemChange = (index: number, field: keyof BillItem, value: any) => {
    setItems((prev) => {
      const copy = [...prev];
      const item = { ...copy[index], [field]: value };
      if (field === 'quantity' || field === 'unitPrice') {
        const q = field === 'quantity' ? Number(value) : item.quantity;
        const u = field === 'unitPrice' ? Number(value) : item.unitPrice;
        item.total = Math.max(0, q * u);
      }
      copy[index] = item;
      return copy;
    });
  };

  const addItemRow = () => {
    setItems((prev) => [
      ...prev,
      {
        id: 'itm_' + Math.random().toString(36).slice(2, 7),
        description: '',
        category: 'Consultation',
        quantity: 1,
        unitPrice: 500,
        total: 500,
      },
    ]);
  };

  const removeItemRow = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Math calculations
  const subtotal = items.reduce((sum, it) => sum + (it.total || 0), 0);
  const tax = Math.round(subtotal * 0.05); // 5% GST
  const grandTotal = Math.max(0, subtotal + tax - discount);
  const amountPaid = amountPaidCustom === '' ? grandTotal : Math.max(0, Number(amountPaidCustom));
  const balanceDue = Math.max(0, grandTotal - amountPaid);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!patientName.trim()) {
      alert('Please provide a patient name');
      return;
    }

    const pad = (n: number) => n.toString().padStart(2, '0');
    const now = new Date();
    const timeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
    const invoiceNum = `INV-${date.replace(/-/g, '')}-${pad(Math.floor(Math.random() * 90 + 10))}`;

    const newInvoice = addInvoice({
      invoiceNumber: invoiceNum,
      hospitalId,
      hospitalName,
      patientId: patientId.trim() || 'MN-P' + Math.random().toString(36).slice(2, 6).toUpperCase(),
      patientName: patientName.trim(),
      patientContact,
      department,
      doctorName,
      date,
      time: timeStr,
      items,
      subtotal,
      tax,
      discount,
      totalAmount: grandTotal,
      amountPaid,
      balanceDue,
      paymentMethod,
      paymentStatus: balanceDue === 0 ? 'Paid' : amountPaid > 0 ? 'Partial' : 'Pending',
      insuranceProvider: paymentMethod === 'Insurance' ? insuranceProvider : undefined,
      notes,
    });

    onInvoiceCreated(newInvoice);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/95">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Calculator className="w-5 h-5 text-cyan-400" />
              {t('recordPaymentTitle', 'Generate Medical Bill / Record Payment')}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {hospitalName} &middot; Recording to central hospital billing ledger
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Patient Selection Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-800/40 border border-slate-700/60">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Quick Select Patient
              </label>
              <select
                value={selectedPreset}
                onChange={(e) => handlePresetChange(e.target.value)}
                className="w-full text-xs py-2 px-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-400"
              >
                {PRESET_PATIENTS.map((p) => (
                  <option key={p.patientId} value={p.name}>
                    {p.name} ({p.patientId})
                  </option>
                ))}
                <option value="custom">+ New / Other Patient</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                {t('patientName', 'Patient Name')} *
              </label>
              <input
                type="text"
                required
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="e.g. Ramesh Iyer"
                className="w-full text-xs py-2 px-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                {t('patientIdLabel', 'Patient ID')}
              </label>
              <input
                type="text"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                placeholder="e.g. MN-P9012"
                className="w-full text-xs py-2 px-3 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {/* Department, Date, Doctor */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                {t('department', 'Department')}
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full text-xs py-2 px-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-400"
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                {t('doctor', 'Doctor / Specialist')}
              </label>
              <input
                type="text"
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                placeholder="e.g. Dr. Kavya Iyer"
                className="w-full text-xs py-2 px-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                {t('dateLabel', 'Invoice Date')} *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-xs py-2 px-3 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {/* Items Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs uppercase font-bold tracking-wider text-slate-300">
                Billable Services & Medical Items
              </h4>
              <button
                type="button"
                onClick={addItemRow}
                className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-400 hover:text-cyan-300 py-1 px-2.5 rounded-lg bg-cyan-950/60 border border-cyan-800/60 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                {t('addNewItem', '+ Add Item')}
              </button>
            </div>

            <div className="space-y-2">
              {items.map((item, index) => (
                <div
                  key={item.id}
                  className="grid grid-cols-12 gap-2 items-center p-2.5 rounded-lg bg-slate-800/40 border border-slate-700/60 text-xs"
                >
                  <div className="col-span-5">
                    <input
                      type="text"
                      required
                      placeholder="Item description (e.g. 1-Day Bed Stay)"
                      value={item.description}
                      onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                      className="w-full py-1.5 px-2 bg-slate-800 border border-slate-700 rounded text-white"
                    />
                  </div>
                  <div className="col-span-3">
                    <select
                      value={item.category}
                      onChange={(e) => handleItemChange(index, 'category', e.target.value)}
                      className="w-full py-1.5 px-2 bg-slate-800 border border-slate-700 rounded text-white text-[11px]"
                    >
                      <option value="Consultation">Consultation</option>
                      <option value="Bed Charges">Bed Charges</option>
                      <option value="Diagnostics & Lab">Diagnostics & Lab</option>
                      <option value="Pharmacy">Pharmacy</option>
                      <option value="Procedure">Procedure</option>
                      <option value="Emergency">Emergency</option>
                      <option value="Nursing">Nursing</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="col-span-1">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                      className="w-full py-1.5 px-1 text-center font-mono bg-slate-800 border border-slate-700 rounded text-white"
                      title="Quantity"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      min="0"
                      step="50"
                      value={item.unitPrice}
                      onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                      className="w-full py-1.5 px-2 text-right font-mono bg-slate-800 border border-slate-700 rounded text-white"
                      placeholder="Rate"
                      title="Rate in ₹"
                    />
                  </div>
                  <div className="col-span-1 flex justify-center">
                    <button
                      type="button"
                      onClick={() => removeItemRow(index)}
                      disabled={items.length <= 1}
                      className="text-slate-500 hover:text-rose-400 p-1 disabled:opacity-30 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment & Calculation Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-800">
            {/* Payment Method Details */}
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  {t('paymentMethodLabel', 'Payment Method')}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['UPI', 'Card', 'Cash', 'Insurance', 'NetBanking'] as const).map((method) => (
                    <button
                      type="button"
                      key={method}
                      onClick={() => setPaymentMethod(method)}
                      className={`py-2 px-2 text-xs font-semibold rounded-lg border transition-colors cursor-pointer text-center ${
                        paymentMethod === method
                          ? 'bg-cyan-950 text-cyan-300 border-cyan-400'
                          : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-white'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              {paymentMethod === 'Insurance' && (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Insurance Provider & Policy / Claim #
                  </label>
                  <input
                    type="text"
                    value={insuranceProvider}
                    onChange={(e) => setInsuranceProvider(e.target.value)}
                    placeholder="e.g. Star Health TPA Claim #SH-2026-88102"
                    className="w-full text-xs py-2 px-3 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Internal Remarks / Doctor Notes
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Optional billing note (e.g. 10% senior citizen concession applied)"
                  className="w-full text-xs py-2 px-3 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>
            </div>

            {/* Calculations Breakdown */}
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/80 space-y-2 text-xs font-mono">
              <div className="flex justify-between text-slate-400">
                <span>{t('subtotal', 'Subtotal')}:</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>{t('discount', 'Discount (₹)')}:</span>
                <input
                  type="number"
                  min="0"
                  value={discount}
                  onChange={(e) => setDiscount(Math.max(0, Number(e.target.value)))}
                  className="w-24 text-right py-1 px-2 bg-slate-800 border border-slate-700 rounded text-emerald-400"
                />
              </div>
              <div className="flex justify-between text-slate-400">
                <span>{t('taxGst', 'Tax / GST (5%)')}:</span>
                <span>₹{tax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-2 border-t border-slate-700 text-sm font-bold text-white">
                <span>{t('grandTotal', 'Grand Total')}:</span>
                <span>₹{grandTotal.toLocaleString()}</span>
              </div>

              <div className="pt-2 border-t border-slate-700 space-y-2">
                <div className="flex justify-between items-center text-cyan-400 font-semibold">
                  <span>{t('amountPaidLabel', 'Amount Paid Now (₹)')}:</span>
                  <input
                    type="number"
                    min="0"
                    max={grandTotal}
                    value={amountPaidCustom === '' ? grandTotal : amountPaidCustom}
                    onChange={(e) => setAmountPaidCustom(e.target.value)}
                    className="w-28 text-right py-1 px-2 bg-cyan-950 border border-cyan-500 rounded text-cyan-300 font-bold"
                  />
                </div>
                <div className="flex justify-between text-slate-300 text-xs font-sans">
                  <span>{t('balanceDueLabel', 'Remaining Balance')}:</span>
                  <span className={`font-mono font-bold ${balanceDue > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    ₹{balanceDue.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 text-xs font-semibold text-slate-400 hover:text-white rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
            >
              {t('close', 'Cancel')}
            </button>
            <button
              type="submit"
              className="py-2.5 px-6 text-xs font-bold text-slate-950 rounded-lg bg-gradient-to-r from-cyan-400 to-fuchsia-400 hover:from-cyan-300 hover:to-fuchsia-300 transition-all shadow-lg shadow-cyan-500/20 cursor-pointer"
            >
              Record Bill & Save Receipt &rarr;
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
