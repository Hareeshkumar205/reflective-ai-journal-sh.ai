import React from 'react';
import { 
  X, 
  ShieldCheck, 
  Lock, 
  Key, 
  Database, 
  Cpu, 
  CheckCircle2 
} from 'lucide-react';

interface SecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
}

export const SecurityModal: React.FC<SecurityModalProps> = ({
  isOpen,
  onClose,
  userId,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
      <div 
        id="security-modal-dialog"
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-xl border border-stone-200 overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-stone-900 text-sm">
                Security Architecture & Privacy Verification
              </h3>
              <p className="text-xs text-stone-500">
                Zero-Trust isolation & OWASP Top 10 compliance
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-stone-200 text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-stone-600">
          {/* Active User Identification */}
          {userId && (
            <div className="p-3 bg-stone-100 rounded-xl border border-stone-200 flex items-center justify-between">
              <span className="font-medium text-stone-700">Authenticated UID:</span>
              <code className="bg-white px-2 py-0.5 rounded text-stone-900 font-mono text-[11px] border border-stone-200">
                {userId}
              </code>
            </div>
          )}

          {/* Core Guarantees */}
          <div className="space-y-3">
            <h4 className="font-semibold text-stone-900 text-sm flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-600" />
              1. Cloud Firestore User Data Isolation
            </h4>
            <p className="leading-relaxed">
              Firestore rules prevent any user from reading, listing, or modifying documents outside their strictly bound namespace.
            </p>
            <div className="bg-stone-900 text-stone-200 p-3.5 rounded-xl font-mono text-[11px] leading-relaxed overflow-x-auto">
              <pre>{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/interactions/{interactionId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}`}</pre>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-stone-900 text-sm flex items-center gap-2">
              <Key className="w-4 h-4 text-emerald-600" />
              2. Zero Client-Side Secret Exposure
            </h4>
            <p className="leading-relaxed">
              The <code className="bg-stone-100 px-1 py-0.5 rounded text-stone-800">GEMINI_API_KEY</code> is loaded strictly in the server environment (<code className="bg-stone-100 px-1 py-0.5 rounded text-stone-800">server.ts</code>) via Google Cloud Secret Manager or secure environment variables. It is never transmitted to or bundled in the browser.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-stone-900 text-sm flex items-center gap-2">
              <Cpu className="w-4 h-4 text-indigo-600" />
              3. Resilient Fallback Model Ladder
            </h4>
            <p className="leading-relaxed">
              API requests dynamically fail over across models if quota or capacity spikes occur:
            </p>
            <ul className="grid grid-cols-2 gap-2 text-[11px]">
              <li className="p-2 rounded-lg bg-stone-50 border border-stone-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>1. gemini-3.6-flash (Primary)</span>
              </li>
              <li className="p-2 rounded-lg bg-stone-50 border border-stone-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>2. gemini-3.1-flash-lite (Fast Failover)</span>
              </li>
              <li className="p-2 rounded-lg bg-stone-50 border border-stone-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>3. gemini-flash-latest (Dynamic Alias)</span>
              </li>
              <li className="p-2 rounded-lg bg-stone-50 border border-stone-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>4. gemini-3.7-flash (Deep Reasoning)</span>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-stone-900 text-sm flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-600" />
              4. Defensive Payload Ingestion & Undefined-Stripping
            </h4>
            <p className="leading-relaxed">
              All user payloads are checked with strict null-safe boundary destructuring and stripped of <code className="bg-stone-100 px-1 py-0.5 rounded text-stone-800">undefined</code> properties before entering Firestore, completely preventing driver crashes and transaction failures.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-stone-200 bg-stone-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-stone-50 rounded-xl text-xs font-medium transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
