export type Language = 'en' | 'hi' | 'ta' | 'es' | 'fr' | 'de';

export type UserRole = 'citizen' | 'admin' | null;

export interface CitizenUser {
  patientId: string;
  name: string;
  contact: string;
  email?: string;
  age?: number;
  gender?: string;
  bloodGroup?: string;
}

export interface AdminUser {
  hospitalId: string;
  name: string;
  contact: string;
  regNumber?: string;
}

export interface BedWard {
  total: number;
  available: number;
}

export interface Doctor {
  id: string;
  name: string;
  role: string;
  status: 'Available' | 'On Duty' | 'Off';
  specialty?: string;
}

export interface Staff {
  id: string;
  name: string;
  role: string;
  shift: 'Day' | 'Night';
  status: 'Available' | 'On Duty' | 'Off';
}

export interface Hospital {
  id: string;
  name: string;
  area: string;
  distanceKm: number;
  specialties: string[];
  beds: Record<string, BedWard>;
  doctors: Doctor[];
  staff: Staff[];
  phone?: string;
  rating?: number;
}

export interface Appointment {
  id: string;
  hospitalId: string;
  hospitalName: string;
  patientName: string;
  patientId?: string;
  dept: string;
  doctor: string;
  date: string;
  time: string;
  reason: string;
  status: 'Pending' | 'Confirmed' | 'Rescheduled' | 'Rejected';
  createdAt: string;
}

export interface AmbulanceRequest {
  id: string;
  patientName: string;
  condition: 'Normal' | 'Serious';
  type: 'Normal' | 'Ventilator-support';
  citizen: string;
  patientId?: string;
  symptoms?: string;
  status: 'Awaiting dispatch' | 'Dispatched';
  hospitalId?: string;
  hospitalName?: string;
  createdAt: string;
  etaMinutes?: number;
}

export interface BillItem {
  id: string;
  description: string;
  category: 'Consultation' | 'Bed Charges' | 'Pharmacy' | 'Diagnostics & Lab' | 'Procedure' | 'Nursing' | 'Emergency' | 'Other';
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface PaymentTransaction {
  id: string;
  invoiceId: string;
  amount: number;
  paymentMethod: 'Cash' | 'Card' | 'UPI' | 'Insurance' | 'NetBanking';
  date: string;
  time: string;
  reference?: string;
  recordedBy?: string;
  notes?: string;
}

export interface BillInvoice {
  id: string;
  invoiceNumber: string;
  hospitalId: string;
  hospitalName: string;
  patientId: string;
  patientName: string;
  patientContact?: string;
  department: string;
  doctorName?: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  items: BillItem[];
  subtotal: number;
  tax: number;
  discount: number;
  totalAmount: number;
  amountPaid: number;
  balanceDue: number;
  paymentMethod: 'Cash' | 'Card' | 'UPI' | 'Insurance' | 'NetBanking';
  paymentStatus: 'Paid' | 'Partial' | 'Pending';
  insuranceProvider?: string;
  notes?: string;
  transactions?: PaymentTransaction[];
  createdAt: string;
}

export interface CaseVisit {
  id: string;
  hospital: string;
  date: string;
  reason: string;
  diagnosis?: string;
}

export interface CaseDocument {
  id: string;
  title: string;
  date: string;
  details?: string;
  fileName?: string;
  fileData?: string;
}

export interface PatientCase {
  patientId: string;
  visits: CaseVisit[];
  prescriptions: CaseDocument[];
  reports: CaseDocument[];
}

export interface AccessRequest {
  id: string;
  patientId: string;
  hospitalId: string;
  hospitalName: string;
  status: 'pending' | 'approved' | 'denied';
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  who: 'user' | 'bot';
  text: string;
  timestamp: string;
}
