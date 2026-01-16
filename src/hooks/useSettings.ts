import {useState, useEffect, useCallback} from 'react';
import {AppSettings} from '../types';
import {loadSettings, saveSettings} from '../storage/storageService';
import {getCurrentDeviceTimezone} from '../domain/timeZoneService';

interface UseSettingsResult {
  settings: AppSettings;
  isLoading: boolean;
  updateMyTimezone: (timezone: string) => Promise<void>;
  updateWorkingHours: (hours: {start: number; end: number}) => Promise<void>;
}

/**
 * Hook for managing app settings (my timezone, default working hours)
 */
export function useSettings(): UseSettingsResult {
  const [settings, setSettings] = useState<AppSettings>({
    myTimezone: getCurrentDeviceTimezone(),
    defaultWorkingHours: {start: 9, end: 18},
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load settings on mount
  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const loaded = await loadSettings();
        setSettings(loaded);
      } catch (error) {
        console.error('Failed to load settings:', error);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const updateMyTimezone = useCallback(async (timezone: string) => {
    const newSettings = {...settings, myTimezone: timezone};
    setSettings(newSettings);
    try {
      await saveSettings(newSettings);
    } catch (error) {
      console.error('Failed to save timezone:', error);
      // Revert on error
      setSettings(settings);
    }
  }, [settings]);

  const updateWorkingHours = useCallback(
    async (hours: {start: number; end: number}) => {
      const newSettings = {...settings, defaultWorkingHours: hours};
      setSettings(newSettings);
      try {
        await saveSettings(newSettings);
      } catch (error) {
        console.error('Failed to save working hours:', error);
        // Revert on error
        setSettings(settings);
      }
    },
    [settings],
  );

  return {
    settings,
    isLoading,
    updateMyTimezone,
    updateWorkingHours,
  };
}
