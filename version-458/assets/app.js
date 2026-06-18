document.addEventListener("DOMContentLoaded", function () {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (toggle && panel) {
        toggle.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var next = hero.querySelector("[data-hero-next]");
        var prev = hero.querySelector("[data-hero-prev]");
        var current = 0;
        var show = function (index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === current);
            });
        };
        if (slides.length > 1) {
            dots.forEach(function (dot, i) {
                dot.addEventListener("click", function () {
                    show(i);
                });
            });
            if (next) {
                next.addEventListener("click", function () {
                    show(current + 1);
                });
            }
            if (prev) {
                prev.addEventListener("click", function () {
                    show(current - 1);
                });
            }
            setInterval(function () {
                show(current + 1);
            }, 5200);
        }
    }

    var keywordInput = document.querySelector("[data-filter-keyword]");
    var yearSelect = document.querySelector("[data-filter-year]");
    var regionSelect = document.querySelector("[data-filter-region]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
    var empty = document.querySelector("[data-filter-empty]");
    var filterCards = function () {
        if (!cards.length || !keywordInput) {
            return;
        }
        var kw = keywordInput.value.trim().toLowerCase();
        var year = yearSelect ? yearSelect.value : "";
        var region = regionSelect ? regionSelect.value : "";
        var visible = 0;
        cards.forEach(function (card) {
            var text = [card.dataset.title, card.dataset.region, card.dataset.year, card.dataset.genre].join(" ").toLowerCase();
            var matched = (!kw || text.indexOf(kw) !== -1) && (!year || card.dataset.year === year) && (!region || card.dataset.region === region);
            card.style.display = matched ? "" : "none";
            if (matched) {
                visible += 1;
            }
        });
        if (empty) {
            empty.classList.toggle("is-visible", visible === 0);
        }
    };
    if (keywordInput) {
        [keywordInput, yearSelect, regionSelect].forEach(function (el) {
            if (el) {
                el.addEventListener("input", filterCards);
                el.addEventListener("change", filterCards);
            }
        });
    }

    var searchResults = document.querySelector("[data-search-results]");
    if (searchResults && Array.isArray(window.siteSearchData)) {
        var params = new URLSearchParams(window.location.search);
        var q = (params.get("q") || "").trim();
        var input = document.querySelector("[data-search-page-input]");
        var heading = document.querySelector("[data-search-title]");
        if (input) {
            input.value = q;
        }
        var data = window.siteSearchData;
        var result = q ? data.filter(function (item) {
            var text = [item.title, item.region, item.year, item.genre, item.category, item.summary].join(" ").toLowerCase();
            return text.indexOf(q.toLowerCase()) !== -1;
        }).slice(0, 96) : data.slice(0, 24);
        if (heading) {
            heading.textContent = q ? "“" + q + "”相关内容" : "推荐内容";
        }
        if (!result.length) {
            searchResults.innerHTML = '<div class="empty-state is-visible">没有找到匹配内容，请更换关键词。</div>';
        } else {
            searchResults.innerHTML = result.map(function (item) {
                return '<article class="movie-card" data-movie-card>' +
                    '<a class="movie-cover" href="' + item.url + '">' +
                    '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
                    '<span class="cover-tag">' + escapeHtml(item.category) + '</span>' +
                    '</a>' +
                    '<div class="movie-info">' +
                    '<h3><a href="' + item.url + '">' + escapeHtml(item.title) + '</a></h3>' +
                    '<p>' + escapeHtml(item.summary) + '</p>' +
                    '<div class="meta-row"><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.genre) + '</span></div>' +
                    '</div>' +
                    '</article>';
            }).join("");
        }
    }

    var video = document.querySelector("[data-player]");
    var overlay = document.querySelector("[data-play-overlay]");
    if (video) {
        var mediaUrl = video.getAttribute("data-video-url");
        var started = false;
        var start = function () {
            if (!mediaUrl) {
                return;
            }
            if (!started) {
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = mediaUrl;
                } else if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({ enableWorker: true });
                    hls.loadSource(mediaUrl);
                    hls.attachMedia(video);
                } else {
                    video.src = mediaUrl;
                }
                started = true;
            }
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {});
            }
        };
        if (overlay) {
            overlay.addEventListener("click", start);
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                start();
            }
        });
    }
});

function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, function (char) {
        return {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            "'": "&#39;",
            "\"": "&quot;"
        }[char];
    });
}
