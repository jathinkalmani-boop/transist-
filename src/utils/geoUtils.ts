/**
 * Geo calculation utilities for user live location and transit stops
 */
import { TransitStop } from '../types/transit';

// Reference coordinates for Bengaluru Transit Stops
export const STOP_GEO_COORDINATES: Record<string, { lat: number; lng: number }> = {
  // Central Hub
  'stop-majestic': { lat: 12.9778, lng: 77.5726 },
  'stop-majestic-metro': { lat: 12.9760, lng: 77.5735 },
  'stop-sbc-railway': { lat: 12.9785, lng: 77.5685 },
  'stop-kempegowda': { lat: 12.9767, lng: 77.5713 },
  // Civic Centre
  'stop-corporation': { lat: 12.9667, lng: 77.5873 },
  'stop-mg-road': { lat: 12.9756, lng: 77.6094 },
  'stop-shantinagar': { lat: 12.9554, lng: 77.5947 },
  // East Suburb
  'stop-indiranagar': { lat: 12.9784, lng: 77.6408 },
  'stop-cmh-road': { lat: 12.9798, lng: 77.6445 },
  'stop-domlur': { lat: 12.9609, lng: 77.6387 },
  'stop-hal-depot': { lat: 12.9592, lng: 77.6521 },
  // South Ring Road
  'stop-silkboard': { lat: 12.9172, lng: 77.6228 },
  'stop-btm-water': { lat: 12.9166, lng: 77.6101 },
  'stop-madiwala': { lat: 12.9226, lng: 77.6200 },
  // South-East
  'stop-hsr': { lat: 12.9116, lng: 77.6389 },
  'stop-hsr-bda': { lat: 12.9140, lng: 77.6440 },
  'stop-agara': { lat: 12.9248, lng: 77.6508 },
  // Outer Ring Corridor
  'stop-ecospace': { lat: 12.9255, lng: 77.6835 },
  'stop-bellandur': { lat: 12.9304, lng: 77.6784 },
  'stop-devarabeesana': { lat: 12.9288, lng: 77.6920 },
  'stop-marathahalli': { lat: 12.9569, lng: 77.7011 },
  // Tech Hub East
  'stop-whitefield': { lat: 12.9698, lng: 77.7499 },
  'stop-itpl': { lat: 12.9863, lng: 77.7311 },
  'stop-hopefarm': { lat: 12.9842, lng: 77.7516 },
  'stop-kadugodi': { lat: 12.9984, lng: 77.7601 },
};

/**
 * Calculates Great-Circle distance using Haversine formula (in km)
 */
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Resolves coordinates for a transit stop (from stop object or fallback coordinate map)
 */
export function getStopCoordinates(stop: TransitStop): { lat: number; lng: number } {
  if (stop.latitude && stop.longitude) {
    return { lat: stop.latitude, lng: stop.longitude };
  }
  if (STOP_GEO_COORDINATES[stop.id]) {
    return STOP_GEO_COORDINATES[stop.id];
  }
  // Fallback to central hub
  return { lat: 12.9778, lng: 77.5726 };
}

/**
 * Find the nearest bus stop to user's live coordinates
 */
export function findNearestStop(
  userLat: number,
  userLng: number,
  stops: TransitStop[]
): {
  nearestStop: TransitStop;
  distanceKm: number;
  distanceMeters: number;
  formattedDistance: string;
} {
  if (!stops || stops.length === 0) {
    throw new Error('No stops provided');
  }

  let nearestStop = stops[0];
  let minDistanceKm = Infinity;

  for (const stop of stops) {
    const coords = getStopCoordinates(stop);
    const dist = calculateHaversineDistanceKm(userLat, userLng, coords.lat, coords.lng);
    if (dist < minDistanceKm) {
      minDistanceKm = dist;
      nearestStop = stop;
    }
  }

  const distanceMeters = Math.round(minDistanceKm * 1000);
  const formattedDistance =
    distanceMeters < 1000
      ? `${distanceMeters} meters`
      : `${minDistanceKm.toFixed(1)} km`;

  return {
    nearestStop,
    distanceKm: parseFloat(minDistanceKm.toFixed(2)),
    distanceMeters,
    formattedDistance,
  };
}
