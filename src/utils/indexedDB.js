const DB_NAME = 'AbayaAppDB';
const DB_VERSION = 1;

export const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => reject(`Database error: ${event.target.error}`);

    request.onsuccess = (event) => resolve(event.target.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      db.createObjectStore('ImagesStore', { keyPath: 'id' });
      db.createObjectStore('ThemesStore', { keyPath: 'id' });
      db.createObjectStore('UserDataStore', { keyPath: 'id' });
      db.createObjectStore('FAQStore', { keyPath: 'id' });
    };
  });
};

export const getTheme = async () => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['UserDataStore'], 'readonly');
    const store = transaction.objectStore('UserDataStore');
    const request = store.get('theme');

    request.onerror = (event) => reject(`Error fetching theme: ${event.target.error}`);
    request.onsuccess = (event) => resolve(event.target.result);
  });
};

export const getUserData = async () => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['UserDataStore'], 'readonly');
    const store = transaction.objectStore('UserDataStore');
    const request = store.get('userData');

    request.onerror = (event) => reject(`Error fetching user data: ${event.target.error}`);
    request.onsuccess = (event) => resolve(event.target.result);
  });
};

// Add more CRUD operations for other stores as needed