import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {MeetingPlanner} from '../components/MeetingPlanner';
import {TimeZonePicker} from '../components/TimeZonePicker';
import {WorkingHoursPicker} from '../components/WorkingHoursPicker';
import {useConverter} from '../hooks/useConverter';
import {useSettings} from '../hooks/useSettings';
import {useResponsiveLayout, useComponentSizes} from '../hooks/useResponsiveLayout';
import {getLabelForZone} from '../domain/timeZoneService';

export function MeetingPlannerScreen(): React.ReactElement {
  const {savedZones, isLoading} = useConverter();
  const {settings, updateMyTimezone, updateWorkingHours} = useSettings();
  const layout = useResponsiveLayout();
  const sizes = useComponentSizes();

  const [showSettings, setShowSettings] = useState(false);
  const [showTimezonePicker, setShowTimezonePicker] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const startHour = Math.floor(settings.defaultWorkingHours.start);
  const startMinute = Math.round((settings.defaultWorkingHours.start % 1) * 60);
  const endHour = Math.floor(settings.defaultWorkingHours.end);
  const endMinute = Math.round((settings.defaultWorkingHours.end % 1) * 60);

  const formatTime = (hour: number, minute: number) =>
    `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            maxWidth: layout.contentMaxWidth,
            alignSelf: 'center',
            width: '100%',
          },
        ]}
        showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View
          style={[
            styles.header,
            {
              paddingHorizontal: layout.spacing.medium,
              paddingVertical: layout.spacing.medium,
            },
          ]}>
          <Text style={[styles.title, {fontSize: sizes.fontSize.title}]}>
            Meeting Planner
          </Text>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => setShowSettings(true)}
            hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
            <Text style={styles.settingsIcon}>⚙️</Text>
          </TouchableOpacity>
        </View>

        {/* Meeting Planner */}
        <View style={{paddingHorizontal: layout.spacing.medium}}>
          {savedZones.length >= 1 ? (
            <MeetingPlanner savedZones={savedZones} />
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyTitle, {fontSize: sizes.fontSize.large}]}>
                No Time Zones
              </Text>
              <Text style={[styles.emptyText, {fontSize: sizes.fontSize.medium}]}>
                Add time zones in the World Clock tab to use Meeting Planner
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Settings Modal */}
      <Modal
        visible={showSettings}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowSettings(false)}>
        <SafeAreaView style={styles.modalSafeArea} edges={['top']}>
          <View style={styles.modalHeader}>
            <View style={styles.modalHeaderButton} />
            <Text style={styles.modalTitle} numberOfLines={1}>Settings</Text>
            <TouchableOpacity
              onPress={() => setShowSettings(false)}
              style={[styles.modalHeaderButton, styles.modalHeaderButtonRight]}
              hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
              <Text style={styles.modalDone}>Done</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* My Timezone Section */}
            <View style={styles.settingsSection}>
              <Text style={styles.settingsSectionTitle}>My Timezone</Text>
              <TouchableOpacity
                style={styles.settingsRow}
                onPress={() => setShowTimezonePicker(true)}>
                <View style={styles.settingsRowContent}>
                  <Text style={styles.settingsLabel}>Home Timezone</Text>
                  <Text style={styles.settingsValue}>
                    {getLabelForZone(settings.myTimezone)}
                  </Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>
            </View>

            {/* Default Working Hours Section */}
            <View style={styles.settingsSection}>
              <Text style={styles.settingsSectionTitle}>Default Working Hours</Text>
              <TouchableOpacity
                style={styles.settingsRow}
                onPress={() => setShowStartPicker(true)}>
                <View style={styles.settingsRowContent}>
                  <Text style={styles.settingsLabel}>Work Starts</Text>
                  <Text style={styles.settingsValue}>
                    {formatTime(startHour, startMinute)}
                  </Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.settingsRow}
                onPress={() => setShowEndPicker(true)}>
                <View style={styles.settingsRowContent}>
                  <Text style={styles.settingsLabel}>Work Ends</Text>
                  <Text style={styles.settingsValue}>
                    {formatTime(endHour, endMinute)}
                  </Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>
            </View>

            {/* Info */}
            <View style={styles.settingsInfo}>
              <Text style={styles.settingsInfoText}>
                These settings are used as defaults when adding yourself as a
                meeting participant.
              </Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Timezone Picker */}
      <TimeZonePicker
        visible={showTimezonePicker}
        onSelect={(tz) => {
          updateMyTimezone(tz);
          setShowTimezonePicker(false);
        }}
        onClose={() => setShowTimezonePicker(false)}
      />

      {/* Working Hours Pickers */}
      <WorkingHoursPicker
        visible={showStartPicker}
        title="Work Starts"
        hour={startHour}
        minute={startMinute}
        onHourChange={(h) =>
          updateWorkingHours({
            start: h + startMinute / 60,
            end: settings.defaultWorkingHours.end,
          })
        }
        onMinuteChange={(m) =>
          updateWorkingHours({
            start: startHour + m / 60,
            end: settings.defaultWorkingHours.end,
          })
        }
        onClose={() => setShowStartPicker(false)}
      />

      <WorkingHoursPicker
        visible={showEndPicker}
        title="Work Ends"
        hour={endHour}
        minute={endMinute}
        onHourChange={(h) =>
          updateWorkingHours({
            start: settings.defaultWorkingHours.start,
            end: h + endMinute / 60,
          })
        }
        onMinuteChange={(m) =>
          updateWorkingHours({
            start: settings.defaultWorkingHours.start,
            end: endHour + m / 60,
          })
        }
        onClose={() => setShowEndPicker(false)}
      />

      </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontWeight: '700',
    color: '#1a1a1a',
  },
  settingsButton: {
    padding: 4,
  },
  settingsIcon: {
    fontSize: 24,
  },
  emptyContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
  },
  emptyTitle: {
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  emptyText: {
    color: '#666',
    textAlign: 'center',
  },
  // Settings Modal
  modalSafeArea: {
    flex: 1,
    backgroundColor: '#f5f5f7',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e5e7',
  },
  modalHeaderButton: {
    minWidth: 60,
  },
  modalHeaderButtonRight: {
    alignItems: 'flex-end',
  },
  modalTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '600',
    color: '#1d1d1f',
  },
  modalDone: {
    fontSize: 17,
    fontWeight: '600',
    color: '#007AFF',
  },
  modalContent: {
    flex: 1,
  },
  settingsSection: {
    marginTop: 24,
  },
  settingsSectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#86868b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e5e7',
  },
  settingsRowContent: {
    flex: 1,
  },
  settingsLabel: {
    fontSize: 16,
    color: '#1d1d1f',
  },
  settingsValue: {
    fontSize: 15,
    color: '#86868b',
    marginTop: 2,
  },
  chevron: {
    fontSize: 20,
    color: '#c7c7cc',
    marginLeft: 8,
  },
  settingsInfo: {
    padding: 20,
  },
  settingsInfoText: {
    fontSize: 13,
    color: '#86868b',
    lineHeight: 18,
  },
});
