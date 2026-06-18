(function () {
  var menuButton = document.querySelector("[data-menu-button]");
  var mobilePanel = document.querySelector("[data-mobile-panel]");

  if (menuButton && mobilePanel) {
    menuButton.addEventListener("click", function () {
      mobilePanel.classList.toggle("open");
    });
  }

  var carousel = document.querySelector("[data-hero-carousel]");

  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
    var current = 0;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(current + 1);
      }, 5600);
    }
  }

  var filterForm = document.querySelector("[data-filter-form]");
  var cardContainer = document.querySelector("[data-card-container]");

  if (filterForm && cardContainer) {
    var keywordInput = filterForm.querySelector("[data-filter-keyword]");
    var yearInput = filterForm.querySelector("[data-filter-year]");
    var typeInput = filterForm.querySelector("[data-filter-type]");
    var sortSelect = filterForm.querySelector("[data-sort-select]");
    var emptyState = document.querySelector("[data-empty-state]");
    var cards = Array.prototype.slice.call(cardContainer.querySelectorAll("[data-card]"));
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q");

    if (initialQuery && keywordInput) {
      keywordInput.value = initialQuery;
    }

    function normalize(value) {
      return String(value || "").toLowerCase().trim();
    }

    function applyFilters() {
      var keyword = normalize(keywordInput && keywordInput.value);
      var year = normalize(yearInput && yearInput.value);
      var type = normalize(typeInput && typeInput.value);
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize(card.textContent + " " + card.dataset.title + " " + card.dataset.genre + " " + card.dataset.region + " " + card.dataset.type + " " + card.dataset.year);
        var matched = true;

        if (keyword && haystack.indexOf(keyword) === -1) {
          matched = false;
        }

        if (year && normalize(card.dataset.year).indexOf(year) === -1) {
          matched = false;
        }

        if (type && normalize(card.dataset.type).indexOf(type) === -1 && haystack.indexOf(type) === -1) {
          matched = false;
        }

        card.hidden = !matched;

        if (matched) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.hidden = visible !== 0;
      }
    }

    function sortCards() {
      if (!sortSelect) {
        return;
      }

      var mode = sortSelect.value;
      var sorted = cards.slice();

      sorted.sort(function (a, b) {
        if (mode === "score") {
          return Number(b.dataset.score) - Number(a.dataset.score);
        }

        if (mode === "year") {
          return Number(b.dataset.year) - Number(a.dataset.year);
        }

        if (mode === "heat") {
          return Number(b.dataset.heat) - Number(a.dataset.heat);
        }

        if (mode === "title") {
          return String(a.dataset.title).localeCompare(String(b.dataset.title), "zh-Hans-CN");
        }

        return 0;
      });

      sorted.forEach(function (card) {
        cardContainer.appendChild(card);
      });

      cards = sorted;
    }

    filterForm.addEventListener("submit", function (event) {
      event.preventDefault();
      sortCards();
      applyFilters();
    });

    [keywordInput, yearInput, typeInput].forEach(function (input) {
      if (input) {
        input.addEventListener("input", applyFilters);
      }
    });

    if (sortSelect) {
      sortSelect.addEventListener("change", function () {
        sortCards();
        applyFilters();
      });
    }

    sortCards();
    applyFilters();
  }

  function loadHls(callback) {
    if (window.Hls) {
      callback();
      return;
    }

    var script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js";
    script.onload = callback;
    script.onerror = callback;
    document.head.appendChild(script);
  }

  function setupPlayer(player) {
    var video = player.querySelector("video");
    var button = player.querySelector("[data-player-button]");

    if (!video || !button) {
      return;
    }

    var source = video.getAttribute("data-video");
    var prepared = false;

    function playVideo() {
      var action = video.play();

      if (action && typeof action.catch === "function") {
        action.catch(function () {});
      }
    }

    function prepare() {
      if (!source) {
        return;
      }

      if (prepared) {
        playVideo();
        return;
      }

      prepared = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        video.addEventListener("loadedmetadata", playVideo, { once: true });
        video.load();
        return;
      }

      loadHls(function () {
        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({ enableWorker: true });
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
        } else {
          video.src = source;
          video.load();
          playVideo();
        }
      });
    }

    function start() {
      button.classList.add("hidden");
      prepare();
    }

    button.addEventListener("click", start);

    video.addEventListener("play", function () {
      button.classList.add("hidden");
    });
  }

  Array.prototype.slice.call(document.querySelectorAll("[data-player]")).forEach(setupPlayer);
})();
