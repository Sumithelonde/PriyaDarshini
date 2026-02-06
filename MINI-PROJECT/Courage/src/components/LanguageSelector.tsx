import React from 'react';
import { useLanguage, LANGUAGES, LanguageCode } from '@/contexts/LanguageContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Globe } from 'lucide-react';

const LanguageSelector: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="flex items-center gap-2">
  <Globe className="h-5 w-5 text-foreground opacity-80" />
      <Select value={language} onValueChange={(value: LanguageCode) => setLanguage(value)}>
        <SelectTrigger className="w-[140px] bg-background border-border text-foreground">
          <SelectValue placeholder={t('selectLanguage')} />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(LANGUAGES).map(([code, lang]) => (
            <SelectItem key={code} value={code}>
              <span className="font-medium">{lang.nativeName}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default LanguageSelector;