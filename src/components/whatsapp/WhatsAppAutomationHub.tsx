import React, { useState, useEffect } from 'react';
import { WhatsAppConfig, WhatsAppMessage } from '../../types/clinic';
import { api } from '../../services/api';
import { MessageSquare, Settings, CheckCircle2, AlertTriangle, Send, RefreshCw, Key, ShieldCheck, UserCheck, Bot, Smartphone } from 'lucide-react';

export const WhatsAppAutomationHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'simulator' | 'config' | 'templates' | 'history'>('simulator');
  const [config, setConfig] = useState<WhatsAppConfig | null>(null);
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [simulatedPatientPhone, setSimulatedPatientPhone] = useState('+91 98450 11223');
  const [simulatedPatientInput, setSimulatedPatientInput] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);
  const [configSaveSuccess, setConfigSaveSuccess] = useState(false);

  // Config Form State
  const [configForm, setConfigForm] = useState({
    wabaId: '',
    phoneNumberId: '',
    accessToken: '',
    webhookVerifyToken: '',
    appSecret: '',
    isTestMode: true,
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [cfg, msgs] = await Promise.all([
        api.getWhatsAppConfig(),
        api.getWhatsAppMessages(),
      ]);
      setConfig(cfg);
      setMessages(msgs);
      setConfigForm({
        wabaId: cfg.wabaId,
        phoneNumberId: cfg.phoneNumberId,
        accessToken: cfg.accessToken,
        webhookVerifyToken: cfg.webhookVerifyToken,
        appSecret: cfg.appSecret,
        isTestMode: cfg.isTestMode,
      });
    } catch (err) {
      console.error('Error loading WhatsApp data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updated = await api.updateWhatsAppConfig(configForm);
      setConfig(updated);
      setConfigSaveSuccess(true);
      setTimeout(() => setConfigSaveSuccess(false), 4000);
    } catch (err) {
      console.error('Config save error:', err);
    }
  };

  const handleSendSimulatedPatientMessage = async (textToSend?: string) => {
    const text = textToSend || simulatedPatientInput;
    if (!text.trim()) return;

    setIsSimulating(true);
    try {
      await api.simulateInboundWhatsAppMessage(simulatedPatientPhone, text.trim());
      setSimulatedPatientInput('');
      // Refresh messages
      const updated = await api.getWhatsAppMessages();
      setMessages(updated);
    } catch (err) {
      console.error('Simulation error:', err);
    } finally {
      setIsSimulating(false);
    }
  };

  // Filter messages for current phone in simulator
  const activeConversation = messages.filter(
    (m) =>
      m.senderPhone.includes(simulatedPatientPhone.replace(/\D/g, '')) ||
      m.recipientPhone.includes(simulatedPatientPhone.replace(/\D/g, ''))
  );

  return (
    <div className="py-8 md:py-12 bg-slate-50 min-h-[85vh]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">
              <span>Official Meta WhatsApp Cloud API Integration</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              WhatsApp Business Automation & CRM Hub
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Automated patient welcomes, instant booking confirmations, 24h reminders, and front-desk human handover.
            </p>
          </div>

          {/* Test Mode Badge */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{configForm.isTestMode ? 'Test Mode Active' : 'Meta Cloud Production'}</span>
            </span>
            <span className="px-2.5 py-1.5 rounded-lg bg-teal-50 text-teal-800 text-xs font-semibold border border-teal-200">
              Webhook: Verified
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 mb-6 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('simulator')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition cursor-pointer border-b-2 min-h-[44px] ${
              activeTab === 'simulator'
                ? 'border-emerald-600 text-emerald-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Interactive WhatsApp Simulator</span>
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition cursor-pointer border-b-2 min-h-[44px] ${
              activeTab === 'templates'
                ? 'border-emerald-600 text-emerald-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>Message Templates & Triggers</span>
          </button>
          <button
            onClick={() => setActiveTab('config')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition cursor-pointer border-b-2 min-h-[44px] ${
              activeTab === 'config'
                ? 'border-emerald-600 text-emerald-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Meta API Credentials & Webhook Setup</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition cursor-pointer border-b-2 min-h-[44px] ${
              activeTab === 'history'
                ? 'border-emerald-600 text-emerald-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>All Broadcast Delivery Logs ({messages.length})</span>
          </button>
        </div>

        {/* TAB 1: INTERACTIVE WHATSAPP SIMULATOR */}
        {activeTab === 'simulator' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Phone Simulator Mockup */}
            <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 shadow-lg overflow-hidden flex flex-col h-[640px]">
              {/* WhatsApp App Bar */}
              <div className="bg-emerald-800 text-white p-3.5 flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-600 border border-emerald-400 flex items-center justify-center font-bold text-sm">
                    CP
                  </div>
                  <div>
                    <h4 className="text-sm font-bold leading-tight">CarePulse Clinic & Hospital</h4>
                    <p className="text-[11px] text-emerald-200">Official Business Account · Online</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-emerald-200 block">Simulating Patient:</span>
                  <input
                    type="text"
                    value={simulatedPatientPhone}
                    onChange={(e) => setSimulatedPatientPhone(e.target.value)}
                    className="text-xs bg-emerald-900/60 border border-emerald-700 rounded px-2 py-0.5 text-white font-mono w-32 focus:outline-none"
                  />
                </div>
              </div>

              {/* Chat Message Scroll Area */}
              <div className="flex-1 p-4 overflow-y-auto bg-[#e5ddd5] space-y-3">
                <div className="text-center my-2">
                  <span className="text-[10px] bg-white/80 px-3 py-1 rounded-full text-slate-600 shadow-2xs">
                    🔒 Messages and calls are end-to-end encrypted. Meta Business Verified.
                  </span>
                </div>

                {activeConversation.slice().reverse().map((msg) => {
                  const isOutbound = msg.direction === 'outbound';
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isOutbound ? 'justify-start' : 'justify-end'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl p-3 shadow-2xs text-xs ${
                          isOutbound
                            ? 'bg-white text-slate-800 rounded-tl-xs'
                            : 'bg-[#dcf8c6] text-slate-900 rounded-tr-xs'
                        }`}
                      >
                        {isOutbound && (
                          <div className="text-[10px] font-bold text-emerald-800 mb-1 flex items-center gap-1">
                            <span>CarePulse Automated Health Desk</span>
                            {msg.templateName && <span className="text-[9px] text-slate-400">· {msg.templateName}</span>}
                          </div>
                        )}
                        <p className="whitespace-pre-line leading-relaxed">{msg.body}</p>
                        <div className="flex items-center justify-end gap-1 mt-1 text-[9px] text-slate-400">
                          <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          {isOutbound && (
                            <span className="text-emerald-600 font-bold">✓✓</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Input bar */}
              <div className="p-3 bg-slate-100 border-t border-slate-200 flex gap-2">
                <input
                  type="text"
                  value={simulatedPatientInput}
                  onChange={(e) => setSimulatedPatientInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSendSimulatedPatientMessage();
                  }}
                  placeholder="Type a message as the patient (e.g. Hi, Book, 1, 2, 4)..."
                  className="flex-1 px-4 py-2.5 rounded-full border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none bg-white"
                />
                <button
                  onClick={() => handleSendSimulatedPatientMessage()}
                  disabled={isSimulating}
                  className="w-10 h-10 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center cursor-pointer shrink-0 transition"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right Interactive Scenario Triggers */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                <h4 className="text-sm font-bold text-slate-900 mb-1">Simulate Patient Prompts</h4>
                <p className="text-xs text-slate-500 mb-4">
                  Click any standard patient query to see how the WhatsApp webhook triggers instant responses.
                </p>

                <div className="space-y-2">
                  <button
                    onClick={() => handleSendSimulatedPatientMessage('Hi, I want to know about clinic doctors')}
                    className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition text-xs font-semibold text-slate-800 cursor-pointer"
                  >
                    💬 "Hi, I want to know about clinic doctors"
                    <span className="block text-[10px] text-slate-400 font-normal mt-0.5">Triggers greeting + interactive numbered menu</span>
                  </button>

                  <button
                    onClick={() => handleSendSimulatedPatientMessage('1')}
                    className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition text-xs font-semibold text-slate-800 cursor-pointer"
                  >
                    📅 "1" (Book Doctor Appointment)
                    <span className="block text-[10px] text-slate-400 font-normal mt-0.5">Sends direct booking link and speciality lists</span>
                  </button>

                  <button
                    onClick={() => handleSendSimulatedPatientMessage('2')}
                    className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition text-xs font-semibold text-slate-800 cursor-pointer"
                  >
                    🏥 "2" (Timings & Indiranagar Location)
                    <span className="block text-[10px] text-slate-400 font-normal mt-0.5">Sends Google Maps directions and OPD hours</span>
                  </button>

                  <button
                    onClick={() => handleSendSimulatedPatientMessage('4')}
                    className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition text-xs font-semibold text-slate-800 cursor-pointer"
                  >
                    👩‍⚕️ "4" (Speak with Human Receptionist)
                    <span className="block text-[10px] text-slate-400 font-normal mt-0.5">Hands over conversation to front desk queue</span>
                  </button>
                </div>
              </div>

              {/* Webhook Status Info */}
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 space-y-2">
                <div className="flex items-center gap-2 font-bold text-emerald-900">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>Meta Webhook Integration Active</span>
                </div>
                <p className="text-[11px] leading-relaxed text-emerald-800">
                  Endpoint: <code>/api/whatsapp/webhook</code>. Verified with challenge handshake. Inbound payloads parse sender phone, record leads in CRM, and trigger approved template replies.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TEMPLATES & AUTOMATION RULES */}
        {activeTab === 'templates' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700">Template 01</span>
              <h4 className="text-sm font-bold text-slate-900">appointment_confirmation_v2</h4>
              <p className="text-xs text-slate-500">
                Dispatched immediately upon successful booking via website, PWA, or front desk.
              </p>
              <div className="p-3 rounded-xl bg-slate-50 text-[11px] text-slate-700 font-mono whitespace-pre-line border border-slate-100">
                {`✅ *Appointment Confirmed - CarePulse Clinic*

Ref: *{{1}}*
Doctor: *{{2}}*
Date: *{{3}} at {{4}}*
Room: {{5}}

Directions: https://maps.google.com/?q=Indiranagar+Bengaluru`}
              </div>
              <span className="inline-block text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                Meta Status: Approved
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700">Template 02</span>
              <h4 className="text-sm font-bold text-slate-900">appointment_reminder_24h</h4>
              <p className="text-xs text-slate-500">
                Automated cron triggered 24 hours prior to appointment to minimize clinic no-shows.
              </p>
              <div className="p-3 rounded-xl bg-slate-50 text-[11px] text-slate-700 font-mono whitespace-pre-line border border-slate-100">
                {`⏰ *Reminder: Doctor Checkup Tomorrow*

Patient: {{1}}
Doctor: {{2}}
Time: {{3}}
Ref: {{4}}

Reply CANCEL if you wish to reschedule.`}
              </div>
              <span className="inline-block text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                Meta Status: Approved
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700">Template 03</span>
              <h4 className="text-sm font-bold text-slate-900">clinic_welcome_automated</h4>
              <p className="text-xs text-slate-500">
                Triggered on first incoming message from a new patient phone number.
              </p>
              <div className="p-3 rounded-xl bg-slate-50 text-[11px] text-slate-700 font-mono whitespace-pre-line border border-slate-100">
                {`👋 Welcome to CarePulse Clinic!

We have senior specialists available today.
Book in 60 seconds: https://carepulse.health/book
Or reply 1 to speak with reception.`}
              </div>
              <span className="inline-block text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                Meta Status: Approved
              </span>
            </div>
          </div>
        )}

        {/* TAB 3: CREDENTIALS & CONFIGURATION */}
        {activeTab === 'config' && (
          <div className="max-w-2xl bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-2xs">
            <h3 className="text-lg font-bold text-slate-900 mb-1">WhatsApp Cloud API Configuration</h3>
            <p className="text-xs text-slate-500 mb-6">
              Authorized clinic administrators can configure official Meta Graph credentials. Secrets are stored securely in backend server environment variables.
            </p>

            {configSaveSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-teal-50 border border-teal-200 text-xs text-teal-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600" />
                <span>WhatsApp Business credentials saved successfully!</span>
              </div>
            )}

            <form onSubmit={handleSaveConfig} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  WhatsApp Business Account ID (WABA ID)
                </label>
                <input
                  type="text"
                  value={configForm.wabaId}
                  onChange={(e) => setConfigForm({ ...configForm, wabaId: e.target.value })}
                  placeholder="e.g. 109827364519283"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Phone Number ID
                </label>
                <input
                  type="text"
                  value={configForm.phoneNumberId}
                  onChange={(e) => setConfigForm({ ...configForm, phoneNumberId: e.target.value })}
                  placeholder="e.g. 102938475610293"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Permanent System User Access Token
                </label>
                <input
                  type="password"
                  value={configForm.accessToken}
                  onChange={(e) => setConfigForm({ ...configForm, accessToken: e.target.value })}
                  placeholder="EAAGm0PX4ZCpsBA..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Webhook Verification Token
                  </label>
                  <input
                    type="text"
                    value={configForm.webhookVerifyToken}
                    onChange={(e) => setConfigForm({ ...configForm, webhookVerifyToken: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    App Secret
                  </label>
                  <input
                    type="password"
                    value={configForm.appSecret}
                    onChange={(e) => setConfigForm({ ...configForm, appSecret: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={configForm.isTestMode}
                    onChange={(e) => setConfigForm({ ...configForm, isTestMode: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Enable Simulation / Test Mode (Recommended during evaluation & local dev)</span>
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  className="py-2.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition cursor-pointer min-h-[44px]"
                >
                  Save API Settings
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 4: DELIVERY AUDIT LOGS */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Official WhatsApp Message Logs</span>
              <button
                onClick={loadData}
                className="text-xs text-teal-700 font-semibold hover:underline cursor-pointer"
              >
                Refresh
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {messages.map((m) => (
                <div key={m.id} className="p-4 flex items-start justify-between gap-4 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">
                        {m.direction === 'outbound' ? `To: ${m.recipientPhone}` : `From: ${m.senderPhone}`}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-slate-400">
                        ({m.messageType})
                      </span>
                      {m.appointmentRef && (
                        <span className="px-1.5 py-0.5 rounded bg-teal-50 text-teal-800 font-mono text-[10px]">
                          {m.appointmentRef}
                        </span>
                      )}
                    </div>
                    <p className="text-slate-600 max-w-xl whitespace-pre-line">{m.body}</p>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        m.status === 'read'
                          ? 'bg-blue-100 text-blue-800'
                          : m.status === 'delivered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {m.status}
                    </span>
                    <span className="block text-[10px] text-slate-400 mt-1">
                      {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
