import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../../store';
import { fetchPatients, createBackendPatient } from '../../store/medicalSlice';
import type { Patient } from '../../types/medical';
import { MetricCard } from '../../components/Card';
import { Button } from '../../components/Button';
import { OpenCaseView } from '../opd/OpenCaseView';

export const PatientDirectory: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  
  const { patients, loading, error } = useSelector((state: RootState) => state.medical);

  // Local state for tracking what the user types in real-time
  const [searchQuery, setSearchQuery] = useState('');
  
  // Controls navigation depth into active clinical checkup frames
  const [activeCasePatient, setActiveCasePatient] = useState<Patient | null>(null);
  
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [phone, setPhone] = useState('');

  // Initial data load on mount
  useEffect(() => {
    dispatch(fetchPatients(''));
  }, [dispatch]);

  // Debounce API Search Trigger Logic
  useEffect(() => {
    // Create a timer to dispatch the backend search request after 400ms
    const delayDebounceFn = setTimeout(() => {
      dispatch(fetchPatients(searchQuery)); // Hits: GET /api/patients?query=searchQuery
    }, 400);

    return () => clearTimeout(delayDebounceFn); // Clear timer if user keeps typing
  }, [searchQuery, dispatch]);
  
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(createBackendPatient({ name, age: Number(age), gender, phone }));
    setName(''); setAge(''); setPhone(''); setShowForm(false);
  };
  
  // Handle layout loading errors safely without completely breaking the outer application frame
  if (error) return <div className="p-8 text-center text-xs font-semibold text-red-600 bg-red-50 rounded-lg">{error}</div>;

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
        <Button variant="primary" onClick={() => {
          setShowForm(!showForm);
          setSearchQuery(''); // Reset queries when toggling views
        }}>
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
          
          {/* UPDATED HEADER SECTION: Contains the title and inline search utility */}
          <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h3 className="font-semibold text-slate-700">Patient Registry Ledger</h3>
            
            <div className="relative w-full sm:w-72">
              <input 
                type="text"
                placeholder="Search by Name or Phone..."
                className="w-full pl-9 pr-4 py-1.5 border border-slate-200 bg-white rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 shadow-3xs placeholder:text-slate-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {/* Search Glass Magnifier SVG Icon Inlay */}
              <div className="absolute left-3 top-2.5 text-slate-400">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              {/* Reset/Clear button showing up contextually */}
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                >
                  &times;
                </button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto relative">
            {/* Inline Loading Sub-Overlay to signal background thunk refetches */}
            {loading && (
              <div className="absolute top-0 right-4 p-2 text-[10px] uppercase font-bold text-indigo-500 animate-pulse bg-indigo-50 rounded-b border-b border-x border-indigo-100">
                Searching...
              </div>
            )}

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
                {patients.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-slate-400 text-xs font-medium bg-slate-50/20">
                      No matching patient files found inside this repository index.
                    </td>
                  </tr>
                ) : (
                  patients.map((patient) => (
                    <tr key={patient.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 px-6 font-mono font-bold text-indigo-600">{patient.uhid}</td>
                      <td className="py-4 px-6 font-medium text-slate-800">{patient.name}</td>
                      <td className="py-4 px-6">{patient.gender}, {patient.age} Yrs</td>
                      <td className="py-4 px-6 text-slate-500">{patient.phone}</td>
                      <td className="py-4 px-6 text-right">
                        <button 
                          onClick={() => setActiveCasePatient(patient)}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm"
                        >
                          Open Case
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};