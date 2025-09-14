import { DocumentFile, ApiResponse, SignDocumentRequest } from '../types/document';

// Base API URL - adjust this to match your backend
const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:8000/api';

class DocumentService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async getAllDocuments(): Promise<ApiResponse<DocumentFile[]>> {
    return this.request<DocumentFile[]>('/documents');
  }

  async getDocument(id: string): Promise<ApiResponse<DocumentFile>> {
    return this.request<DocumentFile>(`/documents/${id}`);
  }

  async uploadDocument(
    file: File, 
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<DocumentFile>> {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('file', file);

      const xhr = new XMLHttpRequest();

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = Math.round((event.loaded / event.total) * 100);
          onProgress(progress);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (error) {
            reject(new Error('Invalid response format'));
          }
        } else {
          reject(new Error(`Upload failed with status: ${xhr.status}`));
        }
      };

      xhr.onerror = () => {
        reject(new Error('Network error during upload'));
      };

      xhr.open('POST', `${API_BASE_URL}/documents/upload`);
      xhr.send(formData);
    });
  }

  async signDocument(documentId: string, signature: string): Promise<ApiResponse<DocumentFile>> {
    return this.request<DocumentFile>(`/documents/${documentId}/sign`, {
      method: 'POST',
      body: JSON.stringify({ signature }),
    });
  }

  async viewDocument(documentId: string): Promise<ApiResponse<{ url: string }>> {
    return this.request<{ url: string }>(`/documents/${documentId}/view`, {
      method: 'POST',
    });
  }

  async deleteDocument(documentId: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/documents/${documentId}`, {
      method: 'DELETE',
    });
  }
}

export const documentService = new DocumentService();