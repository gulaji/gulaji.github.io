/* ============================================================
   个人学术记录网站 - 渲染引擎 & 交互逻辑
   ============================================================ */

// ==================== 状态管理 ====================
const state = {
  currentSection: '个人信息',   // 当前板块
  currentView: 'profile',       // 'profile' | 'entity-list' | 'timeline' | 'card-list'
  selectedEntityId: null,       // 当前选中的项目/实验/论文 id
  selectedEntityType: null      // 'projects' | 'experiments' | 'papers'
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
  footerYear:  $('#footerYear')
};

// ==================== 初始化 ====================
document.addEventListener('DOMContentLoaded', () => {
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
});

// ==================== 渲染个人信息卡（侧边栏） ====================
function renderSidebar() {
  $('#profileName').textContent = profile.name;
  $('#profileSchool').textContent = profile.school;
  $('#profileMajor').textContent = profile.major;
  $('#profileResearch').textContent = profile.research;
  const emailEl = $('#profileEmail');
  emailEl.textContent = '📧 ' + profile.email;
  emailEl.href = 'mailto:' + profile.email;

  // 社交链接
  const linksEl = $('#profileLinks');
  linksEl.innerHTML = '';
  const icons = { github: '🔗 GitHub', googleScholar: '📚 Scholar', researchGate: '🔬 RG' };
  for (const [key, url] of Object.entries(profile.links)) {
    if (!url) continue;
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = icons[key] || key;
    linksEl.appendChild(a);
  }

  // 头像 fallback
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

// ==================== 个人信息页 ====================
function renderProfile() {
  let html = '';

  // 个人简介
  if (profile.about) {
    html += `<div class="about-section">
      <h3>📝 个人简介</h3>
      <p>${profile.about}</p>
    </div>`;
  }

  // 教育背景
  if (profile.education && profile.education.length) {
    html += `<div class="about-section">
      <h3>🎓 教育背景</h3>
      <ul>`;
    profile.education.forEach(e => {
      html += `<li><strong>${e.period}</strong> — ${e.school}，${e.degree}</li>`;
    });
    html += `</ul></div>`;
  }

  // 技能
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
    if (entity.target) parts.push('目标: ' + entity.target);
    if (entity.startDate) parts.push('始于 ' + entity.startDate);
    return parts.join(' · ');
  }

  let html = `<div class="entity-grid">`;

  dataArray.forEach(entity => {
    const entityName = escapeHtml(entity.name);
    const entityDesc = escapeHtml(entity.description || '');
    const meta = getMeta(entity);
    const badge = getStatusBadge(entity);
    const dateText = entity.startDate ? `<span class="entity-card-date">📅 ${entity.startDate}</span>` : '';

    html += `
      <div class="entity-card" data-entity-id="${entity.id}" data-entity-type="${type}">
        <div class="entity-card-name">${entityName}</div>
        ${entityDesc ? `<div class="entity-card-desc">${entityDesc}</div>` : ''}
        <div class="entity-card-meta">
          ${badge}
          ${meta ? `<span class="entity-card-date" style="color:var(--text-secondary);font-size:0.8rem">${meta}</span>` : ''}
          ${dateText}
        </div>
        <span class="entity-card-arrow">→</span>
      </div>`;
  });

  html += `</div>`;
  dom.contentBody.innerHTML = html;
}

// ==================== 时间线视图 ====================
function renderTimeline(entity) {
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

  let html = `
    <div class="timeline-entity-header">
      <span class="entity-name">${escapeHtml(entity.name)}</span>
      ${badgeText ? `<span class="badge ${badgeCls}">${badgeText}</span>` : ''}
      ${metaItems.length ? `<span style="font-size:0.85rem;color:var(--text-secondary)">${metaItems.join(' · ')}</span>` : ''}
    </div>
    <div class="timeline">`;

  entity.timeline.forEach((item, index) => {
    // 第一条默认展开
    const expanded = index === 0;
    html += `
      <div class="timeline-item ${expanded ? 'expanded' : ''}" data-timeline-index="${index}">
        <div class="timeline-date">${item.date}</div>
        <div class="timeline-title">
          <span class="expand-icon">▶</span> ${escapeHtml(item.title)}
        </div>
        <div class="timeline-content">${formatContent(item.content)}</div>
      </div>`;
  });

  html += `</div>`;
  dom.contentBody.innerHTML = html;
}

// ==================== 卡片列表（读研生活/文献笔记） ====================
function renderCardList(entries) {
  let html = `<div class="card-list">`;

  entries.forEach(entry => {
    html += `
      <div class="entry-card">
        <div class="entry-date">${entry.date}</div>
        <div class="entry-title">${escapeHtml(entry.title)}</div>
        <div class="entry-content">${formatContent(entry.content)}</div>
      </div>`;
  });

  html += `</div>`;
  dom.contentBody.innerHTML = html;
}

// ==================== 事件绑定 ====================

// 导航标签点击
function bindNavEvents() {
  dom.navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      renderSection(btn.dataset.section);
    });
  });

  // Logo 点击回到个人信息
  $('.logo').addEventListener('click', (e) => {
    e.preventDefault();
    renderSection('个人信息');
  });
}

// 返回按钮
function bindBackButton() {
  dom.backBtn.addEventListener('click', () => {
    state.currentView = 'entity-list';
    state.selectedEntityId = null;
    dom.backBtn.style.display = 'none';

    // 重新渲染实体列表
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

// 移动端汉堡菜单
function bindHamburger() {
  dom.hamburger.addEventListener('click', () => {
    dom.navTabs.classList.toggle('open');
  });

  // 点击内容区关闭菜单
  dom.contentArea.addEventListener('click', () => {
    dom.navTabs.classList.remove('open');
  });
}

// 内容区事件委托（实体卡片点击 + 时间线展开/收起）
function bindContentDelegation() {
  dom.contentBody.addEventListener('click', (e) => {
    // 实体卡片点击 → 进入时间线
    const card = e.target.closest('.entity-card');
    if (card) {
      const entityId = card.dataset.entityId;
      const entityType = card.dataset.entityType;
      enterTimeline(entityId, entityType);
      return;
    }

    // 时间线标题点击 → 展开/收起
    const title = e.target.closest('.timeline-title');
    if (title) {
      const item = title.closest('.timeline-item');
      item.classList.toggle('expanded');
      return;
    }
  });
}

// 进入时间线视图
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
  // 将换行转为 <p> 段落或 <br>
  let escaped = escapeHtml(text);
  // 双换行 → 段落
  escaped = escaped.replace(/\n\n/g, '</p><p>');
  // 单换行 → <br>
  escaped = escaped.replace(/\n/g, '<br>');
  return '<p>' + escaped + '</p>';
}
