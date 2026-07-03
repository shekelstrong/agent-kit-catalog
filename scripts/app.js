/**
 * Agent Kit Catalog — основная логика.
 * Vanilla JS, без зависимостей.
 */

(function () {
  'use strict';

  const { MCPS, SKILLS_GROUPS, PLUGINS, CATEGORIES, STATS } = window.AKC_DATA;

  // ===== State =====
  const state = {
    activeTab: 'mcps',     // 'mcps' | 'skills' | 'plugins'
    activeCat: 'all',
    query: '',
  };

  // ===== DOM =====
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  // ===== Init (ждём готовности DOM и данных) =====
  function bootstrap() {
    if (typeof window.AKC_DATA === 'undefined') {
      // data.js ещё не загрузился — подождём
      return setTimeout(bootstrap, 30);
    }
    try {
      init();
    } catch (e) {
      console.error('[AKC] init failed:', e);
      var grid = document.getElementById('grid');
      if (grid) {
        grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:#ff7b72;"><p>⚠️ Ошибка рендера: ' + (e.message || e) + '</p></div>';
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
  } else {
    bootstrap();
  }

  function init() {
    renderStats();
    renderTabs();
    renderCats();
    renderContent();
    bindEvents();
    animateStats();
  }

  // ===== Stats (с анимацией счётчика) =====
  function renderStats() {
    $('#stat-mcps').textContent = STATS.mcps;
    $('#stat-skills').textContent = STATS.skills;
    $('#stat-plugins').textContent = STATS.plugins;
    $('#stat-tools').textContent = STATS.tools;
    $('#stat-total').textContent = STATS.total;
  }

  function animateStats() {
    $$('[data-count]').forEach(el => {
      const target = parseInt(el.dataset.count, 10);
      const duration = 1200;
      const start = performance.now();
      const tick = (now) => {
        const t = Math.min(1, (now - start) / duration);
        // easeOutExpo
        const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
        el.textContent = Math.round(target * eased);
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }

  // ===== Tabs =====
  function renderTabs() {
    const tabs = [
      { id: 'mcps', label: 'MCP', count: STATS.mcps },
      { id: 'skills', label: 'Скиллы', count: STATS.skills },
      { id: 'plugins', label: 'Плагины', count: STATS.plugins },
    ];

    const nav = $('#tabs');
    nav.innerHTML = tabs.map(t => `
      <button class="nav-tab ${state.activeTab === t.id ? 'active' : ''}" data-tab="${t.id}">
        ${t.label}
        <span class="nav-tab-count">${t.count}</span>
      </button>
    `).join('');
  }

  // ===== Categories =====
  function renderCats() {
    const counts = computeCategoryCounts();
    const html = CATEGORIES.map(c => {
      const count = c.id === 'all' ? counts.all : counts[c.id] || 0;
      return `
        <button class="cat ${state.activeCat === c.id ? 'active' : ''}" data-cat="${c.id}">
          <span>${c.emoji}</span>
          <span>${c.name}</span>
          <span class="cat-count">${count}</span>
        </button>
      `;
    }).join('');
    $('#cats').innerHTML = html;
  }

  function computeCategoryCounts() {
    const counts = { all: 0 };
    if (state.activeTab === 'mcps') {
      MCPS.forEach(m => {
        counts.all++;
        counts[m.category] = (counts[m.category] || 0) + 1;
      });
    } else if (state.activeTab === 'skills') {
      SKILLS_GROUPS.forEach(s => {
        counts.all++;
        counts[s.category] = (counts[s.category] || 0) + 1;
      });
    }
    return counts;
  }

  // ===== Content rendering =====
  function renderContent() {
    renderCats(); // counts зависят от таба

    const container = $('#content');
    if (state.activeTab === 'mcps') {
      container.innerHTML = renderMCPS();
    } else if (state.activeTab === 'skills') {
      container.innerHTML = renderSkills();
    } else if (state.activeTab === 'plugins') {
      container.innerHTML = renderPlugins();
    }
    bindCardEvents();
  }

  function renderMCPS() {
    const filtered = filterMCPS();
    if (!filtered.length) {
      return renderEmpty();
    }
    const header = `
      <div class="results-count">
        Найдено: <strong>${filtered.length}</strong> из <strong>${MCPS.length}</strong> MCP
      </div>
    `;
    return header + `<div class="grid">${filtered.map(m => mcpCard(m)).join('')}</div>`;
  }

  function renderSkills() {
    const filtered = filterSkills();
    if (!filtered.length) {
      return renderEmpty();
    }
    const header = `
      <div class="results-count">
        Найдено: <strong>${filtered.length}</strong> из <strong>${SKILLS_GROUPS.length}</strong> групп скиллов
      </div>
    `;
    return header + `<div class="skill-grid">${filtered.map(s => skillGroupCard(s)).join('')}</div>`;
  }

  function renderPlugins() {
    const q = state.query.toLowerCase();
    const filtered = q
      ? PLUGINS.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q))
      : PLUGINS;
    if (!filtered.length) {
      return renderEmpty();
    }
    const header = `
      <div class="results-count">
        Найдено: <strong>${filtered.length}</strong> из <strong>${PLUGINS.length}</strong> плагинов
      </div>
    `;
    return header + `<div class="plugin-grid">${filtered.map(p => pluginCard(p)).join('')}</div>`;
  }

  function filterMCPS() {
    let items = MCPS;
    if (state.activeCat !== 'all') {
      items = items.filter(m => m.category === state.activeCat);
    }
    if (state.query) {
      const q = state.query.toLowerCase();
      items = items.filter(m =>
        m.name.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q) ||
        m.tags.some(t => t.toLowerCase().includes(q)) ||
        m.stack.toLowerCase().includes(q)
      );
    }
    return items;
  }

  function filterSkills() {
    let items = SKILLS_GROUPS;
    if (state.activeCat !== 'all') {
      items = items.filter(s => s.category === state.activeCat);
    }
    if (state.query) {
      const q = state.query.toLowerCase();
      items = items.filter(s =>
        s.group.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.skills.some(sk => sk.toLowerCase().includes(q))
      );
    }
    return items;
  }

  // ===== Card templates =====

  function mcpCard(m) {
    const catColor = `--cat-${m.category}`;
    return `
      <a href="${m.url}" target="_blank" rel="noopener" class="card"
         data-cat="${m.category}" style="--cat-color: var(${catColor})">
        <div class="card-icon">${m.icon || '📦'}</div>
        <div class="card-title-row">
          <div class="card-title">${escapeHtml(m.name)}</div>
          ${m.featured ? '<span class="card-featured">★ featured</span>' : ''}
        </div>
        <div class="card-desc">${escapeHtml(m.description)}</div>
        <div class="card-tags">
          ${m.tags.slice(0, 4).map(t => `<span class="tag">${escapeHtml(t)}</span>`).join('')}
        </div>
        <div class="card-foot">
          <span class="card-tools">
            <strong>${m.tools}</strong> ${pluralize(m.tools, 'инструмент', 'инструмента', 'инструментов')}
          </span>
          <span class="card-arrow">GitHub →</span>
        </div>
      </a>
    `;
  }

  function skillGroupCard(s) {
    const catColor = `--cat-${s.category}`;
    return `
      <div class="skill-group" data-cat="${s.category}" style="--cat-color: var(${catColor})">
        <div class="skill-group-head">
          <div class="skill-group-name">${escapeHtml(s.group)}</div>
          <span class="skill-group-count">${s.count}</span>
        </div>
        <div class="skill-group-desc">${escapeHtml(s.description)}</div>
      </div>
    `;
  }

  function pluginCard(p) {
    return `
      <div class="plugin-card">
        <div class="plugin-name">${escapeHtml(p.name)}</div>
        <div class="plugin-desc">${escapeHtml(p.description)}</div>
        <div class="plugin-count">${p.count} ${pluralize(p.count, 'скилл', 'скилла', 'скиллов')}</div>
      </div>
    `;
  }

  function renderEmpty() {
    return `
      <div class="empty">
        <div class="empty-icon">🔍</div>
        <div><strong>Ничего не найдено</strong></div>
        <div style="margin-top: 8px; font-size: 13px;">
          Попробуй другой запрос или сбрось фильтры
        </div>
      </div>
    `;
  }

  // ===== Events =====
  function bindEvents() {
    // Tabs
    $('#tabs').addEventListener('click', (e) => {
      const tab = e.target.closest('[data-tab]');
      if (!tab) return;
      state.activeTab = tab.dataset.tab;
      state.activeCat = 'all';
      state.query = '';
      $('#search').value = '';
      $$('#tabs .nav-tab').forEach(t => t.classList.toggle('active', t === tab));
      renderContent();
    });

    // Categories
    $('#cats').addEventListener('click', (e) => {
      const btn = e.target.closest('[data-cat]');
      if (!btn) return;
      state.activeCat = btn.dataset.cat;
      $$('#cats .cat').forEach(c => c.classList.toggle('active', c === btn));
      renderContent();
    });

    // Search
    let searchTimer;
    $('#search').addEventListener('input', (e) => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => {
        state.query = e.target.value.trim();
        renderContent();
      }, 120);
    });

    // Smooth scroll for anchor links
    $$('a[href^="#"]').forEach(a => {
      a.addEventListener('click', (e) => {
        const target = document.querySelector(a.getAttribute('href'));
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  function bindCardEvents() {
    // Cards themselves are anchors - browser handles clicks
    // Could add modal here for detail view in future
  }

  // ===== Helpers =====
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function pluralize(n, one, few, many) {
    const mod10 = n % 10;
    const mod100 = n % 100;
    if (mod10 === 1 && mod100 !== 11) return one;
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
    return many;
  }

  // boot вызывается выше (см. bootstrap + DOMContentLoaded)
})();