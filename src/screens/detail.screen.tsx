import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { FlatList, Text, View, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system'; 
import FormData from 'form-data';
import Icons from '../assets/icons';
import Colors from '../constants/color.constant';
import Images from '../assets/images';
import fetch from 'node-fetch';
import { Box, Circle, Col, Gap, ImgIcon, Padder, Row, ScaledText } from 'urip-rn-kit';
import renderHighlightedVerse from './renderHighlightedVerse';
import startRecording from './record/startRecording';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import errorDetection from './errorDetection';

type RootStackParamList = {
  Home: undefined;
  Detail: { surahNumber: number; surahName: string; mode: string };
};

type DetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Detail'>;
type DetailScreenRouteProp = RouteProp<RootStackParamList, 'Detail'>;

interface DetailScreenProps {
  navigation: DetailScreenNavigationProp;
  route: DetailScreenRouteProp;
}

interface Verse {
  id: number;
  chapter_id: number;
  verse_key: number;
  verse_number: number;
  text_imlaei: string;
  words: {
    id: number;
    position: number;
    translation: {
      text: string;
    };
  }[];
}

interface VerseData {
  text: {
    different_words: { quran_index:number,quran_word: string }[];
    different_wordsinONeCharacter: { different_chars: [number, string][]; quran_index:number, quran_word: string,user_word:string }[];
    different_wordsintashkeel: { different_charintashkeel: [number, string, string][]; quran_index:number, quran_word: string ,user_word:string}[];
    quranText: string;
    user_word:string
    extraWord:{ user_word: string }[];
  };
}
interface ErrorDetails {
  extraWords: string[];
  missingWords: string[];
  incorrectByCharacters: string[];
  incorrectByTashkeel: string[];
  errorCount: number;
}

const DetailScreen: React.FC<DetailScreenProps> = (props) => {
  const [verses, setVerses] = useState<Verse[]>([]);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [recordingVerseId, setRecordingVerseId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const { surahNumber, surahName, mode } = props.route.params;
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playVerseId, setPlayVerseId] = useState<string>('');
  const [displayHighlightedText, setDisplayHighlightedText] = useState(false);
  const [recordingVerseId2, setRecordingVerseId2] = useState<string>('');
  const [visibleVerses, setVisibleVerses] = useState<{ [key: string]: boolean }>({});
  const [highlightedVerseId, setHighlightedVerseId] = useState<string | null>(null);
  const [highlightedText, setHighlightedText] = useState<{ [key: string]: React.JSX.Element }>({});
 const [count,setCount]=useState(0);
 const [errorDetails, setErrorDetails] = useState<{ [key: string]: ErrorDetails }>({});


 const showErrorDetails = (verseId: string, errorDetails: ErrorDetails) => {
  if (errorDetails.errorCount > 0) {
    let errorMessage = '';
    if (errorDetails.extraWords.length > 0) {
      errorMessage += `كلمات زائدة: ${errorDetails.extraWords.join(', ')}\n`;
    }
    if (errorDetails.missingWords.length > 0) {
      errorMessage += `كلمات ناقصة: ${errorDetails.missingWords.join(', ')}\n`;
    }
    if (errorDetails.incorrectByCharacters.length > 0) {
      errorMessage += `كلمات خاطئة بالحروف: ${errorDetails.incorrectByCharacters.join(', ')}\n`;
    }
    if (errorDetails.incorrectByTashkeel.length > 0) {
      errorMessage += `كلمات خاطئة في التشكيل: ${errorDetails.incorrectByTashkeel.join(', ')}\n`;
    }

    errorMessage = `عدد الأخطاء: ${errorDetails.errorCount}\n${errorMessage}`;

    Alert.alert('الأخطاء', errorMessage, [{ text: 'OK' }]);
  }
};


const tafseer = async ( id: number) => {
  try { 
      const response = await axios.get(`http://api.quran-tafseer.com/tafseer/1/${surahNumber}/${id}`);
      const { data } = response;
      Alert.alert(
        ' التفسير الميسر',
        data.text,
        [{ text: 'OK' }]
      );
  } catch (error) {
      console.error('حدث خطأ أثناء جلب التفسير:', error);
      alert('حدث خطأ أثناء جلب التفسير');
  }
};


  const handleHighlightVerse = (verseId: string) => {
    setHighlightedVerseId(verseId === highlightedVerseId ? null : verseId);
  };

  useEffect(() => {
    setDisplayHighlightedText(true);
  }, [recording, isPlaying]);

  useEffect(() => {
    const fetchVerses = async () => {
      try {
        const response = await axios.get(`https://api.quran.com/api/v4/verses/by_chapter/${surahNumber}?words=yes&fields=text_imlaei,&audio=1&limit=400`);
        setVerses(response.data.verses);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching verses:', error);
        setLoading(false);
        Alert.alert('خطأ', 'حدث خطأ أثناء جلب الآيات. الرجاء المحاولة مرة أخرى.');
      }
    };

    fetchVerses();
  }, [surahNumber]);

  const playOrPauseSound = async (verse_key: number, id: string) => {
    try {
      if (sound) {
        const status = await sound.getStatusAsync();
        if (status.isLoaded && status.isPlaying && playVerseId === id) {
          await sound.pauseAsync();
          setIsPlaying(false);
          setPlayVerseId('');
          return;
        }
      }

      const response = await axios.get(`https://api.quran.com/api/v4/recitations/1/by_ayah/${verse_key}`);
      const audioFile = response.data.audio_files[0].url;
      const soundObject = new Audio.Sound();
      await soundObject.loadAsync({ uri: `https://verses.quran.com/${audioFile}` });
      await soundObject.playAsync();
      setSound(soundObject);
      setIsPlaying(true);
      setPlayVerseId(id);
    } catch (error) {
      console.log('Error playing sound:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء تشغيل الصوت. الرجاء المحاولة مرة أخرى.');

    }
  };


  const stopRecording = async (recording: Audio.Recording | null, quarnText: string, verseId: string) => {
    if (!recording) {
      console.error('Recording object is null or undefined');
      return false;
    }
    
    try {
      console.log('Stopping recording..');
  
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      console.log('Recording URI:', uri);
  
      if (!uri) {
        console.error('Failed to get recording URI');
        return false;
      }
  
      const fileExtension = uri.split('.').pop()?.toLowerCase();
      console.log('File extension:', fileExtension);
  
      if (fileExtension !== 'mp3' && fileExtension !== 'wav') {
        console.error('Unsupported file format');
        return false;
      }
  
      const fileName = `recording-${Date.now()}.${fileExtension}`;
      console.log('File name:', fileName);
  
      await FileSystem.makeDirectoryAsync(FileSystem.documentDirectory + 'recordings/', { intermediates: true });
      console.log('Directory created');
  
      await FileSystem.moveAsync({
        from: uri,
        to: FileSystem.documentDirectory + 'recordings/' + fileName,
      });
      console.log('File moved');
  
      const formData = new FormData();
      formData.append('audioFile', {
        uri: FileSystem.documentDirectory + 'recordings/' + fileName,
        name: fileName,
        type: `audioFile/${fileExtension}`,
      });
      formData.append('quranText', quarnText);
      console.log('FormData prepared');
  
      const response = await axios.post('https://quran-python.vercel.app/process-audio', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Axios response:', response);
  
      if (!response.data) {
        console.error('Empty response received');
        Alert.alert('خطأ', 'لم يتم استقبال بيانات صالحة من الخادم. الرجاء المحاولة مرة أخرى.');
        return false;
      }
      const verseDataObject = response.data as VerseData;

      const { highlightedText: newHighlightedText, count } = renderHighlightedVerse(verseDataObject);
      const { extraWords, missingWords, incorrectByCharacters, incorrectByTashkeel, errorCount } = errorDetection(verseDataObject);
  
      const newErrorDetails = { errorCount, extraWords, missingWords, incorrectByCharacters, incorrectByTashkeel };
      setErrorDetails((prev) => ({ ...prev, [verseId]: newErrorDetails }));
  
      setDisplayHighlightedText(true);
      setCount(count);
      setHighlightedText((prevState) => ({ ...prevState, [verseId]: newHighlightedText }));
  
      return true;
    } catch (err) {
      console.error('Failed to stop recording or process audio:');
      if (axios.isAxiosError(err)) {
        console.error('Axios error details:', err.response?.data);
        if (err.response?.status === 503) {
          console.error('The model is still loading, please try again later.');
          Alert.alert('خطأ', 'النموذج قيد التحميل، يرجى المحاولة مرة أخرى لاحقاً.');
        } else if (err.response?.status === 504) {
          console.error('Server timeout, please try again later.');
          Alert.alert('خطأ', 'انتهى وقت الخادم، يرجى المحاولة مرة أخرى لاحقاً.');
        } else {
          console.error('There was an error with the model. Please try again later.');
          Alert.alert('خطأ', 'حدث خطأ في النموذج. الرجاء المحاولة مرة أخرى لاحقاً.');
        }
      } else {
        console.error('Unknown error:', err);
        Alert.alert('خطأ', 'حدث خطأ غير معروف. الرجاء المحاولة مرة أخرى.');
      }
      return false;
    }
  };
  

  const handleRecordButtonPress = async (verseId: string, quarnText: string) => {
    if (recording && recordingVerseId === verseId) {
      const stoppedRecording = await stopRecording(recording, quarnText, verseId);
      if (stoppedRecording) {
        setRecordingVerseId2(verseId);
        setRecording(null);
        setRecordingVerseId('');
      }
    } else {
      const recordingObject = await startRecording();
      if (recordingObject) {
        setRecording(recordingObject);
        setRecordingVerseId(verseId);
      } else {
        // إذا فشلت عملية التسجيل، عرض رسالة للمستخدم
        Alert.alert('خطأ', 'حدث خطأ أثناء بدء تسجيل الصوت. الرجاء المحاولة مرة أخرى.');
      }
    }
  };
  

  const handleVisibilityToggle = (verseId: string) => {
    setVisibleVerses((prev) => ({ ...prev, [verseId]: !prev[verseId] }));
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.offwhite }}>
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={Colors.grey2} />
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <View style={{ height: 50, flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => props.navigation.goBack()}>
              <Image source={Icons.back} style={{ width: 35, height: 35 }} />
            </TouchableOpacity>
            <Text style={{ flex: 1, fontSize: 21, fontWeight: 'bold', color: Colors.rose, textAlign: 'center' }}>
              {surahName ? surahName : ''}
            </Text>
          </View>
          <Padder horizontal={20}>
            <Box
              justifyCenter
              alignCenter
              borderRadius={10}
              height={100}
              fullWidth
              backgroundImage={Images.bg}>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: 'white' }}>{props.route.params.surahName}</Text>
              <Text style={{ fontSize: 16, color: 'white' }}>Number of verses: {verses.length}</Text>
            </Box>
          </Padder>
          <Gap size={20} vertical />
          <FlatList
            data={verses}
            keyExtractor={(item) => item.verse_number.toString()}
            renderItem={({ item }) => (
              <VerseItem
                recordingVerseId2={recordingVerseId2}
                data={item}
                playOrPauseSound={playOrPauseSound}
                handleRecordButtonPress={handleRecordButtonPress}
                recording={recording}
                recordingVerseId={recordingVerseId}
                isPlaying={isPlaying}
                playVerseId={playVerseId}
                highlightedVerse={highlightedText[item.verse_number.toString()]}
                displayHighlightedText={displayHighlightedText}
                visible={visibleVerses[item.verse_number.toString()]}
                handleVisibilityToggle={handleVisibilityToggle}
                mode={mode}
                count={count}
                handleHighlightVerse={handleHighlightVerse} 
                showErrorDetails={showErrorDetails}
                errorDetails={errorDetails[`${item.verse_number}`]}
             tafseer={tafseer}
              />
            )}
            ListFooterComponent={<Gap vertical size={200} />}
          />
        </View>
      )}
    </SafeAreaView>
  );
};

interface VerseItemProps {
  data: Verse;
  handleRecordButtonPress: (verseId: string, quarnText: string) => void;
  recording: Audio.Recording | null;
  recordingVerseId: string;
  recordingVerseId2: string;
  mode: string;
  playOrPauseSound: (verse_key: number, id: string) => void;
  isPlaying: boolean;
  playVerseId: string;
  highlightedVerse?: React.JSX.Element | undefined;
  displayHighlightedText: boolean;
  visible: boolean;
  handleVisibilityToggle: (verseId: string) => void;
  handleHighlightVerse: (verseId: string) => void;
  count:number;
  showErrorDetails: (verseId: string,errorDetails: ErrorDetails) => void;
  errorDetails: ErrorDetails;
    tafseer:( id: number) => void;
}

const VerseItem: React.FC<VerseItemProps> = ({
  recordingVerseId2,
  data,
  handleRecordButtonPress,
  recording,
  recordingVerseId,
  playOrPauseSound,
  isPlaying,
  playVerseId,
  highlightedVerse,
  displayHighlightedText,
  visible,
  mode,
  count,
  handleVisibilityToggle,
  handleHighlightVerse,
  showErrorDetails,
  errorDetails,
  tafseer
}) => (
  <Padder horizontal>
    <Col>
      <Row>
        <Col>
          <Padder horizontal>
            <Box borderRadius={10} fullWidth color={Colors.grey3} height={45}>
              <Row>
                <Col size={3} justifyCenter>
                  <Padder horizontal>
                    <Circle size={30} color={Colors.rose}>
                      <ScaledText color={Colors.white}>
                        {data.verse_number}
                      </ScaledText>
                    </Circle>
                  </Padder>
                </Col>
                <Col justifyCenter>
                  <Row alignCenter justifyEnd>


                  {mode === 'reading' &&
                  <TouchableOpacity onPress={() => tafseer(data.verse_number)}>
                      <Image source={Icons.tafseer} style={{ width: 30, height: 30, tintColor: Colors.rose ,marginRight:5}} />
                    
                    </TouchableOpacity>

}
                    <TouchableOpacity onPress={() => playOrPauseSound(data.verse_key, data.verse_number.toString())}>
                      <Image source={isPlaying && playVerseId === data.verse_number.toString() ? Icons.pause : Icons.play} style={{ width: 30, height: 30, tintColor: Colors.rose }} />
                    </TouchableOpacity>

                    {mode === 'reading' ? null :
                      <TouchableOpacity onPress={() => handleRecordButtonPress(data.verse_number.toString(), data.text_imlaei)}>
                        <Image source={recording && recordingVerseId === data.verse_number.toString() ? Icons.recording : Icons.record} style={{ width: 30, height: 30, tintColor: Colors.rose }} />
                      </TouchableOpacity>
                    }
                    {mode === 'reading' ? null :
                      <TouchableOpacity onPress={() => handleVisibilityToggle(data.verse_number.toString())}>
                        <Image source={visible ? Icons.visible : Icons.notVisible} style={{ width: 30, height: 30, tintColor: Colors.rose }} />
                      </TouchableOpacity>
                    }
                    <Gap />
                  </Row>
                </Col>
              </Row>
            </Box>
          </Padder>
        </Col>
      </Row>
      {((mode === 'reading' || mode === undefined && !visible) || visible) && (
        <>
          <Row justifyEnd>
            <Padder all>
              <ScaledText size={22} bold>{data.text_imlaei}</ScaledText>
            </Padder>
          </Row>
        </>
      )}
      <Row alignCenter justifyEnd>
        <Padder all>
          {displayHighlightedText && highlightedVerse && (
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }}>
             <TouchableOpacity onPress={() => showErrorDetails(data.verse_number.toString(),errorDetails)}>
                         <Image source={errorDetails.errorCount>0  ? Icons.lens : null} style={{ width: 20, height: 20, tintColor: Colors.rose,marginRight:5 }} />
                      </TouchableOpacity>
                      <Image source={errorDetails.errorCount>0 ? Icons.attention : Icons.true } style={{ width: 15, height: 15, justifyContent: 'flex-end', marginRight: 5 }} /> 
              <View style={{ marginLeft: 5 }}>{highlightedVerse}</View>
            </View>
          )}
        </Padder>
      </Row>

      
      <Gap vertical />
      <Gap vertical />
    </Col>
  </Padder>
);

export default DetailScreen;
