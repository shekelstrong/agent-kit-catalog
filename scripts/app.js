/**
 * Agent Kit Catalog — enhancement layer v2.
 *
 * Контент уже отрендерен в HTML (SSR).
 * Этот скрипт:
 *   1. Анимирует счётчики в hero
 *   2. Переключает табы (MCP / Skills / Plugins) — показывает/скрывает grid-ы
 *   3. Фильтрует карточки по категориям
 *   4. Живой поиск
 *   5. Обновляет results-bar (счётчик + кнопка сброса)
 *   6. Smooth scroll по якорям
 *   7. Empty state когда ничего не найдено
 *
 * Без JS контент всё равно виден (все карточки в HTML).
 */

(function () {
  'use strict';

  const $  = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  const state = {
    activeTab: 'mcps',
    activeCat: 'all',
    query: '',
  };

  // ===== Init =====
  function bootstrap() {
    try {
      bindEvents();
      animateStats();
      applyFilters(); // начальное состояние
    } catch (e) {
      console.error('[AKC] init failed:', e);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
  } else {
    bootstrap();
  }

  // ===== Stats animation =====
  function animateStats() {
    $$('[data-count]').forEach(function (el) {
      var target = parseInt(el.dataset.count, 10);
      if (!target) return;
      var duration = 1200;
      var start = performance.now();
      var tick = function (now) {
        var t = Math.min(1, (now - start) / duration);
        var eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
        el.textContent = Math.round(target * eased);
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }

  // ===== Filter logic =====
  function applyFilters() {
    // 1. Какой grid показывать
    var grids = {
      mcps:    $('#mcps-grid'),
      skills:  $('#skills-grid'),
      plugins: $('#plugins-grid'),
    };
    Object.keys(grids).forEach(function (key) {
      if (!grids[key]) return;
      var isActive = key === state.activeTab;
      grids[key].classList.toggle('hidden', !isActive);
    });

    // 2. Фильтруем карточки в активном grid-е
    var activeGrid = grids[state.activeTab];
    if (!activeGrid) return;

    var cards = $$('.card', activeGrid);
    var visibleCount = 0;
    var q = state.query.toLowerCase().trim();

    cards.forEach(function (card, idx) {
      var cat = card.dataset.category || '';
      var search = (card.dataset.search || '').toLowerCase();

      var matchesCat = state.activeCat === 'all' || cat === state.activeCat;
      var matchesQuery = !q || search.indexOf(q) !== -1;

      var show = matchesCat && matchesQuery;
      card.classList.toggle('hidden', !show);
      if (show) {
        visibleCount++;
        // Stagger animation
        card.style.setProperty('--i', idx);
      }
    });

    // 3. Обновляем results-bar
    var countEl = $('#results-count');
    var totalEl = $('#results-total');
    var resetBtn = $('#results-reset');
    var bar = $('#results-bar');

    if (countEl) countEl.textContent = visibleCount;
    if (totalEl) totalEl.textContent = cards.length;

    // Empty state
    var existingEmpty = activeGrid.querySelector('.empty-state');
    if (existingEmpty) existingEmpty.remove();

    if (visibleCount === 0 && cards.length > 0) {
      var empty = document.createElement('div');
      empty.className = 'empty-state';
      empty.innerHTML =
        '<div class="empty-state-icon">🔍</div>' +
        '<h3>Ничего не найдено</h3>' +
        '<p>Попробуй другой запрос или сбрось фильтры</p>' +
        '<button class="results-bar-reset" onclick="document.getElementById(\'results-reset\').click()">✕ Сбросить фильтры</button>';
      activeGrid.appendChild(empty);
    }

    // Кнопка сброса — показывать только если есть активные фильтры
    var hasFilters = state.activeCat !== 'all' || state.query.length > 0;
    if (resetBtn) resetBtn.classList.toggle('hidden', !hasFilters);
    if (bar) bar.classList.toggle('hidden', cards.length === 0 && state.activeTab !== 'mcps');
  }

  function resetFilters() {
    state.activeCat = 'all';
    state.query = '';
    var searchInput = $('#search');
    if (searchInput) searchInput.value = '';
    $$('#cats .cat').forEach(function (c) {
      c.classList.toggle('active', c.dataset.cat === 'all');
    });
    applyFilters();
  }

  // ===== Events =====
  function bindEvents() {
    // Tabs
    var tabs = $('#tabs');
    if (tabs) {
      tabs.addEventListener('click', function (e) {
        var tab = e.target.closest('[data-tab]');
        if (!tab) return;
        state.activeTab = tab.dataset.tab;
        state.activeCat = 'all';
        state.query = '';
        var searchInput = $('#search');
        if (searchInput) searchInput.value = '';
        $$('#tabs .nav-tab', tabs).forEach(function (t) {
          t.classList.toggle('active', t === tab);
        });
        $$('#cats .cat').forEach(function (c) {
          c.classList.toggle('active', c.dataset.cat === 'all');
        });
        applyFilters();
      });
    }

    // Categories
    var cats = $('#cats');
    if (cats) {
      cats.addEventListener('click', function (e) {
        var btn = e.target.closest('[data-cat]');
        if (!btn) return;
        state.activeCat = btn.dataset.cat;
        $$('#cats .cat', cats).forEach(function (c) {
          c.classList.toggle('active', c === btn);
        });
        applyFilters();
      });
    }

    // Search (с debounce)
    var searchInput = $('#search');
    if (searchInput) {
      var timer;
      searchInput.addEventListener('input', function (e) {
        clearTimeout(timer);
        timer = setTimeout(function () {
          state.query = e.target.value;
          applyFilters();
        }, 120);
      });
    }

    // Reset button
    var resetBtn = $('#results-reset');
    if (resetBtn) {
      resetBtn.addEventListener('click', resetFilters);
    }

    // Smooth scroll
    $$('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var href = a.getAttribute('href');
        if (href === '#') return;
        var target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }
})();