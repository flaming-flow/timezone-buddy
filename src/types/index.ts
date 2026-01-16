// Time zone entry stored in the user's list
export interface TimeZoneEntry {
  id: string;
  ianaName: string; // e.g., "America/New_York"
  label: string; // e.g., "New York"
}

// Displayed time zone with current time info
export interface TimeZoneDisplay {
  id: string;
  ianaName: string;
  label: string;
  currentTime: string;
  currentDate: string; // e.g., "Sun, Dec 28"
  offset: string; // e.g., "GMT-5"
  isDST: boolean;
}

// Input for time conversion
export interface ConversionInput {
  dateTime: Date;
  baseTimeZone: string;
}

// Result of time conversion for a single zone
export interface ConversionResult {
  timeZone: string;
  label: string;
  convertedTime: string;
  offset: string;
  isDST: boolean;
}

// Layout mode for responsive design
export type LayoutMode = 'compact' | 'comfortable' | 'spacious';

// Responsive layout info
export interface ResponsiveLayout {
  isWideScreen: boolean;
  isDesktop: boolean;
  columns: 1 | 2 | 3;
  contentMaxWidth: number;
  layoutMode: LayoutMode;
  spacing: {
    small: number;
    medium: number;
    large: number;
  };
}

// Person/Contact entry stored in the user's list
export interface Person {
  id: string;
  name: string;
  timezone: string; // IANA timezone name (e.g., "America/New_York")
  notes?: string;
  createdAt: string; // ISO date string
}

// Person display with current time info (for rendering)
export interface PersonDisplay extends Person {
  currentTime: string;
  currentDate: string;
  offset: string;
  isDST: boolean;
  timezoneLabel: string; // Human-readable label (e.g., "New York")
}

// Meeting participant (for Meeting Planner)
export interface MeetingParticipant {
  id: string;
  type: 'me' | 'contact' | 'timezone';
  contactId?: string; // Reference to Person.id if type='contact'
  timezone: string; // IANA timezone name
  label: string; // Display name: "You", contact name, or city
  workingHours: {
    start: number; // e.g., 9.0 for 9:00 AM
    end: number; // e.g., 18.0 for 6:00 PM
  };
}

// Multi-zone overlap result
export interface MultiZoneOverlapResult {
  hasOverlap: boolean;
  overlapHours: number;
  // Time ranges in each participant's local timezone
  participantTimes: Array<{
    participantId: string;
    label: string;
    timezone: string;
    startTime: string; // Formatted: "15:00"
    endTime: string; // Formatted: "18:00"
    isLateHours: boolean; // true if before 7am or after 9pm
  }>;
}

// App settings
export interface AppSettings {
  myTimezone: string; // IANA timezone name
  defaultWorkingHours: {
    start: number;
    end: number;
  };
}

