import {
  ClinicSettings,
  Doctor,
  Speciality,
  Appointment,
  Lead,
  WhatsAppConfig,
  WhatsAppMessage,
  ClinicAnalytics,
} from '../types/clinic';
import {
  initialClinicSettings,
  initialDoctors,
  initialSpecialities,
  initialAppointments,
  initialLeads,
  initialWhatsAppConfig,
  initialWhatsAppMessages,
} from '../data/initialData';

// Storage keys for offline resilience
const STORAGE_KEYS = {
  CLINIC: 'carepulse_clinic_settings',
  DOCTORS: 'carepulse_doctors',
  SPECIALITIES: 'carepulse_specialities',
  APPOINTMENTS: 'carepulse_appointments',
  LEADS: 'carepulse_leads',
  WHATSAPP_CONFIG: 'carepulse_whatsapp_config',
  WHATSAPP_MESSAGES: 'carepulse_whatsapp_messages',
};

// Helper for local storage
function getLocal<T>(key: string, fallback: T): T {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : fallback;
  } catch {
    return fallback;
  }
}

function setLocal<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.warn('LocalStorage save failed:', err);
  }
}

export const api = {
  // 1. Clinic Settings
  async getClinicSettings(): Promise<ClinicSettings> {
    try {
      const res = await fetch('/api/clinic');
      if (res.ok) {
        const data = await res.json();
        setLocal(STORAGE_KEYS.CLINIC, data);
        return data;
      }
    } catch {
      // offline fallback
    }
    return getLocal(STORAGE_KEYS.CLINIC, initialClinicSettings);
  },

  async updateClinicSettings(settings: Partial<ClinicSettings>): Promise<ClinicSettings> {
    try {
      const res = await fetch('/api/clinic', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        const data = await res.json();
        setLocal(STORAGE_KEYS.CLINIC, data.settings);
        return data.settings;
      }
    } catch {
      // offline fallback
    }
    const current = getLocal(STORAGE_KEYS.CLINIC, initialClinicSettings);
    const updated = { ...current, ...settings };
    setLocal(STORAGE_KEYS.CLINIC, updated);
    return updated;
  },

  // 2. Doctors & Specialities
  async getSpecialities(): Promise<Speciality[]> {
    try {
      const res = await fetch('/api/specialities');
      if (res.ok) {
        const data = await res.json();
        setLocal(STORAGE_KEYS.SPECIALITIES, data);
        return data;
      }
    } catch {
      // fallback
    }
    return getLocal(STORAGE_KEYS.SPECIALITIES, initialSpecialities);
  },

  async getDoctors(specialityId?: string): Promise<Doctor[]> {
    try {
      const url = specialityId ? `/api/doctors?specialityId=${specialityId}` : '/api/doctors';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (!specialityId) setLocal(STORAGE_KEYS.DOCTORS, data);
        return data;
      }
    } catch {
      // fallback
    }
    const all = getLocal(STORAGE_KEYS.DOCTORS, initialDoctors);
    return specialityId ? all.filter((d) => d.specialityId === specialityId) : all;
  },

  async updateDoctorSchedule(
    doctorId: string,
    schedule: { availableDays?: string[]; shiftStart?: string; shiftEnd?: string; slotDurationMinutes?: number }
  ): Promise<Doctor> {
    try {
      const res = await fetch(`/api/doctors/${doctorId}/schedule`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(schedule),
      });
      if (res.ok) {
        const data = await res.json();
        return data.doctor;
      }
    } catch {
      // offline fallback
    }
    const docs = getLocal(STORAGE_KEYS.DOCTORS, initialDoctors);
    const idx = docs.findIndex((d) => d.id === doctorId);
    if (idx !== -1) {
      docs[idx] = { ...docs[idx], ...schedule };
      setLocal(STORAGE_KEYS.DOCTORS, docs);
      return docs[idx];
    }
    throw new Error('Doctor not found');
  },

  // 3. Appointment Slots
  async getAvailableSlots(
    doctorId: string,
    date: string
  ): Promise<{ available: boolean; reason?: string; slots: { id: string; time: string; isBooked: boolean }[] }> {
    try {
      const res = await fetch(`/api/slots?doctorId=${encodeURIComponent(doctorId)}&date=${encodeURIComponent(date)}`);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // generate offline simulated slots
    }

    const doctors = getLocal(STORAGE_KEYS.DOCTORS, initialDoctors);
    const doctor = doctors.find((d) => d.id === doctorId);
    if (!doctor) return { available: false, slots: [] };

    const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
    if (!doctor.availableDays.includes(dayOfWeek)) {
      return { available: false, reason: `${doctor.name} does not practice on ${dayOfWeek}s.`, slots: [] };
    }

    const appointments = getLocal(STORAGE_KEYS.APPOINTMENTS, initialAppointments);
    const booked = new Set(appointments.filter((a) => a.doctorId === doctorId && a.date === date && a.status !== 'cancelled').map((a) => a.timeSlot));

    const [startH] = doctor.shiftStart.split(':').map(Number);
    const [endH] = doctor.shiftEnd.split(':').map(Number);
    const slots = [];
    for (let h = startH; h < endH; h++) {
      for (const m of ['00', '20', '40']) {
        const period = h >= 12 ? 'PM' : 'AM';
        const displayH = h % 12 === 0 ? 12 : h % 12;
        const formatted = `${displayH}:${m} ${period}`;
        slots.push({
          id: `slot-${doctorId}-${date}-${h}-${m}`,
          time: formatted,
          isBooked: booked.has(formatted),
        });
      }
    }
    return { available: true, slots };
  },

  // 4. Appointments
  async getAppointments(filters?: { doctorId?: string; date?: string; status?: string; phone?: string }): Promise<Appointment[]> {
    try {
      const query = new URLSearchParams(filters as Record<string, string>).toString();
      const res = await fetch(`/api/appointments?${query}`);
      if (res.ok) {
        const data = await res.json();
        setLocal(STORAGE_KEYS.APPOINTMENTS, data);
        return data;
      }
    } catch {
      // fallback
    }
    let data = getLocal(STORAGE_KEYS.APPOINTMENTS, initialAppointments);
    if (filters?.doctorId) data = data.filter((a) => a.doctorId === filters.doctorId);
    if (filters?.date) data = data.filter((a) => a.date === filters.date);
    if (filters?.status) data = data.filter((a) => a.status === filters.status);
    if (filters?.phone) {
      const p = filters.phone.replace(/\D/g, '');
      data = data.filter((a) => a.patientPhone.replace(/\D/g, '').includes(p));
    }
    return data;
  },

  async bookAppointment(payload: Partial<Appointment>): Promise<{ appointment: Appointment; lead?: Lead }> {
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        // Update local cache
        const current = getLocal<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, initialAppointments);
        setLocal(STORAGE_KEYS.APPOINTMENTS, [data.appointment, ...current]);
        return data;
      } else {
        const err = await res.json();
        throw new Error(err.error || 'Failed to book appointment');
      }
    } catch (err: unknown) {
      if ((err as Error)?.message && !(err as Error)?.message.includes('fetch')) {
        throw err;
      }
    }

    // Offline booking fallback
    const randomRef = `CP-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newApt: Appointment = {
      id: `apt-${Date.now()}`,
      referenceNumber: randomRef,
      clinicId: 'clinic-carepulse-01',
      patientName: payload.patientName || 'Patient',
      patientPhone: payload.patientPhone || '',
      patientEmail: payload.patientEmail || '',
      patientAge: payload.patientAge || 30,
      patientGender: payload.patientGender || 'Other',
      specialityId: payload.specialityId || 'spec-medicine',
      specialityName: payload.specialityName || 'General Medicine',
      doctorId: payload.doctorId || 'doc-rao',
      doctorName: payload.doctorName || 'Dr. Vikramaditya Rao',
      date: payload.date || new Date().toISOString().split('T')[0],
      timeSlot: payload.timeSlot || '10:00 AM',
      status: 'confirmed',
      type: payload.type || 'First Visit',
      symptoms: payload.symptoms || 'General consultation',
      consultationFee: payload.consultationFee || 600,
      isPaid: false,
      whatsappNotificationSent: true,
      createdAt: new Date().toISOString(),
    };
    const current = getLocal<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, initialAppointments);
    setLocal(STORAGE_KEYS.APPOINTMENTS, [newApt, ...current]);
    return { appointment: newApt };
  },

  async updateAppointment(
    id: string,
    updates: { status?: string; date?: string; timeSlot?: string; clinicalNotes?: string; followUpDate?: string }
  ): Promise<Appointment> {
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const data = await res.json();
        return data.appointment;
      }
    } catch {
      // offline fallback
    }

    const current = getLocal<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, initialAppointments);
    const idx = current.findIndex((a) => a.id === id);
    if (idx !== -1) {
      current[idx] = { ...current[idx], ...updates } as Appointment;
      setLocal(STORAGE_KEYS.APPOINTMENTS, current);
      return current[idx];
    }
    throw new Error('Appointment not found');
  },

  // 5. CRM Leads
  async getLeads(filters?: { status?: string; source?: string; search?: string }): Promise<Lead[]> {
    try {
      const query = new URLSearchParams(filters as Record<string, string>).toString();
      const res = await fetch(`/api/leads?${query}`);
      if (res.ok) {
        const data = await res.json();
        setLocal(STORAGE_KEYS.LEADS, data);
        return data;
      }
    } catch {
      // fallback
    }
    let data = getLocal(STORAGE_KEYS.LEADS, initialLeads);
    if (filters?.status && filters.status !== 'all') data = data.filter((l) => l.status === filters.status);
    if (filters?.source && filters.source !== 'all') data = data.filter((l) => l.source === filters.source);
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      data = data.filter((l) => l.patientName.toLowerCase().includes(q) || l.phone.includes(q) || l.leadNumber.toLowerCase().includes(q));
    }
    return data;
  },

  async createLead(payload: { patientName: string; phone: string; email?: string; source?: string; specialityId?: string; note?: string }): Promise<Lead> {
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        return data.lead;
      }
    } catch {
      // offline fallback
    }

    const newLead: Lead = {
      id: `lead-${Date.now()}`,
      leadNumber: `LD-${Math.floor(1000 + Math.random() * 9000)}`,
      clinicId: 'clinic-carepulse-01',
      patientName: payload.patientName,
      phone: payload.phone,
      email: payload.email,
      source: (payload.source as any) || 'website_form',
      status: 'new_enquiry',
      assignedStaff: 'Anjali (Reception Lead)',
      createdAt: new Date().toISOString(),
      notes: payload.note
        ? [{ id: `n-${Date.now()}`, leadId: `lead-${Date.now()}`, author: 'Website Form', authorRole: 'System', content: payload.note, createdAt: new Date().toISOString() }]
        : [],
    };
    const current = getLocal<Lead[]>(STORAGE_KEYS.LEADS, initialLeads);
    setLocal(STORAGE_KEYS.LEADS, [newLead, ...current]);
    return newLead;
  },

  async updateLead(id: string, updates: { status?: string; assignedStaff?: string; nextFollowUpDate?: string }): Promise<Lead> {
    try {
      const res = await fetch(`/api/leads/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const data = await res.json();
        return data.lead;
      }
    } catch {
      // offline fallback
    }

    const current = getLocal<Lead[]>(STORAGE_KEYS.LEADS, initialLeads);
    const idx = current.findIndex((l) => l.id === id);
    if (idx !== -1) {
      current[idx] = { ...current[idx], ...updates } as Lead;
      setLocal(STORAGE_KEYS.LEADS, current);
      return current[idx];
    }
    throw new Error('Lead not found');
  },

  async addLeadNote(leadId: string, content: string, author = 'Staff', authorRole = 'Receptionist') {
    try {
      const res = await fetch(`/api/leads/${leadId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, author, authorRole }),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // offline fallback
    }

    const current = getLocal<Lead[]>(STORAGE_KEYS.LEADS, initialLeads);
    const lead = current.find((l) => l.id === leadId);
    if (lead) {
      const note = { id: `note-${Date.now()}`, leadId, author, authorRole, content, createdAt: new Date().toISOString() };
      lead.notes.unshift(note);
      setLocal(STORAGE_KEYS.LEADS, current);
      return { success: true, note };
    }
  },

  // 6. WhatsApp Cloud API & Messages
  async getWhatsAppConfig(): Promise<WhatsAppConfig> {
    try {
      const res = await fetch('/api/whatsapp/config');
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    return getLocal(STORAGE_KEYS.WHATSAPP_CONFIG, initialWhatsAppConfig);
  },

  async updateWhatsAppConfig(config: Partial<WhatsAppConfig>): Promise<WhatsAppConfig> {
    try {
      const res = await fetch('/api/whatsapp/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (res.ok) {
        const data = await res.json();
        setLocal(STORAGE_KEYS.WHATSAPP_CONFIG, data.config);
        return data.config;
      }
    } catch {
      // fallback
    }
    const current = getLocal(STORAGE_KEYS.WHATSAPP_CONFIG, initialWhatsAppConfig);
    const updated = { ...current, ...config };
    setLocal(STORAGE_KEYS.WHATSAPP_CONFIG, updated);
    return updated;
  },

  async getWhatsAppMessages(phone?: string): Promise<WhatsAppMessage[]> {
    try {
      const url = phone ? `/api/whatsapp/messages?phone=${encodeURIComponent(phone)}` : '/api/whatsapp/messages';
      const res = await fetch(url);
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    const all = getLocal(STORAGE_KEYS.WHATSAPP_MESSAGES, initialWhatsAppMessages);
    return phone ? all.filter((m) => m.senderPhone.includes(phone) || m.recipientPhone.includes(phone)) : all;
  },

  async sendWhatsAppMessage(payload: { recipientPhone: string; body: string; templateName?: string; appointmentRef?: string }): Promise<WhatsAppMessage> {
    try {
      const res = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        return data.message;
      }
    } catch {
      // fallback
    }
    const newMsg: WhatsAppMessage = {
      id: `wam-${Date.now()}`,
      senderPhone: '+91 98765 43210',
      recipientPhone: payload.recipientPhone,
      direction: 'outbound',
      messageType: payload.templateName ? 'template' : 'text',
      templateName: payload.templateName,
      body: payload.body,
      status: 'delivered',
      timestamp: new Date().toISOString(),
      appointmentRef: payload.appointmentRef,
    };
    const current = getLocal<WhatsAppMessage[]>(STORAGE_KEYS.WHATSAPP_MESSAGES, initialWhatsAppMessages);
    setLocal(STORAGE_KEYS.WHATSAPP_MESSAGES, [newMsg, ...current]);
    return newMsg;
  },

  async simulateInboundWhatsAppMessage(fromPhone: string, text: string) {
    try {
      const res = await fetch('/api/whatsapp/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entry: [
            {
              changes: [
                {
                  value: {
                    messages: [
                      {
                        from: fromPhone,
                        text: { body: text },
                      },
                    ],
                  },
                },
              ],
            },
          ],
        }),
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  // 7. Analytics
  async getAnalytics(): Promise<ClinicAnalytics> {
    try {
      const res = await fetch('/api/analytics');
      if (res.ok) return await res.json();
    } catch {
      // calculate locally
    }
    const appointments = getLocal(STORAGE_KEYS.APPOINTMENTS, initialAppointments);
    const leads = getLocal(STORAGE_KEYS.LEADS, initialLeads);
    const today = new Date().toISOString().split('T')[0];

    return {
      totalEnquiries: leads.length,
      todayAppointments: appointments.filter((a) => a.date === today).length,
      pendingRequests: appointments.filter((a) => a.status === 'pending' || a.status === 'new').length,
      confirmedBookings: appointments.filter((a) => a.status === 'confirmed').length,
      completedAppointments: appointments.filter((a) => a.status === 'completed').length,
      cancelledAppointments: appointments.filter((a) => a.status === 'cancelled').length,
      conversionRate: leads.length > 0 ? Math.round((appointments.length / leads.length) * 100) : 0,
      sourceBreakdown: [
        { source: 'booking_form', count: 4, percentage: 50 },
        { source: 'whatsapp', count: 2, percentage: 25 },
        { source: 'website_form', count: 1, percentage: 12 },
        { source: 'click_to_call', count: 1, percentage: 13 },
      ],
      statusDistribution: [
        { status: 'new_enquiry', count: 1 },
        { status: 'contacted', count: 1 },
        { status: 'appointment_requested', count: 1 },
        { status: 'confirmed', count: 1 },
        { status: 'completed', count: 1 },
        { status: 'followup_required', count: 1 },
      ],
      whatsappStats: { sent: 4, delivered: 4, read: 3, failed: 0 },
    };
  },
};
