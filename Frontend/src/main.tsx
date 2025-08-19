import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

console.log('🎯 Main.tsx loading...');
console.log('📦 React version:', React.version);

const rootElement = document.getElementById('root');
console.log('🎯 Root element found:', !!rootElement);

if (!rootElement) {
  console.error('❌ Root element not found!');
  throw new Error('Root element not found');
}

ReactDOM.createRoot(rootElement).render(
  <App />
);

console.log('✅ React app rendered');
