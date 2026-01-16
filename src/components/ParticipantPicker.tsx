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
import {PersonDisplay, MeetingParticipant} from '../types';
import {searchTimeZones, getOffsetString, getLabelForZone} from '../domain/timeZoneService';

interface ParticipantPickerProps {
  visible: boolean;
  contacts: PersonDisplay[];
  existingParticipantIds: string[];
  defaultWorkingHours: {start: number; end: number};
  onSelect: (participant: MeetingParticipant) => void;
  onClose: () => void;
}

/**
 * Modal picker for selecting a contact or timezone as meeting participant
 * Shows contacts first, then all timezones
 */
export function ParticipantPicker({
  visible,
  contacts,
  existingParticipantIds,
  defaultWorkingHours,
  onSelect,
  onClose,
}: ParticipantPickerProps): React.ReactElement {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter contacts not already added
  const availableContacts = useMemo(() => {
    return contacts.filter(
      c => !existingParticipantIds.includes(`contact-${c.id}`),
    );
  }, [contacts, existingParticipantIds]);

  // Filter timezones
  const filteredZones = useMemo(() => {
    return searchTimeZones(searchQuery);
  }, [searchQuery]);

  // Filtered contacts by search
  const filteredContacts = useMemo(() => {
    if (!searchQuery) return availableContacts;
    const query = searchQuery.toLowerCase();
    return availableContacts.filter(
      c =>
        c.name.toLowerCase().includes(query) ||
        c.timezoneLabel.toLowerCase().includes(query),
    );
  }, [availableContacts, searchQuery]);

  const handleSelectContact = useCallback(
    (contact: PersonDisplay) => {
      const participant: MeetingParticipant = {
        id: `contact-${contact.id}`,
        type: 'contact',
        contactId: contact.id,
        timezone: contact.timezone,
        label: contact.name,
        workingHours: defaultWorkingHours,
      };
      onSelect(participant);
      setSearchQuery('');
      onClose();
    },
    [defaultWorkingHours, onSelect, onClose],
  );

  const handleSelectTimezone = useCallback(
    (ianaName: string) => {
      const participant: MeetingParticipant = {
        id: `tz-${ianaName}-${Date.now()}`,
        type: 'timezone',
        timezone: ianaName,
        label: getLabelForZone(ianaName),
        workingHours: defaultWorkingHours,
      };
      onSelect(participant);
      setSearchQuery('');
      onClose();
    },
    [defaultWorkingHours, onSelect, onClose],
  );

  const handleClose = () => {
    setSearchQuery('');
    onClose();
  };

  const renderContactItem = ({item}: {item: PersonDisplay}) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => handleSelectContact(item)}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {item.name.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={styles.itemContent}>
        <Text style={styles.itemTitle}>{item.name}</Text>
        <Text style={styles.itemSubtitle}>
          {item.timezoneLabel} · {item.offset}
        </Text>
      </View>
      <Text style={styles.itemTime}>{item.currentTime}</Text>
    </TouchableOpacity>
  );

  const renderZoneItem = ({item}: {item: {id: string; ianaName: string; label: string}}) => {
    const offset = getOffsetString(item.ianaName);
    return (
      <TouchableOpacity
        style={styles.item}
        onPress={() => handleSelectTimezone(item.ianaName)}>
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

  const ListHeader = () => (
    <>
      {/* Contacts Section */}
      {filteredContacts.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contacts</Text>
          {filteredContacts.map(contact => (
            <View key={contact.id}>
              {renderContactItem({item: contact})}
            </View>
          ))}
        </View>
      )}

      {/* Timezones Section Header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>All Timezones</Text>
      </View>
    </>
  );

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
            <Text style={styles.headerTitle} numberOfLines={1}>Add Participant</Text>
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
            ListHeaderComponent={ListHeader}
            initialNumToRender={15}
            keyboardShouldPersistTaps="handled"
            style={styles.list}
            contentContainerStyle={styles.listContent}
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
  section: {
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  sectionHeader: {
    backgroundColor: '#f5f5f7',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#86868b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
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
  avatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
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
  itemTime: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1d1d1f',
    fontVariant: ['tabular-nums'],
  },
  itemOffset: {
    fontSize: 14,
    fontWeight: '500',
    color: '#007AFF',
  },
});
