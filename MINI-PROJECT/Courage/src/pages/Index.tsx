import React, { useEffect, useState } from 'react';
import Home from './Home';
import QuestionSection from '@/components/QuestionSection';  // Changed import
import DocumentGenerator from '@/components/DocumentGenerator';
import NGODirectory from '@/components/NGODirectory';
import LawyersDirectory from './LawyersDirectory';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useLocation, useNavigate } from 'react-router-dom';
import Dictionary from './Dictionary';
import Translator from './Translator';
import DocumentTranslator from '@/components/DocumentTranslator';
import LegalDictionary from '@/components/LegalDictionary';
import CaseTracker from '@/components/CaseTracker';

type Page = 'home' | 'chat' | 'document' | 'ngo' | 'ocr' | 'dictionary' | 'translator' | 'case-tracker' | 'lawyers';

const Index = () => {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const page = params.get('page') as Page | null;
    if (page && ['home', 'chat', 'document', 'ngo', 'ocr', 'dictionary', 'translator', 'case-tracker', 'lawyers'].includes(page)) {
      setCurrentPage(page);
    }
  }, [location.search]);

  const handleNavigate = (page: 'chat' | 'document' | 'ngo' | 'ocr' | 'dictionary' | 'translator' | 'case-tracker' | 'lawyers') => {
    setCurrentPage(page);
    const params = new URLSearchParams(location.search);
    params.set('page', page);
    navigate({ pathname: '/home', search: params.toString() }, { replace: false });
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home onNavigate={handleNavigate} />;
      case 'chat':
        return (
          <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="mb-6">
              <Button 
                variant="ghost" 
                onClick={() => setCurrentPage('home')}
                className="mb-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
              <h1 className="text-3xl font-bold text-foreground">{t('legalHelp')}</h1>
            </div>
            <QuestionSection />
          </div>
        );
      case 'document':
        return (
          <div className="container mx-auto px-4 py-8">
            <div className="mb-6">
              <Button 
                variant="ghost" 
                onClick={() => setCurrentPage('home')}
                className="mb-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </div>
            <DocumentGenerator />
          </div>
        );
      case 'ngo':
        return (
          <div className="container mx-auto px-4 py-8">
            <div className="mb-6">
              <Button 
                variant="ghost" 
                onClick={() => setCurrentPage('home')}
                className="mb-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </div>
            <NGODirectory />
          </div>
        );
      case 'ocr':
        // Import and use OCRScanner component directly
        const OCRScanner = React.lazy(() => import('@/components/OCRScanner'));
        return (
          <div className="container mx-auto px-4 py-8">
            <div className="mb-6">
              <Button 
                variant="ghost" 
                onClick={() => setCurrentPage('home')}
                className="mb-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </div>
            <React.Suspense fallback={<div>Loading...</div>}>
              <OCRScanner />
            </React.Suspense>
          </div>
        );
      case 'dictionary':
        return (
          <div className="container mx-auto px-4 py-8">
            <div className="mb-6">
              <Button 
                variant="outline" 
                onClick={() => setCurrentPage('home')}
                className="mb-4 inline-flex items-center gap-2 text-foreground bg-background hover:bg-accent hover:scale-105 px-4 py-2 transition-all duration-200 ease-in-out border border-border shadow-sm hover:shadow-md"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="font-medium">Back to Home</span>
              </Button>
            </div>
            <LegalDictionary />
          </div>
        );
      case 'translator':
        return (
          <div className="container mx-auto px-4 py-8">
            <div className="mb-6">
              <Button 
                variant="outline" 
                onClick={() => setCurrentPage('home')}
                className="mb-4 inline-flex items-center gap-2 text-foreground bg-background hover:bg-accent hover:scale-105 px-4 py-2 transition-all duration-200 ease-in-out border border-border shadow-sm hover:shadow-md"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="font-medium">Back to Home</span>
              </Button>
            </div>
            <DocumentTranslator />
          </div>
        );
      case 'case-tracker':
        return (
          <div className="container mx-auto px-4 py-8 max-w-5xl">
            <div className="mb-6">
              <Button 
                variant="outline" 
                onClick={() => setCurrentPage('home')}
                className="mb-4 inline-flex items-center gap-2 text-foreground bg-background hover:bg-accent hover:scale-105 px-4 py-2 transition-all duration-200 ease-in-out border border-border shadow-sm hover:shadow-md"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="font-medium">Back to Home</span>
              </Button>
            </div>
            <CaseTracker />
          </div>
        );      case 'lawyers':
        return <LawyersDirectory />;      default:
        return <Home onNavigate={handleNavigate} />;
        
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {renderPage()}
    </div>
  );
};

export default Index;
