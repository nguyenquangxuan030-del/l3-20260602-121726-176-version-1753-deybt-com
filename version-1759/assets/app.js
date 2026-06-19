(function () {
    const menuToggle = document.querySelector(".menu-toggle");
    const mainNav = document.querySelector(".main-nav");

    if (menuToggle && mainNav) {
        menuToggle.addEventListener("click", function () {
            mainNav.classList.toggle("open");
        });
    }

    const slides = Array.from(document.querySelectorAll(".hero-slide"));
    const dots = Array.from(document.querySelectorAll(".hero-dot"));
    const next = document.querySelector(".hero-next");
    const prev = document.querySelector(".hero-prev");
    let current = 0;
    let timer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle("active", slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle("active", dotIndex === current);
        });
    }

    function startTimer() {
        if (!slides.length) {
            return;
        }

        clearInterval(timer);
        timer = setInterval(function () {
            showSlide(current + 1);
        }, 5000);
    }

    dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
            showSlide(Number(dot.getAttribute("data-slide")) || 0);
            startTimer();
        });
    });

    if (next) {
        next.addEventListener("click", function () {
            showSlide(current + 1);
            startTimer();
        });
    }

    if (prev) {
        prev.addEventListener("click", function () {
            showSlide(current - 1);
            startTimer();
        });
    }

    startTimer();

    const searchInput = document.getElementById("siteSearch");
    const yearFilter = document.getElementById("yearFilter");
    const typeFilter = document.getElementById("typeFilter");
    const cards = Array.from(document.querySelectorAll(".search-card"));
    const emptyResult = document.querySelector(".empty-result");

    function matchesYear(card, value) {
        if (!value) {
            return true;
        }

        const year = Number(card.getAttribute("data-year") || "0");
        if (value === "2020") {
            return year <= 2020;
        }
        return String(year) === value;
    }

    function filterCards() {
        if (!cards.length) {
            return;
        }

        const keyword = searchInput ? searchInput.value.trim().toLowerCase() : "";
        const year = yearFilter ? yearFilter.value : "";
        const type = typeFilter ? typeFilter.value : "";
        let visible = 0;

        cards.forEach(function (card) {
            const searchable = [
                card.getAttribute("data-title"),
                card.getAttribute("data-region"),
                card.getAttribute("data-type"),
                card.getAttribute("data-tags")
            ].join(" ").toLowerCase();

            const okKeyword = !keyword || searchable.includes(keyword);
            const okYear = matchesYear(card, year);
            const okType = !type || (card.getAttribute("data-type") || "").includes(type);
            const shouldShow = okKeyword && okYear && okType;
            card.style.display = shouldShow ? "" : "none";
            if (shouldShow) {
                visible += 1;
            }
        });

        if (emptyResult) {
            emptyResult.style.display = visible ? "none" : "block";
        }
    }

    [searchInput, yearFilter, typeFilter].forEach(function (field) {
        if (field) {
            field.addEventListener("input", filterCards);
            field.addEventListener("change", filterCards);
        }
    });
})();
