import {useWindowDimensions, Platform} from 'react-native';
import {useMemo} from 'react';
import {ResponsiveLayout, LayoutMode} from '../types';

// Breakpoints
const BREAKPOINTS = {
  WIDE: 768,
  DESKTOP: 1024,
} as const;

/**
 * Hook that provides responsive layout information based on screen size
 * Optimized for macOS/desktop usage with wider layouts and better spacing
 */
export function useResponsiveLayout(): ResponsiveLayout {
  const {width} = useWindowDimensions();

  return useMemo(() => {
    const isWideScreen = width >= BREAKPOINTS.WIDE;
    const isDesktop = width >= BREAKPOINTS.DESKTOP || Platform.OS === 'macos';

    // Determine number of columns for grid layout
    let columns: 1 | 2 | 3 = 1;
    if (width >= BREAKPOINTS.DESKTOP) {
      columns = 3;
    } else if (width >= BREAKPOINTS.WIDE) {
      columns = 2;
    }

    // Determine layout mode
    let layoutMode: LayoutMode = 'compact';
    if (isDesktop) {
      layoutMode = 'spacious';
    } else if (isWideScreen) {
      layoutMode = 'comfortable';
    }

    // Calculate spacing based on layout mode
    const spacing = {
      compact: {small: 8, medium: 12, large: 16},
      comfortable: {small: 12, medium: 16, large: 24},
      spacious: {small: 16, medium: 24, large: 32},
    }[layoutMode];

    // Max content width (centered on large screens)
    const contentMaxWidth = isDesktop ? 900 : isWideScreen ? 700 : width;

    return {
      isWideScreen,
      isDesktop,
      columns,
      contentMaxWidth,
      layoutMode,
      spacing,
    };
  }, [width]);
}

/**
 * Hook for getting consistent component sizes based on layout
 */
export function useComponentSizes() {
  const {layoutMode} = useResponsiveLayout();

  return useMemo(() => {
    const sizes = {
      compact: {
        buttonHeight: 44,
        inputHeight: 44,
        listItemHeight: 72,
        iconSize: 20,
        fontSize: {
          small: 12,
          medium: 14,
          large: 18,
          title: 24,
        },
      },
      comfortable: {
        buttonHeight: 48,
        inputHeight: 48,
        listItemHeight: 80,
        iconSize: 22,
        fontSize: {
          small: 13,
          medium: 15,
          large: 20,
          title: 28,
        },
      },
      spacious: {
        buttonHeight: 52,
        inputHeight: 52,
        listItemHeight: 88,
        iconSize: 24,
        fontSize: {
          small: 14,
          medium: 16,
          large: 22,
          title: 32,
        },
      },
    };

    return sizes[layoutMode];
  }, [layoutMode]);
}
