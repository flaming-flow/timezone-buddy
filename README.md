# TimeZone Widget App

A cross-platform mobile application for managing world clocks, converting times across time zones, and planning meetings with participants in different locations.

## Features

### World Clock
- View current time in multiple time zones simultaneously
- Add and remove time zones from your collection
- Drag-and-drop reordering of time zones
- Persistent storage of your preferred time zones

### Time Converter
- Convert any date and time across all your saved time zones
- Select a base time zone for conversion
- "Now" button for quick current time conversion
- Visual distinction for the base time zone

### Meeting Planner
- Find optimal meeting times across multiple time zones
- Visual representation of working hours overlap
- Plan meetings that work for all participants

## Technologies

- **React Native** - Cross-platform mobile framework
- **Expo** (~52.0.0) - Development and build toolchain
- **TypeScript** - Type-safe JavaScript
- **React Navigation** - Bottom tab navigation
- **React Native Reanimated** - Smooth animations
- **React Native Gesture Handler** - Touch handling and gestures
- **React Native Drag Sort** - Drag-and-drop functionality for reordering
- **Async Storage** - Persistent local storage for user preferences
- **React Native Safe Area Context** - Safe area handling for notches/islands

## Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn
- Expo CLI
- For iOS: macOS with Xcode installed
- For Android: Android Studio with an emulator or physical device

## Installation

1. Clone the repository and navigate to the app directory:
   ```bash
   cd TimezoneWidgetApp
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Running the App

### Start the development server:
```bash
npm start
```

### Run on specific platforms:

**iOS Simulator:**
```bash
npm run ios
```

**Android Emulator:**
```bash
npm run android
```

**Web Browser:**
```bash
npm run web
```

### Using Expo Go

You can also scan the QR code displayed in the terminal with the Expo Go app on your physical device.

## Project Structure

```
TimezoneWidgetApp/
├── App.tsx                 # Entry point
├── src/
│   ├── App.tsx             # Main app with navigation
│   ├── screens/
│   │   ├── WorldClockScreen.tsx
│   │   ├── ConverterScreen.tsx
│   │   └── MeetingPlannerScreen.tsx
│   ├── components/
│   │   ├── TimeZoneItem.tsx
│   │   ├── TimeZonePicker.tsx
│   │   ├── DateTimePicker.tsx
│   │   ├── BaseTimeZoneSelector.tsx
│   │   ├── ConversionResultItem.tsx
│   │   └── MeetingPlanner.tsx
│   ├── hooks/
│   │   ├── useTimeZones.ts
│   │   ├── useConverter.ts
│   │   └── useResponsiveLayout.ts
│   ├── domain/
│   │   └── timeZoneService.ts
│   ├── storage/
│   │   └── storageService.ts
│   └── types/
│       └── index.ts
└── package.json
```

## License

MIT
