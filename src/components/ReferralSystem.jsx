import React, { useState, useEffect } from 'react';
import { Share2Icon, CopyIcon, CheckIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { getReferralCode } from '../utils/indexedDB';

const ReferralSystem = ({ uuid }) => {
  const [referralCode, setReferralCode] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchReferralCode = async () => {
      const code = await getReferralCode(uuid);
      setReferralCode(code || 'CODE_NOT_FOUND');
    };
    fetchReferralCode();
  }, [uuid]);

  const handleCopy = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'شارك واربح مع تطبيق العباءات',
        text: `استخدم رمز الإحالة الخاص بي: ${referralCode} للحصول على خصم خاص!`,
        url: window.location.origin,
      }).catch((error) => console.log('Error sharing:', error));
    } else {
      alert(`شارك هذا الرمز: ${referralCode}`);
    }
  };

  return (
    <motion.div 
      className="bg-white p-6 rounded-lg shadow-lg mb-8"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-xl font-semibold mb-4">رمز الإحالة الخاص بك</h2>
      <div className="flex items-center justify-between bg-gray-100 p-3 rounded-lg">
        <p className="text-2xl font-bold">{referralCode}</p>
        <button
          onClick={handleCopy}
          className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
          aria-label="نسخ رمز الإحالة"
        >
          {copied ? <CheckIcon size={20} /> : <CopyIcon size={20} />}
        </button>
      </div>
      <button
        onClick={handleShare}
        className="mt-4 w-full bg-green-500 text-white p-3 rounded-lg flex items-center justify-center hover:bg-green-600 transition-colors"
      >
        <Share2Icon className="mr-2" />
        شارك الرمز
      </button>
    </motion.div>
  );
};

export default ReferralSystem;