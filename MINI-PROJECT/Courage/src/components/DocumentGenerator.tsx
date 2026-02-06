import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Download, MessageCircle, FileText, Loader2, Eye, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { sendChatMessage } from '@/services/openrouter';
import { downloadPDF, sharePDFOnWhatsApp, type DocumentData } from '@/utils/pdfGenerator';
import BackToHome from './BackToHome';

type DocumentType = 'FIR' | 'RTI';

const DocumentGenerator: React.FC = () => {
  const [documentType, setDocumentType] = useState<DocumentType>('FIR');
  const [description, setDescription] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [userDetails, setUserDetails] = useState({
    name: '',
    address: '',
    phone: ''
  });
  const [showPreview, setShowPreview] = useState(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  
  const { language, t } = useLanguage();
  const { toast } = useToast();

  const documentTypeLabels = {
    en: { FIR: 'FIR (First Information Report)', RTI: 'RTI (Right to Information)' },
    hi: { FIR: 'प्राथमिकी (FIR)', RTI: 'सूचना का अधिकार (RTI)' },
    te: { FIR: 'ప్రాథమిక నివేదిక (FIR)', RTI: 'సమాచార హక్కు (RTI)' },
    mr: { FIR: 'प्राथमिक अहवाल (FIR)', RTI: 'माहिती अधिकार (RTI)' }
  };

  const documentDetails = {
    FIR: {
      title: language === 'hi' ? 'प्राथमिकी (एफआईआर)' : 'First Information Report (FIR)',
      description: language === 'hi' ? 
        'किसी अपराध की पहली सूचना पुलिस को दर्ज कराने का आधिकारिक दस्तावेज' : 
        'Official document to report a crime or incident to the police',
      requirements: language === 'hi' ? [
        'घटना का विवरण और समय',
        'आरोपी का विवरण (यदि ज्ञात हो)',
        'गवाहों के नाम (यदि कोई हो)',
        'शिकायतकर्ता का विवरण'
      ] : [
        'Details of the incident and timing',
        'Description of accused (if known)',
        'Names of witnesses (if any)',
        'Complainant details'
      ]
    },
    RTI: {
      title: language === 'hi' ? 'सूचना का अधिकार' : 'Right to Information',
      description: language === 'hi' 
        ? 'सरकारी विभागों से जानकारी प्राप्त करने का कानूनी अधिकार' 
        : 'Legal right to request information from government departments',
      requirements: language === 'hi' ? [
        'जानकारी की मांग करने का कारण',
        'विभाग का नाम और पता',
        'आवेदनकर्ता का विवरण',
        'मांगी गई जानकारी का स्पष्ट विवरण',
        'संबंधित दस्तावेज़ (यदि कोई हो)'
      ] : [
        'Reason for requesting information',
        'Department name and address',
        'Applicant details',
        'Clear description of information sought',
        'Relevant documents (if any)'
      ]
    }
  };

  // Effect to handle preview updates
  useEffect(() => {
    if (generatedContent) {
      setIsPreviewLoading(false);
    }
  }, [generatedContent]);

  // Add state for preview content
  const [previewContent, setPreviewContent] = useState<string>('');

  // Add debounced preview update
  const updatePreview = useCallback((content: string) => {
    setPreviewContent(content);
    setIsPreviewLoading(false);
  }, []);

  const generateDocument = async () => {
    if (!description.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide a description of your issue.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    setIsPreviewLoading(true);

    try {
      const currentDate = new Date().toLocaleDateString();
      const currentTime = new Date().toLocaleTimeString();
      const docTitle = documentDetails[documentType].title.toUpperCase();

      const prompt = `Generate a detailed ${documentType} document in ${language === 'en' ? 'English' : language === 'hi' ? 'Hindi' : language === 'te' ? 'Telugu' : 'Marathi'}:

${'-'.repeat(docTitle.length)}
${docTitle}
${'-'.repeat(docTitle.length)}

Reference Number: ${Date.now().toString(36).toUpperCase()}
Date: ${currentDate}
Time: ${currentTime}

COMPLAINANT DETAILS
==================
${Object.entries(userDetails)
  .map(([key, value]) => `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value || '[Not provided]'}`)
  .join('\n')}

DETAILED DESCRIPTION
==================
${description.trim()}

${documentType === 'FIR' ? `INCIDENT DETAILS
================
• Nature of Complaint: ${description.split('\n')[0]}
• Location of Incident: [Extract from description]
• Date/Time of Incident: [Extract from description]
• Details of Accused/Suspects: [Extract from description]
• Witness Information: [If mentioned in description]
• Evidence Details: [If mentioned in description]` :

`RTI REQUEST DETAILS
=================
• Information Requested: ${description.split('\n')[0]}
• Department/Authority: [Extract from description]
• Purpose of Request: [Extract from description]
• Time Period: [Extract from description]`}

DECLARATION
==========
I hereby declare that all information provided above is true and correct to the best of my knowledge.

Signature: _________________
Name: ${userDetails.name || '[Name of Complainant]'}
Date: ${currentDate}
Place: ${userDetails.address ? userDetails.address.split(',').pop()?.trim() : '[Location]'}

Format this as an official legal document. Do not add any asterisks, markdown, or special characters.`;

      const response = await sendChatMessage([{ role: 'user', content: prompt }]);

      if (!response) {
        throw new Error('Document generation failed - no response');
      }

      // Format response while preserving newlines
      const formattedContent = response
        .replace(/\n{3,}/g, '\n\n')
        .trim();

      setGeneratedContent(formattedContent);
      updatePreview(formattedContent);
      
      toast({
        title: "Document generated",
        description: `Your ${documentType} has been prepared successfully.`
      });
    } catch (error) {
      console.error('Document generation error:', error);
      toast({
        title: "Generation failed",
        description: error instanceof Error 
          ? error.message 
          : "Failed to generate document. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!generatedContent) return;

    const documentData: DocumentData = {
      type: documentType,
      content: generatedContent,
      userDetails: {
        name: userDetails.name || undefined,
        address: userDetails.address || undefined,
        phone: userDetails.phone || undefined
      },
      language
    };

    downloadPDF(documentData);
    
    toast({
      title: "Download started",
      description: "Your document is being downloaded."
    });
  };
  const handleWhatsAppShare = () => {
    if (!generatedContent) return;

    const documentData: DocumentData = {
      type: documentType,
      content: generatedContent,
      language
    };

    sharePDFOnWhatsApp(documentData);
  };

    return (
      <div className="space-y-6 max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">{t('documentGen')}</h2>
        <BackToHome />
      </div>
        {/* Header */}
        

        <div className="grid gap-6 md:grid-cols-2">
          {/* Input Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Document Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Document Type */}
              <div className="space-y-2">
                <Label>Document Type</Label>
                <Select value={documentType} onValueChange={(value: DocumentType) => setDocumentType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FIR">{documentTypeLabels[language].FIR}</SelectItem>
                    <SelectItem value="RTI">{documentTypeLabels[language].RTI}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Issue Description */}
              <div className="space-y-2">
                <Label>Describe Your Issue</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="resize-none"
                  rows={6}
                  placeholder={
                    language === 'hi' ? 'अपनी समस्या का विस्तार से वर्णन करें...' :
                    language === 'te' ? 'మీ సమస్యను వివరంగా వివరించండి...' :
                    language === 'mr' ? 'तुमच्या समस्येचे तपशीलवार वर्णन करा...' :
                    'Describe your issue in detail...'
                  }
                />
              </div>

              {/* User Details */}
              <div className="space-y-3">
                <Label>Your Details (Optional)</Label>
                <Input
                  value={userDetails.name}
                  onChange={(e) => setUserDetails({...userDetails, name: e.target.value})}
                  placeholder="Full Name"
                />
                <Input
                  value={userDetails.phone}
                  onChange={(e) => setUserDetails({...userDetails, phone: e.target.value})}
                  placeholder="Phone Number"
                />
                <Textarea
                  value={userDetails.address}
                  onChange={(e) => setUserDetails({...userDetails, address: e.target.value})}
                  placeholder="Address"
                  rows={2}
                />
              </div>

              {/* Preview Button - Add this before the Generate Button */}
              {generatedContent && (
                <Button
                  onClick={() => setShowPreview(true)}
                  variant="secondary"
                  className="w-full mb-2"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Preview Full Document
                </Button>
              )}

              <Button 
                onClick={generateDocument}
                disabled={isGenerating || !description.trim()}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    {t('generateDocument')}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Generated Document Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Document Preview</CardTitle>
            </CardHeader>
            <CardContent>
              {isPreviewLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : generatedContent ? (
                <div className="space-y-4">
                  <div className="max-h-[600px] overflow-y-auto p-4 bg-muted/50 rounded-lg">
                    <pre className="whitespace-pre-wrap text-sm font-mono leading-relaxed break-words">
                      {generatedContent}
                    </pre>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleDownload}
                      variant="outline"
                      className="flex-1"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      {t('downloadPDF')}
                    </Button>
                    
                    <Button 
                      onClick={handleWhatsAppShare}
                      variant="outline"
                      className="flex-1 text-empowerment-green border-empowerment-green hover:bg-empowerment-green hover:text-white"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      {t('shareWhatsApp')}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Generated document will appear here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Preview Modal */}
        {showPreview && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-[90%] max-w-3xl max-h-[90vh] overflow-hidden">
              <div className="p-4 border-b flex justify-between items-center">
                <h3 className="text-lg font-semibold">Full Document Preview</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowPreview(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-8rem)]">
                <div className="prose prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap font-sans bg-gray-50 p-4 rounded-lg">
                    {generatedContent}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  export default DocumentGenerator;