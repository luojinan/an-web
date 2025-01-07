// utils/storage.ts
export const saveToLocalStorage = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.error("Error saving to localStorage:", error);
  }
};

export const getFromLocalStorage = (key: string) => {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.error("Error getting from localStorage:", error);
    return null;
  }
};
