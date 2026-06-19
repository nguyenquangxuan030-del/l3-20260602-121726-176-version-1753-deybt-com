(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobileNav = document.querySelector('.mobile-nav');
  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      var open = mobileNav.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', String(open));
    });
  }
  document.querySelectorAll('img').forEach(function (img) {
    img.addEventListener('error', function () {
      img.classList.add('image-error');
    });
  });
  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) { slide.classList.toggle('active', i === current); });
      dots.forEach(function (dot, i) { dot.classList.toggle('active', i === current); });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () { show(Number(dot.getAttribute('data-hero-dot')) || 0); });
    });
    if (slides.length > 1) {
      setInterval(function () { show(current + 1); }, 5200);
    }
  }
  var input = document.querySelector('[data-filter-input]');
  var list = document.querySelector('[data-filter-list]');
  var cards = list ? Array.prototype.slice.call(list.querySelectorAll('.filter-card')) : [];
  var chips = Array.prototype.slice.call(document.querySelectorAll('[data-filter-value]'));
  var chipValue = '';
  function norm(value) { return String(value || '').trim().toLowerCase(); }
  function apply() {
    var q = norm(input ? input.value : '');
    var c = norm(chipValue);
    cards.forEach(function (card) {
      var text = norm(card.getAttribute('data-search'));
      card.classList.toggle('is-hidden', !((!q || text.indexOf(q) !== -1) && (!c || text.indexOf(c) !== -1)));
    });
  }
  if (input && cards.length) {
    var query = new URLSearchParams(window.location.search).get('q');
    if (query) { input.value = query; }
    input.addEventListener('input', apply);
    apply();
  }
  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      chips.forEach(function (item) { item.classList.remove('active'); });
      chip.classList.add('active');
      chipValue = chip.getAttribute('data-filter-value') || '';
      apply();
    });
  });
  function start(video, shell, source) {
    if (!video || !source) { return; }
    if (window.Hls && window.Hls.isSupported()) {
      if (video._hlsInstance) { video._hlsInstance.destroy(); }
      var hls = new window.Hls({ enableWorker: true });
      video._hlsInstance = hls;
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () { video.play().catch(function () {}); });
    } else {
      if (video.src !== source) { video.src = source; }
      video.play().catch(function () {});
    }
    shell.classList.add('playing');
  }
  document.querySelectorAll('.video-shell').forEach(function (shell) {
    var video = shell.querySelector('video[data-video-src]');
    var button = shell.querySelector('[data-play-target]');
    var source = video ? video.getAttribute('data-video-src') : '';
    if (button) { button.addEventListener('click', function () { start(video, shell, source); }); }
    if (video) {
      video.addEventListener('click', function () { if (video.paused) { start(video, shell, source); } });
      video.addEventListener('play', function () { shell.classList.add('playing'); });
    }
  });
})();
