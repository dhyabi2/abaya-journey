import React from 'react';
import { motion } from 'framer-motion';

const Leaderboard = ({ data }) => {
  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">أفضل المشاركين</h2>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {data.map((user, index) => (
          <motion.div
            key={user.id}
            className="flex items-center p-4 border-b last:border-b-0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <span className="font-bold mr-4 text-lg">{index + 1}</span>
            <div className="flex-grow">
              <p className="font-semibold">{user.name}</p>
              <p className="text-sm text-gray-500">{user.referrals} إحالات</p>
            </div>
            <span className="font-bold text-blue-500">{user.points} نقطة</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Leaderboard;