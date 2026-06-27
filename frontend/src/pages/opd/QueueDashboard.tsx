import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../../store';
import type { Appointment } from '../../rtk/medical/medicalTypes';
import { MetricCard } from '../../components/Card';
import { Button } from '../../components/Button';
import { ScrollableDateSelector } from '../../components/ScrollableDateSelector';
import { CheckInModal } from './Components/CheckInModal';
import { fetchAppointmentsByDate } from '../../rtk/medical/medicalThunks';
import { setAppointmentDate } from '../../rtk/medical/medicalSlice';
import { useNavigate } from 'react-router-dom';


export const QueueDashboard: React.FC = () => {
  // Sync core data straight from the global store
  const dispatch = useDispatch<AppDispatch>()
  const appointments = useSelector((state: RootState) => state.medical.appointments);
  const appointmentDate = useSelector((state: RootState) => state.medical.appointmentDate);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getStatusColor = (status: Appointment['status']) => {
    switch (status) {
      case 'Waiting': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'In-Consultation': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'Completed': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const navigate = useNavigate()
  // const patientID = dispatch

  // const handleNavigate = ()=>{
  //   navigate(`/patient/${patientID}`)
  // }
  useEffect(() => {
    dispatch(fetchAppointmentsByDate(appointmentDate));
    console.log("patients after use effect", appointments);
  }, [dispatch, appointmentDate]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-slate-800">Clinic Management Matrix</h3>
        {/* Trigger Button */}
        <Button variant="primary" onClick={() => setIsModalOpen(true)}>
          + Check-In / Walk-In Patient
        </Button>
      </div>
      {/* Quick Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Total Checked In"
          value={appointments.length}
          subtitle="registered today"
        />
        <MetricCard
          title="In Waiting Area"
          value={appointments.filter(a => a.status === 'Waiting').length}
          badgeText="High Flow"
          badgeType="waiting"
        />
        <MetricCard
          title="Completed Visits"
          value={appointments.filter(a => a.status === 'Completed').length}
          badgeText="Synced"
          badgeType="success"
        />
      </div>
      {/* <div className="border-t border-slate-200">
        shakil Ahmad
      </div> */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <ScrollableDateSelector
          selectedDate={appointmentDate}
          onDateChange={(date) => {
            dispatch(setAppointmentDate(date));
          }}
          daysToSpread={14} />
      </div>

      {/* Patient Queue Matrix */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-semibold text-slate-700">Live Active Queue</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                <th className="py-3 px-6">Token</th>
                <th className="py-3 px-6">Patient Info</th>
                <th className="py-3 px-6">Time / Type</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
              {appointments.map((appointment) => (
                <tr key={appointment.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-4 px-6 font-bold text-slate-700">#{appointment.tokenNumber}</td>
                  <td className="py-4 px-6">
                    <div className="font-medium text-slate-800">{appointment.patient.name}</div>
                    <div className="text-xs text-slate-400">{appointment.patient.gender}, {appointment.patient.age} Yrs</div>
                  </td>
                  <td className="py-4 px-6">{appointment.appointmentTime}</td>
                  <td className="py-4 px-6">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${getStatusColor(appointment.status)}`}>
                      {appointment.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={()=>{navigate(`/patients/${appointment.patient.id}/opd`)}}
                      className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-4 py-1.5 rounded-lg text-xs font-medium border border-indigo-100"
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
      <CheckInModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};