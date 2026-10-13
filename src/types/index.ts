export type UserRole = 'DONOR' | 'NGO' | 'ADMIN';

export type NgoVerificationStatus = 'NONE' | 'PENDING' | 'VERIFIED' | 'REJECTED';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole; // Active operational role
  authorizedRoles?: UserRole[]; // e.g. ['DONOR', 'NGO']
  ngoVerificationStatus?: NgoVerificationStatus;
  organizationName?: string;
  location: string;
  isBlocked: boolean;
  createdAt: string; // ISO string or formatted timestamp
  updatedAt: string;
}

export type DonationStatus = 'AVAILABLE' | 'ACCEPTED' | 'PICKED_UP' | 'COMPLETED' | 'CANCELLED';

export type FoodType = 'VEGETARIAN' | 'NON_VEGETARIAN';

export interface Donation {
  id: string;
  donorId: string;
  donorName: string;
  donorPhone: string;
  donorLocation: string;

  foodName: string;
  quantity: number;
  unit: string; // e.g. "meals", "kg", "boxes", "servings"
  foodType: FoodType;

  preparedAt: string;
  pickupDeadline: string;
  pickupLocation: string;
  pickupCoordinates?: {
    latitude: number;
    longitude: number;
  };
  description: string;
  category?: string;
  storageCondition?: string;

  imageUrl?: string;
  imagePublicId?: string;

  status: DonationStatus;
  safetyConfirmed?: boolean;

  acceptedBy?: string; // NGO uid
  acceptedByName?: string;
  acceptedAt?: string;

  pickedUpAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;

  createdAt: string;
  updatedAt: string;
}

export interface DonationFilter {
  search?: string;
  foodType?: FoodType | 'ALL';
  location?: string;
  minQuantity?: number;
  maxDeadlineHours?: number;
}

export interface DashboardStats {
  totalUsers: number;
  totalDonors: number;
  totalNgos: number;
  totalDonations: number;
  availableDonations: number;
  acceptedDonations: number;
  pickedUpDonations: number;
  completedDonations: number;
  cancelledDonations: number;
}

// ==========================================
// REAL-TIME NAVIGATION & PICKUP JOURNEY TYPES
// ==========================================

export type JourneyStatus = 'IN_TRANSIT' | 'ARRIVED' | 'STOPPED' | 'COMPLETED';

export type RoutePreference = 'FASTEST' | 'SHORTEST';

export interface RouteOption {
  id: string;
  name: string;
  preference: RoutePreference;
  distanceMeters: number;
  durationSeconds: number;
  coordinates: [number, number][]; // [longitude, latitude] GeoJSON line coordinates
  summary?: string;
}

export interface PickupJourney {
  id: string; // Usually matches donationId
  donationId: string;
  receiverId: string;
  receiverName: string;
  receiverPhone?: string;
  donorId: string;
  
  // Real-time receiver coordinates
  currentLatitude: number;
  currentLongitude: number;
  heading?: number;
  speed?: number;

  // Destination (donor pickup) coordinates
  destinationLatitude: number;
  destinationLongitude: number;
  destinationAddress: string;

  // Active Route Information
  journeyStatus: JourneyStatus;
  remainingDistanceMeters?: number;
  estimatedDurationSeconds?: number;
  etaTimestamp?: string;
  selectedRoutePreference: RoutePreference;
  activeRoutePolyline?: [number, number][]; // Current polyline path [lng, lat]
  
  updatedAt: string;
  createdAt: string;
}
