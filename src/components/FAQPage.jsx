import React, { useState } from 'react';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';

const faqs = [
  {
    question: 'كيف يمكنني إنشاء حساب؟',
    answer: 'يمكنك إنشاء حساب بالنقر على زر "التسجيل" في الصفحة الرئيسية وملء النموذج بمعلوماتك.'
  },
  {
    question: 'كيف يمكنني تتبع طلبي؟',
    answer: 'بمجرد تقديم طلبك، ستتلقى رقم تتبع عبر البريد الإلكتروني. استخدم هذا الرقم في قسم "تتبع الطلب" لمعرفة حالة شحنتك.'
  },
  {
    question: 'ما هي سياسة الإرجاع الخاصة بكم؟',
    answer: 'نقبل الإرجاع خلال 30 يومًا من تاريخ الشراء. يجب أن تكون العناصر في حالتها الأصلية مع جميع الملصقات والتغليف.'
  },
  {
    question: 'هل تقدمون الشحن الدولي؟',
    answer: 'نعم، نقدم الشحن الدولي إلى معظم البلدان. يمكنك التحقق من توفر الشحن وتكلفته أثناء عملية الدفع.'
  },
  {
    question: 'كيف يمكنني استخدام رمز الخصم؟',
    answer: 'أدخل رمز الخصم الخاص بك في حقل "رمز الخصم" عند الدفع. سيتم تطبيق الخصم تلقائيًا إذا كان الرمز صالحًا.'
  }
];

const FAQPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [openIndex, setOpenIndex] = useState(null);

  const filteredFAQs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">الأسئلة الشائعة</h1>
      <div className="relative mb-4">
        <input
          type="text"
          placeholder="ابحث عن سؤال..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 pr-10 border rounded-lg"
        />
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      </div>
      <div className="space-y-4">
        {filteredFAQs.map((faq, index) => (
          <div key={index} className="border rounded-lg">
            <button
              className="w-full text-left p-4 flex justify-between items-center focus:outline-none"
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
            >
              <span className="font-semibold">{faq.question}</span>
              {openIndex === index ? <ChevronUp /> : <ChevronDown />}
            </button>
            {openIndex === index && (
              <div className="p-4 bg-gray-50">
                <p>{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQPage;
