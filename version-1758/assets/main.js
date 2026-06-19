(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(text) {
    return String(text || "").trim().toLowerCase();
  }

  function initMenu() {
    var toggle = $("[data-menu-toggle]");
    var panel = $("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function initHero() {
    var hero = $("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = $all(".hero-slide", hero);
    var dots = $all(".hero-dots button", hero);
    var prev = $("[data-hero-prev]", hero);
    var next = $("[data-hero-next]", hero);
    var active = 0;
    var timer;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, idx) {
        slide.classList.toggle("is-active", idx === active);
      });
      dots.forEach(function (dot, idx) {
        dot.classList.toggle("is-active", idx === active);
      });
    }

    function start() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5000);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(active - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(active + 1);
        start();
      });
    }
    dots.forEach(function (dot, idx) {
      dot.addEventListener("click", function () {
        show(idx);
        start();
      });
    });
    show(0);
    start();
  }

  function initCardFilter() {
    var input = $("[data-card-filter]");
    var select = $("[data-filter-year]");
    var cards = $all("[data-card]");
    if (!cards.length || (!input && !select)) {
      return;
    }

    function apply() {
      var keyword = input ? normalize(input.value) : "";
      var year = select ? normalize(select.value) : "";
      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-tags"),
          card.getAttribute("data-region"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-year")
        ].join(" "));
        var cardYear = normalize(card.getAttribute("data-year"));
        var matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchedYear = !year || cardYear === year;
        card.classList.toggle("is-hidden", !(matchedKeyword && matchedYear));
      });
    }

    if (input) {
      input.addEventListener("input", apply);
    }
    if (select) {
      select.addEventListener("change", apply);
    }
    apply();
  }

  function getQuery() {
    var params = new URLSearchParams(window.location.search);
    return params.get("q") || "";
  }

  function movieCard(movie) {
    return [
      '<a class="movie-card" href="' + movie.url + '">',
      '<div class="poster-wrap">',
      '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '<span class="corner-label">' + escapeHtml(movie.category) + '</span>',
      '</div>',
      '<div class="movie-card-body">',
      '<h3>' + escapeHtml(movie.title) + '</h3>',
      '<p>' + escapeHtml(movie.oneLine) + '</p>',
      '<div class="movie-meta">',
      '<span>' + escapeHtml(movie.year) + '</span>',
      '<span>' + escapeHtml(movie.region) + '</span>',
      '<span>' + escapeHtml(movie.rating) + '分</span>',
      '</div>',
      '</div>',
      '</a>'
    ].join("");
  }

  function escapeHtml(text) {
    return String(text || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function initSearchPage() {
    var mount = $("[data-search-results]");
    var input = $("[data-search-input]");
    if (!mount || !window.__movies) {
      return;
    }
    var initial = getQuery();
    if (input) {
      input.value = initial;
    }

    function render() {
      var keyword = normalize(input ? input.value : initial);
      var results = window.__movies.filter(function (movie) {
        var haystack = normalize([
          movie.title,
          movie.oneLine,
          movie.region,
          movie.genre,
          movie.tags,
          movie.year,
          movie.category
        ].join(" "));
        return !keyword || haystack.indexOf(keyword) !== -1;
      }).slice(0, 200);
      if (!results.length) {
        mount.className = "empty-state";
        mount.innerHTML = "没有找到匹配内容。";
        return;
      }
      mount.className = "search-results";
      mount.innerHTML = results.map(movieCard).join("");
    }

    if (input) {
      input.addEventListener("input", render);
    }
    render();
  }

  window.initVideoPlayer = function (videoId, coverId, src) {
    var video = document.getElementById(videoId);
    var cover = document.getElementById(coverId);
    var hls;
    var ready = false;

    if (!video || !cover || !src) {
      return;
    }

    function prepare() {
      if (ready) {
        return;
      }
      ready = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(src);
        hls.attachMedia(video);
      } else {
        video.src = src;
      }
      video.controls = true;
    }

    function play() {
      prepare();
      cover.classList.add("is-hidden");
      var attempt = video.play();
      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(function () {});
      }
    }

    cover.addEventListener("click", play);
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });
    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  };

  document.addEventListener("DOMContentLoaded", function () {
    initMenu();
    initHero();
    initCardFilter();
    initSearchPage();
  });
})();
