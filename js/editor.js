/* ============================================================
   编辑器模块 - 在线添加 / 编辑 / 删除 / 保存
   ============================================================ */

// ==================== 序列化 —— 把数据还原成 data.js 源码 ====================
function generateDataJS() {
  let code = `/* ============================================================
   个人学术记录 - 数据中心
   这是你每天编辑的文件！按照下方格式添加新内容即可。
   ============================================================ */

// ==================== 个人信息 ====================
const profile = ${JSON.stringify(profile, null, 2)};

// ==================== 项目进展 ====================
const projects = ${JSON.stringify(projects, null, 2)};

// ==================== 实验操作 ====================
const experiments = ${JSON.stringify(experiments, null, 2)};

// ==================== 论文写作 ====================
const papers = ${JSON.stringify(papers, null, 2)};

// ==================== 读研生活分享 ====================
const lifeEntries = ${JSON.stringify(lifeEntries, null, 2)};

// ==================== 文献笔记 ====================
const readingNotes = ${JSON.stringify(readingNotes, null, 2)};
`;
  return code;
}

// ==================== 通过 GitHub API 保存到仓库 ====================
async function saveToGitHub() {
  const token = getGitHubToken();
  if (!token) {
    showModal('settingsModal');
    return;
  }

  const saveBtn = $('#saveBtn');
  saveBtn.textContent = '⏳ 保存中...';
  saveBtn.disabled = true;

  try {
    const content = generateDataJS();
    const base64Content = btoa(unescape(encodeURIComponent(content)));

    // 1. 获取当前文件的 SHA
    const getUrl = 'https://api.github.com/repos/gulaji/gulaji.github.io/contents/js/data.js';
    const getResp = await fetch(getUrl, {
      headers: { 'Authorization': `token ${token}`, 'Accept': 'application/vnd.github.v3+json' }
    });
    if (!getResp.ok) {
      if (getResp.status === 401) {
        alert('❌ GitHub Token 无效或已过期，请重新设置。');
        localStorage.removeItem('github_token');
        showModal('settingsModal');
        saveBtn.textContent = '💾 保存';
        saveBtn.disabled = false;
        return;
      }
      throw new Error('获取文件信息失败: ' + getResp.status);
    }
    const fileData = await getResp.json();
    const sha = fileData.sha;

    // 2. 上传更新
    const putUrl = 'https://api.github.com/repos/gulaji/gulaji.github.io/contents/js/data.js';
    const body = JSON.stringify({
      message: '✏️ 在线更新网站内容',
      content: base64Content,
      sha: sha
    });
    const putResp = await fetch(putUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json'
      },
      body: body
    });

    if (!putResp.ok) throw new Error('保存失败: ' + putResp.status);

    alert('✅ 保存成功！网站将在 30 秒左右自动更新。');
  } catch (err) {
    alert('❌ 保存失败: ' + err.message);
    console.error(err);
  }

  saveBtn.textContent = '💾 保存';
  saveBtn.disabled = false;
}

// ==================== 编辑器 UI ====================

// 显示模态窗
function showModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add('show');
}

function hideModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('show');
}

// 绑定登录窗
function bindLoginModal() {
  const loginModal = document.getElementById('loginModal');
  if (!loginModal) return;

  // 点遮罩关闭
  loginModal.addEventListener('click', (e) => {
    if (e.target === loginModal) hideModal('loginModal');
  });

  // 登录按钮
  const loginSubmit = document.getElementById('loginSubmit');
  loginSubmit.addEventListener('click', async () => {
    const password = document.getElementById('passwordInput').value;
    const msg = document.getElementById('loginMsg');
    if (!password) {
      msg.textContent = '请输入密码';
      return;
    }
    msg.textContent = '验证中...';
    const ok = await doLogin(password);
    if (ok) {
      msg.textContent = '';
      hideModal('loginModal');
      document.getElementById('passwordInput').value = '';
      onLoginSuccess();
    } else {
      msg.textContent = '❌ 密码错误';
    }
  });

  // 回车键登录
  document.getElementById('passwordInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') loginSubmit.click();
  });
}

// 登录成功后的操作
function onLoginSuccess() {
  updateLoginUI();
  renderSection(state.currentSection);
  // 没有 Token 就提示设置
  if (!hasGitHubToken()) {
    setTimeout(() => showModal('settingsModal'), 500);
  }
}

// 更新登录状态 UI
function updateLoginUI() {
  const loginBtn = $('#loginBtn');
  const logoutBtn = $('#logoutBtn');
  const saveBtn = $('#saveBtn');
  const toolBar = $('#toolBar');

  if (isLoggedIn) {
    if (loginBtn) loginBtn.style.display = 'none';
    if (logoutBtn) logoutBtn.style.display = 'inline-flex';
    if (saveBtn) saveBtn.style.display = 'inline-flex';
    if (toolBar) toolBar.style.display = 'flex';
  } else {
    if (loginBtn) loginBtn.style.display = 'inline-flex';
    if (logoutBtn) logoutBtn.style.display = 'none';
    if (saveBtn) saveBtn.style.display = 'none';
    if (toolBar) toolBar.style.display = 'none';
  }
}

// 绑定设置窗
function bindSettingsModal() {
  const modal = document.getElementById('settingsModal');
  if (!modal) return;

  modal.addEventListener('click', (e) => {
    if (e.target === modal) hideModal('settingsModal');
  });

  document.getElementById('settingsSave').addEventListener('click', () => {
    const token = document.getElementById('tokenInput').value.trim();
    if (!token) {
      alert('请输入 GitHub Token');
      return;
    }
    setGitHubToken(token);
    hideModal('settingsModal');
    document.getElementById('tokenInput').value = '';
    alert('✅ Token 已保存');
  });

  // 加载已有 token
  const existing = getGitHubToken();
  if (existing) {
    document.getElementById('tokenInput').value = existing;
  }
}

// 绑定编辑窗
function bindEditorModal() {
  const modal = document.getElementById('editorModal');
  if (!modal) return;

  modal.addEventListener('click', (e) => {
    if (e.target === modal) hideModal('editorModal');
  });

  document.getElementById('editorCancel').addEventListener('click', () => {
    hideModal('editorModal');
  });

  document.getElementById('editorSave').addEventListener('click', () => {
    handleEditorSave();
  });
}

// 当前编辑器状态
let editorState = {
  mode: 'add',        // 'add' | 'edit'
  parentType: null,    // 'lifeEntries' | 'readingNotes' | 'projectTimeline' | ...
  parentId: null,      // 项目/实验/论文的 id（时间线模式）
  entryIndex: null     // 编辑模式下的索引
};

// 打开新增窗
function openAddForm(parentType, parentId) {
  editorState.mode = 'add';
  editorState.parentType = parentType;
  editorState.parentId = parentId || null;
  editorState.entryIndex = null;

  document.getElementById('editorTitle').textContent = '✏️ 添加记录';
  document.getElementById('entryTitleInput').value = '';
  document.getElementById('entryDateInput').value = new Date().toISOString().split('T')[0];
  document.getElementById('entryContentInput').value = '';
  document.getElementById('entryPrivate').checked = false;
  document.getElementById('editorSectionSelect').style.display = 'none';

  showModal('editorModal');
  document.getElementById('entryTitleInput').focus();
}

// 打开编辑窗
function openEditForm(parentType, parentId, entryIndex) {
  editorState.mode = 'edit';
  editorState.parentType = parentType;
  editorState.parentId = parentId || null;
  editorState.entryIndex = entryIndex;

  // 获取条目数据
  let entry;
  if (parentType === 'lifeEntries') {
    entry = lifeEntries[entryIndex];
  } else if (parentType === 'readingNotes') {
    entry = readingNotes[entryIndex];
  } else if (parentType === 'projects' && parentId !== null) {
    const proj = projects.find(p => p.id === parentId);
    if (proj) entry = proj.timeline[entryIndex];
  } else if (parentType === 'experiments' && parentId !== null) {
    const exp = experiments.find(p => p.id === parentId);
    if (exp) entry = exp.timeline[entryIndex];
  } else if (parentType === 'papers' && parentId !== null) {
    const paper = papers.find(p => p.id === parentId);
    if (paper) entry = paper.timeline[entryIndex];
  } else if (parentType === 'profile') {
    // 编辑个人信息中的数组
    entry = null;
  }

  if (!entry) return;

  document.getElementById('editorTitle').textContent = '✏️ 编辑记录';
  document.getElementById('entryTitleInput').value = entry.title || '';
  document.getElementById('entryDateInput').value = entry.date || '';
  document.getElementById('entryContentInput').value = entry.content || '';
  document.getElementById('entryPrivate').checked = !!entry.private;
  document.getElementById('editorSectionSelect').style.display = 'none';

  showModal('editorModal');
  document.getElementById('entryTitleInput').focus();
}

// 处理编辑器保存
function handleEditorSave() {
  const title = document.getElementById('entryTitleInput').value.trim();
  const date = document.getElementById('entryDateInput').value;
  const content = document.getElementById('entryContentInput').value.trim();
  const isPrivate = document.getElementById('entryPrivate').checked;

  if (!title) { alert('请输入标题'); return; }
  if (!date) { alert('请选择日期'); return; }

  const entry = {
    date: date,
    title: title,
    content: content,
    private: isPrivate
  };

  const { mode, parentType, parentId, entryIndex } = editorState;

  if (mode === 'add') {
    // 新增：插到数组最前面
    if (parentType === 'lifeEntries') {
      lifeEntries.unshift(entry);
    } else if (parentType === 'readingNotes') {
      readingNotes.unshift(entry);
    } else if (parentType === 'projects' && parentId) {
      const proj = projects.find(p => p.id === parentId);
      if (proj) proj.timeline.unshift(entry);
    } else if (parentType === 'experiments' && parentId) {
      const exp = experiments.find(p => p.id === parentId);
      if (exp) exp.timeline.unshift(entry);
    } else if (parentType === 'papers' && parentId) {
      const paper = papers.find(p => p.id === parentId);
      if (paper) paper.timeline.unshift(entry);
    }
  } else if (mode === 'edit' && entryIndex !== null) {
    // 编辑：替换
    if (parentType === 'lifeEntries') {
      lifeEntries[entryIndex] = { ...lifeEntries[entryIndex], ...entry };
    } else if (parentType === 'readingNotes') {
      readingNotes[entryIndex] = { ...readingNotes[entryIndex], ...entry };
    } else if (parentType === 'projects' && parentId) {
      const proj = projects.find(p => p.id === parentId);
      if (proj) proj.timeline[entryIndex] = { ...proj.timeline[entryIndex], ...entry };
    } else if (parentType === 'experiments' && parentId) {
      const exp = experiments.find(p => p.id === parentId);
      if (exp) exp.timeline[entryIndex] = { ...exp.timeline[entryIndex], ...entry };
    } else if (parentType === 'papers' && parentId) {
      const paper = papers.find(p => p.id === parentId);
      if (paper) paper.timeline[entryIndex] = { ...paper.timeline[entryIndex], ...entry };
    }
  }

  hideModal('editorModal');
  // 重新渲染当前板块
  renderCurrentView();
}

// 删除条目
function deleteEntry(parentType, parentId, entryIndex) {
  if (!confirm('确定要删除这条记录吗？此操作不可恢复。')) return;

  if (parentType === 'lifeEntries') {
    lifeEntries.splice(entryIndex, 1);
  } else if (parentType === 'readingNotes') {
    readingNotes.splice(entryIndex, 1);
  } else if (parentType === 'projects' && parentId) {
    const proj = projects.find(p => p.id === parentId);
    if (proj) proj.timeline.splice(entryIndex, 1);
  } else if (parentType === 'experiments' && parentId) {
    const exp = experiments.find(p => p.id === parentId);
    if (exp) exp.timeline.splice(entryIndex, 1);
  } else if (parentType === 'papers' && parentId) {
    const paper = papers.find(p => p.id === parentId);
    if (paper) paper.timeline.splice(entryIndex, 1);
  }

  renderCurrentView();
}

// 重新渲染当前视图（保持当前板块状态）
function renderCurrentView() {
  if (state.currentView === 'timeline' && state.selectedEntityId) {
    const map = {
      'projects': projects,
      'experiments': experiments,
      'papers': papers
    };
    const dataArray = map[state.selectedEntityType];
    if (dataArray) {
      const entity = dataArray.find(e => e.id === state.selectedEntityId);
      if (entity) {
        renderTimeline(entity);
        return;
      }
    }
    // 实体已删除，返回列表
    state.currentView = 'entity-list';
    backToList();
  } else if (state.currentView === 'entity-list') {
    const map = {
      '项目进展': () => renderEntityList(projects, 'projects', '项目'),
      '实验操作': () => renderEntityList(experiments, 'experiments', '实验'),
      '论文写作': () => renderEntityList(papers, 'papers', '论文')
    };
    if (map[state.currentSection]) map[state.currentSection]();
  } else if (state.currentSection === '读研生活') {
    renderCardList(lifeEntries);
  } else if (state.currentSection === '个人信息') {
    renderProfile();
  }
}

function backToList() {
  state.currentView = 'entity-list';
  state.selectedEntityId = null;
  state.selectedEntityType = null;
  dom.backBtn.style.display = 'none';
  const map = {
    '项目进展': () => renderEntityList(projects, 'projects', '项目'),
    '实验操作': () => renderEntityList(experiments, 'experiments', '实验'),
    '论文写作': () => renderEntityList(papers, 'papers', '论文')
  };
  if (map[state.currentSection]) map[state.currentSection]();
}

// 添加实体（项目/实验/论文）
function openAddEntityForm(entityType) {
  const name = prompt('请输入名称：');
  if (!name) return;
  const desc = prompt('请输入简介：');
  const id = entityType + '-' + Date.now();

  const entity = {
    id: id,
    name: name,
    description: desc || '',
    status: '进行中',
    startDate: new Date().toISOString().split('T')[0].replace(/-/g, '-'),
    timeline: []
  };

  if (entityType === 'projects') {
    projects.unshift(entity);
  } else if (entityType === 'experiments') {
    experiments.unshift(entity);
  } else if (entityType === 'papers') {
    entity.type = '研究论文';
    entity.target = '';
    entity.progress = '选题';
    papers.unshift(entity);
  }

  renderCurrentView();
}

// 删除实体
function deleteEntity(entityType, entityId) {
  if (!confirm('确定要删除这个条目及其所有记录吗？此操作不可恢复。')) return;

  let arr;
  if (entityType === 'projects') arr = projects;
  else if (entityType === 'experiments') arr = experiments;
  else if (entityType === 'papers') arr = papers;
  if (!arr) return;

  const idx = arr.findIndex(e => e.id === entityId);
  if (idx !== -1) arr.splice(idx, 1);

  // 如果正在看这个实体的时间线，返回列表
  if (state.selectedEntityId === entityId) {
    state.currentView = 'entity-list';
    state.selectedEntityId = null;
    dom.backBtn.style.display = 'none';
  }

  renderCurrentView();
}

// ==================== 初始化编辑器 ====================
function initEditor() {
  checkLoginStatus();
  bindLoginModal();
  bindSettingsModal();
  bindEditorModal();
  updateLoginUI();
}

// 暴露编辑权限给 main.js 渲染函数使用
let currentEditContext = null;

function setEditContext(parentType, parentId) {
  currentEditContext = { parentType, parentId };
}

function getEditContext() {
  return currentEditContext;
}
