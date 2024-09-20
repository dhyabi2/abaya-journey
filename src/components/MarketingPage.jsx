import React, { useState, useEffect } from 'react';
import { Share2Icon, CopyIcon, CheckIcon } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getReferralCode, getReferralRewards, updateReferralRewards, getLeaderboard } from '../utils/indexedDB';
import Leaderboard from './Leaderboard';
import { motion, AnimatePresence } from 'framer-motion';

const MarketingPage = ({ uuid }) => {
  const [copied, setCopied] = useState(false);
  const [redeemAmount, setRedeemAmount] = useState(0);
  const queryClient = useQueryClient();

  const { data: referralCode, isLoading: isLoadingCode } = useQuery({
    queryKey: ['referralCode', uuid],
    queryFn: () => getReferralCode(uuid),
  });

  const { data: rewardsData, isLoading: isLoadingRewards } = useQuery({
    queryKey: ['referralRewards', uuid],
    queryFn: () => getReferralRewards(uuid),
    refetchInterval: 5000, // Refetch every 5 seconds for real-time updates
  });

  const { data: leaderboardData, isLoading: isLoadingLeaderboard } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: getLeaderboard,
    refetchInterval: 10000, // Refetch every 10 seconds for real-time updates
  });

  const redeemMutation = useMutation({
    mutationFn: (amount) => updateReferralRewards(uuid, -amount),
    onSuccess: () => {
      queryClient.invalidateQueries(['referralRewards', uuid]);
      setRedeemAmount(0);
    },
  });

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

  const handleRedeem = () => {
    if (redeemAmount > 0 && redeemAmount <= rewardsData) {
      redeemMutation.mutate(redeemAmount);
    }
  };

  if (isLoadingCode || isLoadingRewards || isLoadingLeaderboard) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <motion.h1 
        className="text-3xl font-bold mb-6 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        شارك واربح
      </motion.h1>
      
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

      <motion.div 
        className="bg-white p-6 rounded-lg shadow-lg mb-8"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h2 className="text-xl font-semibold mb-4">نقاط المكافآت الخاصة بك</h2>
        <p className="text-3xl font-bold mb-4">{rewardsData} نقطة</p>
        <div className="flex items-center mb-4">
          <input
            type="number"
            value={redeemAmount}
            onChange={(e) => setRedeemAmount(Math.max(0, parseInt(e.target.value)))}
            className="border rounded p-2 mr-2 w-full"
            placeholder="أدخل عدد النقاط للاستبدال"
          />
          <button
            onClick={handleRedeem}
            disabled={redeemAmount <= 0 || redeemAmount > rewardsData}
            className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-300 hover:bg-blue-600 transition-colors"
          >
            استبدال
          </button>
        </div>
        <AnimatePresence>
          {redeemMutation.isLoading && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="text-blue-500"
            >
              جاري الاستبدال...
            </motion.p>
          )}
          {redeemMutation.isSuccess && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="text-green-500"
            >
              تم الاستبدال بنجاح!
            </motion.p>
          )}
          {redeemMutation.isError && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="text-red-500"
            >
              حدث خطأ أثناء الاستبدال. حاول مرة أخرى.
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Leaderboard data={leaderboardData || []} />
      </motion.div>

      <motion.div 
        className="mt-8 bg-white p-6 rounded-lg shadow-lg"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <h2 className="text-xl font-semibold mb-4">كيفية عمل البرنامج</h2>
        <ol className="list-decimal list-inside space-y-2">
          <li>شارك رمز الإحالة الخاص بك مع أصدقائك</li>
          <li>عندما يستخدمون الرمز، سيحصلون على خصم خاص</li>
          <li>ستحصل على نقاط مكافأة لكل صديق يستخدم رمزك</li>
          <li>استبدل نقاطك بخصومات وهدايا حصرية</li>
        </ol>
      </motion.div>
    </div>
  );
};

export default MarketingPage;
