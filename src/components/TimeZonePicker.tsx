import React, {useState, useCallback, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import {TimeZoneEntry} from '../types';
import {searchTimeZones, getOffsetString} from '../domain/timeZoneService';
import {useResponsiveLayout, useComponentSizes} from '../hooks/useResponsiveLayout';

interface TimeZonePickerProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (ianaName: string) => void;
  excludeZones?: string[];
}

export function TimeZonePicker({
  visible,
  onClose,
  onSelect,
  excludeZones = [],
}: TimeZonePickerProps): React.ReactElement {
  const [searchQuery, setSearchQuery] = useState('');
  const layout = useResponsiveLayout();
  const sizes = useComponentSizes();

  // Use Set for O(1) lookup instead of O(n) array.includes()
  const excludeZonesSet = useMemo(() => new Set(excludeZones), [excludeZones]);

  const filteredZones = useMemo(() => {
    const results = searchTimeZones(searchQuery);
    return results.filter(tz => !excludeZonesSet.has(tz.ianaName));
  }, [searchQuery, excludeZonesSet]);

  const handleSelect = useCallback(
    (zone: TimeZoneEntry) => {
      onSelect(zone.ianaName);
      setSearchQuery('');
      onClose();
    },
    [onSelect, onClose],
  );

  const handleClose = useCallback(() => {
    setSearchQuery('');
    onClose();
  }, [onClose]);

  const renderItem = useCallback(
    ({item}: {item: TimeZoneEntry}) => {
      const offset = getOffsetString(item.ianaName);
      return (
        <TouchableOpacity
          style={[
            styles.itemContainer,
            {
              minHeight: sizes.listItemHeight,
              paddingHorizontal: layout.spacing.medium,
              paddingVertical: layout.spacing.small,
            },
          ]}
          onPress={() => handleSelect(item)}
          accessibilityLabel={`Select ${item.label}`}
          accessibilityRole="button">
          <View style={styles.itemContent}>
            <Text style={[styles.itemLabel, {fontSize: sizes.fontSize.medium}]}>
              {item.label}
            </Text>
            <Text style={[styles.itemIana, {fontSize: sizes.fontSize.small}]}>
              {item.ianaName}
            </Text>
          </View>
          <Text style={[styles.itemOffset, {fontSize: sizes.fontSize.small}]}>
            {offset}
          </Text>
        </TouchableOpacity>
      );
    },
    [handleSelect, layout, sizes],
  );

  const keyExtractor = useCallback((item: TimeZoneEntry) => item.id, []);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.keyboardAvoid}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          {/* Header - OUTSIDE container to span full modal width */}
          <View
            style={[
              styles.header,
              {
                paddingHorizontal: layout.spacing.medium,
                paddingVertical: layout.spacing.medium,
              },
            ]}>
            <View style={styles.headerSide}>
              <TouchableOpacity
                onPress={handleClose}
                accessibilityLabel="Cancel"
                accessibilityRole="button">
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
            <Text style={[styles.title, {fontSize: sizes.fontSize.large}]} numberOfLines={1}>
              Add Time Zone
            </Text>
            <View style={[styles.headerSide, styles.headerSideRight]} />
          </View>

          {/* Content with maxWidth constraint */}
          <View
            style={[
              styles.container,
              {
                maxWidth: layout.contentMaxWidth,
                alignSelf: 'center',
                width: '100%',
              },
            ]}>
            {/* Search */}
            <View
              style={[
                styles.searchContainer,
                {
                  marginHorizontal: layout.spacing.medium,
                  marginBottom: layout.spacing.medium,
                },
              ]}>
              <TextInput
                style={[
                  styles.searchInput,
                  {
                    height: sizes.inputHeight,
                    fontSize: sizes.fontSize.medium,
                    paddingHorizontal: layout.spacing.medium,
                  },
                ]}
                placeholder="Search cities or time zones..."
                placeholderTextColor="#999"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCapitalize="none"
                autoCorrect={false}
                clearButtonMode="while-editing"
                returnKeyType="search"
                autoFocus={true}
              />
            </View>

            {/* Results */}
            <FlatList
              data={filteredZones}
              renderItem={renderItem}
              keyExtractor={keyExtractor}
              style={styles.list}
              contentContainerStyle={{
                paddingHorizontal: layout.spacing.medium,
                paddingBottom: layout.spacing.large,
              }}
              keyboardShouldPersistTaps="handled"
              initialNumToRender={10}
              maxToRenderPerBatch={10}
              windowSize={5}
              removeClippedSubviews={true}
              getItemLayout={(_, index) => ({
                length: sizes.listItemHeight + 8,
                offset: (sizes.listItemHeight + 8) * index,
                index,
              })}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No time zones found</Text>
                </View>
              }
            />
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  keyboardAvoid: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ddd',
    backgroundColor: '#fff',
  },
  headerSide: {
    width: 70,
  },
  headerSideRight: {
    alignItems: 'flex-end',
  },
  cancelText: {
    fontSize: 16,
    color: '#007AFF',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontWeight: '600',
    color: '#1a1a1a',
  },
  searchContainer: {
    marginTop: 16,
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  list: {
    flex: 1,
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 8,
  },
  itemContent: {
    flex: 1,
  },
  itemLabel: {
    fontWeight: '500',
    color: '#1a1a1a',
  },
  itemIana: {
    color: '#666',
    marginTop: 2,
  },
  itemOffset: {
    color: '#007AFF',
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});
