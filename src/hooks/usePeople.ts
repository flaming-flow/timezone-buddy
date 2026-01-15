import {useState, useEffect, useCallback, useRef} from 'react';
import {Person, PersonDisplay} from '../types';
import {
  getCurrentTimeInZone,
  getDateInZone,
  getOffsetString,
  isDSTActive,
  getLabelForZone,
} from '../domain/timeZoneService';
import {savePeople, loadPeople} from '../storage/storageService';

interface UsePeopleResult {
  people: PersonDisplay[];
  isLoading: boolean;
  addPerson: (person: Omit<Person, 'id' | 'createdAt'>) => void;
  updatePerson: (id: string, updates: Partial<Omit<Person, 'id' | 'createdAt'>>) => void;
  removePerson: (id: string) => void;
  getPersonById: (id: string) => PersonDisplay | undefined;
  refreshTimes: () => void;
}

/**
 * Hook for managing people/contacts with their timezones
 * Follows the same pattern as useTimeZones
 */
export function usePeople(): UsePeopleResult {
  const [savedPeople, setSavedPeople] = useState<Person[]>([]);
  const [people, setPeople] = useState<PersonDisplay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Build display objects from Person objects
  const buildDisplayPeople = useCallback((personList: Person[]): PersonDisplay[] => {
    return personList.map(person => ({
      ...person,
      currentTime: getCurrentTimeInZone(person.timezone),
      currentDate: getDateInZone(person.timezone),
      offset: getOffsetString(person.timezone),
      isDST: isDSTActive(person.timezone),
      timezoneLabel: getLabelForZone(person.timezone),
    }));
  }, []);

  // Load saved people on mount
  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const loadedPeople = await loadPeople();
        setSavedPeople(loadedPeople);
        setPeople(buildDisplayPeople(loadedPeople));
      } catch (error) {
        console.error('Failed to load people:', error);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [buildDisplayPeople]);

  // Update times every second
  useEffect(() => {
    const updateTimes = () => {
      if (savedPeople.length > 0) {
        setPeople(buildDisplayPeople(savedPeople));
      }
    };

    intervalRef.current = setInterval(updateTimes, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [savedPeople, buildDisplayPeople]);

  // Generate unique ID
  const generateId = useCallback(() => {
    return `person_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Add a new person
  const addPerson = useCallback(
    async (personData: Omit<Person, 'id' | 'createdAt'>) => {
      const newPerson: Person = {
        ...personData,
        id: generateId(),
        createdAt: new Date().toISOString(),
      };

      const newPeople = [...savedPeople, newPerson];
      setSavedPeople(newPeople);
      setPeople(buildDisplayPeople(newPeople));

      try {
        await savePeople(newPeople);
      } catch (error) {
        console.error('Failed to save person:', error);
        // Revert on error
        setSavedPeople(savedPeople);
        setPeople(buildDisplayPeople(savedPeople));
      }
    },
    [savedPeople, buildDisplayPeople, generateId],
  );

  // Update an existing person
  const updatePerson = useCallback(
    async (id: string, updates: Partial<Omit<Person, 'id' | 'createdAt'>>) => {
      const newPeople = savedPeople.map(person =>
        person.id === id ? {...person, ...updates} : person,
      );
      setSavedPeople(newPeople);
      setPeople(buildDisplayPeople(newPeople));

      try {
        await savePeople(newPeople);
      } catch (error) {
        console.error('Failed to update person:', error);
        // Revert on error
        setSavedPeople(savedPeople);
        setPeople(buildDisplayPeople(savedPeople));
      }
    },
    [savedPeople, buildDisplayPeople],
  );

  // Remove a person
  const removePerson = useCallback(
    async (id: string) => {
      const newPeople = savedPeople.filter(person => person.id !== id);
      setSavedPeople(newPeople);
      setPeople(buildDisplayPeople(newPeople));

      try {
        await savePeople(newPeople);
      } catch (error) {
        console.error('Failed to remove person:', error);
        // Revert on error
        setSavedPeople(savedPeople);
        setPeople(buildDisplayPeople(savedPeople));
      }
    },
    [savedPeople, buildDisplayPeople],
  );

  // Get person by ID
  const getPersonById = useCallback(
    (id: string): PersonDisplay | undefined => {
      return people.find(person => person.id === id);
    },
    [people],
  );

  // Manual refresh
  const refreshTimes = useCallback(() => {
    setPeople(buildDisplayPeople(savedPeople));
  }, [savedPeople, buildDisplayPeople]);

  return {
    people,
    isLoading,
    addPerson,
    updatePerson,
    removePerson,
    getPersonById,
    refreshTimes,
  };
}
