import React, { useEffect } from 'react';
import { Eye, PenTool, Download, Clock, CheckCircle, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { fetchDocuments, signDocument, markDocumentAsViewed } from '@/store/slices/documentsSlice';
import { DocumentFile } from '@/types/document';
import { toast } from '@/hooks/use-toast';
import { documentService } from '@/services/documentService';

const FileList: React.FC = () => {
  const dispatch = useAppDispatch();
  const { files, isLoading, error } = useAppSelector((state) => state.documents);

  useEffect(() => {
    dispatch(fetchDocuments());
  }, [dispatch]);

  const handleViewDocument = async (document: DocumentFile) => {
    try {
      const response = await documentService.viewDocument(document.id);
      if (response.success && response.data?.url) {
        // Open document in new tab/window
        window.open(response.data.url, '_blank');
        // Mark as viewed if it was pending
        if (document.status === 'pending') {
          dispatch(markDocumentAsViewed(document.id));
        }
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to open document',
        variant: 'destructive',
      });
    }
  };

  const handleSignDocument = async (document: DocumentFile) => {
    try {
      // For demo purposes, we'll use a simple signature prompt
      // In a real app, you'd have a proper signature modal/component
      const signature = prompt('Enter your digital signature:');
      if (signature) {
        await dispatch(signDocument({ documentId: document.id, signature })).unwrap();
        toast({
          title: 'Success',
          description: 'Document signed successfully',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to sign document',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: DocumentFile['status']) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case 'viewed':
        return (
          <Badge variant="outline" className="bg-info/10 text-info border-info/30">
            <Eye className="h-3 w-3 mr-1" />
            Viewed
          </Badge>
        );
      case 'signed':
        return (
          <Badge variant="outline" className="bg-success/10 text-success border-success/30">
            <CheckCircle className="h-3 w-3 mr-1" />
            Signed
          </Badge>
        );
      default:
        return null;
    }
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Document Library</h2>
          </div>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading documents...</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Document Library</h2>
          </div>
          <Badge variant="secondary" className="text-sm">
            {files.length} documents
          </Badge>
        </div>

        {files.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium text-muted-foreground">No documents uploaded yet</p>
            <p className="text-muted-foreground">Upload your first document to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {files.map((file) => (
              <Card key={file.id} className="p-4 transition-all duration-300 hover:shadow-hover">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium truncate">{file.name}</h3>
                        {getStatusBadge(file.status)}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                        <span>{formatFileSize(file.size)}</span>
                        <span>•</span>
                        <span>Uploaded {formatDate(file.uploadDate)}</span>
                        {file.signedDate && (
                          <>
                            <span>•</span>
                            <span className="text-success">Signed {formatDate(file.signedDate)}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDocument(file)}
                      className="transition-all duration-300 hover:bg-info/10 hover:border-info/30"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSignDocument(file)}
                      disabled={file.status === 'signed'}
                      className="transition-all duration-300 hover:bg-success/10 hover:border-success/30 disabled:opacity-50"
                    >
                      <PenTool className="h-4 w-4 mr-2" />
                      {file.status === 'signed' ? 'Signed' : 'Sign'}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default FileList;