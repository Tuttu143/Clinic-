import React from 'react';
import { Doctor } from '../../types/clinic';
import { Star, Clock, Calendar, Languages, MapPin, Award } from 'lucide-react';

interface DoctorsSectionProps {
  doctors: Doctor[];
  onBookDoctor: (doctorId: string) => void;
}

export const DoctorsSection: React.FC<DoctorsSectionProps> = ({ doctors, onBookDoctor }) => {
  return (
    <section id="doctors" className="py-14 md:py-20 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="mb-10 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-teal-700 uppercase tracking-wider mb-2">
            <span>Specialist Medical Faculty</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight" style={{ textWrap: 'balance' }}>
            Consult Leading Specialists in Bengaluru
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Every specialist at CarePulse brings over a decade of clinical practice from premier medical institutions with verified qualifications and compassionate bedside manner.
          </p>
        </div>

        {/* Doctor Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doc) => (
            <div
              key={doc.id}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                {/* Doctor Avatar & Badges */}
                <div className="flex items-start gap-4 mb-4">
                  <div className={`w-14 h-14 rounded-2xl ${doc.avatarColor} text-white font-bold text-lg flex items-center justify-center shadow-xs shrink-0`}>
                    {doc.avatarInitials}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{doc.name}</h3>
                    <p className="text-xs font-semibold text-teal-700">{doc.specialityName}</p>
                    <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span className="font-semibold text-slate-800">{doc.rating}</span>
                      <span>({doc.reviewCount} reviews)</span>
                      <span>·</span>
                      <span>{doc.experienceYears}+ yrs</span>
                    </div>
                  </div>
                </div>

                {/* Qualifications & Institutions */}
                <div className="p-2.5 rounded-xl bg-slate-50 text-[11px] text-slate-700 mb-3 border border-slate-100 flex items-start gap-2">
                  <Award className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <span>{doc.qualifications}</span>
                </div>

                {/* Doctor Bio */}
                <p className="text-xs text-slate-600 leading-relaxed mb-4 line-clamp-3">
                  {doc.bio}
                </p>

                {/* Practical Details */}
                <div className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <Calendar className="w-3.5 h-3.5 text-teal-600" />
                      OPD Days:
                    </span>
                    <span className="font-medium text-slate-800">{doc.availableDays.join(', ')}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <Clock className="w-3.5 h-3.5 text-teal-600" />
                      Shift Hours:
                    </span>
                    <span className="font-medium text-slate-800">{doc.shiftStart} – {doc.shiftEnd}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <Languages className="w-3.5 h-3.5 text-teal-600" />
                      Languages:
                    </span>
                    <span className="font-medium text-slate-800">{doc.languages.join(', ')}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-teal-600" />
                      Consultation Suite:
                    </span>
                    <span className="font-medium text-slate-800">{doc.roomNumber}</span>
                  </div>
                </div>
              </div>

              {/* Consultation Fee & Booking CTA */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
                <div>
                  <span className="text-[11px] text-slate-400 block uppercase font-medium">Consultation Fee</span>
                  <span className="text-base font-bold text-slate-900 tabular-nums">₹{doc.consultationFee}</span>
                </div>
                <button
                  onClick={() => onBookDoctor(doc.id)}
                  className="py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs transition cursor-pointer min-h-[44px]"
                >
                  Book with {doc.name.split(' ')[1]}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
