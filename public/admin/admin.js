const loginSection = document.getElementById('login');
const dashboardSection = document.getElementById('dashboard');
const loginMsg = document.getElementById('login-msg');
const usersList = document.getElementById('users-list');
const promoteMsg = document.getElementById('promote-msg');
const charMsg = document.getElementById('char-msg');
const mailMsg = document.getElementById('mail-msg');
const vipCodes = document.getElementById('vip-codes');

let adminToken = localStorage.getItem('adminToken');

function showDashboard() {
  loginSection.classList.add('hidden');
  dashboardSection.classList.remove('hidden');
}

async function api(path, method, body) {
  const res = await fetch(path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: adminToken ? `Bearer ${adminToken}` : ''
    },
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || '请求失败');
  return data;
}

async function login() {
  loginMsg.textContent = '';
  try {
    const data = await api('/admin/login', 'POST', {
      username: document.getElementById('admin-user').value.trim(),
      password: document.getElementById('admin-pass').value.trim()
    });
    adminToken = data.token;
    localStorage.setItem('adminToken', adminToken);
    showDashboard();
    await refreshUsers();
  } catch (err) {
    loginMsg.textContent = err.message;
  }
}

async function refreshUsers() {
  try {
    const data = await api('/admin/users', 'GET');
    usersList.textContent = data.users
      .map((u) => `${u.username} | GM=${u.is_admin ? '是' : '否'} | 创建: ${u.created_at}`)
      .join('\n');
  } catch (err) {
    usersList.textContent = err.message;
  }
}

async function promoteUser() {
  promoteMsg.textContent = '';
  try {
    await api('/admin/users/promote', 'POST', {
      username: document.getElementById('promote-username').value.trim(),
      isAdmin: document.getElementById('promote-flag').value === 'true'
    });
    promoteMsg.textContent = '已更新 GM 权限。';
    await refreshUsers();
  } catch (err) {
    promoteMsg.textContent = err.message;
  }
}

async function updateCharacter() {
  charMsg.textContent = '';
  try {
    const patch = JSON.parse(document.getElementById('char-patch').value || '{}');
    await api('/admin/characters/update', 'POST', {
      username: document.getElementById('char-username').value.trim(),
      name: document.getElementById('char-name').value.trim(),
      patch
    });
    charMsg.textContent = '角色已更新。';
  } catch (err) {
    charMsg.textContent = err.message;
  }
}

async function sendMail() {
  mailMsg.textContent = '';
  try {
    await api('/admin/mail/send', 'POST', {
      username: document.getElementById('mail-username').value.trim(),
      title: document.getElementById('mail-title').value.trim(),
      body: document.getElementById('mail-body').value.trim()
    });
    mailMsg.textContent = '邮件已发送。';
  } catch (err) {
    mailMsg.textContent = err.message;
  }
}

async function createVipCodes() {
  vipCodes.textContent = '';
  try {
    const count = Number(document.getElementById('vip-count').value || 1);
    const data = await api('/admin/vip/create', 'POST', { count });
    vipCodes.textContent = data.codes.join('\n');
  } catch (err) {
    vipCodes.textContent = err.message;
  }
}

async function listVipCodes() {
  vipCodes.textContent = '';
  try {
    const data = await api('/admin/vip/list', 'GET');
    vipCodes.textContent = data.codes.map((c) => `${c.code} | 使用者=${c.used_by_user_id || '-'} | 使用时间=${c.used_at || '-'}`).join('\n');
  } catch (err) {
    vipCodes.textContent = err.message;
  }
}

if (adminToken) {
  showDashboard();
  refreshUsers();
}

document.getElementById('admin-login-btn').addEventListener('click', login);
document.getElementById('refresh-users').addEventListener('click', refreshUsers);
document.getElementById('promote-btn').addEventListener('click', promoteUser);
document.getElementById('char-update-btn').addEventListener('click', updateCharacter);
document.getElementById('mail-send-btn').addEventListener('click', sendMail);
document.getElementById('vip-create-btn').addEventListener('click', createVipCodes);
document.getElementById('vip-list-btn').addEventListener('click', listVipCodes);
