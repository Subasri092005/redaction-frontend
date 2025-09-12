import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X, FilePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  onRemoveFile: () => void;
  isProcessing: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  selectedFile,
  onRemoveFile,
  isProcessing
}) => {
  const [isDragActive, setIsDragActive] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0]);
    }
    setIsDragActive(false);
  }, [onFileSelect]);

  const loadSampleDocument = async () => {
    try {
      const response = await fetch(`${window.location.origin}/sample.pdf`);
      if (!response.ok) throw new Error('Failed to load sample document');
      const blob = await response.blob();
      
    } catch (error) {
      console.error('Failed to load sample document:', error);
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp']
    },
    multiple: false,
    disabled: isProcessing,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false)
  });

  if (selectedFile) {
    return (
      <Card className="p-6 border-2 border-dashed border-primary/20 bg-gradient-to-br from-upload-bg to-secondary/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-primary/10 rounded-lg">
              <File className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-medium text-card-foreground">{selectedFile.name}</p>
              <p className="text-sm text-muted-foreground">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
          </div>
          {!isProcessing && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRemoveFile}
              className="text-muted-foreground hover:text-destructive"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </Card>
    );
  }

  return (
    <Card 
      {...getRootProps()}
      className={cn(
        "p-8 border-2 border-dashed cursor-pointer transition-all duration-300",
        "hover:shadow-glow hover:border-primary/60",
        isDragActive 
          ? "border-primary bg-upload-hover shadow-glow scale-[1.02]" 
          : "border-upload-border bg-upload-bg hover:bg-upload-hover",
        isProcessing && "cursor-not-allowed opacity-50"
      )}
    >
      <input {...getInputProps()} />
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <Upload className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-card-foreground mb-2">
          {isDragActive ? 'Drop your file here' : 'Upload your document or image'}
        </h3>
        <p className="text-muted-foreground mb-4">
          Drag and drop your PDF or image file here, or click to browse
        </p>
        <div className="flex justify-center gap-4">
          <Button variant="outline" className="bg-background/50">
            Choose File
          </Button>
          <Button
            variant="ghost"
            className="text-primary hover:text-primary/80 flex items-center gap-1"
            onClick={loadSampleDocument}
            disabled={isProcessing}
          >
            <FilePlus className="h-4 w-4" />
            Try Sample
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          Supports PDF, PNG, JPG, JPEG, GIF, BMP, WEBP (Max 10MB)
        </p>
      </div>
    </Card>
  );
};

export default FileUpload;
