/**
 * Tests for timezone service
 * Run with: npx jest src/domain/__tests__/timeZoneService.test.ts
 */

import {
  isValidTimezone,
  getOffsetMinutes,
  getOffsetString,
  isDSTActive,
  getTimezoneDebugInfo,
  getDSTTransitions,
  getCurrentDeviceTimezone,
  getAvailableTimeZones,
} from '../timeZoneService';

describe('isValidTimezone', () => {
  test('valid IANA timezones return true', () => {
    expect(isValidTimezone('America/New_York')).toBe(true);
    expect(isValidTimezone('Europe/London')).toBe(true);
    expect(isValidTimezone('Asia/Tokyo')).toBe(true);
    expect(isValidTimezone('UTC')).toBe(true);
    expect(isValidTimezone('Australia/Sydney')).toBe(true);
  });

  test('invalid timezones return false', () => {
    expect(isValidTimezone('Invalid/Timezone')).toBe(false);
    expect(isValidTimezone('')).toBe(false);
    expect(isValidTimezone('New York')).toBe(false);
    expect(isValidTimezone('America/Invalid_City')).toBe(false);
    // Note: EST/PST may be accepted by some JS engines but they're not proper IANA names
  });
});

describe('getOffsetMinutes', () => {
  test('UTC always returns 0', () => {
    const date = new Date('2025-06-15T12:00:00Z');
    expect(getOffsetMinutes('UTC', date)).toBe(0);
    expect(getOffsetMinutes('Etc/UTC', date)).toBe(0);
  });

  test('known offsets in winter (no DST)', () => {
    // January 15, 2025 - Northern hemisphere winter
    const winterDate = new Date('2025-01-15T12:00:00Z');

    // New York: EST = UTC-5 = -300 minutes
    expect(getOffsetMinutes('America/New_York', winterDate)).toBe(-300);

    // London: GMT = UTC+0 = 0 minutes
    expect(getOffsetMinutes('Europe/London', winterDate)).toBe(0);

    // Tokyo: JST = UTC+9 = 540 minutes (no DST)
    expect(getOffsetMinutes('Asia/Tokyo', winterDate)).toBe(540);
  });

  test('known offsets in summer (with DST)', () => {
    // July 15, 2025 - Northern hemisphere summer
    const summerDate = new Date('2025-07-15T12:00:00Z');

    // New York: EDT = UTC-4 = -240 minutes
    expect(getOffsetMinutes('America/New_York', summerDate)).toBe(-240);

    // London: BST = UTC+1 = 60 minutes
    expect(getOffsetMinutes('Europe/London', summerDate)).toBe(60);

    // Tokyo: JST = UTC+9 = 540 minutes (no DST)
    expect(getOffsetMinutes('Asia/Tokyo', summerDate)).toBe(540);
  });

  test('unusual offsets', () => {
    const date = new Date('2025-06-15T12:00:00Z');

    // India: UTC+5:30 = 330 minutes
    expect(getOffsetMinutes('Asia/Kolkata', date)).toBe(330);

    // Nepal: UTC+5:45 = 345 minutes
    expect(getOffsetMinutes('Asia/Kathmandu', date)).toBe(345);

    // Newfoundland summer: UTC-2:30 = -150 minutes
    expect(getOffsetMinutes('America/St_Johns', date)).toBe(-150);
  });

  test('Southern hemisphere DST (Australia)', () => {
    // January = summer in Australia (DST active)
    const janDate = new Date('2025-01-15T12:00:00Z');
    // Sydney AEDT = UTC+11 = 660 minutes
    expect(getOffsetMinutes('Australia/Sydney', janDate)).toBe(660);

    // July = winter in Australia (no DST)
    const julDate = new Date('2025-07-15T12:00:00Z');
    // Sydney AEST = UTC+10 = 600 minutes
    expect(getOffsetMinutes('Australia/Sydney', julDate)).toBe(600);
  });
});

describe('isDSTActive', () => {
  test('timezones without DST', () => {
    const date = new Date('2025-06-15T12:00:00Z');

    expect(isDSTActive('Asia/Tokyo', date)).toBe(false);
    expect(isDSTActive('Asia/Singapore', date)).toBe(false);
    expect(isDSTActive('UTC', date)).toBe(false);
    expect(isDSTActive('Asia/Dubai', date)).toBe(false);
  });

  test('Northern hemisphere DST', () => {
    // Winter - no DST
    const winterDate = new Date('2025-01-15T12:00:00Z');
    expect(isDSTActive('America/New_York', winterDate)).toBe(false);
    expect(isDSTActive('Europe/London', winterDate)).toBe(false);
    expect(isDSTActive('Europe/Paris', winterDate)).toBe(false);

    // Summer - DST active
    const summerDate = new Date('2025-07-15T12:00:00Z');
    expect(isDSTActive('America/New_York', summerDate)).toBe(true);
    expect(isDSTActive('Europe/London', summerDate)).toBe(true);
    expect(isDSTActive('Europe/Paris', summerDate)).toBe(true);
  });

  test('Southern hemisphere DST (inverted seasons)', () => {
    // January = summer in Australia - DST active
    const janDate = new Date('2025-01-15T12:00:00Z');
    expect(isDSTActive('Australia/Sydney', janDate)).toBe(true);
    expect(isDSTActive('Australia/Melbourne', janDate)).toBe(true);

    // July = winter in Australia - no DST
    const julDate = new Date('2025-07-15T12:00:00Z');
    expect(isDSTActive('Australia/Sydney', julDate)).toBe(false);
    expect(isDSTActive('Australia/Melbourne', julDate)).toBe(false);
  });

  test('Queensland (no DST even in Australia)', () => {
    // Brisbane does not observe DST
    const janDate = new Date('2025-01-15T12:00:00Z');
    const julDate = new Date('2025-07-15T12:00:00Z');

    expect(isDSTActive('Australia/Brisbane', janDate)).toBe(false);
    expect(isDSTActive('Australia/Brisbane', julDate)).toBe(false);
  });
});

describe('getOffsetString', () => {
  test('formats positive offsets correctly', () => {
    const date = new Date('2025-01-15T12:00:00Z');
    expect(getOffsetString('Asia/Tokyo', date)).toBe('GMT+9');
    expect(getOffsetString('Europe/Moscow', date)).toBe('GMT+3');
  });

  test('formats negative offsets correctly', () => {
    const date = new Date('2025-01-15T12:00:00Z');
    expect(getOffsetString('America/New_York', date)).toBe('GMT-5');
    expect(getOffsetString('America/Los_Angeles', date)).toBe('GMT-8');
  });

  test('formats half-hour offsets correctly', () => {
    const date = new Date('2025-01-15T12:00:00Z');
    expect(getOffsetString('Asia/Kolkata', date)).toBe('GMT+5:30');
  });

  test('formats 45-minute offsets correctly', () => {
    const date = new Date('2025-01-15T12:00:00Z');
    expect(getOffsetString('Asia/Kathmandu', date)).toBe('GMT+5:45');
  });
});

describe('getDSTTransitions', () => {
  test('finds DST transitions for New York 2025', () => {
    const transitions = getDSTTransitions('America/New_York', 2025);

    // Should have 2 transitions (spring forward, fall back)
    expect(transitions.length).toBe(2);

    // Spring forward: Second Sunday in March (March 9, 2025)
    expect(transitions[0].getMonth()).toBe(2); // March
    // Date may vary by ±1 depending on local timezone, check range
    expect(transitions[0].getDate()).toBeGreaterThanOrEqual(9);
    expect(transitions[0].getDate()).toBeLessThanOrEqual(10);

    // Fall back: First Sunday in November (November 2, 2025)
    expect(transitions[1].getMonth()).toBe(10); // November
    expect(transitions[1].getDate()).toBeGreaterThanOrEqual(2);
    expect(transitions[1].getDate()).toBeLessThanOrEqual(3);
  });

  test('no transitions for timezones without DST', () => {
    const transitions = getDSTTransitions('Asia/Tokyo', 2025);
    expect(transitions.length).toBe(0);
  });

  test('finds DST transitions for Sydney (Southern hemisphere)', () => {
    const transitions = getDSTTransitions('Australia/Sydney', 2025);

    // Should have 2 transitions
    expect(transitions.length).toBe(2);

    // In Australia, DST ends in April and starts in October
    // First transition should be in April (end of DST)
    expect(transitions[0].getMonth()).toBe(3); // April

    // Second transition should be in October (start of DST)
    expect(transitions[1].getMonth()).toBe(9); // October
  });
});

describe('getTimezoneDebugInfo', () => {
  test('returns correct info for valid timezone', () => {
    const info = getTimezoneDebugInfo('America/New_York');

    expect(info.isValid).toBe(true);
    expect(info.ianaName).toBe('America/New_York');
    expect(info.hasDST).toBe(true);
    expect(info.formattedTime).not.toBe('--:--');
  });

  test('returns invalid info for invalid timezone', () => {
    const info = getTimezoneDebugInfo('Invalid/Zone');

    expect(info.isValid).toBe(false);
    expect(info.formattedTime).toBe('--:--');
  });
});

describe('getCurrentDeviceTimezone', () => {
  test('returns a valid timezone string', () => {
    const tz = getCurrentDeviceTimezone();
    expect(typeof tz).toBe('string');
    expect(isValidTimezone(tz)).toBe(true);
  });
});

describe('getAvailableTimeZones', () => {
  test('all timezones in list are valid', () => {
    const zones = getAvailableTimeZones();

    for (const zone of zones) {
      expect(isValidTimezone(zone.ianaName)).toBe(true);
    }
  });

  test('includes major cities', () => {
    const zones = getAvailableTimeZones();
    const labels = zones.map(z => z.label);

    expect(labels).toContain('New York');
    expect(labels).toContain('London');
    expect(labels).toContain('Tokyo');
    expect(labels).toContain('Sydney');
    expect(labels).toContain('Dubai');
  });

  test('includes unusual offset timezones', () => {
    const zones = getAvailableTimeZones();
    const ianaNames = zones.map(z => z.ianaName);

    // Half-hour offsets
    expect(ianaNames).toContain('Asia/Kolkata'); // +5:30
    expect(ianaNames).toContain('America/St_Johns'); // -3:30/-2:30

    // 45-minute offset
    expect(ianaNames).toContain('Asia/Kathmandu'); // +5:45
  });
});

describe('Edge cases', () => {
  test('handles DST transition day correctly', () => {
    // March 9, 2025 - DST starts in US at 2:00 AM
    // At 1:59 AM -> EST (UTC-5)
    // At 3:00 AM -> EDT (UTC-4) (2:00 AM is skipped)

    const beforeDST = new Date('2025-03-09T06:59:00Z'); // 1:59 AM EST
    const afterDST = new Date('2025-03-09T07:01:00Z'); // 3:01 AM EDT

    expect(getOffsetMinutes('America/New_York', beforeDST)).toBe(-300); // EST
    expect(getOffsetMinutes('America/New_York', afterDST)).toBe(-240); // EDT
  });

  test('handles year boundary correctly', () => {
    const dec31 = new Date('2024-12-31T23:59:59Z');
    const jan1 = new Date('2025-01-01T00:00:01Z');

    // Both should be winter time (no DST)
    expect(isDSTActive('America/New_York', dec31)).toBe(false);
    expect(isDSTActive('America/New_York', jan1)).toBe(false);
  });

  test('handles leap year correctly', () => {
    // 2024 is a leap year
    const feb29 = new Date('2024-02-29T12:00:00Z');

    expect(getOffsetMinutes('America/New_York', feb29)).toBe(-300); // Winter, EST
    expect(getOffsetMinutes('Europe/London', feb29)).toBe(0); // Winter, GMT
  });
});
