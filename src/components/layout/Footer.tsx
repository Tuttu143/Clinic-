import React, { useState } from 'react';
import { Phone, MessageSquare, MapPin, Clock, ShieldCheck, Mail } from 'lucide-react';
import { ClinicSettings } from '../../types/clinic';

interface FooterProps {
  clinicSettings: ClinicSettings;
  onOpenBookingModal: () => void;
  onSelectTab: (tab: any) => void;
}

export const Footer: React.FC<FooterProps> = ({ clinicSettings, onOpenBookingModal, onSelectTab }) => {
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  return (
    <footer className="bg-slate-900 text-slate-300 pt-14 pb-20 md:pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          {/* Col 1: Brand & Clinical Quality */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center text-slate-950 font-bold">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 2v20M2 12h20" />
                </svg>
              </div>
              <span className="text-xl font-bold text-white tracking-tight">CarePulse Clinic</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {clinicSettings.tagline}. Multi-speciality medical consultations, pathology testing, and patient-first care backed by certified specialists.
            </p>
            <div className="pt-2 flex flex-col gap-2">
              <a
                href={`tel:${clinicSettings.phone.replace(/\s+/g, '')}`}
                className="flex items-center gap-2 text-xs text-slate-200 hover:text-teal-300 transition"
              >
                <Phone className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span>Call Desk: {clinicSettings.phone}</span>
              </a>
              <a
                href={`https://wa.me/${clinicSettings.whatsappNumber.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs text-slate-200 hover:text-teal-300 transition"
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Official WhatsApp: {clinicSettings.whatsappNumber}</span>
              </a>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Mail className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span>{clinicSettings.email}</span>
              </div>
            </div>
          </div>

          {/* Col 2: Specialities & Clinical Services */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wide uppercase mb-4">Medical Specialities</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button onClick={() => onSelectTab('services')} className="hover:text-teal-300 transition cursor-pointer">
                  Cardiology & 2D Echo Heart Care
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab('services')} className="hover:text-teal-300 transition cursor-pointer">
                  Dermatology, Acne & Hair Clinic
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab('services')} className="hover:text-teal-300 transition cursor-pointer">
                  Orthopedics & Joint Rehabilitation
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab('services')} className="hover:text-teal-300 transition cursor-pointer">
                  Pediatrics & Scheduled Immunizations
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab('services')} className="hover:text-teal-300 transition cursor-pointer">
                  Internal Medicine & Diabetes Care
                </button>
              </li>
              <li>
                <button onClick={() => onSelectTab('services')} className="hover:text-teal-300 transition cursor-pointer">
                  Automated Pathology & Diagnostic Tests
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Consultation Timings & Location */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wide uppercase mb-4">Timings & Location</h4>
            <div className="space-y-3 text-xs text-slate-400">
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-slate-200 font-medium">{clinicSettings.weekdaysTimings}</p>
                  <p className="mt-0.5">{clinicSettings.sundayTimings}</p>
                </div>
              </div>
              <div className="flex items-start gap-2 pt-1">
                <MapPin className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-slate-200">{clinicSettings.address}</p>
                  <p>{clinicSettings.city}, {clinicSettings.pincode}</p>
                  <a
                    href={clinicSettings.googleMapsDirectionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-1 text-teal-400 hover:underline font-medium"
                  >
                    Open in Google Maps →
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Col 4: Quick Actions & PWA */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wide uppercase mb-4">Patient Services</h4>
            <div className="space-y-3">
              <p className="text-xs text-slate-400">
                Book a doctor consultation in under 60 seconds or track your digital appointment token.
              </p>
              <button
                onClick={onOpenBookingModal}
                className="w-full py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs transition cursor-pointer text-center block"
              >
                Book Doctor Appointment
              </button>
              <button
                onClick={() => onSelectTab('my-bookings')}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs transition cursor-pointer text-center block border border-slate-700"
              >
                View My Digital Appointment Pass
              </button>
            </div>
          </div>
        </div>

        {/* Bottom copyright and legal disclaimer */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} {clinicSettings.name}. All medical rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <button
              onClick={() => setShowPrivacyModal(true)}
              className="hover:text-slate-300 transition cursor-pointer underline underline-offset-4"
            >
              Healthcare Privacy Policy & Patient Consent
            </button>
            <span className="text-slate-700">·</span>
            <span>DISHA & Indian Healthcare Compliance</span>
            <span className="text-slate-700">·</span>
            <button
              onClick={() => onSelectTab('crm')}
              className="hover:text-slate-300 transition cursor-pointer"
            >
              Staff Portal
            </button>
          </div>
        </div>
      </div>

      {/* Healthcare Privacy Policy Modal */}
      {showPrivacyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl bg-white p-6 md:p-8 text-slate-900 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-teal-600" />
                <h3 className="text-lg font-bold">Patient Privacy Policy & Healthcare Consent</h3>
              </div>
              <button
                onClick={() => setShowPrivacyModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs md:text-sm text-slate-600 leading-relaxed">
              <p>
                <strong>1. Data Collection & Purpose:</strong> CarePulse Clinic collects necessary patient identification details (Name, Contact Number, Email, Age, Symptoms) exclusively for scheduling medical consultations, sending appointment confirmations, reminding patients of follow-ups, and managing digital prescriptions.
              </p>
              <p>
                <strong>2. WhatsApp Communication & Consent:</strong> In accordance with Meta WhatsApp Business Cloud API guidelines, patients explicitly opt in to receive appointment booking links, confirmation receipts, reminder notifications, and lab report ready alerts. You may opt out anytime by replying <code>STOP</code>.
              </p>
              <p>
                <strong>3. Medical Records Confidentiality:</strong> Clinical notes and consultation records are restricted to authorized medical personnel (attending doctor and authorized clinic staff). We do not transmit sensitive clinical diagnoses or medical histories across non-encrypted channels.
              </p>
              <p>
                <strong>4. Compliance with Indian Regulations:</strong> Our data storage and patient communication workflows adhere to the Information Technology (IT) Act, Digital Information Security in Healthcare Act (DISHA) guidelines, and Telemedicine Practice Guidelines issued by the Medical Council of India (MCI).
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setShowPrivacyModal(false)}
                className="px-5 py-2.5 rounded-xl bg-teal-600 text-white font-semibold text-xs hover:bg-teal-700 transition cursor-pointer min-h-[44px]"
              >
                Close Privacy Policy
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};
