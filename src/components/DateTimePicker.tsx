import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Modal,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import {useResponsiveLayout} from '../hooks/useResponsiveLayout';

interface DateTimePickerComponentProps {
  date: Date;
  onDateChange: (date: Date) => void;
  onNowPress: () => void;
  timeZone?: string;
}

export function DateTimePickerComponent({
  date,
  onDateChange,
  onNowPress,
  timeZone,
}: DateTimePickerComponentProps): React.ReactElement {
  const layout = useResponsiveLayout();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [tempDate, setTempDate] = useState(date);

  const handleDateChange = (_event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
      if (selectedDate) {
        onDateChange(selectedDate);
      }
    } else {
      if (selectedDate) {
        setTempDate(selectedDate);
      }
    }
  };

  const handleTimeChange = (_event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
      if (selectedDate) {
        onDateChange(selectedDate);
      }
    } else {
      if (selectedDate) {
        setTempDate(selectedDate);
      }
    }
  };

  const confirmDateSelection = () => {
    onDateChange(tempDate);
    setShowDatePicker(false);
  };

  const confirmTimeSelection = () => {
    onDateChange(tempDate);
    setShowTimePicker(false);
  };

  const openDatePicker = () => {
    setTempDate(date);
    setShowDatePicker(true);
  };

  const openTimePicker = () => {
    setTempDate(date);
    setShowTimePicker(true);
  };

  const formatDisplayDate = (d: Date): string => {
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: timeZone,
    });
  };

  const formatDisplayTime = (d: Date): string => {
    return d.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: timeZone,
    });
  };

  const isWide = layout.isWideScreen;
  const isIOS = Platform.OS === 'ios';

  return (
    <View style={styles.container}>
      <View style={[styles.row, isWide && styles.rowWide]}>
        {/* Date Picker */}
        <View style={[styles.pickerSection, isWide && styles.pickerSectionWide]}>
          <Text style={styles.label}>Date</Text>
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={openDatePicker}
            activeOpacity={0.7}>
            <Text style={styles.pickerText} numberOfLines={1}>{formatDisplayDate(date)}</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Time Picker */}
        <View style={[styles.pickerSection, isWide && styles.pickerSectionWide]}>
          <Text style={styles.label}>Time</Text>
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={openTimePicker}
            activeOpacity={0.7}>
            <Text style={styles.pickerText} numberOfLines={1}>{formatDisplayTime(date)}</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Now Button - subtle link style */}
      <TouchableOpacity
        style={styles.nowButton}
        onPress={onNowPress}
        activeOpacity={0.7}
        accessibilityLabel="Set to current time"
        accessibilityRole="button">
        <Text style={styles.nowButtonText}>Set to current time</Text>
      </TouchableOpacity>

      {/* Date Picker Modal for iOS */}
      {isIOS && showDatePicker && (
        <Modal
          transparent
          animationType="fade"
          visible={showDatePicker}
          onRequestClose={() => setShowDatePicker(false)}>
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowDatePicker(false)}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Text style={styles.modalCancel}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Select Date</Text>
                <TouchableOpacity onPress={confirmDateSelection}>
                  <Text style={styles.modalDone}>Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={tempDate}
                mode="date"
                display="spinner"
                onChange={handleDateChange}
                themeVariant="light"
                style={styles.picker}
              />
            </View>
          </TouchableOpacity>
        </Modal>
      )}

      {/* Time Picker Modal for iOS */}
      {isIOS && showTimePicker && (
        <Modal
          transparent
          animationType="fade"
          visible={showTimePicker}
          onRequestClose={() => setShowTimePicker(false)}>
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowTimePicker(false)}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                  <Text style={styles.modalCancel}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Select Time</Text>
                <TouchableOpacity onPress={confirmTimeSelection}>
                  <Text style={styles.modalDone}>Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={tempDate}
                mode="time"
                display="spinner"
                onChange={handleTimeChange}
                themeVariant="light"
                style={styles.picker}
              />
            </View>
          </TouchableOpacity>
        </Modal>
      )}

      {/* Android Pickers */}
      {!isIOS && showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}
      {!isIOS && showTimePicker && (
        <DateTimePicker
          value={date}
          mode="time"
          display="default"
          onChange={handleTimeChange}
        />
      )}
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
    flex: 0,
    minWidth: 160,
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
    minWidth: 120,
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
  nowButton: {
    alignSelf: 'flex-start',
    marginTop: 12,
    paddingVertical: 4,
  },
  nowButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
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
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e5e7',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1d1d1f',
  },
  modalCancel: {
    fontSize: 17,
    color: '#007AFF',
  },
  modalDone: {
    fontSize: 17,
    fontWeight: '600',
    color: '#007AFF',
  },
  picker: {
    height: 200,
  },
});
