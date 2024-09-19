import { initDB } from './indexedDB';

const seedAbayaItems = async () => {
  const db = await initDB();
  const transaction = db.transaction(['AbayaItemsStore'], 'readwrite');
  const store = transaction.objectStore('AbayaItemsStore');

  const abayaItems = [
    { image: '/images/abaya1.jpg', brand: 'Elegant Abayas' },
    { image: '/images/abaya2.jpg', brand: 'Modern Modest' },
    { image: '/images/abaya3.jpg', brand: 'Chic Covers' },
    { image: '/images/abaya4.jpg', brand: 'Stylish Wraps' },
    { image: '/images/abaya5.jpg', brand: 'Graceful Gowns' },
    // Add more items as needed
  ];

  for (const item of abayaItems) {
    store.add(item);
  }
};

const seedLeaderboard = async () => {
  const db = await initDB();
  const transaction = db.transaction(['LeaderboardStore'], 'readwrite');
  const store = transaction.objectStore('LeaderboardStore');

  const leaderboardData = [
    { id: 1, name: 'مستخدم 1', referrals: 10, points: 500 },
    { id: 2, name: 'مستخدم 2', referrals: 8, points: 400 },
    { id: 3, name: 'مستخدم 3', referrals: 6, points: 300 },
    { id: 4, name: 'مستخدم 4', referrals: 4, points: 200 },
    { id: 5, name: 'مستخدم 5', referrals: 2, points: 100 },
  ];

  for (const item of leaderboardData) {
    store.add(item);
  }
};

export const seedDatabase = async () => {
  await seedAbayaItems();
  await seedLeaderboard();
  console.log('Database seeded successfully');
};