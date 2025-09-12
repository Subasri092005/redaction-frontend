import React, { useState } from 'react';
import {
  ArrowRight,
  Shield,
  FileText,
  CheckCircle,
  X,
  AlertCircle,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import FileUpload from '@/components/FileUpload';
import ProcessingStatus from '@/components/ProcessingStatus';
import { Badge } from '@/components/ui/badge';

const FULL_ENTITIES = [
  'PERSON',
  'GPE',
  'ORG',
  'DATE',
  'CARDINAL',
  'LOC',
  'NORP',
  'FAC',
  'EVENT',
  'PRODUCT',
  'LANGUAGE',
];

const UploadDocument = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [redactionLevel, setRedactionLevel] = useState<string>('');
  const [customEntities, setCustomEntities] = useState<string[]>([]);
  const [consentLevel, setConsentLevel] = useState<string>('');
  const [authorizationConfirmed, setAuthorizationConfirmed] =
    useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<
    'idle' | 'processing' | 'success' | 'error'
  >('idle');
  const [fileId, setFileId] = useState<string | null>(null);
  const [processingTime, setProcessingTime] = useState<number | null>(
    null,
  );
  const [returnedConsentLevel, setReturnedConsentLevel] = useState<
    string | null
  >(null);
  const [returnedRedactionLevel, setReturnedRedactionLevel] = useState<
    string | null
  >(null);
  const [returnedCustomTypes, setReturnedCustomTypes] = useState<
    string[] | null
  >(null);

  const { toast } = useToast();

  // ---- File Handlers ----
  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setStatus('idle');
    setProgress(0);
    setFileId(null);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setStatus('idle');
    setProgress(0);
    setFileId(null);
  };

  // ---- Redaction Start Conditions ----
  const canStartRedaction =
    selectedFile &&
    redactionLevel &&
    consentLevel &&
    authorizationConfirmed &&
    (redactionLevel !== 'custom' || customEntities.length > 0);

  // ---- Start Redaction ----
  const handleStartRedaction = async () => {
    if (!canStartRedaction) return;

    setIsProcessing(true);
    setStatus('processing');
    setProgress(0);

    const formData = new FormData();
    formData.append('file', selectedFile!);

    let backendLevel = redactionLevel;
    if (backendLevel === 'full-pii') backendLevel = 'full';
    if (backendLevel === 'partial-pii') backendLevel = 'partial';

    formData.append('redaction_level', backendLevel);
    formData.append('consent_level', consentLevel);

    if (backendLevel === 'custom') {
      formData.append('custom_types', JSON.stringify(customEntities));
    }

    const progressInterval = setInterval(() => {
      setProgress((prev) => (prev >= 90 ? prev : prev + Math.random() * 15));
    }, 500);

    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${apiUrl}/redact`, {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (response.ok) {
        const data = await response.json();
        setFileId(data.id);
        setProcessingTime(data.processing_time);
        setReturnedConsentLevel(data.consent_level);
        setReturnedRedactionLevel(data.redaction_level);
        setReturnedCustomTypes(data.custom_types);
        setStatus('success');

        toast({
          title: 'Redaction Complete!',
          description:
            'Your document has been successfully redacted and is ready for preview/download.',
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Redaction failed');
      }
    } catch (error) {
      clearInterval(progressInterval);
      setStatus('error');
      toast({
        title: 'Redaction Failed',
        description:
          'There was an error processing your document. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // ---- Download ----
  const handleDownload = () => {
    if (fileId) {
      window.open(
        `${import.meta.env.VITE_API_URL}/download/${fileId}`,
        '_blank',
      );
      toast({
        title: 'Download Started',
        description: 'Your protected file is downloading now.',
      });
    }
  };

  // ---- UI ----
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Upload Document
        </h1>
        <p className="text-muted-foreground">
          Securely redact sensitive information from your documents
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Section - Upload & Settings */}
        <Card className="border-border shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Document Upload</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* File Upload */}
            <FileUpload
              onFileSelect={handleFileSelect}
              selectedFile={selectedFile}
              onRemoveFile={handleRemoveFile}
              isProcessing={isProcessing}
            />

            {/* Redaction Level */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Redaction Level</label>
              <Select value={redactionLevel} onValueChange={setRedactionLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full-pii">Full PII Redaction</SelectItem>
                  <SelectItem value="partial-pii">Partial PII Redaction</SelectItem>
                  <SelectItem value="custom">Custom Entities</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Custom Entities */}
            {redactionLevel === 'custom' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Custom Entities to Redact
                </label>
                <Select
                  onValueChange={(value) =>
                    setCustomEntities([...customEntities, value])
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select entities" />
                  </SelectTrigger>
                  <SelectContent>
                    {FULL_ENTITIES.map((entity) => (
                      <SelectItem key={entity} value={entity}>
                        {entity}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex flex-wrap gap-2">
                  {customEntities.map((entity, idx) => (
                    <Badge key={idx} variant="secondary">
                      {entity}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-2 h-4 w-4 p-0"
                        onClick={() =>
                          setCustomEntities(
                            customEntities.filter((_, i) => i !== idx),
                          )
                        }
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Consent Level */}
            <div className="space-y-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <label className="text-sm font-medium cursor-help">
                      Consent Level
                    </label>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-md">
                    <p>Full Consent: Patient has given full permission for data sharing.</p>
                    <p>Limited Consent: Partial permission with restrictions.</p>
                    <p>No Consent: Fully anonymized data only.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <Select value={consentLevel} onValueChange={setConsentLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select consent level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full">Full Consent</SelectItem>
                  <SelectItem value="limited">Limited Consent</SelectItem>
                  <SelectItem value="none">No Consent (Anonymized)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Authorization */}
            <div className="flex items-start space-x-2">
              <Checkbox
                id="authorization"
                checked={authorizationConfirmed}
                onCheckedChange={(checked) =>
                  setAuthorizationConfirmed(!!checked)
                }
              />
              <div className="space-y-1">
                <label
                  htmlFor="authorization"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Authorization Confirmation
                </label>
                <p className="text-xs text-muted-foreground">
                  I confirm that I have proper authorization to process this
                  document and that all necessary consents have been obtained.
                </p>
              </div>
            </div>

            {/* Start Button */}
            <Button
              onClick={handleStartRedaction}
              disabled={!canStartRedaction || isProcessing}
              className="w-full bg-gradient-primary"
              size="lg"
            >
              {isProcessing ? (
                'Processing...'
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

        {/* Right Section - Preview */}
        <Card className="border-border shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Document Preview</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* No File */}
            {!selectedFile && (
              <div className="h-96 flex items-center justify-center border-2 border-dashed border-border rounded-lg">
                <div className="text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Upload a document to see the preview
                  </p>
                </div>
              </div>
            )}

            {/* Idle State */}
            {selectedFile && status === 'idle' && (
              <div className="space-y-4">
                <div className="h-48 bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Original Document Preview
                    </p>
                  </div>
                </div>
                <p className="text-center text-sm text-muted-foreground">
                  Side-by-side comparison will appear after redaction
                </p>
              </div>
            )}

            {/* Success */}
            {status === 'success' && fileId && (
              <div className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="text-sm font-medium mb-2 text-foreground">
                    Redaction Summary
                  </h4>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>
                      <span className="font-medium text-foreground">
                        Consent Level:
                      </span>{' '}
                      {returnedConsentLevel}
                    </p>
                    <p>
                      <span className="font-medium text-foreground">
                        Redaction Level:
                      </span>{' '}
                      {returnedRedactionLevel}
                    </p>
                    <p>
                      <span className="font-medium text-foreground">
                        Processing Time:
                      </span>{' '}
                      {processingTime?.toFixed(2)} seconds
                    </p>
                    {returnedCustomTypes && returnedCustomTypes.length > 0 && (
                      <p>
                        <span className="font-medium text-foreground">
                          Custom Entities:
                        </span>{' '}
                        {returnedCustomTypes.join(', ')}
                      </p>
                    )}
                  </div>
                </div>

                {/* Previews */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Original</h4>
                    <embed
                      src={`${import.meta.env.VITE_API_URL}/preview/${fileId}?type=original`}
                      width="100%"
                      height="300"
                      type="application/pdf"
                      className="border rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Redacted</h4>
                    <embed
                      src={`${import.meta.env.VITE_API_URL}/preview/${fileId}?type=redacted`}
                      width="100%"
                      height="300"
                      type="application/pdf"
                      className="border rounded-lg"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-center p-4 bg-success/10 border border-success/20 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-success mr-2" />
                  <span className="text-sm font-medium text-success">
                    Redaction Complete
                  </span>
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

            {/* Error */}
            {status === 'error' && (
              <div className="text-center p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <AlertCircle className="h-5 w-5 text-destructive mx-auto mb-2" />
                <span className="text-sm font-medium text-destructive">
                  Redaction Failed
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UploadDocument;
