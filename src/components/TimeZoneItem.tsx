import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import {TimeZoneDisplay} from '../types';

interface TimeZoneItemProps {
  item: TimeZoneDisplay;
  onDelete: (id: string) => void;
  itemWidth: number;
  itemHeight: number;
}

export const TimeZoneItem = React.memo(function TimeZoneItem({
  item,
  onDelete,
  itemWidth,
  itemHeight,
}: TimeZoneItemProps): React.ReactElement {
  const handleDelete = () => {
    onDelete(item.id);
  };

  return (
    <View
      style={[
        styles.container,
        {
          width: itemWidth,
          height: itemHeight,
        },
      ]}>
      {/* Time - prominent display */}
      <Text style={styles.time}>{item.currentTime}</Text>

      {/* City and details */}
      <View style={styles.details}>
        <Text style={styles.cityName} numberOfLines={1}>
          {item.label}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {item.offset} · {item.currentDate}
          {item.isDST ? ' · DST' : ''}
        </Text>
      </View>

      {/* Delete button - minimal */}
      <TouchableOpacity
        onPress={handleDelete}
        style={styles.deleteButton}
        hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
        accessibilityLabel={`Delete ${item.label}`}
        accessibilityRole="button">
        <Text style={styles.deleteText}>−</Text>
      </TouchableOpacity>
    </View>
  );
}, (prevProps, nextProps) => {
  // Предотвращаем ре-рендер если время, размеры и колбэки не изменились
  return prevProps.item.currentTime === nextProps.item.currentTime &&
         prevProps.item.currentDate === nextProps.item.currentDate &&
         prevProps.item.id === nextProps.item.id &&
         prevProps.itemWidth === nextProps.itemWidth &&
         prevProps.itemHeight === nextProps.itemHeight &&
         prevProps.onDelete === nextProps.onDelete;
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 16,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  time: {
    fontSize: 32,
    fontWeight: '200',
    color: '#000',
    fontVariant: ['tabular-nums'],
    letterSpacing: -1,
    fontFamily: Platform.select({
      ios: 'System',
      default: undefined,
    }),
  },
  details: {
    alignItems: 'center',
    marginTop: 6,
  },
  cityName: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1d1d1f',
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 11,
    color: '#8e8e93',
    marginTop: 2,
    letterSpacing: -0.1,
  },
  deleteButton: {
    position: 'absolute',
    top: 6,
    right: 8,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(0,0,0,0.06)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteText: {
    fontSize: 16,
    color: '#8e8e93',
    fontWeight: '300',
    lineHeight: 18,
    marginTop: -1,
  },
});
