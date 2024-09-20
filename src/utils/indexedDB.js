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
  'LeaderboardStore',
  'UUIDStore'
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

const getReferralCode = async () => {
  const result = await performTransaction('ReferralStore', 'readonly', (store) => store.get('referralCode'));
  return result ? result.code : null;
};

const setReferralCode = (code) => performTransaction('ReferralStore', 'readwrite', (store) => 
  store.put({ id: 'referralCode', code }));

const getReferralRewards = async () => {
  const userData = await performTransaction('UserDataStore', 'readonly', (store) => store.get('userData'));
  return userData ? userData.rewards || 0 : 0;
};

const updateReferralRewards = async (amount) => {
  return performTransaction('UserDataStore', 'readwrite', (store) => {
    return new Promise((resolve) => {
      const getRequest = store.get('userData');
      getRequest.onsuccess = () => {
        const data = getRequest.result || { id: 'userData', rewards: 0 };
        data.rewards += amount;
        const putRequest = store.put(data);
        putRequest.onsuccess = () => resolve(data.rewards);
      };
    });
  });
};

const getLeaderboard = async () => {
  return performTransaction('LeaderboardStore', 'readonly', (store) => {
    return new Promise((resolve) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result.sort((a, b) => b.points - a.points));
    });
  });
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

const saveImage = async (imageData) => {
  return performTransaction('ImagesStore', 'readwrite', (store) => 
    store.add({ data: imageData, timestamp: Date.now() })
  );
};

const getImage = async (id) => {
  return performTransaction('ImagesStore', 'readonly', (store) => store.get(id))
    .then(result => result ? result.data : null);
};

const getAllImages = async () => {
  return performTransaction('ImagesStore', 'readonly', (store) => {
    return new Promise((resolve) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
    });
  });
};

const getUUID = async () => {
  const result = await performTransaction('UUIDStore', 'readonly', (store) => store.get('uuid'));
  return result ? result.value : null;
};

const setUUID = (uuid) => performTransaction('UUIDStore', 'readwrite', (store) => 
  store.put({ id: 'uuid', value: uuid }));

const getFAQs = async () => {
  return performTransaction('FAQStore', 'readonly', (store) => {
    return new Promise((resolve) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
    });
  });
};

const storeFAQs = async (faqs) => {
  return performTransaction('FAQStore', 'readwrite', (store) => {
    return new Promise((resolve) => {
      store.clear();
      faqs.forEach(faq => store.add(faq));
      resolve();
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
  updateLeaderboard,
  saveImage,
  getImage,
  getAllImages,
  getUUID,
  setUUID,
  getFAQs,
  storeFAQs
};
