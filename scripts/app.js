/**
 * Agent Kit Catalog — enhancement layer.
 *
 * Принцип: ВСЕ карточки уже отрисованы в HTML (SSR).
 * Этот скрипт ТОЛЬКО:
 *   1. Делает счётчики в hero анимированными
 *   2. Переключает табы (MCP / Skills / Plugins) — показывает/скрывает grid-ы
 *   3. Фильтрует карточки по категориям (через CSS-классы)
 *   4. Делает живой поиск
 *   5. Smooth-scroll по якорям
 *
 * Если JS не выполнится (Telegram WebApp, NoScript, мобильный баг) —
 * контент всё равно виден.
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
      applyFilters(); // начальное применение (всё видно)
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
    // Какие grid-ы показывать (в зависимости от таба)
    var grids = {
      mcps:    $('#mcps-grid'),
      skills:  $('#skills-grid'),
      plugins: $('#plugins-grid'),
    };
    Object.keys(grids).forEach(function (key) {
      if (!grids[key]) return;
      grids[key].classList.toggle('hidden', key !== state.activeTab);
    });

    // Карточки внутри активного grid-а фильтруем
    var activeGrid = grids[state.activeTab];
    if (!activeGrid) return;

    var cards = $$('.card', activeGrid);
    var visibleCount = 0;
    var q = state.query.toLowerCase().trim();

    cards.forEach(function (card) {
      var cat = card.dataset.category || '';
      var search = (card.dataset.search || '').toLowerCase();

      var matchesCat = state.activeCat === 'all' || cat === state.activeCat;
      var matchesQuery = !q || search.indexOf(q) !== -1;

      var show = matchesCat && matchesQuery;
      card.classList.toggle('hidden', !show);
      if (show) visibleCount++;
    });

    // Обновляем счётчик "найдено"
    var counter = $('#results-count');
    if (counter) {
      counter.textContent = visibleCount;
      counter.style.display = '';
    }
    var totalEl = $('#results-total');
    if (totalEl) totalEl.textContent = cards.length;
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
        // Сбрасываем активную категорию
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