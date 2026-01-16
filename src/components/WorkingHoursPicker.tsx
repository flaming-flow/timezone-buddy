import React, {useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';

interface WorkingHoursPickerProps {
  visible: boolean;
  title: string;
  hour: number;
  minute: number;
  onHourChange: (hour: number) => void;
  onMinuteChange: (minute: number) => void;
  onClose: () => void;
}

/**
 * Reusable time picker modal for selecting working hours
 * Apple-style wheel picker appearance
 */
export function WorkingHoursPicker({
  visible,
  title,
  hour,
  minute,
  onHourChange,
  onMinuteChange,
  onClose,
}: WorkingHoursPickerProps): React.ReactElement {
  const hours = useMemo(() => Array.from({length: 24}, (_, i) => i), []);
  const minutes = useMemo(() => Array.from({length: 12}, (_, i) => i * 5), []);

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}>
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}>
        <View style={styles.content} onStartShouldSetResponder={() => true}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
              <Text style={styles.doneText}>Done</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.pickerColumns}>
            <View style={styles.column}>
              <Text style={styles.columnLabel}>Hour</Text>
              <ScrollView
                style={styles.scrollList}
                showsVerticalScrollIndicator={false}>
                {hours.map(h => (
                  <TouchableOpacity
                    key={h}
                    style={[styles.item, hour === h && styles.itemSelected]}
                    onPress={() => onHourChange(h)}>
                    <Text
                      style={[
                        styles.itemText,
                        hour === h && styles.itemTextSelected,
                      ]}>
                      {h.toString().padStart(2, '0')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <Text style={styles.separator}>:</Text>

            <View style={styles.column}>
              <Text style={styles.columnLabel}>Min</Text>
              <ScrollView
                style={styles.scrollList}
                showsVerticalScrollIndicator={false}>
                {minutes.map(m => (
                  <TouchableOpacity
                    key={m}
                    style={[styles.item, minute === m && styles.itemSelected]}
                    onPress={() => onMinuteChange(m)}>
                    <Text
                      style={[
                        styles.itemText,
                        minute === m && styles.itemTextSelected,
                      ]}>
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
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    backgroundColor: '#fff',
    borderRadius: 14,
    width: 280,
    maxWidth: '85%',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e5e7',
  },
  cancelText: {
    fontSize: 17,
    color: '#007AFF',
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1d1d1f',
  },
  doneText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#007AFF',
  },
  pickerColumns: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  column: {
    width: 70,
  },
  columnLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#86868b',
    textAlign: 'center',
    marginBottom: 8,
    marginTop: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  separator: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1d1d1f',
    marginTop: 44,
    marginHorizontal: 8,
  },
  scrollList: {
    maxHeight: 180,
  },
  item: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 2,
  },
  itemSelected: {
    backgroundColor: '#007AFF',
  },
  itemText: {
    fontSize: 18,
    textAlign: 'center',
    color: '#1d1d1f',
    fontWeight: '500',
    fontVariant: ['tabular-nums'],
  },
  itemTextSelected: {
    color: '#fff',
  },
});
