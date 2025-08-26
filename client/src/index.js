import React from 'react';
import ReactDOM from 'react-dom/client';

// Tailwind utilities (πρέπει να είναι πρώτο)
import './index.css';

// Custom styles όπως spinner ή fade-in
import './App.css';

import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

