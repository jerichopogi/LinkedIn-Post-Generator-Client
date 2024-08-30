import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';

// Get the root element from the DOM
const container = document.getElementById('root');

// Create a root container with createRoot
const root = createRoot(container);

// Render the app inside the root container
root.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
