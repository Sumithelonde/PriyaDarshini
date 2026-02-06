import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ArrowRight, Loader2, Languages, Upload, Download, Home, FileText } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { sendChatMessage } from '@/services/openrouter';

const supportedLanguages = {
  en: 'English',
  hi: 'हिंदी',
  mr: 'मराठी',
  te: 'తెలుగు',
  gu: 'ગુજરાતી',
  bn: 'বাংলা',
  ta: 'தமிழ்',
  kn: 'ಕನ್ನಡ'
};

const DocumentTranslator = () => {
  const [sourceText, setSourceText] = useState('');
  const [targetLang, setTargetLang] = useState('en');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedContent, setTranslatedContent] = useState('');
  
  const { language } = useLanguage();
  const { toast } = useToast();

  const handleTranslate = async () => {
    if (!sourceText.trim()) {
      toast({
        title: "Missing text",
        description: "Please enter text to translate",
        variant: "destructive"
      });
      return;
    }

    setIsTranslating(true);

    try {
      // Simplified prompt
      const prompt = `Please translate this text to ${supportedLanguages[targetLang]}:

${sourceText.trim()}

Rules:
1. Translate directly without additional explanations
2. Keep formatting and line breaks
3. Maintain proper nouns as is
4. Keep legal terms accurate`;

      const response = await sendChatMessage([
        { 
          role: 'system', 
          content: 'You are a legal document translator. Translate accurately and maintain formatting.' 
        },
        { 
          role: 'user', 
          content: prompt 
        }
      ]);

      if (response) {
        setTranslatedContent(response.trim());
        toast({
          title: "Success",
          description: "Translation completed"
        });
      } else {
        throw new Error('No translation received');
      }
    } catch (error) {
      console.error('Translation error:', error);
      toast({
        title: "Translation failed",
        description: "Please try again with shorter text",
        variant: "destructive"
      });
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold text-foreground">Legal Document Translator</h2>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Source Text */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Original Text
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Textarea
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                placeholder="Enter legal text to translate..."
                className="min-h-[400px] resize-none font-mono"
              />
            </div>
          </CardContent>
        </Card>

        {/* Translation Result */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Translated Text</CardTitle>
              <Select value={targetLang} onValueChange={setTargetLang}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(supportedLanguages).map(([code, name]) => (
                    <SelectItem key={code} value={code}>{name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="min-h-[400px] p-4 bg-muted rounded-lg overflow-auto">
                {isTranslating ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : translatedContent ? (
                  <pre className="whitespace-pre-wrap text-sm font-mono">
                    {translatedContent}
                  </pre>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    Translation will appear here
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleTranslate}
                  disabled={isTranslating || !sourceText.trim()}
                  className="flex-1"
                >
                  <Languages className="h-4 w-4 mr-2" />
                  Translate
                </Button>

                {translatedContent && (
                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText(translatedContent);
                      toast({
                        title: "Copied",
                        description: "Translation copied to clipboard"
                      });
                    }}
                    variant="outline"
                  >
                    Copy
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DocumentTranslator;
