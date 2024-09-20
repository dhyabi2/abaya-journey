import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

export const formatNumberToArabic = (number) => {
  const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return number.toString().replace(/\d/g, (digit) => arabicNumbers[digit]);
};

export const formatDateToArabic = (date) => {
  return format(date, 'dd MMMM yyyy', { locale: ar });
};

export const formatCurrencyToArabic = (amount) => {
  const formattedNumber = new Intl.NumberFormat('ar-SA', {
    style: 'currency',
    currency: 'SAR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
  return formattedNumber;
};

export const formatTimeToArabic = (date) => {
  return format(date, 'HH:mm', { locale: ar });
};

export const formatDateTimeToArabic = (date) => {
  return format(date, 'dd MMMM yyyy HH:mm', { locale: ar });
};
