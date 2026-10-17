import React, { useState } from 'react';
import { ClinicSettings } from '../../types/clinic';
import { Clock, MapPin, Phone, MessageSquare, Send, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';

interface TimingsAndLocationProps {
  clinicSettings: ClinicSettings;
}

export const TimingsAndLocation: React.FC<TimingsAndLocationProps> = ({ clinicSettings }) => {
  const [formData, setFormData] = useState({
    patientName: '',
    phone: '',
    email: '',
    specialityId: 'spec-medicine',
    note: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.patientName || !formData.phone) return;

    setIsSubmitting(true);
    try {
      await api.createLead({
        patientName: formData.patientName,
        phone: formData.phone,
        email: formData.email,
        source: 'website_form',
        specialityId: formData.specialityId,
        note: formData.note,
      });
      setSubmitted(true);
      setFormData({
        patientName: '',
        phone: '',
        email: '',
        specialityId: 'spec-medicine',
        note: '',
      });
    } catch (err) {
      console.error('Failed to submit contact enquiry:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="timings-location" className="py-14 md:py-20 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Clinic Timings & Location Details */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-teal-700 uppercase tracking-wider mb-2">
                <span>Location & Operational Hours</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight" style={{ textWrap: 'balance' }}>
                Centrally Located in Indiranagar, Bengaluru
              </h2>
              <p className="text-sm text-slate-600 mt-2">
                Easy road accessibility with valet parking, wheelchair ramps, and an in-house ambulance service.
              </p>
            </div>

            {/* Timings card */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Consultation & OPD Schedule</h4>
                  <p className="text-xs text-slate-600 mt-1">{clinicSettings.weekdaysTimings}</p>
                  <p className="text-xs text-slate-600 mt-0.5">{clinicSettings.sundayTimings}</p>
                  <p className="text-[11px] text-teal-700 font-semibold mt-2">
                    {clinicSettings.consultationNotice}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Physical Clinic Address</h4>
                  <p className="text-xs text-slate-600 mt-1">{clinicSettings.address}</p>
                  <p className="text-xs text-slate-500">{clinicSettings.locality}, {clinicSettings.city} - {clinicSettings.pincode}</p>
                  <a
                    href={clinicSettings.googleMapsDirectionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 mt-2 text-xs font-semibold text-teal-700 hover:text-teal-800"
                  >
                    <span>Get Directions on Google Maps</span>
                    <span>→</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Google Maps Visual Interactive Container */}
            <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-2xs">
              <div className="p-3 bg-slate-100 border-b border-slate-200 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">Google Maps Navigation Preview</span>
                <a
                  href={clinicSettings.googleMapsDirectionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-teal-700 font-semibold hover:underline"
                >
                  View Full Map ↗
                </a>
              </div>
              <div className="h-56 bg-slate-200 relative flex items-center justify-center text-center p-6">
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-full bg-teal-600 text-white flex items-center justify-center mx-auto shadow-md">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <h5 className="font-bold text-slate-900 text-sm">{clinicSettings.name}</h5>
                  <p className="text-xs text-slate-600 max-w-sm">{clinicSettings.address}</p>
                  <a
                    href={clinicSettings.googleMapsDirectionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-1 px-4 py-1.5 rounded-lg bg-teal-700 text-white font-semibold text-xs hover:bg-teal-800 transition"
                  >
                    Open Live Navigation
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Contact & Enquiry Form (Captures CRM Lead) */}
          <div className="lg:col-span-6">
            <div className="p-6 md:p-8 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <h3 className="text-lg font-bold text-slate-900 mb-1">Send a Patient Enquiry</h3>
              <p className="text-xs text-slate-500 mb-6">
                Have questions about treatments, tests, or doctor schedules? Our front desk receptionist responds within 15 minutes.
              </p>

              {submitted ? (
                <div className="p-6 rounded-xl bg-teal-50 border border-teal-200 text-center space-y-3">
                  <CheckCircle2 className="w-10 h-10 text-teal-600 mx-auto" />
                  <h4 className="font-bold text-slate-900 text-base">Enquiry Sent to Reception Desk!</h4>
                  <p className="text-xs text-slate-600 max-w-sm mx-auto">
                    A lead ticket has been created in our clinic CRM. Our duty receptionist will call or send you a WhatsApp confirmation shortly.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-2 text-xs font-semibold text-teal-800 hover:underline cursor-pointer"
                  >
                    Send another query
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Patient Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.patientName}
                      onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                      placeholder="e.g. Sneha Reddy"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-teal-600"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Mobile Phone Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+91 98765 43210"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-teal-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Email Address (Optional)
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="sneha@example.com"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-teal-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Requested Speciality or Health Query
                    </label>
                    <select
                      value={formData.specialityId}
                      onChange={(e) => setFormData({ ...formData, specialityId: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white"
                    >
                      <option value="spec-cardiology">Cardiology & Heart Health</option>
                      <option value="spec-dermatology">Dermatology & Skin Care</option>
                      <option value="spec-orthopedics">Orthopedics & Joint Care</option>
                      <option value="spec-pediatrics">Pediatrics & Child Health</option>
                      <option value="spec-medicine">Internal & General Medicine</option>
                      <option value="spec-diagnostics">Diagnostic Pathology & Blood Tests</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Message / Symptoms Details
                    </label>
                    <textarea
                      rows={3}
                      value={formData.note}
                      onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                      placeholder="Describe your health query, preferred appointment timing, or test requirement..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-teal-600"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs transition cursor-pointer min-h-[44px]"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSubmitting ? 'Sending to Reception...' : 'Submit Patient Enquiry'}</span>
                  </button>

                  <p className="text-[11px] text-slate-400 text-center">
                    Your contact information is protected under clinical confidentiality standards.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
