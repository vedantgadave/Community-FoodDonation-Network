import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  maptilersdk, 
  isMapTilerConfigured 
} from '../../services/mapTilerService';
import { 
  calculateRealRoutes, 
  formatDistance, 
  formatDuration, 
  calculateHaversineDistanceMeters 
} from '../../services/routingService';
import { 
  updateJourneyLocation, 
  stopPickupJourney, 
  startPickupJourney 
} from '../../services/journeyService';
import type { 
  Donation, 
  UserProfile, 
  RouteOption, 
  RoutePreference, 
  PickupJourney 
} from '../../types';
import { 
  Navigation, 
  LocateFixed, 
  Clock, 
  Milestone, 
  AlertTriangle, 
  RefreshCw, 
  Square, 
  CheckCircle2, 
  Radio, 
  Route as RouteIcon,
  MapPin,
  Compass
} from 'lucide-react';
import { Button } from '../ui/Button';

interface LiveNavigationMapProps {
  donation: Donation;
  currentUser: UserProfile;
  onFinishPickup?: () => void;
  onCloseNavigation?: () => void;
}

export const LiveNavigationMap: React.FC<LiveNavigationMapProps> = ({
  donation,
  currentUser,
  onFinishPickup,
  onCloseNavigation,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<maptilersdk.Map | null>(null);
  const receiverMarkerRef = useRef<maptilersdk.Marker | null>(null);
  const destinationMarkerRef = useRef<maptilersdk.Marker | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const lastWriteTimeRef = useRef<number>(0);
  const lastRoutedCoordsRef = useRef<{ lat: number; lng: number } | null>(null);

  // Component state
  const [currentPosition, setCurrentPosition] = useState<{ latitude: number; longitude: number } | null>(null);
  const [routes, setRoutes] = useState<RouteOption[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<RouteOption | null>(null);
  const [routePreference, setRoutePreference] = useState<RoutePreference>('FASTEST');
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
  const [gpsStatus, setGpsStatus] = useState<'AQUIRING' | 'ACTIVE' | 'SIGNAL_LOST' | 'DENIED' | 'UNAVAILABLE' | 'STOPPED'>('AQUIRING');
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [routeError, setRouteError] = useState<string | null>(null);
  const [isRerouting, setIsRerouting] = useState(false);
  const [hasArrived, setHasArrived] = useState(false);
  const [accuracyWarning, setAccuracyWarning] = useState<string | null>(null);

  // Validate destination pickup coordinates
  const validPickupCoords = donation.pickupCoordinates &&
    typeof donation.pickupCoordinates.latitude === 'number' &&
    typeof donation.pickupCoordinates.longitude === 'number' &&
    !isNaN(donation.pickupCoordinates.latitude) &&
    !isNaN(donation.pickupCoordinates.longitude) &&
    donation.pickupCoordinates.latitude >= -90 &&
    donation.pickupCoordinates.latitude <= 90 &&
    donation.pickupCoordinates.longitude >= -180 &&
    donation.pickupCoordinates.longitude <= 180
      ? donation.pickupCoordinates
      : null;

  const destLat = validPickupCoords?.latitude;
  const destLng = validPickupCoords?.longitude;

  // Draw or update GeoJSON route on map
  const renderRouteOnMap = useCallback((routeCoords: [number, number][]) => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const sourceId = 'active-navigation-route';
    const layerId = 'active-navigation-line';
    const casingLayerId = 'active-navigation-casing';

    const geojsonData: GeoJSON.Feature<GeoJSON.LineString> = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: routeCoords,
      },
    };

    const applyLayers = () => {
      try {
        if (map.getSource(sourceId)) {
          (map.getSource(sourceId) as any).setData(geojsonData);
        } else {
          map.addSource(sourceId, {
            type: 'geojson',
            data: geojsonData,
          });

          // Outer road line casing
          map.addLayer({
            id: casingLayerId,
            type: 'line',
            source: sourceId,
            layout: {
              'line-join': 'round',
              'line-cap': 'round',
            },
            paint: {
              'line-color': '#064e3b',
              'line-width': 8,
              'line-opacity': 0.7,
            },
          });

          // Vibrant emerald route line
          map.addLayer({
            id: layerId,
            type: 'line',
            source: sourceId,
            layout: {
              'line-join': 'round',
              'line-cap': 'round',
            },
            paint: {
              'line-color': '#10b981',
              'line-width': 5,
            },
          });
        }

        // Fit map bounds to entire route
        if (routeCoords.length > 0) {
          const bounds = new maptilersdk.LngLatBounds();
          routeCoords.forEach((coord) => bounds.extend(coord));
          map.fitBounds(bounds, { padding: 80, maxZoom: 16, duration: 1000 });
        }
      } catch (err) {
        console.warn('Error applying route layer:', err);
      }
    };

    if (map.isStyleLoaded()) {
      applyLayers();
    } else {
      map.once('load', applyLayers);
    }
  }, []);

  // Compute road routes via OSRM with true coordinates
  const computeAndApplyRoute = useCallback(async (origin: { latitude: number; longitude: number }, isReroute = false) => {
    if (destLat === undefined || destLng === undefined) {
      setRouteError('Pickup location coordinates are not available.');
      return;
    }

    if (isReroute) setIsRerouting(true);
    else setIsCalculatingRoute(true);
    setRouteError(null);

    try {
      const calcRoutes = await calculateRealRoutes(origin, { latitude: destLat, longitude: destLng });
      setRoutes(calcRoutes);

      const preferred = calcRoutes.find((r) => r.preference === routePreference) || calcRoutes[0];
      setSelectedRoute(preferred);

      if (preferred && preferred.coordinates.length > 0) {
        renderRouteOnMap(preferred.coordinates);
      }

      // Record this point as last routed
      lastRoutedCoordsRef.current = { lat: origin.latitude, lng: origin.longitude };

      // Publish active route metadata to Firestore journey
      const dist = preferred.distanceMeters;
      const dur = preferred.durationSeconds;
      const eta = new Date(Date.now() + dur * 1000).toISOString();

      await updateJourneyLocation(donation.id, currentUser.uid, {
        currentLatitude: origin.latitude,
        currentLongitude: origin.longitude,
        journeyStatus: dist <= 40 ? 'ARRIVED' : 'IN_TRANSIT',
        remainingDistanceMeters: dist,
        estimatedDurationSeconds: dur,
        etaTimestamp: eta,
        selectedRoutePreference: preferred.preference,
        activeRoutePolyline: preferred.coordinates,
      }).catch((e) => console.warn('updateJourneyLocation error caught:', e));

      if (dist <= 40) {
        setHasArrived(true);
      }
    } catch (err: any) {
      console.error('Failed to calculate route:', err);
      setRouteError(err.message || 'Could not find a road route. Please verify your internet connection.');
    } finally {
      setIsCalculatingRoute(false);
      setIsRerouting(false);
    }
  }, [destLat, destLng, donation.id, currentUser.uid, routePreference, renderRouteOnMap]);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (destLat === undefined || destLng === undefined) return;

    if (!isMapTilerConfigured()) {
      setRouteError('Map visualization key not configured.');
      return;
    }

    try {
      const map = new maptilersdk.Map({
        container: mapContainerRef.current,
        style: maptilersdk.MapStyle.STREETS,
        center: [destLng, destLat],
        zoom: 14,
        navigationControl: 'bottom-right',
      });

      mapInstanceRef.current = map;

      // Destination Marker
      const destEl = document.createElement('div');
      destEl.className = 'destination-pin-marker';
      destEl.innerHTML = `
        <div style="background:#e11d48;color:white;padding:8px;border-radius:9999px;box-shadow:0 10px 15px -3px rgba(0,0,0,0.3);border:3px solid white;display:flex;align-items:center;justify-content:center;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
        </div>
      `;

      const destMarker = new maptilersdk.Marker({ element: destEl })
        .setLngLat([destLng, destLat])
        .addTo(map);

      const destPopup = new maptilersdk.Popup({ offset: 25 })
        .setHTML(`<div style="font-size:12px;font-weight:bold;color:#0f172a;padding:2px;">📍 Pickup: ${donation.pickupLocation}</div>`);
      destMarker.setPopup(destPopup);
      destinationMarkerRef.current = destMarker;

      map.on('load', () => {
        map.resize();
        if (selectedRoute && selectedRoute.coordinates.length > 0) {
          renderRouteOnMap(selectedRoute.coordinates);
        }
      });
    } catch (err: any) {
      console.error('Failed to init map:', err);
      setRouteError('Failed to initialize navigation map.');
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [destLat, destLng, donation.pickupLocation]);

  // GPS Watcher & Real-time position tracking
  const startGpsWatcher = useCallback(() => {
    if (destLat === undefined || destLng === undefined) return;

    if (!('geolocation' in navigator)) {
      setGpsStatus('UNAVAILABLE');
      setGpsError('Geolocation is not supported by your browser or device.');
      return;
    }

    setGpsStatus('AQUIRING');
    setGpsError(null);

    // Initial journey session record in Firestore
    const initJourneySession = async (initialLat: number, initialLng: number) => {
      const initialPayload: PickupJourney = {
        id: donation.id,
        donationId: donation.id,
        receiverId: currentUser.uid,
        receiverName: currentUser.organizationName || currentUser.name,
        receiverPhone: currentUser.phone,
        donorId: donation.donorId,
        currentLatitude: initialLat,
        currentLongitude: initialLng,
        destinationLatitude: destLat,
        destinationLongitude: destLng,
        destinationAddress: donation.pickupLocation,
        journeyStatus: 'IN_TRANSIT',
        selectedRoutePreference: routePreference,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await startPickupJourney(initialPayload).catch((e) => console.warn('startPickupJourney error:', e));
    };

    const updateReceiverMarkerOnMap = (lat: number, lng: number) => {
      const map = mapInstanceRef.current;
      if (map) {
        if (!receiverMarkerRef.current) {
          const el = document.createElement('div');
          el.className = 'receiver-gps-marker';
          el.innerHTML = `
            <div style="background:#0284c7;color:white;padding:7px;border-radius:9999px;box-shadow:0 0 15px rgba(2,132,199,0.8);border:3px solid white;display:flex;align-items:center;justify-content:center;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
            </div>
          `;
          const marker = new maptilersdk.Marker({ element: el })
            .setLngLat([lng, lat])
            .addTo(map);
          receiverMarkerRef.current = marker;
        } else {
          receiverMarkerRef.current.setLngLat([lng, lat]);
        }
      }
    };

    const handlePositionUpdate = (pos: GeolocationPosition) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      const accuracy = pos.coords.accuracy;
      const heading = pos.coords.heading || undefined;
      const speed = pos.coords.speed || undefined;

      const newPos = { latitude: lat, longitude: lng };
      setCurrentPosition(newPos);
      setGpsStatus('ACTIVE');
      setGpsError(null);

      if (accuracy > 100) {
        setAccuracyWarning(`GPS accuracy is approx ±${Math.round(accuracy)}m. Move closer to open sky for tighter road tracking.`);
      } else {
        setAccuracyWarning(null);
      }

      // Update receiver marker on map
      updateReceiverMarkerOnMap(lat, lng);

      // Initial route on first GPS fix
      if (!lastRoutedCoordsRef.current) {
        initJourneySession(lat, lng);
        computeAndApplyRoute(newPos);
        return;
      }

      // Rerouting: If receiver moved > 40 meters from previous calculation point
      const movedDist = calculateHaversineDistanceMeters(
        lastRoutedCoordsRef.current.lat,
        lastRoutedCoordsRef.current.lng,
        lat,
        lng
      );

      if (movedDist > 40) {
        computeAndApplyRoute(newPos, true);
      }

      // Check Arrival (< 40m)
      const distToDest = calculateHaversineDistanceMeters(lat, lng, destLat, destLng);
      if (distToDest <= 40) {
        setHasArrived(true);
      }

      // Throttled Firestore coordinate publishing (every 5 seconds)
      const now = Date.now();
      if (now - lastWriteTimeRef.current > 5000) {
        lastWriteTimeRef.current = now;
        updateJourneyLocation(donation.id, currentUser.uid, {
          currentLatitude: lat,
          currentLongitude: lng,
          heading,
          speed,
          journeyStatus: distToDest <= 40 ? 'ARRIVED' : 'IN_TRANSIT',
          remainingDistanceMeters: Math.round(distToDest),
        }).catch((e) => console.warn('Throttled GPS sync error:', e));
      }
    };

    const handleError = (err: GeolocationPositionError) => {
      console.warn('Geolocation error:', err.code, err.message);
      if (err.code === err.PERMISSION_DENIED) {
        setGpsStatus('DENIED');
        setGpsError('Location permission was denied. Please allow location access in your browser address bar to navigate to the pickup point.');
      } else if (err.code === err.POSITION_UNAVAILABLE) {
        setGpsStatus('UNAVAILABLE');
        setGpsError('GPS signal is currently unavailable. Please check your device location services.');
      } else if (err.code === err.TIMEOUT) {
        setGpsStatus('SIGNAL_LOST');
        setGpsError('GPS acquisition timed out. Re-trying location fix...');
      }
    };

    const watchId = navigator.geolocation.watchPosition(handlePositionUpdate, handleError, {
      enableHighAccuracy: true,
      timeout: 12000,
      maximumAge: 4000,
    });
    watchIdRef.current = watchId;
  }, [destLat, destLng, donation, currentUser, computeAndApplyRoute, routePreference]);

  useEffect(() => {
    startGpsWatcher();

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [startGpsWatcher]);

  // Recenter map on user location
  const handleRecenter = () => {
    if (!mapInstanceRef.current || !currentPosition) return;
    mapInstanceRef.current.flyTo({
      center: [currentPosition.longitude, currentPosition.latitude],
      zoom: 16,
      duration: 1200,
    });
  };

  // Stop active navigation cleanly and remove Firestore journey
  const handleStopNavigation = async () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setGpsStatus('STOPPED');
    await stopPickupJourney(donation.id);
    if (onCloseNavigation) onCloseNavigation();
  };

  // Route alternative selection
  const handleSelectRouteOption = (route: RouteOption) => {
    setSelectedRoute(route);
    setRoutePreference(route.preference);
    renderRouteOnMap(route.coordinates);
    if (currentPosition) {
      updateJourneyLocation(donation.id, currentUser.uid, {
        currentLatitude: currentPosition.latitude,
        currentLongitude: currentPosition.longitude,
        remainingDistanceMeters: route.distanceMeters,
        estimatedDurationSeconds: route.durationSeconds,
        selectedRoutePreference: route.preference,
        activeRoutePolyline: route.coordinates,
      }).catch(() => {});
    }
  };

  // If pickup location is missing coordinates, do NOT fabricate anything
  if (!validPickupCoords) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center space-y-4 shadow-xl">
        <div className="w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center mx-auto">
          <MapPin className="w-8 h-8" />
        </div>
        <div>
          <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">
            Pickup location coordinates unavailable
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
            This donation has an address ({donation.pickupLocation}) but exact GPS coordinates were not pinned by the donor. Live turn-by-turn navigation cannot calculate a road route without valid destination coordinates.
          </p>
        </div>
        <div className="flex justify-center gap-3 pt-2">
          {onCloseNavigation && (
            <Button variant="outline" size="sm" onClick={onCloseNavigation}>
              Return to Listing
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[650px] bg-slate-900 text-white rounded-3xl overflow-hidden border border-slate-800 shadow-2xl relative">
      {/* TOP HUD: Destination & Live Metrics Bar */}
      <div className="p-4 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 z-10 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-600/20 text-emerald-400 rounded-2xl border border-emerald-500/30 flex items-center justify-center">
            <Compass className="w-5 h-5 animate-spin" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                {gpsStatus === 'ACTIVE' && <Radio className="w-3.5 h-3.5 animate-ping text-emerald-400" />}
                {gpsStatus === 'ACTIVE' ? 'Navigation Active' : gpsStatus === 'AQUIRING' ? 'Acquiring GPS...' : 'GPS Status: ' + gpsStatus}
              </span>
              {isRerouting && (
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <RefreshCw className="w-3 h-3 animate-spin" /> Recalculating route...
                </span>
              )}
            </div>
            <h2 className="text-sm font-extrabold text-white line-clamp-1">
              {donation.pickupLocation}
            </h2>
          </div>
        </div>

        {/* Live Distance & ETA Pills from OSRM */}
        {selectedRoute && (
          <div className="flex items-center gap-2">
            <div className="bg-slate-800/90 px-3 py-1.5 rounded-xl border border-slate-700/80 flex items-center gap-2">
              <Milestone className="w-4 h-4 text-emerald-400" />
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Distance</span>
                <span className="text-xs font-extrabold text-white">
                  {formatDistance(selectedRoute.distanceMeters)}
                </span>
              </div>
            </div>

            <div className="bg-slate-800/90 px-3 py-1.5 rounded-xl border border-slate-700/80 flex items-center gap-2">
              <Clock className="w-4 h-4 text-teal-400" />
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-mono block">ETA</span>
                <span className="text-xs font-extrabold text-teal-300">
                  {formatDuration(selectedRoute.durationSeconds)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* GPS Warning / Permission Bar */}
      {gpsError && (
        <div className="bg-rose-950/90 border-b border-rose-800 text-rose-200 text-xs px-4 py-2.5 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{gpsError}</span>
          </div>
          <button
            onClick={startGpsWatcher}
            className="text-[11px] font-bold text-rose-200 hover:text-white underline ml-2 shrink-0"
          >
            Retry Location
          </button>
        </div>
      )}

      {accuracyWarning && !gpsError && (
        <div className="bg-amber-950/80 border-b border-amber-800 text-amber-200 text-[11px] px-4 py-1.5 flex items-center gap-2 z-10">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>{accuracyWarning}</span>
        </div>
      )}

      {routeError && !gpsError && (
        <div className="bg-amber-950/90 border-b border-amber-800 text-amber-200 text-xs px-4 py-2.5 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{routeError}</span>
          </div>
          <button
            onClick={() => currentPosition && computeAndApplyRoute(currentPosition)}
            className="text-[11px] font-bold text-amber-300 hover:text-white underline ml-2 shrink-0"
          >
            Recalculate Route
          </button>
        </div>
      )}

      {/* Arrival Banner */}
      {hasArrived && (
        <div className="bg-emerald-950/95 border-b border-emerald-700 text-emerald-100 text-xs px-4 py-3 flex items-center justify-between z-10 animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <p className="font-extrabold text-white text-sm">You have arrived at the pickup location!</p>
              <p className="text-[11px] text-emerald-300">Please meet donor {donation.donorName} and verify the food safety package.</p>
            </div>
          </div>
          {onFinishPickup && (
            <Button
              variant="primary"
              size="sm"
              onClick={onFinishPickup}
              className="bg-emerald-600 hover:bg-emerald-500 font-bold"
            >
              Confirm Picked Up
            </Button>
          )}
        </div>
      )}

      {/* MAP VIEW CONTAINER */}
      <div className="flex-1 w-full relative">
        <div ref={mapContainerRef} className="w-full h-full min-h-[350px]" />

        {/* Floating Controls */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
          <button
            onClick={handleRecenter}
            disabled={!currentPosition}
            className="p-3 bg-slate-900/90 hover:bg-slate-800 disabled:opacity-40 text-white rounded-2xl shadow-xl border border-slate-700/80 transition-all hover:scale-105"
            title="Recenter on My Location"
            aria-label="Recenter on My Location"
          >
            <LocateFixed className="w-5 h-5 text-emerald-400" />
          </button>

          <button
            onClick={() => currentPosition && computeAndApplyRoute(currentPosition, true)}
            disabled={!currentPosition || isCalculatingRoute}
            className="p-3 bg-slate-900/90 hover:bg-slate-800 disabled:opacity-40 text-white rounded-2xl shadow-xl border border-slate-700/80 transition-all hover:scale-105"
            title="Recalculate Route"
            aria-label="Recalculate Route"
          >
            <RefreshCw className={`w-5 h-5 text-teal-400 ${isCalculatingRoute ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Loading Overlay */}
        {isCalculatingRoute && (
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-2xs flex items-center justify-center z-20">
            <div className="bg-slate-900/90 px-5 py-3 rounded-2xl border border-slate-800 shadow-xl flex items-center gap-3">
              <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
              <span className="text-xs font-bold text-slate-200">Calculating real road route via OpenStreetMap...</span>
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM FOOTER */}
      <div className="p-4 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 z-10 space-y-3">
        {routes.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1 shrink-0">
              <RouteIcon className="w-3.5 h-3.5" /> Routes:
            </span>
            {routes.map((r) => {
              const isSelected = selectedRoute?.id === r.id;
              return (
                <button
                  key={r.id}
                  onClick={() => handleSelectRouteOption(r)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <span>{r.name}</span>
                  <span className="text-[10px] opacity-80">
                    ({formatDistance(r.distanceMeters)} • {formatDuration(r.durationSeconds)})
                  </span>
                </button>
              );
            })}
          </div>
        )}

        <div className="flex items-center justify-between gap-3">
          <div className="text-[11px] text-slate-400">
            <span>Live GPS road navigation • Throttled real-time updates</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleStopNavigation}
              className="border-slate-700 text-slate-300 hover:bg-slate-800 text-xs"
              leftIcon={<Square className="w-3.5 h-3.5 text-rose-400" />}
            >
              Stop Navigation
            </Button>

            {onFinishPickup && (
              <Button
                variant="primary"
                size="sm"
                onClick={onFinishPickup}
                className="bg-emerald-600 hover:bg-emerald-500 font-bold text-xs"
                leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
              >
                Mark as Picked Up
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
