
(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    bindMobileMenu();
    bindMissingImages();
    bindHeroSlider();
    bindLocalSearch();
    bindMoviePlayer();
  });

  function bindMobileMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-mobile-menu]');

    if (!toggle || !menu) {
      return;
    }

    toggle.addEventListener('click', function () {
      menu.classList.toggle('open');
    });
  }

  function bindMissingImages() {
    var images = document.querySelectorAll('img[data-fallback]');

    images.forEach(function (image) {
      image.addEventListener('error', function () {
        image.classList.add('is-missing');
        image.removeAttribute('src');
      }, { once: true });
    });
  }

  function bindHeroSlider() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));

    if (slides.length <= 1) {
      return;
    }

    var activeIndex = 0;

    function activate(index) {
      activeIndex = index;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === activeIndex);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === activeIndex);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        activate(index);
      });
    });

    window.setInterval(function () {
      activate((activeIndex + 1) % slides.length);
    }, 5200);
  }

  function bindLocalSearch() {
    var input = document.querySelector('[data-search-input]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-search-card]'));
    var empty = document.querySelector('[data-search-empty]');

    if (!input || cards.length === 0) {
      return;
    }

    input.addEventListener('input', function () {
      var query = input.value.trim().toLowerCase();
      var matched = 0;

      cards.forEach(function (card) {
        var haystack = (card.getAttribute('data-search-card') || '').toLowerCase();
        var show = query === '' || haystack.indexOf(query) !== -1;

        card.style.display = show ? '' : 'none';

        if (show) {
          matched += 1;
        }
      });

      if (empty) {
        empty.style.display = matched === 0 ? 'block' : 'none';
      }
    });
  }

  function bindMoviePlayer() {
    var playerBox = document.querySelector('[data-player]');

    if (!playerBox) {
      return;
    }

    var video = playerBox.querySelector('video');
    var cover = playerBox.querySelector('[data-play-cover]');
    var status = document.querySelector('[data-player-status]');
    var source = playerBox.getAttribute('data-video-src');

    if (!video || !cover || !source) {
      return;
    }

    cover.addEventListener('click', function () {
      cover.classList.add('hidden');
      startPlayback(video, source, status);
    });
  }

  function startPlayback(video, source, status) {
    if (status) {
      status.textContent = '正在加载播放源，请稍候。';
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      video.play().catch(function () {
        showPlayError(status);
      });
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });

      hls.loadSource(source);
      hls.attachMedia(video);

      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        video.play().catch(function () {
          showPlayError(status);
        });
      });

      hls.on(window.Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          showPlayError(status);
        }
      });
      return;
    }

    video.src = source;
    video.play().catch(function () {
      showPlayError(status);
    });
  }

  function showPlayError(status) {
    if (status) {
      status.textContent = '当前浏览器暂未完成播放初始化，可刷新后重试或换用支持 HLS 的浏览器。';
    }
  }
}());
