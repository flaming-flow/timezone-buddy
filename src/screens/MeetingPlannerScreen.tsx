import React from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {MeetingPlanner} from '../components/MeetingPlanner';
import {useConverter} from '../hooks/useConverter';
import {useResponsiveLayout, useComponentSizes} from '../hooks/useResponsiveLayout';

export function MeetingPlannerScreen(): React.ReactElement {
  const {savedZones, isLoading} = useConverter();
  const layout = useResponsiveLayout();
  const sizes = useComponentSizes();

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
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
            Meeting Planner
          </Text>
        </View>

        {/* Meeting Planner */}
        <View style={{paddingHorizontal: layout.spacing.medium}}>
          {savedZones.length >= 1 ? (
            <MeetingPlanner savedZones={savedZones} />
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyTitle, {fontSize: sizes.fontSize.large}]}>
                No Time Zones
              </Text>
              <Text style={[styles.emptyText, {fontSize: sizes.fontSize.medium}]}>
                Add time zones in the World Clock tab to use Meeting Planner
              </Text>
            </View>
          )}
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
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
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
  emptyContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
  },
  emptyTitle: {
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  emptyText: {
    color: '#666',
    textAlign: 'center',
  },
});
