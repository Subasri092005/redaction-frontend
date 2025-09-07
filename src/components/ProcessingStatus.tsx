import React from 'react';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface ProcessingStatusProps {
  isProcessing: boolean;
  progress: number;
  status: 'processing' | 'success' | 'error' | 'idle';
  message?: string;
}

const ProcessingStatus: React.FC<ProcessingStatusProps> = ({
  isProcessing,
  progress,
  status,
  message
}) => {
  if (status === 'idle') return null;

  const getStatusConfig = () => {
    switch (status) {
      case 'processing':
        return {
          icon: <Loader2 className="h-6 w-6 text-primary animate-spin" />,
          title: 'Processing your file...',
          description: 'AI is analyzing and removing personal information',
          bgColor: 'bg-processing-bg border-processing-border'
        };
      case 'success':
        return {
          icon: <CheckCircle className="h-6 w-6 text-success" />,
          title: 'Processing complete!',
          description: 'Your file has been safely deidentified',
          bgColor: 'bg-success/5 border-success/20'
        };
      case 'error':
        return {
          icon: <AlertCircle className="h-6 w-6 text-destructive" />,
          title: 'Processing failed',
          description: message || 'There was an error processing your file',
          bgColor: 'bg-destructive/5 border-destructive/20'
        };
      default:
        return {
          icon: null,
          title: '',
          description: '',
          bgColor: ''
        };
    }
  };

  const config = getStatusConfig();

  return (
    <Card className={`p-6 border-2 ${config.bgColor} transition-all duration-300`}>
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          {config.icon}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-card-foreground mb-2">
            {config.title}
          </h3>
          <p className="text-muted-foreground mb-4">
            {config.description}
          </p>
          {isProcessing && (
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-muted-foreground">
                {progress}% complete
              </p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default ProcessingStatus;