import React from 'react';
import {StatusBar, Platform, View, Text, StyleSheet} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {ContactsProvider} from './context/ContactsContext';
import {WorldClockStack} from './navigation/WorldClockStack';
import {ConverterScreen} from './screens/ConverterScreen';
import {MeetingPlannerScreen} from './screens/MeetingPlannerScreen';

const Tab = createBottomTabNavigator();

// Custom tab bar icon component
function TabIcon({name, focused}: {name: 'clock' | 'converter' | 'meeting'; focused: boolean}) {
  const color = focused ? '#007AFF' : '#8E8E93';

  if (name === 'clock') {
    return (
      <View style={styles.iconContainer}>
        <View style={[styles.clockIcon, {borderColor: color}]}>
          <View style={[styles.clockHand, {backgroundColor: color}]} />
          <View style={[styles.clockHandMinute, {backgroundColor: color}]} />
        </View>
      </View>
    );
  }

  if (name === 'meeting') {
    return (
      <View style={styles.iconContainer}>
        <Text style={[styles.meetingIcon, {color}]}>👥</Text>
      </View>
    );
  }

  return (
    <View style={styles.iconContainer}>
      <Text style={[styles.converterArrow, {color}]}>⇄</Text>
    </View>
  );
}

export function App(): React.ReactElement {
  return (
    <SafeAreaProvider>
      <ContactsProvider>
        <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
        <NavigationContainer>
          <Tab.Navigator
            screenOptions={{
              headerShown: false,
              tabBarActiveTintColor: '#007AFF',
              tabBarInactiveTintColor: '#8E8E93',
              tabBarStyle: {
                backgroundColor: '#f5f5f7',
                borderTopWidth: StyleSheet.hairlineWidth,
                borderTopColor: '#d1d1d6',
                paddingTop: 8,
                paddingBottom: Platform.OS === 'ios' ? 24 : 16,
                height: Platform.OS === 'ios' ? 80 : 70,
              },
              tabBarLabelStyle: {
                fontSize: 13,
                fontWeight: '500',
                marginTop: 6,
              },
              tabBarIconStyle: {
                marginTop: 4,
              },
            }}>
            <Tab.Screen
              name="WorldClock"
              component={WorldClockStack}
              options={{
                tabBarLabel: 'World Clock',
                tabBarIcon: ({focused}) => <TabIcon name="clock" focused={focused} />,
                tabBarAccessibilityLabel: 'World Clock tab',
              }}
            />
            <Tab.Screen
              name="Converter"
              component={ConverterScreen}
              options={{
                tabBarLabel: 'Converter',
                tabBarIcon: ({focused}) => <TabIcon name="converter" focused={focused} />,
                tabBarAccessibilityLabel: 'Time Converter tab',
              }}
            />
            <Tab.Screen
              name="Meeting"
              component={MeetingPlannerScreen}
              options={{
                tabBarLabel: 'Meeting',
                tabBarIcon: ({focused}) => <TabIcon name="meeting" focused={focused} />,
                tabBarAccessibilityLabel: 'Meeting Planner tab',
              }}
            />
          </Tab.Navigator>
        </NavigationContainer>
      </ContactsProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clockIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clockHand: {
    position: 'absolute',
    width: 2.5,
    height: 8,
    borderRadius: 1.5,
    top: 4,
  },
  clockHandMinute: {
    position: 'absolute',
    width: 2.5,
    height: 6,
    borderRadius: 1.5,
    transform: [{rotate: '90deg'}],
    left: 9,
  },
  converterArrow: {
    fontSize: 28,
    fontWeight: '400',
  },
  meetingIcon: {
    fontSize: 22,
  },
});

export default App;
