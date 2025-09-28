import React from 'react';
import ReactDOM from 'react-dom/client';

// Tailwind / global styles ΠΡΕΠΕΙ να φορτώσουν πρώτα
import './index.css';
import './App.css';

import App from './App';

// Ρυθμίσεις εφαρμογής (theme, brand, font size, compact tables, chart animations)
import { initSettings, applySettings, loadSettings } from './settings';

// Εφαρμόζουμε τις ρυθμίσεις πριν το πρώτο render (βάζει .dark, --brand, --font-scale, data-attributes)
initSettings();

// (Προαιρετικό) Sync ρυθμίσεων μεταξύ tabs: αν αλλάξει το localStorage αλλού, ανανέωσε UI εδώ
window.addEventListener('storage', (e) => {
  if (e.key === 'app_settings') {
    applySettings(loadSettings());
  }
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
