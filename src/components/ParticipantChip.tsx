import React, {useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {MeetingParticipant} from '../types';
import {WorkingHoursPicker} from './WorkingHoursPicker';

interface ParticipantChipProps {
  participant: MeetingParticipant;
  onRemove: (id: string) => void;
  onUpdateWorkingHours: (id: string, hours: {start: number; end: number}) => void;
  isRemovable?: boolean;
}

/**
 * Compact chip showing participant with working hours
 * Tap to edit working hours, × to remove
 */
export function ParticipantChip({
  participant,
  onRemove,
  onUpdateWorkingHours,
  isRemovable = true,
}: ParticipantChipProps): React.ReactElement {
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const startHour = Math.floor(participant.workingHours.start);
  const startMinute = Math.round((participant.workingHours.start % 1) * 60);
  const endHour = Math.floor(participant.workingHours.end);
  const endMinute = Math.round((participant.workingHours.end % 1) * 60);

  const formatTime = (hour: number, minute: number) =>
    `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

  const handleStartChange = (hour: number, minute: number) => {
    onUpdateWorkingHours(participant.id, {
      start: hour + minute / 60,
      end: participant.workingHours.end,
    });
  };

  const handleEndChange = (hour: number, minute: number) => {
    onUpdateWorkingHours(participant.id, {
      start: participant.workingHours.start,
      end: hour + minute / 60,
    });
  };

  const isMe = participant.type === 'me';
  const initial = participant.label.charAt(0).toUpperCase();

  return (
    <View style={[styles.container, isMe && styles.containerMe]}>
      {/* Avatar */}
      <View style={[styles.avatar, isMe && styles.avatarMe]}>
        <Text style={styles.avatarText}>{isMe ? '👤' : initial}</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>
          {participant.label}
        </Text>

        {/* Working hours - tappable */}
        <View style={styles.hoursRow}>
          <TouchableOpacity
            onPress={() => setShowStartPicker(true)}
            hitSlop={{top: 5, bottom: 5, left: 5, right: 5}}>
            <Text style={styles.hoursText}>
              {formatTime(startHour, startMinute)}
            </Text>
          </TouchableOpacity>
          <Text style={styles.hoursSeparator}>–</Text>
          <TouchableOpacity
            onPress={() => setShowEndPicker(true)}
            hitSlop={{top: 5, bottom: 5, left: 5, right: 5}}>
            <Text style={styles.hoursText}>
              {formatTime(endHour, endMinute)}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Remove button */}
      {isRemovable && (
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => onRemove(participant.id)}
          hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
          accessibilityLabel={`Remove ${participant.label}`}>
          <Text style={styles.removeText}>×</Text>
        </TouchableOpacity>
      )}

      {/* Time Pickers */}
      <WorkingHoursPicker
        visible={showStartPicker}
        title="Work Starts"
        hour={startHour}
        minute={startMinute}
        onHourChange={h => handleStartChange(h, startMinute)}
        onMinuteChange={m => handleStartChange(startHour, m)}
        onClose={() => setShowStartPicker(false)}
      />

      <WorkingHoursPicker
        visible={showEndPicker}
        title="Work Ends"
        hour={endHour}
        minute={endMinute}
        onHourChange={h => handleEndChange(h, endMinute)}
        onMinuteChange={m => handleEndChange(endHour, m)}
        onClose={() => setShowEndPicker(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    paddingRight: 8,
    marginRight: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
    minWidth: 120,
  },
  containerMe: {
    backgroundColor: '#f0f7ff',
    borderWidth: 1,
    borderColor: '#007AFF20',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e5e5e7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  avatarMe: {
    backgroundColor: '#007AFF20',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1d1d1f',
  },
  content: {
    flex: 1,
    minWidth: 60,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1d1d1f',
    marginBottom: 2,
  },
  hoursRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hoursText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
    fontVariant: ['tabular-nums'],
  },
  hoursSeparator: {
    fontSize: 12,
    color: '#86868b',
    marginHorizontal: 3,
  },
  removeButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#f5f5f7',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  removeText: {
    fontSize: 14,
    color: '#86868b',
    fontWeight: '500',
    marginTop: -1,
  },
});
