import React from 'react';
import { Download, Eye, Shield, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ResultPreviewProps {
  originalFile: File | null;
  processedFile: string | null;
  onDownload: () => void;
  processingComplete: boolean;
}

const ResultPreview: React.FC<ResultPreviewProps> = ({
  originalFile,
  processedFile,
  onDownload,
  processingComplete
}) => {
  if (!processingComplete || !processedFile) return null;

  const isImage = originalFile?.type.startsWith('image/');
  const isPDF = originalFile?.type === 'application/pdf';

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center space-x-2 bg-success/10 px-4 py-2 rounded-full mb-4">
          <Shield className="h-5 w-5 text-success" />
          <span className="text-success font-medium">Privacy Protected</span>
        </div>
        <h3 className="text-xl font-semibold text-card-foreground mb-2">
          Your file has been deidentified
        </h3>
        <p className="text-muted-foreground">
          All personal information has been safely removed or redacted
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Original Preview */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-card-foreground">Original</h4>
            <Badge variant="outline">Source</Badge>
          </div>
          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center border-2 border-dashed border-border">
            {isImage ? (
              <div className="text-center">
                <Eye className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Original Image</p>
              </div>
            ) : (
              <div className="text-center">
                <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Original PDF</p>
              </div>
            )}
          </div>
        </Card>

        {/* Processed Preview */}
        <Card className="p-4 border-2 border-success/20 bg-success/5">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-card-foreground">Deidentified</h4>
            <Badge className="bg-success text-success-foreground">Protected</Badge>
          </div>
          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center border-2 border-dashed border-success/30">
            {isImage ? (
              <div className="text-center">
                <Shield className="h-8 w-8 text-success mx-auto mb-2" />
                <p className="text-sm text-success">Protected Image</p>
              </div>
            ) : (
              <div className="text-center">
                <Shield className="h-8 w-8 text-success mx-auto mb-2" />
                <p className="text-sm text-success">Protected PDF</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Download Section */}
      <Card className="p-6 bg-gradient-success text-white border-0">
        <div className="text-center">
          <h4 className="font-semibold mb-2">Ready to Download</h4>
          <p className="text-white/90 mb-4">
            Your privacy-protected file is ready for safe sharing
          </p>
          <Button
            onClick={onDownload}
            size="lg"
            variant="secondary"
            className="bg-white text-success hover:bg-white/90 font-semibold"
          >
            <Download className="h-5 w-5 mr-2" />
            Download Protected File
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default ResultPreview;