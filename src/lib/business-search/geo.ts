/** Great-circle distance in meters. */
export function distanceMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  return 6_371_000 * 2 * Math.asin(Math.sqrt(a))
}

const METERS_PER_DEGREE_LAT = 111_320

/** Square box that contains the circle of `radiusMeters` around a point. */
export function boundingBox(latitude: number, longitude: number, radiusMeters: number) {
  const dLat = radiusMeters / METERS_PER_DEGREE_LAT
  const dLon = radiusMeters / (METERS_PER_DEGREE_LAT * Math.cos((latitude * Math.PI) / 180))
  return {
    south: latitude - dLat,
    north: latitude + dLat,
    west: longitude - dLon,
    east: longitude + dLon,
  }
}
