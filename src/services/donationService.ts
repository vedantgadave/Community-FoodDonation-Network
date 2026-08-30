import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  runTransaction,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db, isDemoMode } from './firebase';
import type { Donation, DonationFilter, DonationStatus, UserProfile } from '../types';
import { isValidStateTransition } from '../constants';

const MOCK_DONATIONS_KEY = 'cfdn_demo_donations_v1';

const INITIAL_MOCK_DONATIONS: Donation[] = [
  {
    id: 'don_101',
    donorId: 'donor_1',
    donorName: 'Sarah Jenkins',
    donorPhone: '+1 (555) 234-5678',
    donorLocation: 'Grand Horizon Banquet Hall, Downtown',
    foodName: 'Fresh Catered Gourmet Buffet Meals',
    quantity: 120,
    unit: 'meals',
    foodType: 'VEGETARIAN',
    preparedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    pickupDeadline: new Date(Date.now() + 6 * 3600 * 1000).toISOString(),
    pickupLocation: 'Rear Loading Dock 2, Grand Horizon Hall, 450 Main St',
    description: 'Freshly prepared vegetarian meals from annual tech summit banquet. Packaged in sanitized insulated food containers.',
    imageUrl: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=800&q=80',
    imagePublicId: 'sample_buffet',
    status: 'AVAILABLE',
    safetyConfirmed: true,
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  },
  {
    id: 'don_102',
    donorId: 'donor_1',
    donorName: 'Sarah Jenkins',
    donorPhone: '+1 (555) 234-5678',
    donorLocation: 'Grand Horizon Banquet Hall, Downtown',
    foodName: 'Artisan Sandwiches & Baked Goods',
    quantity: 50,
    unit: 'boxes',
    foodType: 'NON_VEGETARIAN',
    preparedAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    pickupDeadline: new Date(Date.now() + 4 * 3600 * 1000).toISOString(),
    pickupLocation: 'Main Kitchen Reception, 450 Main St',
    description: 'Assorted chicken caesar wraps and vegetarian paninis individually foil wrapped.',
    imageUrl: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=800&q=80',
    imagePublicId: 'sample_sandwiches',
    status: 'ACCEPTED',
    safetyConfirmed: true,
    acceptedBy: 'ngo_1',
    acceptedByName: 'City Harvest Rescue Foundation',
    acceptedAt: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
  },
  {
    id: 'don_103',
    donorId: 'donor_1',
    donorName: 'Sarah Jenkins',
    donorPhone: '+1 (555) 234-5678',
    donorLocation: 'Grand Horizon Banquet Hall, Downtown',
    foodName: 'Organic Fruit Packs & Dairy Yogurt',
    quantity: 80,
    unit: 'servings',
    foodType: 'VEGETARIAN',
    preparedAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    pickupDeadline: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    pickupLocation: 'Cold Storage Room B',
    description: 'Fresh apple and orange packs stored at 4 degrees C.',
    imageUrl: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=800&q=80',
    imagePublicId: 'sample_fruit',
    status: 'COMPLETED',
    safetyConfirmed: true,
    acceptedBy: 'ngo_1',
    acceptedByName: 'City Harvest Rescue Foundation',
    acceptedAt: new Date(Date.now() - 20 * 3600 * 1000).toISOString(),
    pickedUpAt: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 15 * 3600 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 15 * 3600 * 1000).toISOString(),
  }
];

let inMemoryDonations: Donation[] | null = null;

function getLocalDonations(): Donation[] {
  if (typeof localStorage !== 'undefined') {
    const data = localStorage.getItem(MOCK_DONATIONS_KEY);
    if (!data) {
      localStorage.setItem(MOCK_DONATIONS_KEY, JSON.stringify(INITIAL_MOCK_DONATIONS));
      return [...INITIAL_MOCK_DONATIONS];
    }
    try {
      return JSON.parse(data);
    } catch {
      return [...INITIAL_MOCK_DONATIONS];
    }
  } else {
    if (!inMemoryDonations) {
      inMemoryDonations = [...INITIAL_MOCK_DONATIONS];
    }
    return inMemoryDonations;
  }
}

function saveLocalDonations(donations: Donation[]) {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(MOCK_DONATIONS_KEY, JSON.stringify(donations));
  }
  inMemoryDonations = donations;
}

export async function createDonation(
  donationData: Omit<Donation, 'id' | 'createdAt' | 'updatedAt' | 'status'>,
  donorUser: UserProfile
): Promise<Donation> {
  if (donorUser.isBlocked) {
    throw new Error('Your account is currently restricted from creating donations.');
  }

  const now = new Date().toISOString();
  const id = `don_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;

  const newDonation: Donation = {
    ...donationData,
    id,
    donorId: donorUser.uid,
    donorName: donorUser.name,
    donorPhone: donorUser.phone,
    donorLocation: donationData.pickupLocation || donorUser.location,
    status: 'AVAILABLE',
    createdAt: now,
    updatedAt: now,
  };

  if (isDemoMode || !db) {
    const list = getLocalDonations();
    list.unshift(newDonation);
    saveLocalDonations(list);
    return newDonation;
  }

  const ref = doc(db, 'donations', id);
  await setDoc(ref, {
    ...newDonation,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return newDonation;
}

export async function getAvailableDonations(filters?: Partial<DonationFilter>): Promise<Donation[]> {
  let list: Donation[] = [];

  if (isDemoMode || !db) {
    list = getLocalDonations().filter(d => d.status === 'AVAILABLE');
  } else {
    const ref = collection(db, 'donations');
    const q = query(ref, where('status', '==', 'AVAILABLE'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    list = snap.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt,
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString() : data.updatedAt,
      } as Donation;
    });
  }

  // Client-side Filter Application
  if (filters) {
    if (filters.search && filters.search.trim() !== '') {
      const term = filters.search.toLowerCase();
      list = list.filter(d => 
        d.foodName.toLowerCase().includes(term) ||
        d.description.toLowerCase().includes(term) ||
        d.pickupLocation.toLowerCase().includes(term) ||
        d.donorName.toLowerCase().includes(term)
      );
    }
    if (filters.foodType && filters.foodType !== 'ALL') {
      list = list.filter(d => d.foodType === filters.foodType);
    }
    if (filters.location && filters.location.trim() !== '') {
      const locTerm = filters.location.toLowerCase();
      list = list.filter(d => d.pickupLocation.toLowerCase().includes(locTerm));
    }
    if (filters.minQuantity && filters.minQuantity > 0) {
      list = list.filter(d => d.quantity >= filters.minQuantity!);
    }
  }

  return list;
}

export async function getDonationsByDonor(donorId: string): Promise<Donation[]> {
  if (isDemoMode || !db) {
    return getLocalDonations().filter(d => d.donorId === donorId);
  }

  const ref = collection(db, 'donations');
  const q = query(ref, where('donorId', '==', donorId), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(doc => {
    const data = doc.data();
    return {
      ...data,
      id: doc.id,
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt,
      updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString() : data.updatedAt,
    } as Donation;
  });
}

export async function getDonationsByNgo(ngoId: string): Promise<Donation[]> {
  if (isDemoMode || !db) {
    return getLocalDonations().filter(d => d.acceptedBy === ngoId);
  }

  const ref = collection(db, 'donations');
  const q = query(ref, where('acceptedBy', '==', ngoId), orderBy('updatedAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(doc => {
    const data = doc.data();
    return {
      ...data,
      id: doc.id,
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt,
      updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString() : data.updatedAt,
    } as Donation;
  });
}

export async function getDonationById(id: string): Promise<Donation | null> {
  if (isDemoMode || !db) {
    const list = getLocalDonations();
    return list.find(d => d.id === id) || null;
  }

  const ref = doc(db, 'donations', id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    ...data,
    id: snap.id,
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt,
    updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString() : data.updatedAt,
  } as Donation;
}

export async function getAllDonationsAdmin(): Promise<Donation[]> {
  if (isDemoMode || !db) {
    return getLocalDonations();
  }

  const ref = collection(db, 'donations');
  const q = query(ref, orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(doc => {
    const data = doc.data();
    return {
      ...data,
      id: doc.id,
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt,
      updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString() : data.updatedAt,
    } as Donation;
  });
}

/**
 * CRITICAL REQUIREMENT: Single-NGO Atomic Acceptance Transaction.
 * 
 * Guarantees that two NGOs can NEVER accept the same donation concurrently.
 */
export async function acceptDonationTransaction(donationId: string, ngoUser: UserProfile): Promise<Donation> {
  if (ngoUser.role !== 'NGO') {
    throw new Error('Unauthorized: Only registered NGOs can accept food donations.');
  }

  if (ngoUser.isBlocked) {
    throw new Error('Your NGO account is currently restricted from accepting donations.');
  }

  const now = new Date().toISOString();

  // REAL FIRESTORE ATOMIC TRANSACTION
  if (!isDemoMode && db) {
    const donationRef = doc(db, 'donations', donationId);
    
    await runTransaction(db, async (transaction) => {
      const snap = await transaction.get(donationRef);
      if (!snap.exists()) {
        throw new Error('Donation record does not exist.');
      }
      const data = snap.data();
      if (data.status !== 'AVAILABLE') {
        throw new Error('This donation has already been accepted by another NGO.');
      }
      
      transaction.update(donationRef, {
        status: 'ACCEPTED',
        acceptedBy: ngoUser.uid,
        acceptedByName: ngoUser.organizationName || ngoUser.name,
        acceptedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    });

    const updated = await getDonationById(donationId);
    if (!updated) throw new Error('Failed to retrieve updated donation');
    return updated;
  }

  // DEMO MODE ATOMIC SIMULATION
  const list = getLocalDonations();
  const index = list.findIndex(d => d.id === donationId);
  if (index === -1) {
    throw new Error('Donation record does not exist.');
  }

  const current = list[index];
  if (current.status !== 'AVAILABLE') {
    throw new Error('This donation has already been accepted by another NGO.');
  }

  const updated: Donation = {
    ...current,
    status: 'ACCEPTED',
    acceptedBy: ngoUser.uid,
    acceptedByName: ngoUser.organizationName || ngoUser.name,
    acceptedAt: now,
    updatedAt: now,
  };

  list[index] = updated;
  saveLocalDonations(list);
  return updated;
}

/**
 * Executes lifecycle state transitions:
 * ACCEPTED -> PICKED_UP (by assigned NGO)
 * PICKED_UP -> COMPLETED (by assigned NGO)
 * AVAILABLE -> CANCELLED (by Donor owner)
 */
export async function updateDonationStatus(
  donationId: string,
  targetStatus: DonationStatus,
  userProfile: UserProfile
): Promise<Donation> {
  const current = await getDonationById(donationId);
  if (!current) throw new Error('Donation not found.');

  // Validate state machine
  if (!isValidStateTransition(current.status, targetStatus)) {
    throw new Error(`Invalid state transition from ${current.status} to ${targetStatus}.`);
  }

  // Permission Checks
  if (userProfile.role === 'DONOR') {
    if (current.donorId !== userProfile.uid) {
      throw new Error('Unauthorized: You can only update your own donations.');
    }
    if (targetStatus !== 'CANCELLED') {
      throw new Error('Donors can only cancel available donations.');
    }
  } else if (userProfile.role === 'NGO') {
    if (current.acceptedBy !== userProfile.uid) {
      throw new Error('Unauthorized: Only the assigned NGO can update this donation status.');
    }
  } else if (userProfile.role !== 'ADMIN') {
    throw new Error('Unauthorized user role.');
  }

  const now = new Date().toISOString();
  const updates: Partial<Donation> = {
    status: targetStatus,
    updatedAt: now,
  };

  if (targetStatus === 'PICKED_UP') {
    updates.pickedUpAt = now;
  } else if (targetStatus === 'COMPLETED') {
    updates.completedAt = now;
  } else if (targetStatus === 'CANCELLED') {
    updates.cancelledAt = now;
  }

  if (isDemoMode || !db) {
    const list = getLocalDonations();
    const index = list.findIndex(d => d.id === donationId);
    if (index !== -1) {
      list[index] = { ...list[index], ...updates };
      saveLocalDonations(list);
      return list[index];
    }
    throw new Error('Donation not found in demo state.');
  }

  const ref = doc(db, 'donations', id);
  const dbUpdates: any = {
    ...updates,
    updatedAt: serverTimestamp()
  };
  if (targetStatus === 'PICKED_UP') dbUpdates.pickedUpAt = serverTimestamp();
  if (targetStatus === 'COMPLETED') dbUpdates.completedAt = serverTimestamp();
  if (targetStatus === 'CANCELLED') dbUpdates.cancelledAt = serverTimestamp();

  await updateDoc(ref, dbUpdates);
  const updated = await getDonationById(donationId);
  return updated!;
}
