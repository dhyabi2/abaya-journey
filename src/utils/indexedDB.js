const DB_NAME = 'AbayaAppDB';
const DB_VERSION = 3;

const STORES = [
  { name: 'ImagesStore', keyPath: 'id', indexes: [{ name: 'timestamp', keyPath: 'timestamp' }] },
  { name: 'ThemesStore', keyPath: 'id' },
  { name: 'UserDataStore', keyPath: 'id' },
  { name: 'FAQStore', keyPath: 'id', indexes: [{ name: 'category', keyPath: 'category' }] },
  { name: 'LikesStore', keyPath: 'id' },
  { name: 'AbayaItemsStore', keyPath: 'id', indexes: [{ name: 'brand', keyPath: 'brand' }] },
  { name: 'ReferralStore', keyPath: 'id' },
  { name: 'LeaderboardStore', keyPath: 'id', indexes: [{ name: 'points', keyPath: 'points' }] },
  { name: 'UUIDStore', keyPath: 'id' },
  { name: 'LanguageStore', keyPath: 'id' }
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

const handleDBError = (error, operation) => {
  console.error(`Error during ${operation}:`, error);
  throw new Error(`Database operation failed: ${operation}`);
};

const performTransaction = async (storeName, mode, operation) => {
  try {
    const database = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction([storeName], mode);
      const store = transaction.objectStore(storeName);
      const request = operation(store);

      request.onerror = (event) => reject(`Error in ${storeName}: ${event.target.error}`);
      request.onsuccess = (event) => resolve(event.target.result);
    });
  } catch (error) {
    handleDBError(error, `${mode} operation on ${storeName}`);
  }
};

const getTheme = async () => {
  try {
    const result = await performTransaction('ThemesStore', 'readonly', (store) => store.get('currentTheme'));
    return result ? result.value : 'default';
  } catch (error) {
    handleDBError(error, 'getTheme');
    return 'default';
  }
};

const setTheme = async (theme) => {
  try {
    await performTransaction('ThemesStore', 'readwrite', (store) => 
      store.put({ id: 'currentTheme', value: theme }));
  } catch (error) {
    handleDBError(error, 'setTheme');
  }
};

const getUserData = async () => {
  try {
    const result = await performTransaction('UserDataStore', 'readonly', (store) => store.get('userData'));
    return result ? result.value : null;
  } catch (error) {
    handleDBError(error, 'getUserData');
    return null;
  }
};

const setUserData = async (userData) => {
  try {
    await performTransaction('UserDataStore', 'readwrite', (store) => 
      store.put({ id: 'userData', value: userData }));
  } catch (error) {
    handleDBError(error, 'setUserData');
  }
};

const getLikeStatus = async (abayaId) => {
  try {
    const result = await performTransaction('LikesStore', 'readonly', (store) => store.get(abayaId));
    return result ? result.status : false;
  } catch (error) {
    handleDBError(error, 'getLikeStatus');
    return false;
  }
};

const setLikeStatus = async (abayaId, status) => {
  try {
    await performTransaction('LikesStore', 'readwrite', (store) => 
      store.put({ id: abayaId, status }));
  } catch (error) {
    handleDBError(error, 'setLikeStatus');
  }
};

const getAbayaItems = async (page = 0, limit = 10, searchTerm = '') => {
  try {
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
  } catch (error) {
    handleDBError(error, 'getAbayaItems');
    return { items: [], nextCursor: null };
  }
};

const getReferralCode = async () => {
  try {
    const result = await performTransaction('ReferralStore', 'readonly', (store) => store.get('referralCode'));
    return result ? result.code : null;
  } catch (error) {
    handleDBError(error, 'getReferralCode');
    return null;
  }
};

const setReferralCode = async (code) => {
  try {
    await performTransaction('ReferralStore', 'readwrite', (store) => 
      store.put({ id: 'referralCode', code }));
  } catch (error) {
    handleDBError(error, 'setReferralCode');
  }
};

const getReferralRewards = async () => {
  try {
    const result = await performTransaction('UserDataStore', 'readonly', (store) => store.get('userData'));
    return result && result.value ? result.value.rewards || 0 : 0;
  } catch (error) {
    handleDBError(error, 'getReferralRewards');
    return 0;
  }
};

const updateReferralRewards = async (amount) => {
  try {
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
  } catch (error) {
    handleDBError(error, 'updateReferralRewards');
    return 0;
  }
};

const getLeaderboard = async () => {
  try {
    return performTransaction('LeaderboardStore', 'readonly', (store) => {
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
  } catch (error) {
    handleDBError(error, 'getLeaderboard');
    return [];
  }
};

const updateLeaderboard = async (userId, points) => {
  try {
    await performTransaction('LeaderboardStore', 'readwrite', (store) => {
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
  } catch (error) {
    handleDBError(error, 'updateLeaderboard');
  }
};

const saveImage = async (imageData) => {
  try {
    await performTransaction('ImagesStore', 'readwrite', (store) => 
      store.add({ data: imageData, timestamp: Date.now() }));
  } catch (error) {
    handleDBError(error, 'saveImage');
  }
};

const getImage = async (id) => {
  try {
    const result = await performTransaction('ImagesStore', 'readonly', (store) => store.get(id));
    return result ? result.data : null;
  } catch (error) {
    handleDBError(error, 'getImage');
    return null;
  }
};

const getAllImages = async () => {
  try {
    return performTransaction('ImagesStore', 'readonly', (store) => {
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
  } catch (error) {
    handleDBError(error, 'getAllImages');
    return [];
  }
};

const getUUID = async () => {
  try {
    const result = await performTransaction('UUIDStore', 'readonly', (store) => store.get('uuid'));
    return result ? result.value : null;
  } catch (error) {
    handleDBError(error, 'getUUID');
    return null;
  }
};

const setUUID = async (uuid) => {
  try {
    await performTransaction('UUIDStore', 'readwrite', (store) => 
      store.put({ id: 'uuid', value: uuid }));
  } catch (error) {
    handleDBError(error, 'setUUID');
  }
};

const getFAQs = async () => {
  try {
    return performTransaction('FAQStore', 'readonly', (store) => {
      return new Promise((resolve) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
      });
    });
  } catch (error) {
    handleDBError(error, 'getFAQs');
    return [];
  }
};

const storeFAQs = async (faqs) => {
  try {
    await performTransaction('FAQStore', 'readwrite', (store) => {
      return new Promise((resolve) => {
        store.clear();
        faqs.forEach(faq => store.add(faq));
        resolve();
      });
    });
  } catch (error) {
    handleDBError(error, 'storeFAQs');
  }
};

const getLanguage = async () => {
  try {
    const result = await performTransaction('LanguageStore', 'readonly', (store) => store.get('currentLanguage'));
    return result ? result.value : 'ar';
  } catch (error) {
    handleDBError(error, 'getLanguage');
    return 'ar';
  }
};

const setLanguage = async (language) => {
  try {
    await performTransaction('LanguageStore', 'readwrite', (store) => 
      store.put({ id: 'currentLanguage', value: language }));
  } catch (error) {
    handleDBError(error, 'setLanguage');
  }
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
  updateLeaderboard,
  saveImage,
  getImage,
  getAllImages,
  getUUID,
  setUUID,
  getFAQs,
  storeFAQs,
  getLanguage,
  setLanguage
};
