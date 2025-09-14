export interface DocumentFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadDate: string;
  status: 'local' | 'pending' | 'viewed' | 'signed';
  signedDate?: string;
  url?: string;
  file?: File; // For local files before upload
}

export interface UploadProgress {
  fileId: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface SignDocumentRequest {
  documentId: string;
  signature: string;
}