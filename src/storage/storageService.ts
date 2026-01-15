import AsyncStorage from '@react-native-async-storage/async-storage';
import {ConversionInput, Person} from '../types';

const STORAGE_KEYS = {
  TIME_ZONES: '@timezone_app/saved_zones',
  LAST_CONVERSION: '@timezone_app/last_conversion',
  PEOPLE: '@timezone_app/people',
} as const;

/**
 * Save the list of time zone IANA names
 */
export async function saveTimeZones(zones: string[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.TIME_ZONES, JSON.stringify(zones));
  } catch (error) {
    console.error('Failed to save time zones:', error);
    throw error;
  }
}

/**
 * Load the saved list of time zone IANA names
 */
export async function loadTimeZones(): Promise<string[]> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEYS.TIME_ZONES);
    if (stored) {
      return JSON.parse(stored);
    }
    // Return default zones if none saved
    return ['America/New_York', 'Europe/London', 'Asia/Tokyo'];
  } catch (error) {
    console.error('Failed to load time zones:', error);
    return ['America/New_York', 'Europe/London', 'Asia/Tokyo'];
  }
}

/**
 * Save the last conversion input for restoration
 */
export async function saveLastConversion(input: ConversionInput): Promise<void> {
  try {
    const serialized = {
      dateTime: input.dateTime.toISOString(),
      baseTimeZone: input.baseTimeZone,
    };
    await AsyncStorage.setItem(
      STORAGE_KEYS.LAST_CONVERSION,
      JSON.stringify(serialized),
    );
  } catch (error) {
    console.error('Failed to save last conversion:', error);
    throw error;
  }
}

/**
 * Load the last conversion input
 */
export async function loadLastConversion(): Promise<ConversionInput | null> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEYS.LAST_CONVERSION);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        dateTime: new Date(parsed.dateTime),
        baseTimeZone: parsed.baseTimeZone,
      };
    }
    return null;
  } catch (error) {
    console.error('Failed to load last conversion:', error);
    return null;
  }
}

/**
 * Save the list of people/contacts
 */
export async function savePeople(people: Person[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.PEOPLE, JSON.stringify(people));
  } catch (error) {
    console.error('Failed to save people:', error);
    throw error;
  }
}

/**
 * Load the saved list of people/contacts
 */
export async function loadPeople(): Promise<Person[]> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEYS.PEOPLE);
    if (stored) {
      return JSON.parse(stored);
    }
    return [];
  } catch (error) {
    console.error('Failed to load people:', error);
    return [];
  }
}

/**
 * Clear all stored data (for debugging/reset)
 */
export async function clearAllData(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.TIME_ZONES,
      STORAGE_KEYS.LAST_CONVERSION,
      STORAGE_KEYS.PEOPLE,
    ]);
  } catch (error) {
    console.error('Failed to clear data:', error);
    throw error;
  }
}
