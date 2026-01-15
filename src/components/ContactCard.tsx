import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Platform} from 'react-native';
import {PersonDisplay} from '../types';

interface ContactCardProps {
  person: PersonDisplay;
  onDelete?: (id: string) => void;
  width?: number;
  height?: number;
}

/**
 * Compact contact card for sidebar display
 * Vertical layout optimized for narrow column
 */
export function ContactCard({
  person,
  onDelete,
  width,
  height,
}: ContactCardProps): React.ReactElement {
  const dynamicStyle = width && height ? {width, height} : {};

  return (
    <View
      style={[styles.container, dynamicStyle]}
      accessibilityLabel={`View ${person.name}'s details`}
      accessibilityRole="button">
      {/* Delete button */}
      {onDelete && (
        <TouchableOpacity
          onPress={() => onDelete(person.id)}
          style={styles.deleteButton}
          hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
          accessibilityLabel={`Delete ${person.name}`}
          accessibilityRole="button">
          <Text style={styles.deleteText}>×</Text>
        </TouchableOpacity>
      )}

      {/* Avatar */}
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {person.name.charAt(0).toUpperCase()}
        </Text>
      </View>

      {/* Name */}
      <Text style={styles.name} numberOfLines={1}>
        {person.name}
      </Text>

      {/* Time - large and prominent */}
      <Text style={styles.time}>{person.currentTime}</Text>

      {/* Timezone info */}
      <Text style={styles.offset}>{person.offset}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  deleteButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0,0,0,0.06)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteText: {
    fontSize: 15,
    color: '#8e8e93',
    fontWeight: '400',
    lineHeight: 20,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatarText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1d1d1f',
    textAlign: 'center',
    marginBottom: 6,
  },
  time: {
    fontSize: 22,
    fontWeight: '300',
    color: '#000',
    fontVariant: ['tabular-nums'],
    fontFamily: Platform.select({
      ios: 'System',
      default: undefined,
    }),
    letterSpacing: -0.5,
  },
  offset: {
    fontSize: 12,
    color: '#8e8e93',
    marginTop: 4,
  },
});
