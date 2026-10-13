import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  maptilersdk, 
  MAPTILER_API_KEY, 
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
  Compass, 
  LocateFixed, 
  Clock, 
  Milestone, 
  AlertTriangle, 
  RefreshCw, 
  Square, 
  CheckCircle2, 
  Radio, 
  Route as RouteIcon,
  Sparkles,
  MapPin
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
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [routeError, setRouteError] = useState<string | null>(null);
  const [isRerouting, setIsRerouting] = useState(false);
  const [hasArrived, setHasArrived] = useState(false);
  const [journeyActive, setJourneyActive] = useState(true);

  // Guaranteed valid coordinates (fallback to central district if donor didn't pin)
  const destLat = donation.pickupCoordinates?.latitude || 16.7050;
  const destLng = donation.pickupCoordinates?.longitude || 74.2433;

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

          // Glowing outer casing for road visibility
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
              'line-opacity': 0.6,
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

        // Auto-fit camera to bound entire route + receiver + destination
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

  // Compute road routes via OSRM
  const computeAndApplyRoute = useCallback(async (origin: { latitude: number; longitude: number }, isReroute = false) => {
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

      // Publish/Synchronize active route metadata to Firestore journey
      const dist = preferred.distanceMeters;
      const dur = preferred.durationSeconds;
      const eta = new Date(Date.now() + dur * 1000).toISOString();

      await updateJourneyLocation(donation.id, currentUser.uid, {
        currentLatitude: origin.latitude,
        currentLongitude: origin.longitude,
        journeyStatus: dist < 50 ? 'ARRIVED' : 'IN_TRANSIT',
        remainingDistanceMeters: dist,
        estimatedDurationSeconds: dur,
        etaTimestamp: eta,
        selectedRoutePreference: preferred.preference,
        activeRoutePolyline: preferred.coordinates,
      }).catch((e) => console.warn('updateJourneyLocation error caught:', e));

      if (dist < 50) {
        setHasArrived(true);
      }

    } catch (err: any) {
      console.error('Failed to calculate route:', err);
      setRouteError(err.message || 'Could not find a road route. Please verify internet connection.');
    } finally {
      setIsCalculatingRoute(false);
      setIsRerouting(false);
    }
  }, [destLat, destLng, donation.id, currentUser.uid, routePreference, renderRouteOnMap]);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

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

      // Destination Marker (Red pin with pulse effect)
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

      // In case style takes time to load, trigger resize
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

  // Geolocation tracking with Simulated Start Fallback if GPS blocked or unavailable
  useEffect(() => {
    // Initial journey session initialization in Firestore
    const initJourney = async (initialLat: number, initialLng: number) => {
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
      await startPickupJourney(initialPayload).catch((e) => console.warn('startPickupJourney error caught:', e));
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

    const handlePositionUpdate = (lat: number, lng: number, heading?: number, speed?: number) => {
      const newPos = { latitude: lat, longitude: lng };
      setCurrentPosition(newPos);
      setGpsError(null);

      // 1. Update Marker
      updateReceiverMarkerOnMap(lat, lng);

      // 2. Initial route calculation on first fix
      if (!lastRoutedCoordsRef.current) {
        initJourney(lat, lng);
        computeAndApplyRoute(newPos);
        return;
      }

      // 3. Dynamic Rerouting trigger: If receiver moved > 40 meters
      const movedDist = calculateHaversineDistanceMeters(
        lastRoutedCoordsRef.current.lat,
        lastRoutedCoordsRef.current.lng,
        lat,
        lng
      );

      if (movedDist > 40) {
        computeAndApplyRoute(newPos, true);
      }

      // 4. Check Arrival (< 40m)
      const distToDest = calculateHaversineDistanceMeters(lat, lng, destLat, destLng);
      if (distToDest <= 40) {
        setHasArrived(true);
      }

      // 5. Throttled Firestore coordinate publishing (every 5 seconds)
      const now = Date.now();
      if (now - lastWriteTimeRef.current > 5000) {
        lastWriteTimeRef.current = now;
        updateJourneyLocation(donation.id, currentUser.uid, {
          currentLatitude: lat,
          currentLongitude: lng,
          heading: typeof heading === 'number' ? heading : undefined,
          speed: typeof speed === 'number' ? speed : undefined,
          journeyStatus: distToDest <= 40 ? 'ARRIVED' : 'IN_TRANSIT',
          remainingDistanceMeters: Math.round(distToDest),
        }).catch((e) => console.warn('Throttled GPS sync error:', e));
      }
    };

    if (navigator.geolocation) {
      const handleSuccess = (pos: GeolocationPosition) => {
        handlePositionUpdate(
          pos.coords.latitude,
          pos.coords.longitude,
          pos.coords.heading || undefined,
          pos.coords.speed || undefined
        );
      };

      const handleError = (err: GeolocationPositionError) => {
        console.warn('Geolocation warning code:', err.code, err.message);
        let msg = 'Unable to acquire GPS location.';
        if (err.code === err.PERMISSION_DENIED) {
          msg = 'Location permission is denied in browser. Using district starting position so you can preview the route!';
          // Provide realistic starting position ~2.5 km away so road route computes instantly
          const fallbackStartLat = destLat + 0.015;
          const fallbackStartLng = destLng + 0.015;
          handlePositionUpdate(fallbackStartLat, fallbackStartLng);
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          msg = 'GPS signal unavailable. Using estimated dispatch location.';
          const fallbackStartLat = destLat + 0.015;
          const fallbackStartLng = destLng + 0.015;
          handlePositionUpdate(fallbackStartLat, fallbackStartLng);
        } else if (err.code === err.TIMEOUT) {
          msg = 'GPS acquisition timed out. Retrying...';
        }
        setGpsError(msg);
      };

      const watchId = navigator.geolocation.watchPosition(handleSuccess, handleError, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000,
      });
      watchIdRef.current = watchId;

    } else {
      // Fallback for browsers without geolocation
      setGpsError('Geolocation not supported on this device. Using default dispatch point.');
      const fallbackStartLat = destLat + 0.015;
      const fallbackStartLng = destLng + 0.015;
      handlePositionUpdate(fallbackStartLat, fallbackStartLng);
    }

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [destLat, destLng, donation, currentUser, computeAndApplyRoute, routePreference]);

  // Recenter map on user location
  const handleRecenter = () => {
    if (!mapInstanceRef.current || !currentPosition) return;
    mapInstanceRef.current.flyTo({
      center: [currentPosition.longitude, currentPosition.latitude],
      zoom: 16,
      duration: 1200,
    });
  };

  // Stop active navigation
  const handleStopNavigation = async () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }
    setJourneyActive(false);
    await stopPickupJourney(donation.id);
    if (onCloseNavigation) onCloseNavigation();
  };

  // Switch between Fastest / Shortest routes
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

  return (
    <div className="flex flex-col h-[650px] bg-slate-900 text-white rounded-3xl overflow-hidden border border-slate-800 shadow-2xl relative">
      {/* TOP HUD: Destination & Live Metrics Bar */}
      <div className="p-4 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 z-10 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-600/20 text-emerald-400 rounded-2xl border border-emerald-500/30 flex items-center justify-center">
            <Navigation className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 animate-ping text-emerald-400" /> Live GPS Turn Navigation
              </span>
              {isRerouting && (
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <RefreshCw className="w-3 h-3 animate-spin" /> Rerouting...
                </span>
              )}
            </div>
            <h2 className="text-sm font-extrabold text-white line-clamp-1">
              {donation.pickupLocation}
            </h2>
          </div>
        </div>

        {/* Live Distance & ETA Pills */}
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

      {/* GPS / Route Alerts */}
      {gpsError && (
        <div className="bg-amber-950/90 border-b border-amber-800 text-amber-200 text-xs px-4 py-2.5 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{gpsError}</span>
          </div>
          <button
            onClick={() => currentPosition && computeAndApplyRoute(currentPosition)}
            className="text-[11px] font-bold text-amber-300 hover:text-white underline ml-2"
          >
            Retry
          </button>
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
            className="text-[11px] font-bold text-amber-300 hover:text-white underline ml-2"
          >
            Recalculate
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
              <p className="text-[11px] text-emerald-300">Please meet donor {donation.donorName} and verify the food safety seal.</p>
            </div>
          </div>
          {onFinishPickup && (
            <Button
              variant="primary"
              size="sm"
              onClick={onFinishPickup}
              className="bg-emerald-600 hover:bg-emerald-500 font-bold"
            >
              Confirm Food Picked Up
            </Button>
          )}
        </div>
      )}

      {/* MAP VIEW CONTAINER */}
      <div className="flex-1 w-full relative">
        <div ref={mapContainerRef} className="w-full h-full min-h-[350px]" />

        {/* Floating Controls Overlay */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
          <button
            onClick={handleRecenter}
            className="p-3 bg-slate-900/90 hover:bg-slate-800 text-white rounded-2xl shadow-xl border border-slate-700/80 transition-all hover:scale-105"
            title="Recenter on My Location"
            aria-label="Recenter on My Location"
          >
            <LocateFixed className="w-5 h-5 text-emerald-400" />
          </button>

          <button
            onClick={() => currentPosition && computeAndApplyRoute(currentPosition, true)}
            className="p-3 bg-slate-900/90 hover:bg-slate-800 text-white rounded-2xl shadow-xl border border-slate-700/80 transition-all hover:scale-105"
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
              <span className="text-xs font-bold text-slate-200">Computing genuine road route...</span>
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM FOOTER: Route Alternatives & Navigation Actions */}
      <div className="p-4 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 z-10 space-y-3">
        {/* Route Alternatives Selection */}
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
            <span>Live location shared with donor • OpenStreetMap road network</span>
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
