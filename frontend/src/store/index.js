import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';
import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import thunk from 'redux-thunk';

// Import reducers
import authReducer from './slices/authSlice';
import problemsReducer from './slices/problemsSlice';
import submissionsReducer from './slices/submissionsSlice';
import groupsReducer from './slices/groupsSlice';
import analyticsReducer from './slices/analyticsSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  problems: problemsReducer,
  submissions: submissionsReducer,
  groups: groupsReducer,
  analytics: analyticsReducer
});

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth'] // only auth will be persisted
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }).concat(thunk),
});

export const persistor = persistStore(store);