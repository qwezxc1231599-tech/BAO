import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { CurrencyProvider } from './CurrencyContext.tsx';
import { FavoritesProvider } from './FavoritesContext.tsx';
import { LanguageProvider } from './LanguageContext.tsx';
import { PriceAlertProvider } from './PriceAlertContext.tsx';
import { CompareProvider } from './CompareContext.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LanguageProvider>
      <FavoritesProvider>
        <PriceAlertProvider>
          <CurrencyProvider>
            <CompareProvider>
              <App />
            </CompareProvider>
          </CurrencyProvider>
        </PriceAlertProvider>
      </FavoritesProvider>
    </LanguageProvider>
  </StrictMode>,
);
