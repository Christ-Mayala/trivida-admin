/**
 * Main Entry Point — Trivida Admin Panel
 * 
 * Point d'entrée React. Monte l'application avec React Router.
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
