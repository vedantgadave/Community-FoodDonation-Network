import React, { useEffect, useState, useRef } from 'react';
import { 
  maptilersdk, 
  isMapTilerConfigured 
} from '../../services/mapTilerService';
import { subscribeToPickupJourney } from '../../services/journeyService';
import { formatDistance, formatDuration } from '../../services/routingService';
import type { Donation, PickupJourney } from '../../types';
import { 
  Truck, 
  MapPin, 
  Clock, 
  Milestone, 
  CheckCircle2, 
  ShieldCheck, 
  Radio, 
  Navigation,
  Phone
} from 'lucide-react';

interface DonorTrackingCardProps {
  donation: Donation;
}

export const DonorTrackingCard: React.FC<DonorTrackingCardProps> = ({ donation }) => {
  const [journey, setJourney] = useState<PickupJourney | null>(null);
  const [loading, setLoading] = useState(true);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<maptilersdk.Map | null>(null);
  const receiverMarkerRef = useRef<maptilersdk.Marker | null>(null);

  const destLat = donation.pickupCoordinates?.latitude ?? journey?.destinationLatitude;
  const destLng = donation.pickupCoordinates?.longitude ?? journey?.destinationLongitude;

  // Real-time subscription to active journey
  useEffect(() => {
    if (!donation.id) return;

    setLoading(true);
    const unsubscribe = subscribeToPickupJourney(
      donation.id,
      (liveJourney) => {
        setJourney(liveJourney);
        setLoading(false);
      },
      (err) => {
        console.warn('Journey subscription error:', err);
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [donation.id]);

  // Map Initialization & Updates when Journey is Active
  useEffect(() => {
    if (!journey || !mapContainerRef.current) return;
    if (!isMapTilerConfigured()) return;

    if (!mapInstanceRef.current) {
      const map = new maptilersdk.Map({
        container: mapContainerRef.current,
        style: maptilersdk.MapStyle.STREETS,
        center: [journey.currentLongitude, journey.currentLatitude],
        zoom: 14,
        navigationControl: 'bottom-right',
      });

      mapInstanceRef.current = map;

      // Destination Marker (Donor's pickup location)
      const destEl = document.createElement('div');
      destEl.innerHTML = `
        <div style="background:#e11d48;color:white;padding:6px;border-radius:9999px;box-shadow:0 10px 15px -3px rgba(0,0,0,0.3);border:2px solid white;display:flex;align-items:center;justify-content:center;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
        </div>
      `;
      new maptilersdk.Marker({ element: destEl })
        .setLngLat([destLng, destLat])
        .addTo(map);

      // Receiver GPS Marker (Vehicle/NGO)
      const recEl = document.createElement('div');
      recEl.innerHTML = `
        <div style="background:#0284c7;color:white;padding:7px;border-radius:9999px;box-shadow:0 0 15px rgba(2,132,199,0.8);border:3px solid white;display:flex;align-items:center;justify-content:center;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
        </div>
      `;
      receiverMarkerRef.current = new maptilersdk.Marker({ element: recEl })
        .setLngLat([journey.currentLongitude, journey.currentLatitude])
        .addTo(map);

      // Render polyline if available
      if (journey.activeRoutePolyline && journey.activeRoutePolyline.length > 0) {
        map.on('load', () => {
          map.addSource('donor-track-route', {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: journey.activeRoutePolyline!,
              },
            },
          });
          map.addLayer({
            id: 'donor-track-route-line',
            type: 'line',
            source: 'donor-track-route',
            layout: { 'line-join': 'round', 'line-cap': 'round' },
            paint: { 'line-color': '#0284c7', 'line-width': 5 },
          });
        });
      }
    } else {
      // Update receiver marker position
      if (receiverMarkerRef.current) {
        receiverMarkerRef.current.setLngLat([journey.currentLongitude, journey.currentLatitude]);
      }
    }

    return () => {
      // Don't tear down on every coordinate update, only on unmount
    };
  }, [journey, destLat, destLng]);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // If donation is not accepted yet or finished, don't show active tracker
  if (donation.status === 'AVAILABLE') {
    return null;
  }

  const isCompletedOrPickedUp = donation.status === 'PICKED_UP' || donation.status === 'COMPLETED';

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-2xl ${
            isCompletedOrPickedUp
              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400'
              : 'bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-400'
          }`}>
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                {isCompletedOrPickedUp ? 'Food Rescue Fulfilled' : 'Live NGO Pickup Tracking'}
              </h3>
              {journey && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800 dark:bg-teal-950/80 dark:text-teal-300">
                  <Radio className="w-3 h-3 text-teal-500 animate-ping" /> Live GPS
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Assigned NGO: <strong className="text-slate-800 dark:text-slate-200">{donation.acceptedByName || 'Authorized Receiver'}</strong>
            </p>
          </div>
        </div>

        {/* Status Pill */}
        <span className={`text-xs font-bold px-3 py-1 rounded-full ${
          donation.status === 'COMPLETED'
            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
            : donation.status === 'PICKED_UP'
            ? 'bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300'
            : journey?.journeyStatus === 'ARRIVED'
            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 animate-pulse'
            : 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
        }`}>
          {donation.status === 'COMPLETED'
            ? 'Rescue Completed'
            : donation.status === 'PICKED_UP'
            ? 'Food Picked Up'
            : journey?.journeyStatus === 'ARRIVED'
            ? 'Receiver Arrived at Pickup!'
            : 'Receiver En Route'}
        </span>
      </div>

      {/* Live Metrics Row when in transit */}
      {journey && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
          {typeof journey.remainingDistanceMeters === 'number' && (
            <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-mono block flex items-center gap-1">
                <Milestone className="w-3 h-3 text-teal-600" /> Remaining Distance
              </span>
              <span className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                {formatDistance(journey.remainingDistanceMeters)}
              </span>
            </div>
          )}

          {typeof journey.estimatedDurationSeconds === 'number' && (
            <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-mono block flex items-center gap-1">
                <Clock className="w-3 h-3 text-teal-600" /> Estimated Arrival
              </span>
              <span className="text-sm font-extrabold text-teal-600 dark:text-teal-400">
                {formatDuration(journey.estimatedDurationSeconds)}
              </span>
            </div>
          )}

          {journey.receiverPhone && (
            <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 col-span-2 sm:col-span-1">
              <span className="text-[10px] text-slate-400 uppercase font-mono block flex items-center gap-1">
                <Phone className="w-3 h-3 text-teal-600" /> Contact NGO
              </span>
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                {journey.receiverPhone}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Map visualization when journey active */}
      {journey ? (
        <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 h-64 relative">
          <div ref={mapContainerRef} className="w-full h-full" />
        </div>
      ) : (
        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 flex items-start gap-3">
          <Navigation className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-slate-800 dark:text-slate-200">
              {donation.status === 'ACCEPTED'
                ? 'The assigned NGO has accepted this donation and is preparing for pickup.'
                : 'Donation has been verified and safely transferred to the community network.'}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Live GPS tracking automatically appears when the NGO driver initiates their navigation route.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
