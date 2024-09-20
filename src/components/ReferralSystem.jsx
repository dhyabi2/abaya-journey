import React, { useState, useEffect, useCallback } from 'react';
import { Share2Icon, CopyIcon, CheckIcon, GiftIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { getReferralCode, getReferralRewards, updateReferralRewards, getUUID, setUUID } from '../utils/indexedDB';
import { validateReferralCode, redeemRewards, trackReferral } from '../utils/referralApi';
import { v4 as uuidv4 } from 'uuid';

const ReferralSystem = () => {
  const [referralCode, setReferralCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');
  const [rewards, setRewards] = useState(0);
  const [redeemAmount, setRedeemAmount] = useState(0);
  const [redeemMessage, setRedeemMessage] = useState('');
  const [trackingMessage, setTrackingMessage] = useState('');
  const [uuid, setUUIDState] = useState(null);
  const [lastRedeemTime, setLastRedeemTime] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      let storedUUID = await getUUID();
      if (!storedUUID) {
        storedUUID = uuidv4();
        await setUUID(storedUUID);
      }
      setUUIDState(storedUUID);

      const code = await getReferralCode(storedUUID);
      setReferralCode(code || 'CODE_NOT_FOUND');
      const currentRewards = await getReferralRewards(storedUUID);
      setRewards(currentRewards);
    };
    fetchData();
  }, []);

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

  const handleValidate = async () => {
    try {
      const result = await validateReferralCode(referralCode);
      setValidationMessage(result.message);
      if (result.isValid) {
        const trackingResult = await trackReferral(uuid, 'REFERRED_USER_ID');
        setTrackingMessage(trackingResult.message);
        if (trackingResult.success) {
          const updatedRewards = await updateReferralRewards(uuid, 10); // Add 10 points for successful referral
          setRewards(updatedRewards);
        }
      }
    } catch (error) {
      setValidationMessage('حدث خطأ أثناء التحقق من الرمز');
    }
  };

  const handleRedeem = useCallback(async () => {
    if (redeemAmount <= 0 || redeemAmount > rewards) {
      setRedeemMessage('الرجاء إدخال قيمة صالحة للاسترداد');
      return;
    }

    const now = Date.now();
    if (lastRedeemTime && now - lastRedeemTime < 24 * 60 * 60 * 1000) {
      setRedeemMessage('يمكنك الاسترداد مرة واحدة فقط كل 24 ساعة');
      return;
    }

    try {
      const result = await redeemRewards(uuid, redeemAmount);
      if (result.success) {
        const updatedRewards = await updateReferralRewards(uuid, -redeemAmount);
        setRewards(updatedRewards);
        setRedeemMessage(`تم استرداد ${redeemAmount} نقطة بنجاح!`);
        setRedeemAmount(0);
        setLastRedeemTime(now);
      } else {
        setRedeemMessage('فشل استرداد النقاط. الرجاء المحاولة مرة أخرى.');
      }
    } catch (error) {
      setRedeemMessage('حدث خطأ أثناء استرداد النقاط');
    }
  }, [redeemAmount, rewards, uuid, lastRedeemTime]);

  return (
    <motion.div 
      className="bg-white p-6 rounded-lg shadow-lg mb-8"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-xl font-semibold mb-4">نظام الإحالة</h2>
      <div className="flex items-center justify-between bg-gray-100 p-3 rounded-lg mb-4">
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
        className="w-full bg-green-500 text-white p-3 rounded-lg flex items-center justify-center hover:bg-green-600 transition-colors mb-4"
      >
        <Share2Icon className="mr-2" />
        شارك الرمز
      </button>
      <button
        onClick={handleValidate}
        className="w-full bg-blue-500 text-white p-3 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors mb-4"
      >
        التحقق من الرمز
      </button>
      {validationMessage && (
        <p className="mt-2 text-center text-sm font-semibold">
          {validationMessage}
        </p>
      )}
      {trackingMessage && (
        <p className="mt-2 text-center text-sm font-semibold text-green-500">
          {trackingMessage}
        </p>
      )}
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">نقاط المكافآت الخاصة بك</h3>
        <p className="text-2xl font-bold mb-4">{rewards} نقطة</p>
        <div className="flex items-center mb-2">
          <input
            type="number"
            value={redeemAmount}
            onChange={(e) => setRedeemAmount(Math.max(0, parseInt(e.target.value) || 0))}
            className="border rounded p-2 mr-2 w-full"
            placeholder="أدخل عدد النقاط للاسترداد"
          />
          <button
            onClick={handleRedeem}
            className="bg-yellow-500 text-white p-2 rounded hover:bg-yellow-600 transition-colors"
          >
            <GiftIcon size={20} />
          </button>
        </div>
        {redeemMessage && (
          <p className="text-sm font-semibold text-center">{redeemMessage}</p>
        )}
      </div>
    </motion.div>
  );
};

export default ReferralSystem;
