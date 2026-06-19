(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobileNav = document.querySelector('.mobile-nav');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      var isOpen = mobileNav.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', String(isOpen));
      menuButton.textContent = isOpen ? '×' : '☰';
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var current = 0;
    var timer = null;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function startHero() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        showSlide(current + 1);
      }, 4800);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
        startHero();
      });
    });

    if (slides.length > 1) {
      showSlide(0);
      startHero();
    }
  }

  var filterArea = document.querySelector('[data-filter-area]');

  if (filterArea) {
    var keywordInput = filterArea.querySelector('[data-filter-input]');
    var regionSelect = filterArea.querySelector('[data-filter-region]');
    var yearSelect = filterArea.querySelector('[data-filter-year]');
    var cards = Array.prototype.slice.call(filterArea.querySelectorAll('.movie-card'));
    var empty = filterArea.querySelector('.filter-empty');
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';

    if (keywordInput && query) {
      keywordInput.value = query;
    }

    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }

    function runFilter() {
      var keyword = normalize(keywordInput ? keywordInput.value : '');
      var region = normalize(regionSelect ? regionSelect.value : '');
      var year = normalize(yearSelect ? yearSelect.value : '');
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.dataset.title,
          card.dataset.genre,
          card.dataset.tags,
          card.dataset.region,
          card.dataset.year
        ].join(' '));
        var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchRegion = !region || normalize(card.dataset.region).indexOf(region) !== -1;
        var matchYear = !year || normalize(card.dataset.year).indexOf(year) !== -1;
        var shouldShow = matchKeyword && matchRegion && matchYear;
        card.style.display = shouldShow ? '' : 'none';
        if (shouldShow) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    [keywordInput, regionSelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', runFilter);
        control.addEventListener('change', runFilter);
      }
    });

    var tagLinks = document.querySelectorAll('[data-search-tag]');
    tagLinks.forEach(function (tag) {
      tag.addEventListener('click', function (event) {
        event.preventDefault();
        if (keywordInput) {
          keywordInput.value = tag.textContent.trim();
          runFilter();
          keywordInput.focus();
        }
      });
    });

    runFilter();
  }

  var players = document.querySelectorAll('[data-player]');

  players.forEach(function (player) {
    var video = player.querySelector('video');
    var cover = player.querySelector('.player-cover');
    var src = player.getAttribute('data-video');
    var hlsInstance = null;

    function attachSource() {
      if (!video || !src || video.dataset.ready === '1') {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true });
        hlsInstance.loadSource(src);
        hlsInstance.attachMedia(video);
      } else {
        video.src = src;
      }

      video.dataset.ready = '1';
    }

    function beginPlayback() {
      if (!video) {
        return;
      }
      attachSource();
      video.controls = true;
      if (cover) {
        cover.classList.add('is-hidden');
      }
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    }

    if (cover) {
      cover.addEventListener('click', beginPlayback);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.dataset.ready !== '1') {
          beginPlayback();
        }
      });
      video.addEventListener('ended', function () {
        if (hlsInstance && typeof hlsInstance.stopLoad === 'function') {
          hlsInstance.stopLoad();
        }
      });
    }
  });
})();
