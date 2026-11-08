import {
  collection, doc, limit, onSnapshot, orderBy, query, serverTimestamp, updateDoc, where, writeBatch, addDoc,
} from 'firebase/firestore';
import { db } from '../firebase';
import type { AppNotification, NotificationType } from '../types';

const notifications = collection(db, 'notifications');

// Activity notifications a member creates for themselves. Never throws:
// a failed notification shouldn't break the action that triggered it.
export async function notify(userId: string, type: Exclude<NotificationType, 'announcement'>, title: string, body = '') {
  try {
    await addDoc(notifications, { userId, type, title, body, read: false, createdAt: serverTimestamp() });
  } catch (error) {
    console.error('Could not create notification', error);
  }
}

// Admin announcement, fanned out as one document per recipient so each
// member has their own read state. Batches stay under Firestore's 500 limit.
export async function sendAnnouncement(adminUid: string, recipientIds: string[], title: string, body: string) {
  for (let i = 0; i < recipientIds.length; i += 400) {
    const batch = writeBatch(db);
    for (const userId of recipientIds.slice(i, i + 400)) {
      batch.set(doc(notifications), {
        userId, type: 'announcement', title, body, read: false, sentBy: adminUid, createdAt: serverTimestamp(),
      });
    }
    await batch.commit();
  }
}

export function subscribeToNotifications(userId: string, onChange: (items: AppNotification[]) => void) {
  const q = query(notifications, where('userId', '==', userId), orderBy('createdAt', 'desc'), limit(30));
  return onSnapshot(
    q,
    snap => onChange(snap.docs.map(d => ({ id: d.id, ...d.data() } as AppNotification))),
    error => console.error('Notifications listener failed', error)
  );
}

export const markRead = (id: string) => updateDoc(doc(notifications, id), { read: true });

export async function markAllRead(ids: string[]) {
  if (!ids.length) return;
  const batch = writeBatch(db);
  ids.forEach(id => batch.update(doc(notifications, id), { read: true }));
  await batch.commit();
}
