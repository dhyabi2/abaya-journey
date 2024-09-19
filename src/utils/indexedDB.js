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
      db.createObjectStore('LikesStore', { keyPath: 'id' });
    };
  });
};

export const getTheme = async () => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['ThemesStore'], 'readonly');
    const store = transaction.objectStore('ThemesStore');
    const request = store.get('currentTheme');

    request.onerror = (event) => reject(`Error fetching theme: ${event.target.error}`);
    request.onsuccess = (event) => resolve(event.target.result ? event.target.result.value : 'default');
  });
};

export const setTheme = async (theme) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['ThemesStore'], 'readwrite');
    const store = transaction.objectStore('ThemesStore');
    const request = store.put({ id: 'currentTheme', value: theme });

    request.onerror = (event) => reject(`Error setting theme: ${event.target.error}`);
    request.onsuccess = () => resolve();
  });
};

export const getUserData = async () => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['UserDataStore'], 'readonly');
    const store = transaction.objectStore('UserDataStore');
    const request = store.get('userData');

    request.onerror = (event) => reject(`Error fetching user data: ${event.target.error}`);
    request.onsuccess = (event) => resolve(event.target.result ? event.target.result.value : null);
  });
};

export const setUserData = async (userData) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['UserDataStore'], 'readwrite');
    const store = transaction.objectStore('UserDataStore');
    const request = store.put({ id: 'userData', value: userData });

    request.onerror = (event) => reject(`Error setting user data: ${event.target.error}`);
    request.onsuccess = () => resolve();
  });
};

export const getLikeStatus = async (abayaId) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['LikesStore'], 'readonly');
    const store = transaction.objectStore('LikesStore');
    const request = store.get(abayaId);

    request.onerror = (event) => reject(`Error fetching like status: ${event.target.error}`);
    request.onsuccess = (event) => resolve(event.target.result ? event.target.result.status : false);
  });
};

export const setLikeStatus = async (abayaId, status) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['LikesStore'], 'readwrite');
    const store = transaction.objectStore('LikesStore');
    const request = store.put({ id: abayaId, status });

    request.onerror = (event) => reject(`Error setting like status: ${event.target.error}`);
    request.onsuccess = () => resolve();
  });
};
