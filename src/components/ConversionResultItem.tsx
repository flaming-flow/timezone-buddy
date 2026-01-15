import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {ConversionResult} from '../types';
import {useResponsiveLayout} from '../hooks/useResponsiveLayout';

interface ConversionResultItemProps {
  result: ConversionResult;
  isBase?: boolean;
}

export function ConversionResultItem({
  result,
  isBase = false,
}: ConversionResultItemProps): React.ReactElement {
  const layout = useResponsiveLayout();

  // Extract just time and date parts from convertedTime
  // Format is like "Sun, Dec 28 at 10:39 PM"
  const timeParts = result.convertedTime.split(' at ');
  const datePart = timeParts[0]; // "Sun, Dec 28"
  const timePart = timeParts[1] || result.convertedTime; // "10:39 PM"

  return (
    <View
      style={[
        styles.container,
        isBase && styles.baseContainer,
        {
          padding: layout.spacing.medium,
        },
      ]}>
      {/* City name centered at top */}
      <View style={styles.headerRow}>
        <Text style={[styles.label, isBase && styles.baseLabel]}>
          {result.label}
        </Text>
        <View style={styles.badgeRow}>
          {isBase && (
            <View style={styles.baseBadge}>
              <Text style={styles.baseBadgeText}>BASE</Text>
            </View>
          )}
          {result.isDST && (
            <View style={styles.dstBadge}>
              <Text style={styles.dstText}>DST</Text>
            </View>
          )}
        </View>
      </View>

      {/* Time prominently in center */}
      <Text style={[styles.time, isBase && styles.baseTime]}>
        {timePart}
      </Text>

      {/* Date and offset at bottom */}
      <View style={styles.footerRow}>
        <Text style={styles.date}>{datePart}</Text>
        <Text style={styles.offset}>{result.offset}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 96,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  baseContainer: {
    backgroundColor: '#f0f9ff',
    borderWidth: 1.5,
    borderColor: '#0ea5e9',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  baseLabel: {
    color: '#0369a1',
    fontWeight: '600',
  },
  baseBadge: {
    backgroundColor: '#0ea5e9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  baseBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.3,
  },
  dstBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  dstText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#92400e',
    letterSpacing: 0.3,
  },
  time: {
    fontSize: 28,
    fontWeight: '300',
    color: '#1a1a1a',
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.5,
    marginVertical: 2,
  },
  baseTime: {
    color: '#0369a1',
    fontWeight: '400',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 4,
  },
  date: {
    fontSize: 12,
    color: '#999',
  },
  offset: {
    fontSize: 12,
    color: '#bbb',
  },
});
