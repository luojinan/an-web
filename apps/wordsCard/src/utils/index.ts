import Dexie from 'dexie';
import type { Word } from '../type/index';

const db = new Dexie('WordsDB');
db.version(1).stores({
  words: '++id',
  meta: 'key'
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

const CURRENT_INDEX_KEY = 'words-card-current-index';

export const saveCurrentIndex = (index: number) => {
  localStorage.setItem(CURRENT_INDEX_KEY, index.toString());
};

export const getCurrentIndex = (): number => {
  return parseInt(localStorage.getItem(CURRENT_INDEX_KEY) || '0');
};

const THEME_KEY = 'words-card-theme';

export const saveTheme = (theme: 'light' | 'black') => {
  localStorage.setItem(THEME_KEY, theme);
};

export const getTheme = (): 'light' | 'black' => {
  return (localStorage.getItem(THEME_KEY) as 'light' | 'black') || 'light';
};
