const DB_NAME = 'AbayaAppDB';
const DB_VERSION = 1;

const STORES = [
  'ImagesStore',
  'ThemesStore',
  'UserDataStore',
  'FAQStore',
  'LikesStore',
  'AbayaItemsStore',
  'ReferralStore',
  'LeaderboardStore'
];

let db = null;

const initDB = () => {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => reject(`Database error: ${event.target.error}`);

    request.onsuccess = (event) => {
      db = event.target.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      STORES.forEach(storeName => {
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName, { keyPath: 'id', autoIncrement: true });
        }
      });
    };
  });
};

const ensureStoreExists = async (storeName) => {
  const database = await initDB();
  if (!database.objectStoreNames.contains(storeName)) {
    database.close();
    const newVersion = database.version + 1;
    db = null; // Reset the cached db to force a new connection
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, newVersion);
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        db.createObjectStore(storeName, { keyPath: 'id', autoIncrement: true });
      };
      request.onsuccess = (event) => {
        db = event.target.result;
        resolve(db);
      };
      request.onerror = (event) => reject(`Error creating object store: ${event.target.error}`);
    });
  }
  return database;
};

const performTransaction = async (storeName, mode, operation) => {
  const database = await ensureStoreExists(storeName);
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([storeName], mode);
    const store = transaction.objectStore(storeName);
    const request = operation(store);

    request.onerror = (event) => reject(`Error in ${storeName}: ${event.target.error}`);
    request.onsuccess = (event) => resolve(event.target.result);
  });
};

const getTheme = () => performTransaction('ThemesStore', 'readonly', (store) => store.get('currentTheme'))
  .then(result => result ? result.value : 'default');

const setTheme = (theme) => performTransaction('ThemesStore', 'readwrite', (store) => 
  store.put({ id: 'currentTheme', value: theme }));

const getUserData = () => performTransaction('UserDataStore', 'readonly', (store) => store.get('userData'))
  .then(result => result ? result.value : null);

const setUserData = (userData) => performTransaction('UserDataStore', 'readwrite', (store) => 
  store.put({ id: 'userData', value: userData }));

const getLikeStatus = (abayaId) => performTransaction('LikesStore', 'readonly', (store) => store.get(abayaId))
  .then(result => result ? result.status : false);

const setLikeStatus = (abayaId, status) => performTransaction('LikesStore', 'readwrite', (store) => 
  store.put({ id: abayaId, status }));

const getAbayaItems = async (page = 0, limit = 10, searchTerm = '') => {
  const items = await performTransaction('AbayaItemsStore', 'readonly', (store) => {
    return new Promise((resolve) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
    });
  });

  let filteredItems = searchTerm
    ? items.filter(item => item.brand.toLowerCase().includes(searchTerm.toLowerCase()))
    : items;
  const startIndex = page * limit;
  const endIndex = startIndex + limit;
  return {
    items: filteredItems.slice(startIndex, endIndex),
    nextCursor: endIndex < filteredItems.length ? page + 1 : null
  };
};

const getReferralCode = async (userId) => {
  const result = await performTransaction('ReferralStore', 'readonly', (store) => store.get(userId));
  if (result) return result.code;
  const newCode = `${userId.substring(0, 4).toUpperCase()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  await setReferralCode(userId, newCode);
  return newCode;
};

const setReferralCode = (userId, code) => performTransaction('ReferralStore', 'readwrite', (store) => 
  store.put({ id: userId, code }));

const getReferralRewards = async (userId) => {
  const userData = await performTransaction('UserDataStore', 'readonly', (store) => store.get(userId));
  return userData ? userData.rewards || 0 : 0;
};

const updateReferralRewards = async (userId, amount) => {
  const userData = await performTransaction('UserDataStore', 'readwrite', (store) => {
    return new Promise((resolve) => {
      const getRequest = store.get(userId);
      getRequest.onsuccess = () => {
        const data = getRequest.result || { id: userId, rewards: 0 };
        data.rewards += amount;
        const putRequest = store.put(data);
        putRequest.onsuccess = () => resolve(data.rewards);
      };
    });
  });
  return userData;
};

const getLeaderboard = async () => {
  const leaderboard = await performTransaction('LeaderboardStore', 'readonly', (store) => {
    return new Promise((resolve) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
    });
  });
  return leaderboard.sort((a, b) => b.points - a.points);
};

const updateLeaderboard = async (userId, points) => {
  await performTransaction('LeaderboardStore', 'readwrite', (store) => {
    return new Promise((resolve) => {
      const getRequest = store.get(userId);
      getRequest.onsuccess = () => {
        let userData = getRequest.result;
        if (userData) {
          userData.points += points;
        } else {
          userData = { id: userId, name: `مستخدم ${userId}`, referrals: 1, points };
        }
        const putRequest = store.put(userData);
        putRequest.onsuccess = () => resolve();
      };
    });
  });
};

export {
  initDB,
  getTheme,
  setTheme,
  getUserData,
  setUserData,
  getLikeStatus,
  setLikeStatus,
  getAbayaItems,
  getReferralCode,
  setReferralCode,
  getReferralRewards,
  updateReferralRewards,
  getLeaderboard,
  updateLeaderboard
};
