import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { uploadDocument } from '@/store/slices/documentsSlice';
import { toast } from '@/hooks/use-toast';

const FileUpload: React.FC = () => {
  const dispatch = useAppDispatch();
  const { uploadProgress, error } = useAppSelector((state) => state.documents);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      acceptedFiles.forEach((file) => {
        // Validate file type
        const allowedTypes = [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'image/jpeg',
          'image/png',
        ];

        if (!allowedTypes.includes(file.type)) {
          toast({
            title: 'Invalid file type',
            description: 'Please upload PDF, DOC, DOCX, JPG, or PNG files only.',
            variant: 'destructive',
          });
          return;
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          toast({
            title: 'File too large',
            description: 'Please upload files smaller than 10MB.',
            variant: 'destructive',
          });
          return;
        }

        dispatch(uploadDocument(file));
      });
    },
    [dispatch]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
    },
    multiple: true,
  });

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Upload className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Upload Documents</h2>
        </div>

        <div
          {...getRootProps()}
          className={`
            relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
            transition-all duration-300 ease-smooth
            ${
              isDragActive
                ? 'border-primary bg-primary/5 shadow-upload'
                : 'border-border hover:border-primary/50 hover:bg-accent/50'
            }
          `}
        >
          <input {...getInputProps()} />
          
          <div className="flex flex-col items-center space-y-4">
            <div className={`p-4 rounded-full transition-colors duration-300 ${
              isDragActive ? 'bg-primary text-primary-foreground' : 'bg-accent text-accent-foreground'
            }`}>
              <FileText className="h-8 w-8" />
            </div>
            
            <div className="space-y-2">
              <p className="text-lg font-medium">
                {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
              </p>
              <p className="text-muted-foreground">
                or <span className="text-primary font-medium">browse files</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Supports PDF, DOC, DOCX, JPG, PNG (max 10MB each)
              </p>
            </div>

            <Button variant="outline" size="lg" className="mt-4">
              <Upload className="h-4 w-4 mr-2" />
              Select Files
            </Button>
          </div>
        </div>

        {/* Upload Progress */}
        {uploadProgress.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Uploading files...</h3>
            {uploadProgress.map((progress) => (
              <div key={progress.fileId} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">File {progress.fileId}</span>
                  <span className="font-medium">{progress.progress}%</span>
                </div>
                <Progress value={progress.progress} className="h-2" />
              </div>
            ))}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="flex items-center space-x-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default FileUpload;