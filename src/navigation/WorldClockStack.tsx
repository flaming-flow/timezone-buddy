import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {WorldClockScreen} from '../screens/WorldClockScreen';
import {WorldClockStackParamList} from '../types/navigation';

const Stack = createNativeStackNavigator<WorldClockStackParamList>();

export function WorldClockStack(): React.ReactElement {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="WorldClockMain" component={WorldClockScreen} />
    </Stack.Navigator>
  );
}
