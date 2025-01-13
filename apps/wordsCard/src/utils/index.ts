import Dexie from 'dexie';
import type { Word } from '../type/index';

const db = new Dexie('WordsDB');
db.version(2).stores({
  words: '++id,sourceUrl', // 添加sourceUrl字段
  meta: 'key',
  dataSources: 'url' // 新增数据源表
});

export const saveWordsToIndexedDB = async (words: Word[]) => {
  await db.table('words').clear();
  await db.table('words').bulkAdd(words);
  await db.table('meta').put({ key: 'lastFetched', value: new Date().toISOString() });
};

export const getLastFetchedTime = async () => {
  const meta = await db.table('meta').get('lastFetched');
  return meta ? meta.value : null;
};

export const getWordsFromIndexedDB = async () => {
  return await db.table('words').toArray();
};

export const importWordsFromUrl = async (url: string) => {
  try {
    const response = await fetch(url);
    const words = await response.json();

    // 保存数据源信息
    await db.table('dataSources').put({ url, name: url.split('/').pop() });

    // 保存单词数据
    await db.table('words').where('sourceUrl').equals(url).delete();
    await db.table('words').bulkAdd(words.map((word: Word) => ({ ...word, sourceUrl: url })));

    return words;
  } catch (error) {
    console.error('导入数据失败:', error);
    throw error;
  }
};

export const getDataSources = async () => {
  return await db.table('dataSources').toArray();
};

export const getWordsBySource = async (url: string) => {
  return await db.table('words').where('sourceUrl').equals(url).toArray();
};

const CURRENT_INDEX_KEY = 'words-card-current-index';

export const saveCurrentIndex = (index: number) => {
  localStorage.setItem(CURRENT_INDEX_KEY, index.toString());
};

export const getCurrentIndex = (): number => {
  return Number.parseInt(localStorage.getItem(CURRENT_INDEX_KEY) || '0');
};

const THEME_KEY = 'words-card-theme';

export const saveTheme = (theme: 'light' | 'black') => {
  localStorage.setItem(THEME_KEY, theme);
};

export const getTheme = (): 'light' | 'black' => {
  return (localStorage.getItem(THEME_KEY) as 'light' | 'black') || 'light';
};
