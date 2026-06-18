(function () {
    function setupMenu() {
        var button = document.querySelector(".menu-toggle");
        var nav = document.getElementById("mobileNav");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            var open = nav.classList.toggle("is-open");
            button.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    function setupHero() {
        var hero = document.querySelector(".hero");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dots button"));
        var prev = hero.querySelector(".hero-prev");
        var next = hero.querySelector(".hero-next");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function start() {
            clearInterval(timer);
            timer = setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
                start();
            });
        });
        show(0);
        start();
    }

    function setupFilters() {
        var panels = Array.prototype.slice.call(document.querySelectorAll(".movie-filter"));
        panels.forEach(function (panel) {
            var targetId = panel.getAttribute("data-target");
            var grid = document.getElementById(targetId);
            if (!grid) {
                return;
            }
            var keyword = panel.querySelector('[data-role="keyword"]');
            var year = panel.querySelector('[data-role="year"]');
            var region = panel.querySelector('[data-role="region"]');
            var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card, .wide-card"));
            var empty = document.querySelector('[data-empty-for="' + targetId + '"]');

            function valueOf(input) {
                return input ? input.value.trim().toLowerCase() : "";
            }

            function apply() {
                var key = valueOf(keyword);
                var selectedYear = valueOf(year);
                var selectedRegion = valueOf(region);
                var visible = 0;
                cards.forEach(function (card) {
                    var searchText = [
                        card.getAttribute("data-title"),
                        card.getAttribute("data-genre"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-tags"),
                        card.getAttribute("data-year")
                    ].join(" ").toLowerCase();
                    var matchesKey = !key || searchText.indexOf(key) !== -1;
                    var matchesYear = !selectedYear || card.getAttribute("data-year") === selectedYear;
                    var matchesRegion = !selectedRegion || card.getAttribute("data-region") === selectedRegion;
                    var matches = matchesKey && matchesYear && matchesRegion;
                    card.style.display = matches ? "" : "none";
                    if (matches) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            }

            [keyword, year, region].forEach(function (input) {
                if (input) {
                    input.addEventListener("input", apply);
                    input.addEventListener("change", apply);
                }
            });
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        setupMenu();
        setupHero();
        setupFilters();
    });
})();
