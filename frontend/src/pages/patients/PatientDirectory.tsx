import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../../store';
import { fetchPatients, createBackendPatient } from '../../store/medicalSlice';
import type { Patient } from '../../types/medical';
import { MetricCard } from '../../components/Card';
import { Button } from '../../components/Button';
import { OpenCaseView } from '../opd/OpenCaseView'; // Import the new screen view

export const PatientDirectory: React.FC = () => {
  // // Use AppDispatch type to properly support async thunk actions
  const dispatch = useDispatch<AppDispatch>();
  
  const { patients, loading, error } = useSelector((state: RootState) => state.medical);
  console.log("Patients", patients);
  console.log("loading", loading);
  console.log("error", error);

  // Load the complete un-filtered ledger upon entry view initialization
  useEffect(() => {
    dispatch(fetchPatients(''));
    console.log("patients after use effect", patients);
  }, [dispatch]);

  
  // Controls navigation depth into active clinical checkup frames
  const [activeCasePatient, setActiveCasePatient] = useState<Patient | null>(null);
  
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [phone, setPhone] = useState('');
  
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(createBackendPatient({ name, age: Number(age), gender, phone }));
    setName(''); setAge(''); setPhone(''); setShowForm(false);
  };
  
  if (loading) return <div className="p-8 text-center text-sm text-slate-500 animate-pulse">Syncing Secure Patient Index...</div>;
  if (error) return <div className="p-8 text-center text-xs font-semibold text-red-600 bg-red-50 rounded-lg">{error}</div>;
  // If a doctor clicks 'Open Case' on any patient record row, mount the workflow canvas immediately
  if (activeCasePatient) {
    return (
      <OpenCaseView 
        patient={activeCasePatient} 
        onBack={() => setActiveCasePatient(null)} 
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-slate-800">Master Patient Index</h3>
        <Button variant="primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'View Master List' : '+ Register New Lifelong Patient'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard title="Total Registered Files" value={patients.length} subtitle="records inside database" />
        <MetricCard title="Male Base" value={patients.filter(p => p.gender === 'Male').length} />
        <MetricCard title="Female Base" value={patients.filter(p => p.gender === 'Female').length} />
      </div>

      {showForm ? (
        <form onSubmit={handleRegister} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm max-w-xl space-y-4">
          {/* ... keeping file generation fields same as prior steps ... */}
          <h4 className="font-bold text-slate-700 border-b pb-2">Initialize Patient Health File</h4>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Full Name</label>
            <input required type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Age</label>
              <input required type="number" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" value={age} onChange={e => setAge(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Gender</label>
              <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" value={gender} onChange={e => setGender(e.target.value as any)}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Mobile Contact Phone</label>
            <input required type="tel" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" value={phone} onChange={e => setPhone(e.target.value)} />
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Save Base File</Button>
          </div>
        </form>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-200 bg-slate-50/50">
            <h3 className="font-semibold text-slate-700">Patient Registry Ledger</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-3 px-6">Unique Health ID (UHID)</th>
                  <th className="py-3 px-6">Patient Name</th>
                  <th className="py-3 px-6">Demographics</th>
                  <th className="py-3 px-6">Contact Number</th>
                  <th className="py-3 px-6 text-right">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
                {patients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-indigo-600">{patient.uhid}</td>
                    <td className="py-4 px-6 font-medium text-slate-800">{patient.name}</td>
                    <td className="py-4 px-6">{patient.gender}, {patient.age} Yrs</td>
                    <td className="py-4 px-6 text-slate-500">{patient.phone}</td>
                    <td className="py-4 px-6 text-right">
                      {/* UPDATED BUTTON: Links straight into active clinical context */}
                      <button 
                        onClick={() => setActiveCasePatient(patient)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm"
                      >
                        Open Case
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};