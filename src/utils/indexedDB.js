const DB_NAME = 'AbayaAppDB';
const DB_VERSION = 12;

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
  { name: 'MigrationStore', keyPath: 'id' }
];

let db = null;

function initDB() {
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
}

function handleDBError(error, operation) {
  console.error(`Error during ${operation}:`, error);
  throw new Error(`Database operation failed: ${operation}`);
}

function performTransaction(storeName, mode, operation) {
  return initDB().then(database => {
    return new Promise((resolve, reject) => {
      const transaction = database.transaction([storeName], mode);
      const store = transaction.objectStore(storeName);
      const request = operation(store);

      request.onerror = (event) => reject(`Error in ${storeName}: ${event.target.error}`);
      request.onsuccess = (event) => resolve(event.target.result);
    });
  }).catch(error => {
    handleDBError(error, `${mode} operation on ${storeName}`);
  });
}

function getTheme() {
  return performTransaction('ThemesStore', 'readonly', (store) => store.get('currentTheme'))
    .then(result => result ? result.value : 'default')
    .catch(error => {
      handleDBError(error, 'getTheme');
      return 'default';
    });
}

function setTheme(theme) {
  return performTransaction('ThemesStore', 'readwrite', (store) => 
    store.put({ id: 'currentTheme', value: theme }))
    .catch(error => handleDBError(error, 'setTheme'));
}

function getUserData() {
  return performTransaction('UserDataStore', 'readonly', (store) => store.get('userData'))
    .then(result => result ? result.value : null)
    .catch(error => {
      handleDBError(error, 'getUserData');
      return null;
    });
}

function setUserData(userData) {
  return performTransaction('UserDataStore', 'readwrite', (store) => 
    store.put({ id: 'userData', value: userData }))
    .catch(error => handleDBError(error, 'setUserData'));
}

function getLikeStatus(abayaId) {
  return performTransaction('LikesStore', 'readonly', (store) => store.get(abayaId))
    .then(result => result ? result.status : false)
    .catch(error => {
      handleDBError(error, 'getLikeStatus');
      return false;
    });
}

function setLikeStatus(abayaId, status) {
  return performTransaction('LikesStore', 'readwrite', (store) => 
    store.put({ id: abayaId, status }))
    .catch(error => handleDBError(error, 'setLikeStatus'));
}

function getAbayaItems(page = 0, limit = 10, searchTerm = '') {
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
  }).catch(error => {
    handleDBError(error, 'getAbayaItems');
    return { items: [], nextCursor: null };
  });
}

function getReferralCode() {
  return performTransaction('ReferralStore', 'readonly', (store) => store.get('referralCode'))
    .then(result => result ? result.code : null)
    .catch(error => {
      handleDBError(error, 'getReferralCode');
      return null;
    });
}

function setReferralCode(code) {
  return performTransaction('ReferralStore', 'readwrite', (store) => 
    store.put({ id: 'referralCode', code }))
    .catch(error => handleDBError(error, 'setReferralCode'));
}

function getReferralRewards() {
  return performTransaction('UserDataStore', 'readonly', (store) => store.get('userData'))
    .then(result => result && result.value ? result.value.rewards || 0 : 0)
    .catch(error => {
      handleDBError(error, 'getReferralRewards');
      return 0;
    });
}

function updateReferralRewards(amount) {
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
  }).catch(error => {
    handleDBError(error, 'updateReferralRewards');
    return 0;
  });
}

function getLeaderboard() {
  return performTransaction('LeaderboardStore', 'readonly', (store) => {
    return new Promise((resolve) => {
      const request = store.getAll();
      request.onsuccess = () => {
        const results = request.result.sort((a, b) => b.points - a.points).slice(0, 10);
        resolve(results);
      };
    });
  }).catch(error => {
    handleDBError(error, 'getLeaderboard');
    return [];
  });
}

function updateLeaderboard(userId, points) {
  return performTransaction('LeaderboardStore', 'readwrite', (store) => {
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
  }).catch(error => handleDBError(error, 'updateLeaderboard'));
}

function saveImage(imageData) {
  return performTransaction('ImagesStore', 'readwrite', (store) => 
    store.add({ data: imageData, timestamp: Date.now() }))
    .catch(error => handleDBError(error, 'saveImage'));
}

function getImage(id) {
  return performTransaction('ImagesStore', 'readonly', (store) => store.get(id))
    .then(result => result ? result.data : null)
    .catch(error => {
      handleDBError(error, 'getImage');
      return null;
    });
}

function getAllImages() {
  return performTransaction('ImagesStore', 'readonly', (store) => {
    return new Promise((resolve) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
    });
  }).catch(error => {
    handleDBError(error, 'getAllImages');
    return [];
  });
}

function getUUID() {
  return performTransaction('UUIDStore', 'readonly', (store) => store.get('uuid'))
    .then(result => result ? result.value : null)
    .catch(error => {
      handleDBError(error, 'getUUID');
      return null;
    });
}

function setUUID(uuid) {
  return performTransaction('UUIDStore', 'readwrite', (store) => 
    store.put({ id: 'uuid', value: uuid }))
    .catch(error => handleDBError(error, 'setUUID'));
}

function getFAQs() {
  return performTransaction('FAQStore', 'readonly', (store) => {
    return new Promise((resolve) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
    });
  }).catch(error => {
    handleDBError(error, 'getFAQs');
    return [];
  });
}

function storeFAQs(faqs) {
  return performTransaction('FAQStore', 'readwrite', (store) => {
    return new Promise((resolve) => {
      store.clear();
      faqs.forEach(faq => store.add(faq));
      resolve();
    });
  }).catch(error => handleDBError(error, 'storeFAQs'));
}

function getLanguage() {
  return performTransaction('LanguageStore', 'readonly', (store) => store.get('currentLanguage'))
    .then(result => result ? result.value : 'ar')
    .catch(error => {
      handleDBError(error, 'getLanguage');
      return 'ar';
    });
}

function setLanguage(language) {
  return performTransaction('LanguageStore', 'readwrite', (store) => 
    store.put({ id: 'currentLanguage', value: language }))
    .catch(error => handleDBError(error, 'setLanguage'));
}

function getUserPreferences() {
  return performTransaction('UserPreferencesStore', 'readonly', (store) => store.get('preferences'))
    .then(result => result ? result.value : {})
    .catch(error => {
      handleDBError(error, 'getUserPreferences');
      return {};
    });
}

function setUserPreferences(preferences) {
  return performTransaction('UserPreferencesStore', 'readwrite', (store) => 
    store.put({ id: 'preferences', value: preferences }))
    .catch(error => handleDBError(error, 'setUserPreferences'));
}

function preloadData() {
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

  const likeData = [
    { id: 1, status: true },
    { id: 2, status: false },
    { id: 3, status: true },
    { id: 4, status: false },
    { id: 5, status: true },
  ];

  const imageData = [
    { id: 1, data: 'base64_encoded_image_data_1', timestamp: Date.now() },
    { id: 2, data: 'base64_encoded_image_data_2', timestamp: Date.now() },
    { id: 3, data: 'base64_encoded_image_data_3', timestamp: Date.now() },
    { id: 4, data: 'base64_encoded_image_data_4', timestamp: Date.now() },
    { id: 5, data: 'base64_encoded_image_data_5', timestamp: Date.now() },
  ];

  return Promise.all([
    performTransaction('AbayaItemsStore', 'readwrite', (store) => {
      abayaItems.forEach(item => store.put(item));
    }),
    performTransaction('LeaderboardStore', 'readwrite', (store) => {
      leaderboardData.forEach(item => store.put(item));
    }),
    performTransaction('FAQStore', 'readwrite', (store) => {
      faqData.forEach(item => store.put(item));
    }),
    performTransaction('LikesStore', 'readwrite', (store) => {
      likeData.forEach(item => store.put(item));
    }),
    performTransaction('ImagesStore', 'readwrite', (store) => {
      imageData.forEach(item => store.put(item));
    }),
    setTheme('default'),
    setUserData({ rewards: 100 }),
    setReferralCode('WELCOME2024'),
    setLanguage('ar'),
    setUserPreferences({ itemsPerPage: 10, showThemeSlider: true }),
    setUUID('demo-user-123')
  ]).then(() => {
    console.log('Data preloaded successfully');
  }).catch(error => {
    console.error('Error in preloadData:', error);
    throw error;
  });
}

function initializeDatabase() {
  return initDB()
    .then(() => getAbayaItems())
    .then(abayaItems => {
      if (abayaItems.items.length === 0) {
        return preloadData();
      }
    })
    .then(() => {
      console.log('Database initialized and data loaded');
    })
    .catch(error => {
      console.error('Error initializing database:', error);
      throw error;
    });
}

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
  preloadData,
  initializeDatabase
};
