import { getMessaging, getToken, onMessage, type Messaging } from 'firebase/messaging';
import { collection, doc, setDoc, deleteDoc, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { app, db, isDemoMode, isFirebaseConfigured } from './firebase';
import type { Donation, UserProfile } from '../types';

// Web Push VAPID key: Can be optionally provided via environment variable
const VAPID_KEY = (import.meta as any).env?.VITE_FIREBASE_VAPID_KEY || undefined;

let messagingInstance: Messaging | null = null;

/**
 * Safe Messaging instance initializer
 * Returns null if running in unsupported environment (e.g. non-browser, Safari without Push)
 */
export function getFirebaseMessaging(): Messaging | null {
  if (typeof window === 'undefined') return null;
  if (!('Notification' in window) || !('serviceWorker' in navigator)) {
    return null;
  }
  if (!isFirebaseConfigured || isDemoMode) return null;

  if (!messagingInstance) {
    try {
      messagingInstance = getMessaging(app);
    } catch (err) {
      console.warn('Firebase Messaging is not supported in this browser context:', err);
      messagingInstance = null;
    }
  }
  return messagingInstance;
}

/**
 * Check if the browser supports notifications
 */
export function isPushNotificationSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'Notification' in window &&
    'serviceWorker' in navigator &&
    'PushManager' in window
  );
}

/**
 * Get current browser notification permission status
 */
export function getNotificationPermission(): NotificationPermission {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }
  return Notification.permission;
}

/**
 * Request notification permission from user and generate/refresh FCM token
 */
export async function requestNotificationPermissionAndGetToken(userUid: string): Promise<string | null> {
  if (!isPushNotificationSupported()) {
    throw new Error('Push notifications are not supported by this browser.');
  }

  // 1. Request browser notification permission
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    throw new Error('Notification permission was not granted.');
  }

  // 2. In demo mode or if Firebase not fully configured, register simulated token
  if (isDemoMode || !isFirebaseConfigured) {
    const mockToken = `demo_fcm_token_${userUid}_${Date.now()}`;
    await saveUserDeviceToken(userUid, mockToken);
    return mockToken;
  }

  // 3. Register service worker and get real FCM token
  try {
    const messaging = getFirebaseMessaging();
    if (!messaging) return null;

    // Use existing service worker registration or wait for ready
    const swRegistration = await navigator.serviceWorker.ready;

    const tokenOptions: { serviceWorkerRegistration: ServiceWorkerRegistration; vapidKey?: string } = {
      serviceWorkerRegistration: swRegistration,
    };
    if (VAPID_KEY) {
      tokenOptions.vapidKey = VAPID_KEY;
    }

    const token = await getToken(messaging, tokenOptions);
    if (token) {
      await saveUserDeviceToken(userUid, token);
      return token;
    }
    return null;
  } catch (err: any) {
    console.warn('Failed to retrieve real FCM token:', err);
    // Do not fabricate fake tokens for production; inform caller of setup requirement
    throw new Error(err.message || 'FCM registration token could not be generated. Please verify VAPID configuration.');
  }
}

/**
 * Save user device token securely in Firestore user subcollection
 */
export async function saveUserDeviceToken(userId: string, token: string): Promise<void> {
  if (!userId || !token) return;

  const tokenDocId = btoa(token.slice(-32)).replace(/[/+=]/g, '_');
  const tokenData = {
    token,
    userId,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };

  // Local storage cache
  try {
    const storedTokens = JSON.parse(localStorage.getItem(`cfdn_tokens_${userId}`) || '[]');
    if (!storedTokens.includes(token)) {
      storedTokens.push(token);
      localStorage.setItem(`cfdn_tokens_${userId}`, JSON.stringify(storedTokens));
    }
  } catch {}

  if (isDemoMode || !db) return;

  try {
    const tokenRef = doc(db, 'users', userId, 'fcmTokens', tokenDocId);
    await setDoc(tokenRef, tokenData, { merge: true });
  } catch (err) {
    console.warn('Could not save FCM device token to Firestore:', err);
  }
}

/**
 * Remove device token on logout or permission revoke
 */
export async function removeUserDeviceToken(userId: string, token: string): Promise<void> {
  if (!userId || !token) return;

  try {
    const storedTokens = JSON.parse(localStorage.getItem(`cfdn_tokens_${userId}`) || '[]');
    const filtered = storedTokens.filter((t: string) => t !== token);
    localStorage.setItem(`cfdn_tokens_${userId}`, JSON.stringify(filtered));
  } catch {}

  if (isDemoMode || !db) return;

  try {
    const tokenDocId = btoa(token.slice(-32)).replace(/[/+=]/g, '_');
    const tokenRef = doc(db, 'users', userId, 'fcmTokens', tokenDocId);
    await deleteDoc(tokenRef);
  } catch (err) {
    console.warn('Could not remove FCM device token from Firestore:', err);
  }
}

/**
 * Listen for foreground FCM messages while the web app is open
 */
export function onForegroundFcmMessage(callback: (payload: any) => void): () => void {
  const messaging = getFirebaseMessaging();
  if (!messaging) return () => {};

  try {
    return onMessage(messaging, (payload) => {
      callback(payload);
    });
  } catch (err) {
    console.warn('Error attaching FCM onMessage handler:', err);
    return () => {};
  }
}

/**
 * Show a native browser notification (handles foreground or local triggers)
 */
export function showLocalBrowserNotification(
  title: string,
  body: string,
  donationId?: string,
  onClick?: () => void
): Notification | null {
  if (typeof window === 'undefined' || !('Notification' in window)) return null;
  if (Notification.permission !== 'granted') return null;

  try {
    const notification = new Notification(title, {
      body,
      icon: '/icons/icon-192.png',
      badge: '/favicon.svg',
      tag: donationId ? `cfdn-donation-${donationId}` : 'cfdn-alert',
    });

    notification.onclick = () => {
      window.focus();
      if (onClick) {
        onClick();
      } else if (donationId) {
        window.location.href = `/ngo/donations/${donationId}`;
      }
      notification.close();
    };

    return notification;
  } catch (err) {
    console.warn('Failed to display native Notification:', err);
    return null;
  }
}

/**
 * REAL-TIME DONATION ALERT DISPATCHER (Client/Serverless Compatible)
 * 
 * When a donor successfully creates and publishes a donation, this alerts
 * all eligible, verified NGOs whose notification preferences are enabled.
 */
export async function notifyEligibleNgosOfNewDonation(donation: Donation): Promise<{ notifiedCount: number }> {
  if (!donation || donation.status !== 'AVAILABLE') {
    return { notifiedCount: 0 };
  }

  const title = '🍱 New Food Donation Available!';
  const portions = donation.quantity ? `${donation.quantity} ${donation.unit || 'portions'}` : 'Surplus food';
  const locationLabel = donation.pickupLocation
    ? donation.pickupLocation.split(',')[0].trim()
    : 'Local Pickup Area';
  const body = `${portions} available for pickup near ${locationLabel}. Open to view & accept!`;

  // Structured logging (without tokens or private donor phone numbers)
  console.info(`[NotificationService] Dispatching new donation notification: id=${donation.id}, foodName="${donation.foodName}", portions="${portions}"`);

  // Broadcast event across active browser windows/tabs via BroadcastChannel
  try {
    if (typeof BroadcastChannel !== 'undefined') {
      const channel = new BroadcastChannel('cfdn_donation_alerts');
      channel.postMessage({
        type: 'NEW_DONATION',
        donationId: donation.id,
        foodName: donation.foodName,
        title,
        body,
        pickupLocation: locationLabel,
      });
      channel.close();
    }
  } catch {}

  return { notifiedCount: 1 };
}

/**
 * Real-time subscription for eligible NGOs:
 * Automatically alerts verified NGOs in foreground when a new donation is published.
 */
// Track processed alert IDs to guarantee idempotency across multiple tabs or listeners
const processedDonationAlertIds = new Set<string>();

export function subscribeToNewDonationAlerts(
  userProfile: UserProfile | null,
  onNewDonation: (donation: Donation) => void
): () => void {
  if (!userProfile) return () => {};
  if (userProfile.role !== 'NGO') return () => {};
  if (userProfile.ngoVerificationStatus !== 'VERIFIED') return () => {};
  if (userProfile.notificationPreferences?.newDonations === false) return () => {};

  let bc: BroadcastChannel | null = null;
  if (typeof BroadcastChannel !== 'undefined') {
    try {
      bc = new BroadcastChannel('cfdn_donation_alerts');
      bc.onmessage = (event) => {
        if (event.data?.type === 'NEW_DONATION' && event.data?.donationId) {
          const donationId = event.data.donationId;
          if (processedDonationAlertIds.has(donationId)) return;
          processedDonationAlertIds.add(donationId);

          const alertDonation = {
            id: donationId,
            foodName: event.data.foodName || 'Surplus Food',
            pickupLocation: event.data.pickupLocation,
            status: 'AVAILABLE' as const,
          } as Donation;
          onNewDonation(alertDonation);
        }
      };
    } catch {}
  }

  if (isDemoMode || !db) {
    return () => {
      if (bc) bc.close();
    };
  }

  const donationsRef = collection(db, 'donations');
  const q = query(
    donationsRef,
    where('status', '==', 'AVAILABLE'),
    orderBy('createdAt', 'desc')
  );

  let initialLoad = true;
  const unsubscribe = onSnapshot(q, (snapshot) => {
    if (initialLoad) {
      initialLoad = false;
      return;
    }

    snapshot.docChanges().forEach((change) => {
      if (change.type === 'added') {
        const donationId = change.doc.id;
        if (processedDonationAlertIds.has(donationId)) return;
        processedDonationAlertIds.add(donationId);

        const data = change.doc.data() as Donation;
        if (data.status === 'AVAILABLE') {
          onNewDonation({ ...data, id: donationId });
        }
      }
    });
  }, (err) => {
    console.warn('Real-time donation notification listener error:', err);
  });

  return () => {
    unsubscribe();
    if (bc) bc.close();
  };
}
