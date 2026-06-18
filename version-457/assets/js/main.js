(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    function normalize(value) {
        return (value || "").toString().toLowerCase().trim();
    }

    ready(function () {
        document.querySelectorAll("img").forEach(function (img) {
            img.addEventListener("error", function () {
                img.classList.add("image-empty");
            }, { once: true });
        });

        var toggle = document.querySelector("[data-menu-toggle]");
        var menu = document.querySelector("[data-mobile-menu]");
        if (toggle && menu) {
            toggle.addEventListener("click", function () {
                menu.classList.toggle("is-open");
            });
        }

        document.querySelectorAll("[data-search-form]").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                var input = form.querySelector("input[name='q']");
                var value = input ? input.value.trim() : "";
                if (value) {
                    event.preventDefault();
                    window.location.href = "search.html?q=" + encodeURIComponent(value);
                }
            });
        });

        initHero();
        initFilters();
        initPlayers();
    });

    function initHero() {
        var slider = document.querySelector("[data-hero-slider]");
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === index);
            });
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
                restart();
            });
        });

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5600);
        }

        slider.addEventListener("mouseenter", function () {
            if (timer) {
                window.clearInterval(timer);
            }
        });
        slider.addEventListener("mouseleave", restart);
        show(0);
        restart();
    }

    function initFilters() {
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q") || "";
        document.querySelectorAll("[data-filter-panel]").forEach(function (panel) {
            var scope = document.querySelector(panel.getAttribute("data-filter-panel"));
            if (!scope) {
                return;
            }
            var input = panel.querySelector("[data-filter-keyword]");
            var type = panel.querySelector("[data-filter-type]");
            var year = panel.querySelector("[data-filter-year]");
            var empty = document.querySelector(panel.getAttribute("data-empty-target") || "");

            if (input && query) {
                input.value = query;
            }

            function apply() {
                var keyword = normalize(input ? input.value : "");
                var typeValue = normalize(type ? type.value : "");
                var yearValue = normalize(year ? year.value : "");
                var visible = 0;
                scope.querySelectorAll("[data-movie-card]").forEach(function (card) {
                    var haystack = normalize([
                        card.getAttribute("data-title"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-type"),
                        card.getAttribute("data-tags")
                    ].join(" "));
                    var matched = true;
                    if (keyword && haystack.indexOf(keyword) === -1) {
                        matched = false;
                    }
                    if (typeValue && normalize(card.getAttribute("data-type")) !== typeValue) {
                        matched = false;
                    }
                    if (yearValue && normalize(card.getAttribute("data-year")) !== yearValue) {
                        matched = false;
                    }
                    card.style.display = matched ? "" : "none";
                    if (matched) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.style.display = visible ? "none" : "block";
                }
            }

            [input, type, year].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });
            apply();
        });
    }

    function initPlayers() {
        document.querySelectorAll("[data-video-shell]").forEach(function (shell) {
            var video = shell.querySelector("video");
            var cover = shell.querySelector("[data-video-cover]");
            var message = shell.querySelector("[data-player-message]");
            if (!video) {
                return;
            }
            var stream = video.getAttribute("data-stream") || "";
            if (stream) {
                if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.ERROR, function (eventName, data) {
                        if (data && data.fatal && message) {
                            message.textContent = "播放暂时不可用，请稍后重试";
                            message.classList.add("show");
                        }
                    });
                } else {
                    video.src = stream;
                }
            }

            function play() {
                if (cover) {
                    cover.classList.add("is-hidden");
                }
                var promise = video.play();
                if (promise && promise.catch) {
                    promise.catch(function () {
                        if (message) {
                            message.textContent = "点击视频控制栏继续播放";
                            message.classList.add("show");
                        }
                    });
                }
            }

            if (cover) {
                cover.addEventListener("click", play);
            }
            video.addEventListener("click", function () {
                if (video.paused) {
                    play();
                } else {
                    video.pause();
                }
            });
            video.addEventListener("playing", function () {
                if (message) {
                    message.classList.remove("show");
                }
            });
        });
    }
}());
