import React, {createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode} from 'react';
import {Person, PersonDisplay} from '../types';
import {
  getCurrentTimeInZone,
  getDateInZone,
  getOffsetString,
  isDSTActive,
  getLabelForZone,
} from '../domain/timeZoneService';
import {savePeople, loadPeople} from '../storage/storageService';

interface ContactsContextValue {
  contacts: PersonDisplay[];
  isLoading: boolean;
  addContact: (contact: Omit<Person, 'id' | 'createdAt'>) => void;
  updateContact: (id: string, updates: Partial<Omit<Person, 'id' | 'createdAt'>>) => void;
  removeContact: (id: string) => void;
  reorderContacts: (newOrder: PersonDisplay[]) => void;
  getContactById: (id: string) => PersonDisplay | undefined;
  refreshTimes: () => void;
}

const ContactsContext = createContext<ContactsContextValue | null>(null);

export function ContactsProvider({children}: {children: ReactNode}) {
  const [savedContacts, setSavedContacts] = useState<Person[]>([]);
  const [contacts, setContacts] = useState<PersonDisplay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const buildDisplayContacts = useCallback((contactList: Person[]): PersonDisplay[] => {
    return contactList.map(contact => ({
      ...contact,
      currentTime: getCurrentTimeInZone(contact.timezone),
      currentDate: getDateInZone(contact.timezone),
      offset: getOffsetString(contact.timezone),
      isDST: isDSTActive(contact.timezone),
      timezoneLabel: getLabelForZone(contact.timezone),
    }));
  }, []);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const loadedContacts = await loadPeople();
        setSavedContacts(loadedContacts);
        setContacts(buildDisplayContacts(loadedContacts));
      } catch (error) {
        console.error('Failed to load contacts:', error);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [buildDisplayContacts]);

  useEffect(() => {
    const updateTimes = () => {
      if (savedContacts.length > 0) {
        setContacts(buildDisplayContacts(savedContacts));
      }
    };

    intervalRef.current = setInterval(updateTimes, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [savedContacts, buildDisplayContacts]);

  const generateId = useCallback(() => {
    return `contact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  const addContact = useCallback(
    async (contactData: Omit<Person, 'id' | 'createdAt'>) => {
      const newContact: Person = {
        ...contactData,
        id: generateId(),
        createdAt: new Date().toISOString(),
      };

      const newContacts = [...savedContacts, newContact];
      setSavedContacts(newContacts);
      setContacts(buildDisplayContacts(newContacts));

      try {
        await savePeople(newContacts);
      } catch (error) {
        console.error('Failed to save contact:', error);
        setSavedContacts(savedContacts);
        setContacts(buildDisplayContacts(savedContacts));
      }
    },
    [savedContacts, buildDisplayContacts, generateId],
  );

  const updateContact = useCallback(
    async (id: string, updates: Partial<Omit<Person, 'id' | 'createdAt'>>) => {
      const newContacts = savedContacts.map(contact =>
        contact.id === id ? {...contact, ...updates} : contact,
      );
      setSavedContacts(newContacts);
      setContacts(buildDisplayContacts(newContacts));

      try {
        await savePeople(newContacts);
      } catch (error) {
        console.error('Failed to update contact:', error);
        setSavedContacts(savedContacts);
        setContacts(buildDisplayContacts(savedContacts));
      }
    },
    [savedContacts, buildDisplayContacts],
  );

  const removeContact = useCallback(
    async (id: string) => {
      const newContacts = savedContacts.filter(contact => contact.id !== id);
      setSavedContacts(newContacts);
      setContacts(buildDisplayContacts(newContacts));

      try {
        await savePeople(newContacts);
      } catch (error) {
        console.error('Failed to remove contact:', error);
        setSavedContacts(savedContacts);
        setContacts(buildDisplayContacts(savedContacts));
      }
    },
    [savedContacts, buildDisplayContacts],
  );

  const getContactById = useCallback(
    (id: string): PersonDisplay | undefined => {
      return contacts.find(contact => contact.id === id);
    },
    [contacts],
  );

  const reorderContacts = useCallback(
    async (newOrder: PersonDisplay[]) => {
      const reorderedPeople = newOrder.map(contact =>
        savedContacts.find(p => p.id === contact.id)!
      );
      setSavedContacts(reorderedPeople);
      setContacts(newOrder);

      try {
        await savePeople(reorderedPeople);
      } catch (error) {
        console.error('Failed to save reordered contacts:', error);
      }
    },
    [savedContacts],
  );

  const refreshTimes = useCallback(() => {
    setContacts(buildDisplayContacts(savedContacts));
  }, [savedContacts, buildDisplayContacts]);

  return (
    <ContactsContext.Provider
      value={{
        contacts,
        isLoading,
        addContact,
        updateContact,
        removeContact,
        reorderContacts,
        getContactById,
        refreshTimes,
      }}>
      {children}
    </ContactsContext.Provider>
  );
}

export function useContacts(): ContactsContextValue {
  const context = useContext(ContactsContext);
  if (!context) {
    throw new Error('useContacts must be used within a ContactsProvider');
  }
  return context;
}
