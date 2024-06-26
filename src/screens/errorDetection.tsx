
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

const errorDetection = ({ text }: VerseData): ErrorDetails => {
  const extraWords: string[] = [];
  const missingWords: string[] = [];
  const incorrectByCharacters: string[] = [];
  const incorrectByTashkeel: string[] = [];

  text.different_words.forEach((word) => {
    missingWords.push(word.quran_word);
  });

  text.different_wordsinONeCharacter.forEach((word) => {
    incorrectByCharacters.push(word.user_word);
  });

  text.different_wordsintashkeel.forEach((word) => {
    incorrectByTashkeel.push(word.user_word);
  });

  text.extraWord.forEach((word) => {
    extraWords.push(word.user_word);
  });

  return {
    extraWords,
    missingWords,
    incorrectByCharacters,
    incorrectByTashkeel,
    errorCount: extraWords.length + missingWords.length + incorrectByCharacters.length + incorrectByTashkeel.length,
  };
};

export default errorDetection;
