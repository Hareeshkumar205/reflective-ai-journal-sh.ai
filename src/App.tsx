import { useState, useEffect, useCallback } from 'react';
import { User } from 'firebase/auth';
import { 
  auth, 
  signInWithGoogle, 
  signOutUser, 
  onAuthStateChanged 
} from './firebase';
import { JournalEntry, ReflectionMode, ChatMessage } from './types';
import { 
  subscribeToUserInteractions, 
  saveUserInteraction, 
  deleteUserInteraction 
} from './services/firestoreService';
import { requestGeminiReflection } from './services/aiService';
import { Navbar } from './components/Navbar';
import { AuthLanding } from './components/AuthLanding';
import { HistorySidebar } from './components/HistorySidebar';
import { JournalEditor } from './components/JournalEditor';
import { SecurityModal } from './components/SecurityModal';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [entriesLoading, setEntriesLoading] = useState(false);
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Monitor Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      if (!currentUser) {
        setEntries([]);
        setSelectedEntryId(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Subscribe to user-isolated Firestore interactions
  useEffect(() => {
    if (!user) {
      setEntries([]);
      return;
    }

    setEntriesLoading(true);

    const unsubscribe = subscribeToUserInteractions(
      user.uid,
      (fetchedEntries) => {
        setEntries(fetchedEntries);
        setEntriesLoading(false);
      },
      (error) => {
        console.error('Failed to subscribe to entries:', error);
        setEntriesLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user?.uid]);

  // Handle Google Sign-In
  const handleSignIn = async () => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      await signInWithGoogle();
    } catch (err: unknown) {
      console.error('Sign-in failed:', err);
      const code = (err as { code?: string })?.code;
      if (code === 'auth/popup-closed-by-user') {
        setAuthError('Sign-in popup was closed before completing authentication.');
      } else if (code === 'auth/cancelled-popup-request') {
        setAuthError('Another sign-in request was in progress.');
      } else {
        setAuthError((err as Error)?.message || 'Failed to sign in with Google.');
      }
    } finally {
      setAuthLoading(false);
    }
  };

  // Handle Sign-Out
  const handleSignOut = async () => {
    try {
      await signOutUser();
      setSelectedEntryId(null);
      setEntries([]);
    } catch (err) {
      console.error('Sign-out error:', err);
    }
  };

  // Select an entry to edit/view
  const handleSelectEntry = (entry: JournalEntry) => {
    setSelectedEntryId(entry.id);
    setMobileSidebarOpen(false);
  };

  // Start a fresh reflection session
  const handleNewEntry = () => {
    setSelectedEntryId(null);
    setMobileSidebarOpen(false);
  };

  // Delete an entry from Firestore
  const handleDeleteEntry = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;

    const confirmed = window.confirm('Are you sure you want to delete this reflection? This cannot be undone.');
    if (!confirmed) return;

    try {
      await deleteUserInteraction(user.uid, id);
      if (selectedEntryId === id) {
        setSelectedEntryId(null);
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete interaction. Please try again.');
    }
  };

  // Save or update an entry in Firestore
  const handleSaveEntry = useCallback(
    async (entryToSave: JournalEntry) => {
      if (!user) return;
      setIsSaving(true);
      try {
        await saveUserInteraction(user.uid, entryToSave);
        setSelectedEntryId(entryToSave.id);
      } finally {
        setIsSaving(false);
      }
    },
    [user]
  );

  // Invoke Gemini via secure backend proxy
  const handleGenerateReflection = useCallback(
    async (
      prompt: string,
      mode: ReflectionMode,
      history: ChatMessage[],
      currentTitle: string
    ) => {
      const historyPayload = history.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const result = await requestGeminiReflection({
        prompt,
        mode,
        history: historyPayload,
        title: currentTitle,
      });

      return result;
    },
    []
  );

  // Current active entry
  const currentEntry = entries.find((e) => e.id === selectedEntryId) || null;

  if (authLoading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-stone-300 border-t-stone-900 rounded-full animate-spin mx-auto" />
          <p className="text-xs text-stone-500 font-medium">
            Initializing secure session...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 font-sans">
      {/* Top Navigation */}
      <Navbar
        user={user}
        onSignOut={handleSignOut}
        onOpenSecurityModal={() => setShowSecurityModal(true)}
        isSaving={isSaving}
      />

      {/* Main View Area */}
      {!user ? (
        <AuthLanding
          onSignIn={handleSignIn}
          isLoading={authLoading}
          error={authError}
        />
      ) : (
        <div className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-4rem)] overflow-hidden">
          {/* Mobile history toggle button */}
          <div className="lg:hidden p-2.5 bg-stone-100 border-b border-stone-200 flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-stone-700 font-medium cursor-pointer shadow-2xs"
            >
              {mobileSidebarOpen ? 'Hide Past Reflections' : 'View Past Reflections (' + entries.length + ')'}
            </button>
            <button
              type="button"
              onClick={handleNewEntry}
              className="px-3 py-1.5 bg-stone-900 text-stone-50 rounded-lg font-medium cursor-pointer"
            >
              + New Reflection
            </button>
          </div>

          {/* Left History Sidebar */}
          <div className={`${mobileSidebarOpen ? 'block' : 'hidden'} lg:block h-full`}>
            <HistorySidebar
              entries={entries}
              selectedEntryId={selectedEntryId}
              onSelectEntry={handleSelectEntry}
              onNewEntry={handleNewEntry}
              onDeleteEntry={handleDeleteEntry}
              isLoading={entriesLoading}
            />
          </div>

          {/* Center/Right Active Reflection Studio */}
          <main className="flex-1 flex flex-col h-full overflow-hidden">
            <JournalEditor
              entry={currentEntry}
              onSaveEntry={handleSaveEntry}
              onGenerateReflection={handleGenerateReflection}
              isSaving={isSaving}
              userId={user.uid}
            />
          </main>
        </div>
      )}

      {/* Security Architecture Transparency Modal */}
      <SecurityModal
        isOpen={showSecurityModal}
        onClose={() => setShowSecurityModal(false)}
        userId={user?.uid}
      />
    </div>
  );
}
