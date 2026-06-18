(function () {
    var toggle = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (toggle && mobileNav) {
        toggle.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
        var active = 0;
        var timer;

        function showSlide(index) {
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === active);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === active);
            });
        }

        function restart() {
            clearInterval(timer);
            timer = setInterval(function () {
                showSlide(active + 1);
            }, 5200);
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
                restart();
            });
        });

        restart();
    }

    document.querySelectorAll('[data-search-area]').forEach(function (area) {
        var input = area.querySelector('[data-search-input]');
        var select = area.querySelector('[data-filter-select]');
        var container = area.parentElement.querySelector('[data-card-list]') || document.querySelector('[data-card-list]');

        if (!container || !input) {
            return;
        }

        var empty = document.createElement('div');
        empty.className = 'empty-state is-filtered-out';
        empty.textContent = '没有找到匹配内容';
        container.appendChild(empty);

        function applyFilter() {
            var keyword = input.value.trim().toLowerCase();
            var category = select ? select.value : '';
            var cards = Array.prototype.slice.call(container.querySelectorAll('.movie-card'));
            var visible = 0;

            cards.forEach(function (card) {
                var text = (card.getAttribute('data-filter-text') || '').toLowerCase();
                var cardCategory = card.getAttribute('data-category') || '';
                var okText = !keyword || text.indexOf(keyword) !== -1;
                var okCategory = !category || cardCategory === category;
                var show = okText && okCategory;
                card.classList.toggle('is-filtered-out', !show);
                if (show) {
                    visible += 1;
                }
            });

            empty.classList.toggle('is-filtered-out', visible !== 0);
        }

        input.addEventListener('input', applyFilter);
        if (select) {
            select.addEventListener('change', applyFilter);
        }
    });
}());
