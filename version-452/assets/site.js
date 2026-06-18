(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var toggle = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (toggle && panel) {
      toggle.addEventListener('click', function () {
        panel.classList.toggle('is-open');
      });
    }

    var backTop = document.querySelector('[data-back-top]');
    if (backTop) {
      window.addEventListener('scroll', function () {
        if (window.scrollY > 480) {
          backTop.classList.add('is-visible');
        } else {
          backTop.classList.remove('is-visible');
        }
      });
      backTop.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    initHero();
    initCardTools();
    applySearchQuery();
  });

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        restart();
      });
    });
    restart();
  }

  function initCardTools() {
    var grids = Array.prototype.slice.call(document.querySelectorAll('.js-card-grid'));
    grids.forEach(function (grid) {
      var section = grid.closest('section') || document;
      var input = section.querySelector('.js-search-input');
      var selects = Array.prototype.slice.call(section.querySelectorAll('.js-filter-select'));
      var sort = section.querySelector('.js-sort-select');
      var empty = section.querySelector('[data-empty-state]');
      var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
      cards.forEach(function (card, cardIndex) {
        card.setAttribute('data-default-order', String(cardIndex));
      });

      function update() {
        var query = input ? input.value.trim().toLowerCase() : '';
        var filters = {};
        selects.forEach(function (select) {
          filters[select.getAttribute('data-filter')] = select.value;
        });
        var visible = 0;
        cards.forEach(function (card) {
          var text = [
            card.getAttribute('data-title'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-tags'),
            card.getAttribute('data-year')
          ].join(' ').toLowerCase();
          var matchesQuery = !query || text.indexOf(query) !== -1;
          var matchesEra = !filters.era || card.getAttribute('data-era') === filters.era;
          var matchesRegion = !filters.region || card.getAttribute('data-region') === filters.region;
          var show = matchesQuery && matchesEra && matchesRegion;
          card.style.display = show ? '' : 'none';
          if (show) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle('is-visible', visible === 0);
        }
      }

      function sortCards() {
        var mode = sort ? sort.value : 'default';
        var sorted = cards.slice().sort(function (a, b) {
          if (mode === 'heat') {
            return Number(b.getAttribute('data-heat')) - Number(a.getAttribute('data-heat'));
          }
          if (mode === 'year') {
            return Number(b.getAttribute('data-year')) - Number(a.getAttribute('data-year'));
          }
          if (mode === 'title') {
            return (a.getAttribute('data-title') || '').localeCompare(b.getAttribute('data-title') || '', 'zh-Hans-CN');
          }
          return Number(a.getAttribute('data-default-order')) - Number(b.getAttribute('data-default-order'));
        });
        sorted.forEach(function (card) {
          grid.appendChild(card);
        });
        update();
      }

      if (input) {
        input.addEventListener('input', update);
      }
      selects.forEach(function (select) {
        select.addEventListener('change', update);
      });
      if (sort) {
        sort.addEventListener('change', sortCards);
      }
      sortCards();
      update();
    });
  }

  function applySearchQuery() {
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');
    if (!query) {
      return;
    }
    var input = document.querySelector('.js-search-input');
    if (input) {
      input.value = query;
      input.dispatchEvent(new Event('input'));
    }
  }
})();
