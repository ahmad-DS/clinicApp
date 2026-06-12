export interface Patient {
  id?: string;
  name: string;
  age: number;
  sex: 'Male' | 'Female' | 'Other';
  phone?: string;
  created_at?: string;
}