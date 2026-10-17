import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import {
  initialClinicSettings,
  initialDoctors,
  initialSpecialities,
  initialAppointments,
  initialLeads,
  initialWhatsAppConfig,
  initialWhatsAppMessages,
} from './src/data/initialData';
import {
  Appointment,
  Doctor,
  Lead,
  LeadStatus,
  WhatsAppConfig,
  WhatsAppMessage,
} from './src/types/clinic';

// In-memory persistent database store initialized with rich data
let clinicSettings = { ...initialClinicSettings };
let doctors: Doctor[] = [...initialDoctors];
let specialities = [...initialSpecialities];
let appointments: Appointment[] = [...initialAppointments];
let leads: Lead[] = [...initialLeads];
let whatsappConfig: WhatsAppConfig = { ...initialWhatsAppConfig };
let whatsappMessages: WhatsAppMessage[] = [...initialWhatsAppMessages];

// Concurrency mutex lock set for slot booking
const activeBookingLocks = new Set<string>();

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json());

  // 1. Health check
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'CarePulse Clinic Backend',
      timestamp: new Date().toISOString(),
      appointmentsCount: appointments.length,
      leadsCount: leads.length,
    });
  });

  // 2. Clinic Settings
  app.get('/api/clinic', (req: Request, res: Response) => {
    res.json(clinicSettings);
  });

  app.put('/api/clinic', (req: Request, res: Response) => {
    clinicSettings = { ...clinicSettings, ...req.body };
    res.json({ success: true, settings: clinicSettings });
  });

  // 3. Specialities & Doctors
  app.get('/api/specialities', (req: Request, res: Response) => {
    res.json(specialities);
  });

  app.get('/api/doctors', (req: Request, res: Response) => {
    const { specialityId } = req.query;
    if (specialityId) {
      return res.json(doctors.filter((d) => d.specialityId === specialityId));
    }
    res.json(doctors);
  });

  app.put('/api/doctors/:id/schedule', (req: Request, res: Response) => {
    const { id } = req.params;
    const { availableDays, shiftStart, shiftEnd, slotDurationMinutes } = req.body;
    const docIndex = doctors.findIndex((d) => d.id === id);
    if (docIndex === -1) {
      return res.status(404).json({ error: 'Doctor not found' });
    }
    doctors[docIndex] = {
      ...doctors[docIndex],
      availableDays: availableDays || doctors[docIndex].availableDays,
      shiftStart: shiftStart || doctors[docIndex].shiftStart,
      shiftEnd: shiftEnd || doctors[docIndex].shiftEnd,
      slotDurationMinutes: slotDurationMinutes || doctors[docIndex].slotDurationMinutes,
    };
    res.json({ success: true, doctor: doctors[docIndex] });
  });

  // 4. Appointment Slots with Server-Side Validation
  app.get('/api/slots', (req: Request, res: Response) => {
    const { doctorId, date } = req.query as { doctorId: string; date: string };
    if (!doctorId || !date) {
      return res.status(400).json({ error: 'doctorId and date query params required' });
    }

    const doctor = doctors.find((d) => d.id === doctorId);
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    // Check if doctor works on this day of week
    const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
    const isAvailableDay = doctor.availableDays.includes(dayOfWeek);
    if (!isAvailableDay) {
      return res.json({
        available: false,
        reason: `${doctor.name} does not have OPD consultations on ${dayOfWeek}s.`,
        slots: [],
      });
    }

    // Generate timeslots from shiftStart to shiftEnd
    const [startH, startM] = doctor.shiftStart.split(':').map(Number);
    const [endH, endM] = doctor.shiftEnd.split(':').map(Number);
    const duration = doctor.slotDurationMinutes || 20;

    let currentMinute = startH * 60 + startM;
    const endMinute = endH * 60 + endM;

    // Existing active bookings for this doctor and date (exclude cancelled)
    const bookedTimeSlots = new Set(
      appointments
        .filter((a) => a.doctorId === doctorId && a.date === date && a.status !== 'cancelled')
        .map((a) => a.timeSlot)
    );

    const slots = [];
    while (currentMinute + duration <= endMinute) {
      const h = Math.floor(currentMinute / 60);
      const m = currentMinute % 60;
      const period = h >= 12 ? 'PM' : 'AM';
      const displayH = h % 12 === 0 ? 12 : h % 12;
      const displayM = m < 10 ? `0${m}` : m;
      const formattedTime = `${displayH}:${displayM} ${period}`;

      const isBooked = bookedTimeSlots.has(formattedTime);

      slots.push({
        id: `slot-${doctorId}-${date}-${currentMinute}`,
        doctorId,
        date,
        time: formattedTime,
        isBooked,
      });

      currentMinute += duration;
    }

    res.json({
      available: true,
      dayOfWeek,
      doctorName: doctor.name,
      slots,
    });
  });

  // 5. Book Appointment with Concurrency Mutex Lock & Validation
  app.post('/api/appointments', (req: Request, res: Response) => {
    const {
      patientName,
      patientPhone,
      patientEmail,
      patientAge,
      patientGender,
      specialityId,
      doctorId,
      date,
      timeSlot,
      symptoms,
      type,
      paymentMethod,
    } = req.body;

    if (!patientName || !patientPhone || !specialityId || !doctorId || !date || !timeSlot) {
      return res.status(400).json({ error: 'Missing required appointment fields' });
    }

    const doctor = doctors.find((d) => d.id === doctorId);
    const speciality = specialities.find((s) => s.id === specialityId);
    if (!doctor || !speciality) {
      return res.status(404).json({ error: 'Doctor or Speciality not found' });
    }

    // Server-side Double Booking Lock
    const lockKey = `${doctorId}_${date}_${timeSlot}`;
    if (activeBookingLocks.has(lockKey)) {
      return res.status(409).json({ error: 'Slot is currently being processed by another patient. Please choose another slot.' });
    }

    // Check if already booked in database
    const slotAlreadyBooked = appointments.some(
      (a) => a.doctorId === doctorId && a.date === date && a.timeSlot === timeSlot && a.status !== 'cancelled'
    );
    if (slotAlreadyBooked) {
      return res.status(409).json({ error: 'This time slot is no longer available. Please select another slot.' });
    }

    // Acquire lock
    activeBookingLocks.add(lockKey);

    try {
      // Generate Unique Reference Number
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const referenceNumber = `CP-2026-${randomNum}`;
      const appointmentId = `apt-${Date.now()}`;

      const newAppointment: Appointment = {
        id: appointmentId,
        referenceNumber,
        clinicId: clinicSettings.id,
        patientName: patientName.trim(),
        patientPhone: patientPhone.trim(),
        patientEmail: patientEmail ? patientEmail.trim() : '',
        patientAge: Number(patientAge) || 30,
        patientGender: patientGender || 'Other',
        specialityId,
        specialityName: speciality.name,
        doctorId,
        doctorName: doctor.name,
        date,
        timeSlot,
        status: 'confirmed',
        type: type || 'First Visit',
        symptoms: symptoms ? symptoms.trim() : 'Routine health consultation',
        consultationFee: doctor.consultationFee,
        isPaid: paymentMethod !== 'Clinic Pay',
        paymentMethod: paymentMethod || 'Clinic Pay',
        whatsappNotificationSent: true,
        createdAt: new Date().toISOString(),
      };

      appointments.unshift(newAppointment);

      // Create or update CRM Lead automatically
      const leadId = `lead-${Date.now()}`;
      const leadNumber = `LD-${Math.floor(1000 + Math.random() * 9000)}`;

      const newLead: Lead = {
        id: leadId,
        leadNumber,
        clinicId: clinicSettings.id,
        patientName: newAppointment.patientName,
        phone: newAppointment.patientPhone,
        email: newAppointment.patientEmail,
        source: 'booking_form',
        specialityId,
        specialityName: speciality.name,
        status: 'confirmed',
        assignedStaff: 'Anjali (Reception Lead)',
        appointmentId: newAppointment.id,
        appointmentReference: newAppointment.referenceNumber,
        createdAt: new Date().toISOString(),
        lastContactedAt: new Date().toISOString(),
        nextFollowUpDate: date,
        estimatedValue: doctor.consultationFee,
        notes: [
          {
            id: `note-${Date.now()}`,
            leadId,
            author: 'Booking System',
            authorRole: 'System',
            content: `Online appointment scheduled (${newAppointment.referenceNumber}) for ${doctor.name} on ${date} at ${timeSlot}.`,
            createdAt: new Date().toISOString(),
          },
        ],
      };

      leads.unshift(newLead);

      // Trigger automated WhatsApp Confirmation message
      const confirmationMsg: WhatsAppMessage = {
        id: `wam-${Date.now()}`,
        senderPhone: clinicSettings.whatsappNumber,
        recipientPhone: newAppointment.patientPhone,
        direction: 'outbound',
        messageType: 'template',
        templateName: 'appointment_confirmation_v2',
        body: `✅ *Appointment Confirmed - CarePulse Clinic*\n\nRef: *${newAppointment.referenceNumber}*\nDoctor: *${doctor.name}*\nSpeciality: *${speciality.name}*\nDate: *${date} at ${timeSlot}*\nRoom: ${doctor.roomNumber}\nConsultation Fee: ₹${doctor.consultationFee}\n\nClinic Address: ${clinicSettings.address}\nDirections: ${clinicSettings.googleMapsDirectionsUrl}\n\nTo cancel or reschedule, reply CANCEL or visit our portal.`,
        status: 'delivered',
        timestamp: new Date().toISOString(),
        appointmentRef: newAppointment.referenceNumber,
      };
      whatsappMessages.unshift(confirmationMsg);

      return res.status(201).json({
        success: true,
        message: 'Appointment confirmed successfully',
        appointment: newAppointment,
        lead: newLead,
        whatsappSent: true,
      });
    } finally {
      // Release lock
      activeBookingLocks.delete(lockKey);
    }
  });

  // 6. Appointments list with filters
  app.get('/api/appointments', (req: Request, res: Response) => {
    const { doctorId, date, status, phone } = req.query;
    let filtered = [...appointments];

    if (doctorId) {
      filtered = filtered.filter((a) => a.doctorId === doctorId);
    }
    if (date) {
      filtered = filtered.filter((a) => a.date === date);
    }
    if (status) {
      filtered = filtered.filter((a) => a.status === status);
    }
    if (phone) {
      const cleanPhone = String(phone).replace(/\D/g, '');
      filtered = filtered.filter((a) => a.patientPhone.replace(/\D/g, '').includes(cleanPhone));
    }

    res.json(filtered);
  });

  // 7. Update Appointment (Reschedule, Status, Notes)
  app.put('/api/appointments/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const aptIndex = appointments.findIndex((a) => a.id === id);
    if (aptIndex === -1) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    const { status, date, timeSlot, clinicalNotes, followUpDate } = req.body;
    const existing = appointments[aptIndex];

    // If rescheduling date/time, validate availability
    if ((date && date !== existing.date) || (timeSlot && timeSlot !== existing.timeSlot)) {
      const targetDate = date || existing.date;
      const targetSlot = timeSlot || existing.timeSlot;

      const slotConflict = appointments.some(
        (a) => a.id !== id && a.doctorId === existing.doctorId && a.date === targetDate && a.timeSlot === targetSlot && a.status !== 'cancelled'
      );
      if (slotConflict) {
        return res.status(409).json({ error: 'The requested reschedule slot is already booked.' });
      }
    }

    appointments[aptIndex] = {
      ...existing,
      status: status || existing.status,
      date: date || existing.date,
      timeSlot: timeSlot || existing.timeSlot,
      clinicalNotes: clinicalNotes !== undefined ? clinicalNotes : existing.clinicalNotes,
      followUpDate: followUpDate !== undefined ? followUpDate : existing.followUpDate,
    };

    // Keep lead in sync
    const linkedLead = leads.find((l) => l.appointmentId === id || l.appointmentReference === existing.referenceNumber);
    if (linkedLead) {
      if (status === 'completed') linkedLead.status = 'completed';
      if (status === 'cancelled') linkedLead.status = 'cancelled';
      linkedLead.notes.push({
        id: `note-${Date.now()}`,
        leadId: linkedLead.id,
        author: 'Receptionist / Doctor',
        authorRole: 'Staff',
        content: `Appointment status updated to: ${status || existing.status}. Notes: ${clinicalNotes || 'None'}`,
        createdAt: new Date().toISOString(),
      });
    }

    res.json({ success: true, appointment: appointments[aptIndex] });
  });

  // 8. CRM Leads API
  app.get('/api/leads', (req: Request, res: Response) => {
    const { status, source, search } = req.query;
    let filtered = [...leads];

    if (status && status !== 'all') {
      filtered = filtered.filter((l) => l.status === status);
    }
    if (source && source !== 'all') {
      filtered = filtered.filter((l) => l.source === source);
    }
    if (search) {
      const q = String(search).toLowerCase();
      filtered = filtered.filter(
        (l) =>
          l.patientName.toLowerCase().includes(q) ||
          l.phone.includes(q) ||
          (l.specialityName && l.specialityName.toLowerCase().includes(q)) ||
          l.leadNumber.toLowerCase().includes(q)
      );
    }

    res.json(filtered);
  });

  app.post('/api/leads', (req: Request, res: Response) => {
    const { patientName, phone, email, source, specialityId, note } = req.body;
    if (!patientName || !phone) {
      return res.status(400).json({ error: 'Patient name and phone are required' });
    }

    const speciality = specialities.find((s) => s.id === specialityId);
    const leadId = `lead-${Date.now()}`;
    const leadNumber = `LD-${Math.floor(1000 + Math.random() * 9000)}`;

    const newLead: Lead = {
      id: leadId,
      leadNumber,
      clinicId: clinicSettings.id,
      patientName: patientName.trim(),
      phone: phone.trim(),
      email: email ? email.trim() : undefined,
      source: source || 'website_form',
      specialityId,
      specialityName: speciality?.name || 'General Health',
      status: 'new_enquiry',
      assignedStaff: 'Anjali (Reception Lead)',
      createdAt: new Date().toISOString(),
      notes: note
        ? [
            {
              id: `note-${Date.now()}`,
              leadId,
              author: 'Patient Enquiry Form',
              authorRole: 'System',
              content: note,
              createdAt: new Date().toISOString(),
            },
          ]
        : [],
    };

    leads.unshift(newLead);
    res.status(201).json({ success: true, lead: newLead });
  });

  app.put('/api/leads/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const leadIndex = leads.findIndex((l) => l.id === id);
    if (leadIndex === -1) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    const { status, assignedStaff, nextFollowUpDate } = req.body;
    leads[leadIndex] = {
      ...leads[leadIndex],
      status: status || leads[leadIndex].status,
      assignedStaff: assignedStaff || leads[leadIndex].assignedStaff,
      nextFollowUpDate: nextFollowUpDate !== undefined ? nextFollowUpDate : leads[leadIndex].nextFollowUpDate,
      lastContactedAt: new Date().toISOString(),
    };

    res.json({ success: true, lead: leads[leadIndex] });
  });

  app.post('/api/leads/:id/notes', (req: Request, res: Response) => {
    const { id } = req.params;
    const { content, author, authorRole } = req.body;
    const lead = leads.find((l) => l.id === id);
    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    const newNote = {
      id: `note-${Date.now()}`,
      leadId: id,
      author: author || 'Staff',
      authorRole: authorRole || 'Receptionist',
      content: content.trim(),
      createdAt: new Date().toISOString(),
    };

    lead.notes.unshift(newNote);
    lead.lastContactedAt = new Date().toISOString();

    res.json({ success: true, note: newNote });
  });

  // 9. Export Leads to CSV
  app.get('/api/export-leads', (req: Request, res: Response) => {
    const headers = ['Lead Number', 'Patient Name', 'Phone', 'Email', 'Source', 'Speciality', 'Status', 'Assigned Staff', 'Created At', 'Next Followup'];
    const rows = leads.map((l) => [
      l.leadNumber,
      `"${l.patientName.replace(/"/g, '""')}"`,
      l.phone,
      l.email || '',
      l.source,
      `"${(l.specialityName || '').replace(/"/g, '""')}"`,
      l.status,
      `"${l.assignedStaff.replace(/"/g, '""')}"`,
      l.createdAt.split('T')[0],
      l.nextFollowUpDate || '',
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="carepulse_leads_export.csv"');
    res.send(csvContent);
  });

  // 10. WhatsApp Business Cloud API & Webhook
  app.get('/api/whatsapp/config', (req: Request, res: Response) => {
    // Return config with masked access token for security
    const masked = {
      ...whatsappConfig,
      accessToken: whatsappConfig.accessToken
        ? `${whatsappConfig.accessToken.slice(0, 10)}...${whatsappConfig.accessToken.slice(-6)}`
        : '',
    };
    res.json(masked);
  });

  app.post('/api/whatsapp/config', (req: Request, res: Response) => {
    const { wabaId, phoneNumberId, accessToken, webhookVerifyToken, appSecret, isTestMode } = req.body;
    whatsappConfig = {
      ...whatsappConfig,
      wabaId: wabaId || whatsappConfig.wabaId,
      phoneNumberId: phoneNumberId || whatsappConfig.phoneNumberId,
      accessToken: accessToken && !accessToken.includes('...') ? accessToken : whatsappConfig.accessToken,
      webhookVerifyToken: webhookVerifyToken || whatsappConfig.webhookVerifyToken,
      appSecret: appSecret || whatsappConfig.appSecret,
      isTestMode: isTestMode !== undefined ? Boolean(isTestMode) : whatsappConfig.isTestMode,
      isConfigured: true,
      webhookStatus: 'verified',
    };
    res.json({ success: true, config: whatsappConfig });
  });

  // Meta Webhook Verification (GET)
  app.get('/api/whatsapp/webhook', (req: Request, res: Response) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === whatsappConfig.webhookVerifyToken) {
      console.log('WhatsApp Webhook Verified Successfully with Meta');
      return res.status(200).send(challenge);
    }
    return res.status(403).json({ error: 'Verification token mismatch' });
  });

  // Meta Webhook Inbound Message Receiver & Automation (POST)
  app.post('/api/whatsapp/webhook', (req: Request, res: Response) => {
    const body = req.body;
    console.log('Incoming WhatsApp Webhook Payload:', JSON.stringify(body));

    // Handle incoming messages
    if (body.entry && body.entry[0]?.changes && body.entry[0].changes[0]?.value?.messages) {
      const incoming = body.entry[0].changes[0].value.messages[0];
      const from = incoming.from;
      const text = incoming.text?.body || '';

      const userMsg: WhatsAppMessage = {
        id: `wam-${Date.now()}`,
        senderPhone: from.startsWith('+') ? from : `+${from}`,
        recipientPhone: clinicSettings.whatsappNumber,
        direction: 'inbound',
        messageType: 'text',
        body: text,
        status: 'read',
        timestamp: new Date().toISOString(),
      };
      whatsappMessages.unshift(userMsg);

      // Automated Bot Response Logic
      const cleanText = text.toLowerCase().trim();
      let botResponse = '';

      if (cleanText.includes('hi') || cleanText.includes('hello') || cleanText.includes('start')) {
        botResponse = `👋 Welcome to *${clinicSettings.name}*!\n\nHow can we assist your health today?\n\n1️⃣ *Book Doctor Appointment*\n2️⃣ *Consultation Timings & Location*\n3️⃣ *Diagnostic Lab Tests*\n4️⃣ *Talk to Reception Desk*\n\nReply with a number or your query!`;
      } else if (cleanText === '1' || cleanText.includes('book') || cleanText.includes('doctor')) {
        botResponse = `📅 *Book Your Consultation Online:*\n\nChoose your doctor & choose your time slot in under 60 seconds:\n👉 https://carepulse.health/book\n\nOr tell us your preferred speciality (Cardiology, Dermatology, Orthopedics, Pediatrics, General Medicine).`;
      } else if (cleanText === '2' || cleanText.includes('timing') || cleanText.includes('address') || cleanText.includes('location')) {
        botResponse = `🏥 *CarePulse Clinic Timings:*\n${clinicSettings.weekdaysTimings}\n${clinicSettings.sundayTimings}\n\n📍 *Address:*\n${clinicSettings.address}\n\nGoogle Maps: ${clinicSettings.googleMapsDirectionsUrl}`;
      } else if (cleanText === '3' || cleanText.includes('test') || cleanText.includes('blood') || cleanText.includes('lab')) {
        botResponse = `🔬 *Pathology & Diagnostics Centre:*\nWe offer home sample collection for CBC, Lipid, HbA1c, Thyroid, and Full Body Checkups.\nVerified reports delivered in 4 hours on WhatsApp!\nCall +91 98765 43210 for test booking.`;
      } else if (cleanText === '4' || cleanText.includes('reception') || cleanText.includes('human') || cleanText.includes('staff')) {
        userMsg.isHandedOverToHuman = true;
        botResponse = `👩‍⚕️ You are now connected with our Front Desk Reception team. Anjali or Sunil will assist you shortly. (Average response time: 3 mins).`;
      } else if (cleanText === 'stop') {
        botResponse = `You have unsubscribed from CarePulse WhatsApp updates. Reply START at any time to re-enable.`;
      } else {
        botResponse = `Thank you for reaching out to *${clinicSettings.name}*. Our front desk receptionist has been notified and will reply right here. You can also call us directly at ${clinicSettings.phone}.`;
      }

      if (botResponse) {
        const outMsg: WhatsAppMessage = {
          id: `wam-${Date.now() + 1}`,
          senderPhone: clinicSettings.whatsappNumber,
          recipientPhone: userMsg.senderPhone,
          direction: 'outbound',
          messageType: 'text',
          body: botResponse,
          status: 'delivered',
          timestamp: new Date().toISOString(),
        };
        whatsappMessages.unshift(outMsg);
      }
    }

    res.status(200).send('EVENT_RECEIVED');
  });

  // Get WhatsApp Messages
  app.get('/api/whatsapp/messages', (req: Request, res: Response) => {
    const { phone } = req.query;
    if (phone) {
      const cleanPhone = String(phone).replace(/\D/g, '');
      const filtered = whatsappMessages.filter(
        (m) =>
          m.senderPhone.replace(/\D/g, '').includes(cleanPhone) ||
          m.recipientPhone.replace(/\D/g, '').includes(cleanPhone)
      );
      return res.json(filtered);
    }
    res.json(whatsappMessages);
  });

  // Send WhatsApp message (manual or test)
  app.post('/api/whatsapp/send', (req: Request, res: Response) => {
    const { recipientPhone, body, templateName, appointmentRef } = req.body;
    if (!recipientPhone || !body) {
      return res.status(400).json({ error: 'recipientPhone and body are required' });
    }

    const newMsg: WhatsAppMessage = {
      id: `wam-${Date.now()}`,
      senderPhone: clinicSettings.whatsappNumber,
      recipientPhone,
      direction: 'outbound',
      messageType: templateName ? 'template' : 'text',
      templateName,
      body,
      status: 'delivered',
      timestamp: new Date().toISOString(),
      appointmentRef,
    };

    whatsappMessages.unshift(newMsg);
    res.json({ success: true, message: newMsg });
  });

  // 11. Analytics API
  app.get('/api/analytics', (req: Request, res: Response) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const todayAppointments = appointments.filter((a) => a.date === todayStr);

    const pendingRequests = appointments.filter((a) => a.status === 'pending' || a.status === 'new').length;
    const confirmedBookings = appointments.filter((a) => a.status === 'confirmed').length;
    const completedAppointments = appointments.filter((a) => a.status === 'completed').length;
    const cancelledAppointments = appointments.filter((a) => a.status === 'cancelled').length;

    const totalLeads = leads.length;
    const convertedLeads = leads.filter((l) => l.status === 'confirmed' || l.status === 'completed').length;
    const conversionRate = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0;

    // Source breakdown
    const sourceCounts: Record<string, number> = {};
    leads.forEach((l) => {
      sourceCounts[l.source] = (sourceCounts[l.source] || 0) + 1;
    });

    const sourceBreakdown = Object.entries(sourceCounts).map(([source, count]) => ({
      source,
      count,
      percentage: totalLeads > 0 ? Math.round((count / totalLeads) * 100) : 0,
    }));

    // Status breakdown
    const statusCounts: Record<string, number> = {};
    leads.forEach((l) => {
      statusCounts[l.status] = (statusCounts[l.status] || 0) + 1;
    });

    const statusDistribution = Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
    }));

    // WhatsApp stats
    const whatsappStats = {
      sent: whatsappMessages.filter((m) => m.direction === 'outbound').length,
      delivered: whatsappMessages.filter((m) => m.status === 'delivered' || m.status === 'read').length,
      read: whatsappMessages.filter((m) => m.status === 'read').length,
      failed: whatsappMessages.filter((m) => m.status === 'failed').length,
    };

    res.json({
      totalEnquiries: leads.length,
      todayAppointments: todayAppointments.length,
      pendingRequests,
      confirmedBookings,
      completedAppointments,
      cancelledAppointments,
      conversionRate,
      sourceBreakdown,
      statusDistribution,
      whatsappStats,
    });
  });

  // Production vs Dev setup with Vite
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static('dist'));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve('dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`CarePulse Clinic Server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
