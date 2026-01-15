import {useState, useEffect, useCallback, useRef} from 'react';
import {TimeZoneDisplay} from '../types';
import {
  getCurrentTimeInZone,
  getDateInZone,
  getOffsetString,
  isDSTActive,
  getLabelForZone,
} from '../domain/timeZoneService';
import {saveTimeZones, loadTimeZones} from '../storage/storageService';

interface UseTimeZonesResult {
  timeZones: TimeZoneDisplay[];
  isLoading: boolean;
  addTimeZone: (ianaName: string) => void;
  removeTimeZone: (id: string) => void;
  reorderTimeZones: (newOrder: TimeZoneDisplay[]) => void;
  refreshTimes: () => void;
  pauseUpdates: () => void;
  resumeUpdates: () => void;
}

/**
 * Hook for managing the world clock time zones
 * Handles loading, saving, and auto-updating times
 */
export function useTimeZones(): UseTimeZonesResult {
  const [savedZones, setSavedZones] = useState<string[]>([]);
  const [timeZones, setTimeZones] = useState<TimeZoneDisplay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isPausedRef = useRef(false);

  // Build display objects from IANA names
  const buildDisplayZones = useCallback((zones: string[]): TimeZoneDisplay[] => {
    return zones.map((ianaName) => ({
      id: ianaName, // Stable ID based only on timezone name
      ianaName,
      label: getLabelForZone(ianaName),
      currentTime: getCurrentTimeInZone(ianaName),
      currentDate: getDateInZone(ianaName),
      offset: getOffsetString(ianaName),
      isDST: isDSTActive(ianaName),
    }));
  }, []);

  // Load saved zones on mount
  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const zones = await loadTimeZones();
        setSavedZones(zones);
        setTimeZones(buildDisplayZones(zones));
      } catch (error) {
        console.error('Failed to load time zones:', error);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [buildDisplayZones]);

  // Update times every second (when not paused)
  useEffect(() => {
    const updateTimes = () => {
      if (!isPausedRef.current) {
        // Обновляем только поля времени, не пересоздавая весь объект
        setTimeZones(prev => prev.map(zone => ({
          ...zone,
          currentTime: getCurrentTimeInZone(zone.ianaName),
          currentDate: getDateInZone(zone.ianaName),
        })));
      }
    };

    // Set up interval to update every second
    intervalRef.current = setInterval(updateTimes, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Pause/resume updates (for drag operations)
  const pauseUpdates = useCallback(() => {
    isPausedRef.current = true;
  }, []);

  const resumeUpdates = useCallback(() => {
    isPausedRef.current = false;
    // Refresh immediately after resume
    setTimeZones(buildDisplayZones(savedZones));
  }, [savedZones, buildDisplayZones]);

  // Add a new time zone
  const addTimeZone = useCallback(
    async (ianaName: string) => {
      // Check if already exists
      if (savedZones.includes(ianaName)) {
        return;
      }

      const newZones = [...savedZones, ianaName];
      setSavedZones(newZones);
      setTimeZones(buildDisplayZones(newZones));

      try {
        await saveTimeZones(newZones);
      } catch (error) {
        console.error('Failed to save time zone:', error);
        // Revert on error
        setSavedZones(savedZones);
        setTimeZones(buildDisplayZones(savedZones));
      }
    },
    [savedZones, buildDisplayZones],
  );

  // Remove a time zone
  const removeTimeZone = useCallback(
    async (id: string) => {
      const zone = timeZones.find(tz => tz.id === id);
      if (!zone) return;

      const newZones = savedZones.filter(z => z !== zone.ianaName);
      setSavedZones(newZones);
      setTimeZones(buildDisplayZones(newZones));

      try {
        await saveTimeZones(newZones);
      } catch (error) {
        console.error('Failed to remove time zone:', error);
        // Revert on error
        setSavedZones(savedZones);
        setTimeZones(buildDisplayZones(savedZones));
      }
    },
    [savedZones, timeZones, buildDisplayZones],
  );

  // Reorder time zones
  const reorderTimeZones = useCallback(
    async (newOrder: TimeZoneDisplay[]) => {
      const newZones = newOrder.map(tz => tz.ianaName);
      setSavedZones(newZones);
      setTimeZones(newOrder);

      try {
        await saveTimeZones(newZones);
      } catch (error) {
        console.error('Failed to save reordered time zones:', error);
      }
    },
    [],
  );

  // Manual refresh
  const refreshTimes = useCallback(() => {
    setTimeZones(buildDisplayZones(savedZones));
  }, [savedZones, buildDisplayZones]);

  return {
    timeZones,
    isLoading,
    addTimeZone,
    removeTimeZone,
    reorderTimeZones,
    refreshTimes,
    pauseUpdates,
    resumeUpdates,
  };
}
