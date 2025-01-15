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