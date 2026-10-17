import React, { useState } from 'react';
import { Speciality } from '../../types/clinic';
import { HeartPulse, Sparkles, Activity, Baby, Stethoscope, Microscope, ArrowRight, Check } from 'lucide-react';

interface SpecialitiesSectionProps {
  specialities: Speciality[];
  onSelectSpecialityForBooking: (specId: string) => void;
}

export const SpecialitiesSection: React.FC<SpecialitiesSectionProps> = ({
  specialities,
  onSelectSpecialityForBooking,
}) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'clinical' | 'diagnostics'>('all');

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'HeartPulse': return <HeartPulse className="w-5 h-5 text-teal-600" />;
      case 'Sparkles': return <Sparkles className="w-5 h-5 text-teal-600" />;
      case 'Activity': return <Activity className="w-5 h-5 text-teal-600" />;
      case 'Baby': return <Baby className="w-5 h-5 text-teal-600" />;
      case 'Stethoscope': return <Stethoscope className="w-5 h-5 text-teal-600" />;
      case 'Microscope': return <Microscope className="w-5 h-5 text-teal-600" />;
      default: return <Stethoscope className="w-5 h-5 text-teal-600" />;
    }
  };

  const filteredSpecialities = specialities.filter((spec) => {
    if (activeCategory === 'diagnostics') return spec.id === 'spec-diagnostics';
    if (activeCategory === 'clinical') return spec.id !== 'spec-diagnostics';
    return true;
  });

  return (
    <section id="specialities" className="py-14 md:py-20 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-teal-700 uppercase tracking-wider mb-2">
              <span>Clinical Departments & Services</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight" style={{ textWrap: 'balance' }}>
              Comprehensive Outpatient & Diagnostic Care
            </h2>
            <p className="text-sm text-slate-600 mt-2 max-w-2xl">
              From advanced cardiovascular assessments to pediatric immunizations and dermatological therapeutics, our specialist teams ensure accurate diagnosis and personalized treatment.
            </p>
          </div>

          {/* Filter segment tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-white border border-slate-200 rounded-xl shrink-0 self-start md:self-auto">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer min-h-[36px] ${
                activeCategory === 'all' ? 'bg-teal-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Services
            </button>
            <button
              onClick={() => setActiveCategory('clinical')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer min-h-[36px] ${
                activeCategory === 'clinical' ? 'bg-teal-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Doctor OPDs
            </button>
            <button
              onClick={() => setActiveCategory('diagnostics')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer min-h-[36px] ${
                activeCategory === 'diagnostics' ? 'bg-teal-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Diagnostic Lab
            </button>
          </div>
        </div>

        {/* Speciality Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSpecialities.map((spec) => (
            <div
              key={spec.id}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                {/* Header with icon */}
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center">
                    {getIcon(spec.icon)}
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 block uppercase font-medium">Starting from</span>
                    <span className="text-sm font-bold text-slate-900 tabular-nums">₹{spec.startingPrice}</span>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-slate-900 tracking-tight">{spec.name}</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">{spec.shortDescription}</p>

                {/* Common symptoms treated */}
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                    Common Conditions Treated:
                  </span>
                  <div className="space-y-1.5">
                    {spec.commonSymptoms.slice(0, 3).map((sym, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-slate-600">
                        <Check className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                        <span>{sym}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Key Procedures */}
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                    Key Procedures & Diagnostics:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {spec.keyProcedures.slice(0, 3).map((proc, i) => (
                      <span key={i} className="text-[11px] text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md font-medium">
                        {proc}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-6 pt-4 border-t border-slate-100">
                <button
                  onClick={() => onSelectSpecialityForBooking(spec.id)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 font-semibold text-xs transition cursor-pointer min-h-[44px]"
                >
                  <span>Book Consultation in {spec.name.split(' ')[0]}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
