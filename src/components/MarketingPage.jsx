import React, { useState, useEffect } from 'react';
import { Share2Icon, CopyIcon, CheckIcon } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getReferralCode, getReferralRewards, updateReferralRewards, getLeaderboard } from '../utils/indexedDB';
import Leaderboard from './Leaderboard';

const MarketingPage = () => {
  const [copied, setCopied] = useState(false);
  const [redeemAmount, setRedeemAmount] = useState(0);
  const queryClient = useQueryClient();
  const userId = 'user123'; // Replace with actual user ID management

  const { data: referralCode, isLoading: isLoadingCode } = useQuery({
    queryKey: ['referralCode', userId],
    queryFn: () => getReferralCode(userId),
  });

  const { data: rewardsData, isLoading: isLoadingRewards } = useQuery({
    queryKey: ['referralRewards', userId],
    queryFn: () => getReferralRewards(userId),
    refetchInterval: 5000, // Refetch every 5 seconds for real-time updates
  });

  const { data: leaderboardData, isLoading: isLoadingLeaderboard } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: getLeaderboard,
    refetchInterval: 10000, // Refetch every 10 seconds for real-time updates
  });

  const redeemMutation = useMutation({
    mutationFn: (amount) => updateReferralRewards(userId, -amount),
    onSuccess: () => {
      queryClient.invalidateQueries(['referralRewards', userId]);
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

  if (isLoadingCode || isLoadingRewards || isLoadingLeaderboard) return <div className="p-4">جاري التحميل...</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">شارك واربح</h1>
      <p className="mb-4">شارك رمز الإحالة الخاص بك مع أصدقائك واحصل على مكافآت!</p>
      
      <div className="bg-gray-100 p-4 rounded-lg mb-4">
        <p className="text-lg font-semibold">رمز الإحالة الخاص بك:</p>
        <div className="flex items-center">
          <p className="text-2xl font-bold mr-2">{referralCode}</p>
          <button
            onClick={handleCopy}
            className="p-2 rounded-full bg-blue-500 text-white"
            aria-label="Copy referral code"
          >
            {copied ? <CheckIcon size={20} /> : <CopyIcon size={20} />}
          </button>
        </div>
      </div>

      <button
        onClick={handleShare}
        className="bg-blue-500 text-white px-4 py-2 rounded-full flex items-center justify-center w-full mb-4"
      >
        <Share2Icon className="mr-2" />
        شارك الرمز
      </button>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">نقاط المكافآت الخاصة بك:</h2>
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
            className="bg-green-500 text-white px-4 py-2 rounded disabled:bg-gray-300"
          >
            استبدال
          </button>
        </div>
        {redeemMutation.isLoading && <p>جاري الاستبدال...</p>}
        {redeemMutation.isSuccess && <p className="text-green-500">تم الاستبدال بنجاح!</p>}
        {redeemMutation.isError && <p className="text-red-500">حدث خطأ أثناء الاستبدال. حاول مرة أخرى.</p>}
      </div>

      <Leaderboard data={leaderboardData || []} />

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">كيفية عمل البرنامج:</h2>
        <ol className="list-decimal list-inside">
          <li className="mb-2">شارك رمز الإحالة الخاص بك مع أصدقائك</li>
          <li className="mb-2">عندما يستخدمون الرمز، سيحصلون على خصم خاص</li>
          <li className="mb-2">ستحصل على نقاط مكافأة لكل صديق يستخدم رمزك</li>
          <li>استبدل نقاطك بخصومات وهدايا حصرية</li>
        </ol>
      </div>
    </div>
  );
};

export default MarketingPage;
