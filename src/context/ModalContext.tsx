import React, {createContext, useContext, useState, useCallback, ReactNode} from 'react';
import {TimeZonePicker} from '../components/TimeZonePicker';
import {PersonDetailModal} from '../components/PersonDetailModal';

// Config types
interface TimeZonePickerConfig {
  onSelect: (ianaName: string) => void;
  excludeZones?: string[];
}

interface PersonDetailModalConfig {
  personId?: string;
  onClose?: () => void;
}

// Context type
interface ModalContextType {
  showTimeZonePicker: (config: TimeZonePickerConfig) => void;
  hideTimeZonePicker: () => void;
  showPersonDetailModal: (config: PersonDetailModalConfig) => void;
  hidePersonDetailModal: () => void;
  isAnyModalOpen: boolean; // Used to disable drag components when modal is open
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

// Hook to use modal context
export function useModal(): ModalContextType {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
}

// Provider component
interface ModalProviderProps {
  children: ReactNode;
}

export function ModalProvider({children}: ModalProviderProps): React.ReactElement {
  // TimeZonePicker state
  const [tzPickerConfig, setTzPickerConfig] = useState<TimeZonePickerConfig | null>(null);

  // PersonDetailModal state
  const [personModalConfig, setPersonModalConfig] = useState<PersonDetailModalConfig | null>(null);

  // TimeZonePicker handlers
  const showTimeZonePicker = useCallback((config: TimeZonePickerConfig) => {
    setTzPickerConfig(config);
  }, []);

  const hideTimeZonePicker = useCallback(() => {
    setTzPickerConfig(null);
  }, []);

  // PersonDetailModal handlers
  const showPersonDetailModal = useCallback((config: PersonDetailModalConfig) => {
    setPersonModalConfig(config);
  }, []);

  const hidePersonDetailModal = useCallback(() => {
    setPersonModalConfig(null);
  }, []);

  // Handle timezone selection
  const handleTimeZoneSelect = useCallback((ianaName: string) => {
    if (tzPickerConfig?.onSelect) {
      tzPickerConfig.onSelect(ianaName);
    }
    hideTimeZonePicker();
  }, [tzPickerConfig, hideTimeZonePicker]);

  // Handle person modal close
  const handlePersonModalClose = useCallback(() => {
    if (personModalConfig?.onClose) {
      personModalConfig.onClose();
    }
    hidePersonDetailModal();
  }, [personModalConfig, hidePersonDetailModal]);

  const isAnyModalOpen = !!tzPickerConfig || !!personModalConfig;

  const contextValue: ModalContextType = {
    showTimeZonePicker,
    hideTimeZonePicker,
    showPersonDetailModal,
    hidePersonDetailModal,
    isAnyModalOpen,
  };

  return (
    <ModalContext.Provider value={contextValue}>
      {children}

      {/* Global modals - rendered outside the main component tree */}
      <TimeZonePicker
        visible={!!tzPickerConfig}
        onSelect={handleTimeZoneSelect}
        onClose={hideTimeZonePicker}
        excludeZones={tzPickerConfig?.excludeZones}
      />

      <PersonDetailModal
        visible={!!personModalConfig}
        personId={personModalConfig?.personId}
        onClose={handlePersonModalClose}
      />
    </ModalContext.Provider>
  );
}
