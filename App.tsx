/**
 * TimeZone Widget App
 * Cross-platform world clock and time zone converter
 */

// Polyfills for full timezone support in Hermes
import '@formatjs/intl-getcanonicallocales/polyfill';
import '@formatjs/intl-locale/polyfill';
import '@formatjs/intl-datetimeformat/polyfill';
import '@formatjs/intl-datetimeformat/locale-data/en';
import '@formatjs/intl-datetimeformat/add-all-tz';

export { default } from './src/App';
