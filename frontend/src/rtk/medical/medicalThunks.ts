import { createAsyncThunk } from '@reduxjs/toolkit';
import type { Patient, Appointment, PatientCase } from './medicalTypes';
import { API_BASE_URL } from '../../../src/config';

// --- ASYNC THUNKS FOR BACKEND API COMMUNICATION ---

// 1. Fetch/Search Patients from backend
export const fetchPatients = createAsyncThunk(
  'medical/fetchPatients',
  async (searchQuery: string = '') => {
    const response = await fetch(`${API_BASE_URL}/api/patients?query=${encodeURIComponent(searchQuery)}`, {
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Failed to fetch patient data directory');
    const { patients } = await response.json();

    console.log("data from get patients api", patients)

    // Normalize backend data structure (mapping backend 'sex' to frontend 'gender')
    return patients.map((p: any) => ({
      id: p._id || p.id, // Handles standard MongoDB or SQL ID formats
      name: p.name,
      age: p.age,
      gender: p.sex, // Mapping 'sex' to your state's 'gender' property
      phone: p.phone || 'N/A',
      uhid: p.patient_number || `UHID-${Math.floor(100000 + Math.random() * 900000)}`
    })) as Patient[];
  }
);

export const fetchPatientById = createAsyncThunk(
  'medical/fetchPatientById',
  async (patientId: string) => {
    const response = await fetch(`${API_BASE_URL}/api/patients/${patientId}`, {
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Failed to fetch patient detail');

    const { patient } = await response.json();
    return {
      id: patient.id,
      name: patient.name,
      age: patient.age,
      gender: patient.sex,
      phone: patient.phone || 'N/A',
      uhid: patient.patient_number
    } as Patient;
  }
)

// 2. Create/Register a New Patient in the Database
export const createBackendPatient = createAsyncThunk(
  'medical/createBackendPatient',
  async (newPatientData: Omit<Patient, 'id' | 'uhid'>) => {
    const backendPayload = {
      name: newPatientData.name,
      age: newPatientData.age,
      sex: newPatientData.gender, // Map frontend structural layout back to server model
      phone: newPatientData.phone
    };

    const response = await fetch(`${API_BASE_URL}/api/patients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(backendPayload),
      credentials: 'include'
    });

    if (!response.ok) throw new Error('Server registration failed');
    const { patient } = await response.json();

    // Map saved data returned from your server back into application layout types
    return {
      id: patient._id || patient.id,
      name: patient.name,
      age: patient.age,
      gender: patient.sex,
      phone: patient.phone || 'N/A',
      uhid: patient.uhid || `UHID-${Math.floor(100000 + Math.random() * 900000)}`
    } as Patient;
  }
);

export const fetchAppointmentsByDate = createAsyncThunk(
  'medical/fetchAppointmentsByDate',
  async (date: string = "") => {
    const response = await fetch(`${API_BASE_URL}/api/appointments?date=${date}`, {
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Failed to fetch appointments');
    const { queue_count, queue } = await response.json();
    console.log("queue count", queue_count)

    return queue.map((p: any) => ({
      id: p.id,
      patient: p.patients,
      tokenNumber: p.token_number,
      status: p.status,
      appointmentTime: '09:30 AM',
      visitType: "Walk-in"
    })) as Appointment[]
  }
)

export const createPatientAppointment = createAsyncThunk(
  'medical/createPatientAppointment',
  async ({ patientId, appointmentDate }: { patientId: string, appointmentDate: string }) => {
    const payload = {
      patient_id: patientId,
      appointment_date: appointmentDate
    }
    const response = await fetch(`${API_BASE_URL}/api/appointments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      credentials: 'include'
    })

    if (!response.ok) throw new Error('Create appointment failed');
    const { appointment } = await response.json();
    return appointment;
  }
)

export const fetchPatientHistory = createAsyncThunk(
  'medical/fetchPatientHistory',
  async (patientId: string) => {
    const response = await fetch(`${API_BASE_URL}/api/patients/${patientId}/history`, {
      credentials: 'include'
    });

    if (!response.ok) throw new Error('Fetch patient history failed');
    const { history } = await response.json();

    return history.map((h: any) => ({
      id: h.id,
      patientId,
      consultationDate: h.created_at,
      description: h.description,
      uploadedImages: h.medical_images.map((data: any) => data.image_url)
    })) as PatientCase[];
  }
)

export const savePatientHistory = createAsyncThunk(
  'medical/savePatientHistory',
  async ({ patientId, formData }: { patientId: string; formData: FormData }) => {
    // Matches: router.post('/:patient_id/history', addMedicalHistory) or your equivalent route
    const response = await fetch(`${API_BASE_URL}/api/patients/${patientId}/history`, {
      method: 'POST',
      body: formData, // CRITICAL: Do NOT set Content-Type header manually when passing FormData; the browser sets boundary specs automatically
      credentials: 'include'
    });

    if (!response.ok) throw new Error('Failed to synchronize history records to Supabase instance');
    return await response.json();
  }
)