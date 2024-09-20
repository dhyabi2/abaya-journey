const DB_NAME = 'AbayaAppDB';
const DB_VERSION = 2;

const STORES = [
  { name: 'ImagesStore', keyPath: 'id', indexes: [{ name: 'timestamp', keyPath: 'timestamp' }] },
  { name: 'ThemesStore', keyPath: 'id' },
  { name: 'UserDataStore', keyPath: 'id' },
  { name: 'FAQStore', keyPath: 'id', indexes: [{ name: 'category', keyPath: 'category' }] },
  { name: 'LikesStore', keyPath: 'id' },
  { name: 'AbayaItemsStore', keyPath: 'id', indexes: [{ name: 'brand', keyPath: 'brand' }] },
  { name: 'ReferralStore', keyPath: 'id' },
  { name: 'LeaderboardStore', keyPath: 'id', indexes: [{ name: 'points', keyPath: 'points' }] },
  { name: 'UUIDStore', keyPath: 'id' }
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
      STORES.forEach(store => {
        if (!db.objectStoreNames.contains(store.name)) {
          const objectStore = db.createObjectStore(store.name, { keyPath: store.keyPath, autoIncrement: true });
          if (store.indexes) {
            store.indexes.forEach(index => {
              objectStore.createIndex(index.name, index.keyPath, { unique: false });
            });
          }
        }
      });
    };
  });
};

const performTransaction = async (storeName, mode, operation) => {
  const database = await initDB();
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
  return performTransaction('AbayaItemsStore', 'readonly', (store) => {
    return new Promise((resolve) => {
      const index = store.index('brand');
      const range = searchTerm ? IDBKeyRange.bound(searchTerm, searchTerm + '\uffff') : null;
      const request = index.getAll(range, limit);
      request.onsuccess = () => {
        const items = request.result;
        resolve({
          items: items.slice(page * limit, (page + 1) * limit),
          nextCursor: items.length > (page + 1) * limit ? page + 1 : null
        });
      };
    });
  });
};

const getReferralCode = () => performTransaction('ReferralStore', 'readonly', (store) => store.get('referralCode'))
  .then(result => result ? result.code : null);

const setReferralCode = (code) => performTransaction('ReferralStore', 'readwrite', (store) => 
  store.put({ id: 'referralCode', code }));

const getReferralRewards = () => performTransaction('UserDataStore', 'readonly', (store) => store.get('userData'))
  .then(result => result && result.value ? result.value.rewards || 0 : 0);

const updateReferralRewards = async (amount) => {
  return performTransaction('UserDataStore', 'readwrite', (store) => {
    return new Promise((resolve) => {
      const getRequest = store.get('userData');
      getRequest.onsuccess = () => {
        const data = getRequest.result || { id: 'userData', value: { rewards: 0 } };
        data.value.rewards += amount;
        const putRequest = store.put(data);
        putRequest.onsuccess = () => resolve(data.value.rewards);
      };
    });
  });
};

const getLeaderboard = () => performTransaction('LeaderboardStore', 'readonly', (store) => {
  return new Promise((resolve) => {
    const index = store.index('points');
    const request = index.openCursor(null, 'prev');
    const results = [];
    request.onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor) {
        results.push(cursor.value);
        if (results.length < 10) {
          cursor.continue();
        } else {
          resolve(results);
        }
      } else {
        resolve(results);
      }
    };
  });
});

const updateLeaderboard = (userId, points) => performTransaction('LeaderboardStore', 'readwrite', (store) => {
  return new Promise((resolve) => {
    const getRequest = store.get(userId);
    getRequest.onsuccess = () => {
      let userData = getRequest.result || { id: userId, name: `مستخدم ${userId}`, referrals: 0, points: 0 };
      userData.points += points;
      userData.referrals += 1;
      store.put(userData);
      resolve();
    };
  });
});

const saveImage = (imageData) => performTransaction('ImagesStore', 'readwrite', (store) => 
  store.add({ data: imageData, timestamp: Date.now() }));

const getImage = (id) => performTransaction('ImagesStore', 'readonly', (store) => store.get(id))
  .then(result => result ? result.data : null);

const getAllImages = () => performTransaction('ImagesStore', 'readonly', (store) => {
  return new Promise((resolve) => {
    const index = store.index('timestamp');
    const request = index.openCursor(null, 'prev');
    const results = [];
    request.onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor) {
        results.push(cursor.value);
        cursor.continue();
      } else {
        resolve(results);
      }
    };
  });
});

const getUUID = () => performTransaction('UUIDStore', 'readonly', (store) => store.get('uuid'))
  .then(result => result ? result.value : null);

const setUUID = (uuid) => performTransaction('UUIDStore', 'readwrite', (store) => 
  store.put({ id: 'uuid', value: uuid }));

const getFAQs = () => performTransaction('FAQStore', 'readonly', (store) => {
  return new Promise((resolve) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
  });
});

const storeFAQs = (faqs) => performTransaction('FAQStore', 'readwrite', (store) => {
  return new Promise((resolve) => {
    store.clear();
    faqs.forEach(faq => store.add(faq));
    resolve();
  });
});

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
  updateLeaderboard,
  saveImage,
  getImage,
  getAllImages,
  getUUID,
  setUUID,
  getFAQs,
  storeFAQs
};
