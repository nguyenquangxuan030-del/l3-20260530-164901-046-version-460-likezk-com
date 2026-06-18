(function () {
  'use strict';

  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function setupMobileMenu() {
    var toggle = document.querySelector('.menu-toggle');
    var menu = document.querySelector('.mobile-nav');

    if (!toggle || !menu) {
      return;
    }

    toggle.addEventListener('click', function () {
      var isOpen = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!isOpen));
      menu.hidden = isOpen;
    });
  }

  function setupImageFallbacks() {
    document.querySelectorAll('img').forEach(function (image) {
      image.addEventListener('error', function () {
        image.classList.add('is-missing');
        var label = image.getAttribute('alt') || '影视封面';
        var parent = image.parentElement;
        if (parent && !parent.querySelector('.image-fallback-label')) {
          var fallback = document.createElement('span');
          fallback.className = 'image-fallback-label';
          fallback.textContent = label;
          fallback.style.position = 'absolute';
          fallback.style.inset = '0';
          fallback.style.display = 'flex';
          fallback.style.alignItems = 'center';
          fallback.style.justifyContent = 'center';
          fallback.style.padding = '16px';
          fallback.style.textAlign = 'center';
          fallback.style.color = '#e5e7eb';
          fallback.style.fontWeight = '800';
          fallback.style.background = 'linear-gradient(135deg, #1e293b, #020617)';
          parent.style.position = parent.style.position || 'relative';
          parent.appendChild(fallback);
        }
      }, { once: true });
    });
  }

  function setupHeroCarousel() {
    var carousel = document.getElementById('heroCarousel');

    if (!carousel) {
      return;
    }

    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var thumbs = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-thumb]'));
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
      thumbs.forEach(function (thumb, thumbIndex) {
        thumb.classList.toggle('is-active', thumbIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    start();
  }

  function textIncludes(value, needle) {
    return String(value || '').toLowerCase().indexOf(String(needle || '').toLowerCase()) !== -1;
  }

  function setupFilters() {
    document.querySelectorAll('[data-filter-panel]').forEach(function (panel) {
      var section = panel.closest('section') || document;
      var grid = section.querySelector('[data-movie-grid]') || document.querySelector('[data-movie-grid]');

      if (!grid) {
        return;
      }

      var keywordInput = panel.querySelector('[data-filter-keyword]');
      var regionSelect = panel.querySelector('[data-filter-region]');
      var typeSelect = panel.querySelector('[data-filter-type]');
      var yearSelect = panel.querySelector('[data-filter-year]');
      var sortSelect = panel.querySelector('[data-filter-sort]');
      var countNode = panel.querySelector('[data-result-count]');
      var cards = Array.prototype.slice.call(grid.children).filter(function (child) {
        return child.classList && child.classList.contains('movie-card');
      });
      var originalOrder = cards.slice();

      var params = new URLSearchParams(window.location.search);
      var query = params.get('q');
      if (query && keywordInput && !keywordInput.value) {
        keywordInput.value = query;
      }

      function sortCards(visibleCards) {
        var mode = sortSelect ? sortSelect.value : 'default';
        var sorted = visibleCards.slice();

        if (mode === 'heat-desc') {
          sorted.sort(function (a, b) {
            return Number(b.getAttribute('data-heat') || 0) - Number(a.getAttribute('data-heat') || 0);
          });
        } else if (mode === 'year-desc') {
          sorted.sort(function (a, b) {
            return Number(b.getAttribute('data-year') || 0) - Number(a.getAttribute('data-year') || 0);
          });
        } else if (mode === 'title-asc') {
          sorted.sort(function (a, b) {
            return String(a.getAttribute('data-title') || '').localeCompare(String(b.getAttribute('data-title') || ''), 'zh-Hans-CN');
          });
        } else {
          sorted = originalOrder.filter(function (card) {
            return visibleCards.indexOf(card) !== -1;
          });
        }

        sorted.forEach(function (card) {
          grid.appendChild(card);
        });
      }

      function applyFilters() {
        var keyword = keywordInput ? keywordInput.value.trim() : '';
        var region = regionSelect ? regionSelect.value : '';
        var type = typeSelect ? typeSelect.value : '';
        var year = yearSelect ? yearSelect.value : '';
        var visibleCards = [];

        cards.forEach(function (card) {
          var matchesKeyword = !keyword || textIncludes(card.getAttribute('data-title'), keyword) || textIncludes(card.getAttribute('data-tags'), keyword) || textIncludes(card.getAttribute('data-genre'), keyword);
          var matchesRegion = !region || card.getAttribute('data-region') === region;
          var matchesType = !type || card.getAttribute('data-type') === type;
          var matchesYear = !year || card.getAttribute('data-year') === year;
          var visible = matchesKeyword && matchesRegion && matchesType && matchesYear;

          card.hidden = !visible;
          if (visible) {
            visibleCards.push(card);
          }
        });

        sortCards(visibleCards);
        if (countNode) {
          countNode.textContent = String(visibleCards.length);
        }
      }

      [keywordInput, regionSelect, typeSelect, yearSelect, sortSelect].forEach(function (control) {
        if (control) {
          control.addEventListener('input', applyFilters);
          control.addEventListener('change', applyFilters);
        }
      });

      applyFilters();
    });
  }

  function setupPlayer() {
    var video = document.getElementById('moviePlayer');
    var button = document.querySelector('[data-play-button]');
    var tip = document.querySelector('[data-player-tip]');

    if (!video) {
      return;
    }

    var source = video.getAttribute('data-src');
    var hlsInstance = null;
    var initialized = false;

    function setTip(message) {
      if (tip) {
        tip.textContent = message;
      }
    }

    function hideOverlay() {
      if (button) {
        button.classList.add('is-hidden');
      }
    }

    function playVideo() {
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          setTip('浏览器阻止了自动播放，请再次点击播放器播放。');
        });
      }
    }

    function initializeAndPlay() {
      if (!source) {
        setTip('未找到播放源。');
        return;
      }

      hideOverlay();

      if (initialized) {
        playVideo();
        return;
      }

      initialized = true;
      setTip('正在初始化 HLS 播放源...');

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setTip('播放源已加载，可正常播放。');
          playVideo();
        });
        hlsInstance.on(window.Hls.Events.ERROR, function (_event, data) {
          if (data && data.fatal) {
            setTip('HLS 播放发生错误，正在尝试使用原生播放。');
            try {
              hlsInstance.destroy();
            } catch (error) {
              // Ignore cleanup errors.
            }
            video.src = source;
            playVideo();
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.addEventListener('loadedmetadata', function () {
          setTip('原生 HLS 播放源已加载。');
          playVideo();
        }, { once: true });
      } else {
        video.src = source;
        setTip('当前浏览器未检测到 HLS.js，已尝试直接加载播放源。');
        playVideo();
      }
    }

    if (button) {
      button.addEventListener('click', initializeAndPlay);
    }

    video.addEventListener('play', hideOverlay);
    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  ready(function () {
    setupMobileMenu();
    setupImageFallbacks();
    setupHeroCarousel();
    setupFilters();
    setupPlayer();
  });
})();
