import type { User } from 'firebase/auth';

// Mirrors isAdmin() in firestore.rules: role 'admin' on the profile, or a
// verified sign-in with a listed email. Keep the two lists in sync.
export const ADMIN_EMAILS = ['jaco@wealthu.org'];

export function isAdminUser(user: User | null, userProfile: any): boolean {
  if (!user) return false;
  if (userProfile?.role === 'admin') return true;
  return !!user.email && user.emailVerified && ADMIN_EMAILS.includes(user.email);
}
