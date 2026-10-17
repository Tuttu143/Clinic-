import React from 'react';
import { Home, Stethoscope, CalendarPlus, CalendarCheck, ShieldCheck } from 'lucide-react';
import { UserRole } from '../../types/clinic';

interface MobileBottomNavProps {
  activeTab: 'website' | 'services' | 'doctors' | 'my-bookings' | 'crm' | 'whatsapp' | 'admin' | 'doctor-view' | 'receptionist-view';
  onSelectTab: (tab: any) => void;
  onOpenBookingModal: () => void;
  bookingCount: number;
  currentRole: UserRole;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onSelectTab,
  onOpenBookingModal,
  bookingCount,
  currentRole,
}) => {
  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg pb-safe"
    >
      <div className="grid grid-cols-5 items-center h-16 px-1">
        {/* 1. Home */}
        <button
          onClick={() => onSelectTab('website')}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] cursor-pointer transition-colors ${
            activeTab === 'website' ? 'text-teal-700 font-semibold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Home className="w-5 h-5 stroke-[2.2]" />
          <span className="text-[10px] tracking-tight mt-1 whitespace-nowrap">Home</span>
        </button>

        {/* 2. Services / Doctors */}
        <button
          onClick={() => onSelectTab('services')}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] cursor-pointer transition-colors ${
            activeTab === 'services' || activeTab === 'doctors' ? 'text-teal-700 font-semibold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Stethoscope className="w-5 h-5 stroke-[2.2]" />
          <span className="text-[10px] tracking-tight mt-1 whitespace-nowrap">Specialities</span>
        </button>

        {/* 3. Center Elevated Book Appointment CTA */}
        <div className="flex flex-col items-center justify-center">
          <button
            onClick={onOpenBookingModal}
            className="flex items-center justify-center w-12 h-12 -mt-4 rounded-full bg-teal-600 text-white shadow-lg shadow-teal-600/30 active:scale-95 transition-transform cursor-pointer border-2 border-white min-h-[44px] min-w-[44px]"
            aria-label="Book Appointment"
          >
            <CalendarPlus className="w-6 h-6" />
          </button>
          <span className="text-[10px] font-semibold text-teal-800 tracking-tight mt-0.5 whitespace-nowrap">Book</span>
        </div>

        {/* 4. My Bookings with badge */}
        <button
          onClick={() => onSelectTab('my-bookings')}
          className={`relative flex flex-col items-center justify-center h-full min-h-[44px] cursor-pointer transition-colors ${
            activeTab === 'my-bookings' ? 'text-teal-700 font-semibold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <div className="relative">
            <CalendarCheck className="w-5 h-5 stroke-[2.2]" />
            {bookingCount > 0 && (
              <span className="absolute -top-1.5 -right-2 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-teal-600 text-[9px] font-bold text-white">
                {bookingCount}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-1 whitespace-nowrap">My Passes</span>
        </button>

        {/* 5. Clinic Portals */}
        <button
          onClick={() => {
            if (currentRole === 'doctor') onSelectTab('doctor-view');
            else if (currentRole === 'receptionist') onSelectTab('receptionist-view');
            else if (currentRole === 'admin' || currentRole === 'superadmin') onSelectTab('admin');
            else onSelectTab('crm');
          }}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] cursor-pointer transition-colors ${
            ['crm', 'admin', 'doctor-view', 'receptionist-view', 'whatsapp'].includes(activeTab)
              ? 'text-teal-700 font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
          <span className="text-[10px] tracking-tight mt-1 whitespace-nowrap">Clinic Staff</span>
        </button>
      </div>
    </nav>
  );
};
