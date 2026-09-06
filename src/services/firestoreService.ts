import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import { JournalEntry } from '../types';
import { sanitizePayload } from '../utils/sanitize';

/**
 * Saves or updates a journal interaction document in Firestore.
 * Path: /users/{userId}/interactions/{interactionId}
 * Enforces strict user isolation matching Firestore security rules.
 */
export async function saveUserInteraction(userId: string, entry: JournalEntry): Promise<void> {
  if (!userId) {
    throw new Error('User ID is required to persist interaction.');
  }

  const docRef = doc(db, 'users', userId, 'interactions', entry.id);

  // Strip any undefined fields before writing to Firestore
  const sanitized = sanitizePayload({
    ...entry,
    userId,
    serverSyncedAt: serverTimestamp(),
  });

  await setDoc(docRef, sanitized, { merge: true });
}

/**
 * Fetches all interactions for a specific user, sorted by most recent.
 */
export async function getUserInteractions(userId: string): Promise<JournalEntry[]> {
  if (!userId) return [];

  const interactionsRef = collection(db, 'users', userId, 'interactions');
  const q = query(interactionsRef, orderBy('updatedAt', 'desc'));
  const snapshot = await getDocs(q);

  const entries: JournalEntry[] = [];
  snapshot.forEach((docSnap) => {
    const data = docSnap.data() as JournalEntry;
    entries.push({
      ...data,
      id: docSnap.id,
    });
  });

  return entries;
}

/**
 * Subscribes to real-time changes of the user's interactions collection.
 */
export function subscribeToUserInteractions(
  userId: string,
  onUpdate: (entries: JournalEntry[]) => void,
  onError: (error: Error) => void
) {
  if (!userId) {
    onUpdate([]);
    return () => {};
  }

  const interactionsRef = collection(db, 'users', userId, 'interactions');
  const q = query(interactionsRef, orderBy('updatedAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const entries: JournalEntry[] = [];
      snapshot.forEach((docSnap) => {
        entries.push({
          ...(docSnap.data() as JournalEntry),
          id: docSnap.id,
        });
      });
      onUpdate(entries);
    },
    (err) => {
      console.error('Firestore subscription error:', err);
      onError(err);
    }
  );
}

/**
 * Deletes an interaction document strictly for the authorized user.
 */
export async function deleteUserInteraction(userId: string, interactionId: string): Promise<void> {
  if (!userId || !interactionId) return;
  const docRef = doc(db, 'users', userId, 'interactions', interactionId);
  await deleteDoc(docRef);
}
