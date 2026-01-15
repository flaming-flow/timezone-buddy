import {NativeStackScreenProps} from '@react-navigation/native-stack';

// Stack params for WorldClock tab
export type WorldClockStackParamList = {
  WorldClockMain: undefined;
  PersonDetail: {personId?: string}; // undefined for new person, id for edit
};

// Screen props
export type WorldClockMainScreenProps = NativeStackScreenProps<
  WorldClockStackParamList,
  'WorldClockMain'
>;

export type PersonDetailScreenProps = NativeStackScreenProps<
  WorldClockStackParamList,
  'PersonDetail'
>;
