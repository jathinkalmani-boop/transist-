import React, { useState } from 'react';
import { PassengerUser, SpecialPersonCategory, CommuterProfileId } from '../types/transit';
import { TRANSLATIONS } from '../services/i18n';
import { SupportedLanguage } from '../services/speechService';
import {
  ShieldCheck,
  User,
  Accessibility,
  HeartHandshake,
  Eye,
  Bus,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Zap,
} from 'lucide-react';

interface PassengerLoginScreenProps {
  initialUser: PassengerUser;
  language: SupportedLanguage;
  onLoginComplete: (user: PassengerUser) => void;
  onCancel?: () => void;
  isModal?: boolean;
}

export const PassengerLoginScreen: React.FC<PassengerLoginScreenProps> = ({
  initialUser,
  language,
  onLoginComplete,
  onCancel,
  isModal = false,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const [name, setName] = useState(initialUser.name || 'Rahul Sharma');
  const [age, setAge] = useState(initialUser.age || 28);
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>(initialUser.gender || 'Male');
  const [specialPerson, setSpecialPerson] = useState<SpecialPersonCategory>(
    initialUser.specialPerson || 'none'
  );

  const performLogin = (
    userName: string,
    userAge: number,
    userGender: 'Male' | 'Female' | 'Other',
    userSpecial: SpecialPersonCategory
  ) => {
    let profileId: CommuterProfileId = 'default';
    if (userSpecial === 'wheelchair') {
      profileId = 'wheelchair';
    } else if (userSpecial === 'elderly' || userAge >= 60) {
      profileId = 'elderly';
    } else if (userSpecial === 'mobility') {
      profileId = 'elderly';
    }

    const updatedUser: PassengerUser = {
      name: userName.trim() || 'Commuter Passenger',
      age: Number(userAge) || 28,
      gender: userGender,
      specialPerson: userSpecial,
      commuterProfileId: profileId,
      isRegistered: true,
    };

    onLoginComplete(updatedUser);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performLogin(name, age, gender, specialPerson);
  };

  const handleQuickDemoLogin = (profileType: 'regular' | 'female_shakti' | 'senior' | 'wheelchair') => {
    if (profileType === 'female_shakti') {
      performLogin('Priya Sharma', 26, 'Female', 'none');
    } else if (profileType === 'senior') {
      performLogin('Ramanathan Iyer', 68, 'Male', 'elderly');
    } else if (profileType === 'wheelchair') {
      performLogin('Karthik Rao', 32, 'Male', 'wheelchair');
    } else {
      performLogin('Rahul Sharma', 28, 'Male', 'none');
    }
  };

  const specialOptions: {
    id: SpecialPersonCategory;
    label: string;
    description: string;
    icon: React.ReactNode;
    color: string;
  }[] = [
    {
      id: 'none',
      label: t.specialNone || 'Standard Commuter',
      description: 'Standard commuter routing with balanced risk weights.',
      icon: <User className="w-5 h-5 text-emerald-400" />,
      color: 'border-slate-700 hover:border-emerald-500',
    },
    {
      id: 'wheelchair',
      label: t.specialWheelchair || 'Wheelchair User',
      description: 'Strict step-free requirement. Wheelchair bay reserved on bus. Inaccessible routes excluded.',
      icon: <Accessibility className="w-5 h-5 text-emerald-400" />,
      color: 'border-emerald-600 bg-emerald-950/20',
    },
    {
      id: 'elderly',
      label: t.specialElderly || 'Senior Citizen (60+)',
      description: '50% fare concession, guaranteed lower-deck seating priority.',
      icon: <HeartHandshake className="w-5 h-5 text-amber-400" />,
      color: 'border-amber-600 bg-amber-950/20',
    },
    {
      id: 'mobility',
      label: t.specialMobility || 'Reduced Mobility',
      description: 'Low-strain routes with minimum walking and low-floor bus boarding.',
      icon: <Accessibility className="w-5 h-5 text-cyan-400" />,
      color: 'border-cyan-600 bg-cyan-950/20',
    },
    {
      id: 'vision',
      label: t.specialVision || 'Visually Impaired',
      description: 'Tactile paving verification, audible crosswalks, and auto-voice guidance.',
      icon: <Eye className="w-5 h-5 text-indigo-400" />,
      color: 'border-indigo-600 bg-indigo-950/20',
    },
  ];

  return (
    <div
      className={
        isModal
          ? 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xs'
          : 'min-h-[85vh] flex items-center justify-center py-6 px-4'
      }
    >
      <div className="bg-slate-900 border border-emerald-800/80 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl shadow-emerald-950/50 flex flex-col">
        {/* RedBus-Green Header Banner */}
        <div className="bg-linear-to-r from-emerald-800 via-emerald-700 to-teal-800 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-xs border border-white/20 flex items-center justify-center shadow-inner">
              <Bus className="w-7 h-7 text-emerald-200 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold tracking-tight font-mono">
                  TRANSITSHIELD
                </h2>
                <span className="text-[10px] font-bold uppercase bg-white/20 px-2 py-0.5 rounded-full tracking-wider">
                  Green Edition
                </span>
              </div>
              <p className="text-xs text-emerald-100 font-medium">
                Commuter Onboarding &amp; Accessibility Profile
              </p>
            </div>
          </div>

          {isModal && onCancel && (
            <button
              onClick={onCancel}
              className="text-white/80 hover:text-white text-xs px-2.5 py-1 rounded-lg bg-black/20 hover:bg-black/30 transition"
            >
              Close
            </button>
          )}
        </div>

        {/* Quick Demo 1-Click Persona Shortcuts */}
        <div className="bg-slate-950 px-5 py-3 border-b border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Instant 1-Click Login (Evaluator Shortcuts)</span>
            </span>
            <span className="text-[10px] text-slate-500">Pick any persona</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs">
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('regular')}
              className="px-2 py-1.5 rounded-lg bg-slate-900 hover:bg-emerald-900/60 border border-slate-700 text-slate-200 hover:text-white font-medium text-[11px] transition text-center"
            >
              👤 Standard (Male, 28)
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('female_shakti')}
              className="px-2 py-1.5 rounded-lg bg-emerald-950/70 hover:bg-emerald-800/80 border border-emerald-700/60 text-emerald-200 hover:text-white font-medium text-[11px] transition text-center"
              title="Eligible for Shakti Free Fare Scheme"
            >
              👩 Shakti Pass (Female)
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('senior')}
              className="px-2 py-1.5 rounded-lg bg-amber-950/70 hover:bg-amber-800/80 border border-amber-700/60 text-amber-200 hover:text-white font-medium text-[11px] transition text-center"
              title="50% Senior Citizen Concession"
            >
              👴 Senior (68 yrs)
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('wheelchair')}
              className="px-2 py-1.5 rounded-lg bg-cyan-950/70 hover:bg-cyan-800/80 border border-cyan-700/60 text-cyan-200 hover:text-white font-medium text-[11px] transition text-center"
              title="Step-Free Hard Filter"
            >
              ♿ Wheelchair User
            </button>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 bg-slate-900">
          {/* Name & Age Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-emerald-400" />
                <span>Passenger Full Name</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name (e.g. Rahul Sharma)"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-200">
                Age (Years)
              </label>
              <input
                type="number"
                min={5}
                max={120}
                value={age}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setAge(val || 18);
                  if (val >= 60 && specialPerson === 'none') {
                    setSpecialPerson('elderly');
                  }
                }}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              />
            </div>
          </div>

          {/* Gender Selector */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-200">
                Gender
              </label>
              <span className="text-[11px] text-emerald-400">
                {gender === 'Female' ? '✓ Eligible for Karnataka Shakti Free Travel Scheme' : 'Standard Fare Scheme'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(['Male', 'Female', 'Other'] as const).map(g => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGender(g)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition ${
                    gender === g
                      ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-900/40'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {g === 'Male' ? 'Male' : g === 'Female' ? 'Female (Shakti Pass)' : 'Other'}
                </button>
              ))}
            </div>
          </div>

          {/* Special Person / Accessibility Needs */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Special Person / Accessibility Need</span>
              </label>
              <span className="text-[11px] text-slate-400 font-mono">Select matching category</span>
            </div>

            <div className="grid grid-cols-1 gap-2 max-h-52 overflow-y-auto pr-1">
              {specialOptions.map(opt => {
                const isSelected = specialPerson === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSpecialPerson(opt.id)}
                    className={`p-2.5 rounded-xl border text-left flex items-start gap-3 transition ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-950/40 ring-1 ring-emerald-500/50 text-white shadow-sm'
                        : 'border-slate-800 bg-slate-950/80 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="p-1 rounded-lg bg-slate-900 border border-slate-800 shrink-0 mt-0.5">
                      {opt.icon}
                    </div>
                    <div className="space-y-0.5 min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-white">{opt.label}</span>
                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 leading-tight">
                        {opt.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Benefit Notice */}
          <div className="bg-emerald-950/50 border border-emerald-800/60 p-3 rounded-xl text-[11px] text-emerald-200/90 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Your profile automatically configures <strong>Journey Risk Weights</strong>, step-free barrier exclusions, and live relevant fares for your journey.
            </p>
          </div>

          {/* Submit Action & Instant Guest Access */}
          <div className="flex flex-col sm:flex-row gap-2 pt-1">
            <button
              type="submit"
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition cursor-pointer"
            >
              <span>Continue to TransitShield Search</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('regular')}
              className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 font-semibold text-xs transition"
            >
              Skip / Continue as Guest
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
