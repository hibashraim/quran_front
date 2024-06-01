import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

export type RootStackParamList = {
  ModeSelection: undefined;
  Home: { mode: 'reading' | 'reciting' };
  Detail: { surahNumber: number; surahName: string; mode: 'reading' | 'reciting' };
};

export type ModeSelectionScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ModeSelection'>;
export type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;
export type DetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Detail'>;

export type HomeScreenRouteProp = RouteProp<RootStackParamList, 'Home'>;
export type DetailScreenRouteProp = RouteProp<RootStackParamList, 'Detail'>;
export type DetailScreenRouteProp = RouteProp<RootStackParamList, 'ModeSelection'>;

