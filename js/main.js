/* ============================================================
   个人学术记录网站 - 渲染引擎 & 交互逻辑
   ============================================================ */

// ==================== 状态管理 ====================
const state = {
  currentSection: '个人信息',
  currentView: 'profile',
  selectedEntityId: null,
  selectedEntityType: null
};

// ==================== DOM 缓存 ====================
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const dom = {
  navTabs:     $('#navTabs'),
  navButtons:  $$('.nav-tab'),
  hamburger:   $('#hamburger'),
  sidebar:     $('#sidebar'),
  contentArea: $('#contentArea'),
  contentBody: $('#contentBody'),
  sectionTitle:$('#sectionTitle'),
  backBtn:     $('#backBtn'),
  footerYear:  $('#footerYear'),
  loginBtn:    $('#loginBtn'),
  logoutBtn:   $('#logoutBtn'),
  saveBtn:     $('#saveBtn'),
  toolBar:     $('#toolBar'),
  settingsBtn: $('#settingsBtn')
};

// ==================== 初始化 ====================
document.addEventListener('DOMContentLoaded', () => {
  // 初始化认证和编辑器
  initEditor();

  // 设置页脚年份
  dom.footerYear.textContent = new Date().getFullYear();

  // 填充个人信息卡
  renderSidebar();

  // 默认显示个人信息
  renderSection('个人信息');

  // 绑定事件
  bindNavEvents();
  bindBackButton();
  bindHamburger();
  bindContentDelegation();
  bindHeaderActions();
});

// ==================== 头部按钮事件 ====================
function bindHeaderActions() {
  // 登录按钮
  dom.loginBtn.addEventListener('click', () => {
    showModal('loginModal');
    document.getElementById('passwordInput').focus();
  });

  // 登出按钮
  dom.logoutBtn.addEventListener('click', () => {
    if (confirm('确定要退出登录吗？')) {
      doLogout();
    }
  });

  // 保存按钮
  dom.saveBtn.addEventListener('click', () => {
    saveToGitHub();
  });

  // 设置按钮
  dom.settingsBtn.addEventListener('click', () => {
    showModal('settingsModal');
    const existing = getGitHubToken();
    if (existing) {
      document.getElementById('tokenInput').value = existing;
    }
  });
}

// ==================== 渲染个人信息卡（侧边栏） ====================
function renderSidebar() {
  $('#profileName').textContent = profile.name;
  $('#profileSchool').textContent = profile.school;
  $('#profileMajor').textContent = profile.major;
  $('#profileResearch').textContent = profile.research;
  const emailEl = $('#profileEmail');
  emailEl.textContent = '📧 ' + profile.email;
  emailEl.href = 'mailto:' + profile.email;

  const linksEl = $('#profileLinks');
  linksEl.innerHTML = '';
  const icons = { github: '🔗 GitHub', googleScholar: '📚 Scholar', researchGate: '🔬 RG' };
  for (const [key, url] of Object.entries(profile.links)) {
    if (!url || url.trim() === '') continue;
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = icons[key] || key;
    linksEl.appendChild(a);
  }

  const avatarImg = $('#avatarImg');
  const avatarFallback = $('#avatarFallback');
  if (profile.avatar && profile.avatar.trim()) {
    avatarImg.src = profile.avatar;
    avatarImg.style.display = 'block';
    avatarFallback.style.display = 'none';
  } else {
    avatarImg.style.display = 'none';
    avatarFallback.style.display = 'flex';
  }
}

// ==================== 主导航逻辑 ====================
function renderSection(sectionName) {
  state.currentSection = sectionName;
  state.selectedEntityId = null;
  state.selectedEntityType = null;

  // 更新导航高亮
  dom.navButtons.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.section === sectionName);
  });

  // 更新标题
  dom.sectionTitle.textContent = sectionName;

  // 关闭移动端菜单
  dom.navTabs.classList.remove('open');

  // 根据板块渲染
  switch (sectionName) {
    case '个人信息':
      state.currentView = 'profile';
      dom.backBtn.style.display = 'none';
      renderProfile();
      break;
    case '读研生活':
      state.currentView = 'card-list';
      dom.backBtn.style.display = 'none';
      renderCardList(lifeEntries);
      break;
    case '项目进展':
      state.currentView = 'entity-list';
      dom.backBtn.style.display = 'none';
      renderEntityList(projects, 'projects', '项目');
      break;
    case '实验操作':
      state.currentView = 'entity-list';
      dom.backBtn.style.display = 'none';
      renderEntityList(experiments, 'experiments', '实验');
      break;
    case '论文写作':
      state.currentView = 'entity-list';
      dom.backBtn.style.display = 'none';
      renderEntityList(papers, 'papers', '论文');
      break;
  }
}

// 渲染实体列表时传入 sectionName 用于条件渲染添加按钮
function renderSectionWithState() {
  renderSection(state.currentSection);
  if ((state.currentSection === '项目进展' || state.currentSection === '实验操作' || state.currentSection === '论文写作') && state.currentView === 'entity-list') {
    // entity-list 已渲染，加添加按钮通过 renderEntityList 内部的逻辑处理
  }
}

// ==================== 个人信息页 ====================
function renderProfile() {
  let html = '';

  // 编辑按钮（登录后显示）
  if (isLoggedIn) {
    html += `<div class="edit-actions" style="margin-bottom:16px">
      <button class="btn-edit" onclick="editProfile()">✏️ 编辑个人信息</button>
    </div>`;
  }

  if (profile.about) {
    html += `<div class="about-section">
      <h3>📝 个人简介</h3>
      <p>${profile.about}</p>
    </div>`;
  }

  if (profile.education && profile.education.length) {
    html += `<div class="about-section">
      <h3>🎓 教育背景</h3>
      <ul>`;
    profile.education.forEach(e => {
      html += `<li><strong>${e.period}</strong> — ${e.school}，${e.degree}</li>`;
    });
    html += `</ul></div>`;
  }

  if (profile.skills && profile.skills.length) {
    html += `<div class="about-section">
      <h3>🛠 实验与技能</h3>
      <div class="skill-tags">`;
    profile.skills.forEach(s => {
      html += `<span class="skill-tag">${s}</span>`;
    });
    html += `</div></div>`;
  }

  dom.contentBody.innerHTML = html;
}

// 编辑个人信息
function editProfile() {
  const newAbout = prompt('个人简介：', profile.about);
  if (newAbout !== null) profile.about = newAbout;

  const newSkills = prompt('技能标签（用逗号分隔）：', profile.skills.join(', '));
  if (newSkills !== null) profile.skills = newSkills.split(',').map(s => s.trim()).filter(Boolean);

  const newResearch = prompt('研究方向：', profile.research);
  if (newResearch !== null) profile.research = newResearch;

  renderProfile();
  renderSidebar();
}

// ==================== 实体列表（项目/实验/论文） ====================
function renderEntityList(dataArray, type, label) {
  function getStatusBadge(entity) {
    const s = entity.status || entity.progress || '';
    const map = {
      '进行中':   ['badge-active',   '进行中'],
      '已完成':   ['badge-done',     '已完成'],
      '撰写中':   ['badge-writing', '撰写中'],
      '选题':     ['badge-writing', '选题中'],
      '投稿':     ['badge-submitted','投稿中'],
      '修改':     ['badge-writing', '修改中'],
      '已发表':   ['badge-published','已发表']
    };
    const [cls, text] = map[s] || ['badge-active', s];
    return `<span class="badge ${cls}">${text}</span>`;
  }

  function getMeta(entity) {
    let parts = [];
    if (entity.type) parts.push(entity.type);
    if (entity.target) parts.push('目标: ' + escapeHtml(entity.target));
    if (entity.startDate) parts.push('始于 ' + entity.startDate);
    return parts.join(' · ');
  }

  let html = '';

  // 添加按钮（登录后）
  if (isLoggedIn) {
    const typeMap = { 'projects': 'projects', 'experiments': 'experiments', 'papers': 'papers' };
    html += `<div class="edit-actions" style="margin-bottom:16px">
      <button class="btn-add-entity" onclick="openAddEntityForm('${typeMap[type]}')">➕ 添加${label}</button>
    </div>`;
  }

  html += `<div class="entity-grid">`;

  // 隐私过滤
  const filtered = isLoggedIn ? dataArray : dataArray.filter(e => !e.private);

  filtered.forEach(entity => {
    const entityName = escapeHtml(entity.name);
    const entityDesc = escapeHtml(entity.description || '');
    const meta = getMeta(entity);
    const badge = getStatusBadge(entity);
    const privateTag = (isLoggedIn && entity.private) ? '<span class="private-badge">🔒 仅自己可见</span>' : '';

    html += `
      <div class="entity-card" data-entity-id="${entity.id}" data-entity-type="${type}">
        <div class="entity-card-name">${entityName} ${privateTag}</div>
        ${entityDesc ? `<div class="entity-card-desc">${entityDesc}</div>` : ''}
        <div class="entity-card-meta">
          ${badge}
          ${meta ? `<span class="entity-card-date" style="color:var(--text-secondary);font-size:0.8rem">${meta}</span>` : ''}
        </div>
        <span class="entity-card-arrow">→</span>
        ${isLoggedIn ? `
        <div class="entity-card-edit-actions">
          <button class="btn-edit" onclick="event.stopPropagation();renameEntity('${type}','${entity.id}')">✏️ 重命名</button>
          <button class="btn-del" onclick="event.stopPropagation();deleteEntity('${type}','${entity.id}')">🗑 删除</button>
        </div>` : ''}
      </div>`;
  });

  html += `</div>`;
  dom.contentBody.innerHTML = html;
}

// 重命名实体
function renameEntity(entityType, entityId) {
  const map = { 'projects': projects, 'experiments': experiments, 'papers': papers };
  const arr = map[entityType];
  if (!arr) return;
  const entity = arr.find(e => e.id === entityId);
  if (!entity) return;
  const newName = prompt('新名称：', entity.name);
  if (newName) {
    entity.name = newName;
    renderCurrentView();
  }
}

// ==================== 时间线视图 ====================
function renderTimeline(entity) {
  if (!canSeeEntity(entity)) {
    dom.contentBody.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:40px">🔒 此内容仅创建者可见</p>';
    return;
  }

  const badgeMap = {
    '进行中': ['badge-active', '进行中'],
    '已完成': ['badge-done', '已完成'],
    '撰写中': ['badge-writing', '撰写中'],
    '选题':   ['badge-writing', '选题中'],
    '投稿':   ['badge-submitted','投稿中'],
    '修改':   ['badge-writing', '修改中'],
    '已发表': ['badge-published','已发表']
  };
  const s = entity.status || entity.progress || '';
  const [badgeCls, badgeText] = badgeMap[s] || ['badge-active', s];

  let metaItems = [];
  if (entity.type) metaItems.push(entity.type);
  if (entity.target) metaItems.push('目标期刊: ' + escapeHtml(entity.target));
  if (entity.startDate) metaItems.push('开始时间: ' + entity.startDate);

  // 确定 parentType
  let parentType;
  if (state.selectedEntityType === 'projects') parentType = 'projects';
  else if (state.selectedEntityType === 'experiments') parentType = 'experiments';
  else if (state.selectedEntityType === 'papers') parentType = 'papers';

  let html = `
    <div class="timeline-entity-header">
      <span class="entity-name">${escapeHtml(entity.name)}</span>
      ${badgeText ? `<span class="badge ${badgeCls}">${badgeText}</span>` : ''}
      ${metaItems.length ? `<span style="font-size:0.85rem;color:var(--text-secondary)">${metaItems.join(' · ')}</span>` : ''}
    </div>`;

  // 添加按钮（登录后）
  if (isLoggedIn) {
    html += `<div class="edit-actions" style="margin-bottom:16px">
      <button class="btn-add-entity" onclick="openAddForm('${parentType}','${entity.id}')">➕ 添加进展</button>
    </div>`;
  }

  html += `<div class="timeline">`;

  // 隐私过滤
  const filtered = isLoggedIn ? entity.timeline : entity.timeline.filter(t => !t.private);

  filtered.forEach((item, index) => {
    const expanded = index === 0;
    const realIndex = entity.timeline.indexOf(item); // 真实索引
    const privateTag = (isLoggedIn && item.private) ? '<span class="private-badge">🔒 仅自己可见</span>' : '';

    html += `
      <div class="timeline-item ${expanded ? 'expanded' : ''}" data-timeline-index="${realIndex}">
        <div class="timeline-date">${item.date}${privateTag}</div>
        <div class="timeline-title">
          <span class="expand-icon">▶</span> ${escapeHtml(item.title)}
        </div>
        <div class="timeline-content">${formatContent(item.content)}</div>
        ${isLoggedIn ? `
        <div class="timeline-edit-actions">
          <button class="btn-edit" onclick="openEditForm('${parentType}','${entity.id}',${realIndex})">✏️ 编辑</button>
          <button class="btn-del" onclick="deleteEntry('${parentType}','${entity.id}',${realIndex})">🗑 删除</button>
        </div>` : ''}
      </div>`;
  });

  html += `</div>`;
  dom.contentBody.innerHTML = html;
}

// ==================== 卡片列表（读研生活/文献笔记） ====================
function renderCardList(entries) {
  let html = '<div class="card-list">';

  const parentType = state.currentSection === '读研生活' ? 'lifeEntries' : 'readingNotes';

  // 添加按钮（登录后）
  if (isLoggedIn) {
    html += `<div class="edit-actions" style="margin-bottom:8px">
      <button class="btn-add-entity" onclick="openAddForm('${parentType}')">➕ 添加记录</button>
    </div>`;
  }

  // 隐私过滤
  const filtered = isLoggedIn ? entries : entries.filter(e => !e.private);
  const realEntries = entries; // 原始数组用于索引

  filtered.forEach(entry => {
    const realIndex = realEntries.indexOf(entry);
    const privateTag = (isLoggedIn && entry.private) ? '<span class="private-badge">🔒 仅自己可见</span>' : '';

    html += `
      <div class="entry-card">
        <div class="entry-date">${entry.date}${privateTag}</div>
        <div class="entry-title">${escapeHtml(entry.title)}</div>
        <div class="entry-content">${formatContent(entry.content)}</div>
        ${isLoggedIn ? `
        <div class="edit-actions" style="margin-top:10px">
          <button class="btn-edit" onclick="openEditForm('${parentType}',null,${realIndex})">✏️ 编辑</button>
          <button class="btn-del" onclick="deleteEntry('${parentType}',null,${realIndex})">🗑 删除</button>
        </div>` : ''}
      </div>`;
  });

  html += '</div>';
  dom.contentBody.innerHTML = html;
}

// ==================== 事件绑定 ====================

function bindNavEvents() {
  dom.navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      renderSection(btn.dataset.section);
    });
  });

  $('.logo').addEventListener('click', (e) => {
    e.preventDefault();
    renderSection('个人信息');
  });
}

function bindBackButton() {
  dom.backBtn.addEventListener('click', () => {
    state.currentView = 'entity-list';
    state.selectedEntityId = null;
    dom.backBtn.style.display = 'none';

    const map = {
      'projects':    () => renderEntityList(projects, 'projects', '项目'),
      'experiments': () => renderEntityList(experiments, 'experiments', '实验'),
      'papers':      () => renderEntityList(papers, 'papers', '论文')
    };
    if (map[state.selectedEntityType]) {
      map[state.selectedEntityType]();
    }
    state.selectedEntityType = null;
  });
}

function bindHamburger() {
  dom.hamburger.addEventListener('click', () => {
    dom.navTabs.classList.toggle('open');
  });

  dom.contentArea.addEventListener('click', () => {
    dom.navTabs.classList.remove('open');
  });
}

function bindContentDelegation() {
  dom.contentBody.addEventListener('click', (e) => {
    const card = e.target.closest('.entity-card');
    if (card) {
      const entityId = card.dataset.entityId;
      const entityType = card.dataset.entityType;
      if (entityId && entityType) {
        enterTimeline(entityId, entityType);
      }
      return;
    }

    const title = e.target.closest('.timeline-title');
    if (title) {
      const item = title.closest('.timeline-item');
      if (item) item.classList.toggle('expanded');
      return;
    }
  });
}

function enterTimeline(entityId, entityType) {
  const map = {
    'projects':    projects,
    'experiments': experiments,
    'papers':      papers
  };
  const dataArray = map[entityType];
  if (!dataArray) return;

  const entity = dataArray.find(e => e.id === entityId);
  if (!entity) return;

  state.currentView = 'timeline';
  state.selectedEntityId = entityId;
  state.selectedEntityType = entityType;

  dom.backBtn.style.display = 'inline-flex';
  renderTimeline(entity);
}

// ==================== 工具函数 ====================

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatContent(text) {
  if (!text) return '';
  let escaped = escapeHtml(text);
  escaped = escaped.replace(/\n\n/g, '</p><p>');
  escaped = escaped.replace(/\n/g, '<br>');
  return '<p>' + escaped + '</p>';
}
