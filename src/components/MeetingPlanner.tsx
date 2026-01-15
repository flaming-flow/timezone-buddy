import React, {useState, useMemo, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  SafeAreaView,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import {
  findOverlappingHours,
  formatHour,
  getLabelForZone,
  searchTimeZones,
  getOffsetString,
} from '../domain/timeZoneService';
import {useResponsiveLayout} from '../hooks/useResponsiveLayout';
import {TimeZoneEntry} from '../types';

interface MeetingPlannerProps {
  savedZones: string[];
}

export function MeetingPlanner({savedZones}: MeetingPlannerProps): React.ReactElement {
  const [myZone, setMyZone] = useState<string>(savedZones[0] || 'UTC');
  const [theirZone, setTheirZone] = useState<string>(savedZones[1] || savedZones[0] || 'UTC');
  const [workStartHour, setWorkStartHour] = useState(9);
  const [workStartMinute, setWorkStartMinute] = useState(0);
  const [workEndHour, setWorkEndHour] = useState(18);
  const [workEndMinute, setWorkEndMinute] = useState(0);
  const [showMyZonePicker, setShowMyZonePicker] = useState(false);
  const [showTheirZonePicker, setShowTheirZonePicker] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const layout = useResponsiveLayout();

  const workStart = workStartHour + workStartMinute / 60;
  const workEnd = workEndHour + workEndMinute / 60;

  const overlap = useMemo(() => {
    return findOverlappingHours(myZone, theirZone, workStart, workEnd);
  }, [myZone, theirZone, workStart, workEnd]);

  const filteredZones = useMemo(() => {
    return searchTimeZones(searchQuery);
  }, [searchQuery]);

  const hours = useMemo(() => Array.from({length: 24}, (_, i) => i), []);
  const minutes = useMemo(() => Array.from({length: 12}, (_, i) => i * 5), []); // 0, 5, 10, ..., 55

  const renderZoneItem = useCallback(
    (item: TimeZoneEntry, onSelect: (zone: string) => void, onClose: () => void) => {
      const offset = getOffsetString(item.ianaName);
      return (
        <TouchableOpacity
          key={item.id}
          style={styles.zoneItem}
          onPress={() => {
            onSelect(item.ianaName);
            setSearchQuery('');
            onClose();
          }}>
          <View style={styles.zoneItemContent}>
            <Text style={styles.zoneItemLabel}>{item.label}</Text>
            <Text style={styles.zoneItemIana}>{item.ianaName}</Text>
          </View>
          <Text style={styles.zoneItemOffset}>{offset}</Text>
        </TouchableOpacity>
      );
    },
    [],
  );

  return (
    <View style={styles.container}>
      {/* Zone Selectors */}
      <View style={[styles.row, layout.isWideScreen && styles.rowWide]}>
        <View style={[styles.pickerSection, layout.isWideScreen && styles.pickerSectionWide]}>
          <Text style={styles.label}>My Timezone</Text>
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => setShowMyZonePicker(true)}
            activeOpacity={0.7}>
            <Text style={styles.pickerText} numberOfLines={1}>{getLabelForZone(myZone)}</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.swapButton}
          onPress={() => {
            setMyZone(theirZone);
            setTheirZone(myZone);
          }}
          activeOpacity={0.7}>
          <Text style={styles.swapButtonText}>⇄</Text>
        </TouchableOpacity>

        <View style={[styles.pickerSection, layout.isWideScreen && styles.pickerSectionWide]}>
          <Text style={styles.label}>Their Timezone</Text>
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => setShowTheirZonePicker(true)}
            activeOpacity={0.7}>
            <Text style={styles.pickerText} numberOfLines={1}>{getLabelForZone(theirZone)}</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Working Hours */}
      <View style={[styles.row, layout.isWideScreen && styles.rowWide, {marginTop: layout.spacing.medium}]}>
        <View style={[styles.pickerSection, layout.isWideScreen && styles.pickerSectionWide]}>
          <Text style={styles.label}>Work Starts</Text>
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => setShowStartPicker(true)}
            activeOpacity={0.7}>
            <Text style={styles.pickerText}>
              {workStartHour.toString().padStart(2, '0')}:{workStartMinute.toString().padStart(2, '0')}
            </Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.pickerSection, layout.isWideScreen && styles.pickerSectionWide]}>
          <Text style={styles.label}>Work Ends</Text>
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => setShowEndPicker(true)}
            activeOpacity={0.7}>
            <Text style={styles.pickerText}>
              {workEndHour.toString().padStart(2, '0')}:{workEndMinute.toString().padStart(2, '0')}
            </Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Result */}
      <View style={[styles.resultContainer, {marginTop: layout.spacing.large}]}>
        {overlap ? (
          <>
            <Text style={styles.resultTitle}>Common working hours</Text>
            <View style={styles.resultRow}>
              <View style={styles.resultZone}>
                <Text style={styles.resultTime}>
                  {formatHour(overlap.zone1Start)} – {formatHour(overlap.zone1End)}
                </Text>
                <Text style={styles.resultZoneName}>{getLabelForZone(myZone)}</Text>
              </View>
              <View style={styles.resultZone}>
                <Text style={styles.resultTime}>
                  {formatHour(overlap.zone2Start)} – {formatHour(overlap.zone2End)}
                </Text>
                <Text style={styles.resultZoneName}>{getLabelForZone(theirZone)}</Text>
              </View>
            </View>
            <Text style={styles.overlapHours}>
              {overlap.overlapHours} {overlap.overlapHours === 1 ? 'hour' : 'hours'} overlap
            </Text>
          </>
        ) : (
          <View style={styles.noOverlap}>
            <Text style={styles.noOverlapText}>No common working hours</Text>
            <Text style={styles.noOverlapHint}>
              Try adjusting the working hours range
            </Text>
          </View>
        )}
      </View>

      {/* My Zone Picker Modal */}
      <Modal
        visible={showMyZonePicker}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          setShowMyZonePicker(false);
          setSearchQuery('');
        }}>
        <SafeAreaView style={styles.modalSafeArea}>
          <KeyboardAvoidingView
            style={styles.modalKeyboard}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => {
                setShowMyZonePicker(false);
                setSearchQuery('');
              }}>
                <Text style={styles.modalCancel}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>My Timezone</Text>
              <View style={{width: 60}} />
            </View>
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search cities or time zones..."
                placeholderTextColor="#999"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCapitalize="none"
                autoCorrect={false}
                clearButtonMode="while-editing"
                returnKeyType="search"
              />
            </View>
            <FlatList
              data={filteredZones}
              keyExtractor={item => item.id}
              renderItem={({item}) => renderZoneItem(item, setMyZone, () => setShowMyZonePicker(false))}
              initialNumToRender={15}
              keyboardShouldPersistTaps="handled"
              style={styles.zoneList}
            />
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>

      {/* Their Zone Picker Modal */}
      <Modal
        visible={showTheirZonePicker}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          setShowTheirZonePicker(false);
          setSearchQuery('');
        }}>
        <SafeAreaView style={styles.modalSafeArea}>
          <KeyboardAvoidingView
            style={styles.modalKeyboard}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => {
                setShowTheirZonePicker(false);
                setSearchQuery('');
              }}>
                <Text style={styles.modalCancel}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Their Timezone</Text>
              <View style={{width: 60}} />
            </View>
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search cities or time zones..."
                placeholderTextColor="#999"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCapitalize="none"
                autoCorrect={false}
                clearButtonMode="while-editing"
                returnKeyType="search"
              />
            </View>
            <FlatList
              data={filteredZones}
              keyExtractor={item => item.id}
              renderItem={({item}) => renderZoneItem(item, setTheirZone, () => setShowTheirZonePicker(false))}
              initialNumToRender={15}
              keyboardShouldPersistTaps="handled"
              style={styles.zoneList}
            />
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>

      {/* Start Time Picker Modal */}
      <Modal
        transparent
        animationType="fade"
        visible={showStartPicker}
        onRequestClose={() => setShowStartPicker(false)}>
        <TouchableOpacity
          style={styles.timeModalOverlay}
          activeOpacity={1}
          onPress={() => setShowStartPicker(false)}>
          <View style={styles.timeModalContent} onStartShouldSetResponder={() => true}>
            <View style={styles.timeModalHeader}>
              <TouchableOpacity onPress={() => setShowStartPicker(false)}>
                <Text style={styles.modalCancel}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Work Starts</Text>
              <TouchableOpacity onPress={() => setShowStartPicker(false)}>
                <Text style={styles.modalDone}>Done</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.timePickerColumns}>
              <View style={styles.timeColumn}>
                <Text style={styles.timeColumnLabel}>Hour</Text>
                <ScrollView style={styles.timeScrollList} showsVerticalScrollIndicator={false}>
                  {hours.map(h => (
                    <TouchableOpacity
                      key={h}
                      style={[styles.timeItem, workStartHour === h && styles.timeItemSelected]}
                      onPress={() => setWorkStartHour(h)}>
                      <Text style={[styles.timeItemText, workStartHour === h && styles.timeItemTextSelected]}>
                        {h.toString().padStart(2, '0')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              <Text style={styles.timeSeparator}>:</Text>
              <View style={styles.timeColumn}>
                <Text style={styles.timeColumnLabel}>Min</Text>
                <ScrollView style={styles.timeScrollList} showsVerticalScrollIndicator={false}>
                  {minutes.map(m => (
                    <TouchableOpacity
                      key={m}
                      style={[styles.timeItem, workStartMinute === m && styles.timeItemSelected]}
                      onPress={() => setWorkStartMinute(m)}>
                      <Text style={[styles.timeItemText, workStartMinute === m && styles.timeItemTextSelected]}>
                        {m.toString().padStart(2, '0')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* End Time Picker Modal */}
      <Modal
        transparent
        animationType="fade"
        visible={showEndPicker}
        onRequestClose={() => setShowEndPicker(false)}>
        <TouchableOpacity
          style={styles.timeModalOverlay}
          activeOpacity={1}
          onPress={() => setShowEndPicker(false)}>
          <View style={styles.timeModalContent} onStartShouldSetResponder={() => true}>
            <View style={styles.timeModalHeader}>
              <TouchableOpacity onPress={() => setShowEndPicker(false)}>
                <Text style={styles.modalCancel}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Work Ends</Text>
              <TouchableOpacity onPress={() => setShowEndPicker(false)}>
                <Text style={styles.modalDone}>Done</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.timePickerColumns}>
              <View style={styles.timeColumn}>
                <Text style={styles.timeColumnLabel}>Hour</Text>
                <ScrollView style={styles.timeScrollList} showsVerticalScrollIndicator={false}>
                  {hours.map(h => (
                    <TouchableOpacity
                      key={h}
                      style={[styles.timeItem, workEndHour === h && styles.timeItemSelected]}
                      onPress={() => setWorkEndHour(h)}>
                      <Text style={[styles.timeItemText, workEndHour === h && styles.timeItemTextSelected]}>
                        {h.toString().padStart(2, '0')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              <Text style={styles.timeSeparator}>:</Text>
              <View style={styles.timeColumn}>
                <Text style={styles.timeColumnLabel}>Min</Text>
                <ScrollView style={styles.timeScrollList} showsVerticalScrollIndicator={false}>
                  {minutes.map(m => (
                    <TouchableOpacity
                      key={m}
                      style={[styles.timeItem, workEndMinute === m && styles.timeItemSelected]}
                      onPress={() => setWorkEndMinute(m)}>
                      <Text style={[styles.timeItemText, workEndMinute === m && styles.timeItemTextSelected]}>
                        {m.toString().padStart(2, '0')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  row: {
    flexDirection: 'column',
    gap: 12,
  },
  rowWide: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 16,
  },
  pickerSection: {
    gap: 8,
  },
  pickerSectionWide: {
    flex: 1,
  },
  swapButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    marginHorizontal: 4,
  },
  swapButtonText: {
    fontSize: 20,
    color: '#007AFF',
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: '#86868b',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginLeft: 4,
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f7',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#e5e5e7',
  },
  pickerText: {
    flex: 1,
    fontSize: 16,
    color: '#1d1d1f',
    fontWeight: '500',
    letterSpacing: -0.2,
  },
  chevron: {
    fontSize: 18,
    color: '#c7c7cc',
    marginLeft: 8,
  },
  resultContainer: {
    backgroundColor: '#f0f7ff',
    borderRadius: 12,
    padding: 16,
  },
  resultTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    textAlign: 'center',
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  resultZone: {
    alignItems: 'center',
  },
  resultTime: {
    fontSize: 18,
    fontWeight: '600',
    color: '#007AFF',
  },
  resultZoneName: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
  overlapHours: {
    fontSize: 14,
    color: '#34C759',
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 12,
  },
  noOverlap: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  noOverlapText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FF3B30',
  },
  noOverlapHint: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
  // Zone Picker Modal
  modalSafeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  modalKeyboard: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ddd',
  },
  modalCancel: {
    fontSize: 17,
    color: '#007AFF',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1d1d1f',
  },
  modalDone: {
    fontSize: 17,
    fontWeight: '600',
    color: '#007AFF',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  zoneList: {
    flex: 1,
  },
  zoneItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
  zoneItemContent: {
    flex: 1,
  },
  zoneItemLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  zoneItemIana: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  zoneItemOffset: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  // Time Picker Modal
  timeModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeModalContent: {
    backgroundColor: '#fff',
    borderRadius: 14,
    width: 320,
    maxWidth: '90%',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  timeModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e5e7',
  },
  timePickerColumns: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  timeColumn: {
    width: 80,
  },
  timeColumnLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#86868b',
    textAlign: 'center',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  timeSeparator: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1d1d1f',
    marginTop: 36,
    marginHorizontal: 8,
  },
  timeScrollList: {
    maxHeight: 200,
  },
  timeItem: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 4,
  },
  timeItemSelected: {
    backgroundColor: '#007AFF',
  },
  timeItemText: {
    fontSize: 18,
    textAlign: 'center',
    color: '#1d1d1f',
    fontWeight: '500',
  },
  timeItemTextSelected: {
    color: '#fff',
  },
});
