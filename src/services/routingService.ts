import type { RouteOption, RoutePreference } from '../types';

/**
 * Real Route Calculation Engine using OpenStreetMap OSRM Road Network Routing
 * 
 * Provides:
 * - Real road network path calculation (no straight lines, no simulated GPS)
 * - Turn-by-turn geometry polyline [longitude, latitude]
 * - Accurate distance (meters) and duration (seconds)
 * - Route alternatives: FASTEST vs. SHORTEST
 * - Request throttling and graceful error handling
 */

interface OsrmRoute {
  distance: number; // meters
  duration: number; // seconds
  geometry: {
    coordinates: [number, number][]; // [lng, lat]
    type: string;
  };
  legs?: any[];
  weight_name?: string;
}

interface OsrmResponse {
  code: string;
  routes: OsrmRoute[];
  message?: string;
}

// In-memory route cache to prevent duplicate calls for identical origin-dest coordinates
const routeCache = new Map<string, { timestamp: number; routes: RouteOption[] }>();
const CACHE_TTL_MS = 60 * 1000; // 60s cache

export async function calculateRealRoutes(
  origin: { latitude: number; longitude: number },
  destination: { latitude: number; longitude: number }
): Promise<RouteOption[]> {
  // Validate coordinates
  if (
    typeof origin.latitude !== 'number' ||
    typeof origin.longitude !== 'number' ||
    typeof destination.latitude !== 'number' ||
    typeof destination.longitude !== 'number'
  ) {
    throw new Error('Invalid origin or destination coordinates for route calculation.');
  }

  // Prevent zero-distance routing
  const latDiff = Math.abs(origin.latitude - destination.latitude);
  const lngDiff = Math.abs(origin.longitude - destination.longitude);
  if (latDiff < 0.00005 && lngDiff < 0.00005) {
    return [
      {
        id: 'arrived',
        name: 'Arrived at Destination',
        preference: 'FASTEST',
        distanceMeters: 0,
        durationSeconds: 0,
        coordinates: [
          [origin.longitude, origin.latitude],
          [destination.longitude, destination.latitude],
        ],
        summary: 'At pickup location',
      },
    ];
  }

  // Check cache (rounded to 4 decimal places, ~11 meters)
  const cacheKey = `${origin.latitude.toFixed(4)},${origin.longitude.toFixed(4)}->${destination.latitude.toFixed(4)},${destination.longitude.toFixed(4)}`;
  const cached = routeCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.routes;
  }

  // OSRM coordinates format: {lon},{lat};{lon},{lat}
  const coordinatesStr = `${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}`;
  const url = `https://router.project-osrm.org/route/v1/driving/${coordinatesStr}?overview=full&geometries=geojson&alternatives=true&steps=false`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 9000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
      },
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Routing server responded with status: ${response.status}`);
    }

    const data: OsrmResponse = await response.json();

    if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
      throw new Error(data.message || 'No drivable road route found between these locations.');
    }

    // Map OSRM routes to RouteOption format
    const parsedRoutes: RouteOption[] = data.routes.map((r, index) => {
      const isFirst = index === 0;
      return {
        id: `route-${index}`,
        name: isFirst ? 'Fastest Route' : `Alternative Route ${index}`,
        preference: isFirst ? 'FASTEST' : 'SHORTEST',
        distanceMeters: Math.round(r.distance),
        durationSeconds: Math.round(r.duration),
        coordinates: r.geometry.coordinates,
        summary: `Via local roads (${(r.distance / 1000).toFixed(1)} km)`,
      };
    });

    // If multiple routes are returned, mark the shortest distance route as SHORTEST
    if (parsedRoutes.length > 1) {
      let shortestIdx = 0;
      for (let i = 1; i < parsedRoutes.length; i++) {
        if (parsedRoutes[i].distanceMeters < parsedRoutes[shortestIdx].distanceMeters) {
          shortestIdx = i;
        }
      }
      parsedRoutes[0].preference = 'FASTEST';
      parsedRoutes[0].name = 'Fastest Route (Default)';
      parsedRoutes[shortestIdx].preference = 'SHORTEST';
      parsedRoutes[shortestIdx].name = 'Shortest Distance Route';
    }

    // Cache result
    routeCache.set(cacheKey, { timestamp: Date.now(), routes: parsedRoutes });
    return parsedRoutes;
  } catch (err: any) {
    if (err.name === 'AbortError') {
      throw new Error('Route calculation timed out. Please check your internet connection and try again.');
    }
    console.error('OSRM route calculation error:', err);
    throw new Error(err.message || 'Unable to calculate road route to pickup location.');
  }
}

/**
 * Format meters to human readable distance (e.g. "850 m", "4.2 km")
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${meters} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}

/**
 * Format duration seconds to human readable string (e.g. "12 mins", "1 hr 15 mins")
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return '< 1 min';
  }
  const mins = Math.round(seconds / 60);
  if (mins < 60) {
    return `${mins} min${mins === 1 ? '' : 's'}`;
  }
  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  if (remainingMins === 0) {
    return `${hours} hr${hours === 1 ? '' : 's'}`;
  }
  return `${hours} hr ${remainingMins} min`;
}

/**
 * Calculate distance between two coordinates in meters using Haversine formula
 */
export function calculateHaversineDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}
