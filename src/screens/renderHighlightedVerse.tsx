import React from 'react';
import { Text, View } from 'react-native';

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

const isTashkeel = (char: string): boolean => {
  const tashkeelPattern = /[\u064B-\u0652]/;
  return tashkeelPattern.test(char);
};
const stripTashkeel = (text: string): string => {
  const tashkeelPattern = /[\u064B-\u0652]/g; // نطاق علامات التشكيل في اليونيكود
  return text.replace(tashkeelPattern, '');
};

const renderHighlightedVerse = ({ text }: VerseData) => {
  console.log(text)
  const { different_words, different_wordsinONeCharacter, different_wordsintashkeel, quranText ,extraWord} = text;
 let count=0;
 if(extraWord){
  count++;
 }
  // تحويل النص إلى مصفوفة من الكلمات
  const words = quranText.split(' ');
  return {
    highlightedText: (
      
    <Text style= {[{fontSize:22}, {fontWeight:'bold'}]}>
      {words.map((word, index) => {
        // البحث عن الكلمة في different_words
        const foundWordInDifferentWords = different_words.find(item => item.quran_index=== index);

        if (foundWordInDifferentWords) {
          count++;
          // إذا تم العثور على الكلمة في different_words، نقوم بتلوينها باللون الأخضر
          return (
            <Text key={index} style={{ color: 'red', fontSize: 22 }}>
              {word}{' '}
            </Text>
          );
        } else {
          // البحث عن الكلمة في different_wordsinONeCharacter
          const foundWordInDifferentONeCharacter = different_wordsinONeCharacter.find(item => item.quran_index=== index);

          if (foundWordInDifferentONeCharacter) {
          count++;
            // إذا تم العثور على الكلمة، نقوم بتحديد الأحرف المختلفة وتلوينها
            const { different_chars } = foundWordInDifferentONeCharacter;
            if (different_chars.length === 0) {
              return (
                <Text key={index} style={{ color: 'red', fontSize: 22 }}>
                  {word}{' '}
                </Text>
              );
            } else {
              let charIndex = 0;
              const coloredWord = word.split('').map((char, originalIndex) => {
                if (isTashkeel(char)) {
                  // إذا كان الحرف هو حركة، نتجاوزه بدون زيادة في charIndex
                  return (
                    <Text key={originalIndex} style={{ color: 'black', fontSize: 22 }}>
                      {char}
                    </Text>
                  );
                } else {
                  // مقارنة الحرف بدون تشكيل
                  const isDifferentChar = different_chars.some(([index, _]) => charIndex === index);
          
                  const charColor = isDifferentChar ? 'red' : 'black';
                  charIndex++; // زيادة الفهرس فقط إذا لم يكن الحرف حركة
                  return (
                    <Text key={originalIndex} style={{ color: charColor, fontSize: 22 }}>
                      {char}
                    </Text>
                  );
                }
              });
          
              return (
                <Text key={index}>
                  {coloredWord}{' '}
                </Text>
              );
            }
          } else {
            // البحث عن الكلمة في different_wordsintashkeel
            const foundWordInDifferentTashkeel = different_wordsintashkeel.find(item => item.quran_index=== index);

            if (foundWordInDifferentTashkeel) {
          count++;
              // إذا تم العثور على الكلمة، نقوم بتحديد الأحرف المختلفة وتلوينها
              const { different_charintashkeel } = foundWordInDifferentTashkeel;
              const coloredWord = word.split('').map((char, charIndex) => {
                const isDifferentChar = different_charintashkeel.some(([index, originalTashkeel, newTashkeel]) => charIndex === index);
                const charColor = isDifferentChar ? 'red' : 'black';
                return (
                  <Text key={charIndex} style={{ color: charColor, fontSize: 22 }}>
                    {char}
                  </Text>
                );
              });

              return (
                <Text key={index}>
                  {coloredWord}{' '}
                </Text>
              );
            } else {
              // إذا لم يتم العثور على الكلمة في أيٍ من القوائم، نقوم بعرضها باللون الأسود
              return (
                <Text key={index}>
                  {word}{' '}
                </Text>
              );
            }
          }
          
        }
      })}
    
    </Text>
    ),
    
    count,
  }
};

export default renderHighlightedVerse;
