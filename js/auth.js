/* ============================================================
   认证模块 - 登录 / 登出 / 权限管理
   ============================================================ */

// 密码的 SHA-256 哈希（预先计算好的，不可逆）
const PASSWORD_HASH = '3dbcd67753120545d4dfd39070de2fba37ce365333e751c825a7230a73788b43';

// 登录状态
let isLoggedIn = false;

// ==================== SHA-256 哈希 ====================
async function sha256hex(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// ==================== 登录 ====================
async function doLogin(password) {
  const inputHash = await sha256hex(password);
  if (inputHash === PASSWORD_HASH) {
    isLoggedIn = true;
    sessionStorage.setItem('isLoggedIn', 'true');
    return true;
  }
  return false;
}

// ==================== 登出 ====================
function doLogout() {
  isLoggedIn = false;
  sessionStorage.removeItem('isLoggedIn');
  // 刷新页面回到初始状态
  location.reload();
}

// ==================== 检查登录状态 ====================
function checkLoginStatus() {
  if (sessionStorage.getItem('isLoggedIn') === 'true') {
    isLoggedIn = true;
  }
}

// ==================== GitHub Token 管理 ====================
function getGitHubToken() {
  return localStorage.getItem('github_token');
}

function setGitHubToken(token) {
  localStorage.setItem('github_token', token);
}

function hasGitHubToken() {
  return !!getGitHubToken();
}

// ==================== 条目隐私检查 ====================
function isPrivateEntry(entry) {
  return entry.private === true;
}

function canSeeEntry(entry) {
  if (isLoggedIn) return true;
  return !isPrivateEntry(entry);
}

function canSeeEntity(entity) {
  if (isLoggedIn) return true;
  return !entity.private;
}
