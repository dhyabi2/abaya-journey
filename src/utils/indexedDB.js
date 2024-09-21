const DB_NAME = 'AbayaAppDB';
const DB_VERSION = 13;

const STORES = [
  { name: 'AbayaItemsStore', keyPath: 'id', indexes: [{ name: 'brand', keyPath: 'brand' }] },
  { name: 'FAQStore', keyPath: 'id', indexes: [{ name: 'category', keyPath: 'category' }] },
  { name: 'ImagesStore', keyPath: 'id', indexes: [{ name: 'timestamp', keyPath: 'timestamp' }] },
  { name: 'LanguageStore', keyPath: 'id' },
  { name: 'LeaderboardStore', keyPath: 'id', indexes: [{ name: 'points', keyPath: 'points' }] },
  { name: 'LikesStore', keyPath: 'id' },
  { name: 'MigrationStore', keyPath: 'id' },
  { name: 'ReferralStore', keyPath: 'id' },
  { name: 'ThemesStore', keyPath: 'id' },
  { name: 'UUIDStore', keyPath: 'id' },
  { name: 'UserDataStore', keyPath: 'id' },
  { name: 'UserPreferencesStore', keyPath: 'id' }
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
              if (!objectStore.indexNames.contains(index.name)) {
                objectStore.createIndex(index.name, index.keyPath, { unique: false });
              }
            });
          }
        }
      });

      const migrationStore = event.target.transaction.objectStore('MigrationStore');
      migrationStore.add({ id: DB_VERSION, timestamp: new Date().toISOString() });
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
    console.error('Error in getTheme:', error);
    return 'default';
  }
};

const setTheme = async (theme) => {
  try {
    await performTransaction('ThemesStore', 'readwrite', (store) => 
      store.put({ id: 'currentTheme', value: theme }));
  } catch (error) {
    console.error('Error in setTheme:', error);
  }
};

const getUserData = async () => {
  try {
    const result = await performTransaction('UserDataStore', 'readonly', (store) => store.get('userData'));
    return result ? result.value : null;
  } catch (error) {
    console.error('Error in getUserData:', error);
    return null;
  }
};

const setUserData = async (userData) => {
  try {
    await performTransaction('UserDataStore', 'readwrite', (store) => 
      store.put({ id: 'userData', value: userData }));
  } catch (error) {
    console.error('Error in setUserData:', error);
  }
};

const getLikeStatus = async (abayaId) => {
  try {
    const result = await performTransaction('LikesStore', 'readonly', (store) => store.get(abayaId));
    return result ? result.status : false;
  } catch (error) {
    console.error('Error in getLikeStatus:', error);
    return false;
  }
};

const setLikeStatus = async (abayaId, status) => {
  try {
    await performTransaction('LikesStore', 'readwrite', (store) => 
      store.put({ id: abayaId, status }));
  } catch (error) {
    console.error('Error in setLikeStatus:', error);
  }
};

const getAbayaItems = async (page = 0, limit = 10, searchTerm = '') => {
  try {
    return performTransaction('AbayaItemsStore', 'readonly', (store) => {
      return new Promise((resolve) => {
        const request = store.getAll();
        request.onsuccess = () => {
          const allItems = request.result;
          const filteredItems = searchTerm
            ? allItems.filter(item => item.brand.toLowerCase().includes(searchTerm.toLowerCase()))
            : allItems;
          const paginatedItems = filteredItems.slice(page * limit, (page + 1) * limit);
          resolve({
            items: paginatedItems,
            nextCursor: filteredItems.length > (page + 1) * limit ? page + 1 : null
          });
        };
      });
    });
  } catch (error) {
    console.error('Error in getAbayaItems:', error);
    return { items: [], nextCursor: null };
  }
};

const getReferralCode = async () => {
  try {
    const result = await performTransaction('ReferralStore', 'readonly', (store) => store.get('referralCode'));
    return result ? result.code : null;
  } catch (error) {
    console.error('Error in getReferralCode:', error);
    return null;
  }
};

const setReferralCode = async (code) => {
  try {
    await performTransaction('ReferralStore', 'readwrite', (store) => 
      store.put({ id: 'referralCode', code }));
  } catch (error) {
    console.error('Error in setReferralCode:', error);
  }
};

const getReferralRewards = async () => {
  try {
    const result = await performTransaction('UserDataStore', 'readonly', (store) => store.get('userData'));
    return result && result.value ? result.value.rewards || 0 : 0;
  } catch (error) {
    console.error('Error in getReferralRewards:', error);
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
    console.error('Error in updateReferralRewards:', error);
    return 0;
  }
};

const getLeaderboard = async () => {
  try {
    return performTransaction('LeaderboardStore', 'readonly', (store) => {
      return new Promise((resolve) => {
        const request = store.getAll();
        request.onsuccess = () => {
          const results = request.result.sort((a, b) => b.points - a.points).slice(0, 10);
          resolve(results);
        };
      });
    });
  } catch (error) {
    console.error('Error in getLeaderboard:', error);
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
    console.error('Error in updateLeaderboard:', error);
  }
};

const getAllImages = async () => {
  try {
    return performTransaction('ImagesStore', 'readonly', (store) => {
      return new Promise((resolve) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
      });
    });
  } catch (error) {
    console.error('Error in getAllImages:', error);
    return [];
  }
};

const getUUID = async () => {
  try {
    const result = await performTransaction('UUIDStore', 'readonly', (store) => store.get('uuid'));
    return result ? result.value : null;
  } catch (error) {
    console.error('Error in getUUID:', error);
    return null;
  }
};

const setUUID = async (uuid) => {
  try {
    await performTransaction('UUIDStore', 'readwrite', (store) => 
      store.put({ id: 'uuid', value: uuid }));
  } catch (error) {
    console.error('Error in setUUID:', error);
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
    console.error('Error in getFAQs:', error);
    return [];
  }
};

const getLanguage = async () => {
  try {
    const result = await performTransaction('LanguageStore', 'readonly', (store) => store.get('currentLanguage'));
    return result ? result.value : 'ar';
  } catch (error) {
    console.error('Error in getLanguage:', error);
    return 'ar'; // Return default language instead of throwing an error
  }
};

const setLanguage = async (language) => {
  try {
    await performTransaction('LanguageStore', 'readwrite', (store) => 
      store.put({ id: 'currentLanguage', value: language }));
  } catch (error) {
    console.error('Error in setLanguage:', error);
    // Don't throw an error, just log it
  }
};

const getUserPreferences = async () => {
  try {
    const result = await performTransaction('UserPreferencesStore', 'readonly', (store) => store.get('preferences'));
    return result ? result.value : {};
  } catch (error) {
    console.error('Error in getUserPreferences:', error);
    return {};
  }
};

const setUserPreferences = async (preferences) => {
  try {
    await performTransaction('UserPreferencesStore', 'readwrite', (store) => 
      store.put({ id: 'preferences', value: preferences }));
  } catch (error) {
    console.error('Error in setUserPreferences:', error);
  }
};

const storeFAQs = async (faqs) => {
  try {
    await performTransaction('FAQStore', 'readwrite', (store) => {
      faqs.forEach(faq => {
        store.put(faq);
      });
    });
    console.log('FAQs stored successfully');
  } catch (error) {
    console.error('Error in storeFAQs:', error);
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
  getAllImages,
  getUUID,
  setUUID,
  getFAQs,
  getLanguage,
  setLanguage,
  getUserPreferences,
  setUserPreferences,
  storeFAQs
};
