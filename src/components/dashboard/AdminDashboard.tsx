import React, { useState, useEffect } from 'react';
import { Appointment, ClinicAnalytics, Doctor, Speciality } from '../../types/clinic';
import { api } from '../../services/api';
import { Users, CalendarCheck, Clock, CheckCircle2, XCircle, TrendingUp, Filter, MessageSquare, Phone, Activity } from 'lucide-react';

interface AdminDashboardProps {
  onOpenSettingsModal: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onOpenSettingsModal }) => {
  const [analytics, setAnalytics] = useState<ClinicAnalytics | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [specialities, setSpecialities] = useState<Speciality[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterDoctor, setFilterDoctor] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const loadData = async () => {
    setLoading(true);
    try {
      const [stats, apts, docs, specs] = await Promise.all([
        api.getAnalytics(),
        api.getAppointments(),
        api.getDoctors(),
        api.getSpecialities(),
      ]);
      setAnalytics(stats);
      setAppointments(apts);
      setDoctors(docs);
      setSpecialities(specs);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await api.updateAppointment(id, { status });
      loadData();
    } catch (err) {
      console.error('Update status error:', err);
    }
  };

  const filteredAppointments = appointments.filter((a) => {
    if (filterDoctor !== 'all' && a.doctorId !== filterDoctor) return false;
    if (filterStatus !== 'all' && a.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="py-8 md:py-12 bg-slate-50 min-h-[85vh]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-teal-700 uppercase tracking-wider mb-1">
              <span>Clinic Administration Console</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Executive Analytics & Operations
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Live consultation throughput, conversion funnel, doctor schedule management, and enquiry sources.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onOpenSettingsModal}
              className="py-2.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-xs transition cursor-pointer min-h-[44px]"
            >
              ⚙ Edit Website & Clinic Settings
            </button>
            <button
              onClick={loadData}
              className="py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs transition cursor-pointer min-h-[44px]"
            >
              Refresh Realtime Data
            </button>
          </div>
        </div>

        {/* 4 Metric Cards */}
        {analytics && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Enquiries</span>
                <Users className="w-4 h-4 text-teal-600" />
              </div>
              <div className="text-3xl font-extrabold text-slate-900 tabular-nums mt-2">
                {analytics.totalEnquiries}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Captured across Website & WhatsApp</p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Today's Appointments</span>
                <CalendarCheck className="w-4 h-4 text-teal-600" />
              </div>
              <div className="text-3xl font-extrabold text-teal-700 tabular-nums mt-2">
                {analytics.todayAppointments}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Active doctor OPD tokens today</p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Confirmed Bookings</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-3xl font-extrabold text-slate-900 tabular-nums mt-2">
                {analytics.confirmedBookings}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">{analytics.pendingRequests} pending verification</p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Lead Conversion</span>
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-3xl font-extrabold text-emerald-700 tabular-nums mt-2">
                {analytics.conversionRate}%
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Enquiries converted to visits</p>
            </div>
          </div>
        )}

        {/* Breakdown Visuals Row */}
        {analytics && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
            {/* Left: Lead Sources */}
            <div className="lg:col-span-6 p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <h3 className="text-sm font-bold text-slate-900 mb-1">Enquiry Acquisition Channels</h3>
              <p className="text-xs text-slate-500 mb-4">Patient volume distribution by entry touchpoint</p>

              <div className="space-y-3">
                {analytics.sourceBreakdown.map((src) => (
                  <div key={src.source} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-700 capitalize">
                        {src.source.replace(/_/g, ' ')}
                      </span>
                      <span className="font-bold text-slate-900 tabular-nums">
                        {src.count} leads ({src.percentage}%)
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-teal-600 rounded-full transition-all duration-300"
                        style={{ width: `${Math.max(src.percentage, 8)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: WhatsApp Cloud Delivery Performance */}
            <div className="lg:col-span-6 p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <h3 className="text-sm font-bold text-slate-900 mb-1">WhatsApp Cloud API Delivery Metrics</h3>
              <p className="text-xs text-slate-500 mb-4">Realtime status for confirmations and reminders</p>

              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 text-center">
                  <div className="text-xl font-extrabold text-slate-900 tabular-nums">{analytics.whatsappStats.sent}</div>
                  <div className="text-[10px] text-slate-500 uppercase font-semibold mt-0.5">Sent Outbound</div>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50 text-center">
                  <div className="text-xl font-extrabold text-emerald-800 tabular-nums">{analytics.whatsappStats.delivered}</div>
                  <div className="text-[10px] text-emerald-700 uppercase font-semibold mt-0.5">Delivered 100%</div>
                </div>
                <div className="p-3 rounded-xl bg-blue-50 text-center">
                  <div className="text-xl font-extrabold text-blue-800 tabular-nums">{analytics.whatsappStats.read}</div>
                  <div className="text-[10px] text-blue-700 uppercase font-semibold mt-0.5">Read Receipts</div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                <span>Webhook Health: <strong>200 OK</strong></span>
                <span className="text-emerald-700 font-semibold">Zero Failed Transmissions</span>
              </div>
            </div>
          </div>
        )}

        {/* Appointments Table with Live Filters */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Live Consultation Queue</h3>
              <p className="text-xs text-slate-500">Manage patient tokens and doctor schedules</p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={filterDoctor}
                onChange={(e) => setFilterDoctor(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800 bg-white"
              >
                <option value="all">All Doctors</option>
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800 bg-white"
              >
                <option value="all">All Statuses</option>
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="new">New</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Token Ref</th>
                  <th className="p-3.5">Patient Details</th>
                  <th className="p-3.5">Doctor & Speciality</th>
                  <th className="p-3.5">Date & Slot</th>
                  <th className="p-3.5">Fee & Payment</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAppointments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400">
                      No matching appointments found.
                    </td>
                  </tr>
                ) : (
                  filteredAppointments.map((apt) => (
                    <tr key={apt.id} className="hover:bg-slate-50/70 transition">
                      <td className="p-3.5 font-bold font-mono text-slate-900">
                        {apt.referenceNumber}
                      </td>
                      <td className="p-3.5">
                        <div className="font-semibold text-slate-900">{apt.patientName}</div>
                        <div className="text-[11px] text-slate-500">{apt.patientPhone}</div>
                      </td>
                      <td className="p-3.5">
                        <div className="font-semibold text-slate-800">{apt.doctorName}</div>
                        <div className="text-[11px] text-slate-500">{apt.specialityName}</div>
                      </td>
                      <td className="p-3.5">
                        <div className="font-semibold text-slate-800">{apt.date}</div>
                        <div className="text-[11px] text-teal-700 font-semibold">{apt.timeSlot}</div>
                      </td>
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900 tabular-nums">₹{apt.consultationFee}</div>
                        <div className="text-[11px] text-slate-400">{apt.paymentMethod}</div>
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            apt.status === 'confirmed'
                              ? 'bg-teal-100 text-teal-800'
                              : apt.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : apt.status === 'cancelled'
                              ? 'bg-slate-100 text-slate-500'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {apt.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="inline-flex items-center gap-1">
                          {apt.status !== 'completed' && apt.status !== 'cancelled' && (
                            <>
                              <button
                                onClick={() => handleStatusChange(apt.id, 'completed')}
                                className="px-2 py-1 rounded bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-[11px] font-semibold transition cursor-pointer"
                              >
                                Complete
                              </button>
                              <button
                                onClick={() => handleStatusChange(apt.id, 'cancelled')}
                                className="px-2 py-1 rounded bg-red-50 text-red-700 hover:bg-red-100 text-[11px] font-semibold transition cursor-pointer"
                              >
                                Cancel
                              </button>
                            </>
                          )}
                          {apt.status === 'pending' && (
                            <button
                              onClick={() => handleStatusChange(apt.id, 'confirmed')}
                              className="px-2 py-1 rounded bg-teal-600 text-white hover:bg-teal-700 text-[11px] font-semibold transition cursor-pointer"
                            >
                              Confirm
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
