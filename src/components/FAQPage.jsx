import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

const FAQPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [openIndex, setOpenIndex] = useState(null);

  const { data: faqs, isLoading, isError } = useQuery({
    queryKey: ['faqs'],
    queryFn: async () => {
      const { getFAQs } = await import('../utils/indexedDB');
      return getFAQs();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  useEffect(() => {
    const fetchAndStoreFAQs = async () => {
      try {
        const response = await fetch('/api/faqs');
        const fetchedFAQs = await response.json();
        const { storeFAQs } = await import('../utils/indexedDB');
        await storeFAQs(fetchedFAQs);
      } catch (error) {
        console.error('Error fetching FAQs:', error);
      }
    };

    fetchAndStoreFAQs();
  }, []);

  if (isLoading) {
    return <div className="p-4 text-center">جاري تحميل الأسئلة الشائعة...</div>;
  }

  if (isError) {
    return <div className="p-4 text-center text-red-500">حدث خطأ أثناء تحميل الأسئلة الشائعة. يرجى المحاولة مرة أخرى لاحقًا.</div>;
  }

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
              className="w-full text-right p-4 flex justify-between items-center focus:outline-none"
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
