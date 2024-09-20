import React, { useState, useEffect, useCallback } from 'react';
import { Share2Icon, CopyIcon, CheckIcon, GiftIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { getReferralCode, getReferralRewards, updateReferralRewards, getUUID, setUUID } from '../utils/indexedDB';
import { validateReferralCode, redeemRewards, trackReferral } from '../utils/referralApi';
import { v4 as uuidv4 } from 'uuid';
import { useLanguage } from '../contexts/LanguageContext';

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
  const { t } = useLanguage();

  useEffect(() => {
    const fetchData = async () => {
      try {
        let storedUUID = await getUUID();
        if (!storedUUID) {
          storedUUID = uuidv4();
          await setUUID(storedUUID);
        }
        setUUIDState(storedUUID);

        const code = await getReferralCode(storedUUID);
        setReferralCode(code || await generateNewReferralCode(storedUUID));
        const currentRewards = await getReferralRewards(storedUUID);
        setRewards(currentRewards);
        const lastRedeem = localStorage.getItem('lastRedeemTime');
        setLastRedeemTime(lastRedeem ? new Date(lastRedeem) : null);
      } catch (error) {
        console.error('Error fetching referral data:', error);
        setValidationMessage(t('errorFetchingData'));
      }
    };
    fetchData();
  }, [t]);

  const generateNewReferralCode = async (userId) => {
    const newCode = `${userId.substring(0, 4).toUpperCase()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    await setReferralCode(newCode);
    return newCode;
  };

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [referralCode]);

  const handleShare = useCallback(() => {
    if (navigator.share) {
      navigator.share({
        title: t('shareReferralTitle'),
        text: t('shareReferralText', { code: referralCode }),
        url: window.location.origin,
      }).catch((error) => console.log('Error sharing:', error));
    } else {
      alert(t('shareReferralFallback', { code: referralCode }));
    }
  }, [referralCode, t]);

  const handleValidate = useCallback(async () => {
    try {
      const result = await validateReferralCode(referralCode);
      setValidationMessage(result.message);
      if (result.isValid) {
        const trackingResult = await trackReferral(uuid, 'REFERRED_USER_ID');
        setTrackingMessage(trackingResult.message);
        if (trackingResult.success) {
          const updatedRewards = await updateReferralRewards(uuid, 10);
          setRewards(updatedRewards);
        }
      }
    } catch (error) {
      console.error('Error validating referral code:', error);
      setValidationMessage(t('errorValidatingCode'));
    }
  }, [referralCode, uuid, t]);

  const handleRedeem = useCallback(async () => {
    if (redeemAmount <= 0 || redeemAmount > rewards) {
      setRedeemMessage(t('invalidRedeemAmount'));
      return;
    }

    const now = new Date();
    if (lastRedeemTime && now - lastRedeemTime < 24 * 60 * 60 * 1000) {
      setRedeemMessage(t('redeemCooldown'));
      return;
    }

    try {
      const result = await redeemRewards(uuid, redeemAmount);
      if (result.success) {
        const updatedRewards = await updateReferralRewards(uuid, -redeemAmount);
        setRewards(updatedRewards);
        setRedeemMessage(t('redeemSuccess', { amount: redeemAmount }));
        setRedeemAmount(0);
        setLastRedeemTime(now);
        localStorage.setItem('lastRedeemTime', now.toISOString());
      } else {
        setRedeemMessage(t('redeemError'));
      }
    } catch (error) {
      console.error('Error redeeming rewards:', error);
      setRedeemMessage(t('errorRedeemingRewards'));
    }
  }, [redeemAmount, rewards, uuid, lastRedeemTime, t]);

  return (
    <motion.div 
      className="bg-white p-6 rounded-lg shadow-lg mb-8"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-xl font-semibold mb-4">{t('referralSystem')}</h2>
      <div className="flex items-center justify-between bg-gray-100 p-3 rounded-lg mb-4">
        <p className="text-2xl font-bold">{referralCode}</p>
        <button
          onClick={handleCopy}
          className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
          aria-label={t('copyReferralCode')}
        >
          {copied ? <CheckIcon size={20} /> : <CopyIcon size={20} />}
        </button>
      </div>
      <button
        onClick={handleShare}
        className="w-full bg-green-500 text-white p-3 rounded-lg flex items-center justify-center hover:bg-green-600 transition-colors mb-4"
      >
        <Share2Icon className="mr-2" />
        {t('shareCode')}
      </button>
      <button
        onClick={handleValidate}
        className="w-full bg-blue-500 text-white p-3 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors mb-4"
      >
        {t('validateCode')}
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
        <h3 className="text-lg font-semibold mb-2">{t('yourRewardPoints')}</h3>
        <p className="text-2xl font-bold mb-4">{rewards} {t('points')}</p>
        <div className="flex items-center mb-2">
          <input
            type="number"
            value={redeemAmount}
            onChange={(e) => setRedeemAmount(Math.max(0, parseInt(e.target.value) || 0))}
            className="border rounded p-2 mr-2 w-full"
            placeholder={t('enterPointsToRedeem')}
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
