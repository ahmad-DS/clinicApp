import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import type { RootState } from './store';
import { useSelector } from 'react-redux'
import { DashboardLayout } from './layouts/DashboardLayout';
import { QueueDashboard } from './pages/opd/QueueDashboard';
import { PatientDirectory } from './pages/patients/PatientDirectory';
import { PatientProfile } from './pages/patients/PatientProfile';
import { AuthPage } from './pages/auth/AuthPage';

function App() {
  const isAuthenticated = useSelector((state: RootState) => state.auth.loggedIn);

  const ProtectedRoute = () => {
    // If logged in, let them pass through to sub-routes (via <Outlet />)
    // Otherwise, kick them back to the login page securely
    return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
  };
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<AuthPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<Navigate to="/opd" replace />} />
            <Route path="opd" element={<QueueDashboard />} />

            {/* Mount the fully operational patient directory sheet component */}
            <Route path="patients" element={<PatientDirectory />} />
            {/* 2. New Dynamic Patient Profile Route */}
            <Route path="patients/:patientId" element={<PatientProfile />} />

            <Route path="prescriptions" element={<div className="p-4 text-slate-500">Prescription Archives</div>} />
            <Route path="billing" element={<div className="p-4 text-slate-500">Billing Ledger</div>} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;