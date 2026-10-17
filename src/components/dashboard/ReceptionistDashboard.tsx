import React, { useState, useEffect } from 'react';
import { Appointment, Lead, WhatsAppMessage, Doctor } from '../../types/clinic';
import { api } from '../../services/api';
import { UserCheck, Phone, MessageSquare, Plus, CheckCircle2, Clock, Calendar, AlertCircle, Send, User } from 'lucide-react';

interface ReceptionistDashboardProps {
  onOpenBookingModal: () => void;
}

export const ReceptionistDashboard: React.FC<ReceptionistDashboardProps> = ({ onOpenBookingModal }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected chat for receptionist response
  const [selectedChatPhone, setSelectedChatPhone] = useState<string>('+91 97312 34567');
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  const loadFrontDeskData = async () => {
    setLoading(true);
    try {
      const [apts, lds, msgs] = await Promise.all([
        api.getAppointments(),
        api.getLeads(),
        api.getWhatsAppMessages(),
      ]);
      setAppointments(apts);
      setLeads(lds);
      setMessages(msgs);
    } catch (err) {
      console.error('Failed to load receptionist dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFrontDeskData();
  }, []);

  const handleConfirmAppointment = async (id: string) => {
    try {
      await api.updateAppointment(id, { status: 'confirmed' });
      loadFrontDeskData();
    } catch (err) {
      console.error('Confirm error:', err);
    }
  };

  const handleSendWhatsAppReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedChatPhone) return;

    setSendingReply(true);
    try {
      await api.sendWhatsAppMessage({
        recipientPhone: selectedChatPhone,
        body: replyText.trim(),
      });
      setReplyText('');
      const updated = await api.getWhatsAppMessages();
      setMessages(updated);
    } catch (err) {
      console.error('Reply error:', err);
    } finally {
      setSendingReply(false);
    }
  };

  const pendingAppointments = appointments.filter((a) => a.status === 'pending' || a.status === 'new');
  const activeChatMessages = messages.filter(
    (m) =>
      m.senderPhone.includes(selectedChatPhone.replace(/\D/g, '')) ||
      m.recipientPhone.includes(selectedChatPhone.replace(/\D/g, ''))
  );

  return (
    <div className="py-8 md:py-12 bg-slate-50 min-h-[85vh]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-teal-700 uppercase tracking-wider mb-1">
              <span>Front Desk Operations</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Receptionist Desk & Live Patient Queue
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Duty Staff: Anjali & Sunil · Rapid token issuing, WhatsApp human support, and phone follow-ups.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onOpenBookingModal}
              className="py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs transition cursor-pointer shadow-xs min-h-[44px]"
            >
              + Create Walk-in Token
            </button>
            <button
              onClick={loadFrontDeskData}
              className="py-2.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-xs transition cursor-pointer min-h-[44px]"
            >
              Refresh Desk
            </button>
          </div>
        </div>

        {/* 3 Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <span className="text-xs font-bold text-slate-500 uppercase">Pending Verification</span>
            <div className="text-2xl font-extrabold text-amber-600 tabular-nums mt-1">
              {pendingAppointments.length} Bookings
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Require phone or token confirmation</p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <span className="text-xs font-bold text-slate-500 uppercase">Follow-up Tasks Today</span>
            <div className="text-2xl font-extrabold text-teal-700 tabular-nums mt-1">
              {leads.filter((l) => l.status === 'followup_required' || l.status === 'new_enquiry').length} Calls
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Enquiries awaiting call back</p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <span className="text-xs font-bold text-slate-500 uppercase">Active WhatsApp Conversations</span>
            <div className="text-2xl font-extrabold text-emerald-700 tabular-nums mt-1">
              {messages.length} Messages
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Human assistance requests</p>
          </div>
        </div>

        {/* 2-Column Front Desk Console */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Pending Appointment Requests Queue */}
          <div className="lg:col-span-7 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Pending Appointment Requests ({pendingAppointments.length})
            </h3>

            {pendingAppointments.length === 0 ? (
              <div className="p-6 rounded-2xl bg-white border border-slate-200 text-center text-xs text-slate-500">
                All incoming appointment requests have been confirmed!
              </div>
            ) : (
              pendingAppointments.map((apt) => (
                <div key={apt.id} className="p-4 rounded-2xl bg-white border border-amber-200 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div>
                      <span className="text-xs font-extrabold text-slate-900">{apt.referenceNumber}</span>
                      <span className="text-xs text-slate-500 ml-2">({apt.date} at {apt.timeSlot})</span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 uppercase">
                      Needs Approval
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Patient</span>
                      <span className="font-semibold text-slate-800">{apt.patientName}</span>
                      <a href={`tel:${apt.patientPhone}`} className="text-teal-700 block font-medium">
                        {apt.patientPhone}
                      </a>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Doctor Requested</span>
                      <span className="font-semibold text-slate-800">{apt.doctorName}</span>
                      <span className="text-slate-500 block">{apt.specialityName}</span>
                    </div>
                  </div>

                  {apt.symptoms && (
                    <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <strong>Complaint:</strong> {apt.symptoms}
                    </p>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                    <a
                      href={`tel:${apt.patientPhone}`}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Call Patient
                    </a>
                    <button
                      onClick={() => handleConfirmAppointment(apt.id)}
                      className="px-4 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold cursor-pointer"
                    >
                      Confirm & Send Token
                    </button>
                  </div>
                </div>
              ))
            )}

            {/* Confirmed consultations for today */}
            <div className="pt-4">
              <h4 className="text-sm font-bold text-slate-900 mb-2">Confirmed Consultations Overview</h4>
              <div className="space-y-2">
                {appointments.slice(0, 4).map((apt) => (
                  <div key={apt.id} className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900">{apt.referenceNumber}</span>
                      <span className="text-slate-500 ml-2">{apt.patientName}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold text-teal-800">{apt.timeSlot}</span>
                      <span className="text-slate-400 block text-[10px]">{apt.doctorName}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Front Desk WhatsApp Human Handover Chat */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4 flex flex-col h-[600px]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <h4 className="text-sm font-bold text-slate-900">WhatsApp Desk Chat</h4>
              </div>

              <select
                value={selectedChatPhone}
                onChange={(e) => setSelectedChatPhone(e.target.value)}
                className="text-xs rounded-lg border border-slate-200 px-2 py-1 bg-white font-mono"
              >
                <option value="+91 97312 34567">+91 97312 34567 (Rohan)</option>
                <option value="+91 98450 11223">+91 98450 11223 (Sunita)</option>
                <option value="+91 96112 55443">+91 96112 55443 (Arjun)</option>
              </select>
            </div>

            {/* Chat messages */}
            <div className="flex-1 overflow-y-auto space-y-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
              {activeChatMessages.length === 0 ? (
                <div className="text-center text-slate-400 py-10">
                  No previous messages with this number.
                </div>
              ) : (
                activeChatMessages.slice().reverse().map((msg) => {
                  const isOutbound = msg.direction === 'outbound';
                  return (
                    <div key={msg.id} className={`flex ${isOutbound ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[85%] rounded-xl p-2.5 text-xs shadow-2xs ${
                          isOutbound ? 'bg-teal-700 text-white' : 'bg-white text-slate-800 border border-slate-200'
                        }`}
                      >
                        <p className="whitespace-pre-line leading-relaxed">{msg.body}</p>
                        <span className={`block text-[9px] mt-1 text-right ${isOutbound ? 'text-teal-200' : 'text-slate-400'}`}>
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Receptionist reply input */}
            <form onSubmit={handleSendWhatsAppReply} className="flex gap-2 shrink-0 pt-2 border-t border-slate-100">
              <input
                type="text"
                required
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type receptionist response to patient..."
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-600 focus:outline-none"
              />
              <button
                type="submit"
                disabled={sendingReply}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs cursor-pointer min-h-[38px]"
              >
                {sendingReply ? '...' : 'Send'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
