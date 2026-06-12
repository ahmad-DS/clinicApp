import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from './layouts/DashboardLayout';
import { QueueDashboard } from './pages/opd/QueueDashboard';
import { PatientDirectory } from './pages/patients/PatientDirectory'; // Import here

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<Navigate to="/opd" replace />} />
          <Route path="opd" element={<QueueDashboard />} />
          
          {/* Mount the fully operational patient directory sheet component */}
          <Route path="patients" element={<PatientDirectory />} />
          
          <Route path="prescriptions" element={<div className="p-4 text-slate-500">Prescription Archives</div>} />
          <Route path="billing" element={<div className="p-4 text-slate-500">Billing Ledger</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;