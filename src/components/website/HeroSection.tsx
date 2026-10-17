import React from 'react';
import { CalendarPlus, MessageSquare, Phone, Clock, ShieldCheck, Star, Award, CheckCircle2 } from 'lucide-react';
import { ClinicSettings } from '../../types/clinic';

interface HeroSectionProps {
  clinicSettings: ClinicSettings;
  onOpenBookingModal: () => void;
  onSelectTab: (tab: any) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  clinicSettings,
  onOpenBookingModal,
  onSelectTab,
}) => {
  return (
    <section className="relative overflow-hidden bg-white border-b border-slate-200 pt-8 pb-14 md:pt-14 md:pb-20">
      {/* Subtle medical grid background accent */}
      <div className="absolute inset-0 bg-[radial-gradient(#0d9488_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
        {/* Top Kicker - clean unboxed metadata with typographic separators */}
        <div className="flex items-center gap-2 text-xs font-semibold text-teal-800 mb-3">
          <span>NABH Accreditated Standards</span>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span>Indiranagar, Bengaluru</span>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span>Zero Long Wait Times</span>
        </div>

        {/* 2-Column Hero Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Hero Column */}
          <div className="lg:col-span-7 space-y-6">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15]" style={{ textWrap: 'balance' }}>
              Compassionate Healthcare, Senior Specialists & Instant Online Booking
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
              Experience seamless clinical care at <strong className="text-slate-900 font-semibold">{clinicSettings.name}</strong>. Consult top physicians across Cardiology, Dermatology, Orthopedics, and Pediatrics with digital tokens, WhatsApp reminders, and in-house diagnostic lab tests.
            </p>

            {/* Trust points list */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Verified Specialist Doctors (10+ yrs exp)</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Guaranteed Time Slots, No Double Bookings</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Instant WhatsApp Confirmations & Passes</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Automated NABL Pathology Lab On-Site</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onOpenBookingModal}
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm shadow-md shadow-teal-600/20 active:scale-98 transition cursor-pointer min-h-[48px]"
              >
                <CalendarPlus className="w-4 h-4" />
                <span>Book In-Clinic Appointment</span>
              </button>

              <a
                href={`https://wa.me/${clinicSettings.whatsappNumber.replace(/\D/g, '')}?text=Hi%20CarePulse,%20I%20would%20like%20to%20book%20a%20doctor%20appointment.`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl border border-emerald-300 bg-emerald-50/70 hover:bg-emerald-100/80 text-emerald-900 font-semibold text-sm transition cursor-pointer min-h-[48px]"
              >
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <span>Book via WhatsApp</span>
              </a>

              <a
                href={`tel:${clinicSettings.phone.replace(/\s+/g, '')}`}
                className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm transition cursor-pointer min-h-[48px]"
              >
                <Phone className="w-4 h-4 text-slate-500" />
                <span>Call Clinic</span>
              </a>
            </div>

            {/* Patient review trust proof */}
            <div className="flex items-center gap-3 pt-3 text-xs text-slate-500">
              <div className="flex items-center text-amber-500">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              </div>
              <span><strong>4.9 / 5.0</strong> based on 1,840+ verified patient visits in Bengaluru</span>
            </div>
          </div>

          {/* Right Hero Column: Medical Hero Showcase Card */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-6 shadow-sm relative overflow-hidden">
              {/* Card Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-200/80">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Today's OPD Availability</h3>
                  <p className="text-xs text-slate-500">Active Consultations & Token Queue</p>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-md">
                  <span>Open Now</span>
                </div>
              </div>

              {/* Doctors on Duty Today */}
              <div className="mt-4 space-y-3">
                <div className="p-3 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between shadow-2xs">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-teal-600 text-white font-bold text-xs flex items-center justify-center">
                      RS
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">Dr. Rajesh Sharma</p>
                      <p className="text-[11px] text-slate-500">Cardiology · 18 yrs exp</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-teal-700">4 Slots Open</p>
                    <p className="text-[10px] text-slate-400">₹800 fee</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between shadow-2xs">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                      PP
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">Dr. Priya Patel</p>
                      <p className="text-[11px] text-slate-500">Dermatology · 12 yrs exp</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-teal-700">3 Slots Open</p>
                    <p className="text-[10px] text-slate-400">₹700 fee</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between shadow-2xs">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-sky-600 text-white font-bold text-xs flex items-center justify-center">
                      AV
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">Dr. Amit Verma</p>
                      <p className="text-[11px] text-slate-500">Orthopedics · 15 yrs exp</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-teal-700">2 Slots Open</p>
                    <p className="text-[10px] text-slate-400">₹750 fee</p>
                  </div>
                </div>
              </div>

              {/* Quick interactive appointment check */}
              <div className="mt-5 pt-4 border-t border-slate-200/80">
                <button
                  onClick={onOpenBookingModal}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition cursor-pointer text-center block min-h-[44px]"
                >
                  Select Time Slot & Reserve Token →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 4-Column KPI / Trust Strip below Hero Split */}
        <div className="mt-12 pt-8 border-t border-slate-200 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">15,000+</div>
            <p className="text-xs text-slate-500 mt-1">Patients Treated Annually</p>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-teal-700 tabular-nums">&lt; 12 mins</div>
            <p className="text-xs text-slate-500 mt-1">Average Wait Time with Token</p>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">100%</div>
            <p className="text-xs text-slate-500 mt-1">NABL Diagnostic Accuracy</p>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-teal-700 tabular-nums">4 Hours</div>
            <p className="text-xs text-slate-500 mt-1">WhatsApp Lab Report Delivery</p>
          </div>
        </div>
      </div>
    </section>
  );
};
