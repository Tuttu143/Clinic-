import React, { useState, useEffect } from 'react';
import { Doctor, Speciality, Appointment } from '../../types/clinic';
import { api } from '../../services/api';
import { X, Calendar, Clock, User, Phone, CheckCircle2, AlertCircle, ArrowLeft, ArrowRight, ShieldCheck, MessageSquare } from 'lucide-react';

interface AppointmentBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  specialities: Speciality[];
  doctors: Doctor[];
  initialSpecialityId?: string;
  initialDoctorId?: string;
  onBookingSuccess: (appointment: Appointment) => void;
}

export const AppointmentBookingModal: React.FC<AppointmentBookingModalProps> = ({
  isOpen,
  onClose,
  specialities,
  doctors,
  initialSpecialityId,
  initialDoctorId,
  onBookingSuccess,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Form State
  const [selectedSpecialityId, setSelectedSpecialityId] = useState<string>(initialSpecialityId || 'spec-cardiology');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>(initialDoctorId || '');
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');

  // Slots Loading
  const [availableSlots, setAvailableSlots] = useState<{ id: string; time: string; isBooked: boolean }[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotReason, setSlotReason] = useState<string | null>(null);

  // Patient Info
  const [patientDetails, setPatientDetails] = useState({
    name: '',
    phone: '',
    email: '',
    age: '32',
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    type: 'First Visit' as 'First Visit' | 'Follow-up' | 'Routine Checkup' | 'Second Opinion',
    symptoms: '',
    paymentMethod: 'Clinic Pay' as 'Clinic Pay' | 'UPI' | 'Card',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [confirmedAppointment, setConfirmedAppointment] = useState<Appointment | null>(null);

  // Sync initial props
  useEffect(() => {
    if (initialSpecialityId) setSelectedSpecialityId(initialSpecialityId);
    if (initialDoctorId) setSelectedDoctorId(initialDoctorId);
  }, [initialSpecialityId, initialDoctorId]);

  // When speciality changes, auto-pick first doctor of that speciality if current doctor doesn't match
  useEffect(() => {
    const matchingDocs = doctors.filter((d) => d.specialityId === selectedSpecialityId);
    if (matchingDocs.length > 0) {
      if (!matchingDocs.some((d) => d.id === selectedDoctorId)) {
        setSelectedDoctorId(matchingDocs[0].id);
      }
    }
  }, [selectedSpecialityId, doctors, selectedDoctorId]);

  // Fetch slots whenever selected doctor or date changes
  useEffect(() => {
    if (!selectedDoctorId || !selectedDate) return;

    let isMounted = true;
    setSlotsLoading(true);
    setSlotReason(null);
    setSelectedTimeSlot('');

    api
      .getAvailableSlots(selectedDoctorId, selectedDate)
      .then((data) => {
        if (!isMounted) return;
        if (data.available) {
          setAvailableSlots(data.slots);
          setSlotReason(null);
        } else {
          setAvailableSlots([]);
          setSlotReason(data.reason || 'No consultation slots available on this date.');
        }
      })
      .catch((err) => {
        console.error('Slots error:', err);
        if (isMounted) {
          setAvailableSlots([]);
          setSlotReason('Failed to load consultation slots.');
        }
      })
      .finally(() => {
        if (isMounted) setSlotsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedDoctorId, selectedDate]);

  if (!isOpen) return null;

  const currentDoctor = doctors.find((d) => d.id === selectedDoctorId);
  const currentSpeciality = specialities.find((s) => s.id === selectedSpecialityId);

  // Date picker helper: today + next 6 days
  const upcomingDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      dateStr: d.toISOString().split('T')[0],
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNumber: d.getDate(),
      monthName: d.toLocaleDateString('en-US', { month: 'short' }),
    };
  });

  const handleBookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientDetails.name || !patientDetails.phone) {
      setErrorMsg('Please enter patient name and mobile number.');
      return;
    }
    if (!selectedTimeSlot) {
      setErrorMsg('Please select an available consultation slot.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const response = await api.bookAppointment({
        patientName: patientDetails.name,
        patientPhone: patientDetails.phone,
        patientEmail: patientDetails.email,
        patientAge: Number(patientDetails.age),
        patientGender: patientDetails.gender,
        specialityId: selectedSpecialityId,
        specialityName: currentSpeciality?.name || 'General Health',
        doctorId: selectedDoctorId,
        doctorName: currentDoctor?.name || 'Doctor',
        date: selectedDate,
        timeSlot: selectedTimeSlot,
        type: patientDetails.type,
        symptoms: patientDetails.symptoms,
        consultationFee: currentDoctor?.consultationFee || 600,
        paymentMethod: patientDetails.paymentMethod,
      });

      setConfirmedAppointment(response.appointment);
      onBookingSuccess(response.appointment);
      setStep(5); // Confirmation screen
    } catch (err: any) {
      setErrorMsg(err.message || 'Slot conflict or booking error. Please select another slot.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50/60">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {step === 5 ? 'Appointment Confirmed!' : 'Book Doctor Appointment'}
            </h3>
            {step < 5 && (
              <p className="text-xs text-slate-500">
                Step {step} of 4 — {step === 1 ? 'Select Speciality' : step === 2 ? 'Select Doctor' : step === 3 ? 'Choose Slot' : 'Patient Information'}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 max-h-[75vh] overflow-y-auto">
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* STEP 1: Select Speciality */}
          {step === 1 && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-900">Select Medical Speciality</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {specialities.map((spec) => (
                  <button
                    key={spec.id}
                    onClick={() => {
                      setSelectedSpecialityId(spec.id);
                      setStep(2);
                    }}
                    className={`p-3.5 rounded-xl border text-left transition cursor-pointer flex items-start justify-between min-h-[56px] ${
                      selectedSpecialityId === spec.id
                        ? 'border-teal-600 bg-teal-50/70'
                        : 'border-slate-200 hover:border-teal-300 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-900">{spec.name}</div>
                      <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{spec.shortDescription}</div>
                    </div>
                    <span className="text-xs font-bold text-teal-700 shrink-0 ml-2">₹{spec.startingPrice}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: Select Doctor */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900">
                  Select Specialist for {currentSpeciality?.name}
                </h4>
                <button
                  onClick={() => setStep(1)}
                  className="text-xs font-semibold text-teal-700 hover:underline cursor-pointer"
                >
                  Change Speciality
                </button>
              </div>

              <div className="space-y-3">
                {doctors
                  .filter((d) => d.specialityId === selectedSpecialityId)
                  .map((doc) => (
                    <div
                      key={doc.id}
                      onClick={() => setSelectedDoctorId(doc.id)}
                      className={`p-4 rounded-xl border transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        selectedDoctorId === doc.id
                          ? 'border-teal-600 bg-teal-50/70 shadow-xs'
                          : 'border-slate-200 hover:border-teal-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-11 h-11 rounded-xl ${doc.avatarColor} text-white font-bold text-sm flex items-center justify-center shrink-0`}>
                          {doc.avatarInitials}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900">{doc.name}</div>
                          <div className="text-xs text-slate-600">{doc.qualifications}</div>
                          <div className="text-[11px] text-slate-500 mt-1">
                            {doc.experienceYears}+ yrs exp · Room {doc.roomNumber}
                          </div>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                        <span className="text-xs font-bold text-slate-900 tabular-nums">₹{doc.consultationFee}</span>
                        <span className="text-[11px] text-teal-700 font-semibold">{doc.availableDays.join(', ')}</span>
                      </div>
                    </div>
                  ))}
              </div>

              <div className="flex justify-between pt-4 border-t border-slate-100">
                <button
                  onClick={() => setStep(1)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer min-h-[44px]"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!selectedDoctorId}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs transition cursor-pointer min-h-[44px]"
                >
                  <span>Select Date & Slot</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Available Dates & Time Slots */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Choose Consultation Time Slot</h4>
                  <p className="text-xs text-slate-500">{currentDoctor?.name} ({currentSpeciality?.name})</p>
                </div>
                <button
                  onClick={() => setStep(2)}
                  className="text-xs font-semibold text-teal-700 hover:underline cursor-pointer"
                >
                  Change Doctor
                </button>
              </div>

              {/* Date selection carousel */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">Select Date</label>
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                  {upcomingDates.map((item) => (
                    <button
                      key={item.dateStr}
                      onClick={() => setSelectedDate(item.dateStr)}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition cursor-pointer shrink-0 min-w-[70px] min-h-[56px] ${
                        selectedDate === item.dateStr
                          ? 'border-teal-600 bg-teal-700 text-white shadow-xs font-semibold'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-teal-300'
                      }`}
                    >
                      <span className="text-[10px] uppercase font-bold">{item.dayName}</span>
                      <span className="text-base font-extrabold tabular-nums">{item.dayNumber}</span>
                      <span className="text-[10px]">{item.monthName}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Slots Grid */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-slate-700">
                    Available Slots for {new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' })}
                  </label>
                  <span className="text-[11px] text-slate-400">Duration: 20 mins</span>
                </div>

                {slotsLoading ? (
                  <div className="py-8 text-center text-xs text-slate-500">
                    Checking doctor availability & reservation locks...
                  </div>
                ) : slotReason ? (
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 text-center">
                    {slotReason}
                  </div>
                ) : availableSlots.length === 0 ? (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 text-center">
                    All consultation slots are currently booked for this date. Please pick another date.
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot.id}
                        disabled={slot.isBooked}
                        onClick={() => setSelectedTimeSlot(slot.time)}
                        className={`py-2 px-2 rounded-lg text-xs font-semibold border transition cursor-pointer min-h-[44px] ${
                          slot.isBooked
                            ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed line-through'
                            : selectedTimeSlot === slot.time
                            ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
                            : 'bg-white text-slate-800 border-slate-200 hover:border-teal-400 hover:bg-teal-50/50'
                        }`}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-between pt-4 border-t border-slate-100">
                <button
                  onClick={() => setStep(2)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer min-h-[44px]"
                >
                  Back
                </button>
                <button
                  onClick={() => {
                    if (!selectedTimeSlot) {
                      setErrorMsg('Please choose an available time slot.');
                      return;
                    }
                    setErrorMsg(null);
                    setStep(4);
                  }}
                  disabled={!selectedTimeSlot}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs transition cursor-pointer min-h-[44px] disabled:opacity-50"
                >
                  <span>Patient Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Patient Details & Confirmation */}
          {step === 4 && (
            <form onSubmit={handleBookSubmit} className="space-y-4">
              <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-teal-900">{currentDoctor?.name}</span>
                  <span className="text-teal-700 block">{currentSpeciality?.name}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-teal-900">{selectedDate}</span>
                  <span className="text-teal-700 font-semibold block">{selectedTimeSlot}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Patient Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={patientDetails.name}
                  onChange={(e) => setPatientDetails({ ...patientDetails, name: e.target.value })}
                  placeholder="e.g. Ramesh Chandra"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mobile Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={patientDetails.phone}
                    onChange={(e) => setPatientDetails({ ...patientDetails, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-600 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Used for WhatsApp confirmation pass</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    value={patientDetails.email}
                    onChange={(e) => setPatientDetails({ ...patientDetails, email: e.target.value })}
                    placeholder="ramesh@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Age</label>
                  <input
                    type="number"
                    min="1"
                    max="110"
                    value={patientDetails.age}
                    onChange={(e) => setPatientDetails({ ...patientDetails, age: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
                  <select
                    value={patientDetails.gender}
                    onChange={(e) => setPatientDetails({ ...patientDetails, gender: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-600 focus:outline-none bg-white"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Visit Type</label>
                  <select
                    value={patientDetails.type}
                    onChange={(e) => setPatientDetails({ ...patientDetails, type: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-600 focus:outline-none bg-white"
                  >
                    <option value="First Visit">First Visit</option>
                    <option value="Follow-up">Follow-up</option>
                    <option value="Routine Checkup">Routine</option>
                    <option value="Second Opinion">Second Opinion</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reason for Visit / Key Symptoms
                </label>
                <textarea
                  rows={2}
                  value={patientDetails.symptoms}
                  onChange={(e) => setPatientDetails({ ...patientDetails, symptoms: e.target.value })}
                  placeholder="e.g. Experiencing knee pain since two weeks, need consultation..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Method</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Clinic Pay', 'UPI', 'Card'] as const).map((method) => (
                    <button
                      type="button"
                      key={method}
                      onClick={() => setPatientDetails({ ...patientDetails, paymentMethod: method })}
                      className={`py-2 px-3 rounded-lg text-xs font-semibold border cursor-pointer min-h-[44px] ${
                        patientDetails.paymentMethod === method
                          ? 'border-teal-600 bg-teal-50 text-teal-800'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {method === 'Clinic Pay' ? 'Pay at Desk' : method}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer min-h-[44px]"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs transition cursor-pointer min-h-[44px]"
                >
                  {isSubmitting ? 'Reserving Slot & Syncing WhatsApp...' : `Confirm Booking (₹${currentDoctor?.consultationFee || 600})`}
                </button>
              </div>
            </form>
          )}

          {/* STEP 5: Success & Digital Appointment Pass */}
          {step === 5 && confirmedAppointment && (
            <div className="space-y-5 text-center">
              <div className="w-14 h-14 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <span className="text-xs font-semibold text-teal-700 uppercase tracking-wider block">Token Generated</span>
                <h3 className="text-xl font-extrabold text-slate-900 mt-1">
                  Appointment Confirmed!
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Your reference ID is <strong className="text-slate-900 font-bold">{confirmedAppointment.referenceNumber}</strong>
                </p>
              </div>

              {/* Digital Pass Card */}
              <div className="rounded-2xl border-2 border-teal-600/30 bg-teal-50/40 p-5 text-left space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-teal-200/60">
                  <div>
                    <span className="text-[10px] text-teal-700 font-bold uppercase tracking-wider">Doctor</span>
                    <p className="text-sm font-bold text-slate-900">{confirmedAppointment.doctorName}</p>
                    <p className="text-xs text-slate-600">{confirmedAppointment.specialityName}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-teal-700 font-bold uppercase tracking-wider">Time Slot</span>
                    <p className="text-sm font-bold text-teal-800">{confirmedAppointment.timeSlot}</p>
                    <p className="text-xs text-slate-600">{confirmedAppointment.date}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Patient</span>
                    <span className="font-semibold text-slate-800">{confirmedAppointment.patientName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Fee Status</span>
                    <span className="font-semibold text-slate-800">
                      ₹{confirmedAppointment.consultationFee} ({confirmedAppointment.paymentMethod})
                    </span>
                  </div>
                </div>

                <div className="pt-2 text-xs text-slate-600 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Confirmation sent to <strong>{confirmedAppointment.patientPhone}</strong> via WhatsApp!</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 px-4 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs transition cursor-pointer min-h-[44px]"
                >
                  View in My Passes
                </button>
                <a
                  href={`https://wa.me/${confirmedAppointment.patientPhone.replace(/\D/g, '')}?text=Hi,%20your%20CarePulse%20Appointment%20Ref%20is%20${confirmedAppointment.referenceNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 flex-1 py-3 px-4 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-900 font-semibold text-xs hover:bg-emerald-100 transition cursor-pointer min-h-[44px]"
                >
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                  <span>Open in WhatsApp</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
