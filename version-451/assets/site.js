(function () {
    var navToggle = document.querySelector('.nav-toggle');
    var mainNav = document.querySelector('.main-nav');
    if (navToggle && mainNav) {
        navToggle.addEventListener('click', function () {
            mainNav.classList.toggle('open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dots button'));
    if (slides.length > 1 && dots.length === slides.length) {
        var activeIndex = 0;
        var showSlide = function (index) {
            activeIndex = index;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === index);
            });
        };
        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
            });
        });
        setInterval(function () {
            showSlide((activeIndex + 1) % slides.length);
        }, 5200);
    }

    var player = document.querySelector('[data-player]');
    if (player && typeof CURRENT_VIDEO !== 'undefined' && CURRENT_VIDEO.stream) {
        var video = player.querySelector('video');
        var overlay = player.querySelector('.player-overlay');
        var errorBox = player.querySelector('.video-error');
        var hlsInstance = null;
        var started = false;

        var showError = function () {
            if (errorBox) {
                errorBox.classList.add('visible');
            }
        };

        var startVideo = function () {
            if (!video) {
                return;
            }
            if (overlay) {
                overlay.classList.add('hidden');
            }
            video.controls = true;
            if (!started) {
                started = true;
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = CURRENT_VIDEO.stream;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(CURRENT_VIDEO.stream);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
                        if (data && data.fatal) {
                            showError();
                        }
                    });
                } else {
                    showError();
                    return;
                }
            }
            var playAction = video.play();
            if (playAction && typeof playAction.catch === 'function') {
                playAction.catch(function () {
                    showError();
                });
            }
        };

        if (overlay) {
            overlay.addEventListener('click', startVideo);
        }
        video.addEventListener('click', function () {
            if (video.paused) {
                startVideo();
            } else {
                video.pause();
            }
        });
    }

    var searchInput = document.querySelector('#movie-search-input');
    var categorySelect = document.querySelector('#movie-category-select');
    var searchResults = document.querySelector('#search-results');
    var searchStatus = document.querySelector('#search-status');
    if (searchInput && categorySelect && searchResults && window.SEARCH_MOVIES) {
        var renderResults = function () {
            var keyword = searchInput.value.trim().toLowerCase();
            var category = categorySelect.value;
            var matched = window.SEARCH_MOVIES.filter(function (movie) {
                var haystack = [movie.title, movie.oneLine, movie.region, movie.type, movie.year, movie.genre, movie.tags].join(' ').toLowerCase();
                var keywordMatch = !keyword || haystack.indexOf(keyword) !== -1;
                var categoryMatch = !category || movie.category === category;
                return keywordMatch && categoryMatch;
            }).slice(0, 120);
            searchResults.innerHTML = matched.map(function (movie) {
                return '<article class="movie-card">' +
                    '<a class="poster-wrap" href="movies/' + movie.file + '" title="' + escapeHtml(movie.title) + '">' +
                    '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
                    '<span class="poster-shade"></span>' +
                    '<span class="score-badge">' + movie.score + '</span>' +
                    '</a>' +
                    '<div class="card-body">' +
                    '<div class="card-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>' +
                    '<h3><a href="movies/' + movie.file + '">' + escapeHtml(movie.title) + '</a></h3>' +
                    '<p>' + escapeHtml(movie.oneLine) + '</p>' +
                    '<div class="tag-row"><span>' + escapeHtml(movie.category) + '</span></div>' +
                    '</div>' +
                    '</article>';
            }).join('');
            if (searchStatus) {
                searchStatus.textContent = matched.length ? '已匹配到相关影片，点击卡片进入详情播放。' : '没有找到相关影片，可以调整关键词或分类。';
            }
        };
        var escapeHtml = function (value) {
            return String(value || '').replace(/[&<>"']/g, function (char) {
                return {
                    '&': '&amp;',
                    '<': '&lt;',
                    '>': '&gt;',
                    '"': '&quot;',
                    "'": '&#39;'
                }[char];
            });
        };
        searchInput.addEventListener('input', renderResults);
        categorySelect.addEventListener('change', renderResults);
        renderResults();
    }
})();
