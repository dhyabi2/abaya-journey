const DB_NAME = 'AbayaAppDB';
const DB_VERSION = 6; // Incrementing the version number

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
  { name: 'LanguageStore', keyPath: 'id' },
  { name: 'UserPreferencesStore', keyPath: 'id' },
  { name: 'MigrationStore', keyPath: 'id' } // New store for tracking migrations
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
      const oldVersion = event.oldVersion;
      const newVersion = event.newVersion;

      if (oldVersion < 6) {
        // Migration logic for version 6
        if (!db.objectStoreNames.contains('MigrationStore')) {
          db.createObjectStore('MigrationStore', { keyPath: 'id' });
        }
        // Add any other migration logic for version 6 here
      }

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

      // Record the migration
      const migrationStore = event.target.transaction.objectStore('MigrationStore');
      migrationStore.add({ id: newVersion, timestamp: new Date().toISOString() });
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

const getUserPreferences = async () => {
  try {
    const result = await performTransaction('UserPreferencesStore', 'readonly', (store) => store.get('preferences'));
    return result ? result.value : {};
  } catch (error) {
    handleDBError(error, 'getUserPreferences');
    return {};
  }
};

const setUserPreferences = async (preferences) => {
  try {
    await performTransaction('UserPreferencesStore', 'readwrite', (store) => 
      store.put({ id: 'preferences', value: preferences }));
  } catch (error) {
    handleDBError(error, 'setUserPreferences');
  }
};

const preloadData = async () => {
  try {
    const abayaItems = [
      { id: 1, image: '/images/abaya1.jpg', brand: 'Elegant Abayas', price: 299.99, date: '2023-03-15' },
      { id: 2, image: '/images/abaya2.jpg', brand: 'Modern Modest', price: 349.99, date: '2023-03-16' },
      { id: 3, image: '/images/abaya3.jpg', brand: 'Chic Covers', price: 279.99, date: '2023-03-17' },
      { id: 4, image: '/images/abaya4.jpg', brand: 'Stylish Wraps', price: 399.99, date: '2023-03-18' },
      { id: 5, image: '/images/abaya5.jpg', brand: 'Graceful Gowns', price: 329.99, date: '2023-03-19' },
    ];

    const leaderboardData = [
      { id: 1, name: 'مستخدم 1', referrals: 10, points: 500 },
      { id: 2, name: 'مستخدم 2', referrals: 8, points: 400 },
      { id: 3, name: 'مستخدم 3', referrals: 6, points: 300 },
      { id: 4, name: 'مستخدم 4', referrals: 4, points: 200 },
      { id: 5, name: 'مستخدم 5', referrals: 2, points: 100 },
    ];

    const faqData = [
      { id: 1, question: 'كيف يمكنني تتبع طلبي؟', answer: 'يمكنك تتبع طلبك من خلال الضغط على "تتبع الطلب" في صفحة حسابك.', category: 'الطلبات' },
      { id: 2, question: 'ما هي سياسة الإرجاع؟', answer: 'نقبل الإرجاع خلال 30 يومًا من تاريخ الاستلام للمنتجات غير المستخدمة.', category: 'الإرجاع والاستبدال' },
      { id: 3, question: 'هل تقدمون الشحن الدولي؟', answer: 'نعم، نقدم الشحن الدولي لمعظم الدول. يمكنك التحقق من تفاصيل الشحن أثناء عملية الدفع.', category: 'الشحن' },
    ];

    await performTransaction('AbayaItemsStore', 'readwrite', (store) => {
      abayaItems.forEach(item => store.put(item));
    });

    await performTransaction('LeaderboardStore', 'readwrite', (store) => {
      leaderboardData.forEach(item => store.put(item));
    });

    await performTransaction('FAQStore', 'readwrite', (store) => {
      faqData.forEach(item => store.put(item));
    });

    console.log('Data preloaded successfully');
  } catch (error) {
    handleDBError(error, 'preloadData');
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
  setLanguage,
  getUserPreferences,
  setUserPreferences,
  preloadData
};
