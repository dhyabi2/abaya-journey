import { initDB, preloadData } from './indexedDB';

export const seedDatabase = async () => {
  try {
    await initDB();
    await preloadData();
    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};
