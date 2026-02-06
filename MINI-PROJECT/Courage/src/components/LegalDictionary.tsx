import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Book, Home, ArrowRight, Loader2, Languages, BookOpen, Scale } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { sendChatMessage } from '@/services/openrouter';
import { useNavigate } from 'react-router-dom';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const LegalDictionary = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [simpleDefinition, setSimpleDefinition] = useState('');
  const [legalDefinition, setLegalDefinition] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const { language } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिंदी (Hindi)' },
    { code: 'mr', name: 'मराठी (Marathi)' },
    { code: 'te', name: 'తెలుగు (Telugu)' },
  ];

  const getLanguageName = (code: string) => {
    const lang = languages.find(l => l.code === code);
    return lang ? lang.name.split('(')[0].trim() : 'English';
  };

  const searchLegalTerm = async (termToSearch?: string) => {
    const term = termToSearch || searchTerm;
    
    if (!term.trim()) {
      toast({
        title: "Enter a term",
        description: "Please enter a legal term to search",
        variant: "destructive"
      });
      return;
    }

    setIsSearching(true);
    setSimpleDefinition('');
    setLegalDefinition('');

    try {
      const languageName = getLanguageName(selectedLanguage);
      
      // Get Simple Definition
      const simplePrompt = `Explain the legal term "${term}" in ${languageName} in a SIMPLE way for common people who don't know law.

Format:
📖 Simple Definition: [Easy explanation in 2-3 lines]
💡 Why it matters: [Real-life importance]
📝 Example: [Practical example in a sentence]

Keep it conversational and easy to understand.`;

      // Get Legal Definition
      const legalPrompt = `Explain the legal term "${term}" in ${languageName} in TECHNICAL LEGAL language for law professionals and students.

Format:
⚖️ Legal Definition: [Precise legal meaning]
📚 Legal Context: [Where and how it's used in law]
🔗 Related Terms: [Connected legal concepts]
📋 Statutory Reference: [Relevant laws/sections if applicable]
⚠️ Key Points: [Important legal considerations]

Use proper legal terminology.`;

      const [simpleResponse, legalResponse] = await Promise.all([
        sendChatMessage([{ role: 'user', content: simplePrompt }]),
        sendChatMessage([{ role: 'user', content: legalPrompt }])
      ]);

      if (!simpleResponse || !legalResponse) {
        throw new Error('Failed to fetch definitions');
      }

      setSimpleDefinition(simpleResponse.trim());
      setLegalDefinition(legalResponse.trim());
      
      toast({
        title: "Success",
        description: "Legal term definitions loaded",
      });
    } catch (error) {
      console.error('Search error:', error);
      setSimpleDefinition('');
      setLegalDefinition('');
      toast({
        title: "Search failed",
        description: error instanceof Error ? error.message : "Please check your API key and try again",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  const commonLegalTerms = [
    'Affidavit', 'Bail', 'FIR', 'RTI', 'PIL', 
    'Writ Petition', 'Habeas Corpus', 'Civil Rights',
    'Consumer Rights', 'Fundamental Rights', 'Estoppel',
    'Jurisdiction', 'Plaintiff', 'Defendant'
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Legal Dictionary</h2>
        <Button variant="outline" size="sm" onClick={() => navigate('/')}>
          <Home className="h-4 w-4 mr-2" />
          Home
        </Button>
      </div>

      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Book className="h-5 w-5" />
            Search Legal Terms
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Language Selector */}
            <div className="flex items-center gap-2">
              <Languages className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Search Input */}
            <div className="flex gap-2">
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Enter a legal term (English or Indian languages)..."
                className="flex-1"
                onKeyDown={(e) => e.key === 'Enter' && searchLegalTerm()}
              />
              <Button onClick={() => searchLegalTerm()} disabled={isSearching}>
                {isSearching ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* Common Terms */}
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Common Legal Terms:</p>
              <div className="flex flex-wrap gap-2">
                {commonLegalTerms.map((term) => (
                  <Button
                    key={term}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchTerm(term);
                      searchLegalTerm(term);
                    }}
                    disabled={isSearching}
                  >
                    {term}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Section with Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Definition & Explanation</CardTitle>
        </CardHeader>
        <CardContent>
          {isSearching ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Loading definitions...</span>
            </div>
          ) : simpleDefinition || legalDefinition ? (
            <Tabs defaultValue="simple" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="simple" className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Simple Mode
                </TabsTrigger>
                <TabsTrigger value="legal" className="flex items-center gap-2">
                  <Scale className="h-4 w-4" />
                  Legal Mode
                </TabsTrigger>
              </TabsList>
              <TabsContent value="simple" className="mt-4">
                <div className="prose prose-slate max-w-none">
                  <pre className="whitespace-pre-wrap font-sans text-sm bg-muted p-4 rounded-lg">
                    {simpleDefinition}
                  </pre>
                </div>
              </TabsContent>
              <TabsContent value="legal" className="mt-4">
                <div className="prose prose-slate max-w-none">
                  <pre className="whitespace-pre-wrap font-sans text-sm bg-muted p-4 rounded-lg">
                    {legalDefinition}
                  </pre>
                </div>
              </TabsContent>
            </Tabs>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Book className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Search for a legal term</p>
              <p className="text-sm mt-2">Get definitions in both Simple and Legal modes</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LegalDictionary;
