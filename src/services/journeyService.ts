import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  serverTimestamp 
} from 'firebase/firestore';
import { db, isDemoMode } from './firebase';
import type { PickupJourney, JourneyStatus, RoutePreference } from '../types';

const MOCK_JOURNEYS_KEY = 'cfdn_demo_journeys_v1';

// In-memory demo store
let demoJourneys: Record<string, PickupJourney> = {};
const listeners: Record<string, ((journey: PickupJourney | null) => void)[]> = {};

function getLocalJourneys(): Record<string, PickupJourney> {
  if (typeof localStorage !== 'undefined') {
    const raw = localStorage.getItem(MOCK_JOURNEYS_KEY);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        return demoJourneys;
      }
    }
  }
  return demoJourneys;
}

function saveLocalJourneys(data: Record<string, PickupJourney>) {
  demoJourneys = data;
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(MOCK_JOURNEYS_KEY, JSON.stringify(data));
  }
}

function notifyDemoListeners(donationId: string, journey: PickupJourney | null) {
  if (listeners[donationId]) {
    listeners[donationId].forEach((cb) => cb(journey));
  }
}

/**
 * Start or initialize an active pickup journey
 */
export async function startPickupJourney(journey: PickupJourney): Promise<void> {
  if (isDemoMode || !db) {
    const all = getLocalJourneys();
    all[journey.donationId] = journey;
    saveLocalJourneys(all);
    notifyDemoListeners(journey.donationId, journey);
    return;
  }

  const journeyRef = doc(db, 'journeys', journey.donationId);
  const cleanData: Record<string, any> = {
    ...journey,
    // Firestore does not support nested arrays directly; serialize polyline coordinates to JSON string
    activeRoutePolylineJson: journey.activeRoutePolyline ? JSON.stringify(journey.activeRoutePolyline) : null,
    updatedAt: serverTimestamp(),
    createdAt: serverTimestamp(),
  };
  delete cleanData.activeRoutePolyline;

  await setDoc(journeyRef, cleanData);
}

/**
 * Update real-time GPS location, route progress, and ETA of an active journey
 * Throttled to avoid excessive Firestore writes
 */
export async function updateJourneyLocation(
  donationId: string,
  receiverId: string,
  update: {
    currentLatitude: number;
    currentLongitude: number;
    heading?: number;
    speed?: number;
    journeyStatus?: JourneyStatus;
    remainingDistanceMeters?: number;
    estimatedDurationSeconds?: number;
    etaTimestamp?: string;
    selectedRoutePreference?: RoutePreference;
    activeRoutePolyline?: [number, number][];
  }
): Promise<void> {
  const now = new Date().toISOString();

  if (isDemoMode || !db) {
    const all = getLocalJourneys();
    const existing = all[donationId];
    if (existing && existing.receiverId === receiverId) {
      all[donationId] = {
        ...existing,
        ...update,
        updatedAt: now,
      };
      saveLocalJourneys(all);
      notifyDemoListeners(donationId, all[donationId]);
    }
    return;
  }

  const journeyRef = doc(db, 'journeys', donationId);
  const cleanUpdate: Record<string, any> = {
    ...update,
    updatedAt: serverTimestamp(),
  };

  if (update.activeRoutePolyline) {
    cleanUpdate.activeRoutePolylineJson = JSON.stringify(update.activeRoutePolyline);
    delete cleanUpdate.activeRoutePolyline;
  }

  // Remove undefined keys
  Object.keys(cleanUpdate).forEach((k) => {
    if (cleanUpdate[k] === undefined) delete cleanUpdate[k];
  });

  await updateDoc(journeyRef, cleanUpdate);
}

/**
 * Fetch one-off journey state
 */
export async function getPickupJourney(donationId: string): Promise<PickupJourney | null> {
  if (isDemoMode || !db) {
    const all = getLocalJourneys();
    return all[donationId] || null;
  }

  const journeyRef = doc(db, 'journeys', donationId);
  const snap = await getDoc(journeyRef);
  if (snap.exists()) {
    const data = snap.data();
    let polyline: [number, number][] | undefined = undefined;
    if (data.activeRoutePolylineJson) {
      try {
        polyline = JSON.parse(data.activeRoutePolylineJson);
      } catch {}
    }

    return {
      ...data,
      id: snap.id,
      activeRoutePolyline: polyline,
      updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt || new Date().toISOString(),
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt || new Date().toISOString(),
    } as PickupJourney;
  }
  return null;
}

/**
 * Stop or complete a journey session
 */
export async function stopPickupJourney(donationId: string): Promise<void> {
  if (isDemoMode || !db) {
    const all = getLocalJourneys();
    delete all[donationId];
    saveLocalJourneys(all);
    notifyDemoListeners(donationId, null);
    return;
  }

  const journeyRef = doc(db, 'journeys', donationId);
  try {
    await deleteDoc(journeyRef);
  } catch (err) {
    console.warn('Error deleting journey document:', err);
  }
}

/**
 * Subscribe to live journey updates in real-time (Used by both NGO navigator and Donor live-tracker)
 */
export function subscribeToPickupJourney(
  donationId: string,
  onUpdate: (journey: PickupJourney | null) => void,
  onError?: (error: Error) => void
): () => void {
  if (isDemoMode || !db) {
    if (!listeners[donationId]) {
      listeners[donationId] = [];
    }
    listeners[donationId].push(onUpdate);

    // Initial emit
    const current = getLocalJourneys()[donationId] || null;
    onUpdate(current);

    return () => {
      listeners[donationId] = (listeners[donationId] || []).filter((cb) => cb !== onUpdate);
    };
  }

  const journeyRef = doc(db, 'journeys', donationId);
  const unsubscribe = onSnapshot(
    journeyRef,
    (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        let polyline: [number, number][] | undefined = undefined;
        if (data.activeRoutePolylineJson) {
          try {
            polyline = JSON.parse(data.activeRoutePolylineJson);
          } catch {}
        }

        const journey: PickupJourney = {
          ...data,
          id: snap.id,
          activeRoutePolyline: polyline,
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt || new Date().toISOString(),
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt || new Date().toISOString(),
        } as PickupJourney;
        onUpdate(journey);
      } else {
        onUpdate(null);
      }
    },
    (err) => {
      console.error('Real-time journey listener error:', err);
      if (onError) onError(err);
    }
  );

  return unsubscribe;
}
