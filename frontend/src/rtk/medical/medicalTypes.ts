export type AppointmentStatus = 'Waiting' | 'In-Consultation' | 'Completed' | 'Missed';

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  phone: string;
  uhid?: string; // Unique Health ID (like ABHA ID in India)
}

export interface Appointment {
  id: string;
  patient: Patient;
  tokenNumber: number;
  appointmentTime: string;
  status: AppointmentStatus;
  visitType: 'Walk-in' | 'Online';
}

// New TS Interface defining a Medical Case File
export interface PatientCase {
  id: string;
  patientId: string;
  consultationDate: string;
  description: string;
  uploadedImages: string[]; // Stores Base64 string representations of uploaded files
}

export interface MedicalState {
  patients: Patient[];
  appointments: Appointment[];
  cases: PatientCase[]; // Shared master historical logs
  historyLoading: boolean;
  loading: boolean;
  error: string | null;
  appointmentDate: string;
  currentPatient: Patient | null;
}