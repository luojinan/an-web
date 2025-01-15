import Dexie from 'dexie';
import type { Word } from '../type/index';

const db = new Dexie('WordsDB');
db.version(3).stores({
  words: '++id,dictionaryId', // 使用dictionaryId代替sourceUrl
  meta: 'key',
  dictionaries: '++id,name,url,createdAt', // 新增字典表
  dataSources: 'url' // 保留数据源表用于兼容
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

    // 创建新的字典
    const dictionaryId = await createDictionary(url.split('/').pop() || 'New Dictionary', url);

    // 保存单词数据
    await db.table('words').where('dictionaryId').equals(dictionaryId).delete();
    await db.table('words').bulkAdd(words.map((word: Word) => ({ ...word, dictionaryId })));

    return { words, dictionaryId };
  } catch (error) {
    console.error('导入数据失败:', error);
    throw error;
  }
};

export const getWordsByDictionary = async (dictionaryId: number) => {
  return await db.table('words').where('dictionaryId').equals(dictionaryId).toArray();
};

// 兼容旧代码
export const getWordsBySource = async (url: string) => {
  const dictionary = await db.table('dictionaries').where('url').equals(url).first();
  if (dictionary) {
    return await getWordsByDictionary(dictionary.id);
  }
  return [];
};