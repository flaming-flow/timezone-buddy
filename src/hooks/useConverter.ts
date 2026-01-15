import {useState, useEffect, useCallback, useMemo} from 'react';
import {ConversionInput, ConversionResult} from '../types';
import {
  getConversionResult,
  getCurrentDeviceTimezone,
} from '../domain/timeZoneService';
import {
  saveLastConversion,
  loadLastConversion,
  loadTimeZones,
  saveTimeZones,
} from '../storage/storageService';

interface UseConverterResult {
  // Input state
  selectedDate: Date;
  baseTimeZone: string;
  savedZones: string[];

  // Computed results
  results: ConversionResult[];

  // Actions
  setSelectedDate: (date: Date) => void;
  setBaseTimeZone: (zone: string) => void;
  setToNow: () => void;

  // Loading state
  isLoading: boolean;
}

/**
 * Hook for managing time zone conversion
 */
export function useConverter(): UseConverterResult {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [baseTimeZone, setBaseTimeZone] = useState<string>(getCurrentDeviceTimezone());
  const [savedZones, setSavedZones] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved zones and last conversion on mount
  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const zones = await loadTimeZones();
        setSavedZones(zones);

        // Try to load last conversion
        const lastConversion = await loadLastConversion();
        if (lastConversion) {
          setSelectedDate(lastConversion.dateTime);
          setBaseTimeZone(lastConversion.baseTimeZone);
        } else {
          // Default to current time and device timezone
          setSelectedDate(new Date());
          setBaseTimeZone(zones.length > 0 ? zones[0] : getCurrentDeviceTimezone());
        }
      } catch (error) {
        console.error('Failed to load converter state:', error);
        setSelectedDate(new Date());
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  // Reload saved zones when they might have changed
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const zones = await loadTimeZones();
        setSavedZones(zones);
      } catch (error) {
        console.error('Failed to reload time zones:', error);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Save conversion when inputs change
  useEffect(() => {
    if (!isLoading && selectedDate && baseTimeZone) {
      const input: ConversionInput = {
        dateTime: selectedDate,
        baseTimeZone,
      };
      saveLastConversion(input).catch(console.error);
    }
  }, [selectedDate, baseTimeZone, isLoading]);

  // Compute conversion results (order comes from savedZones)
  const results = useMemo((): ConversionResult[] => {
    if (!selectedDate || savedZones.length === 0) {
      return [];
    }

    try {
      return savedZones.map(zone =>
        getConversionResult(selectedDate, baseTimeZone, zone),
      );
    } catch (error) {
      console.error('Failed to compute conversion:', error);
      return [];
    }
  }, [selectedDate, baseTimeZone, savedZones]);

  // Handle base timezone change - moves selected zone to top
  const handleSetBaseTimeZone = useCallback(
    async (zone: string) => {
      setBaseTimeZone(zone);

      // Move zone to the top of the list
      const newOrder = [zone, ...savedZones.filter(z => z !== zone)];
      setSavedZones(newOrder);
      try {
        await saveTimeZones(newOrder);
      } catch (error) {
        console.error('Failed to save timezone order:', error);
      }
    },
    [savedZones],
  );

  // Set input to current time
  const setToNow = useCallback(() => {
    setSelectedDate(new Date());
  }, []);

  return {
    selectedDate,
    baseTimeZone,
    savedZones,
    results,
    setSelectedDate,
    setBaseTimeZone: handleSetBaseTimeZone,
    setToNow,
    isLoading,
  };
}
