import { doc, getDoc, setDoc, updateDoc, collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db, isDemoMode } from './firebase';
import type { UserProfile, UserRole } from '../types';

// Pre-seeded mock users for DEMO MODE
const MOCK_USERS_KEY = 'cfdn_demo_users_v1';

const INITIAL_MOCK_USERS: Record<string, UserProfile> = {
  'donor_1': {
    uid: 'donor_1',
    name: 'Sarah Jenkins',
    email: 'donor@communityfood.org',
    phone: '+1 (555) 234-5678',
    role: 'DONOR',
    organizationName: 'Grand Horizon Events & Catering',
    location: 'Metro Civic Center, Downtown',
    isBlocked: false,
    createdAt: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  'ngo_1': {
    uid: 'ngo_1',
    name: 'Marcus Vance',
    email: 'ngo@communityfood.org',
    phone: '+1 (555) 876-5432',
    role: 'NGO',
    organizationName: 'City Harvest Rescue Foundation',
    location: 'Central Distribution Hub, Northside',
    isBlocked: false,
    createdAt: new Date(Date.now() - 60 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  'admin_1': {
    uid: 'admin_1',
    name: 'Admin Supervisor',
    email: 'admin@communityfood.org',
    phone: '+1 (555) 000-1122',
    role: 'ADMIN',
    organizationName: 'Food Donation Network HQ',
    location: 'Global Operations Center',
    isBlocked: false,
    createdAt: new Date(Date.now() - 90 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  }
};

let inMemoryUsers: Record<string, UserProfile> | null = null;

function getLocalUsers(): Record<string, UserProfile> {
  if (typeof localStorage !== 'undefined') {
    const data = localStorage.getItem(MOCK_USERS_KEY);
    if (!data) {
      localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(INITIAL_MOCK_USERS));
      return { ...INITIAL_MOCK_USERS };
    }
    try {
      return JSON.parse(data);
    } catch {
      return { ...INITIAL_MOCK_USERS };
    }
  } else {
    if (!inMemoryUsers) {
      inMemoryUsers = { ...INITIAL_MOCK_USERS };
    }
    return inMemoryUsers;
  }
}

function saveLocalUsers(users: Record<string, UserProfile>) {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));
  }
  inMemoryUsers = users;
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  if (isDemoMode || !db) {
    const users = getLocalUsers();
    return users[uid] || null;
  }

  const userRef = doc(db, 'users', uid);
  const snap = await getDoc(userRef);
  if (snap.exists()) {
    return snap.data() as UserProfile;
  }
  return null;
}

export async function createUserProfile(profile: UserProfile): Promise<void> {
  if (isDemoMode || !db) {
    const users = getLocalUsers();
    users[profile.uid] = profile;
    saveLocalUsers(users);
    return;
  }

  const userRef = doc(db, 'users', profile.uid);
  await setDoc(userRef, profile);
}

export async function updateUserProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
  if (isDemoMode || !db) {
    const users = getLocalUsers();
    if (users[uid]) {
      users[uid] = { ...users[uid], ...data, updatedAt: new Date().toISOString() };
      saveLocalUsers(users);
    }
    return;
  }

  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, { ...data, updatedAt: new Date().toISOString() });
}

export async function getAllUsers(): Promise<UserProfile[]> {
  if (isDemoMode || !db) {
    const users = getLocalUsers();
    return Object.values(users);
  }

  const usersRef = collection(db, 'users');
  const q = query(usersRef, orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(doc => doc.data() as UserProfile);
}

export async function toggleBlockUser(uid: string, isBlocked: boolean): Promise<void> {
  await updateUserProfile(uid, { isBlocked });
}
