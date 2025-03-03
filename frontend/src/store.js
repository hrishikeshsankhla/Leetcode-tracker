import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { thunk } from 'redux-thunk';
import { combineReducers } from 'redux';

import authReducer from './store/slices/authSlice';
import problemsReducer from './store/slices/problemsSlice';
import submissionsReducer from './store/slices/submissionsSlice';
import statsReducer from './store/slices/statsSlice';

const authPersistConfig = {
  key: 'auth',
  storage,
  whitelist: ['user', 'isAuthenticated'], // only persist these fields
};

const rootReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authReducer),
  problems: problemsReducer,
  submissions: submissionsReducer,
  stats: statsReducer,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }).concat(thunk),
});

export const persistor = persistStore(store);