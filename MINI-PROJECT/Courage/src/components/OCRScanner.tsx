import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { sendChatMessage } from '@/services/openrouter';
import { generatePDF } from '@/utils/pdfGenerator';
import { Upload, FileText, Download, Share2, Loader2 } from 'lucide-react';
import Tesseract from 'tesseract.js';

const OCRScanner: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState('');
  const [explanation, setExplanation] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExplaining, setIsExplaining] = useState(false);
  const { toast } = useToast();
  const { t, language, getSystemPrompt } = useLanguage();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/') || file.type === 'application/pdf') {
        setSelectedFile(file);
        setExtractedText('');
        setExplanation('');
      } else {
        toast({
          title: "Invalid file type",
          description: "Please select an image or PDF file.",
          variant: "destructive",
        });
      }
    }
  };

  const extractText = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    try {
      const result = await Tesseract.recognize(selectedFile, 'eng+hin+tel+mar+kan');
      setExtractedText(result.data.text);
      toast({
        title: "Text extracted successfully",
        description: "Document text has been extracted.",
      });
    } catch (error) {
      console.error('OCR Error:', error);
      toast({
        title: "Extraction failed",
        description: "Failed to extract text from the document.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const explainDocument = async () => {
    if (!extractedText.trim()) return;

    setIsExplaining(true);
    try {
      const prompt = `${getSystemPrompt()} 

Please explain this legal document in simple ${language} language for a rural citizen. Break down complex legal terms and explain what this document means, what rights it provides, and what actions the person should take:

Document text:
${extractedText}`;

      const explanation = await sendChatMessage([
        { role: 'system', content: getSystemPrompt() },
        { role: 'user', content: prompt }
      ]);

      setExplanation(explanation);
      toast({
        title: "Document explained",
        description: "AI has provided an explanation of your document.",
      });
    } catch (error) {
      console.error('Explanation Error:', error);
      toast({
        title: "Explanation failed",
        description: "Failed to explain the document.",
        variant: "destructive",
      });
    } finally {
      setIsExplaining(false);
    }
  };

  const downloadExplanation = () => {
    if (!explanation) return;
    
    const documentData = {
      type: 'explanation' as const,
      content: explanation,
      title: 'Legal Document Explanation',
      language: language
    };
    generatePDF(documentData);
  };

  const shareWhatsApp = () => {
    if (!explanation) return;
    
    const text = encodeURIComponent(`Legal Document Explanation:\n\n${explanation}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Document Scanner & Explainer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* File Upload */}
          <div className="space-y-4">
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-10 h-10 mb-3 text-muted-foreground" />
                  <p className="mb-2 text-sm text-muted-foreground">
                    <span className="font-semibold">Click to upload</span> a legal document
                  </p>
                  <p className="text-xs text-muted-foreground">PNG, JPG, or PDF</p>
                </div>
                <Input
                  type="file"
                  className="hidden"
                  accept="image/*,.pdf"
                  onChange={handleFileSelect}
                />
              </label>
            </div>
            
            {selectedFile && (
              <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                <FileText className="h-6 w-6 text-primary" />
                <span className="flex-1 text-sm">{selectedFile.name}</span>
                <Button
                  onClick={extractText}
                  disabled={isProcessing}
                  size="sm"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Extract Text'
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* Extracted Text */}
          {extractedText && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Extracted Text</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-lg max-h-60 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm">{extractedText}</pre>
                </div>
                <Button
                  onClick={explainDocument}
                  disabled={isExplaining}
                  className="mt-4"
                >
                  {isExplaining ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Explaining...
                    </>
                  ) : (
                    'Explain Document'
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* AI Explanation */}
          {explanation && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Document Explanation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-lg max-h-80 overflow-y-auto mb-4">
                  <div className="whitespace-pre-wrap text-sm">{explanation}</div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={downloadExplanation} variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                  <Button onClick={shareWhatsApp} variant="outline" size="sm">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share on WhatsApp
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OCRScanner;