import React from 'react';
import { User } from 'firebase/auth';
import { 
  Sparkles, 
  LogOut, 
  ShieldCheck, 
  CloudCheck, 
  Info, 
  BookOpen
} from 'lucide-react';

interface NavbarProps {
  user: User | null;
  onSignOut: () => void;
  onOpenSecurityModal: () => void;
  isSaving?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onSignOut,
  onOpenSecurityModal,
  isSaving = false,
}) => {
  return (
    <header className="border-b border-stone-200 bg-stone-50/90 backdrop-blur-sm sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-stone-900 text-stone-100 flex items-center justify-center shadow-xs">
            <BookOpen className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-stone-900 text-base tracking-tight">
                Reflective AI Journal
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-900 border border-amber-200/60">
                <Sparkles className="w-3 h-3 mr-1 text-amber-600" /> Gemini 3.6 Flash
              </span>
            </div>
            <p className="text-xs text-stone-500 hidden sm:block">
              Private reflection space backed by user-isolated Firestore
            </p>
          </div>
        </div>

        {/* User Actions & Status */}
        {user && (
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Sync status */}
            <div className="hidden md:flex items-center gap-1.5 text-xs text-stone-600 bg-stone-100 px-2.5 py-1 rounded-full border border-stone-200">
              {isSaving ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  <span>Saving to Firestore...</span>
                </>
              ) : (
                <>
                  <CloudCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Firestore Synced</span>
                </>
              )}
            </div>

            {/* Security transparency trigger */}
            <button
              id="security-info-button"
              type="button"
              onClick={onOpenSecurityModal}
              className="hidden sm:inline-flex items-center gap-1.5 text-xs text-stone-700 bg-white hover:bg-stone-100 px-3 py-1.5 rounded-lg border border-stone-300 transition-colors shadow-2xs cursor-pointer"
              title="View Security Rules & Architecture"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Security & Isolation</span>
              <Info className="w-3 h-3 text-stone-400" />
            </button>

            {/* User chip */}
            <div className="flex items-center gap-2.5 pl-2 sm:border-l sm:border-stone-200">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="w-8 h-8 rounded-full border border-stone-300 object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-stone-800 text-stone-100 text-xs font-semibold flex items-center justify-center">
                  {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                </div>
              )}
              <div className="hidden lg:block text-left">
                <p className="text-xs font-medium text-stone-900 leading-tight truncate max-w-[140px]">
                  {user.displayName || 'User'}
                </p>
                <p className="text-[11px] text-stone-500 truncate max-w-[140px]">
                  {user.email}
                </p>
              </div>
            </div>

            {/* Sign Out Button */}
            <button
              id="sign-out-button"
              type="button"
              onClick={onSignOut}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200/80 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
