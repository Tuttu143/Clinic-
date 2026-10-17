import React, { useState } from 'react';
import { Appointment } from '../../types/clinic';
import { api } from '../../services/api';
import { CalendarCheck, Clock, MapPin, MessageSquare, AlertCircle, RefreshCw, XCircle, CheckCircle2, ChevronRight, User } from 'lucide-react';

interface MyBookingsViewProps {
  appointments: Appointment[];
  onOpenBookingModal: () => void;
  onRefresh: () => void;
}

export const MyBookingsView: React.FC<MyBookingsViewProps> = ({
  appointments,
  onOpenBookingModal,
  onRefresh,
}) => {
  const [phoneSearch, setPhoneSearch] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [newDate, setNewDate] = useState('');
  const [newSlot, setNewSlot] = useState('11:00 AM');
  const [isUpdating, setIsUpdating] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const filteredAppointments = phoneSearch
    ? appointments.filter((a) => a.patientPhone.includes(phoneSearch) || a.referenceNumber.toLowerCase().includes(phoneSearch.toLowerCase()))
    : appointments;

  const handleCancelAppointment = async (apt: Appointment) => {
    if (!confirm(`Are you sure you want to cancel appointment ${apt.referenceNumber}?`)) return;
    setIsUpdating(true);
    try {
      await api.updateAppointment(apt.id, { status: 'cancelled' });
      setActionSuccess(`Appointment ${apt.referenceNumber} has been cancelled.`);
      onRefresh();
      setSelectedAppointment(null);
    } catch (err) {
      console.error('Cancel error:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRescheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppointment || !newDate || !newSlot) return;

    setIsUpdating(true);
    try {
      await api.updateAppointment(selectedAppointment.id, {
        date: newDate,
        timeSlot: newSlot,
        status: 'confirmed',
      });
      setActionSuccess(`Appointment ${selectedAppointment.referenceNumber} rescheduled to ${newDate} at ${newSlot}.`);
      setRescheduleModalOpen(false);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to reschedule.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="py-8 md:py-14 bg-slate-50 min-h-[80vh]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-teal-700 uppercase tracking-wider mb-1">
              <span>Patient Health Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              My Appointments & Digital Passes
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              View your consultation passes, token queue, doctor prescriptions, and reschedule or cancel appointments.
            </p>
          </div>

          <button
            onClick={onOpenBookingModal}
            className="self-start sm:self-auto py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs transition cursor-pointer shadow-xs min-h-[44px]"
          >
            + Book New Appointment
          </button>
        </div>

        {/* Action toast */}
        {actionSuccess && (
          <div className="mb-6 p-3 rounded-xl bg-teal-50 border border-teal-200 text-xs text-teal-800 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-600" />
              <span>{actionSuccess}</span>
            </span>
            <button onClick={() => setActionSuccess(null)} className="text-teal-900 font-bold p-1 cursor-pointer">✕</button>
          </div>
        )}

        {/* Filter / Search by Phone or Token Ref */}
        <div className="mb-6 p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col sm:flex-row gap-3 items-center">
          <div className="flex-1 w-full">
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Lookup by Patient Mobile or Token ID (e.g. CP-2026-XXXX)
            </label>
            <input
              type="text"
              value={phoneSearch}
              onChange={(e) => setPhoneSearch(e.target.value)}
              placeholder="Filter by phone number or appointment ref..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-600 focus:outline-none"
            />
          </div>
          {phoneSearch && (
            <button
              onClick={() => setPhoneSearch('')}
              className="text-xs text-slate-500 hover:text-slate-800 self-end sm:self-center cursor-pointer"
            >
              Clear Filter
            </button>
          )}
        </div>

        {/* Appointment List */}
        {filteredAppointments.length === 0 ? (
          <div className="p-10 rounded-2xl bg-white border border-slate-200 text-center space-y-3">
            <CalendarCheck className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-900">No Appointments Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              There are no consultation passes matching your search. Book an appointment in 60 seconds with instant WhatsApp verification.
            </p>
            <button
              onClick={onOpenBookingModal}
              className="mt-2 py-2.5 px-5 rounded-xl bg-teal-600 text-white font-semibold text-xs hover:bg-teal-700 transition cursor-pointer"
            >
              Book Doctor Appointment
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAppointments.map((apt) => {
              const isCancelled = apt.status === 'cancelled';
              const isCompleted = apt.status === 'completed';

              return (
                <div
                  key={apt.id}
                  className={`rounded-2xl border p-5 transition bg-white shadow-2xs ${
                    isCancelled
                      ? 'border-slate-200 opacity-60'
                      : isCompleted
                      ? 'border-slate-200'
                      : 'border-teal-200 hover:border-teal-400'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-xs shrink-0">
                        OPD
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-extrabold text-slate-900">{apt.referenceNumber}</span>
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
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
                        </div>
                        <p className="text-xs text-slate-500">{apt.specialityName}</p>
                      </div>
                    </div>

                    <div className="text-left sm:text-right">
                      <div className="text-xs font-bold text-slate-900">{apt.date}</div>
                      <div className="text-xs font-semibold text-teal-700">{apt.timeSlot}</div>
                    </div>
                  </div>

                  {/* Doctor & Patient Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 text-xs text-slate-600">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Attending Doctor</span>
                      <span className="font-bold text-slate-900">{apt.doctorName}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Patient Name & Phone</span>
                      <span className="font-medium text-slate-800">
                        {apt.patientName} ({apt.patientPhone})
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Consultation Fee</span>
                      <span className="font-medium text-slate-800">
                        ₹{apt.consultationFee} · {apt.paymentMethod}
                      </span>
                    </div>
                  </div>

                  {/* Symptoms & Clinical Notes */}
                  {apt.symptoms && (
                    <div className="mt-3 p-2.5 rounded-xl bg-slate-50 text-xs text-slate-600 border border-slate-100">
                      <strong className="text-slate-800">Reason for visit:</strong> {apt.symptoms}
                    </div>
                  )}

                  {apt.clinicalNotes && (
                    <div className="mt-2 p-2.5 rounded-xl bg-teal-50 text-xs text-teal-900 border border-teal-200">
                      <strong>Doctor's Clinical Notes:</strong> {apt.clinicalNotes}
                    </div>
                  )}

                  {/* Actions Bar */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                      <span>WhatsApp Confirmation Synced</span>
                    </div>

                    {!isCancelled && !isCompleted && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedAppointment(apt);
                            setNewDate(apt.date);
                            setNewSlot(apt.timeSlot);
                            setRescheduleModalOpen(true);
                          }}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer min-h-[36px]"
                        >
                          Reschedule
                        </button>
                        <button
                          onClick={() => handleCancelAppointment(apt)}
                          className="px-3 py-1.5 rounded-lg border border-red-200 text-xs font-semibold text-red-600 hover:bg-red-50 transition cursor-pointer min-h-[36px]"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Reschedule Modal */}
      {rescheduleModalOpen && selectedAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Reschedule {selectedAppointment.referenceNumber}
              </h3>
              <button
                onClick={() => setRescheduleModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRescheduleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">New Date</label>
                <input
                  type="date"
                  required
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">New Time Slot</label>
                <select
                  value={newSlot}
                  onChange={(e) => setNewSlot(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-600 focus:outline-none bg-white"
                >
                  <option value="09:00 AM">09:00 AM</option>
                  <option value="09:30 AM">09:30 AM</option>
                  <option value="10:00 AM">10:00 AM</option>
                  <option value="10:30 AM">10:30 AM</option>
                  <option value="11:00 AM">11:00 AM</option>
                  <option value="11:30 AM">11:30 AM</option>
                  <option value="12:00 PM">12:00 PM</option>
                  <option value="02:00 PM">02:00 PM</option>
                  <option value="02:30 PM">02:30 PM</option>
                  <option value="03:00 PM">03:00 PM</option>
                  <option value="03:30 PM">03:30 PM</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRescheduleModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 cursor-pointer min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs transition cursor-pointer min-h-[44px]"
                >
                  {isUpdating ? 'Rescheduling...' : 'Confirm New Slot'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
