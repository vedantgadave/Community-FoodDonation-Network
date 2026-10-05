import React, { useEffect, useRef, useState } from 'react';
import { MapPin, AlertCircle, ExternalLink } from 'lucide-react';
import { maptilersdk, MAPTILER_API_KEY, isMapTilerConfigured } from '../../services/mapTilerService';

interface PickupLocationMapProps {
  latitude: number;
  longitude: number;
  locationName?: string;
  height?: string;
}

export const PickupLocationMap: React.FC<PickupLocationMapProps> = ({
  latitude,
  longitude,
  locationName,
  height = 'h-72',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<maptilersdk.Map | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!isMapTilerConfigured()) {
      setMapError('Map visualization unavailable (MapTiler key not set).');
      return;
    }

    try {
      const center: [number, number] = [longitude, latitude];

      const map = new maptilersdk.Map({
        container: mapContainerRef.current,
        style: maptilersdk.MapStyle.STREETS,
        center: center,
        zoom: 15,
        navigationControl: 'bottom-right',
      });

      mapInstanceRef.current = map;

      // Add pin marker
      const marker = new maptilersdk.Marker({ color: '#e11d48' })
        .setLngLat(center)
        .addTo(map);

      if (locationName) {
        const popup = new maptilersdk.Popup({ offset: 25 })
          .setHTML(`<div style="font-weight:600;font-size:12px;color:#0f172a;padding:4px 2px;">📍 ${locationName}</div>`);
        marker.setPopup(popup);
      }

    } catch (err: any) {
      console.error('PickupLocationMap initialization error:', err);
      setMapError('Failed to initialize map.');
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [latitude, longitude, locationName]);

  const externalMapUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-rose-500" />
          Interactive Pickup Map
        </label>
        <a
          href={externalMapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
        >
          Open in Maps <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      <div className={`relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 shadow-inner ${height}`}>
        {mapError ? (
          <div className="w-full h-full p-6 text-center flex flex-col items-center justify-center text-slate-500 dark:text-slate-400">
            <AlertCircle className="w-8 h-8 text-amber-500 mb-2" />
            <p className="text-xs">{mapError}</p>
          </div>
        ) : (
          <div ref={mapContainerRef} className="w-full h-full rounded-2xl" />
        )}
      </div>
    </div>
  );
};
