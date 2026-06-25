import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../../store';
import { fetchPatientHistory, savePatientHistory, fetchPatientById } from '../../rtk/medical/medicalThunks';
import { Button } from '../../components/Button';
import { useNavigate, useParams } from 'react-router-dom';


// interface OpenCaseViewProps {
//   patient: Patient;
//   onBack: () => void;
// }

export const PatientProfile: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>(); // <-- Get ID from URL
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  
  // Find the specific patient data out of the state registry array
  // const patient = useSelector((state: RootState) => 
  //   state.medical.currentPatient
  // );
  
  // Extract all historical cases tied to this specific patient from Redux
  // const pastMedicalHistory = useSelector((state: RootState) => 
  //   state.medical.cases
  // );
  const { currentPatient: patient, cases: pastMedicalHistory } = useSelector((state: RootState) => state.medical);
  console.log("current patient", patient);
  // const loading = useSelector((state: RootState) => state.medical.historyLoading);
  console.log("past medical history", pastMedicalHistory)

  const [history, setHistory] = useState('');

  // Track raw File instances to feed into multipart form submission pipelines
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  // Local object URL paths for rendering immediate temporary image previews
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  useEffect(() => {
    if (patientId) {
      dispatch(fetchPatientById(patientId)); // Fetch patient details by ID
      dispatch(fetchPatientHistory(patientId));
    }
  }, [dispatch, patientId]);

  // Fallback UI safety if a doctor enters a completely bogus ID manually in the address bar
  if (!patient) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
        <p className="text-sm text-slate-500 font-medium mb-3">Medical record file not found.</p>
        <Button variant="secondary" onClick={() => navigate('/patients')}>Return to Directory</Button>
      </div>
    );
  }


  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      
      // 1. Keep track of the file descriptors to append inside the form data payload downstream
      setSelectedFiles(prev => [...prev, ...filesArray]);

      // 2. Map dynamic resource references to render fast client previews
      const newPreviews = filesArray.map(file => URL.createObjectURL(file));
      setPreviewUrls(prev => [...prev, ...newPreviews]);
    }
  };

  const removeFileFromList = (indexToRemove: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== indexToRemove));
    // Clean up memory cache context allocation records explicitly
    URL.revokeObjectURL(previewUrls[indexToRemove]);
    setPreviewUrls(prev => prev.filter((_, i) => i !== indexToRemove));
  };

  
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!history.trim()) return alert("Please fill out the clinical notes first.");

    // Instantiate native multi-part data payload constructor 
    const formData = new FormData();
    formData.append('description', history); // Maps directly to backend structure check: const { description } = req.body;

    // Append binary fields systematically into multi-upload collection array matching destination targets
    selectedFiles.forEach(file => {
      formData.append('images', file); // Maps directly to: const files = req.files as Express.Multer.File[];
    });

    try {
      await dispatch(savePatientHistory({ 
        patientId: patient.id, 
        formData 
      })).unwrap();
      
      await dispatch(fetchPatientHistory(patient.id))

      alert(`Case Record safely updated for ${patient.name}!`);
      
      // Cleanup inputs
      setHistory('');
      setSelectedFiles([]);
      previewUrls.forEach(url => URL.revokeObjectURL(url)); // Flush local URL descriptors completely
      setPreviewUrls([]);
    } catch (err: any) {
      alert(`Syncing Error: ${err.message || 'Check database storage permission settings.'}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Frame */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          {/* CHANGED: Back button uses navigate string instead of a functional callback */}
          <button onClick={() => navigate('/patients')} className="text-slate-400 hover:text-slate-600 font-bold text-sm">&larr; Back to Directory</button>
          <div className="h-6 w-[1px] bg-slate-200" />
          <div>
            <h3 className="font-bold text-slate-800 text-base">EMR Consultation Workspace</h3>
            <p className="text-xs text-slate-500">Patient: <span className="font-semibold text-slate-700">{patient.name}</span> | ID: {patient.uhid}</p>
          </div>
        </div>
      </div>

      {/* Main Structural Three-Column Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        
        {/* PANEL 1: Patient Lifelong Medical History Timeline */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col max-h-[80vh]">
          <div className="p-4 bg-slate-50 border-b border-slate-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Patient Longitudinal Records ({pastMedicalHistory.length})
            </h4>
          </div>
          
          <div className="p-4 overflow-y-auto space-y-6 flex-1 bg-slate-50/30">
            {pastMedicalHistory.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs font-medium">
                No past consultations recorded for this file yet.
              </div>
            ) : (
              <div className="relative border-l-2 border-indigo-100 ml-2 pl-4 space-y-6">
                {pastMedicalHistory.map((record) => (
                  <div key={record.id} className="relative group">
                    {/* Timeline Node Badge Icon */}
                    <div className="absolute -left-[25px] top-1 bg-indigo-600 h-3 w-3 rounded-full border-2 border-white shadow-sm" />
                    
                    {/* Event Snapshot Card */}
                    <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs hover:border-slate-300 transition-colors">
                      <span className="text-[10px] font-bold text-indigo-600 block mb-1">
                        {record.consultationDate}
                      </span>
                      <p className="text-xs text-slate-700 font-medium whitespace-pre-wrap leading-relaxed">
                        {record.description}
                      </p>
                      
                      {/* Past Attached Files Sub-Grid */}
                      {record.uploadedImages && record.uploadedImages.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-slate-100 grid grid-cols-4 gap-1.5">
                          {record.uploadedImages.map((imgSrc, idx) => (
                            <a 
                              key={idx} 
                              href={imgSrc} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="aspect-square rounded border bg-slate-50 overflow-hidden block hover:opacity-80 transition-opacity"
                            >
                              <img src={imgSrc} alt="historical attachment" className="w-full h-full object-cover" />
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* PANEL 2 & 3: Active Input Entry Suite (Right Side) */}
        <div className="xl:col-span-2 space-y-6">
          <form onSubmit={handleFormSubmit} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
            
            <div className="border-b pb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600">New Diagnostic Session Entry</h4>
            </div>

            {/* Note Fields */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                Chief Complaints & Examination Findings
              </label>
              <textarea
                required
                rows={5}
                placeholder="Record active physiological observations, temperature/BP vitals notes, or diagnostic deductions here..."
                className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={history}
                onChange={(e) => setHistory(e.target.value)}
              />
            </div>

            {/* File Management Attachment Zone */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                Upload Active Scans or Lab Prescriptions
              </label>
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl p-6 bg-slate-50/50 relative hover:bg-slate-50 cursor-pointer group">
                <input 
                  type="file" 
                  multiple 
                  accept="image/*"
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  onChange={handleImageUpload}
                />
                <span className="text-indigo-600 text-xs font-bold group-hover:underline">+ Add Lab Report Images</span>
              </div>

              {/* Live Preview Gallery Grid */}
              {previewUrls.length > 0 && (
                <div className="grid grid-cols-4 gap-3 mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  {previewUrls.map((src, i) => (
                    <div key={i} className="relative aspect-square rounded-lg overflow-hidden border bg-white shadow-sm">
                      <img src={src} alt="preview thumbnail" className="w-full h-full object-cover" />
                      <button 
                        type="button" 
                        onClick={() => removeFileFromList(i)}
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold shadow"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submissions Execution Controls bar */}
            <div className="pt-4 border-t flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={() => navigate('/patients')}>Finish Consultation</Button>
              <Button type="submit" variant="success">Commit Entry to Patient File</Button>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
};
