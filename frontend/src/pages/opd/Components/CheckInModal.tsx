import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../../../store';
import { createBackendPatient, createPatientAppointment, fetchPatients, fetchAppointmentsByDate, setAppointmentDate } from '../../../store/medicalSlice';
import type { Patient } from '../../../types/medical';
import { Button } from '../../../components/Button';
import { ScrollableDateSelector } from '../../../components/ScrollableDateSelector';

interface CheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CheckInModal: React.FC<CheckInModalProps> = ({ isOpen, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();

  // Pull existing records from the shared Redux store slice
  const existingPatients = useSelector((state: RootState) => state.medical.patients);
  const appointmentDate = useSelector((state: RootState) => state.medical.appointmentDate);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  // State for creating a brand NEW patient
  const [isNewPatient, setIsNewPatient] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAge, setNewAge] = useState('');
  const [newGender, setNewGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [newPhone, setNewPhone] = useState('');
  const [visitType, setVisitType] = useState<'Walk-in' | 'Online'>('Walk-in');

  if (!isOpen) return null;

  const handleSelectExisting = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsNewPatient(false);
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    // Trigger live search dispatch only when user input length is meaningful
    if (value.trim().length >= 2) {
      dispatch(fetchPatients(value)); // Calls GET /api/patients?query=value
    } else if (value.trim().length === 0) {
      dispatch(fetchPatients('')); // Reset table entries back to default index view 
    }
  };

  const handleInitiateNewPatient = () => {
    setIsNewPatient(true);
    setSelectedPatient(null);
    setNewPhone(searchQuery); // Carry over searched phone number to form
  };

  const resetFormState = () => {
    setSearchQuery('');
    setSelectedPatient(null);
    setIsNewPatient(false);
    setNewName('');
    setNewAge('');
    setNewGender('Male');
    setNewPhone('');
    setVisitType('Walk-in');
  };

  // const handleSubmit1 = (e: React.FormEvent) => {
  //   e.preventDefault();

  //   let patientData: Patient;

  //   if (isNewPatient) {
  //     // Create properties for a brand-new patient
  //     const newPatientId = `p-${Date.now()}`;
  //     const generatedUhid = `UHID-${Math.floor(100000 + Math.random() * 900000)}`;

  //     patientData = {
  //       id: newPatientId,
  //       uhid: generatedUhid,
  //       name: newName,
  //       age: Number(newAge),
  //       gender: newGender,
  //       phone: newPhone
  //     };

  //     // 1. Commit the patient structure to the permanent master patient registry
  //     dispatch(createBackendPatient({
  //       name: newName,
  //       age: Number(newAge),
  //       gender: newGender,
  //       phone: newPhone
  //     }));
  //   } else if (selectedPatient) {
  //     // Use existing verified user database object
  //     patientData = selectedPatient;
  //   } else {
  //     return alert("Please select or register a patient first.");
  //   }

  //   // 2. Dispatch data matrix up to the main live OPD stream queue list
  //   dispatch(addAppointment({
  //     patient: patientData,
  //     appointmentTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  //     status: 'Waiting',
  //     visitType: visitType
  //   }));

  //   // Reset workflow fields and exit modal canvas
  //   resetFormState();
  //   onClose();
  // };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let patientId: string;

      if (isNewPatient) {
        const createdPatient = await dispatch(
          createBackendPatient({
            name: newName,
            age: Number(newAge),
            gender: newGender,
            phone: newPhone
          })
        ).unwrap();

        patientId = createdPatient.id;
        console.log("patient id", patientId);
      } else if (selectedPatient) {
        patientId = selectedPatient.id;
      } else {
        alert("Please select or register a patient first.");
        return;
      }
      // let appointmentDate = new Date()
      //   .toISOString()
      //   .split('T')[0]

      await dispatch(
        createPatientAppointment({
          patientId,
          appointmentDate
        })
      ).unwrap();

      await dispatch(
        fetchAppointmentsByDate(appointmentDate)
      );

      resetFormState();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to create appointment");
    }
  };
  const handleCancel = () => {
    resetFormState();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-md rounded-xl shadow-xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">

        {/* Modal Header Frame */}
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-slate-800">Add Patient to OPD Queue</h3>
          <button onClick={handleCancel} className="text-slate-400 hover:text-slate-600 font-bold text-lg">&times;</button>
        </div>

        {/* Modal Working Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1">

          {/* Section 1: Search Directory Global Component */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Step 1: Check Registered Database
            </label>
            <input
              type="text"
              placeholder="Search by Mobile Number or Name..."
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchQuery}
              onChange={handleSearchInputChange}
            />
          </div>

          {/* Search Result Dropdown Menu Array */}
          {searchQuery && !selectedPatient && !isNewPatient && (
            <div className="border border-slate-100 rounded-lg max-h-40 overflow-y-auto divide-y divide-slate-50 bg-slate-50/50">
              {existingPatients.map(p => (
                <div
                  key={p.id}
                  onClick={() => handleSelectExisting(p)}
                  className="p-3 text-xs hover:bg-indigo-50 cursor-pointer transition-colors flex justify-between items-center"
                >
                  <div>
                    <p className="font-bold text-slate-700">{p.name} ({p.gender}, {p.age})</p>
                    <p className="text-slate-400">{p.phone} • <span className="font-mono text-[10px]">{p.uhid}</span></p>
                  </div>
                  <span className="text-indigo-600 font-semibold text-[11px]">Select &rarr;</span>
                </div>
              ))}

              <div
                onClick={handleInitiateNewPatient}
                className="p-3 text-xs text-center text-indigo-600 font-medium hover:bg-indigo-50 cursor-pointer border-t border-dashed border-indigo-200 bg-indigo-50/30"
              >
                + No Record Found. Create New Patient for "{searchQuery}"
              </div>
            </div>
          )}

          {/* Action Choice Previews */}
          {selectedPatient && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-xs text-emerald-800 flex justify-between items-center">
              <div>
                <span className="font-semibold">Selected:</span> {selectedPatient.name} ({selectedPatient.uhid})
              </div>
              <button type="button" onClick={() => setSelectedPatient(null)} className="text-emerald-600 underline font-medium">Clear</button>
            </div>
          )}

          {/* Section 2: Conditional Short Form for New File Registration */}
          {isNewPatient && (
            <div className="bg-indigo-50/40 border border-indigo-100 rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold text-indigo-900 uppercase tracking-wide">New Patient Master File Form</span>
                <button type="button" onClick={() => setIsNewPatient(false)} className="text-xs text-slate-400 underline">Cancel</button>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">Full Name</label>
                <input required type="text" className="w-full px-2.5 py-1.5 border border-slate-200 rounded-md text-xs" value={newName} onChange={e => setNewName(e.target.value)} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-500 mb-1">Age</label>
                  <input required type="number" className="w-full px-2.5 py-1.5 border border-slate-200 rounded-md text-xs" value={newAge} onChange={e => setNewAge(e.target.value)} />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-500 mb-1">Gender</label>
                  <select className="w-full px-2.5 py-1.5 border border-slate-200 rounded-md text-xs" value={newGender} onChange={e => setNewGender(e.target.value as any)}>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">Mobile Number</label>
                <input required type="tel" className="w-full px-2.5 py-1.5 border border-slate-200 rounded-md text-xs" value={newPhone} onChange={e => setNewPhone(e.target.value)} />
              </div>
            </div>
          )}

          {/* INSERT COMPONENT: Injected date picker between patient choice and visit config blocks */}
          <div className="pt-2 border-t border-slate-100">
            <ScrollableDateSelector selectedDate={appointmentDate} onDateChange={(date) => {dispatch(setAppointmentDate(date));}} />
          </div>

          {/* Section 3: Shared Queue Fields (Applies to both) */}
          <div className="pt-2 border-t border-slate-100">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Step 2: Visit Configurations</label>
            <div className="flex gap-4">
              <label className="flex items-center text-xs font-medium text-slate-600 gap-1.5 cursor-pointer">
                <input type="radio" checked={visitType === 'Walk-in'} onChange={() => setVisitType('Walk-in')} className="text-indigo-600 focus:ring-indigo-500" />
                Walk-in Entry
              </label>
              <label className="flex items-center text-xs font-medium text-slate-600 gap-1.5 cursor-pointer">
                <input type="radio" checked={visitType === 'Online'} onChange={() => setVisitType('Online')} className="text-indigo-600 focus:ring-indigo-500" />
                Online / App Booking
              </label>
            </div>
          </div>

          {/* Form Action Layout Bottom Footer */}
          <div className="pt-4 border-t border-slate-100 flex gap-3 justify-end">
            <Button type="button" variant="secondary" onClick={handleCancel}>Cancel</Button>
            <Button type="submit" variant="primary">Confirm Entry into OPD</Button>
          </div>
        </form>

      </div>
    </div>
  );
};