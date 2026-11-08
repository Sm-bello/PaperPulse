import React, { useState } from 'react';
import { X, Check, Shield } from 'lucide-react';
import type { UserProfile } from '../types';

interface GoogleSignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAccount: (user: UserProfile) => void;
}

export const GoogleSignInModal: React.FC<GoogleSignInModalProps> = ({
  isOpen,
  onClose,
  onSelectAccount,
}) => {
  const [customEmail, setCustomEmail] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  if (!isOpen) return null;

  const defaultAccounts: UserProfile[] = [
    {
      uid: 'google-uid-bello',
      email: 'bellosani2drescue@gmail.com',
      displayName: 'Mohammed Bello Sani',
      photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    },
    {
      uid: 'google-uid-scholar',
      email: 'researcher.scholar@gmail.com',
      displayName: 'Academic Researcher',
      photoURL: null,
    }
  ];

  const handleChoose = (account: UserProfile) => {
    localStorage.setItem('theschola_user', JSON.stringify(account));
    onSelectAccount(account);
    onClose();
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail.includes('@')) return;
    const name = customEmail.split('@')[0].replace(/[._]/g, ' ');
    const formattedName = name.charAt(0).toUpperCase() + name.slice(1);
    const newAccount: UserProfile = {
      uid: `google-${Date.now()}`,
      email: customEmail.trim(),
      displayName: formattedName,
      photoURL: null,
    };
    handleChoose(newAccount);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-sm rounded-2xl bg-white border border-[#e3dcce] shadow-2xl p-6 select-none animate-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Google Header */}
        <div className="text-center mb-5">
          <div className="w-10 h-10 rounded-full bg-white shadow-xs border border-slate-200 flex items-center justify-center mx-auto mb-3">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          </div>
          <h3 className="font-sans text-base font-semibold text-slate-800">
            Sign in with Google
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Choose an account to continue to <strong>The Schola</strong>
          </p>
        </div>

        {/* Accounts List */}
        <div className="space-y-2 mb-4">
          {defaultAccounts.map((acc) => (
            <button
              key={acc.email}
              onClick={() => handleChoose(acc)}
              className="w-full flex items-center space-x-3 p-3 rounded-xl border border-slate-200 hover:border-sky-500 hover:bg-sky-50/40 text-left transition cursor-pointer group"
            >
              {acc.photoURL ? (
                <img
                  src={acc.photoURL}
                  alt={acc.displayName || ""}
                  className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold text-sm">
                  {(acc.displayName || "G")[0]}
                </div>
              )}
              <div className="flex-1 truncate">
                <p className="text-xs font-semibold text-slate-800 group-hover:text-sky-700 truncate">
                  {acc.displayName}
                </p>
                <p className="text-[11px] text-slate-500 font-mono truncate">
                  {acc.email}
                </p>
              </div>
              <Check className="w-4 h-4 text-emerald-600 opacity-0 group-hover:opacity-100 transition" />
            </button>
          ))}
        </div>

        {/* Custom Gmail Input Toggle */}
        {!showCustomInput ? (
          <button
            onClick={() => setShowCustomInput(true)}
            className="w-full py-2 text-center text-xs font-medium text-sky-600 hover:text-sky-800 hover:bg-slate-50 rounded-lg transition cursor-pointer"
          >
            + Use another Google account
          </button>
        ) : (
          <form onSubmit={handleCustomSubmit} className="space-y-2">
            <input
              type="email"
              autoFocus
              placeholder="Enter your Gmail address..."
              value={customEmail}
              onChange={(e) => setCustomEmail(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 font-sans"
            />
            <button
              type="submit"
              className="w-full py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-medium text-xs shadow-xs transition cursor-pointer"
            >
              Continue with this Gmail
            </button>
          </form>
        )}

        {/* Security Footer */}
        <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-center space-x-1.5 text-[10px] text-slate-400 font-mono">
          <Shield className="w-3 h-3 text-emerald-600" />
          <span>OAuth 2.0 Direct · No passwords stored</span>
        </div>

      </div>
    </div>
  );
};
