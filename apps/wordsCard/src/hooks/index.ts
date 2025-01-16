import { useEffect, useState } from 'react';

const CURRENT_INDEX_KEY = 'words-card-current-index';
const THEME_KEY = 'words-card-theme';

export function useCurrentIndex(initialValue = 0) {
  const [currentIndex, setCurrentIndex] = useState(() => {
    const storedValue = localStorage.getItem(CURRENT_INDEX_KEY);
    return storedValue ? Number.parseInt(storedValue) : initialValue;
  });

  useEffect(() => {
    localStorage.setItem(CURRENT_INDEX_KEY, currentIndex.toString());
  }, [currentIndex]);

  return [currentIndex, setCurrentIndex] as const;
}

/**
 * 自定义钩子用于管理主题模式
 * 
 * 该钩子初始化时会检查本地存储中是否已保存有主题设置如果已保存，则使用保存的主题
 * 否则将使用传入的初始值默认情况下，初始值为'light'主题
 * 
 * @param initialValue - 初始化主题模式，可以是'light'或'black'默认为'light'
 * @returns 返回当前主题和设置主题的函数
 */
export function useTheme(initialValue: 'light' | 'black' = 'light') {
  // 使用状态管理主题，初始化时从本地存储或使用初始值
  const [theme, setTheme] = useState(() => {
    const storedTheme = localStorage.getItem(THEME_KEY);
    return (storedTheme as 'light' | 'black') || initialValue;
  });

  // 使用副作用保存主题到本地存储，并设置HTML根元素的数据属性
  useEffect(() => {
    localStorage.setItem(THEME_KEY, theme);
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // 返回当前主题和设置主题的函数
  return [theme, setTheme] as const;
}