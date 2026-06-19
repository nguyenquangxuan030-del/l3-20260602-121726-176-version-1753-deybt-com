(function () {
    function qs(selector, parent) {
        return (parent || document).querySelector(selector);
    }

    function qsa(selector, parent) {
        return Array.prototype.slice.call((parent || document).querySelectorAll(selector));
    }

    function initMobileMenu() {
        var button = qs('[data-menu-button]');
        var menu = qs('[data-mobile-menu]');
        if (!button || !menu) {
            return;
        }
        button.addEventListener('click', function () {
            menu.classList.toggle('is-open');
            button.classList.toggle('is-open');
        });
    }

    function initHero() {
        var slider = qs('[data-hero-slider]');
        if (!slider) {
            return;
        }
        var slides = qsa('[data-hero-slide]', slider);
        var dots = qsa('[data-hero-dot]', slider);
        var prev = qs('[data-hero-prev]', slider);
        var next = qs('[data-hero-next]', slider);
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
                start();
            });
        });
        slider.addEventListener('mouseenter', stop);
        slider.addEventListener('mouseleave', start);
        if (slides.length > 1) {
            start();
        }
    }

    function initFilters() {
        var panels = qsa('[data-filter-panel]');
        panels.forEach(function (panel) {
            var input = qs('[data-filter-input]', panel);
            var type = qs('[data-filter-type]', panel);
            var year = qs('[data-filter-year]', panel);
            var lists = qsa('[data-filter-list]');

            function value(el) {
                return el ? el.value.trim().toLowerCase() : '';
            }

            function apply() {
                var keyword = value(input);
                var typeValue = value(type);
                var yearValue = value(year);
                lists.forEach(function (list) {
                    qsa('[data-movie-card]', list).forEach(function (card) {
                        var haystack = (card.getAttribute('data-search') || '').toLowerCase();
                        var cardType = (card.getAttribute('data-type') || '').toLowerCase();
                        var cardYear = (card.getAttribute('data-year') || '').toLowerCase();
                        var matched = true;
                        if (keyword && haystack.indexOf(keyword) === -1) {
                            matched = false;
                        }
                        if (typeValue && cardType !== typeValue) {
                            matched = false;
                        }
                        if (yearValue && cardYear !== yearValue) {
                            matched = false;
                        }
                        card.classList.toggle('is-hidden', !matched);
                    });
                });
            }

            [input, type, year].forEach(function (el) {
                if (el) {
                    el.addEventListener('input', apply);
                    el.addEventListener('change', apply);
                }
            });

            var params = new URLSearchParams(window.location.search);
            var query = params.get('q');
            if (query && input) {
                input.value = query;
            }
            apply();
        });
    }

    function initPlayers() {
        qsa('[data-player]').forEach(function (player) {
            var video = qs('video', player);
            var button = qs('[data-play-button]', player);
            var source = player.getAttribute('data-src');
            var hls = null;
            var ready = false;

            function bindSource() {
                if (ready || !video || !source) {
                    return;
                }
                ready = true;
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true,
                        backBufferLength: 60
                    });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                } else {
                    video.src = source;
                }
            }

            function playVideo() {
                bindSource();
                player.classList.add('is-playing');
                var promise = video.play();
                if (promise && promise.catch) {
                    promise.catch(function () {
                        player.classList.remove('is-playing');
                    });
                }
            }

            if (button) {
                button.addEventListener('click', playVideo);
            }
            if (video) {
                video.addEventListener('click', function () {
                    if (video.paused) {
                        playVideo();
                    }
                });
                video.addEventListener('play', function () {
                    player.classList.add('is-playing');
                });
                video.addEventListener('ended', function () {
                    if (hls && hls.destroy) {
                        hls.destroy();
                        hls = null;
                        ready = false;
                    }
                });
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initMobileMenu();
        initHero();
        initFilters();
        initPlayers();
    });
})();
