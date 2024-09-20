import React from 'react';
import { motion } from 'framer-motion';

const DeviceInfo = ({ deviceInfo }) => {
  return (
    <motion.div 
      className="mt-8 text-sm text-gray-500"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
    >
      <p>Device: {deviceInfo.isMobile ? 'Mobile' : deviceInfo.isTablet ? 'Tablet' : 'Desktop'}</p>
      <p>Browser: {deviceInfo.browserName}</p>
      <p>OS: {deviceInfo.osName}</p>
      <p>Screen Size: {deviceInfo.screenSize}</p>
      <p>Orientation: {deviceInfo.orientation}</p>
    </motion.div>
  );
};

export default DeviceInfo;