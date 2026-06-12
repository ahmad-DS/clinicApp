import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { Patient, Appointment } from '../types/medical';

const API_BASE_URL = 'http://localhost:5000/api'; // Adjust to your server port

// --- ASYNC THUNKS FOR BACKEND API COMMUNICATION ---

// 1. Fetch/Search Patients from backend
export const fetchPatients = createAsyncThunk(
  'medical/fetchPatients',
  async (searchQuery: string = '') => {
    const response = await fetch(`${API_BASE_URL}/patients?query=${encodeURIComponent(searchQuery)}`);
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
      uhid: p.uhid || `UHID-${Math.floor(100000 + Math.random() * 900000)}`
    })) as Patient[];
  }
);

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

    const response = await fetch(`${API_BASE_URL}/patients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(backendPayload)
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
    const response = await fetch(`${API_BASE_URL}/appointments?date=${date}`);
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
    const response = await fetch(`${API_BASE_URL}/appointments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    if (!response.ok) throw new Error('Create appointment failed');
    const { appointment } = await response.json();
    return appointment;
  }
)

export const fetchPatientHistory = createAsyncThunk(
  'medical/fetchPatientHistory',
  async (patientId: string) => {
    const response = await fetch(`${API_BASE_URL}/patients/${patientId}/history`);

    if (!response.ok) throw new Error('Fetch patient history failed');
    const { history } = await response.json();

    return history.map((h: any) => ({
      id: h.id,
      patientId,
      consultationDate: h.created_at,
      description: h.description,
      uploadedImages: h.medical_images.map((data: any) => data.image_url)
    })) as PatientCase[]

  }
)

export const savePatientHistory = createAsyncThunk(
  'medical/savePatientHistory',
  async ({ patientId, formData }: { patientId: string; formData: FormData }) => {
    // Matches: router.post('/:patient_id/history', addMedicalHistory) or your equivalent route
    const response = await fetch(`${API_BASE_URL}/patients/${patientId}/history`, {
      method: 'POST',
      body: formData // CRITICAL: Do NOT set Content-Type header manually when passing FormData; the browser sets boundary specs automatically
    });

    if (!response.ok) throw new Error('Failed to synchronize history records to Supabase instance');
    return await response.json();
  }
)



// New TS Interface defining a Medical Case File
export interface PatientCase {
  id: string;
  patientId: string;
  consultationDate: string;
  description: string;
  uploadedImages: string[]; // Stores Base64 string representations of uploaded files
}

interface MedicalState {
  patients: Patient[];
  appointments: Appointment[];
  cases: PatientCase[]; // Shared master historical logs
  historyLoading: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: MedicalState = {
  patients: [
    // { id: 'p1', name: 'Ramesh Sharma', age: 45, gender: 'Male', phone: '9876543210', uhid: 'UHID-938210' },
    // { id: 'p2', name: 'Priya Patel', age: 29, gender: 'Female', phone: '9123456789', uhid: 'UHID-104921' },
  ],
  appointments: [
    // { id: '1', tokenNumber: 101, patient: { id: 'p1', name: 'Ramesh Sharma', age: 45, gender: 'Male', phone: '9876543210', uhid: 'UHID-938210' }, appointmentTime: '09:30 AM', status: 'Waiting', visitType: 'Walk-in' }
  ],
  cases: [], // Empty repository to start
  historyLoading: false,
  loading: false,
  error: null

};

export const medicalSlice = createSlice({
  name: 'medical',
  initialState,
  reducers: {
    addAppointment: (state, action: PayloadAction<Omit<Appointment, 'id' | 'tokenNumber'>>) => {
      const nextToken = state.appointments.length > 0 ? Math.max(...state.appointments.map(a => a.tokenNumber)) + 1 : 101;
      const newApt: Appointment = { ...action.payload, id: `apt-${Date.now()}`, tokenNumber: nextToken };
      state.appointments.push(newApt);
    },
    // NEW ACTION: Commits clinical checkup summaries straight to database state
    savePatientCase: (state, action: PayloadAction<Omit<PatientCase, 'id' | 'consultationDate'>>) => {
      const newCase: PatientCase = {
        ...action.payload,
        id: `case-${Date.now()}`,
        consultationDate: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
      };
      state.cases.push(newCase);

      // If this patient was in today's OPD queue, auto-toggle their status to 'Completed'
      const activeApt = state.appointments.find(a => a.patient.id === action.payload.patientId && a.status !== 'Completed');
      if (activeApt) {
        activeApt.status = 'Completed';
      }
    }
  },
  // Handles network lifecycle events securely
  extraReducers: (builder) => {
    builder
      // Fetch Handlers
      .addCase(fetchPatients.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPatients.fulfilled, (state, action: PayloadAction<Patient[]>) => {
        console.log("action", action)
        state.loading = false;
        state.patients = action.payload; // Updates the registry view with real live profiles
      })
      .addCase(fetchPatients.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to sync database information.';
      })

      // Creation Handlers
      .addCase(createBackendPatient.fulfilled, (state, action: PayloadAction<Patient>) => {
        state.patients.push(action.payload); // Instantly pushes newly registered users to local state array
      });
    builder
      .addCase(fetchAppointmentsByDate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAppointmentsByDate.fulfilled, (state, action: PayloadAction<Appointment[]>) => {
        console.log("action", action)
        state.loading = false;
        state.appointments = action.payload; // Updates the registry view with real live profiles
      })
      .addCase(fetchAppointmentsByDate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to sync database information.';
      });
    builder
      .addCase(createPatientAppointment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPatientAppointment.fulfilled, (state, action: PayloadAction<Appointment[]>) => {
        console.log("action", action)
        state.loading = false; // Updates the registry view with real live profiles
      })
      .addCase(createPatientAppointment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to sync database information.';
      });
    builder
      .addCase(fetchPatientHistory.pending, (state) => {
        state.historyLoading = true;
        state.error = null;
      })
      .addCase(fetchPatientHistory.fulfilled, (state, action: PayloadAction<PatientCase[]>) => {
        console.log("action", action)
        state.historyLoading = false; // Updates the registry view with real live profiles
        state.cases = action.payload
      })
      .addCase(fetchPatientHistory.rejected, (state, action) => {
        state.historyLoading = false;
        state.error = action.error.message || 'Failed to sync database information.';
      })
    builder
      .addCase(savePatientHistory.fulfilled, (state, action: PayloadAction<PatientCase[]>) => {
        console.log("action", action)
        state.historyLoading = false; // Updates the registry view with real live profiles
        // state.cases = action.payload
      })
      .addCase(savePatientHistory.rejected, (state, action) => {
        state.historyLoading = false;
        state.error = action.error.message || 'Failed to sync database information.';
      })
  }
});

export const { addAppointment, savePatientCase } = medicalSlice.actions;
export default medicalSlice.reducer;