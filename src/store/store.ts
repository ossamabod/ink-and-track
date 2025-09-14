import { configureStore } from '@reduxjs/toolkit';
import documentsReducer from './slices/documentsSlice';

export const store = configureStore({
  reducer: {
    documents: documentsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;