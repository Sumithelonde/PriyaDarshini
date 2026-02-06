import React, { Suspense } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

const Translator = () => {
  const { language } = useLanguage();

  return (
    <div className="min-h-screen bg-[#EEFCEB]">
      <Suspense fallback={
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-[#284B63] border-t-transparent mb-4"></div>
              <p className="text-[#284B63] font-medium">Loading...</p>
            </div>
          </div>
        </div>
      }>
        <div className="container mx-auto p-4">
          <h1 className="text-2xl font-bold mb-4">
            {language === 'hi' ? 'दस्तावेज़ अनुवादक' :
             language === 'te' ? 'డాక్యుమెంట్ అనువాదకుడు' :
             language === 'mr' ? 'दस्तऐवज भाषांतरकार' :
             'Document Translator'}
          </h1>
          <div className="bg-white rounded-lg shadow p-8">
            <p className="text-[#284B63]">Translator feature coming soon...</p>
          </div>
        </div>
      </Suspense>
    </div>
  );
};

export default Translator;
