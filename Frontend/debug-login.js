// Debug: Login işlemi sırasında console.log'ları temizlemek için

console.clear();
console.log('🚀 DEBUG SCRIPT: Login işlemi başlıyor...');

// Storage durumunu kontrol et
console.log('💾 Storage Durumu:');
console.log('  - localStorage token:', localStorage.getItem('token'));
console.log('  - localStorage user:', localStorage.getItem('user'));
console.log('  - sessionStorage token:', sessionStorage.getItem('token'));
console.log('  - sessionStorage user:', sessionStorage.getItem('user'));

// Auth context durumunu kontrol et
setTimeout(() => {
  const authContext = window.React && window.React.context;
  if (authContext) {
    console.log('🔐 Auth Context:', authContext);
  }
}, 1000);
