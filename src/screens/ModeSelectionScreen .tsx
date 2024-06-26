import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '../constants/color.constant';
import { StackNavigationProp } from '@react-navigation/stack';
import Images from '../assets/images/index';

type RootStackParamList = {
  Home: { mode: string };
};

type ModeSelectionScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface ModeSelectionScreenProps {
  navigation: ModeSelectionScreenNavigationProp;
}

const ModeSelectionScreen: React.FC<ModeSelectionScreenProps> = ({ navigation }) => {
  // Function to navigate to HomeScreen with mode parameter
  const navigateToHome = (mode: string) => {
    navigation.navigate('Home', { mode });
  };



  return (
    <ImageBackground  style={styles.container }>
      <SafeAreaView style={styles.safeArea}>
        
          <Image source={Images.logo} style={styles.logo} />
      
        <View style={styles.logoContainer}>
        <TouchableOpacity 
          style={styles.button} 
          onPress={() => navigateToHome('reading')} // Navigate with 'reading' mode
        >
          <Text style={styles.buttonText}> وضع القراءة و التفسير</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.button} 
          onPress={() => navigateToHome('reciting')} // Navigate with 'reciting' mode
        >
          <Text style={styles.buttonText}>وضع التسميع</Text>
        </TouchableOpacity>
        </View>
        
      </SafeAreaView>
      <Text style={styles.title}> تطبيق تسميع القرآن </Text>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  backgroundColor: Colors.pink,

  },
  safeArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',

  },
  logo: {
    width: 200,
    height: 200,
  },
  title: {
    fontSize: 20,
    color: Colors.rose,
    textAlign:'center',
    marginBottom:20,
    fontWeight:'bold'
      
    
  },
  button: {
    backgroundColor: Colors.rose,
    padding: 20,
    marginVertical: 20,
    borderRadius: 20,
    marginLeft: 20
   
  },
  buttonText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight:'bold'
  },
});


export default ModeSelectionScreen;
