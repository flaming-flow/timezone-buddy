import React, {useMemo} from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import {MeetingParticipant, MultiZoneOverlapResult} from '../types';
import {getOffsetMinutes} from '../domain/timeZoneService';

interface TimelineViewProps {
  participants: MeetingParticipant[];
  overlap: MultiZoneOverlapResult | null;
  referenceDate: Date;
}

const HOUR_WIDTH = 28;
const TOTAL_HOURS = 24;
const TIMELINE_WIDTH = HOUR_WIDTH * TOTAL_HOURS;

/**
 * Visual 24-hour timeline showing working hours for all participants
 * Highlights overlap region
 */
export function TimelineView({
  participants,
  overlap,
  referenceDate,
}: TimelineViewProps): React.ReactElement {
  // Calculate current hour marker position for each timezone
  const currentHourPositions = useMemo(() => {
    const positions: Record<string, number> = {};
    participants.forEach(p => {
      const offsetMinutes = getOffsetMinutes(p.timezone);
      const now = new Date();
      const utcHours = now.getUTCHours() + now.getUTCMinutes() / 60;
      const localHours = (utcHours + offsetMinutes / 60 + 24) % 24;
      positions[p.id] = localHours;
    });
    return positions;
  }, [participants, referenceDate]);

  // Calculate overlap bar position (in hours from midnight of first participant's timezone)
  const overlapBar = useMemo(() => {
    if (!overlap?.hasOverlap || participants.length < 2) return null;

    // Find the overlap time in the first participant's timezone
    const firstParticipant = overlap.participantTimes[0];
    if (!firstParticipant) return null;

    const startParts = firstParticipant.startTime.split(':');
    const endParts = firstParticipant.endTime.split(':');
    const startHour = parseInt(startParts[0], 10) + parseInt(startParts[1], 10) / 60;
    let endHour = parseInt(endParts[0], 10) + parseInt(endParts[1], 10) / 60;

    // Handle overnight overlap
    if (endHour < startHour) {
      endHour += 24;
    }

    return {start: startHour, end: Math.min(endHour, 24)};
  }, [overlap, participants]);

  const hours = useMemo(() => Array.from({length: TOTAL_HOURS}, (_, i) => i), []);

  const isNightHour = (hour: number) => hour < 7 || hour >= 21;
  const isLateHour = (hour: number) => hour < 7 || hour >= 22;

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        <View style={styles.timeline}>
          {/* Hour labels */}
          <View style={styles.hourLabels}>
            {hours.map(hour => (
              <View key={hour} style={[styles.hourLabel, {width: HOUR_WIDTH}]}>
                <Text
                  style={[
                    styles.hourText,
                    isNightHour(hour) && styles.hourTextNight,
                  ]}>
                  {hour.toString().padStart(2, '0')}
                </Text>
              </View>
            ))}
          </View>

          {/* Participant rows */}
          {participants.map((participant, index) => (
            <View key={participant.id} style={styles.participantRow}>
              {/* Label */}
              <View style={styles.participantLabel}>
                <Text style={styles.participantName} numberOfLines={1}>
                  {participant.label}
                </Text>
              </View>

              {/* Timeline bar */}
              <View style={styles.timelineBar}>
                {/* Night background */}
                <View style={[styles.nightZone, {left: 0, width: 7 * HOUR_WIDTH}]} />
                <View
                  style={[
                    styles.nightZone,
                    {left: 21 * HOUR_WIDTH, width: 3 * HOUR_WIDTH},
                  ]}
                />

                {/* Working hours bar */}
                <View
                  style={[
                    styles.workingBar,
                    {
                      left: participant.workingHours.start * HOUR_WIDTH,
                      width:
                        (participant.workingHours.end -
                          participant.workingHours.start) *
                        HOUR_WIDTH,
                    },
                    isLateHour(participant.workingHours.start) && styles.workingBarLate,
                  ]}
                />

                {/* Current time indicator */}
                {currentHourPositions[participant.id] !== undefined && (
                  <View
                    style={[
                      styles.currentTimeIndicator,
                      {left: currentHourPositions[participant.id] * HOUR_WIDTH - 1},
                    ]}
                  />
                )}
              </View>
            </View>
          ))}

          {/* Overlap indicator (spans all rows) */}
          {overlapBar && participants.length >= 2 && (
            <View
              style={[
                styles.overlapIndicator,
                {
                  left: 80 + overlapBar.start * HOUR_WIDTH,
                  width: (overlapBar.end - overlapBar.start) * HOUR_WIDTH,
                  height: participants.length * 44 + 4,
                  top: 28,
                },
              ]}
            />
          )}
        </View>
      </ScrollView>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.legendDotWork]} />
          <Text style={styles.legendText}>Working</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.legendDotOverlap]} />
          <Text style={styles.legendText}>Overlap</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.legendDotNight]} />
          <Text style={styles.legendText}>Night</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
  },
  scrollContent: {
    paddingRight: 16,
  },
  timeline: {
    position: 'relative',
  },
  hourLabels: {
    flexDirection: 'row',
    marginLeft: 80,
    marginBottom: 8,
  },
  hourLabel: {
    alignItems: 'center',
  },
  hourText: {
    fontSize: 10,
    color: '#86868b',
    fontWeight: '500',
    fontVariant: ['tabular-nums'],
  },
  hourTextNight: {
    color: '#c7c7cc',
  },
  participantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    marginBottom: 4,
  },
  participantLabel: {
    width: 72,
    paddingRight: 8,
  },
  participantName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1d1d1f',
    textAlign: 'right',
  },
  timelineBar: {
    height: 24,
    width: TIMELINE_WIDTH,
    backgroundColor: '#f5f5f7',
    borderRadius: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  nightZone: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    backgroundColor: '#f0f0f2',
  },
  workingBar: {
    position: 'absolute',
    top: 2,
    bottom: 2,
    backgroundColor: '#007AFF',
    borderRadius: 3,
    opacity: 0.8,
  },
  workingBarLate: {
    backgroundColor: '#FF9500',
  },
  currentTimeIndicator: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: '#FF3B30',
    borderRadius: 1,
  },
  overlapIndicator: {
    position: 'absolute',
    backgroundColor: '#34C75920',
    borderWidth: 2,
    borderColor: '#34C759',
    borderRadius: 6,
    borderStyle: 'dashed',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 2,
    marginRight: 4,
  },
  legendDotWork: {
    backgroundColor: '#007AFF',
  },
  legendDotOverlap: {
    backgroundColor: '#34C759',
  },
  legendDotNight: {
    backgroundColor: '#f0f0f2',
  },
  legendText: {
    fontSize: 11,
    color: '#86868b',
  },
});
