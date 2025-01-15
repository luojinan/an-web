import Dexie from 'dexie';
import type { Word } from '../type/index';

const db = new Dexie('WordsDB');
db.version(4).stores({
  words: '++id,dictionaryId',
  meta: 'key',
  dictionaries: '++id,name,url,createdAt',
  dataSources: 'url',
  learnedWords: '++id,word' // New table for learned words
});

export const saveWordsToIndexedDB = async (words: Word[], dictionaryId: number) => {
  await db.table('words').where('dictionaryId').equals(dictionaryId).delete();
  await db.table('words').bulkAdd(words.map(word => ({ ...word, dictionaryId })));
  await db.table('meta').put({ key: 'lastFetched', value: new Date().toISOString() });
};

export const getLastFetchedTime = async () => {
  const meta = await db.table('meta').get('lastFetched');
  return meta ? meta.value : null;
};

export const getWordsFromIndexedDB = async (dictionaryId?: number) => {
  if (dictionaryId) {
    return await db.table('words').where('dictionaryId').equals(dictionaryId).toArray();
  }
  return await db.table('words').toArray();
};

export const createDictionary = async (name: string, url: string) => {
  const dictionaryId = await db.table('dictionaries').put({
    name,
    url,
    createdAt: new Date().toISOString()
  });
  return dictionaryId;
};

export const getDictionaries = async () => {
  return await db.table('dictionaries').toArray();
};

export const importWordsFromUrl = async (url: string) => {
  try {
    const response = await fetch(url);
    const words = await response.json();

    // Get learned words
    const learnedWords = await db.table('learnedWords').toArray();
    const learnedWordSet = new Set(learnedWords.map(w => w.word));

    // Filter out learned words
    const newWords = words.filter((word: Word) => !learnedWordSet.has(word.word));

    const dictionaryId = await createDictionary(url.split('/').pop() || 'New Dictionary', url);

    await db.table('words').where('dictionaryId').equals(dictionaryId).delete();
    await db.table('words').bulkAdd(newWords.map((word: Word) => ({ ...word, dictionaryId })));

    return {
      words: newWords,
      dictionaryId,
      totalWords: words.length,
      filteredWords: words.length - newWords.length
    };
  } catch (error) {
    console.error('导入数据失败:', error);
    throw error;
  }
};

export const getWordsByDictionary = async (dictionaryId: number) => {
  return await db.table('words').where('dictionaryId').equals(dictionaryId).toArray();
};

export const importLearnedWords = async (url: string) => {
  try {
    const response = await fetch(url);
    const words: string[] = await response.json();

    // Get existing words
    const existingWords = await db.table('learnedWords').toArray();
    const existingWordSet = new Set(existingWords.map(w => w.word));

    // Filter new words
    const newWords = words.filter(word => !existingWordSet.has(word));

    // Save new words
    await db.table('learnedWords').bulkAdd(newWords.map(word => ({ word })));

    return {
      total: words.length,
      added: newWords.length
    };
  } catch (error) {
    console.error('导入已学单词失败:', error);
    throw error;
  }
};

export const getLearnedWords = async () => {
  return await db.table('learnedWords').toArray();
};

// 兼容旧代码
export const getWordsBySource = async (url: string) => {
  const dictionary = await db.table('dictionaries').where('url').equals(url).first();
  if (dictionary) {
    return await getWordsByDictionary(dictionary.id);
  }
  return [];
};