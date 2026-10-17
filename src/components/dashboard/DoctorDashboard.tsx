import React, { useState, useEffect } from 'react';
import { Doctor, Appointment } from '../../types/clinic';
import { api } from '../../services/api';
import { Stethoscope, CheckCircle2, XCircle, Clock, Calendar, FileText, ChevronRight, User, AlertCircle, Save } from 'lucide-react';

export const DoctorDashboard: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('doc-sharma');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [scheduleNotice, setScheduleNotice] = useState<string | null>(null);

  // Doctor schedule edit
  const [shiftStart, setShiftStart] = useState('09:00');
  const [shiftEnd, setShiftEnd] = useState('14:00');
  const [selectedDays, setSelectedDays] = useState<string[]>(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);

  const loadDoctorData = async () => {
    setLoading(true);
    try {
      const [docs, apts] = await Promise.all([
        api.getDoctors(),
        api.getAppointments({ doctorId: selectedDoctorId }),
      ]);
      setDoctors(docs);
      setAppointments(apts);

      const current = docs.find((d) => d.id === selectedDoctorId);
      if (current) {
        setShiftStart(current.shiftStart);
        setShiftEnd(current.shiftEnd);
        setSelectedDays(current.availableDays);
      }
    } catch (err) {
      console.error('Failed to load doctor dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDoctorData();
  }, [selectedDoctorId]);

  const currentDoctor = doctors.find((d) => d.id === selectedDoctorId);

  const handleUpdateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.updateDoctorSchedule(selectedDoctorId, {
        shiftStart,
        shiftEnd,
        availableDays: selectedDays,
      });
      setScheduleNotice('Consultation hours updated successfully! Available slots refreshed.');
      setTimeout(() => setScheduleNotice(null), 4000);
      loadDoctorData();
    } catch (err) {
      console.error('Failed to update schedule:', err);
    }
  };

  const handleSaveNotes = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppointment) return;

    setSavingNotes(true);
    try {
      await api.updateAppointment(selectedAppointment.id, {
        clinicalNotes,
        followUpDate,
        status: 'completed',
      });
      setSelectedAppointment(null);
      loadDoctorData();
    } catch (err) {
      console.error('Failed to save clinical notes:', err);
    } finally {
      setSavingNotes(false);
    }
  };

  const handleMarkStatus = async (id: string, status: string) => {
    try {
      await api.updateAppointment(id, { status });
      loadDoctorData();
    } catch (err) {
      console.error('Status error:', err);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const todayQueue = appointments.filter((a) => a.date === todayStr);

  return (
    <div className="py-8 md:py-12 bg-slate-50 min-h-[85vh]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Doctor Header & Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-teal-700 uppercase tracking-wider mb-1">
              <span>Doctor OPD Station & Clinical Records</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {currentDoctor ? `${currentDoctor.name} (${currentDoctor.specialityName})` : 'Doctor Dashboard'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Room {currentDoctor?.roomNumber} · {currentDoctor?.qualifications}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <label className="text-xs font-semibold text-slate-600">Switch Doctor:</label>
            <select
              value={selectedDoctorId}
              onChange={(e) => setSelectedDoctorId(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 bg-white shadow-2xs"
            >
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} — {d.specialityName.split('&')[0]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 2-Column Doctor Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Today's Consultation Queue */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Today's Patient Queue</h3>
                <p className="text-xs text-slate-500">{todayQueue.length} patient consultations scheduled</p>
              </div>
              <button
                onClick={loadDoctorData}
                className="text-xs text-teal-700 font-semibold hover:underline cursor-pointer"
              >
                Refresh Queue
              </button>
            </div>

            {loading ? (
              <div className="p-8 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
                Loading schedule...
              </div>
            ) : appointments.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
                No appointments assigned for this doctor.
              </div>
            ) : (
              appointments.map((apt) => (
                <div
                  key={apt.id}
                  className={`p-4 rounded-xl border bg-white shadow-2xs transition ${
                    selectedAppointment?.id === apt.id ? 'border-teal-600 ring-1 ring-teal-600' : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-slate-900">{apt.referenceNumber}</span>
                      <span className="text-xs font-bold text-teal-700">{apt.timeSlot}</span>
                      <span className="text-xs text-slate-400">({apt.date})</span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        apt.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : apt.status === 'cancelled'
                          ? 'bg-slate-100 text-slate-500'
                          : 'bg-teal-100 text-teal-800'
                      }`}
                    >
                      {apt.status}
                    </span>
                  </div>

                  <div className="py-2.5 text-xs text-slate-600 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900">
                        {apt.patientName} (Age: {apt.patientAge}, {apt.patientGender})
                      </span>
                      <span className="text-slate-400">{apt.type}</span>
                    </div>
                    {apt.symptoms && (
                      <p className="text-slate-600 italic">
                        <strong className="not-italic text-slate-700">Patient Chief Complaint:</strong> {apt.symptoms}
                      </p>
                    )}
                    {apt.clinicalNotes && (
                      <p className="text-teal-900 font-medium bg-teal-50/80 p-2 rounded-lg mt-1 border border-teal-100">
                        <strong>Prescription/Notes:</strong> {apt.clinicalNotes}
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => {
                        setSelectedAppointment(apt);
                        setClinicalNotes(apt.clinicalNotes || '');
                        setFollowUpDate(apt.followUpDate || '');
                      }}
                      className="text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1 cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>{apt.clinicalNotes ? 'Edit Clinical Notes' : '+ Add Clinical Notes'}</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      {apt.status !== 'completed' && (
                        <button
                          onClick={() => handleMarkStatus(apt.id, 'completed')}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold cursor-pointer"
                        >
                          Mark Completed
                        </button>
                      )}
                      {apt.status !== 'cancelled' && apt.status !== 'completed' && (
                        <button
                          onClick={() => handleMarkStatus(apt.id, 'no-show')}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11px] font-semibold cursor-pointer"
                        >
                          No Show
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Right Column: Clinical Notes Drawer & Doctor Schedule Manager */}
          <div className="lg:col-span-5 space-y-6">
            {/* Clinical Notes Entry Box */}
            {selectedAppointment ? (
              <div className="p-5 rounded-2xl bg-white border border-teal-300 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h4 className="text-sm font-bold text-slate-900">
                    Clinical Note: {selectedAppointment.patientName} ({selectedAppointment.referenceNumber})
                  </h4>
                  <button
                    onClick={() => setSelectedAppointment(null)}
                    className="text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleSaveNotes} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Diagnosis, Prescribed Medication & Advice
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={clinicalNotes}
                      onChange={(e) => setClinicalNotes(e.target.value)}
                      placeholder="e.g. Advised Telmisartan 40mg once daily. Blood pressure stable at 124/82. Review in 2 weeks with fasting lipid panel."
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Advised Next Follow-up Date (Optional)
                    </label>
                    <input
                      type="date"
                      value={followUpDate}
                      onChange={(e) => setFollowUpDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-600 focus:outline-none"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedAppointment(null)}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-500 cursor-pointer min-h-[36px]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={savingNotes}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs transition cursor-pointer min-h-[36px]"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{savingNotes ? 'Saving...' : 'Save & Complete Consultation'}</span>
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-white border border-slate-200 text-center text-xs text-slate-400">
                Select any patient from the queue to prescribe medication and add clinical notes.
              </div>
            )}

            {/* Doctor's Consultation Hours Control */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h4 className="text-sm font-bold text-slate-900">OPD Consultation Shift Hours</h4>
                <Clock className="w-4 h-4 text-teal-600" />
              </div>

              {scheduleNotice && (
                <div className="p-2.5 rounded-xl bg-teal-50 border border-teal-200 text-xs text-teal-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>{scheduleNotice}</span>
                </div>
              )}

              <form onSubmit={handleUpdateSchedule} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Shift Start</label>
                    <input
                      type="time"
                      value={shiftStart}
                      onChange={(e) => setShiftStart(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Shift End</label>
                    <input
                      type="time"
                      value={shiftEnd}
                      onChange={(e) => setShiftEnd(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Available OPD Days
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => {
                      const isSelected = selectedDays.includes(day);
                      return (
                        <button
                          type="button"
                          key={day}
                          onClick={() => {
                            if (isSelected) {
                              setSelectedDays(selectedDays.filter((d) => d !== day));
                            } else {
                              setSelectedDays([...selectedDays, day]);
                            }
                          }}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold border cursor-pointer ${
                            isSelected
                              ? 'bg-teal-700 text-white border-teal-700'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition cursor-pointer min-h-[40px]"
                >
                  Save Schedule Changes
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
