import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Phone, Mail, Home, Filter, MessageCircle, ShieldCheck, Scale, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fetchVerifiedUsers } from '@/services/requestService';
import { useLanguage } from '@/contexts/LanguageContext';

interface Lawyer {
  id: number;
  name: string;
  email: string | null;
  contact_number: string | null;
  enrollment_number: string | null;
  specialization?: string;
  location?: string;
  languages?: string[];
  experience?: number;
  availability?: 'available' | 'busy' | 'unavailable';
  isVerified: boolean;
}

const LawyersDirectory = () => {
  const { language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('all');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [selectedAvailability, setSelectedAvailability] = useState<'available' | 'all'>('available');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [verifiedLawyers, setVerifiedLawyers] = useState<Lawyer[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetchVerifiedUsers('lawyer');
        if (active) {
          const lawyersData = Array.isArray(response) ? response : (response?.users ?? []);
          setVerifiedLawyers(
            lawyersData.map((lawyer: any) => ({
              ...lawyer,
              specialization: lawyer.specialization || 'General Practice',
              location: lawyer.location || 'Pan India',
              languages: lawyer.languages || ['English', 'Hindi'],
              experience: lawyer.experience || 5,
              availability: lawyer.availability || 'available',
              isVerified: true,
            }))
          );
        }
      } catch (err: any) {
        if (active) {
          setError(err?.response?.data?.error || 'Failed to load verified lawyers');
          // Fallback to mock data for demo
          setVerifiedLawyers([
            {
              id: 1,
              name: 'Rajesh Kumar',
              email: 'rajesh@example.com',
              contact_number: '+91-9876543210',
              enrollment_number: 'ENC001',
              specialization: 'Criminal Law',
              location: 'Delhi',
              languages: ['English', 'Hindi'],
              experience: 12,
              availability: 'available',
              isVerified: true,
            },
            {
              id: 2,
              name: 'Priya Singh',
              email: 'priya@example.com',
              contact_number: '+91-9876543211',
              enrollment_number: 'ENC002',
              specialization: 'Family Law',
              location: 'Mumbai',
              languages: ['English', 'Hindi', 'Marathi'],
              experience: 8,
              availability: 'available',
              isVerified: true,
            },
            {
              id: 3,
              name: 'Amit Patel',
              email: 'amit@example.com',
              contact_number: '+91-9876543212',
              enrollment_number: 'ENC003',
              specialization: 'Civil Law',
              location: 'Bangalore',
              languages: ['English', 'Hindi', 'Telugu'],
              experience: 15,
              availability: 'busy',
              isVerified: true,
            },
          ]);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, []);

  // Extract unique specializations and languages
  const allSpecializations = Array.from(new Set(verifiedLawyers.map(lawyer => lawyer.specialization || 'General Practice')));
  const specializations = ['all', ...allSpecializations];
  
  const allLanguages = Array.from(new Set(verifiedLawyers.flatMap(lawyer => lawyer.languages || ['English'])));
  const languages = ['all', ...allLanguages];

  const filteredLawyers = verifiedLawyers.filter(lawyer => {
    const matchesSearch = 
      lawyer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lawyer.specialization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lawyer.location?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSpecialization = selectedSpecialization === 'all' || lawyer.specialization === selectedSpecialization;
    const matchesLanguage = selectedLanguage === 'all' || lawyer.languages?.includes(selectedLanguage);
    const matchesAvailability = selectedAvailability === 'all' || lawyer.availability === 'available';
    
    return matchesSearch && matchesSpecialization && matchesLanguage && matchesAvailability && lawyer.isVerified;
  });

  const getAvailabilityColor = (availability?: string) => {
    switch (availability) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'busy':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getAvailabilityLabel = (availability?: string) => {
    switch (availability) {
      case 'available':
        return language === 'hi' ? 'उपलब्ध' : 'Available';
      case 'busy':
        return language === 'hi' ? 'व्यस्त' : 'Busy';
      default:
        return language === 'hi' ? 'अनुपलब्ध' : 'Unavailable';
    }
  };

  const content = (
    <div className="min-h-screen bg-[#EEFCEB]">
      <div className="space-y-6 max-w-6xl mx-auto p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-[#153243]">
            {language === 'hi' ? 'वकील निर्देशिका' :
             language === 'te' ? 'న్యాయవాది సూచిక' :
             language === 'mr' ? 'वकील निर्देशिका' :
             'Lawyers Directory'}
          </h2>
          <Button variant="outline" size="sm" onClick={() => navigate('/home')}>
            <Home className="h-4 w-4 mr-2" />
            {language === 'hi' ? 'होम' : 'Home'}
          </Button>
        </div>

        {/* Search and Filter */}
        <Card className="bg-[#F4F9E9]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#153243]">
              <Scale className="h-5 w-5" />
              {language === 'hi' ? 'प्रमाणित वकीलों को खोजें' :
               language === 'te' ? 'ధృవీకృత న్యాయవాదులను కనుగొనండి' :
               language === 'mr' ? 'प्रमाणित वकीलांना शोधा' :
               'Find Verified Lawyers'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="flex gap-2">
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={language === 'hi' ? 'नाम, विशेषज्ञता या स्थान से खोजें...' : 'Search by name, specialization, or location...'}
                  className="flex-1"
                />
                <Button>
                  <Search className="h-4 w-4" />
                </Button>
              </div>

              {/* Specialization Filter */}
              <div className="space-y-2">
                <p className="text-sm text-[#284B63] flex items-center gap-2 font-semibold">
                  <Filter className="h-4 w-4" />
                  {language === 'hi' ? 'विशेषज्ञता:' :
                   language === 'te' ? 'విశేషత్వం:' :
                   language === 'mr' ? 'विशेषज्ञता:' :
                   'Specialization:'}
                </p>
                <div className="flex flex-wrap gap-2">
                  {specializations.map((spec) => (
                    <Button
                      key={spec}
                      variant={selectedSpecialization === spec ? 'default' : 'outline'}
                      size="sm"
                      className={selectedSpecialization === spec ? 'bg-[#153243] text-white' : ''}
                      onClick={() => setSelectedSpecialization(spec)}
                    >
                      {spec === 'all' ? 
                        (language === 'hi' ? 'सभी' : 'All') : spec}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Language Filter */}
              <div className="space-y-2">
                <p className="text-sm text-[#284B63] font-semibold">
                  {language === 'hi' ? 'भाषा:' :
                   language === 'te' ? 'భాష:' :
                   language === 'mr' ? 'भाषा:' :
                   'Language:'}
                </p>
                <div className="flex flex-wrap gap-2">
                  {languages.map((lang) => (
                    <Button
                      key={lang}
                      variant={selectedLanguage === lang ? 'default' : 'outline'}
                      size="sm"
                      className={selectedLanguage === lang ? 'bg-[#153243] text-white' : ''}
                      onClick={() => setSelectedLanguage(lang)}
                    >
                      {lang === 'all' ? 
                        (language === 'hi' ? 'सभी' : 'All') : lang}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Availability Filter */}
              <div className="space-y-2">
                <p className="text-sm text-[#284B63] flex items-center gap-2 font-semibold">
                  <ShieldCheck className="h-4 w-4" />
                  {language === 'hi' ? 'उपलब्धता:' :
                   language === 'te' ? 'లభ్యత:' :
                   language === 'mr' ? 'उपलब्धता:' :
                   'Availability:'}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedAvailability === 'available' ? 'default' : 'outline'}
                    size="sm"
                    className={selectedAvailability === 'available' ? 'bg-green-600 text-white' : ''}
                    onClick={() => setSelectedAvailability('available')}
                  >
                    {language === 'hi' ? 'उपलब्ध' : 'Available'}
                  </Button>
                  <Button
                    variant={selectedAvailability === 'all' ? 'default' : 'outline'}
                    size="sm"
                    className={selectedAvailability === 'all' ? 'bg-[#153243] text-white' : ''}
                    onClick={() => setSelectedAvailability('all')}
                  >
                    {language === 'hi' ? 'सभी' : 'All'}
                  </Button>
                </div>
              </div>

              <div className="text-sm text-[#284B63]">
                {language === 'hi' 
                  ? `${filteredLawyers.length} में से ${verifiedLawyers.length} प्रमाणित वकील दिखा रहे हैं`
                  : `Showing ${filteredLawyers.length} of ${verifiedLawyers.length} verified lawyers`}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lawyers List */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <div className="col-span-full text-center py-12">
              <div className="h-10 w-10 mx-auto mb-4 animate-spin rounded-full border-4 border-[#153243] border-t-transparent" />
              <p className="text-lg font-medium text-[#153243]">
                {language === 'hi' ? 'वकील लोड हो रहे हैं...' : 'Loading verified lawyers...'}
              </p>
            </div>
          ) : error ? (
            <div className="col-span-full text-center py-12">
              <Scale className="h-12 w-12 mx-auto mb-4 text-[#284B63] opacity-50" />
              <p className="text-lg font-medium text-[#153243]">
                {language === 'hi' ? 'वकीलों को लोड करने में असमर्थ' : 'Unable to load lawyers'}
              </p>
              <p className="text-sm mt-2 text-[#284B63]">{error}</p>
            </div>
          ) : filteredLawyers.length > 0 ? (
            filteredLawyers.map((lawyer) => (
              <Card key={lawyer.id} className="bg-[#F4F9E9] hover:shadow-lg transition-all duration-300 border-[#284B63]/10">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg text-[#153243]">{lawyer.name}</CardTitle>
                      <Badge className="mt-2 bg-[#153243] text-white">
                        {lawyer.enrollment_number}
                      </Badge>
                    </div>
                    <Badge className={`${getAvailabilityColor(lawyer.availability)}`}>
                      {getAvailabilityLabel(lawyer.availability)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Specialization and Experience */}
                  <div className="space-y-2 pb-3 border-b border-[#284B63]/10">
                    <div className="flex items-center gap-2">
                      <Scale className="h-4 w-4 text-[#153243]" />
                      <span className="text-sm font-semibold text-[#153243]">
                        {lawyer.specialization}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm text-[#284B63]">
                        {lawyer.experience} {language === 'hi' ? 'वर्षों का अनुभव' : 'years experience'}
                      </span>
                    </div>
                  </div>

                  {/* Location and Languages */}
                  <div className="space-y-2 pb-3 border-b border-[#284B63]/10">
                    <p className="text-xs text-[#284B63] font-semibold">
                      {language === 'hi' ? 'स्थान:' : 'Location:'} {lawyer.location}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {lawyer.languages?.map((lang, idx) => (
                        <Badge key={idx} variant="secondary" className="bg-[#284B63]/10 text-[#284B63] text-xs">
                          {lang}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="space-y-2">
                    {lawyer.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-[#153243]" />
                        <span className="truncate text-[#284B63]">{lawyer.email}</span>
                      </div>
                    )}
                    {lawyer.contact_number && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-[#153243]" />
                        <span className="text-[#284B63]">{lawyer.contact_number}</span>
                      </div>
                    )}
                  </div>

                  {/* Contact Button */}
                  <Button 
                    className="w-full bg-[#153243] hover:bg-[#284B63] text-white transition-colors mt-4"
                    onClick={() => {
                      // Navigate to chat with lawyer
                      // WhatsApp or email integration can be added here
                    }}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    {language === 'hi' ? 'संपर्क करें' :
                     language === 'te' ? 'సంప్రదించండి' :
                     language === 'mr' ? 'संपर्क साधा' :
                     'Contact'}
                  </Button>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <Scale className="h-12 w-12 mx-auto mb-4 text-[#284B63] opacity-50" />
              <p className="text-lg font-medium text-[#153243]">
                {language === 'hi' ? 'कोई प्रमाणित वकील उपलब्ध नहीं है' : 'No verified lawyers available'}
              </p>
              <p className="text-sm mt-2 text-[#284B63]">
                {language === 'hi' ? 'अपने खोज या फिल्टर को समायोजित करने का प्रयास करें' : 'Try adjusting your search or filters'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return content;
};

export default LawyersDirectory;
