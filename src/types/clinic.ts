export type UserRole = 'patient' | 'receptionist' | 'doctor' | 'admin' | 'superadmin';

export type AppointmentStatus = 'new' | 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';

export type LeadStatus = 'new_enquiry' | 'contacted' | 'appointment_requested' | 'confirmed' | 'completed' | 'followup_required' | 'cancelled' | 'not_converted';

export type LeadSource = 'website_form' | 'booking_form' | 'whatsapp' | 'click_to_call' | 'google_ads' | 'walk_in' | 'staff_created';

export interface Doctor {
  id: string;
  name: string;
  specialityId: string;
  specialityName: string;
  qualifications: string;
  experienceYears: number;
  rating: number;
  reviewCount: number;
  consultationFee: number;
  availableDays: string[]; // ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  shiftStart: string; // "09:00"
  shiftEnd: string; // "17:00"
  slotDurationMinutes: number; // 20
  roomNumber: string;
  languages: string[];
  bio: string;
  avatarColor: string;
  avatarInitials: string;
}

export interface Speciality {
  id: string;
  name: string;
  icon: string;
  shortDescription: string;
  fullDescription: string;
  commonSymptoms: string[];
  keyProcedures: string[];
  startingPrice: number;
  doctorCount: number;
}

export interface AppointmentSlot {
  id: string;
  doctorId: string;
  date: string; // "YYYY-MM-DD"
  time: string; // "10:00 AM"
  isBooked: boolean;
  appointmentId?: string;
}

export interface Appointment {
  id: string;
  referenceNumber: string; // e.g. "CP-2026-8492"
  clinicId: string;
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  patientAge: number;
  patientGender: 'Male' | 'Female' | 'Other';
  specialityId: string;
  specialityName: string;
  doctorId: string;
  doctorName: string;
  date: string; // "YYYY-MM-DD"
  timeSlot: string; // "10:00 AM"
  status: AppointmentStatus;
  type: 'First Visit' | 'Follow-up' | 'Routine Checkup' | 'Second Opinion';
  symptoms: string;
  consultationFee: number;
  isPaid: boolean;
  paymentMethod?: 'Clinic Pay' | 'UPI' | 'Card';
  whatsappNotificationSent: boolean;
  createdAt: string;
  clinicalNotes?: string;
  followUpDate?: string;
}

export interface LeadNote {
  id: string;
  leadId: string;
  author: string;
  authorRole: string;
  content: string;
  createdAt: string;
}

export interface Lead {
  id: string;
  leadNumber: string; // e.g. "LD-1094"
  clinicId: string;
  patientName: string;
  phone: string;
  email?: string;
  source: LeadSource;
  specialityId?: string;
  specialityName?: string;
  status: LeadStatus;
  assignedStaff: string;
  appointmentId?: string;
  appointmentReference?: string;
  createdAt: string;
  lastContactedAt?: string;
  nextFollowUpDate?: string;
  notes: LeadNote[];
  estimatedValue?: number;
}

export interface WhatsAppConfig {
  wabaId: string;
  phoneNumberId: string;
  accessToken: string;
  webhookVerifyToken: string;
  appSecret: string;
  webhookUrl: string;
  isConfigured: boolean;
  isTestMode: boolean;
  webhookStatus: 'verified' | 'unverified' | 'pending';
}

export interface WhatsAppMessage {
  id: string;
  senderPhone: string;
  recipientPhone: string;
  direction: 'inbound' | 'outbound';
  messageType: 'text' | 'template' | 'interactive' | 'location';
  body: string;
  templateName?: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: string;
  appointmentRef?: string;
  isHandedOverToHuman?: boolean;
}

export interface ClinicSettings {
  id: string;
  name: string;
  tagline: string;
  phone: string;
  emergencyPhone: string;
  whatsappNumber: string;
  email: string;
  address: string;
  locality: string;
  city: string;
  pincode: string;
  googleMapsEmbedQuery: string;
  googleMapsDirectionsUrl: string;
  weekdaysTimings: string;
  sundayTimings: string;
  consultationNotice: string;
  enableOnlinePayment: boolean;
}

export interface ClinicAnalytics {
  totalEnquiries: number;
  todayAppointments: number;
  pendingRequests: number;
  confirmedBookings: number;
  completedAppointments: number;
  cancelledAppointments: number;
  conversionRate: number;
  sourceBreakdown: { source: string; count: number; percentage: number }[];
  statusDistribution: { status: string; count: number }[];
  whatsappStats: { sent: number; delivered: number; read: number; failed: number };
}
