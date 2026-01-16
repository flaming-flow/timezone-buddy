import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useContacts} from '../context/ContactsContext';
import {TimeZonePicker} from './TimeZonePicker';
import {
  getLabelForZone,
  getOffsetString,
  getCurrentTimeInZone,
} from '../domain/timeZoneService';

interface PersonDetailModalProps {
  visible: boolean;
  personId?: string;
  onClose: () => void;
}

export function PersonDetailModal({
  visible,
  personId,
  onClose,
}: PersonDetailModalProps): React.ReactElement {
  const {contacts, addContact, updateContact, removeContact} = useContacts();

  const [name, setName] = useState('');
  const [timezone, setTimezone] = useState('');
  const [notes, setNotes] = useState('');
  const [showTimezonePicker, setShowTimezonePicker] = useState(false);

  const isEditing = !!personId;
  const existingPerson = personId
    ? contacts.find(p => p.id === personId)
    : undefined;

  // Load existing person data or reset on open
  useEffect(() => {
    if (visible) {
      if (existingPerson) {
        setName(existingPerson.name);
        setTimezone(existingPerson.timezone);
        setNotes(existingPerson.notes || '');
      } else {
        setName('');
        setTimezone('');
        setNotes('');
      }
    }
  }, [visible, existingPerson]);

  const handleSave = useCallback(() => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a name');
      return;
    }
    if (!timezone) {
      Alert.alert('Error', 'Please select a timezone');
      return;
    }

    if (isEditing && personId) {
      updateContact(personId, {
        name: name.trim(),
        timezone,
        notes: notes.trim() || undefined,
      });
    } else {
      addContact({
        name: name.trim(),
        timezone,
        notes: notes.trim() || undefined,
      });
    }

    onClose();
  }, [name, timezone, notes, isEditing, personId, addContact, updateContact, onClose]);

  const handleDelete = useCallback(() => {
    Alert.alert('Delete Contact', `Are you sure you want to delete ${name}?`, [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          if (personId) {
            removeContact(personId);
            onClose();
          }
        },
      },
    ]);
  }, [name, personId, removeContact, onClose]);

  const handleClose = useCallback(() => {
    setShowTimezonePicker(false);
    onClose();
  }, [onClose]);

  const timezoneLabel = timezone ? getLabelForZone(timezone) : '';
  const timezoneOffset = timezone ? getOffsetString(timezone) : '';
  const currentTime = timezone ? getCurrentTimeInZone(timezone) : '';

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}>
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={handleClose}
            style={styles.headerButton}
            hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title} numberOfLines={1}>
            {isEditing ? 'Edit Contact' : 'New Contact'}
          </Text>
          <TouchableOpacity
            onPress={handleSave}
            style={[styles.headerButton, styles.headerButtonRight]}
            hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
            <Text style={styles.saveText}>Save</Text>
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          style={styles.keyboardAvoid}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled">
            {/* Name Input */}
            <View style={styles.field}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter name"
                placeholderTextColor="#999"
                autoCapitalize="words"
                autoFocus={!isEditing && visible}
              />
            </View>

            {/* Timezone Selector */}
            <View style={styles.field}>
              <Text style={styles.label}>Timezone</Text>
              <TouchableOpacity
                style={[styles.input, styles.timezoneButton]}
                onPress={() => setShowTimezonePicker(true)}>
                {timezone ? (
                  <View>
                    <Text style={styles.timezoneLabel}>{timezoneLabel}</Text>
                    <Text style={styles.timezoneDetail}>
                      {timezone} ({timezoneOffset})
                    </Text>
                    <Text style={styles.currentTime}>Current: {currentTime}</Text>
                  </View>
                ) : (
                  <Text style={styles.placeholder}>Select timezone...</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Notes Input */}
            <View style={styles.field}>
              <Text style={styles.label}>Notes (optional)</Text>
              <TextInput
                style={[styles.input, styles.notesInput]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Add notes..."
                placeholderTextColor="#999"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            {/* Delete Button (only for editing) */}
            {isEditing && (
              <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                <Text style={styles.deleteButtonText}>Delete Contact</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* Timezone Picker Modal */}
      <TimeZonePicker
        visible={showTimezonePicker}
        onClose={() => setShowTimezonePicker(false)}
        onSelect={ianaName => {
          setTimezone(ianaName);
          setShowTimezonePicker(false);
        }}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f7',
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ddd',
  },
  headerButton: {
    minWidth: 60,
  },
  headerButtonRight: {
    alignItems: 'flex-end',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  cancelText: {
    fontSize: 17,
    color: '#007AFF',
  },
  saveText: {
    fontSize: 17,
    color: '#007AFF',
    fontWeight: '600',
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 16,
    fontSize: 16,
    minHeight: 48,
  },
  timezoneButton: {
    justifyContent: 'center',
    paddingVertical: 12,
  },
  timezoneLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  timezoneDetail: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  currentTime: {
    fontSize: 13,
    color: '#007AFF',
    marginTop: 4,
  },
  placeholder: {
    fontSize: 16,
    color: '#999',
  },
  notesInput: {
    height: 100,
    paddingTop: 12,
    paddingBottom: 12,
  },
  deleteButton: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 16,
    color: '#FF3B30',
    fontWeight: '500',
  },
});
