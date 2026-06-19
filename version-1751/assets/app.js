(function () {
    var menuButton = document.querySelector('.menu-toggle');
    var nav = document.getElementById('mainNav');

    if (menuButton && nav) {
        menuButton.addEventListener('click', function () {
            var isOpen = nav.classList.toggle('is-open');
            menuButton.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function showSlide(nextIndex) {
            if (!slides.length) {
                return;
            }

            index = (nextIndex + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function startTimer() {
            clearInterval(timer);
            timer = setInterval(function () {
                showSlide(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
                startTimer();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(index - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(index + 1);
                startTimer();
            });
        }

        startTimer();
    }

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function filterCards(input, grid) {
        if (!input || !grid) {
            return;
        }

        var query = normalize(input.value);
        var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));

        cards.forEach(function (card) {
            var haystack = normalize(card.getAttribute('data-search'));
            var matched = !query || haystack.indexOf(query) !== -1;
            card.classList.toggle('is-hidden', !matched);
        });
    }

    var searchInput = document.querySelector('[data-search-input]');
    var searchGrid = document.querySelector('[data-search-grid]');

    if (searchInput && searchGrid) {
        var params = new URLSearchParams(window.location.search);
        var initial = params.get('q') || '';
        searchInput.value = initial;
        filterCards(searchInput, searchGrid);
        searchInput.addEventListener('input', function () {
            filterCards(searchInput, searchGrid);
        });
    }

    var localInput = document.querySelector('[data-local-search]');
    var localGrid = document.querySelector('[data-catalog-grid]');

    if (localInput && localGrid) {
        localInput.addEventListener('input', function () {
            filterCards(localInput, localGrid);
        });
    }

    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

    players.forEach(function (player) {
        var video = player.querySelector('video[data-hls]');
        var button = player.querySelector('[data-play-button]');
        var started = false;
        var hlsInstance = null;

        function bindSource() {
            if (!video || started) {
                return;
            }

            var src = video.getAttribute('data-src');
            started = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = src;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls();
                hlsInstance.loadSource(src);
                hlsInstance.attachMedia(video);
            } else {
                video.src = src;
            }
        }

        function playVideo() {
            bindSource();

            if (button) {
                button.classList.add('is-hidden');
            }

            var result = video.play();

            if (result && typeof result.catch === 'function') {
                result.catch(function () {
                    if (button) {
                        button.classList.remove('is-hidden');
                    }
                });
            }
        }

        if (button && video) {
            button.addEventListener('click', function (event) {
                event.preventDefault();
                playVideo();
            });
        }

        if (video) {
            video.addEventListener('play', function () {
                if (button) {
                    button.classList.add('is-hidden');
                }
            });

            video.addEventListener('pause', function () {
                if (!video.ended && button) {
                    button.classList.remove('is-hidden');
                }
            });

            video.addEventListener('ended', function () {
                if (button) {
                    button.classList.remove('is-hidden');
                }

                if (hlsInstance && typeof hlsInstance.destroy === 'function') {
                    hlsInstance.destroy();
                    hlsInstance = null;
                    started = false;
                }
            });
        }
    });
})();
