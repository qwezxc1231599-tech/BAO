import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { CurrencyProvider } from './CurrencyContext.tsx';
import { FavoritesProvider } from './FavoritesContext.tsx';
import { LanguageProvider } from './LanguageContext.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LanguageProvider>
      <FavoritesProvider>
        <CurrencyProvider>
          <App />
        </CurrencyProvider>
      </FavoritesProvider>
    </LanguageProvider>
  </StrictMode>,
);
