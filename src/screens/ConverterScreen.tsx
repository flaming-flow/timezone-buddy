import React, {useCallback, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {DragSortableView} from 'react-native-drag-sort';
import {ConversionResult} from '../types';
import {DateTimePickerComponent} from '../components/DateTimePicker';
import {BaseTimeZoneSelector} from '../components/BaseTimeZoneSelector';
import {ConversionResultItem} from '../components/ConversionResultItem';
import {useConverter} from '../hooks/useConverter';
import {useResponsiveLayout, useComponentSizes} from '../hooks/useResponsiveLayout';
import {saveTimeZones} from '../storage/storageService';

export function ConverterScreen(): React.ReactElement {
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const {
    selectedDate,
    baseTimeZone,
    savedZones,
    results,
    setSelectedDate,
    setBaseTimeZone,
    setToNow,
    isLoading,
  } = useConverter();

  const layout = useResponsiveLayout();
  const sizes = useComponentSizes();
  const {width: screenWidth} = useWindowDimensions();

  // Calculate item dimensions for drag sort
  const gridPadding = layout.spacing.medium * 2;
  const contentWidth = Math.min(screenWidth, layout.contentMaxWidth);
  // In wide layout, results section takes half the width minus gap
  const availableWidth = layout.isWideScreen
    ? (contentWidth - layout.spacing.medium) / 2 - gridPadding
    : contentWidth - gridPadding;
  const itemHeight = 112; // Height for centered card layout with spacing

  const renderResultItem = useCallback(
    (item: ConversionResult, index: number) => (
      <View style={{width: availableWidth}}>
        <ConversionResultItem
          result={item}
          isBase={item.timeZone === baseTimeZone}
        />
      </View>
    ),
    [baseTimeZone, availableWidth],
  );

  const handleDataChange = useCallback(
    async (data: ConversionResult[]) => {
      // Save the new order to storage
      const newZoneOrder = data.map(item => item.timeZone);
      try {
        await saveTimeZones(newZoneOrder);
      } catch (error) {
        console.error('Failed to save reordered zones:', error);
      }
    },
    [],
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer} edges={['top']}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading converter...</Text>
      </SafeAreaView>
    );
  }

  // Use side-by-side layout on wide screens
  const isWideLayout = layout.isWideScreen;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        scrollEnabled={scrollEnabled}
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            maxWidth: layout.contentMaxWidth,
            alignSelf: 'center',
            width: '100%',
          },
        ]}
        showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View
          style={[
            styles.header,
            {
              paddingHorizontal: layout.spacing.medium,
              paddingVertical: layout.spacing.medium,
            },
          ]}>
          <Text style={[styles.title, {fontSize: sizes.fontSize.title}]}>
            Time Converter
          </Text>
        </View>

        {/* Content - side by side on wide screens */}
        <View
          style={[
            styles.mainContent,
            isWideLayout && styles.mainContentWide,
            {gap: layout.spacing.medium},
          ]}>
          {/* Input Section */}
          <View
            style={[
              styles.inputSection,
              isWideLayout && styles.inputSectionWide,
              {paddingHorizontal: layout.spacing.medium},
            ]}>
            {/* Date/Time Input */}
            <View style={{marginBottom: layout.spacing.medium}}>
              <DateTimePickerComponent
                date={selectedDate}
                onDateChange={setSelectedDate}
                onNowPress={setToNow}
                timeZone={baseTimeZone}
              />
            </View>

            {/* Base Time Zone Selector */}
            {savedZones.length > 0 && (
              <BaseTimeZoneSelector
                selectedZone={baseTimeZone}
                availableZones={savedZones}
                onSelect={setBaseTimeZone}
              />
            )}
          </View>

          {/* Results Section */}
          <View
            style={[
              styles.resultsSection,
              isWideLayout && styles.resultsSectionWide,
              {paddingHorizontal: layout.spacing.medium},
            ]}>
            <Text
              style={[
                styles.resultsTitle,
                {
                  fontSize: sizes.fontSize.large,
                  marginBottom: layout.spacing.medium,
                },
              ]}>
              Converted Times
            </Text>

            {savedZones.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, {fontSize: sizes.fontSize.medium}]}>
                  Add time zones in the World Clock tab to see conversions
                </Text>
              </View>
            ) : results.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, {fontSize: sizes.fontSize.medium}]}>
                  Select a date and time to see conversions
                </Text>
              </View>
            ) : (
              <DragSortableView
                dataSource={results}
                parentWidth={availableWidth}
                childrenWidth={availableWidth}
                childrenHeight={itemHeight}
                marginChildrenTop={0}
                marginChildrenBottom={0}
                marginChildrenLeft={0}
                marginChildrenRight={0}
                keyExtractor={(item: ConversionResult) => item.timeZone}
                renderItem={renderResultItem}
                onDataChange={handleDataChange}
                onDragStart={() => setScrollEnabled(false)}
                onDragEnd={() => setScrollEnabled(true)}
                delayLongPress={200}
                isDragFreely={false}
                maxScale={1.02}
                minOpacity={0.9}
                scaleDuration={100}
                slideDuration={200}
              />
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontWeight: '700',
    color: '#1a1a1a',
  },
  mainContent: {
    flex: 1,
  },
  mainContentWide: {
    flexDirection: 'row',
  },
  inputSection: {
    marginBottom: 24,
  },
  inputSectionWide: {
    flex: 1,
    marginBottom: 0,
  },
  resultsSection: {
    flex: 1,
  },
  resultsSectionWide: {
    flex: 1,
    overflow: 'hidden',
  },
  resultsTitle: {
    fontWeight: '600',
    color: '#1a1a1a',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyText: {
    color: '#666',
    textAlign: 'center',
  },
});
