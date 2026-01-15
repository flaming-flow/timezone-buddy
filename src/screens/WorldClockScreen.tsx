import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  useWindowDimensions,
  ScrollView,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {DragSortableView} from 'react-native-drag-sort';
import DraggableFlatList, {RenderItemParams, ScaleDecorator} from 'react-native-draggable-flatlist';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {TimeZoneDisplay, PersonDisplay} from '../types';
import {WorldClockStackParamList} from '../types/navigation';
import {TimeZoneItem} from '../components/TimeZoneItem';
import {TimeZonePicker} from '../components/TimeZonePicker';
import {ContactCard} from '../components/ContactCard';
import {useTimeZones} from '../hooks/useTimeZones';
import {useContacts} from '../context/ContactsContext';

type NavigationProp = NativeStackNavigationProp<WorldClockStackParamList, 'WorldClockMain'>;

// Layout constants
const PADDING = 16;
const GAP = 16;

export function WorldClockScreen(): React.ReactElement {
  const [showPicker, setShowPicker] = useState(false);
  const [timeZoneScrollEnabled, setTimeZoneScrollEnabled] = useState(true);
  const navigation = useNavigation<NavigationProp>();
  const {timeZones, isLoading, addTimeZone, removeTimeZone, reorderTimeZones, pauseUpdates, resumeUpdates} =
    useTimeZones();
  const {contacts, removeContact, reorderContacts, isLoading: isContactsLoading} = useContacts();
  const {width: screenWidth} = useWindowDimensions();

  // Row width (full screen minus padding and gap between columns)
  const rowWidth = screenWidth - PADDING * 2;
  const availableWidth = rowWidth - GAP;

  // Column widths: 80% for timezones, 20% for contacts
  const mainColWidth = Math.floor(availableWidth * 0.8);
  const sideColWidth = Math.floor(availableWidth * 0.2);

  // Time zones grid: 3 columns
  const numColumns = 3;
  const itemWidth = Math.floor(mainColWidth / numColumns);
  const itemHeight = Math.floor(itemWidth * 0.85);

  // Contact card: full width of side column
  const contactCardWidth = sideColWidth;
  const contactCardHeight = 170;

  const handleAddPress = useCallback(() => {
    setShowPicker(true);
  }, []);

  const handleSelectZone = useCallback(
    (ianaName: string) => {
      addTimeZone(ianaName);
    },
    [addTimeZone],
  );

  const handleDataChange = useCallback(
    (data: TimeZoneDisplay[]) => {
      reorderTimeZones(data);
    },
    [reorderTimeZones],
  );

  const renderItem = useCallback(
    (item: TimeZoneDisplay) => {
      return (
        <TimeZoneItem
          item={item}
          onDelete={removeTimeZone}
          itemWidth={itemWidth - 8}
          itemHeight={itemHeight - 8}
        />
      );
    },
    [removeTimeZone, itemWidth, itemHeight],
  );

  const existingZones = timeZones.map(tz => tz.ianaName);

  const handleContactPress = useCallback(
    (personId: string) => {
      navigation.navigate('PersonDetail', {personId});
    },
    [navigation],
  );

  const handleAddContact = useCallback(() => {
    navigation.navigate('PersonDetail', {});
  }, [navigation]);

  const renderContactItem = useCallback(
    ({item, drag, isActive}: RenderItemParams<PersonDisplay>) => {
      return (
        <ScaleDecorator>
          <TouchableOpacity
            onLongPress={drag}
            delayLongPress={80}
            onPress={() => handleContactPress(item.id)}
            disabled={isActive}
            style={{opacity: isActive ? 0.9 : 1, marginBottom: 12}}>
            <ContactCard
              person={item}
              onDelete={removeContact}
              width={contactCardWidth}
              height={contactCardHeight}
            />
          </TouchableOpacity>
        </ScaleDecorator>
      );
    },
    [removeContact, contactCardWidth, contactCardHeight, handleContactPress],
  );

  if (isLoading || isContactsLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer} edges={['top']}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        {/* ROW 1: Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>World Clock</Text>
            {timeZones.length > 1 && (
              <Text style={styles.hint}>Hold to reorder</Text>
            )}
          </View>
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddPress}
              accessibilityLabel="Add time zone">
              <Text style={styles.addButtonText}>+ Add Zone</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.addContactButton}
              onPress={handleAddContact}
              accessibilityLabel="Add contact">
              <Text style={styles.addContactButtonText}>+ Add Contact</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ROW 2: Two columns */}
        <View style={styles.columnsRow}>
          {/* COL 1: Timezones (80%) */}
          <View style={[styles.mainCol, {width: mainColWidth}]}>
            <ScrollView
              scrollEnabled={timeZoneScrollEnabled}
              style={styles.scrollView}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}>
              {timeZones.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyTitle}>No Time Zones</Text>
                  <Text style={styles.emptyText}>Add your first time zone to get started</Text>
                </View>
              ) : (
                <DragSortableView
                  dataSource={timeZones}
                  parentWidth={mainColWidth}
                  childrenWidth={itemWidth}
                  childrenHeight={itemHeight}
                  marginChildrenTop={4}
                  marginChildrenBottom={4}
                  marginChildrenLeft={0}
                  marginChildrenRight={0}
                  keyExtractor={(item: TimeZoneDisplay) => item.id}
                  renderItem={renderItem}
                  onDataChange={handleDataChange}
                  onDragStart={() => {
                    setTimeZoneScrollEnabled(false);
                    pauseUpdates();
                  }}
                  onDragEnd={() => {
                    setTimeZoneScrollEnabled(true);
                    resumeUpdates();
                  }}
                  delayLongPress={200}
                  isDragFreely={false}
                  maxScale={1.03}
                  minOpacity={0.85}
                  scaleDuration={100}
                  slideDuration={200}
                />
              )}
            </ScrollView>
          </View>

          {/* COL 2: Contacts (20%) */}
          <View style={[styles.sideCol, {width: sideColWidth}]}>
            {contacts.length === 0 ? (
              <View style={styles.emptyContactsContainer}>
                <Text style={styles.emptyContactsText}>No contacts yet</Text>
              </View>
            ) : (
              <DraggableFlatList
                data={contacts}
                keyExtractor={(item: PersonDisplay) => item.id}
                renderItem={renderContactItem}
                onDragEnd={({data}) => reorderContacts(data)}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
              />
            )}
          </View>
        </View>
      </View>

      <TimeZonePicker
        visible={showPicker}
        onClose={() => setShowPicker(false)}
        onSelect={handleSelectZone}
        excludeZones={existingZones}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f7',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f7',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: '#86868b',
  },
  content: {
    flex: 1,
    paddingHorizontal: PADDING,
  },
  // ROW 1: Header
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1d1d1f',
    letterSpacing: -0.5,
  },
  hint: {
    fontSize: 12,
    color: '#86868b',
    marginTop: 4,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  addContactButton: {
    backgroundColor: '#34C759',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addContactButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  // ROW 2: Columns
  columnsRow: {
    flex: 1,
    flexDirection: 'row',
    gap: GAP,
  },
  mainCol: {
    flex: 0,
  },
  sideCol: {
    flex: 0,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  emptyContainer: {
    paddingVertical: 80,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1d1d1f',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: '#86868b',
  },
  emptyContactsContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyContactsText: {
    fontSize: 14,
    color: '#86868b',
  },
});
