// This file simulates API calls for referral functionalities

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const generateReferralCode = async (userId) => {
  await delay(500); // Simulate API delay
  return `${userId.substring(0, 4).toUpperCase()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
};

export const validateReferralCode = async (code) => {
  await delay(700); // Simulate API delay
  const isValid = Math.random() > 0.2; // 80% chance of being valid
  return { isValid, message: isValid ? 'Valid referral code' : 'Invalid or expired referral code' };
};

export const trackReferral = async (referrerId, referredId) => {
  await delay(600); // Simulate API delay
  const success = Math.random() > 0.1; // 90% chance of success
  return { success, message: success ? 'Referral tracked successfully' : 'Error tracking referral' };
};

export const getReferralRewards = async (userId) => {
  await delay(800); // Simulate API delay
  const rewards = Math.floor(Math.random() * 500); // Random reward points
  return { rewards, message: `You have earned ${rewards} reward points from referrals` };
};

export const redeemRewards = async (userId, amount) => {
  await delay(1000); // Simulate API delay
  const success = Math.random() > 0.05; // 95% chance of success
  return { 
    success, 
    message: success ? `Successfully redeemed ${amount} points` : 'Error redeeming points',
    newBalance: success ? Math.floor(Math.random() * 1000) : null
  };
};