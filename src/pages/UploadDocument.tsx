import React, { useState } from 'react';
import { ArrowRight, Shield, FileText, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import FileUpload from '@/components/FileUpload';
import ProcessingStatus from '@/components/ProcessingStatus';
import { Badge } from '@/components/ui/badge';

const UploadDocument = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [redactionLevel, setRedactionLevel] = useState<string>('');
  const [customEntities, setCustomEntities] = useState<string[]>([]);
  const [consentLevel, setConsentLevel] = useState<string>('');
  const [authorizationConfirmed, setAuthorizationConfirmed] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [processedFile, setProcessedFile] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setStatus('idle');
    setProgress(0);
    setProcessedFile(null);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setStatus('idle');
    setProgress(0);
    setProcessedFile(null);
  };

  const canStartRedaction = selectedFile && redactionLevel && consentLevel && authorizationConfirmed && (redactionLevel !== 'custom' || customEntities.length > 0);


 const handleStartRedaction = async () => {
  if (!canStartRedaction) return;

  setIsProcessing(true);
  setStatus('processing');
  setProgress(0);

  const formData = new FormData();
  formData.append('file', selectedFile!);
  // Map UI values to backend values
  let backendLevel = redactionLevel;
  if (backendLevel === 'full-pii') backendLevel = 'full';
  if (backendLevel === 'partial-pii') backendLevel = 'partial';
  formData.append('redaction_level', backendLevel);
  formData.append('consentLevel', consentLevel);
  if (backendLevel === 'custom') {
    formData.append('custom_types', JSON.stringify(customEntities));
  }

  const progressInterval = setInterval(() => {
    setProgress((prev) => (prev >= 90 ? prev : prev + Math.random() * 15));
  }, 500);

  try {
    const response = await fetch('http://localhost:8000/redact', {
      method: 'POST',
      body: formData,
    });

    clearInterval(progressInterval);
    setProgress(100);

    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      setProcessedFile(url);
      setStatus('success');

      toast({
        title: "Redaction Complete!",
        description: "Your document has been successfully redacted and is ready for download.",
      });
    } else {
      throw new Error('Redaction failed');
    }
  } catch (error) {
    clearInterval(progressInterval);
    setStatus('error');
    toast({
      title: "Redaction Failed",
      description: "There was an error processing your document. Please try again.",
      variant: "destructive",
    });
  } finally {
    setIsProcessing(false);
  }
};

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = processedFile || '';
    link.download = `redacted-${selectedFile?.name || 'document'}`;
    link.click();
    
    toast({
      title: "Download Started",
      description: "Your redacted document is downloading now.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Upload Document</h1>
        <p className="text-muted-foreground">Securely redact sensitive information from your medical documents</p>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Document Upload Form */}
        <Card className="border-border shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Document Upload Form</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* File Upload */}
            <div>
              <h3 className="font-medium text-foreground mb-3">Select Document</h3>
              <FileUpload
                onFileSelect={handleFileSelect}
                selectedFile={selectedFile}
                onRemoveFile={handleRemoveFile}
                isProcessing={isProcessing}
              />
              {selectedFile && (
                <div className="mt-2 p-3 bg-muted rounded-lg">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{selectedFile.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {(selectedFile.size / 1024 / 1024).toFixed(1)} MB
                    </Badge>
                  </div>
                </div>
              )}
            </div>

            {/* Redaction Level */}
            <div>
              <label className="block font-medium text-foreground mb-2">Redaction Level</label>
              <Select value={redactionLevel} onValueChange={val => { setRedactionLevel(val); if (val !== 'custom') setCustomEntities([]); }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select redaction level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full-pii">Full PII - Remove all personal identifiers</SelectItem>
                  <SelectItem value="partial-pii">Partial PII - Keep some non-sensitive identifiers</SelectItem>
                  <SelectItem value="custom">Custom - Define specific redaction rules</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Custom Entity Selection */}
            {redactionLevel === 'custom' && (
              <div className="space-y-2">
                <label className="block font-medium text-foreground mb-2">Select Entity Types to Redact</label>
                <div className="grid grid-cols-2 gap-2">
                  {['PERSON','GPE','ORG','DATE','CARDINAL','LOC','NORP','FAC','EVENT','PRODUCT','LANGUAGE'].map(type => (
                    <label key={type} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={customEntities.includes(type)}
                        onChange={e => {
                          if (e.target.checked) setCustomEntities([...customEntities, type]);
                          else setCustomEntities(customEntities.filter(t => t !== type));
                        }}
                      />
                      <span className="text-xs">{type}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Patient Consent Level */}
            <div>
              <label className="block font-medium text-foreground mb-2">Patient Consent Level</label>
              <Select value={consentLevel} onValueChange={setConsentLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select consent level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Basic - Standard healthcare sharing</SelectItem>
                  <SelectItem value="extended">Extended - Research and analytics allowed</SelectItem>
                  <SelectItem value="research">Research - Full anonymization for studies</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Authorization Checkbox */}
            <div className="flex items-start space-x-3 p-4 bg-muted/50 rounded-lg">
              <Checkbox 
                id="authorization"
                checked={authorizationConfirmed}
                onCheckedChange={(checked) => setAuthorizationConfirmed(checked === true)}
              />
              <div className="space-y-1">
                <label 
                  htmlFor="authorization" 
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Authorization Confirmation
                </label>
                <p className="text-xs text-muted-foreground">
                  I confirm that I have proper authorization to process this document and that all necessary patient consents have been obtained.
                </p>
              </div>
            </div>

            {/* Start Redaction Button */}
            <Button
              onClick={handleStartRedaction}
              disabled={!canStartRedaction || isProcessing}
              className="w-full bg-gradient-primary"
              size="lg"
            >
              {isProcessing ? (
                "Processing..."
              ) : (
                <>
                  Start Redaction
                  <ArrowRight className="h-5 w-5 ml-2" />
                </>
              )}
            </Button>

            {/* Processing Status */}
            <ProcessingStatus
              isProcessing={isProcessing}
              progress={progress}
              status={status}
            />
          </CardContent>
        </Card>

        {/* Right: Document Preview */}
        <Card className="border-border shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Document Preview</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedFile && (
              <div className="h-96 flex items-center justify-center border-2 border-dashed border-border rounded-lg">
                <div className="text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Upload a document to see the preview</p>
                </div>
              </div>
            )}

            {selectedFile && status === 'idle' && (
              <div className="space-y-4">
                <div className="h-48 bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Original Document Preview</p>
                  </div>
                </div>
                <p className="text-center text-sm text-muted-foreground">
                  Side-by-side comparison will appear after redaction
                </p>
              </div>
            )}

            {status === 'success' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Original</h4>
                    <div className="h-32 bg-muted rounded-lg flex items-center justify-center">
                      <FileText className="h-6 w-6 text-muted-foreground" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Redacted</h4>
                    <div className="h-32 bg-success/10 border border-success/20 rounded-lg flex items-center justify-center">
                      <Shield className="h-6 w-6 text-success" />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center p-4 bg-success/10 border border-success/20 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-success mr-2" />
                  <span className="text-sm font-medium text-success">Redaction Complete</span>
                </div>

                <Button 
                  onClick={handleDownload}
                  className="w-full bg-gradient-success"
                  size="lg"
                >
                  Download Protected Document
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UploadDocument;