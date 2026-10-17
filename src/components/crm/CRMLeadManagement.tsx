import React, { useState, useEffect } from 'react';
import { Lead, LeadStatus, LeadSource } from '../../types/clinic';
import { api } from '../../services/api';
import { Search, Filter, Download, UserPlus, Phone, Mail, Calendar, MessageSquare, Plus, Clock, CheckCircle2, ChevronRight, User } from 'lucide-react';

interface CRMLeadManagementProps {
  onConvertLeadToAppointment?: (lead: Lead) => void;
}

export const CRMLeadManagement: React.FC<CRMLeadManagementProps> = ({ onConvertLeadToAppointment }) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);
  const [createLeadModalOpen, setCreateLeadModalOpen] = useState(false);

  // New Lead form state
  const [newLeadForm, setNewLeadForm] = useState({
    patientName: '',
    phone: '',
    email: '',
    source: 'staff_created' as LeadSource,
    specialityId: 'spec-medicine',
    note: '',
  });

  const loadLeads = async () => {
    setLoading(true);
    try {
      const data = await api.getLeads({
        status: statusFilter,
        source: sourceFilter,
        search,
      });
      setLeads(data);
      if (selectedLead) {
        const refreshed = data.find((l) => l.id === selectedLead.id);
        if (refreshed) setSelectedLead(refreshed);
      }
    } catch (err) {
      console.error('Failed to load leads:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, [statusFilter, sourceFilter, search]);

  const handleStatusChange = async (leadId: string, newStatus: LeadStatus) => {
    try {
      await api.updateLead(leadId, { status: newStatus });
      loadLeads();
    } catch (err) {
      console.error('Failed to update lead status:', err);
    }
  };

  const handleStaffAssign = async (leadId: string, assignedStaff: string) => {
    try {
      await api.updateLead(leadId, { assignedStaff });
      loadLeads();
    } catch (err) {
      console.error('Failed to assign staff:', err);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead || !newNoteContent.trim()) return;

    setIsSubmittingNote(true);
    try {
      await api.addLeadNote(selectedLead.id, newNoteContent, 'Front Desk Staff', 'Receptionist');
      setNewNoteContent('');
      loadLeads();
    } catch (err) {
      console.error('Failed to add note:', err);
    } finally {
      setIsSubmittingNote(false);
    }
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadForm.patientName || !newLeadForm.phone) return;

    try {
      await api.createLead(newLeadForm);
      setCreateLeadModalOpen(false);
      setNewLeadForm({
        patientName: '',
        phone: '',
        email: '',
        source: 'staff_created',
        specialityId: 'spec-medicine',
        note: '',
      });
      loadLeads();
    } catch (err) {
      console.error('Failed to create lead:', err);
    }
  };

  const handleExportCSV = () => {
    window.location.href = '/api/export-leads';
  };

  // Pipeline stage counts
  const pipelineStages: { key: LeadStatus; label: string }[] = [
    { key: 'new_enquiry', label: 'New Enquiry' },
    { key: 'contacted', label: 'Contacted' },
    { key: 'appointment_requested', label: 'Appointment Requested' },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'completed', label: 'Completed' },
  ];

  return (
    <div className="py-8 md:py-12 bg-slate-50 min-h-[85vh]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header & Quick Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-teal-700 uppercase tracking-wider mb-1">
              <span>Healthcare CRM & Patient Pipeline</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Lead & Enquiry Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Track enquiries from Website, WhatsApp Cloud, phone calls, and walk-in front desk queues.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition cursor-pointer min-h-[44px]"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => setCreateLeadModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs transition cursor-pointer shadow-xs min-h-[44px]"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Add Walk-in Lead</span>
            </button>
          </div>
        </div>

        {/* Pipeline Summary Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
          {pipelineStages.map((stage) => {
            const count = leads.filter((l) => l.status === stage.key).length;
            const isActive = statusFilter === stage.key;
            return (
              <button
                key={stage.key}
                onClick={() => setStatusFilter(isActive ? 'all' : stage.key)}
                className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                  isActive
                    ? 'border-teal-600 bg-teal-50/80 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-teal-200'
                }`}
              >
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-tight">{stage.label}</div>
                <div className="text-xl font-extrabold text-slate-900 tabular-nums mt-1">{count}</div>
              </button>
            );
          })}
        </div>

        {/* Filters & Search Toolbar */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs mb-6 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          <div className="sm:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by patient name, phone, lead ID..."
              className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-600 focus:outline-none"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-600 focus:outline-none bg-white"
            >
              <option value="all">All Pipeline Statuses</option>
              <option value="new_enquiry">New Enquiry</option>
              <option value="contacted">Contacted</option>
              <option value="appointment_requested">Appointment Requested</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="followup_required">Follow-up Required</option>
              <option value="cancelled">Cancelled</option>
              <option value="not_converted">Not Converted</option>
            </select>
          </div>

          <div className="sm:col-span-3">
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-600 focus:outline-none bg-white"
            >
              <option value="all">All Sources</option>
              <option value="website_form">Website Contact Form</option>
              <option value="booking_form">Online Booking</option>
              <option value="whatsapp">WhatsApp Cloud API</option>
              <option value="click_to_call">Phone Call Tracking</option>
              <option value="walk_in">Front Desk Walk-in</option>
              <option value="staff_created">Staff Created</option>
            </select>
          </div>

          <div className="sm:col-span-1 text-right">
            {(statusFilter !== 'all' || sourceFilter !== 'all' || search) && (
              <button
                onClick={() => {
                  setStatusFilter('all');
                  setSourceFilter('all');
                  setSearch('');
                }}
                className="text-xs text-teal-700 font-semibold hover:underline cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* 2-Column CRM Workspace: Left List + Right Detail Drawer */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Table / List */}
          <div className={`${selectedLead ? 'lg:col-span-7' : 'lg:col-span-12'} space-y-3`}>
            {loading ? (
              <div className="py-12 text-center text-xs text-slate-500 bg-white rounded-2xl border border-slate-200">
                Loading leads database...
              </div>
            ) : leads.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500 bg-white rounded-2xl border border-slate-200">
                No matching leads found.
              </div>
            ) : (
              leads.map((lead) => {
                const isSelected = selectedLead?.id === lead.id;
                return (
                  <div
                    key={lead.id}
                    onClick={() => setSelectedLead(lead)}
                    className={`p-4 rounded-xl border transition cursor-pointer bg-white shadow-2xs ${
                      isSelected
                        ? 'border-teal-600 bg-teal-50/30 ring-1 ring-teal-600'
                        : 'border-slate-200 hover:border-teal-300'
                    }`}
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{lead.patientName}</span>
                        <span className="text-[11px] font-mono text-slate-400">({lead.leadNumber})</span>
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                            lead.status === 'confirmed'
                              ? 'bg-teal-100 text-teal-800'
                              : lead.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : lead.status === 'new_enquiry'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {lead.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2.5 text-xs text-slate-600">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase">Phone</span>
                        <a
                          href={`tel:${lead.phone}`}
                          onClick={(e) => e.stopPropagation()}
                          className="font-semibold text-slate-800 hover:text-teal-700"
                        >
                          {lead.phone}
                        </a>
                      </div>

                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase">Source</span>
                        <span className="font-medium text-slate-800 capitalize">{lead.source.replace(/_/g, ' ')}</span>
                      </div>

                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase">Speciality</span>
                        <span className="font-medium text-slate-800 truncate block">{lead.specialityName || 'General'}</span>
                      </div>

                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase">Assigned To</span>
                        <span className="font-medium text-slate-800">{lead.assignedStaff}</span>
                      </div>
                    </div>

                    {lead.appointmentReference && (
                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-teal-700 font-semibold">
                          Converted: {lead.appointmentReference}
                        </span>
                        <span className="text-slate-400 text-[11px]">
                          {lead.notes.length} internal notes
                        </span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Right Detail Drawer */}
          {selectedLead && (
            <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-5 self-start">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700">Lead File</span>
                  <h3 className="text-base font-bold text-slate-900">{selectedLead.patientName}</h3>
                  <p className="text-xs text-slate-500">{selectedLead.leadNumber} · Source: {selectedLead.source}</p>
                </div>
                <button
                  onClick={() => setSelectedLead(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  ✕
                </button>
              </div>

              {/* Status & Staff Control */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">
                    Pipeline Status
                  </label>
                  <select
                    value={selectedLead.status}
                    onChange={(e) => handleStatusChange(selectedLead.id, e.target.value as LeadStatus)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-800 bg-white"
                  >
                    <option value="new_enquiry">New Enquiry</option>
                    <option value="contacted">Contacted</option>
                    <option value="appointment_requested">Appointment Requested</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="followup_required">Follow-up Required</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="not_converted">Not Converted</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">
                    Assigned Staff
                  </label>
                  <select
                    value={selectedLead.assignedStaff}
                    onChange={(e) => handleStaffAssign(selectedLead.id, e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-800 bg-white"
                  >
                    <option value="Anjali (Reception Lead)">Anjali (Reception Lead)</option>
                    <option value="Sunil (Front Desk)">Sunil (Front Desk)</option>
                    <option value="Dr. Rajesh Sharma">Dr. Rajesh Sharma</option>
                    <option value="Dr. Priya Patel">Dr. Priya Patel</option>
                  </select>
                </div>
              </div>

              {/* Contact Actions */}
              <div className="flex gap-2">
                <a
                  href={`tel:${selectedLead.phone}`}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 min-h-[40px]"
                >
                  <Phone className="w-3.5 h-3.5 text-teal-600" />
                  <span>Call {selectedLead.phone}</span>
                </a>
                <a
                  href={`https://wa.me/${selectedLead.phone.replace(/\D/g, '')}?text=Hi%20${encodeURIComponent(selectedLead.patientName)},%20this%20is%20CarePulse%20Clinic%20reception%20regarding%20your%20enquiry.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-emerald-200 bg-emerald-50 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 min-h-[40px]"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                  <span>WhatsApp</span>
                </a>
              </div>

              {/* Internal Staff Notes */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 mb-2">Internal Staff Activity & Notes</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {selectedLead.notes.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No activity logged yet.</p>
                  ) : (
                    selectedLead.notes.map((note) => (
                      <div key={note.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                        <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                          <span className="font-semibold text-slate-700">{note.author} ({note.authorRole})</span>
                          <span>{new Date(note.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="text-slate-600">{note.content}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* Add Note Form */}
                <form onSubmit={handleAddNote} className="mt-3 flex gap-2">
                  <input
                    type="text"
                    required
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                    placeholder="Log patient call outcome, next step..."
                    className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-teal-600 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={isSubmittingNote}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs cursor-pointer min-h-[36px]"
                  >
                    Save
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Walk-in Lead Modal */}
      {createLeadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Add Walk-in or Phone Lead</h3>
              <button
                onClick={() => setCreateLeadModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateLead} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Patient Full Name *</label>
                <input
                  type="text"
                  required
                  value={newLeadForm.patientName}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, patientName: e.target.value })}
                  placeholder="e.g. Ramesh Chandra"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Phone *</label>
                <input
                  type="tel"
                  required
                  value={newLeadForm.phone}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Source</label>
                <select
                  value={newLeadForm.source}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, source: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-600 focus:outline-none bg-white"
                >
                  <option value="walk_in">Front Desk Walk-in</option>
                  <option value="click_to_call">Inbound Telephone Call</option>
                  <option value="whatsapp">Direct WhatsApp</option>
                  <option value="staff_created">Staff Created</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Initial Enquiry Notes</label>
                <textarea
                  rows={2}
                  value={newLeadForm.note}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, note: e.target.value })}
                  placeholder="Patient asked for consultation on..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-600 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCreateLeadModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 cursor-pointer min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs transition cursor-pointer min-h-[44px]"
                >
                  Create Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
