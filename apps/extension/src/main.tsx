import React from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';

function App() {
  return <main><h1>Multilist0 Extension</h1><p>Your Chrome extension is ready to develop.</p></main>;
}

createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);
