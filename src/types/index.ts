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

