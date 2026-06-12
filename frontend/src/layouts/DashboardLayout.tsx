import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';

export const DashboardLayout: React.FC = () => {
  // Map your sidebar tabs to actual URL routes
  const navigationItems = [
    { name: 'OPD Queue', path: '/opd' },
    { name: 'Patients', path: '/patients' },
    // { name: 'Prescriptions', path: '/prescriptions' },
    // { name: 'Billing', path: '/billing' },
  ];

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-indigo-950 text-white flex flex-col justify-between shadow-xl">
        <div>
          <div className="p-6 border-b border-indigo-900">
            <h1 className="text-xl font-bold tracking-wider text-indigo-400">DocSuite</h1>
            {/* <p className="text-xs text-indigo-200 mt-1">TatvaCare Inspired EMR</p> */}
          </div>
          
          <nav className="p-4 space-y-1">
            {navigationItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `block px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-indigo-200 hover:bg-indigo-900/50 hover:text-white'
                  }`
                }
              >
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>
        
        <div className="p-4 border-t border-indigo-900 text-xs text-indigo-300">
          Dr. Iqbal Warshi | General Physician
        </div>
      </aside>

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm">
          {/* Real-time title could be expanded later, but sticking to clean design */}
          <h2 className="text-lg font-semibold text-slate-700">Workspace Dashboard</h2>
          <div className="flex items-center gap-4">
            <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-sm font-medium text-slate-600">Clinic Open</span>
          </div>
        </header>

        {/* Content Body Container */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          {/* The <Outlet /> component renders whatever child route is active */}
          <Outlet />
        </main>
      </div>
    </div>
  );
};