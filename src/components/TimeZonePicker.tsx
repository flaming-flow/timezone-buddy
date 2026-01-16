import React, {useState, useMemo, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {TimeZoneEntry} from '../types';
import {searchTimeZones, getOffsetString} from '../domain/timeZoneService';

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

  // Use Set for O(1) lookup
  const excludeZonesSet = useMemo(() => new Set(excludeZones), [excludeZones]);

  // Filter timezones
  const filteredZones = useMemo(() => {
    const results = searchTimeZones(searchQuery);
    return results.filter(tz => !excludeZonesSet.has(tz.ianaName));
  }, [searchQuery, excludeZonesSet]);

  const handleSelectTimezone = useCallback(
    (item: TimeZoneEntry) => {
      onSelect(item.ianaName);
      setSearchQuery('');
      onClose();
    },
    [onSelect, onClose],
  );

  const handleClose = () => {
    setSearchQuery('');
    onClose();
  };

  const renderZoneItem = ({item}: {item: TimeZoneEntry}) => {
    const offset = getOffsetString(item.ianaName);
    return (
      <TouchableOpacity
        style={styles.item}
        onPress={() => handleSelectTimezone(item)}>
        <View style={[styles.avatar, styles.avatarTimezone]}>
          <Text style={styles.avatarTextTimezone}>🌍</Text>
        </View>
        <View style={styles.itemContent}>
          <Text style={styles.itemTitle}>{item.label}</Text>
          <Text style={styles.itemSubtitle}>{item.ianaName}</Text>
        </View>
        <Text style={styles.itemOffset}>{offset}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <KeyboardAvoidingView
          style={styles.keyboard}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={handleClose}
              style={styles.headerButton}
              hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle} numberOfLines={1}>Add Time Zone</Text>
            <View style={[styles.headerButton, styles.headerButtonRight]} />
          </View>

          {/* Search */}
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search contacts or cities..."
              placeholderTextColor="#86868b"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
              clearButtonMode="while-editing"
              returnKeyType="search"
            />
          </View>

          {/* List */}
          <FlatList
            data={filteredZones}
            keyExtractor={item => item.id}
            renderItem={renderZoneItem}
            initialNumToRender={15}
            keyboardShouldPersistTaps="handled"
            style={styles.list}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No time zones found</Text>
              </View>
            }
          />
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f7',
  },
  keyboard: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e5e7',
  },
  headerButton: {
    minWidth: 60,
  },
  headerButtonRight: {
    alignItems: 'flex-end',
  },
  cancelText: {
    fontSize: 17,
    color: '#007AFF',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '600',
    color: '#1d1d1f',
  },
  searchContainer: {
    padding: 12,
    backgroundColor: '#f5f5f7',
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e5e5e7',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 20,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#f0f0f0',
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
  avatarTimezone: {
    backgroundColor: '#f0f0f0',
  },
  avatarTextTimezone: {
    fontSize: 18,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1d1d1f',
  },
  itemSubtitle: {
    fontSize: 13,
    color: '#86868b',
    marginTop: 2,
  },
  itemOffset: {
    fontSize: 14,
    fontWeight: '500',
    color: '#007AFF',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#86868b',
  },
});
