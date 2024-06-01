import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { FlatList, Image, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Box, Col, Line, Padder, Row, ScaledText } from 'urip-rn-kit';
import Images from '../assets/images';
import Colors from '../constants/color.constant';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icons from '../assets/icons';

import { HomeScreenRouteProp, DetailScreenNavigationProp } from '../types/navigation'; // استيراد النوع

interface Chapter {
  id: number;
  name_simple: string;
  name_arabic: string;
  verses_count: number;
  translated_name: { language_name: string; name: string };
}

const HomeScreen: React.FC = () => {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const navigation = useNavigation<DetailScreenNavigationProp>();
  const route = useRoute<HomeScreenRouteProp>(); // استخدام useRoute لاستخراج mode
  const { mode } = route.params;

  useEffect(() => {
    const fetchChapters = async () => {
      try {
        const response = await axios.get('https://api.quran.com/api/v4/chapters');
        setChapters(response.data.chapters);
      } catch (error) {
        console.error('Error fetching chapters:', error);
      }
    };

    fetchChapters();
  }, []);

  const renderItem = ({ item }: { item: Chapter }) => (
    <TouchableOpacity onPress={() => navigation.navigate('Detail', { surahNumber: item.id, surahName: item.name_simple, mode })}>
      <SurahItem chapter={item} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ backgroundColor: Colors.white, flex: 1 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10 }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image source={Icons.back} style={{ width: 35, height: 35 }} />
        </TouchableOpacity>
      </View>
      <FlatList
        data={chapters}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
      />
    </SafeAreaView>
  );
};

interface SurahItemProps {
  chapter: Chapter;
}

const SurahItem: React.FC<SurahItemProps> = React.memo(({ chapter }) => {
  return (
    <Col>
      <Padder horizontal={10}>
        <Row height={60}>
          <Col justifyCenter>
            <Box
              backgroundImage={Images.num_bg}
              height={40}
              width={45}
              justifyCenter
              alignCenter
            >
              <ScaledText size={10} color={Colors.rose}>
                {chapter.id}
              </ScaledText>
            </Box>
          </Col>
          <Col size={3} justifyCenter>
            <ScaledText size={18} bold>
              {chapter.name_simple}
            </ScaledText>
            <ScaledText size={12} color={Colors.grey2}>
              {`${chapter.verses_count} Verses`}
            </ScaledText>
          </Col>
          <Col size={3} justifyCenter alignEnd>
            <ScaledText size={18} bold>
              {chapter.name_arabic}
            </ScaledText>
          </Col>
        </Row>
        <Line size={1} color={Colors.off} />
      </Padder>
    </Col>
  );
});

export default HomeScreen;
