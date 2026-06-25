import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { MedicalState, Appointment, PatientCase, Patient } from './medicalTypes';
import { fetchPatients, createBackendPatient, fetchAppointmentsByDate, createPatientAppointment, fetchPatientHistory, savePatientHistory, fetchPatientById } from './medicalThunks'



const initialState: MedicalState = {
  patients: [
    // { id: 'p1', name: 'Ramesh Sharma', age: 45, gender: 'Male', phone: '9876543210', uhid: 'UHID-938210' },
    // { id: 'p2', name: 'Priya Patel', age: 29, gender: 'Female', phone: '9123456789', uhid: 'UHID-104921' },
  ],
  appointments: [
    // { id: '1', tokenNumber: 101, patient: { id: 'p1', name: 'Ramesh Sharma', age: 45, gender: 'Male', phone: '9876543210', uhid: 'UHID-938210' }, appointmentTime: '09:30 AM', status: 'Waiting', visitType: 'Walk-in' }
  ],
  currentPatient: null,
  cases: [], // Empty repository to start
  historyLoading: false,
  appointmentDate: new Date().toISOString().split('T')[0],
  loading: false,
  error: null
};

export const medicalSlice = createSlice({
  name: 'medical',
  initialState,
  reducers: {
    setAppointmentDate: (state, action: PayloadAction<string>) => {
      state.appointmentDate = action.payload;
    },
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
      .addCase(fetchPatientById.fulfilled, (state, action: PayloadAction<Patient>) => {
        state.currentPatient = action.payload;
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
        state.cases = action.payload;
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

export const { addAppointment, savePatientCase, setAppointmentDate } = medicalSlice.actions;
export default medicalSlice.reducer;