import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  SafeAreaView,
} from 'react-native';
import {useResponsiveLayout, useComponentSizes} from '../hooks/useResponsiveLayout';
import {getLabelForZone, getOffsetString} from '../domain/timeZoneService';

interface BaseTimeZoneSelectorProps {
  selectedZone: string;
  availableZones: string[];
  onSelect: (zone: string) => void;
}

export function BaseTimeZoneSelector({
  selectedZone,
  availableZones,
  onSelect,
}: BaseTimeZoneSelectorProps): React.ReactElement {
  const [showPicker, setShowPicker] = useState(false);
  const layout = useResponsiveLayout();
  const sizes = useComponentSizes();

  const handleSelect = useCallback(
    (zone: string) => {
      onSelect(zone);
      setShowPicker(false);
    },
    [onSelect],
  );

  const selectedLabel = getLabelForZone(selectedZone);
  const selectedOffset = getOffsetString(selectedZone);

  const renderItem = useCallback(
    ({item}: {item: string}) => {
      const label = getLabelForZone(item);
      const offset = getOffsetString(item);
      const isSelected = item === selectedZone;

      return (
        <TouchableOpacity
          style={[
            styles.optionItem,
            isSelected && styles.optionItemSelected,
            {
              minHeight: sizes.listItemHeight,
              paddingHorizontal: layout.spacing.medium,
              paddingVertical: layout.spacing.small,
            },
          ]}
          onPress={() => handleSelect(item)}
          accessibilityLabel={`Select ${label} as base time zone`}
          accessibilityRole="button"
          accessibilityState={{selected: isSelected}}>
          <View style={styles.optionContent}>
            <Text
              style={[
                styles.optionLabel,
                {fontSize: sizes.fontSize.medium},
                isSelected && styles.optionLabelSelected,
              ]}>
              {label}
            </Text>
            <Text
              style={[
                styles.optionOffset,
                {fontSize: sizes.fontSize.small},
                isSelected && styles.optionOffsetSelected,
              ]}>
              {offset}
            </Text>
          </View>
          {isSelected && <Text style={styles.checkmark}>✓</Text>}
        </TouchableOpacity>
      );
    },
    [handleSelect, layout, sizes, selectedZone],
  );

  return (
    <View>
      <TouchableOpacity
        style={[
          styles.selector,
          {
            paddingHorizontal: layout.spacing.medium,
            paddingVertical: 14,
          },
        ]}
        onPress={() => setShowPicker(true)}
        accessibilityLabel={`Base time zone: ${selectedLabel}`}
        accessibilityHint="Tap to change base time zone"
        accessibilityRole="button">
        <View>
          <Text style={[styles.selectorLabel, {fontSize: sizes.fontSize.small}]}>
            Base Time Zone
          </Text>
          <Text style={[styles.selectorValue, {fontSize: sizes.fontSize.medium}]}>
            {selectedLabel} ({selectedOffset})
          </Text>
        </View>
        <Text style={styles.chevron}>›</Text>
      </TouchableOpacity>

      <Modal
        visible={showPicker}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowPicker(false)}>
        <SafeAreaView style={styles.modalSafeArea}>
          <View
            style={[
              styles.modalContainer,
              {
                maxWidth: layout.contentMaxWidth,
                alignSelf: 'center',
                width: '100%',
              },
            ]}>
            {/* Header */}
            <View
              style={[
                styles.modalHeader,
                {
                  paddingHorizontal: layout.spacing.medium,
                  paddingVertical: layout.spacing.medium,
                },
              ]}>
              <TouchableOpacity
                onPress={() => setShowPicker(false)}
                accessibilityLabel="Cancel"
                accessibilityRole="button">
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <Text style={[styles.modalTitle, {fontSize: sizes.fontSize.large}]}>
                Select Base Zone
              </Text>
              <View style={styles.placeholder} />
            </View>

            {/* Options */}
            <FlatList
              data={availableZones}
              renderItem={renderItem}
              keyExtractor={item => item}
              contentContainerStyle={{
                paddingHorizontal: layout.spacing.medium,
                paddingBottom: layout.spacing.large,
              }}
            />
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  selector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  selectorLabel: {
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '500',
  },
  selectorValue: {
    fontWeight: '600',
    color: '#1a1a1a',
    marginTop: 2,
  },
  chevron: {
    fontSize: 24,
    color: '#999',
  },
  modalSafeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ddd',
    backgroundColor: '#fff',
  },
  cancelText: {
    fontSize: 16,
    color: '#007AFF',
  },
  modalTitle: {
    fontWeight: '600',
    color: '#1a1a1a',
  },
  placeholder: {
    width: 60,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 8,
    marginTop: 8,
  },
  optionItemSelected: {
    backgroundColor: '#f0f9ff',
    borderWidth: 2,
    borderColor: '#0ea5e9',
  },
  optionContent: {
    flex: 1,
  },
  optionLabel: {
    fontWeight: '500',
    color: '#1a1a1a',
  },
  optionLabelSelected: {
    color: '#0369a1',
    fontWeight: '600',
  },
  optionOffset: {
    color: '#666',
    marginTop: 2,
  },
  optionOffsetSelected: {
    color: '#0ea5e9',
  },
  checkmark: {
    fontSize: 20,
    color: '#0ea5e9',
    fontWeight: 'bold',
  },
});
