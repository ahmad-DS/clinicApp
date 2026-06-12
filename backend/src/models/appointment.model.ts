export interface Appointment {
  id?: string;
  patient_id: string;
  appointment_date: string; // Format: YYYY-MM-DD
  token_number?: number;
  status?: 'Scheduled' | 'Completed' | 'Cancelled';
  created_at?: string;
}