import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Leaderboard = ({ data }) => {
  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">أفضل المشاركين</h2>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <AnimatePresence>
          {data.map((user, index) => (
            <motion.div
              key={user.id}
              className="flex items-center p-4 border-b last:border-b-0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <span className="font-bold mr-4 text-lg">{index + 1}</span>
              <div className="flex-grow">
                <p className="font-semibold">{user.name}</p>
                <p className="text-sm text-gray-500">{user.referrals} إحالات</p>
              </div>
              <motion.span 
                className="font-bold text-blue-500"
                key={user.points}
                initial={{ scale: 1.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {user.points} نقطة
              </motion.span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Leaderboard;
