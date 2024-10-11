import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // Ensure correct import
import './styles.css';  // Ensure this file exists if referenced

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
