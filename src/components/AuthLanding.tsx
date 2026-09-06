import React from 'react';
import { 
  Sparkles, 
  ShieldCheck, 
  Lock, 
  Layers, 
  History, 
  BrainCircuit, 
  ArrowRight,
  Database
} from 'lucide-react';

interface AuthLandingProps {
  onSignIn: () => void;
  isLoading: boolean;
  error: string | null;
}

export const AuthLanding: React.FC<AuthLandingProps> = ({
  onSignIn,
  isLoading,
  error,
}) => {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-12 bg-gradient-to-b from-stone-50 via-stone-100/60 to-stone-50">
      <div className="max-w-4xl w-full mx-auto space-y-10 text-center">
        {/* Intro Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-medium bg-stone-200/80 text-stone-800 border border-stone-300 shadow-2xs">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
          <span>Zero-Trust User Data Isolation • Cloud Firestore</span>
        </div>

        {/* Hero Copy */}
        <div className="space-y-4 max-w-2xl mx-auto">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-stone-900 leading-tight">
            Your Private Space for Thought & Gemini Reflection
          </h1>
          <p className="text-base sm:text-lg text-stone-600 leading-relaxed">
            Record multi-turn journal reflections, brainstorm bold ideas, and synthesize clarity with Gemini 3.6 Flash. Every entry is isolated to your Google account with strict database access rules.
          </p>
        </div>

        {/* Primary Auth Action Card */}
        <div className="max-w-md mx-auto p-6 sm:p-8 bg-white rounded-2xl shadow-sm border border-stone-200/80 text-left space-y-6">
          <div className="space-y-1 text-center">
            <h2 className="text-xl font-semibold text-stone-900">
              Sign In to Your Personal Journal
            </h2>
            <p className="text-xs text-stone-500">
              Federated Google Identity — no passwords handled or stored
            </p>
          </div>

          {error && (
            <div 
              id="auth-error-banner"
              className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs space-y-1"
              role="alert"
            >
              <p className="font-semibold">Authentication Error</p>
              <p className="break-words">{error}</p>
            </div>
          )}

          <button
            id="google-signin-button"
            type="button"
            onClick={onSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl border border-stone-300 bg-stone-900 hover:bg-stone-800 text-stone-50 font-medium text-sm transition-all shadow-xs hover:shadow-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed group"
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-stone-100 border-t-transparent rounded-full animate-spin" />
                <span>Connecting to Google Sign-In...</span>
              </>
            ) : (
              <>
                {/* Google Icon SVG */}
                <svg className="w-4 h-4" viewBox="0 0 24 24">
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
                <span>Continue with Google</span>
                <ArrowRight className="w-4 h-4 text-stone-400 group-hover:translate-x-0.5 transition-transform" />
              </>
            )}
          </button>

          <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
            <span className="inline-flex items-center gap-1">
              <Lock className="w-3 h-3 text-emerald-600" /> Owner-isolated paths
            </span>
            <span className="inline-flex items-center gap-1">
              <Database className="w-3 h-3 text-amber-600" /> Firestore Rules enforced
            </span>
          </div>
        </div>

        {/* Feature Overview Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 max-w-4xl mx-auto text-left">
          <div className="p-5 rounded-xl bg-white/70 border border-stone-200/70 shadow-2xs space-y-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
              <BrainCircuit className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-stone-900 text-sm">
              Conversational Reflection
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Explore your thoughts with Gemini 3.6 Flash. Multi-turn dialogues deepen your perspective and extract underlying themes.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-white/70 border border-stone-200/70 shadow-2xs space-y-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-stone-900 text-sm">
              Strict User Isolation
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Every document is scoped under <code className="bg-stone-100 px-1 py-0.5 rounded text-[11px]">/users/&#123;uid&#125;/interactions</code> with row-level security ensuring zero cross-tenant access.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-white/70 border border-stone-200/70 shadow-2xs space-y-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-800 flex items-center justify-center">
              <History className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-stone-900 text-sm">
              Chronological History
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Search, review, and revisit past reflections anytime. Every thought, brainstorming session, and synthesis is saved automatically.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
