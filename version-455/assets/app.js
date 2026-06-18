(function () {
  var mobileButton = document.querySelector('.mobile-toggle');
  var mobileNav = document.querySelector('.mobile-nav');
  if (mobileButton && mobileNav) {
    mobileButton.addEventListener('click', function () {
      mobileNav.hidden = !mobileNav.hidden;
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var panelImage = document.querySelector('[data-hero-panel-image]');
  var panelTitle = document.querySelector('[data-hero-panel-title]');
  var panelText = document.querySelector('[data-hero-panel-text]');
  var panelLink = document.querySelector('[data-hero-panel-link]');
  var active = 0;

  function showSlide(index) {
    if (!slides.length) return;
    active = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('active', i === active);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('active', i === active);
    });
    var item = slides[active];
    if (panelImage && item.dataset.cover) panelImage.src = item.dataset.cover;
    if (panelTitle && item.dataset.title) panelTitle.textContent = item.dataset.title;
    if (panelText && item.dataset.text) panelText.textContent = item.dataset.text;
    if (panelLink && item.dataset.url) panelLink.href = item.dataset.url;
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    showSlide(0);
    window.setInterval(function () {
      showSlide(active + 1);
    }, 5200);
  }

  var filterInput = document.querySelector('[data-filter-input]');
  var sortSelect = document.querySelector('[data-sort-select]');
  var grid = document.querySelector('[data-filter-grid]');
  var cards = grid ? Array.prototype.slice.call(grid.querySelectorAll('.movie-card')) : [];

  function applyFilter() {
    var keyword = filterInput ? filterInput.value.trim().toLowerCase() : '';
    cards.forEach(function (card) {
      var text = [card.dataset.title, card.dataset.year, card.dataset.region, card.dataset.type, card.dataset.genre, card.dataset.tags].join(' ').toLowerCase();
      card.hidden = keyword && text.indexOf(keyword) === -1;
    });
  }

  function applySort() {
    if (!grid || !sortSelect) return;
    var value = sortSelect.value;
    var sorted = cards.slice().sort(function (a, b) {
      if (value === 'title') {
        return (a.dataset.title || '').localeCompare(b.dataset.title || '', 'zh-Hans-CN');
      }
      var ay = parseInt(a.dataset.year, 10) || 0;
      var by = parseInt(b.dataset.year, 10) || 0;
      return value === 'year-asc' ? ay - by : by - ay;
    });
    sorted.forEach(function (card) {
      grid.appendChild(card);
    });
    cards = sorted;
    applyFilter();
  }

  if (filterInput) {
    filterInput.addEventListener('input', applyFilter);
  }
  if (sortSelect) {
    sortSelect.addEventListener('change', applySort);
  }
})();
