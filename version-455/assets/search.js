(function () {
  var input = document.querySelector('[data-search-input]');
  var form = document.querySelector('[data-search-form]');
  var output = document.querySelector('[data-search-output]');
  var empty = document.querySelector('[data-search-empty]');
  var params = new URLSearchParams(window.location.search);
  var initial = params.get('q') || '';

  function createCard(item) {
    var tags = (item.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
    return [
      '<article class="movie-card">',
      '<a class="poster-link" href="' + item.url + '">',
      '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
      '<span class="poster-shine"></span>',
      '</a>',
      '<div class="card-body">',
      '<div class="card-meta"><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.type) + '</span></div>',
      '<h3><a href="' + item.url + '">' + escapeHtml(item.title) + '</a></h3>',
      '<p>' + escapeHtml(item.oneLine) + '</p>',
      '<div class="tag-row">' + tags + '</div>',
      '<div class="card-actions"><a href="' + item.url + '">立即观看</a><a href="' + item.categoryUrl + '">' + escapeHtml(item.category) + '</a></div>',
      '</div>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"]/g, function (char) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[char];
    });
  }

  function runSearch(keyword) {
    var q = keyword.trim().toLowerCase();
    var data = window.MOVIE_INDEX || [];
    var results = q ? data.filter(function (item) {
      var text = [item.title, item.year, item.region, item.type, item.genre, item.category, (item.tags || []).join(' '), item.oneLine].join(' ').toLowerCase();
      return text.indexOf(q) !== -1;
    }).slice(0, 120) : data.slice(0, 40);
    if (output) {
      output.innerHTML = '<div class="movie-grid">' + results.map(createCard).join('') + '</div>';
    }
    if (empty) {
      empty.hidden = results.length > 0;
    }
  }

  if (input) input.value = initial;
  runSearch(initial);

  if (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var value = input ? input.value : '';
      var url = new URL(window.location.href);
      if (value.trim()) url.searchParams.set('q', value.trim());
      else url.searchParams.delete('q');
      window.history.replaceState(null, '', url.toString());
      runSearch(value);
    });
  }
})();
