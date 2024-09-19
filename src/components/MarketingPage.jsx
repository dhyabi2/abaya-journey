import React, { useState } from 'react';
import { Share2Icon } from 'lucide-react';

const MarketingPage = () => {
  const [referralCode, setReferralCode] = useState('ABC123'); // This should be generated or fetched from the backend

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'شارك واربح مع تطبيق العباءات',
        text: `استخدم رمز الإحالة الخاص بي: ${referralCode} للحصول على خصم خاص!`,
        url: window.location.origin,
      }).then(() => console.log('Successful share'))
        .catch((error) => console.log('Error sharing:', error));
    } else {
      // Fallback for browsers that don't support the Web Share API
      alert(`شارك هذا الرمز: ${referralCode}`);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">شارك واربح</h1>
      <p className="mb-4">شارك رمز الإحالة الخاص بك مع أصدقائك واحصل على مكافآت!</p>
      <div className="bg-gray-100 p-4 rounded-lg mb-4">
        <p className="text-lg font-semibold">رمز الإحالة الخاص بك:</p>
        <p className="text-2xl font-bold">{referralCode}</p>
      </div>
      <button
        onClick={handleShare}
        className="bg-blue-500 text-white px-4 py-2 rounded-full flex items-center justify-center w-full"
      >
        <Share2Icon className="mr-2" />
        شارك الرمز
      </button>
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
