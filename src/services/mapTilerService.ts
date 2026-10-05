import * as maptilersdk from '@maptiler/sdk';
import '@maptiler/sdk/dist/maptiler-sdk.css';

const env = typeof import.meta !== 'undefined' ? import.meta.env || {} : {};

export const MAPTILER_API_KEY = env.VITE_MAPTILER_API_KEY || 'fHmj3StwwZUZesRYJX3x';

// Set global MapTiler API Key
maptilersdk.config.apiKey = MAPTILER_API_KEY;

export const isMapTilerConfigured = (): boolean => {
  return Boolean(MAPTILER_API_KEY && MAPTILER_API_KEY !== 'your_maptiler_api_key');
};

// Default map center: Kolhapur / India fallback coordinates [lng, lat]
export const DEFAULT_MAP_CENTER: [number, number] = [74.2433, 16.7050];
export const DEFAULT_MAP_ZOOM = 13;

export { maptilersdk };
