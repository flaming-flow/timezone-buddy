import {TimeZoneEntry, ConversionResult} from '../types';

/**
 * Get the current device timezone using Intl API
 */
export function getCurrentDeviceTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return 'UTC';
  }
}

/**
 * Validate if a timezone name is valid IANA timezone
 */
export function isValidTimezone(ianaName: string): boolean {
  try {
    Intl.DateTimeFormat('en-US', {timeZone: ianaName});
    return true;
  } catch {
    return false;
  }
}

// Comprehensive IANA time zones for the picker (sorted by region, then by city)
const COMMON_TIME_ZONES: TimeZoneEntry[] = [
  // UTC
  {id: 'utc', ianaName: 'UTC', label: 'UTC'},

  // Africa
  {id: 'af-cairo', ianaName: 'Africa/Cairo', label: 'Cairo'},
  {id: 'af-casablanca', ianaName: 'Africa/Casablanca', label: 'Casablanca'},
  {id: 'af-johannesburg', ianaName: 'Africa/Johannesburg', label: 'Johannesburg'},
  {id: 'af-lagos', ianaName: 'Africa/Lagos', label: 'Lagos'},
  {id: 'af-nairobi', ianaName: 'Africa/Nairobi', label: 'Nairobi'},
  {id: 'af-tunis', ianaName: 'Africa/Tunis', label: 'Tunis'},
  {id: 'af-accra', ianaName: 'Africa/Accra', label: 'Accra'},
  {id: 'af-addis', ianaName: 'Africa/Addis_Ababa', label: 'Addis Ababa'},
  {id: 'af-algiers', ianaName: 'Africa/Algiers', label: 'Algiers'},
  {id: 'af-capetown', ianaName: 'Africa/Johannesburg', label: 'Cape Town'},

  // Americas - North
  {id: 'na-newyork', ianaName: 'America/New_York', label: 'New York'},
  {id: 'na-losangeles', ianaName: 'America/Los_Angeles', label: 'Los Angeles'},
  {id: 'na-chicago', ianaName: 'America/Chicago', label: 'Chicago'},
  {id: 'na-denver', ianaName: 'America/Denver', label: 'Denver'},
  {id: 'na-phoenix', ianaName: 'America/Phoenix', label: 'Phoenix'},
  {id: 'na-toronto', ianaName: 'America/Toronto', label: 'Toronto'},
  {id: 'na-vancouver', ianaName: 'America/Vancouver', label: 'Vancouver'},
  {id: 'na-montreal', ianaName: 'America/Montreal', label: 'Montreal'},
  {id: 'na-miami', ianaName: 'America/New_York', label: 'Miami'},
  {id: 'na-seattle', ianaName: 'America/Los_Angeles', label: 'Seattle'},
  {id: 'na-sanfrancisco', ianaName: 'America/Los_Angeles', label: 'San Francisco'},
  {id: 'na-lasvegas', ianaName: 'America/Los_Angeles', label: 'Las Vegas'},
  {id: 'na-dallas', ianaName: 'America/Chicago', label: 'Dallas'},
  {id: 'na-houston', ianaName: 'America/Chicago', label: 'Houston'},
  {id: 'na-atlanta', ianaName: 'America/New_York', label: 'Atlanta'},
  {id: 'na-boston', ianaName: 'America/New_York', label: 'Boston'},
  {id: 'na-detroit', ianaName: 'America/Detroit', label: 'Detroit'},
  {id: 'na-anchorage', ianaName: 'America/Anchorage', label: 'Anchorage'},

  // Americas - Central & Caribbean
  {id: 'ca-mexico', ianaName: 'America/Mexico_City', label: 'Mexico City'},
  {id: 'ca-cancun', ianaName: 'America/Cancun', label: 'Cancun'},
  {id: 'ca-havana', ianaName: 'America/Havana', label: 'Havana'},
  {id: 'ca-panama', ianaName: 'America/Panama', label: 'Panama City'},
  {id: 'ca-costarica', ianaName: 'America/Costa_Rica', label: 'San José (CR)'},
  {id: 'ca-guatemala', ianaName: 'America/Guatemala', label: 'Guatemala City'},
  {id: 'ca-jamaica', ianaName: 'America/Jamaica', label: 'Kingston'},
  {id: 'ca-puertorico', ianaName: 'America/Puerto_Rico', label: 'San Juan (PR)'},
  {id: 'ca-santo', ianaName: 'America/Santo_Domingo', label: 'Santo Domingo'},

  // Americas - South
  {id: 'sa-saopaulo', ianaName: 'America/Sao_Paulo', label: 'São Paulo'},
  {id: 'sa-buenosaires', ianaName: 'America/Argentina/Buenos_Aires', label: 'Buenos Aires'},
  {id: 'sa-rio', ianaName: 'America/Sao_Paulo', label: 'Rio de Janeiro'},
  {id: 'sa-lima', ianaName: 'America/Lima', label: 'Lima'},
  {id: 'sa-bogota', ianaName: 'America/Bogota', label: 'Bogotá'},
  {id: 'sa-santiago', ianaName: 'America/Santiago', label: 'Santiago'},
  {id: 'sa-caracas', ianaName: 'America/Caracas', label: 'Caracas'},
  {id: 'sa-medellin', ianaName: 'America/Bogota', label: 'Medellín'},
  {id: 'sa-montevideo', ianaName: 'America/Montevideo', label: 'Montevideo'},
  {id: 'sa-lapaz', ianaName: 'America/La_Paz', label: 'La Paz'},
  {id: 'sa-quito', ianaName: 'America/Guayaquil', label: 'Quito'},

  // Asia - East
  {id: 'ae-tokyo', ianaName: 'Asia/Tokyo', label: 'Tokyo'},
  {id: 'ae-seoul', ianaName: 'Asia/Seoul', label: 'Seoul'},
  {id: 'ae-shanghai', ianaName: 'Asia/Shanghai', label: 'Shanghai'},
  {id: 'ae-beijing', ianaName: 'Asia/Shanghai', label: 'Beijing'},
  {id: 'ae-hongkong', ianaName: 'Asia/Hong_Kong', label: 'Hong Kong'},
  {id: 'ae-taipei', ianaName: 'Asia/Taipei', label: 'Taipei'},
  {id: 'ae-osaka', ianaName: 'Asia/Tokyo', label: 'Osaka'},
  {id: 'ae-shenzhen', ianaName: 'Asia/Shanghai', label: 'Shenzhen'},
  {id: 'ae-guangzhou', ianaName: 'Asia/Shanghai', label: 'Guangzhou'},

  // Asia - Southeast
  {id: 'as-singapore', ianaName: 'Asia/Singapore', label: 'Singapore'},
  {id: 'as-bangkok', ianaName: 'Asia/Bangkok', label: 'Bangkok'},
  {id: 'as-jakarta', ianaName: 'Asia/Jakarta', label: 'Jakarta'},
  {id: 'as-bali', ianaName: 'Asia/Makassar', label: 'Bali'},
  {id: 'as-manila', ianaName: 'Asia/Manila', label: 'Manila'},
  {id: 'as-kualalumpur', ianaName: 'Asia/Kuala_Lumpur', label: 'Kuala Lumpur'},
  {id: 'as-hochiminhcity', ianaName: 'Asia/Ho_Chi_Minh', label: 'Ho Chi Minh City'},
  {id: 'as-hanoi', ianaName: 'Asia/Ho_Chi_Minh', label: 'Hanoi'},
  {id: 'as-phnompenh', ianaName: 'Asia/Phnom_Penh', label: 'Phnom Penh'},
  {id: 'as-yangon', ianaName: 'Asia/Yangon', label: 'Yangon'},

  // Asia - South
  {id: 'ai-mumbai', ianaName: 'Asia/Kolkata', label: 'Mumbai'},
  {id: 'ai-delhi', ianaName: 'Asia/Kolkata', label: 'New Delhi'},
  {id: 'ai-bangalore', ianaName: 'Asia/Kolkata', label: 'Bangalore'},
  {id: 'ai-chennai', ianaName: 'Asia/Kolkata', label: 'Chennai'},
  {id: 'ai-kolkata', ianaName: 'Asia/Kolkata', label: 'Kolkata'},
  {id: 'ai-dhaka', ianaName: 'Asia/Dhaka', label: 'Dhaka'},
  {id: 'ai-karachi', ianaName: 'Asia/Karachi', label: 'Karachi'},
  {id: 'ai-lahore', ianaName: 'Asia/Karachi', label: 'Lahore'},
  {id: 'ai-colombo', ianaName: 'Asia/Colombo', label: 'Colombo'},
  {id: 'ai-kathmandu', ianaName: 'Asia/Kathmandu', label: 'Kathmandu'},

  // Asia - West / Middle East
  {id: 'aw-dubai', ianaName: 'Asia/Dubai', label: 'Dubai'},
  {id: 'aw-abudhabi', ianaName: 'Asia/Dubai', label: 'Abu Dhabi'},
  {id: 'aw-riyadh', ianaName: 'Asia/Riyadh', label: 'Riyadh'},
  {id: 'aw-jeddah', ianaName: 'Asia/Riyadh', label: 'Jeddah'},
  {id: 'aw-doha', ianaName: 'Asia/Qatar', label: 'Doha'},
  {id: 'aw-kuwait', ianaName: 'Asia/Kuwait', label: 'Kuwait City'},
  {id: 'aw-bahrain', ianaName: 'Asia/Bahrain', label: 'Manama'},
  {id: 'aw-muscat', ianaName: 'Asia/Muscat', label: 'Muscat'},
  {id: 'aw-tehran', ianaName: 'Asia/Tehran', label: 'Tehran'},
  {id: 'aw-baghdad', ianaName: 'Asia/Baghdad', label: 'Baghdad'},
  {id: 'aw-jerusalem', ianaName: 'Asia/Jerusalem', label: 'Jerusalem'},
  {id: 'aw-telaviv', ianaName: 'Asia/Jerusalem', label: 'Tel Aviv'},
  {id: 'aw-beirut', ianaName: 'Asia/Beirut', label: 'Beirut'},
  {id: 'aw-amman', ianaName: 'Asia/Amman', label: 'Amman'},

  // Asia - Central
  {id: 'ac-almaty', ianaName: 'Asia/Almaty', label: 'Almaty'},
  {id: 'ac-tashkent', ianaName: 'Asia/Tashkent', label: 'Tashkent'},
  {id: 'ac-baku', ianaName: 'Asia/Baku', label: 'Baku'},
  {id: 'ac-tbilisi', ianaName: 'Asia/Tbilisi', label: 'Tbilisi'},
  {id: 'ac-yerevan', ianaName: 'Asia/Yerevan', label: 'Yerevan'},

  // Europe - Western
  {id: 'ew-london', ianaName: 'Europe/London', label: 'London'},
  {id: 'ew-dublin', ianaName: 'Europe/Dublin', label: 'Dublin'},
  {id: 'ew-lisbon', ianaName: 'Europe/Lisbon', label: 'Lisbon'},
  {id: 'ew-reykjavik', ianaName: 'Atlantic/Reykjavik', label: 'Reykjavik'},

  // Europe - Central
  {id: 'ec-paris', ianaName: 'Europe/Paris', label: 'Paris'},
  {id: 'ec-berlin', ianaName: 'Europe/Berlin', label: 'Berlin'},
  {id: 'ec-rome', ianaName: 'Europe/Rome', label: 'Rome'},
  {id: 'ec-madrid', ianaName: 'Europe/Madrid', label: 'Madrid'},
  {id: 'ec-barcelona', ianaName: 'Europe/Madrid', label: 'Barcelona'},
  {id: 'ec-amsterdam', ianaName: 'Europe/Amsterdam', label: 'Amsterdam'},
  {id: 'ec-brussels', ianaName: 'Europe/Brussels', label: 'Brussels'},
  {id: 'ec-vienna', ianaName: 'Europe/Vienna', label: 'Vienna'},
  {id: 'ec-zurich', ianaName: 'Europe/Zurich', label: 'Zurich'},
  {id: 'ec-geneva', ianaName: 'Europe/Zurich', label: 'Geneva'},
  {id: 'ec-milan', ianaName: 'Europe/Rome', label: 'Milan'},
  {id: 'ec-munich', ianaName: 'Europe/Berlin', label: 'Munich'},
  {id: 'ec-frankfurt', ianaName: 'Europe/Berlin', label: 'Frankfurt'},
  {id: 'ec-prague', ianaName: 'Europe/Prague', label: 'Prague'},
  {id: 'ec-warsaw', ianaName: 'Europe/Warsaw', label: 'Warsaw'},
  {id: 'ec-budapest', ianaName: 'Europe/Budapest', label: 'Budapest'},
  {id: 'ec-copenhagen', ianaName: 'Europe/Copenhagen', label: 'Copenhagen'},
  {id: 'ec-stockholm', ianaName: 'Europe/Stockholm', label: 'Stockholm'},
  {id: 'ec-oslo', ianaName: 'Europe/Oslo', label: 'Oslo'},
  {id: 'ec-helsinki', ianaName: 'Europe/Helsinki', label: 'Helsinki'},

  // Europe - Eastern
  {id: 'ee-athens', ianaName: 'Europe/Athens', label: 'Athens'},
  {id: 'ee-istanbul', ianaName: 'Europe/Istanbul', label: 'Istanbul'},
  {id: 'ee-bucharest', ianaName: 'Europe/Bucharest', label: 'Bucharest'},
  {id: 'ee-sofia', ianaName: 'Europe/Sofia', label: 'Sofia'},
  {id: 'ee-kyiv', ianaName: 'Europe/Kyiv', label: 'Kyiv'},
  {id: 'ee-chisinau', ianaName: 'Europe/Chisinau', label: 'Chișinău'},
  {id: 'ee-moscow', ianaName: 'Europe/Moscow', label: 'Moscow'},
  {id: 'ee-stpetersburg', ianaName: 'Europe/Moscow', label: 'St. Petersburg'},
  {id: 'ee-minsk', ianaName: 'Europe/Minsk', label: 'Minsk'},
  {id: 'ee-riga', ianaName: 'Europe/Riga', label: 'Riga'},
  {id: 'ee-tallinn', ianaName: 'Europe/Tallinn', label: 'Tallinn'},
  {id: 'ee-vilnius', ianaName: 'Europe/Vilnius', label: 'Vilnius'},

  // Australia & New Zealand
  {id: 'au-sydney', ianaName: 'Australia/Sydney', label: 'Sydney'},
  {id: 'au-melbourne', ianaName: 'Australia/Melbourne', label: 'Melbourne'},
  {id: 'au-brisbane', ianaName: 'Australia/Brisbane', label: 'Brisbane'},
  {id: 'au-perth', ianaName: 'Australia/Perth', label: 'Perth'},
  {id: 'au-adelaide', ianaName: 'Australia/Adelaide', label: 'Adelaide'},
  {id: 'au-darwin', ianaName: 'Australia/Darwin', label: 'Darwin'},
  {id: 'au-hobart', ianaName: 'Australia/Hobart', label: 'Hobart'},
  {id: 'nz-auckland', ianaName: 'Pacific/Auckland', label: 'Auckland'},
  {id: 'nz-wellington', ianaName: 'Pacific/Auckland', label: 'Wellington'},

  // Pacific
  {id: 'pa-honolulu', ianaName: 'Pacific/Honolulu', label: 'Honolulu'},
  {id: 'pa-fiji', ianaName: 'Pacific/Fiji', label: 'Fiji'},
  {id: 'pa-guam', ianaName: 'Pacific/Guam', label: 'Guam'},
  {id: 'pa-tahiti', ianaName: 'Pacific/Tahiti', label: 'Tahiti'},
  {id: 'pa-samoa', ianaName: 'Pacific/Pago_Pago', label: 'Samoa'},
  {id: 'pa-chatham', ianaName: 'Pacific/Chatham', label: 'Chatham Islands'},

  // Canada - special timezones
  {id: 'ca-stjohns', ianaName: 'America/St_Johns', label: "St. John's (NL)"},
  {id: 'ca-halifax', ianaName: 'America/Halifax', label: 'Halifax'},
  {id: 'ca-winnipeg', ianaName: 'America/Winnipeg', label: 'Winnipeg'},
  {id: 'ca-edmonton', ianaName: 'America/Edmonton', label: 'Edmonton'},
  {id: 'ca-calgary', ianaName: 'America/Edmonton', label: 'Calgary'},

  // Russia (extended)
  {id: 'ru-vladivostok', ianaName: 'Asia/Vladivostok', label: 'Vladivostok'},
  {id: 'ru-novosibirsk', ianaName: 'Asia/Novosibirsk', label: 'Novosibirsk'},
  {id: 'ru-yekaterinburg', ianaName: 'Asia/Yekaterinburg', label: 'Yekaterinburg'},
  {id: 'ru-kaliningrad', ianaName: 'Europe/Kaliningrad', label: 'Kaliningrad'},
];

// Cache for offset strings (refreshed every hour)
let offsetCache: Map<string, string> = new Map();
let offsetCacheTimestamp: number = 0;
const OFFSET_CACHE_TTL = 60 * 60 * 1000; // 1 hour

function initOffsetCache(): void {
  const now = Date.now();
  if (offsetCache.size > 0 && now - offsetCacheTimestamp < OFFSET_CACHE_TTL) {
    return;
  }

  offsetCache = new Map();
  offsetCacheTimestamp = now;
  const date = new Date();

  for (const tz of COMMON_TIME_ZONES) {
    if (!offsetCache.has(tz.ianaName)) {
      offsetCache.set(tz.ianaName, computeOffsetString(tz.ianaName, date));
    }
  }
}

// Initialize cache at module load time for instant picker opening
initOffsetCache();

/**
 * Get current time formatted for a specific time zone
 */
export function getCurrentTimeInZone(ianaName: string): string {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: ianaName,
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    return formatter.format(new Date());
  } catch {
    return '--:--';
  }
}

/**
 * Get formatted date for a specific time zone
 */
export function getDateInZone(ianaName: string, date: Date = new Date()): string {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: ianaName,
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
    return formatter.format(date);
  } catch {
    return '---';
  }
}

/**
 * Get full date-time string for a specific time zone
 */
export function getFullDateTimeInZone(ianaName: string, date: Date = new Date()): string {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: ianaName,
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    return formatter.format(date);
  } catch {
    return '---';
  }
}

/**
 * Compute the UTC offset string for a time zone at a specific date
 * Returns format like "GMT-5" or "GMT+5:30"
 */
function computeOffsetString(ianaName: string, date: Date): string {
  const offsetMinutes = getOffsetMinutes(ianaName, date);
  const hours = Math.floor(Math.abs(offsetMinutes) / 60);
  const minutes = Math.abs(offsetMinutes) % 60;
  const sign = offsetMinutes >= 0 ? '+' : '-';

  if (minutes === 0) {
    return `GMT${sign}${hours}`;
  }
  return `GMT${sign}${hours}:${minutes.toString().padStart(2, '0')}`;
}

/**
 * Get the UTC offset string for a time zone (cached for picker performance)
 */
export function getOffsetString(ianaName: string, date?: Date): string {
  // If specific date provided, compute directly
  if (date) {
    return computeOffsetString(ianaName, date);
  }

  // Use cache for current time lookups
  initOffsetCache();
  const cached = offsetCache.get(ianaName);
  if (cached) {
    return cached;
  }

  // Fallback for unknown zones
  return computeOffsetString(ianaName, new Date());
}

/**
 * Get the UTC offset in minutes for a time zone at a specific date
 * Uses a reliable method that works across all JS engines including Hermes
 */
export function getOffsetMinutes(ianaName: string, date: Date = new Date()): number {
  try {
    // Special case for UTC
    if (ianaName === 'UTC' || ianaName === 'Etc/UTC') {
      return 0;
    }

    // Format the date in the target timezone to extract components
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: ianaName,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });

    const parts = formatter.formatToParts(date);
    const getPart = (type: string): number => {
      const part = parts.find(p => p.type === type);
      return part ? parseInt(part.value, 10) : 0;
    };

    const year = getPart('year');
    const month = getPart('month');
    const day = getPart('day');
    let hour = getPart('hour');
    const minute = getPart('minute');
    const second = getPart('second');

    // Handle hour 24 (midnight) as 0
    if (hour === 24) hour = 0;

    // Create a UTC timestamp from the formatted local time components
    // This represents "what UTC time would it be if these were UTC components"
    const localAsUtc = Date.UTC(year, month - 1, day, hour, minute, second);

    // The difference between this and the actual UTC time is the offset
    const actualUtc = date.getTime();
    const offsetMs = localAsUtc - actualUtc;

    // Convert to minutes and round to handle any floating point issues
    return Math.round(offsetMs / 60000);
  } catch (e) {
    console.error('getOffsetMinutes error for', ianaName, ':', e);
    return 0;
  }
}

/**
 * Check if DST is currently active for a time zone
 * Works correctly for both Northern and Southern hemispheres
 */
export function isDSTActive(ianaName: string, date: Date = new Date()): boolean {
  // Get offset for the given date
  const currentOffset = getOffsetMinutes(ianaName, date);

  // Get offset for January 1 of the same year
  const january = new Date(date.getFullYear(), 0, 1);
  const januaryOffset = getOffsetMinutes(ianaName, january);

  // Get offset for July 1 of the same year
  const july = new Date(date.getFullYear(), 6, 1);
  const julyOffset = getOffsetMinutes(ianaName, july);

  // If January and July have the same offset, DST is not observed
  if (januaryOffset === julyOffset) {
    return false;
  }

  // DST is active when current offset differs from the "standard" offset
  // Standard time is when offset is SMALLER (closer to UTC)
  // This works for both hemispheres:
  // - Northern: standard in winter (Jan), DST in summer (Jul) -> Jan offset < Jul offset
  // - Southern: standard in winter (Jul), DST in summer (Jan) -> Jul offset < Jan offset
  const standardOffset = Math.min(januaryOffset, julyOffset);
  return currentOffset !== standardOffset;
}

/**
 * Get conversion result for a specific time zone
 */
export function getConversionResult(
  date: Date,
  _fromZone: string,
  toZone: string,
): ConversionResult {
  return {
    timeZone: toZone,
    label: getLabelForZone(toZone),
    convertedTime: getFullDateTimeInZone(toZone, date),
    offset: getOffsetString(toZone, date),
    isDST: isDSTActive(toZone, date),
  };
}

/**
 * Get a human-readable label for a time zone
 */
export function getLabelForZone(ianaName: string): string {
  const entry = COMMON_TIME_ZONES.find(tz => tz.ianaName === ianaName);
  if (entry) {
    return entry.label;
  }

  // Extract city name from IANA format (e.g., "America/New_York" -> "New York")
  const parts = ianaName.split('/');
  const city = parts[parts.length - 1];
  return city.replace(/_/g, ' ');
}

/**
 * Get list of available time zones for the picker
 */
export function getAvailableTimeZones(): TimeZoneEntry[] {
  return [...COMMON_TIME_ZONES];
}

/**
 * Search time zones by name
 */
export function searchTimeZones(query: string): TimeZoneEntry[] {
  const lowercaseQuery = query.toLowerCase().trim();

  if (!lowercaseQuery) {
    return COMMON_TIME_ZONES;
  }

  return COMMON_TIME_ZONES.filter(
    tz =>
      tz.label.toLowerCase().includes(lowercaseQuery) ||
      tz.ianaName.toLowerCase().includes(lowercaseQuery),
  );
}

export interface OverlapResult {
  zone1Start: number;
  zone1End: number;
  zone2Start: number;
  zone2End: number;
  overlapHours: number;
}

/**
 * Find overlapping working hours between two time zones
 * Returns the overlap window in both zones, or null if no overlap
 */
export function findOverlappingHours(
  zone1: string,
  zone2: string,
  workStart: number = 9,
  workEnd: number = 18,
): OverlapResult | null {
  const offset1 = getOffsetMinutes(zone1);
  const offset2 = getOffsetMinutes(zone2);
  const diffMinutes = offset1 - offset2;
  const diffHours = diffMinutes / 60;

  // Zone2's working hours converted to Zone1's time
  const zone2StartInZone1 = workStart + diffHours;
  const zone2EndInZone1 = workEnd + diffHours;

  // Find intersection of [workStart, workEnd] and [zone2StartInZone1, zone2EndInZone1]
  const overlapStart = Math.max(workStart, zone2StartInZone1);
  const overlapEnd = Math.min(workEnd, zone2EndInZone1);

  const overlapHours = overlapEnd - overlapStart;

  if (overlapHours <= 0) {
    return null;
  }

  // Convert overlap back to zone2's time
  const zone2OverlapStart = overlapStart - diffHours;
  const zone2OverlapEnd = overlapEnd - diffHours;

  return {
    zone1Start: overlapStart,
    zone1End: overlapEnd,
    zone2Start: zone2OverlapStart,
    zone2End: zone2OverlapEnd,
    overlapHours,
  };
}

/**
 * Format hour number to time string (e.g., 9 -> "09:00", 13.5 -> "13:30")
 */
export function formatHour(hour: number): string {
  const h = Math.floor(hour);
  const m = Math.round((hour - h) * 60);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

/**
 * Get detailed timezone info for debugging/testing
 */
export function getTimezoneDebugInfo(ianaName: string, date: Date = new Date()): {
  ianaName: string;
  isValid: boolean;
  currentOffset: number;
  offsetString: string;
  isDST: boolean;
  hasDST: boolean;
  standardOffset: number;
  dstOffset: number;
  formattedTime: string;
  formattedDate: string;
} {
  if (!isValidTimezone(ianaName)) {
    return {
      ianaName,
      isValid: false,
      currentOffset: 0,
      offsetString: 'Invalid',
      isDST: false,
      hasDST: false,
      standardOffset: 0,
      dstOffset: 0,
      formattedTime: '--:--',
      formattedDate: '---',
    };
  }

  const january = new Date(date.getFullYear(), 0, 1);
  const july = new Date(date.getFullYear(), 6, 1);
  const januaryOffset = getOffsetMinutes(ianaName, january);
  const julyOffset = getOffsetMinutes(ianaName, july);
  const hasDST = januaryOffset !== julyOffset;
  const standardOffset = Math.min(januaryOffset, julyOffset);
  const dstOffset = Math.max(januaryOffset, julyOffset);

  return {
    ianaName,
    isValid: true,
    currentOffset: getOffsetMinutes(ianaName, date),
    offsetString: getOffsetString(ianaName, date),
    isDST: isDSTActive(ianaName, date),
    hasDST,
    standardOffset,
    dstOffset,
    formattedTime: getCurrentTimeInZone(ianaName),
    formattedDate: getDateInZone(ianaName, date),
  };
}

/**
 * Test DST transitions for a timezone
 * Returns dates when DST changes occur in a given year
 */
export function getDSTTransitions(ianaName: string, year: number): Date[] {
  if (!isValidTimezone(ianaName)) {
    return [];
  }

  const transitions: Date[] = [];
  let prevOffset = getOffsetMinutes(ianaName, new Date(year, 0, 1));

  // Check each day of the year
  for (let month = 0; month < 12; month++) {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day, 12, 0, 0); // noon to avoid edge cases
      const offset = getOffsetMinutes(ianaName, date);
      if (offset !== prevOffset) {
        // Found a transition, narrow it down to the hour
        for (let hour = 0; hour < 24; hour++) {
          const hourDate = new Date(year, month, day, hour, 0, 0);
          const hourOffset = getOffsetMinutes(ianaName, hourDate);
          if (hourOffset !== prevOffset) {
            transitions.push(hourDate);
            prevOffset = hourOffset;
            break;
          }
        }
      }
      prevOffset = offset;
    }
  }

  return transitions;
}
