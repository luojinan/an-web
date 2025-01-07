import type { ProcessedIBooksData } from "./parseData";

// utils/indexdb.ts
const DB_NAME = "booksDB";
const STORE_NAME = "books";

export const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
  });
};

export const saveToIndexDB = async (data: ProcessedIBooksData) => {
  try {
    const db = (await initDB()) as IDBDatabase;
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    // Save each book along with its annotations
    data.books.forEach((book) => {
      const bookWithAnnotations = {
        ...book,
        annotations: data.annotationsByBookId[book.id] || [],
      };
      store.put(bookWithAnnotations);
    });

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve(true);
      transaction.onerror = () => reject(transaction.error);
    });
  } catch (error) {
    console.error("Error saving to IndexDB:", error);
    throw error;
  }
};

export const getBooks = async () => {
  try {
    const db = (await initDB()) as IDBDatabase;
    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("Error getting books from IndexDB:", error);
    throw error;
  }
};
