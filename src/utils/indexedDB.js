const DB_NAME = 'AbayaAppDB';
const DB_VERSION = 1;

const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => reject(`Database error: ${event.target.error}`);

    request.onsuccess = (event) => resolve(event.target.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      if (!db.objectStoreNames.contains('ImagesStore')) {
        db.createObjectStore('ImagesStore', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('ThemesStore')) {
        db.createObjectStore('ThemesStore', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('UserDataStore')) {
        db.createObjectStore('UserDataStore', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('FAQStore')) {
        db.createObjectStore('FAQStore', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('LikesStore')) {
        db.createObjectStore('LikesStore', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('AbayaItemsStore')) {
        db.createObjectStore('AbayaItemsStore', { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('ReferralStore')) {
        db.createObjectStore('ReferralStore', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('LeaderboardStore')) {
        db.createObjectStore('LeaderboardStore', { keyPath: 'id' });
      }
    };
  });
};

const getTheme = async () => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['ThemesStore'], 'readonly');
    const store = transaction.objectStore('ThemesStore');
    const request = store.get('currentTheme');

    request.onerror = (event) => reject(`Error fetching theme: ${event.target.error}`);
    request.onsuccess = (event) => resolve(event.target.result ? event.target.result.value : 'default');
  });
};

const setTheme = async (theme) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['ThemesStore'], 'readwrite');
    const store = transaction.objectStore('ThemesStore');
    const request = store.put({ id: 'currentTheme', value: theme });

    request.onerror = (event) => reject(`Error setting theme: ${event.target.error}`);
    request.onsuccess = () => resolve();
  });
};

const getUserData = async () => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['UserDataStore'], 'readonly');
    const store = transaction.objectStore('UserDataStore');
    const request = store.get('userData');

    request.onerror = (event) => reject(`Error fetching user data: ${event.target.error}`);
    request.onsuccess = (event) => resolve(event.target.result ? event.target.result.value : null);
  });
};

const setUserData = async (userData) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['UserDataStore'], 'readwrite');
    const store = transaction.objectStore('UserDataStore');
    const request = store.put({ id: 'userData', value: userData });

    request.onerror = (event) => reject(`Error setting user data: ${event.target.error}`);
    request.onsuccess = () => resolve();
  });
};

const getLikeStatus = async (abayaId) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['LikesStore'], 'readonly');
    const store = transaction.objectStore('LikesStore');
    const request = store.get(abayaId);

    request.onerror = (event) => reject(`Error fetching like status: ${event.target.error}`);
    request.onsuccess = (event) => resolve(event.target.result ? event.target.result.status : false);
  });
};

const setLikeStatus = async (abayaId, status) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['LikesStore'], 'readwrite');
    const store = transaction.objectStore('LikesStore');
    const request = store.put({ id: abayaId, status });

    request.onerror = (event) => reject(`Error setting like status: ${event.target.error}`);
    request.onsuccess = () => resolve();
  });
};

const getAbayaItems = async (page = 0, limit = 10, searchTerm = '') => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['AbayaItemsStore'], 'readonly');
    const store = transaction.objectStore('AbayaItemsStore');
    const request = store.getAll();

    request.onerror = (event) => reject(`Error fetching abaya items: ${event.target.error}`);
    request.onsuccess = (event) => {
      let items = event.target.result;
      if (searchTerm) {
        items = items.filter(item => item.brand.toLowerCase().includes(searchTerm.toLowerCase()));
      }
      const startIndex = page * limit;
      const endIndex = startIndex + limit;
      const paginatedItems = items.slice(startIndex, endIndex);
      resolve({
        items: paginatedItems,
        nextCursor: endIndex < items.length ? page + 1 : null
      });
    };
  });
};

const getReferralCode = async (userId) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['ReferralStore'], 'readonly');
    const store = transaction.objectStore('ReferralStore');
    const request = store.get(userId);

    request.onerror = (event) => reject(`Error fetching referral code: ${event.target.error}`);
    request.onsuccess = (event) => {
      if (event.target.result) {
        resolve(event.target.result.code);
      } else {
        const newCode = `${userId.substring(0, 4).toUpperCase()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
        setReferralCode(userId, newCode);
        resolve(newCode);
      }
    };
  });
};

const setReferralCode = async (userId, code) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['ReferralStore'], 'readwrite');
    const store = transaction.objectStore('ReferralStore');
    const request = store.put({ id: userId, code });

    request.onerror = (event) => reject(`Error setting referral code: ${event.target.error}`);
    request.onsuccess = () => resolve();
  });
};

const getReferralRewards = async (userId) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['UserDataStore'], 'readonly');
    const store = transaction.objectStore('UserDataStore');
    const request = store.get(userId);

    request.onerror = (event) => reject(`Error fetching referral rewards: ${event.target.error}`);
    request.onsuccess = (event) => {
      const userData = event.target.result;
      resolve(userData ? userData.rewards || 0 : 0);
    };
  });
};

const updateReferralRewards = async (userId, amount) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['UserDataStore'], 'readwrite');
    const store = transaction.objectStore('UserDataStore');
    const request = store.get(userId);

    request.onerror = (event) => reject(`Error updating referral rewards: ${event.target.error}`);
    request.onsuccess = (event) => {
      const userData = event.target.result || { id: userId, rewards: 0 };
      userData.rewards = (userData.rewards || 0) + amount;
      const updateRequest = store.put(userData);
      updateRequest.onerror = (event) => reject(`Error saving updated rewards: ${event.target.error}`);
      updateRequest.onsuccess = () => resolve(userData.rewards);
    };
  });
};

const getLeaderboard = async () => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['LeaderboardStore'], 'readonly');
    const store = transaction.objectStore('LeaderboardStore');
    const request = store.getAll();

    request.onerror = (event) => reject(`Error fetching leaderboard: ${event.target.error}`);
    request.onsuccess = (event) => {
      const leaderboard = event.target.result;
      resolve(leaderboard.sort((a, b) => b.points - a.points));
    };
  });
};

const updateLeaderboard = async (userId, points) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['LeaderboardStore'], 'readwrite');
    const store = transaction.objectStore('LeaderboardStore');
    const request = store.get(userId);

    request.onerror = (event) => reject(`Error updating leaderboard: ${event.target.error}`);
    request.onsuccess = (event) => {
      let userData = event.target.result;
      if (userData) {
        userData.points += points;
      } else {
        userData = { id: userId, name: `مستخدم ${userId}`, referrals: 1, points };
      }
      const updateRequest = store.put(userData);
      updateRequest.onerror = (event) => reject(`Error saving updated leaderboard: ${event.target.error}`);
      updateRequest.onsuccess = () => resolve();
    };
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
