import React, { createContext, useContext, useState, ReactNode } from 'react';

// Language definitions with native names
export const LANGUAGES = {
  en: { code: 'en', name: 'English', nativeName: 'English' },
  hi: { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
  te: { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  mr: { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  kn: { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' }
} as const;

export type LanguageCode = keyof typeof LANGUAGES;

// Translation strings for UI
export const translations = {
  en: {
    appName: 'Legislate AI',
    tagline: 'Your Voice is Your Right',
    chatPlaceholder: 'Ask your legal question...',
    voiceButton: 'Speak',
    sendButton: 'Send',
    typing: 'Typing...',
    listening: 'Listening...',
    generateDocument: 'Generate Document',
    findNGO: 'Find NGO Help',
    downloadPDF: 'Download PDF',
    shareWhatsApp: 'Share on WhatsApp',
    selectLanguage: 'Select Language',
    legalHelp: 'Legal Help',
    askQuestion: 'Ask a Question',
    voiceInput: 'Voice Input',
    documentGen: 'Document Generator',
    ngoDirectory: 'NGO Directory'
  },
  hi: {
    appName: 'लेजिस्लेट AI',
    tagline: 'आपकी आवाज़ है आपका अधिकार',
    chatPlaceholder: 'अपना कानूनी सवाल पूछें...',
    voiceButton: 'बोलें',
    sendButton: 'भेजें',
    typing: 'लिख रहे हैं...',
    listening: 'सुन रहे हैं...',
    generateDocument: 'दस्तावेज बनाएं',
    findNGO: 'NGO सहायता खोजें',
    downloadPDF: 'PDF डाउनलोड करें',
    shareWhatsApp: 'WhatsApp पर शेयर करें',
    selectLanguage: 'भाषा चुनें',
    legalHelp: 'कानूनी सहायता',
    askQuestion: 'सवाल पूछें',
    voiceInput: 'आवाज़ इनपुट',
    documentGen: 'दस्तावेज जेनरेटर',
    ngoDirectory: 'NGO निर्देशिका'
  },
  te: {
    appName: 'లెజిస్లేట్ AI',
    tagline: 'మీ గొంతు మీ హక్కు',
    chatPlaceholder: 'మీ చట్టపరమైన ప్రశ్న అడగండి...',
    voiceButton: 'మాట్లాడండి',
    sendButton: 'పంపండి',
    typing: 'టైప్ చేస్తున్నాము...',
    listening: 'వింటున్నాము...',
    generateDocument: 'పత్రం రూపొందించండి',
    findNGO: 'NGO సహాయం కనుగొనండి',
    downloadPDF: 'PDF డౌన్‌లోడ్ చేయండి',
    shareWhatsApp: 'WhatsApp లో షేర్ చేయండి',
    selectLanguage: 'భాష ఎంచుకోండి',
    legalHelp: 'చట్టపరమైన సహాయం',
    askQuestion: 'ప్రశ్న అడగండి',
    voiceInput: 'వాయిస్ ఇన్‌పుట్',
    documentGen: 'డాక్యుమెంట్ జెనరేటర్',
    ngoDirectory: 'NGO డైరెక్టరీ'
  },
  mr: {
    appName: 'लेजिस्लेट AI',
    tagline: 'तुमचा आवाज तुमचा हक्क',
    chatPlaceholder: 'तुमचा कायदेशीर प्रश्न विचारा...',
    voiceButton: 'बोला',
    sendButton: 'पाठवा',
    typing: 'टाइप करत आहे...',
    listening: 'ऐकत आहे...',
    generateDocument: 'कागदपत्र तयार करा',
    findNGO: 'NGO मदत शोधा',
    downloadPDF: 'PDF डाउनलोड करा',
    shareWhatsApp: 'WhatsApp वर शेअर करा',
    selectLanguage: 'भाषा निवडा',
    legalHelp: 'कायदेशीर मदत',
    askQuestion: 'प्रश्न विचारा',
    voiceInput: 'आवाज इनपुट',
    documentGen: 'दस्तऐवज जनरेटर',
    ngoDirectory: 'NGO निर्देशिका'
  },
  kn: {
    appName: 'ಲೆಜಿಸ್ಲೇಟ್ AI',
    tagline: 'ನಿಮ್ಮ ಧ್ವನಿ ನಿಮ್ಮ ಹಕ್ಕು',
    chatPlaceholder: 'ನಿಮ್ಮ ಕಾನೂನು ಪ್ರಶ್ನೆ ಕೇಳಿ...',
    voiceButton: 'ಮಾತನಾಡಿ',
    sendButton: 'ಕಳುಹಿಸಿ',
    typing: 'ಟೈಪ್ ಮಾಡುತ್ತಿದೆ...',
    listening: 'ಕೇಳುತ್ತಿದೆ...',
    generateDocument: 'ದಾಖಲೆ ರಚಿಸಿ',
    findNGO: 'NGO ಸಹಾಯ ಹುಡುಕಿ',
    downloadPDF: 'PDF ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ',
    shareWhatsApp: 'WhatsApp ನಲ್ಲಿ ಹಂಚಿಕೊಳ್ಳಿ',
    selectLanguage: 'ಭಾಷೆ ಆಯ್ಕೆಮಾಡಿ',
    legalHelp: 'ಕಾನೂನು ಸಹಾಯ',
    askQuestion: 'ಪ್ರಶ್ನೆ ಕೇಳಿ',
    voiceInput: 'ಧ್ವನಿ ಇನ್‌ಪುಟ್',
    documentGen: 'ದಾಖಲೆ ಜನರೇಟರ್',
    ngoDirectory: 'NGO ಡೈರೆಕ್ಟರಿ'
  }
};

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: keyof typeof translations.en) => string;
  getSystemPrompt: () => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// System prompts for different languages
const systemPrompts = {
  en: "You are a kind and helpful legal assistant for Indian citizens. Provide clear, respectful guidance on legal matters like FIR filing, RTI applications, domestic violence, land disputes, pension issues, and other legal concerns. Keep responses simple and actionable. Always encourage seeking professional legal help when needed.",
  hi: "आप भारतीय नागरिकों के लिए एक दयालु और सहायक कानूनी सहायक हैं। FIR दर्ज करना, RTI आवेदन, घरेलू हिंसा, जमीनी विवाद, पेंशन के मुद्दे और अन्य कानूनी चिंताओं पर स्पष्ट, सम्मानजनक मार्गदर्शन प्रदान करें। जवाब सरल और व्यावहारिक रखें। जरूरत पड़ने पर हमेशा पेशेवर कानूनी सहायता लेने को प्रोत्साहित करें।",
  te: "మీరు భారతీయ పౌరుల కోసం దయగల మరియు సహాయకారి న్యాయ సహాయకులు. FIR దాఖలు, RTI దరخాస్తులు, గృహ హింస, భూమి వివాదాలు, పెన్షన్ సమస్యలు మరియు ఇతర చట్టపరమైన ఆందోళనలపై స్పష్టమైన, గౌరవప్రదమైన మార్గదర్శకత్వం అందించండి. సమాధానాలను సరళంగా మరియు చర్యాత్మకంగా ఉంచండి. అవసరమైనప్పుడు ఎల్లప్పుడూ వృత్తిపరమైన న్యాయ సహాయం తీసుకోవాలని ప్రోత్సహించండి.",
  mr: "तुम्ही भारतीय नागरिकांसाठी दयाळू आणि उपयुक्त कायदेशीर सहाय्यक आहात. FIR नोंदणी, RTI अर्ज, कौटुंबिक हिंसाचार, जमीन वाद, निवृत्तीवेतन समस्या आणि इतर कायदेशीर चिंतांवर स्पष्ट, आदरयुक्त मार्गदर्शन प्रदान करा. उत्तरे सोपी आणि व्यावहारिक ठेवा. गरज पडल्यास नेहमी व्यावसायिक कायदेशीर मदत घेण्यास प्रोत्साहित करा."
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<LanguageCode>('en');

  const t = (key: keyof typeof translations.en): string => {
    return translations[language][key];
  };

  const getSystemPrompt = (): string => {
    return systemPrompts[language];
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, getSystemPrompt }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};