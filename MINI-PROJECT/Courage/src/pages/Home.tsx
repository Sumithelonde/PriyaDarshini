import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle, FileText, Users, Camera, BookOpen, Languages, UserCircle2, LogOut, Scale } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSelector from '@/components/LanguageSelector';
import { getMe } from '@/services/authService';
import { getUser, signOut } from '@/utils/authStorage';
import { useNavigate } from 'react-router-dom';


const Home: React.FC = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [userInfo, setUserInfo] = useState<{ name?: string; email?: string; role?: string } | null>(getUser());
  const [loadingUser, setLoadingUser] = useState(false);

  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let active = true;
    const fetchUser = async () => {
      setLoadingUser(true);
      try {
        const response = await getMe();
        if (active) {
          setUserInfo(response?.user ?? getUser());
        }
      } catch {
        if (active) {
          setUserInfo(getUser());
        }
      } finally {
        if (active) setLoadingUser(false);
      }
    };

    fetchUser();

    return () => {
      active = false;
    };
  }, []);



  useEffect(() => {
    if (!profileOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, [profileOpen]);

  const handleLogout = () => {
    signOut();
    navigate('/login');
  };

  const handleNavigate = (action: string) => {
    switch(action) {
      case 'chat':
        window.open('http://localhost:5678/webhook/86816cfb-edb3-41c2-a959-b5c72a110eb6/chat', '_blank');
        break;
      case 'ocr':
        navigate('/ocr');
        break;
      case 'document':
        navigate('/document');
        break;
      case 'ngo':
        navigate('/individual');
        break;
      case 'dictionary':
        navigate('/dictionary');
        break;
      case 'translator':
        navigate('/translator');
        break;
      case 'case-tracker':
        navigate('/case-tracker');
        break;
      case 'lawyers':
        navigate('/individual');
        break;
      default:
        break;
    }
  };

  const features = [
    {
      icon: MessageCircle,
      title: t('askQuestion'),
      description: language === 'hi' ? 'अपनी भाषा में तुरंत कानूनी मार्गदर्शन प्राप्त करें' :
                   language === 'te' ? 'మీ భాషలో తక్షణ చట్టపరమైన మార్గదర్శకత్వం పొందండి' :
                   language === 'mr' ? 'तुमच्या भाषेत त्वरित कायदेशीर मार्गदर्शन मिळवा' :
                   'Get instant legal guidance in your language',
      action: () => handleNavigate('chat'),
      color: 'text-[#153243]',
      bgColor: 'bg-[#153243]/10'
    },
    {
      icon: Camera,
      title: language === 'hi' ? 'दस्तावेज़ स्कैन करें' :
             language === 'te' ? 'డాక్యుమెంట్ స్కాన్ చేయండి' :
             language === 'mr' ? 'दस्तऐवज स्कॅन करा' :
             'Scan Document',
      description: language === 'hi' ? 'AI के साथ कानूनी दस्तावेज़ों को अपलोड और समझें' :
                   language === 'te' ? 'AI తో చట్టపరమైన పత్రాలను అప్‌లోడ్ చేసి వివరించండి' :
                   language === 'mr' ? 'AI सह कायदेशीर कागदपत्रे अपलोड करा आणि समजून घ्या' :
                   'Upload and explain legal documents with AI',
      action: () => handleNavigate('ocr'),
      color: 'text-[#153243]',
      bgColor: 'bg-[#153243]/10'
    },
    {
      icon: FileText,
      title: t('documentGen'),
      description: language === 'hi' ? 'FIR, RTI और अन्य कानूनी दस्तावेज तैयार करें' :
                   language === 'te' ? 'FIR, RTI మరియు ఇతర చట్టపరమైన పత్రాలను తయారు చేయండి' :
                   language === 'mr' ? 'FIR, RTI आणि इतर कायदेशीर कागदपत्रे तयार करा' :
                   'Generate FIR, RTI and other legal documents',
      action: () => handleNavigate('document'),
      color: 'text-[#284B63]',
      bgColor: 'bg-[#284B63]/10'
    },
    {
      icon: Users,
      title: t('ngoDirectory'),
      description: language === 'hi' ? 'अपने आस-पास की कानूनी सहायता संस्थाओं को खोजें' :
                   language === 'te' ? 'మీ సమీపంలోని న్యాయ సహాయ సంస్థలను కనుగొనండి' :
                   language === 'mr' ? 'तुमच्या जवळील कायदेशीर मदत संस्था शोधा' :
                   'Find legal aid organizations near you',
      action: () => handleNavigate('ngo'),
      color: 'text-[#153243]',
      bgColor: 'bg-[#153243]/10'
    },
    {
      icon: Scale,
      title: language === 'hi' ? 'प्रमाणित वकील' :
             language === 'te' ? 'ధృవీకృత న్యాయవాదులు' :
             language === 'mr' ? 'प्रमाणित वकील' :
             'Verified Lawyers',
      description: language === 'hi' ? 'अनुभवी वकीलों से कानूनी सलाह लें' :
                   language === 'te' ? 'అనుభవ సంపన్న న్యాయవాదుల నుండి చట్టపరమైన సలహా పొందండి' :
                   language === 'mr' ? 'अनुभवी वकीलांकडून कायदेशीर सल्ला घ्या' :
                   'Get legal advice from experienced lawyers',
      action: () => handleNavigate('lawyers'),
      color: 'text-[#284B63]',
      bgColor: 'bg-[#284B63]/10'
    },
    {
      icon: Scale,
      title: language === 'hi' ? 'केस ट्रैकर' :
             language === 'te' ? 'కేస్ ట్రాకర్' :
             language === 'mr' ? 'केस ट्रॅकर' :
             'Case Tracker',
      description: language === 'hi' ? 'अपने मामलों की स्थिति और सुनवाई तारीखें ट्रैक करें' :
                   language === 'te' ? 'మీ కేసుల స్థితి మరియు విచారణ తేదీలను ట్రాక్ చేయండి' :
                   language === 'mr' ? 'तुमच्या प्रकरणांची स्थिती आणि सुनावणी तारीख ट्रॅक करा' :
                   'Track case status and hearing dates',
      action: () => handleNavigate('case-tracker'),
      color: 'text-[#284B63]',
      bgColor: 'bg-[#284B63]/10'
    },
    {
      icon: Languages,
      title: language === 'hi' ? 'दस्तावेज़ अनुवादक' :
             language === 'te' ? 'డాక్యుమెంట్ అనువాదకుడు' :
             language === 'mr' ? 'दस्तऐवज भाषांतरकार' :
             'Document Translator',
      description: language === 'hi' ? 'कानूनी दस्तावेजों का अनुवाद करें और समझें' :
                   language === 'te' ? 'చట్టపరమైన పత్రాలను అనువదించండి మరియు అర్థం చేసుకోండి' :
                   language === 'mr' ? 'कायदेशीर कागदपत्रांचे भाषांतर करा आणि समजून घ्या' :
                   'Translate and understand legal documents',
      action: () => handleNavigate('translator'),
      color: 'text-[#284B63]',
      bgColor: 'bg-[#284B63]/10'
    },
    {
      icon: BookOpen,
      title: language === 'hi' ? 'कानूनी शब्दकोश' :
             language === 'te' ? 'న్యాయ నిఘంటువు' :
             language === 'mr' ? 'कायदेशीर शब्दकोश' :
             'Legal Dictionary',
      description: language === 'hi' ? 'कानूनी शब्दों और परिभाषाओं को खोजें' :
                   language === 'te' ? 'చట్టపరమైన పదాలు మరియు నిర్వచనాలను శోధించండి' :
                   language === 'mr' ? 'कायदेशीर शब्द आणि व्याख्या शोधा' :
                   'Search legal terms and definitions',
      action: () => handleNavigate('dictionary'),
      color: 'text-[#153243]',
      bgColor: 'bg-[#153243]/10'
    }
  ];

  return (
    <div className="min-h-screen bg-[#EEFCEB]">
      <div className="container mx-auto px-4 pt-6">
        <div className="flex items-center justify-end" ref={menuRef}>
          <button
            type="button"
            onClick={() => setProfileOpen((prev) => !prev)}
            className="flex items-center gap-2 rounded-full border border-[#284B63]/30 bg-white/90 px-3 py-2 text-[#153243] shadow-sm hover:shadow-md transition"
            aria-label="Open profile menu"
          >
            <UserCircle2 className="h-6 w-6" />
            <span className="text-sm font-medium">Profile</span>
          </button>

          {profileOpen && (
            <div className="absolute right-6 top-20 z-50 w-64 rounded-xl border border-[#284B63]/20 bg-white shadow-lg">
              <div className="px-4 py-3 border-b border-[#284B63]/10">
                <p className="text-sm font-semibold text-[#153243]">User Profile</p>
                {loadingUser ? (
                  <p className="text-xs text-[#284B63] mt-1">Loading...</p>
                ) : (
                  <div className="mt-2 space-y-1 text-sm text-[#284B63]">
                    <p><span className="font-medium">Name:</span> {userInfo?.name || 'N/A'}</p>
                    <p><span className="font-medium">Email:</span> {userInfo?.email || 'N/A'}</p>
                    <p><span className="font-medium">Role:</span> {userInfo?.role || 'N/A'}</p>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                Log Out
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="relative mb-12 rounded-3xl overflow-hidden bg-gradient-to-r from-[#153243] via-[#284B63] to-[#B4B8AB] p-12 text-[#F4F9E9]">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative z-10">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-4">
                Legislate AI
              </h1>
              
              <p className="text-xl md:text-2xl mb-2 opacity-90">
                आपकी आवाज़ है आपका अधिकार
              </p>
              
              <p className="text-lg mb-8 opacity-80">
                कानूनी समस्याओं का समाधान • दस्तावेज़ निर्माण • विशेषज्ञ सहायता
              </p>
              
              <div className="flex justify-center">
                <LanguageSelector />
              </div>
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute bottom-10 right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
        </div>

        {/* Features Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12">
          {features.map((feature, index) => (
            <div
              key={index}
              className="hover:shadow-lg transition-all duration-300 cursor-pointer group"
              onClick={feature.action}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  feature.action();
                }
              }}
            >
              <Card className="bg-[#F4F9E9] h-full">
                <CardHeader className="text-center pb-2">
                  <div className={`w-16 h-16 rounded-full ${feature.bgColor} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                    <feature.icon className={`h-8 w-8 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-lg text-[#153243]">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-sm text-[#284B63] mb-4">
                    {feature.description}
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="w-full group-hover:bg-[#153243] group-hover:text-[#F4F9E9] transition-colors border-[#284B63]"
                    onClick={(e) => {
                      e.stopPropagation();
                      feature.action();
                    }}
                  >
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* Info Section */}
        <Card className="max-w-3xl mx-auto bg-[#F4F9E9] mb-12">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-semibold mb-4 text-[#153243]">
              {language === 'hi' ? 'सभी के लिए न्याय' :
               language === 'te' ? 'అందరికీ న్యాయం' :
               language === 'mr' ? 'सर्वांसाठी न्याय' :
               'Justice for Everyone'}
            </h2>
            <p className="text-[#284B63] leading-relaxed">
              {language === 'hi' ? 'लेजिस्लेट AI आपकी भाषा में कानूनी सहायता प्रदान करता है। FIR दर्ज करने से लेकर RTI आवेदन तक, हम आपकी हर कानूनी जरूरत में मदद करते हैं।' :
language === 'te' ? 'లెజిస్లేట్ AI మీ భాషలో న్యాయ సహాయం అందిస్తుంది. FIR నమోదు చేయడం నుండి RTI దరఖాస్తు వరకు, మేము మీ ప్రతి చట్టపరమైన అవసరంలో సహాయం చేస్తాము.' :
language === 'mr' ? 'लेजिस्लेट AI तुमच्या भाषेत कायदेशीर मदत पुरवते. FIR नोंदणीपासून RTI अर्जापर्यंत, आम्ही तुमच्या प्रत्येक कायदेशीर गरजेत मदत करतो.' :
'Legislate AI provides legal assistance in your language. From filing FIR to RTI applications, we help with all your legal needs.'
  }
            </p>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default Home;