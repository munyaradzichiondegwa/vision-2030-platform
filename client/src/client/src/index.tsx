import React from 'react';
import ReactDOM from 'react-dom/client';
import { GlobalStateProvider } from './context/GlobalStateContext';
import App from './App';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <GlobalStateProvider>
      <App />
    </GlobalStateProvider>
  </React.StrictMode>
);