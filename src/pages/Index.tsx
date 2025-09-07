import React, { useState } from 'react';
import { Shield, Zap, Lock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import FileUpload from '@/components/FileUpload';
import ProcessingStatus from '@/components/ProcessingStatus';
import ResultPreview from '@/components/ResultPreview';

const Index = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
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

  const handleProcess = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setStatus('processing');
    setProgress(0);

    const formData = new FormData();
    formData.append('file', selectedFile);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 15;
      });
    }, 500);

    try {
      const response = await fetch('http://localhost:8000/redact', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (response.ok) {
        // Simulate getting processed file URL
        setProcessedFile('processed-file-url');
        setStatus('success');
        toast({
          title: "Processing Complete!",
          description: "Your file has been successfully deidentified.",
        });
      } else {
        throw new Error('Processing failed');
      }
    } catch (error) {
      clearInterval(progressInterval);
      setStatus('error');
      toast({
        title: "Processing Failed",
        description: "There was an error processing your file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    // Simulate download
    const link = document.createElement('a');
    link.href = processedFile || '';
    link.download = `deidentified-${selectedFile?.name || 'file'}`;
    link.click();
    
    toast({
      title: "Download Started",
      description: "Your protected file is downloading now.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-bg">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-primary rounded-lg">
              <Shield className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold text-foreground">AI Privacy Deidentifier</h1>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Upload documents or images →<br />
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              We hide personal info
            </span>
            <br />→ Get a safe, shareable file.
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Protect privacy with AI-powered document redaction. Remove sensitive information 
            from PDFs and images in seconds, not hours.
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="p-6 text-center border-0 shadow-soft hover:shadow-medium transition-all duration-300">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-card-foreground mb-2">AI-Powered</h3>
            <p className="text-muted-foreground text-sm">
              Advanced AI detects and redacts personal information automatically
            </p>
          </Card>
          
          <Card className="p-6 text-center border-0 shadow-soft hover:shadow-medium transition-all duration-300">
            <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Lock className="h-6 w-6 text-success" />
            </div>
            <h3 className="font-semibold text-card-foreground mb-2">Privacy First</h3>
            <p className="text-muted-foreground text-sm">
              Your files are processed securely and never stored permanently
            </p>
          </Card>
          
          <Card className="p-6 text-center border-0 shadow-soft hover:shadow-medium transition-all duration-300">
            <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Shield className="h-6 w-6 text-warning" />
            </div>
            <h3 className="font-semibold text-card-foreground mb-2">Instant Results</h3>
            <p className="text-muted-foreground text-sm">
              Get your redacted documents in minutes, ready for safe sharing
            </p>
          </Card>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 pb-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Upload Section */}
          <div>
            <h3 className="text-2xl font-bold text-foreground mb-4 text-center">
              Upload Your Document
            </h3>
            <FileUpload
              onFileSelect={handleFileSelect}
              selectedFile={selectedFile}
              onRemoveFile={handleRemoveFile}
              isProcessing={isProcessing}
            />
          </div>

          {/* Process Button */}
          {selectedFile && status === 'idle' && (
            <div className="text-center">
              <Button
                onClick={handleProcess}
                size="lg"
                className="bg-gradient-primary text-primary-foreground hover:shadow-glow transition-all duration-300 font-semibold px-8"
              >
                Start Processing
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </div>
          )}

          {/* Processing Status */}
          <ProcessingStatus
            isProcessing={isProcessing}
            progress={progress}
            status={status}
          />

          {/* Results */}
          <ResultPreview
            originalFile={selectedFile}
            processedFile={processedFile}
            onDownload={handleDownload}
            processingComplete={status === 'success'}
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">
            Powered by AI • Privacy-first • Secure processing
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;