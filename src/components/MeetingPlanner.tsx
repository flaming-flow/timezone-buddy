import React, {useState, useMemo, useCallback, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Share,
  ScrollView,
  Alert,
} from 'react-native';
import {MeetingParticipant, PersonDisplay, MultiZoneOverlapResult} from '../types';
import {
  findMultiZoneOverlap,
  generateMeetingShareText,
  getLabelForZone,
} from '../domain/timeZoneService';
import {useSettings} from '../hooks/useSettings';
import {useContacts} from '../context/ContactsContext';
import {
  saveMeetingParticipants,
  loadMeetingParticipants,
} from '../storage/storageService';
import {ParticipantChip} from './ParticipantChip';
import {ParticipantPicker} from './ParticipantPicker';
import {TimelineView} from './TimelineView';

interface MeetingPlannerProps {
  savedZones: string[];
}

const MAX_PARTICIPANTS = 5;

export function MeetingPlanner({savedZones}: MeetingPlannerProps): React.ReactElement {
  const {settings} = useSettings();
  const {contacts} = useContacts();
  const [participants, setParticipants] = useState<MeetingParticipant[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize with "You" participant on first load
  useEffect(() => {
    async function loadParticipants() {
      setIsLoading(true);
      try {
        const saved = await loadMeetingParticipants();
        if (saved.length > 0) {
          // Update "me" participant's timezone from settings
          const updated = saved.map(p =>
            p.type === 'me'
              ? {...p, timezone: settings.myTimezone, label: 'You'}
              : p,
          );
          setParticipants(updated);
        } else {
          // Create default "You" participant
          const meParticipant: MeetingParticipant = {
            id: 'me',
            type: 'me',
            timezone: settings.myTimezone,
            label: 'You',
            workingHours: settings.defaultWorkingHours,
          };
          setParticipants([meParticipant]);
        }
      } catch (error) {
        console.error('Failed to load participants:', error);
        // Fallback to default
        const meParticipant: MeetingParticipant = {
          id: 'me',
          type: 'me',
          timezone: settings.myTimezone,
          label: 'You',
          workingHours: settings.defaultWorkingHours,
        };
        setParticipants([meParticipant]);
      } finally {
        setIsLoading(false);
      }
    }
    loadParticipants();
  }, [settings.myTimezone, settings.defaultWorkingHours]);

  // Save participants when they change
  useEffect(() => {
    if (!isLoading && participants.length > 0) {
      saveMeetingParticipants(participants).catch(console.error);
    }
  }, [participants, isLoading]);

  // Calculate overlap
  const overlap = useMemo<MultiZoneOverlapResult>(() => {
    return findMultiZoneOverlap(participants);
  }, [participants]);

  // Add participant
  const handleAddParticipant = useCallback((participant: MeetingParticipant) => {
    setParticipants(prev => [...prev, participant]);
  }, []);

  // Remove participant
  const handleRemoveParticipant = useCallback((id: string) => {
    setParticipants(prev => prev.filter(p => p.id !== id));
  }, []);

  // Update working hours
  const handleUpdateWorkingHours = useCallback(
    (id: string, hours: {start: number; end: number}) => {
      setParticipants(prev =>
        prev.map(p => (p.id === id ? {...p, workingHours: hours} : p)),
      );
    },
    [],
  );

  // Share meeting time
  const handleShare = useCallback(async () => {
    if (!overlap.hasOverlap) {
      Alert.alert('No Overlap', 'There is no common meeting time to share.');
      return;
    }

    const shareText = generateMeetingShareText(overlap);
    try {
      await Share.share({message: shareText});
    } catch (error) {
      console.error('Share error:', error);
    }
  }, [overlap]);

  // Get existing participant IDs for picker filtering
  const existingIds = useMemo(
    () => participants.map(p => p.id),
    [participants],
  );

  const canAddMore = participants.length < MAX_PARTICIPANTS;

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Participants Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Participants</Text>
          {canAddMore && (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowPicker(true)}
              hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
              <Text style={styles.addButtonText}>+ Add</Text>
            </TouchableOpacity>
          )}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.participantsScroll}>
          {participants.map(participant => (
            <ParticipantChip
              key={participant.id}
              participant={participant}
              onRemove={handleRemoveParticipant}
              onUpdateWorkingHours={handleUpdateWorkingHours}
              isRemovable={participant.type !== 'me'}
            />
          ))}

          {/* Add button inline when few participants */}
          {canAddMore && participants.length < 3 && (
            <TouchableOpacity
              style={styles.addChip}
              onPress={() => setShowPicker(true)}>
              <Text style={styles.addChipText}>+</Text>
              <Text style={styles.addChipLabel}>Add</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>

      {/* Timeline Section */}
      {participants.length >= 2 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Timeline</Text>
          <TimelineView
            participants={participants}
            overlap={overlap}
            referenceDate={new Date()}
          />
        </View>
      )}

      {/* Results Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Best Time</Text>
        <View style={styles.resultCard}>
          {participants.length < 2 ? (
            <View style={styles.emptyResult}>
              <Text style={styles.emptyResultText}>
                Add at least 2 participants to find common time
              </Text>
            </View>
          ) : overlap.hasOverlap ? (
            <>
              <View style={styles.overlapHeader}>
                <Text style={styles.overlapHours}>
                  {overlap.overlapHours} hour{overlap.overlapHours !== 1 ? 's' : ''} overlap
                </Text>
              </View>

              <View style={styles.timesContainer}>
                {overlap.participantTimes.map(pt => (
                  <View key={pt.participantId} style={styles.timeRow}>
                    <Text style={styles.timeLabel} numberOfLines={1}>
                      {pt.label}
                    </Text>
                    <Text
                      style={[
                        styles.timeValue,
                        pt.isLateHours && styles.timeValueLate,
                      ]}>
                      {pt.startTime} – {pt.endTime}
                    </Text>
                    {pt.isLateHours && (
                      <Text style={styles.lateIndicator}>🌙</Text>
                    )}
                  </View>
                ))}
              </View>

              {/* Share Button */}
              <TouchableOpacity
                style={styles.shareButton}
                onPress={handleShare}
                activeOpacity={0.7}>
                <Text style={styles.shareButtonText}>Share Meeting Time</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.noOverlap}>
              <Text style={styles.noOverlapIcon}>😔</Text>
              <Text style={styles.noOverlapText}>No common working hours</Text>
              <Text style={styles.noOverlapHint}>
                Try adjusting working hours for participants
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Participant Picker Modal */}
      <ParticipantPicker
        visible={showPicker}
        contacts={contacts as PersonDisplay[]}
        existingParticipantIds={existingIds}
        defaultWorkingHours={settings.defaultWorkingHours}
        onSelect={handleAddParticipant}
        onClose={() => setShowPicker(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#86868b',
  },
  section: {
    gap: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#86868b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  addButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  participantsScroll: {
    paddingVertical: 4,
  },
  addChip: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f7',
    borderRadius: 12,
    padding: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#e5e5e7',
    borderStyle: 'dashed',
    minWidth: 70,
  },
  addChipText: {
    fontSize: 20,
    color: '#007AFF',
    fontWeight: '300',
  },
  addChipLabel: {
    fontSize: 11,
    color: '#86868b',
    marginTop: 2,
  },
  resultCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyResult: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyResultText: {
    fontSize: 15,
    color: '#86868b',
    textAlign: 'center',
  },
  overlapHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  overlapHours: {
    fontSize: 18,
    fontWeight: '600',
    color: '#34C759',
  },
  timesContainer: {
    gap: 8,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f5f5f7',
    borderRadius: 8,
  },
  timeLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#1d1d1f',
  },
  timeValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    fontVariant: ['tabular-nums'],
  },
  timeValueLate: {
    color: '#FF9500',
  },
  lateIndicator: {
    fontSize: 14,
    marginLeft: 6,
  },
  shareButton: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  noOverlap: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  noOverlapIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  noOverlapText: {
    fontSize: 17,
    fontWeight: '500',
    color: '#FF3B30',
  },
  noOverlapHint: {
    fontSize: 14,
    color: '#86868b',
    marginTop: 4,
    textAlign: 'center',
  },
});
