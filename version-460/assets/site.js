(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobilePanel = document.querySelector('.mobile-panel');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('img').forEach(function (image) {
    image.addEventListener('error', function () {
      image.classList.add('image-missing');
    });
  });

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var slideIndex = 0;

  function showSlide(nextIndex) {
    if (!slides.length) {
      return;
    }

    slideIndex = (nextIndex + slides.length) % slides.length;

    slides.forEach(function (slide, index) {
      slide.classList.toggle('is-active', index === slideIndex);
    });

    dots.forEach(function (dot, index) {
      dot.classList.toggle('is-active', index === slideIndex);
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      showSlide(Number(dot.getAttribute('data-go')) || 0);
    });
  });

  if (slides.length > 1) {
    setInterval(function () {
      showSlide(slideIndex + 1);
    }, 5200);
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function filterList(section) {
    var keyword = normalize(section.querySelector('.filter-input') && section.querySelector('.filter-input').value);
    var year = normalize(section.querySelector('.year-filter') && section.querySelector('.year-filter').value);
    var genre = normalize(section.querySelector('.genre-filter') && section.querySelector('.genre-filter').value);
    var items = section.querySelectorAll('.filter-list .movie-card');

    items.forEach(function (item) {
      var haystack = normalize([
        item.getAttribute('data-title'),
        item.getAttribute('data-year'),
        item.getAttribute('data-genre'),
        item.getAttribute('data-region')
      ].join(' '));
      var itemYear = normalize(item.getAttribute('data-year'));
      var itemGenre = normalize(item.getAttribute('data-genre'));
      var visible = true;

      if (keyword && haystack.indexOf(keyword) === -1) {
        visible = false;
      }

      if (year && itemYear.indexOf(year) === -1) {
        visible = false;
      }

      if (genre && itemGenre.indexOf(genre) === -1) {
        visible = false;
      }

      item.classList.toggle('is-filter-hidden', !visible);
    });
  }

  document.querySelectorAll('.filter-section').forEach(function (section) {
    section.querySelectorAll('input, select').forEach(function (control) {
      control.addEventListener('input', function () {
        filterList(section);
      });
      control.addEventListener('change', function () {
        filterList(section);
      });
    });
  });

  var params = new URLSearchParams(window.location.search);
  var query = params.get('q');
  var searchInput = document.querySelector('.search-page .filter-input');

  if (query && searchInput) {
    searchInput.value = query;
    var section = document.querySelector('.search-page');
    if (section) {
      filterList(section);
    }
  }

  function startPlayback(shell) {
    var video = shell.querySelector('video');
    var mask = shell.querySelector('.play-mask');
    var source = shell.getAttribute('data-video');

    if (!video || !source) {
      return;
    }

    if (mask) {
      mask.classList.add('is-hidden');
    }

    if (window.Hls && window.Hls.isSupported()) {
      if (!shell.hlsPlayer) {
        shell.hlsPlayer = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        shell.hlsPlayer.loadSource(source);
        shell.hlsPlayer.attachMedia(video);
        shell.hlsPlayer.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
      } else {
        video.play().catch(function () {});
      }
    } else {
      if (!video.src) {
        video.src = source;
      }
      video.play().catch(function () {});
    }
  }

  document.querySelectorAll('.player-shell').forEach(function (shell) {
    var mask = shell.querySelector('.play-mask');
    var video = shell.querySelector('video');

    if (mask) {
      mask.addEventListener('click', function () {
        startPlayback(shell);
      });
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          startPlayback(shell);
        }
      });
      video.addEventListener('play', function () {
        if (mask) {
          mask.classList.add('is-hidden');
        }
      });
    }
  });
})();
