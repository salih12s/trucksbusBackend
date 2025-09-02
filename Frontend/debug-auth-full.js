// Debug script - Auth durumunu kontrol et
console.clear();
console.log('🔍 AUTH DEBUG SCRIPT BAŞLADI');
console.log('==============================');

// 1. Storage durumu
console.log('💾 STORAGE DURUMU:');
console.log('- localStorage token:', localStorage.getItem('token') ? 'VAR' : 'YOK');
console.log('- localStorage user:', localStorage.getItem('user') ? 'VAR' : 'YOK');
console.log('- localStorage rememberMe:', localStorage.getItem('rememberMe'));
console.log('- sessionStorage token:', sessionStorage.getItem('token') ? 'VAR' : 'YOK');
console.log('- sessionStorage user:', sessionStorage.getItem('user') ? 'VAR' : 'YOK');
console.log('');

// 2. User data
const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
if (userStr) {
  try {
    const user = JSON.parse(userStr);
    console.log('👤 USER DATA:');
    console.log('- Email:', user.email);
    console.log('- Role:', user.role);
    console.log('- ID:', user.id);
    console.log('- Name:', user.first_name, user.last_name);
  } catch (e) {
    console.log('❌ USER DATA PARSE ERROR:', e);
  }
}

// 3. Token kontrolü
const token = localStorage.getItem('token') || sessionStorage.getItem('token');
if (token) {
  console.log('🔑 TOKEN:');
  console.log('- Exists:', true);
  console.log('- Length:', token.length);
  console.log('- First 50 chars:', token.substring(0, 50) + '...');
  
  // Token decode denemeleri
  try {
    const parts = token.split('.');
    if (parts.length === 3) {
      const payload = JSON.parse(atob(parts[1]));
      console.log('- Decoded payload:', payload);
      console.log('- Expires:', new Date(payload.exp * 1000));
      console.log('- Now:', new Date());
      console.log('- Is expired:', new Date() > new Date(payload.exp * 1000));
    }
  } catch (e) {
    console.log('- Decode error:', e);
  }
}

// 4. React Router durumu
console.log('🔄 ROUTER:');
console.log('- Current path:', window.location.pathname);
console.log('- Current search:', window.location.search);
console.log('- Current hash:', window.location.hash);

console.log('==============================');
console.log('✅ DEBUG SCRIPT TAMAMLANDI');
