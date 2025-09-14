import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { DocumentFile, UploadProgress } from '../../types/document';
import { documentService } from '../../services/documentService';

interface DocumentsState {
  files: DocumentFile[];
  localFiles: DocumentFile[];
  uploadProgress: UploadProgress[];
  isLoading: boolean;
  error: string | null;
}

const initialState: DocumentsState = {
  files: [],
  localFiles: [],
  uploadProgress: [],
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchDocuments = createAsyncThunk(
  'documents/fetchDocuments',
  async (_, { rejectWithValue }) => {
    try {
      const response = await documentService.getAllDocuments();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch documents');
    }
  }
);

export const uploadDocument = createAsyncThunk(
  'documents/uploadDocument',
  async (file: File, { dispatch, rejectWithValue }) => {
    try {
      const fileId = Date.now().toString();
      
      // Add upload progress tracking
      dispatch(addUploadProgress({ fileId, progress: 0, status: 'uploading' }));
      
      const response = await documentService.uploadDocument(file, (progress) => {
        dispatch(updateUploadProgress({ fileId, progress }));
      });
      
      dispatch(removeUploadProgress(fileId));
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to upload document');
    }
  }
);

export const signDocument = createAsyncThunk(
  'documents/signDocument',
  async ({ document, signature }: { document: DocumentFile; signature: string }, { dispatch, rejectWithValue }) => {
    try {
      let documentId = document.id;
      
      // If it's a local file, upload it first
      if (document.status === 'local' && document.file) {
        const fileId = document.id;
        
        // Add upload progress tracking
        dispatch(addUploadProgress({ fileId, progress: 0, status: 'uploading' }));
        
        const uploadResponse = await documentService.uploadDocument(document.file, (progress) => {
          dispatch(updateUploadProgress({ fileId, progress }));
        });
        
        dispatch(removeUploadProgress(fileId));
        documentId = uploadResponse.data.id;
        
        // Remove from local files and add to uploaded files
        dispatch(removeLocalFile(fileId));
        dispatch(addUploadedFile(uploadResponse.data));
      }
      
      const response = await documentService.signDocument(documentId, signature);
      return { documentId, signedDate: new Date().toISOString() };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to sign document');
    }
  }
);

const documentsSlice = createSlice({
  name: 'documents',
  initialState,
  reducers: {
    addLocalFile: (state, action: PayloadAction<DocumentFile>) => {
      state.localFiles.push(action.payload);
    },
    removeLocalFile: (state, action: PayloadAction<string>) => {
      state.localFiles = state.localFiles.filter(file => file.id !== action.payload);
    },
    addUploadedFile: (state, action: PayloadAction<DocumentFile>) => {
      state.files.push(action.payload);
    },
    addUploadProgress: (state, action: PayloadAction<UploadProgress>) => {
      state.uploadProgress.push(action.payload);
    },
    updateUploadProgress: (state, action: PayloadAction<{ fileId: string; progress: number }>) => {
      const progress = state.uploadProgress.find(p => p.fileId === action.payload.fileId);
      if (progress) {
        progress.progress = action.payload.progress;
      }
    },
    removeUploadProgress: (state, action: PayloadAction<string>) => {
      state.uploadProgress = state.uploadProgress.filter(p => p.fileId !== action.payload);
    },
    markDocumentAsViewed: (state, action: PayloadAction<string>) => {
      const document = state.files.find(doc => doc.id === action.payload);
      if (document && document.status === 'pending') {
        document.status = 'viewed';
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch documents
      .addCase(fetchDocuments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDocuments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.files = action.payload;
      })
      .addCase(fetchDocuments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Upload document
      .addCase(uploadDocument.pending, (state) => {
        state.error = null;
      })
      .addCase(uploadDocument.fulfilled, (state, action) => {
        state.files.push(action.payload);
      })
      .addCase(uploadDocument.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      // Sign document
      .addCase(signDocument.pending, (state) => {
        state.error = null;
      })
      .addCase(signDocument.fulfilled, (state, action) => {
        const document = state.files.find(doc => doc.id === action.payload.documentId);
        if (document) {
          document.status = 'signed';
          document.signedDate = action.payload.signedDate;
        }
      })
      .addCase(signDocument.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { 
  addLocalFile,
  removeLocalFile,
  addUploadedFile,
  addUploadProgress, 
  updateUploadProgress, 
  removeUploadProgress, 
  markDocumentAsViewed, 
  clearError 
} = documentsSlice.actions;

export default documentsSlice.reducer;