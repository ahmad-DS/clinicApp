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