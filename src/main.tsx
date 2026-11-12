import { AudioProvider } from './context/AudioContext';
import {PasswordResetPage} from './components/PasswordRecovery';
import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { AuthProvider } from './context/AuthContext.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode><AudioProvider>
    {window.location.pathname === "/auth/reset-password" ? <PasswordResetPage/> : <AuthProvider>
      <App />
    </AuthProvider>}
  </AudioProvider></StrictMode>,
);
