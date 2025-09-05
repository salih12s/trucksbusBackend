import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App.tsx'
import './index.css'

// 🔄 Cache Busting - Version kontrolü
const CACHE_VERSION = '20250905-v2'; // ⚡ Version güncelledik
const currentVersion = localStorage.getItem('cacheVersion');

if (currentVersion !== CACHE_VERSION) {
  console.log('🗑️ Cache temizleniyor, yeni version:', CACHE_VERSION);
  
  // Tüm storage'ları temizle
  localStorage.clear();
  sessionStorage.clear();
  
  // IndexedDB'yi de temizle
  if (window.indexedDB) {
    indexedDB.databases().then(databases => {
      databases.forEach(db => {
        if (db.name) indexedDB.deleteDatabase(db.name);
      });
    });
  }
  
  // Cache API'yi temizle
  if ('caches' in window) {
    caches.keys().then(names => {
      names.forEach(name => caches.delete(name));
    });
  }
  
  localStorage.setItem('cacheVersion', CACHE_VERSION);
  
  // Sayfayı yenile ki fresh başlasın
  window.location.reload();
}

console.log('🎯 Main.tsx loading...');
console.log('📦 React version:', React.version);

// Create React Query client with sensible defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 0, // ⚡ Cache busting: Hiç cache yapma
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

const rootElement = document.getElementById('root');
console.log('🎯 Root element found:', !!rootElement);

if (!rootElement) {
  console.error('❌ Root element not found!');
  throw new Error('Root element not found');
}

ReactDOM.createRoot(rootElement).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);

console.log('✅ React app rendered with React Query');
