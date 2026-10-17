import React, { useState } from 'react';
import { UserRole } from '../../types/clinic';
import { PWAInstallButton } from '../pwa/PWAInstallButton';
import { ChevronDown, CalendarPlus, UserCheck, Shield, Phone, MessageSquare } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  onSelectTab: (tab: any) => void;
  onOpenBookingModal: () => void;
  onOpenSettingsModal: () => void;
  currentRole: UserRole;
  onChangeRole: (role: UserRole) => void;
  clinicName: string;
  clinicPhone: string;
  whatsappNumber: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  onOpenBookingModal,
  onOpenSettingsModal,
  currentRole,
  onChangeRole,
  clinicName,
  clinicPhone,
  whatsappNumber,
}) => {
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  const rolesList: { role: UserRole; label: string; desc: string }[] = [
    { role: 'patient', label: 'Patient View', desc: 'Browse clinic & book appointments' },
    { role: 'receptionist', label: 'Receptionist Desk', desc: 'Manage walk-ins, calls & leads' },
    { role: 'doctor', label: 'Doctor OPD View', desc: 'Consultation queue & clinical notes' },
    { role: 'admin', label: 'Clinic Admin', desc: 'Analytics, team & website settings' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Top emergency & WhatsApp contact mini-strip */}
      <div className="bg-slate-900 text-slate-200 text-xs px-4 py-1.5 hidden md:flex items-center justify-between">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="text-slate-400">Emergency & Ambulance: <strong className="text-teal-300 font-semibold">{clinicPhone}</strong></span>
            <span className="hidden lg:inline text-slate-400">Mon - Sat: 8:00 AM - 8:30 PM · Sunday: 9:00 AM - 2:00 PM</span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href={`https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=Hi%20CarePulse%20Clinic,%20I%20would%20like%20to%20enquire%20about%20doctor%20consultations.`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-teal-300 hover:text-teal-200 transition font-medium"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Official WhatsApp: {whatsappNumber}</span>
            </a>
            <span className="text-slate-600">|</span>
            <button
              onClick={onOpenSettingsModal}
              className="text-slate-300 hover:text-white transition font-medium cursor-pointer"
            >
              Clinic Website Settings
            </button>
          </div>
        </div>
      </div>

      {/* Main 3-Zone Navigation Header */}
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-4 sm:px-6 py-3.5">
        {/* Zone 1: Brand Wordmark (Single element) */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onSelectTab('website')}
            className="flex items-center gap-2.5 text-left cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-xs group-hover:bg-teal-700 transition">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v20M2 12h20" />
              </svg>
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-slate-900 block leading-tight whitespace-nowrap">
                CarePulse
              </span>
              <span className="text-[11px] font-medium text-teal-700 tracking-wide block uppercase leading-none">
                Clinic & Diagnostics
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links (single-line, clean unboxed text) */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600">
          <button
            onClick={() => onSelectTab('website')}
            className={`cursor-pointer transition-colors whitespace-nowrap shrink-0 hover:text-teal-800 ${
              activeTab === 'website' ? 'text-teal-700 font-semibold' : ''
            }`}
          >
            Home
          </button>
          <button
            onClick={() => onSelectTab('services')}
            className={`cursor-pointer transition-colors whitespace-nowrap shrink-0 hover:text-teal-800 ${
              activeTab === 'services' ? 'text-teal-700 font-semibold' : ''
            }`}
          >
            Specialities & Care
          </button>
          <button
            onClick={() => onSelectTab('doctors')}
            className={`cursor-pointer transition-colors whitespace-nowrap shrink-0 hover:text-teal-800 ${
              activeTab === 'doctors' ? 'text-teal-700 font-semibold' : ''
            }`}
          >
            Doctors
          </button>
          <button
            onClick={() => onSelectTab('my-bookings')}
            className={`cursor-pointer transition-colors whitespace-nowrap shrink-0 hover:text-teal-800 ${
              activeTab === 'my-bookings' ? 'text-teal-700 font-semibold' : ''
            }`}
          >
            My Bookings
          </button>
          <button
            onClick={() => onSelectTab('crm')}
            className={`cursor-pointer transition-colors whitespace-nowrap shrink-0 hover:text-teal-800 ${
              activeTab === 'crm' ? 'text-teal-700 font-semibold' : ''
            }`}
          >
            Lead CRM
          </button>
          <button
            onClick={() => onSelectTab('whatsapp')}
            className={`cursor-pointer transition-colors whitespace-nowrap shrink-0 hover:text-teal-800 ${
              activeTab === 'whatsapp' ? 'text-teal-700 font-semibold' : ''
            }`}
          >
            WhatsApp Cloud Hub
          </button>
        </nav>

        {/* Zone 3: Primary Action & Role Switcher */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          {/* PWA Install Button */}
          <PWAInstallButton compact />

          {/* Role selector dropdown */}
          <div className="relative">
            <button
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition cursor-pointer min-h-[36px]"
              aria-label="Switch User Mode"
            >
              <Shield className="w-3.5 h-3.5 text-slate-500" />
              <span className="capitalize">{currentRole}</span>
              <ChevronDown className="w-3 h-3 text-slate-500" />
            </button>

            {roleMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setRoleMenuOpen(false)} />
                <div className="absolute right-0 mt-2 w-64 rounded-xl bg-white shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Switch Active Persona
                  </div>
                  {rolesList.map((item) => (
                    <button
                      key={item.role}
                      onClick={() => {
                        onChangeRole(item.role);
                        setRoleMenuOpen(false);
                        if (item.role === 'admin') onSelectTab('admin');
                        else if (item.role === 'doctor') onSelectTab('doctor-view');
                        else if (item.role === 'receptionist') onSelectTab('receptionist-view');
                        else onSelectTab('website');
                      }}
                      className={`w-full text-left px-3 py-2 text-xs hover:bg-teal-50/60 transition cursor-pointer ${
                        currentRole === item.role ? 'bg-teal-50 font-semibold text-teal-900' : 'text-slate-700'
                      }`}
                    >
                      <div className="font-semibold text-slate-900">{item.label}</div>
                      <div className="text-[11px] text-slate-500">{item.desc}</div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Primary CTA: Book Appointment */}
          <button
            onClick={onOpenBookingModal}
            className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 active:scale-98 transition rounded-lg shadow-xs cursor-pointer whitespace-nowrap min-h-[40px]"
          >
            <CalendarPlus className="w-4 h-4 shrink-0" />
            <span>Book Appointment</span>
          </button>
        </div>
      </div>
    </header>
  );
};
