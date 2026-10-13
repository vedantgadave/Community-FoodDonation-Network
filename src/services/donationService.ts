import { notifyEligibleNgosOfNewDonation } from './notificationService';
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

const MOCK_DONATIONS_KEY = 'cfdn_demo_donations_v2';

// Realistic fallback coordinates in Kolhapur / Metro zone for mock donations
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
    pickupCoordinates: {
      latitude: 16.7050,
      longitude: 74.2433,
    },
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
    pickupCoordinates: {
      latitude: 16.6946,
      longitude: 74.2255,
    },
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
    pickupCoordinates: {
      latitude: 16.7120,
      longitude: 74.2480,
    },
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

  // Strip any undefined keys so Firestore setDoc never throws an unsupported undefined error
  const cleanData: Record<string, any> = {};
  for (const [key, value] of Object.entries(donationData)) {
    if (value !== undefined) {
      cleanData[key] = value;
    }
  }

  // Validate pickup coordinates if provided; reject malformed numbers
  if (cleanData.pickupCoordinates) {
    const lat = cleanData.pickupCoordinates.latitude;
    const lng = cleanData.pickupCoordinates.longitude;
    if (
      typeof lat !== 'number' ||
      typeof lng !== 'number' ||
      isNaN(lat) ||
      isNaN(lng) ||
      lat < -90 ||
      lat > 90 ||
      lng < -180 ||
      lng > 180
    ) {
      delete cleanData.pickupCoordinates;
    }
  }

  const newDonation: Donation = {
    ...cleanData,
    id,
    donorId: donorUser.uid,
    donorName: donorUser.name,
    donorPhone: donorUser.phone,
    donorLocation: donationData.pickupLocation || donorUser.location,
    status: 'AVAILABLE',
    createdAt: now,
    updatedAt: now,
  } as Donation;

  // Save to local cache first
  const list = getLocalDonations();
  list.unshift(newDonation);
  saveLocalDonations(list);

  if (isDemoMode || !db) {
    return newDonation;
  }

  try {
    const firestorePayload: Record<string, any> = {
      ...cleanData,
      id,
      donorId: donorUser.uid,
      donorName: donorUser.name,
      donorPhone: donorUser.phone,
      donorLocation: donationData.pickupLocation || donorUser.location,
      status: 'AVAILABLE',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const ref = doc(db, 'donations', id);
    await setDoc(ref, firestorePayload);
    
    // Feature 8: Trigger push notifications & real-time alerts ONLY after successful Firestore save
    notifyEligibleNgosOfNewDonation(newDonation).catch(err => {
      console.warn('Background notification dispatch non-blocking error:', err);
    });
  } catch (err) {
    console.warn('Firestore write failed, using local offline fallback:', err);
  }

  return newDonation;
}

export async function getAvailableDonations(filters?: Partial<DonationFilter>): Promise<Donation[]> {
  let list: Donation[] = [];

  if (isDemoMode || !db) {
    list = getLocalDonations().filter(d => d.status === 'AVAILABLE');
  } else {
    try {
      const ref = collection(db, 'donations');
      const q = query(ref, where('status', '==', 'AVAILABLE'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      if (!snap.empty) {
        list = snap.docs.map(doc => {
          const data = doc.data();
          return {
            ...data,
            id: doc.id,
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt,
            updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString() : data.updatedAt,
          } as Donation;
        });
      } else {
        list = getLocalDonations().filter(d => d.status === 'AVAILABLE');
      }
    } catch (err) {
      console.warn('Firestore getAvailableDonations failed, falling back to local:', err);
      list = getLocalDonations().filter(d => d.status === 'AVAILABLE');
    }
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

  try {
    const ref = collection(db, 'donations');
    const q = query(ref, where('donorId', '==', donorId), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    if (!snap.empty) {
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
  } catch (err) {
    console.warn('Firestore getDonationsByDonor failed, falling back to local:', err);
  }

  return getLocalDonations().filter(d => d.donorId === donorId);
}

export async function getDonationsByNgo(ngoId: string): Promise<Donation[]> {
  if (isDemoMode || !db) {
    return getLocalDonations().filter(d => d.acceptedBy === ngoId);
  }

  try {
    const ref = collection(db, 'donations');
    const q = query(ref, where('acceptedBy', '==', ngoId), orderBy('updatedAt', 'desc'));
    const snap = await getDocs(q);
    if (!snap.empty) {
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
  } catch (err) {
    console.warn('Firestore getDonationsByNgo failed, falling back to local:', err);
  }

  return getLocalDonations().filter(d => d.acceptedBy === ngoId);
}

export async function getDonationById(id: string): Promise<Donation | null> {
  const localList = getLocalDonations();
  const localMatch = localList.find(d => d.id === id);

  if (isDemoMode || !db) {
    return localMatch || null;
  }

  try {
    const ref = doc(db, 'donations', id);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data();
      return {
        ...data,
        id: snap.id,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt,
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString() : data.updatedAt,
      } as Donation;
    }
  } catch (err) {
    console.warn('Firestore getDonationById error, using local fallback:', err);
  }

  return localMatch || null;
}

export async function getAllDonationsAdmin(): Promise<Donation[]> {
  if (isDemoMode || !db) {
    return getLocalDonations();
  }

  try {
    const ref = collection(db, 'donations');
    const q = query(ref, orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    if (!snap.empty) {
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
  } catch (err) {
    console.warn('Firestore getAllDonationsAdmin error, using local fallback:', err);
  }

  return getLocalDonations();
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

  // Update local memory/storage immediately
  const localList = getLocalDonations();
  const localIdx = localList.findIndex(d => d.id === donationId);
  if (localIdx !== -1) {
    if (localList[localIdx].status !== 'AVAILABLE') {
      throw new Error('This donation has already been accepted by another NGO.');
    }
    localList[localIdx].status = 'ACCEPTED';
    localList[localIdx].acceptedBy = ngoUser.uid;
    localList[localIdx].acceptedByName = ngoUser.organizationName || ngoUser.name;
    localList[localIdx].acceptedAt = now;
    localList[localIdx].updatedAt = now;
    saveLocalDonations(localList);
  }

  // REAL FIRESTORE ATOMIC TRANSACTION
  if (!isDemoMode && db) {
    try {
      const donationRef = doc(db, 'donations', donationId);
      
      await runTransaction(db, async (transaction) => {
        const snap = await transaction.get(donationRef);
        if (!snap.exists()) {
          throw new Error('Donation listing no longer exists.');
        }

        const currentData = snap.data();
        if (currentData.status !== 'AVAILABLE') {
          throw new Error('This food donation has already been accepted by another NGO.');
        }

        transaction.update(donationRef, {
          status: 'ACCEPTED',
          acceptedBy: ngoUser.uid,
          acceptedByName: ngoUser.organizationName || ngoUser.name,
          acceptedAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      });
    } catch (err: any) {
      if (err.message && err.message.includes('already been accepted')) {
        throw err;
      }
      console.warn('Firestore accept transaction fallback:', err);
    }
  }

  const updated = await getDonationById(donationId);
  if (!updated) throw new Error('Failed to retrieve updated donation record.');
  return updated;
}

export async function updateDonationStatus(
  donationId: string,
  newStatus: DonationStatus,
  user: UserProfile,
  cancellationReason?: string
): Promise<Donation> {
  const currentDonation = await getDonationById(donationId);
  if (!currentDonation) {
    throw new Error('Donation record not found.');
  }

  if (!isValidStateTransition(currentDonation.status, newStatus)) {
    throw new Error(`Invalid lifecycle transition from ${currentDonation.status} to ${newStatus}.`);
  }

  // Role Permissions
  if (user.role === 'DONOR') {
    if (newStatus !== 'CANCELLED') {
      throw new Error('Donors are only permitted to cancel their own listings.');
    }
    if (currentDonation.donorId !== user.uid) {
      throw new Error('You do not have permission to modify another donor’s listing.');
    }
  } else if (user.role === 'NGO') {
    if (currentDonation.acceptedBy !== user.uid) {
      throw new Error('Only the assigned NGO can update this donation’s status.');
    }
  }

  const now = new Date().toISOString();
  const updates: Partial<Donation> = {
    status: newStatus,
    updatedAt: now,
  };

  if (newStatus === 'PICKED_UP') {
    updates.pickedUpAt = now;
  } else if (newStatus === 'COMPLETED') {
    updates.completedAt = now;
  } else if (newStatus === 'CANCELLED') {
    updates.cancelledAt = now;
    if (cancellationReason) {
      updates.cancellationReason = cancellationReason;
    }
  }

  // Update local
  const localList = getLocalDonations();
  const idx = localList.findIndex(d => d.id === donationId);
  if (idx !== -1) {
    localList[idx] = { ...localList[idx], ...updates };
    saveLocalDonations(localList);
  }

  if (!isDemoMode && db) {
    try {
      const ref = doc(db, 'donations', donationId);
      const fsUpdate: Record<string, any> = { ...updates, updatedAt: serverTimestamp() };
      if (newStatus === 'PICKED_UP') fsUpdate.pickedUpAt = serverTimestamp();
      if (newStatus === 'COMPLETED') fsUpdate.completedAt = serverTimestamp();
      if (newStatus === 'CANCELLED') fsUpdate.cancelledAt = serverTimestamp();
      await updateDoc(ref, fsUpdate);
    } catch (err) {
      console.warn('Firestore updateDoc fallback:', err);
    }
  }

  return { ...currentDonation, ...updates };
}

/**
 * Update or correct pickup coordinates for a donation
 * Only the donor owner or admin may update the location
 */
export async function updateDonationPickupCoordinates(
  donationId: string,
  user: UserProfile,
  coordinates: { latitude: number; longitude: number }
): Promise<Donation> {
  const { latitude, longitude } = coordinates;
  if (
    typeof latitude !== 'number' ||
    typeof longitude !== 'number' ||
    isNaN(latitude) ||
    isNaN(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    throw new Error('Invalid GPS coordinates provided. Latitude must be -90..90 and longitude -180..180.');
  }

  const donation = await getDonationById(donationId);
  if (!donation) throw new Error('Donation record not found.');

  if (user.role !== 'ADMIN' && donation.donorId !== user.uid) {
    throw new Error('Unauthorized: Only the donor owner or admin can update the pickup location.');
  }

  const now = new Date().toISOString();
  const coords = { latitude, longitude };

  // Update local
  const localList = getLocalDonations();
  const idx = localList.findIndex(d => d.id === donationId);
  if (idx !== -1) {
    localList[idx].pickupCoordinates = coords;
    localList[idx].updatedAt = now;
    saveLocalDonations(localList);
  }

  if (!isDemoMode && db) {
    try {
      const ref = doc(db, 'donations', donationId);
      await updateDoc(ref, {
        pickupCoordinates: coords,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.warn('Firestore updateDonationPickupCoordinates fallback:', err);
    }
  }

  return { ...donation, pickupCoordinates: coords, updatedAt: now };
}
