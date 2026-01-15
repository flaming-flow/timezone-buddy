import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Platform} from 'react-native';
import {PersonDisplay} from '../types';

interface PersonItemProps {
  person: PersonDisplay;
  onPress: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function PersonItem({
  person,
  onPress,
  onDelete,
}: PersonItemProps): React.ReactElement {
  // Extract just the time without seconds for cleaner display
  const shortTime = person.currentTime.replace(/:\d{2}(?=\s|$)/, '');

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(person.id)}
      accessibilityLabel={`View ${person.name}'s details`}
      accessibilityRole="button">
      {/* Person avatar placeholder */}
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {person.name.charAt(0).toUpperCase()}
        </Text>
      </View>

      {/* Person info */}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {person.name}
        </Text>
        <Text style={styles.timezone} numberOfLines={1}>
          {person.timezoneLabel} ({person.offset})
        </Text>
      </View>

      {/* Current time */}
      <View style={styles.timeContainer}>
        <Text style={styles.time}>{shortTime}</Text>
        <Text style={styles.date}>{person.currentDate}</Text>
      </View>

      {/* Optional delete button */}
      {onDelete && (
        <TouchableOpacity
          onPress={e => {
            e.stopPropagation();
            onDelete(person.id);
          }}
          style={styles.deleteButton}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
          accessibilityLabel={`Delete ${person.name}`}
          accessibilityRole="button">
          <Text style={styles.deleteText}>-</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  info: {
    flex: 1,
    marginRight: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1d1d1f',
  },
  timezone: {
    fontSize: 13,
    color: '#8e8e93',
    marginTop: 2,
  },
  timeContainer: {
    alignItems: 'flex-end',
  },
  time: {
    fontSize: 18,
    fontWeight: '300',
    color: '#000',
    fontVariant: ['tabular-nums'],
    fontFamily: Platform.select({
      ios: 'System',
      default: undefined,
    }),
  },
  date: {
    fontSize: 11,
    color: '#8e8e93',
    marginTop: 2,
  },
  deleteButton: {
    position: 'absolute',
    top: 6,
    right: 8,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(0,0,0,0.06)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteText: {
    fontSize: 16,
    color: '#8e8e93',
    fontWeight: '300',
    lineHeight: 18,
  },
});
