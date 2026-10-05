import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, AlertCircle, CheckCircle2, Search, RotateCcw } from 'lucide-react';
import { maptilersdk, MAPTILER_API_KEY, isMapTilerConfigured, DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from '../../services/mapTilerService';

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface LocationPickerProps {
  selectedCoordinates?: Coordinates;
  onLocationSelected: (coords: Coordinates) => void;
  onLocationCleared?: () => void;
}

export const LocationPicker: React.FC<LocationPickerProps> = ({
  selectedCoordinates,
  onLocationSelected,
  onLocationCleared,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<maptilersdk.Map | null>(null);
  const markerInstanceRef = useRef<maptilersdk.Marker | null>(null);

  const [coords, setCoords] = useState<Coordinates | undefined>(selectedCoordinates);
  const [geoLoading, setGeoLoading] = useState<boolean>(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searching, setSearching] = useState<boolean>(false);

  // Initialize MapTiler map once
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!isMapTilerConfigured()) {
      setMapError('MapTiler API Key missing. You can still enter your address manually.');
      return;
    }

    try {
      const initialLngLat: [number, number] = selectedCoordinates
        ? [selectedCoordinates.longitude, selectedCoordinates.latitude]
        : DEFAULT_MAP_CENTER;

      const map = new maptilersdk.Map({
        container: mapContainerRef.current,
        style: maptilersdk.MapStyle.STREETS,
        center: initialLngLat,
        zoom: selectedCoordinates ? 15 : DEFAULT_MAP_ZOOM,
        navigationControl: 'bottom-right',
      });

      mapInstanceRef.current = map;

      // Add draggable marker if initial coordinates exist
      if (selectedCoordinates) {
        const marker = new maptilersdk.Marker({ color: '#e11d48', draggable: true })
          .setLngLat(initialLngLat)
          .addTo(map);

        marker.on('dragend', () => {
          const lngLat = marker.getLngLat();
          const newCoords = { latitude: Number(lngLat.lat.toFixed(6)), longitude: Number(lngLat.lng.toFixed(6)) };
          setCoords(newCoords);
          onLocationSelected(newCoords);
        });

        markerInstanceRef.current = marker;
      }

      // Handle map click for manual marker placement
      map.on('click', (e) => {
        const { lng, lat } = e.lngLat;
        const newCoords = { latitude: Number(lat.toFixed(6)), longitude: Number(lng.toFixed(6)) };
        
        updateMarker(map, [lng, lat], newCoords);
      });

    } catch (err: any) {
      console.error('MapTiler initialization error:', err);
      setMapError('Failed to load interactive map. Manual location text remains available.');
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const updateMarker = (map: maptilersdk.Map, lngLat: [number, number], newCoords: Coordinates) => {
    setCoords(newCoords);
    onLocationSelected(newCoords);
    setGeoError(null);

    if (markerInstanceRef.current) {
      markerInstanceRef.current.setLngLat(lngLat);
    } else {
      const marker = new maptilersdk.Marker({ color: '#e11d48', draggable: true })
        .setLngLat(lngLat)
        .addTo(map);

      marker.on('dragend', () => {
        const updatedLngLat = marker.getLngLat();
        const draggedCoords = {
          latitude: Number(updatedLngLat.lat.toFixed(6)),
          longitude: Number(updatedLngLat.lng.toFixed(6)),
        };
        setCoords(draggedCoords);
        onLocationSelected(draggedCoords);
      });

      markerInstanceRef.current = marker;
    }

    map.flyTo({ center: lngLat, zoom: 15, duration: 1000 });
  };

  // Explicit browser geolocation handler
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser. Please select your location manually on the map.');
      return;
    }

    setGeoLoading(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newCoords = { latitude: Number(latitude.toFixed(6)), longitude: Number(longitude.toFixed(6)) };
        const lngLat: [number, number] = [newCoords.longitude, newCoords.latitude];

        setGeoLoading(false);

        if (mapInstanceRef.current) {
          updateMarker(mapInstanceRef.current, lngLat, newCoords);
        } else {
          setCoords(newCoords);
          onLocationSelected(newCoords);
        }
      },
      (error) => {
        setGeoLoading(false);
        if (error.code === error.PERMISSION_DENIED) {
          setGeoError('Location permission was denied. You can select your pickup location manually on the map.');
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          setGeoError('Location information is unavailable. Please select your pickup location manually on the map.');
        } else if (error.code === error.TIMEOUT) {
          setGeoError('Location request timed out. Please try clicking again or click manually on the map.');
        } else {
          setGeoError('Unable to detect current location. Please select your location manually on the map.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // Search address geocoding via MapTiler Client
  const handleSearchAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || !mapInstanceRef.current) return;

    setSearching(true);
    setGeoError(null);

    try {
      const response = await fetch(
        `https://api.maptiler.com/geocoding/${encodeURIComponent(searchQuery)}.json?key=${MAPTILER_API_KEY}&limit=1`
      );
      const data = await response.json();

      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center;
        const newCoords = { latitude: Number(lat.toFixed(6)), longitude: Number(lng.toFixed(6)) };
        updateMarker(mapInstanceRef.current, [lng, lat], newCoords);
      } else {
        setGeoError(`No map location found for "${searchQuery}". Please click directly on the map.`);
      }
    } catch {
      setGeoError('Address search request failed. Click directly on the map to choose location.');
    } finally {
      setSearching(false);
    }
  };

  const handleClearLocation = () => {
    setCoords(undefined);
    if (markerInstanceRef.current) {
      markerInstanceRef.current.remove();
      markerInstanceRef.current = null;
    }
    if (onLocationCleared) onLocationCleared();
  };

  return (
    <div className="w-full space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          Pin Exact Pickup Location <span className="text-slate-400 font-normal lowercase">(optional map pin)</span>
        </label>

        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={geoLoading}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 rounded-lg transition-colors disabled:opacity-50"
        >
          {geoLoading ? (
            <>
              <span className="animate-spin rounded-full h-3 w-3 border-2 border-emerald-600 border-t-transparent" />
              Locating...
            </>
          ) : (
            <>
              <Navigation className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Use My Current Location
            </>
          )}
        </button>
      </div>

      {/* Geocoding search input */}
      {!mapError && (
        <form onSubmit={handleSearchAddress} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search area or landmark (e.g. Kasaba Bawada, Kolhapur)"
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-100"
            />
          </div>
          <button
            type="submit"
            disabled={searching || !searchQuery.trim()}
            className="px-3 py-1.5 text-xs font-semibold bg-slate-800 dark:bg-slate-700 text-white rounded-xl hover:bg-slate-900 dark:hover:bg-slate-600 disabled:opacity-50"
          >
            {searching ? 'Searching...' : 'Search Map'}
          </button>
        </form>
      )}

      {/* Map Container */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 shadow-inner">
        {mapError ? (
          <div className="p-6 text-center text-slate-500 dark:text-slate-400 flex flex-col items-center">
            <AlertCircle className="w-8 h-8 text-amber-500 mb-2" />
            <p className="text-xs">{mapError}</p>
          </div>
        ) : (
          <div ref={mapContainerRef} className="w-full h-72 sm:h-80 rounded-2xl" />
        )}

        {/* Selected Coordinates Overlay Badge */}
        {coords && (
          <div className="absolute bottom-3 left-3 right-3 sm:right-auto bg-slate-900/90 backdrop-blur-md text-white text-xs px-3.5 py-2 rounded-xl shadow-lg flex items-center justify-between gap-3 border border-slate-700">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <span className="font-semibold block text-emerald-400">Pickup location pinned</span>
                <span className="text-[11px] text-slate-300">
                  Lat: {coords.latitude}, Lng: {coords.longitude}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleClearLocation}
              className="p-1 hover:bg-slate-800 rounded-md text-slate-400 hover:text-white transition-colors"
              title="Clear pin"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Geolocation / Geocoding Error Message */}
      {geoError && (
        <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-xl text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
          <span>{geoError}</span>
        </div>
      )}
    </div>
  );
};
