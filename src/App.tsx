/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ClinicSettings, Doctor, Speciality, Appointment, UserRole } from './types/clinic';
import { api } from './services/api';
import { initialClinicSettings } from './data/initialData';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HeroSection } from './components/website/HeroSection';
import { SpecialitiesSection } from './components/website/SpecialitiesSection';
import { DoctorsSection } from './components/website/DoctorsSection';
import { TimingsAndLocation } from './components/website/TimingsAndLocation';
import { FAQSection } from './components/website/FAQSection';
import { AppointmentBookingModal } from './components/booking/AppointmentBookingModal';
import { MyBookingsView } from './components/patient/MyBookingsView';
import { CRMLeadManagement } from './components/crm/CRMLeadManagement';
import { WhatsAppAutomationHub } from './components/whatsapp/WhatsAppAutomationHub';
import { AdminDashboard } from './components/dashboard/AdminDashboard';
import { DoctorDashboard } from './components/dashboard/DoctorDashboard';
import { ReceptionistDashboard } from './components/dashboard/ReceptionistDashboard';
import { WebsiteSettingsModal } from './components/settings/WebsiteSettingsModal';
import { MobileBottomNav } from './components/pwa/MobileBottomNav';
import { OfflineIndicator } from './components/pwa/OfflineIndicator';

export default function App() {
  const [activeTab, setActiveTab] = useState<
    'website' | 'services' | 'doctors' | 'my-bookings' | 'crm' | 'whatsapp' | 'admin' | 'doctor-view' | 'receptionist-view'
  >('website');

  const [currentRole, setCurrentRole] = useState<UserRole>('patient');
  const [clinicSettings, setClinicSettings] = useState<ClinicSettings>(initialClinicSettings);
  const [specialities, setSpecialities] = useState<Speciality[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  // Modals
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [preselectedSpecialityId, setPreselectedSpecialityId] = useState<string | undefined>();
  const [preselectedDoctorId, setPreselectedDoctorId] = useState<string | undefined>();

  const loadData = async () => {
    try {
      const [settings, specs, docs, apts] = await Promise.all([
        api.getClinicSettings(),
        api.getSpecialities(),
        api.getDoctors(),
        api.getAppointments(),
      ]);
      setClinicSettings(settings);
      setSpecialities(specs);
      setDoctors(docs);
      setAppointments(apts);
    } catch (err) {
      console.error('Failed to load clinic data:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenBooking = (specId?: string, docId?: string) => {
    setPreselectedSpecialityId(specId);
    setPreselectedDoctorId(docId);
    setBookingModalOpen(true);
  };

  const handleBookingSuccess = (newApt: Appointment) => {
    setAppointments((prev) => [newApt, ...prev]);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-teal-100 selection:text-teal-900">
      {/* Offline Status PWA Banner */}
      <OfflineIndicator />

      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenBookingModal={() => handleOpenBooking()}
        onOpenSettingsModal={() => setSettingsModalOpen(true)}
        currentRole={currentRole}
        onChangeRole={setCurrentRole}
        clinicName={clinicSettings.name}
        clinicPhone={clinicSettings.phone}
        whatsappNumber={clinicSettings.whatsappNumber}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* PUBLIC CLINIC WEBSITE TAB */}
        {activeTab === 'website' && (
          <>
            <HeroSection
              clinicSettings={clinicSettings}
              onOpenBookingModal={() => handleOpenBooking()}
              onSelectTab={setActiveTab}
            />
            <SpecialitiesSection
              specialities={specialities}
              onSelectSpecialityForBooking={(specId) => handleOpenBooking(specId)}
            />
            <DoctorsSection
              doctors={doctors}
              onBookDoctor={(docId) => handleOpenBooking(undefined, docId)}
            />
            <TimingsAndLocation clinicSettings={clinicSettings} />
            <FAQSection />
          </>
        )}

        {/* SERVICES / SPECIALITIES VIEW */}
        {activeTab === 'services' && (
          <div className="py-6">
            <SpecialitiesSection
              specialities={specialities}
              onSelectSpecialityForBooking={(specId) => handleOpenBooking(specId)}
            />
          </div>
        )}

        {/* DOCTORS VIEW */}
        {activeTab === 'doctors' && (
          <div className="py-6">
            <DoctorsSection
              doctors={doctors}
              onBookDoctor={(docId) => handleOpenBooking(undefined, docId)}
            />
          </div>
        )}

        {/* MY BOOKINGS & DIGITAL PASSES */}
        {activeTab === 'my-bookings' && (
          <MyBookingsView
            appointments={appointments}
            onOpenBookingModal={() => handleOpenBooking()}
            onRefresh={loadData}
          />
        )}

        {/* CRM LEADS PIPELINE */}
        {activeTab === 'crm' && (
          <CRMLeadManagement
            onConvertLeadToAppointment={(lead) => handleOpenBooking(lead.specialityId)}
          />
        )}

        {/* WHATSAPP AUTOMATION CLOUD HUB */}
        {activeTab === 'whatsapp' && <WhatsAppAutomationHub />}

        {/* ADMIN DASHBOARD */}
        {activeTab === 'admin' && (
          <AdminDashboard onOpenSettingsModal={() => setSettingsModalOpen(true)} />
        )}

        {/* DOCTOR OPD DASHBOARD */}
        {activeTab === 'doctor-view' && <DoctorDashboard />}

        {/* RECEPTIONIST DASHBOARD */}
        {activeTab === 'receptionist-view' && (
          <ReceptionistDashboard onOpenBookingModal={() => handleOpenBooking()} />
        )}
      </main>

      {/* Footer */}
      <Footer
        clinicSettings={clinicSettings}
        onOpenBookingModal={() => handleOpenBooking()}
        onSelectTab={setActiveTab}
      />

      {/* Mobile App PWA Bottom Navigation (visible on mobile screens) */}
      <MobileBottomNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenBookingModal={() => handleOpenBooking()}
        bookingCount={appointments.filter((a) => a.status === 'confirmed').length}
        currentRole={currentRole}
      />

      {/* Online Appointment Booking Modal */}
      <AppointmentBookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        specialities={specialities}
        doctors={doctors}
        initialSpecialityId={preselectedSpecialityId}
        initialDoctorId={preselectedDoctorId}
        onBookingSuccess={handleBookingSuccess}
      />

      {/* Clinic Website Settings Modal */}
      <WebsiteSettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        clinicSettings={clinicSettings}
        onSettingsUpdated={(updated) => setClinicSettings(updated)}
      />
    </div>
  );
}
