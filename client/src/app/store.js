import { configureStore } from '@reduxjs/toolkit';
import uiReducer from './uiSlice';
import authReducer from '../features/auth/authSlice';
import workspaceReducer from '../features/workspace/workspaceSlice';
import aptitudeReducer from '../features/aptitude/aptitudeSlice';

export const store = configureStore({
  reducer: {
    ui: uiReducer,
    auth: authReducer,
    workspace: workspaceReducer,
    aptitude: aptitudeReducer,
  },
});

export default store;
