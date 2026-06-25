import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState, AppDispatch } from '../../store';
import { loginUser } from '../../rtk/auth/authSlice'; // <-- Import your thunk action block

export const AuthPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  // Pull states directly from your global Redux auth state layer
  const { loggedIn, loginError, loading } = useSelector((state: RootState) => state.auth);

  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  // const [role, setRole] = useState('Doctor');

  // Watch for changes in loggedIn global state to trigger router redirect shifts
  useEffect(() => {
    if (loggedIn) {
      // Save a token mock profile if backend handles cookies so ProtectedRoute reads true
      localStorage.setItem('pulseflow_token', 'active_session_cookie_fallback');
      navigate('/opd', { replace: true });
    }
  }, [loggedIn, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLoginView) {
      // Dispatch your slice thunk action directly with your typed fields payload
      dispatch(loginUser({ email, password }));
    } else {
      // Optional fallback if you want to handle registration later
      alert("Registration thunk integration coming soon!");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto w-full max-w-md text-center">
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          WarshiHospitals <span className="text-indigo-600">Healthcare OS</span>
        </h2>
        <p className="mt-2 text-xs text-slate-500 uppercase tracking-wider font-semibold">
          Clinical Management & EMR Ecosystem
        </p>
      </div>

      <div className="mt-8 sm:mx-auto w-full max-w-md px-4">
        <div className="bg-white py-8 px-6 border border-slate-200 shadow-xl rounded-2xl space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-800">
              {isLoginView ? 'Sign in to your account' : 'Create professional credentials'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Please provide registered medical portal profiles</p>
          </div>

          {/* Reading Redux loginError state dynamically */}
          {loginError && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-xs font-semibold text-red-600">
              ⚠️ {loginError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLoginView && (
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Full Name</label>
                <input
                  required
                  type="text"
                  placeholder="Dr. Aman Sharma"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Email Address</label>
              <input
                required
                type="email"
                placeholder="name@hospital.com"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Password</label>
              <input
                required
                type="password"
                placeholder="••••••••"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm py-2.5 px-4 rounded-xl shadow-md transition-all cursor-pointer disabled:bg-slate-300 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing Workspace Verification...' : isLoginView ? 'Sign In & Load System' : 'Generate Secure Profile'}
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100 text-center">
            <button
              type="button"
              onClick={() => setIsLoginView(!isLoginView)}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold focus:outline-none"
            >
              {isLoginView ? "Don't have an account? Sign up instead" : 'Already registered? Log in to workspace'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};