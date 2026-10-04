(function () {
  var root = document.documentElement;
  var header = document.querySelector(".site-header");
  var nav = document.getElementById("site-nav");
  var menuToggle = document.querySelector(".menu-toggle");
  var langSwitch = document.getElementById("lang-switch");
  var themeBtn = document.querySelector(".theme-toggle");
  var year = document.getElementById("year");
  var themeMeta = document.querySelector('meta[name="theme-color"]');
  var descMeta = document.querySelector('meta[name="description"]');
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function writeStore(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (error) {}
  }

  function menuLabel(open) {
    if (root.lang === "ar") return open ? "إغلاق القائمة" : "القائمة";
    return open ? "Close menu" : "Menu";
  }

  function updateMenuLabel() {
    if (!menuToggle) return;
    var open = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-label", menuLabel(open));
  }

  function updateThemeLabel() {
    if (!themeBtn) return;
    var dark = root.dataset.theme === "dark";
    var label = root.lang === "ar"
      ? (dark ? "التبديل إلى المظهر الفاتح" : "التبديل إلى المظهر الداكن")
      : (dark ? "Switch to light theme" : "Switch to dark theme");
    themeBtn.setAttribute("aria-label", label);
    themeBtn.setAttribute("aria-pressed", dark ? "true" : "false");
  }

  function applyLanguage(lang) {
    if (lang !== "ar" && lang !== "en") lang = "en";
    root.lang = lang;
    root.dir = lang === "ar" ? "rtl" : "ltr";
    document.title = lang === "ar"
      ? "محمد كيالي — مهندس تكنولوجيا أغذية"
      : "Mohammad Kayali — Food Technology Engineer";
    if (descMeta) {
      descMeta.setAttribute(
        "content",
        lang === "ar"
          ? "مهندس تكنولوجيا أغذية ومشرف مخبر أكاديمي. تحاليل ميكروبيولوجية وضبط جودة الأغذية."
          : "Food Technology Engineer and academic laboratory supervisor. Microbiological analysis and food quality control."
      );
    }
    if (langSwitch) {
      langSwitch.setAttribute("aria-label", lang === "ar" ? "اللغة" : "Language");
    }
    document.querySelectorAll("[data-set-lang]").forEach(function (button) {
      button.setAttribute("aria-pressed", button.getAttribute("data-set-lang") === lang ? "true" : "false");
    });
    if (nav) nav.setAttribute("aria-label", lang === "ar" ? "أقسام الصفحة" : "Sections");
    updateMenuLabel();
    updateThemeLabel();
    writeStore("mk-lang", lang);
  }

  function applyTheme(theme) {
    theme = theme === "light" ? "light" : "dark";
    root.dataset.theme = theme;
    if (themeMeta) themeMeta.setAttribute("content", theme === "dark" ? "#1C1612" : "#FBF6EE");
    updateThemeLabel();
    writeStore("mk-theme", theme);
  }

  function closeMenu() {
    if (!header || !menuToggle) return;
    header.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
    updateMenuLabel();
  }

  if (year) year.textContent = String(new Date().getFullYear());

  applyLanguage(root.lang === "ar" ? "ar" : "en");
  applyTheme(root.dataset.theme === "light" ? "light" : "dark");

  document.querySelectorAll("[data-set-lang]").forEach(function (button) {
    button.addEventListener("click", function () {
      applyLanguage(button.getAttribute("data-set-lang"));
    });
  });

  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      applyTheme(root.dataset.theme === "dark" ? "light" : "dark");
    });
  }

  if (menuToggle) {
    menuToggle.addEventListener("click", function (event) {
      event.stopPropagation();
      var open = menuToggle.getAttribute("aria-expanded") === "true";
      if (open) {
        closeMenu();
        return;
      }
      header.classList.add("is-open");
      menuToggle.setAttribute("aria-expanded", "true");
      updateMenuLabel();
    });
  }

  document.addEventListener("click", function (event) {
    if (!header || !header.classList.contains("is-open")) return;
    if (!header.contains(event.target)) closeMenu();
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") closeMenu();
  });

  window.addEventListener("resize", function () {
    if (window.innerWidth > 800) closeMenu();
  });

  if (nav) {
    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });
  }

  var sections = Array.prototype.slice.call(document.querySelectorAll("main section[id]"));
  var navLinks = nav ? Array.prototype.slice.call(nav.querySelectorAll("a[href^='#']")) : [];

  function setCurrent(id) {
    navLinks.forEach(function (link) {
      if (link.getAttribute("href") === "#" + id) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    });
  }

  if ("IntersectionObserver" in window && sections.length) {
    var spy = new IntersectionObserver(function (entries) {
      var best = null;
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        if (!best || entry.intersectionRatio > best.intersectionRatio) best = entry;
      });
      if (best) setCurrent(best.target.id);
    }, {
      rootMargin: "-28% 0px -55% 0px",
      threshold: [0.1, 0.25, 0.5, 0.75]
    });
    sections.forEach(function (section) {
      spy.observe(section);
    });
  }

  var motionNodes = Array.prototype.slice.call(document.querySelectorAll(".reveal, .stagger, .process-wrap"));

  function showMotion(node) {
    node.classList.add(node.classList.contains("process-wrap") ? "is-drawn" : "is-visible");
  }

  function inView(node) {
    var rect = node.getBoundingClientRect();
    return rect.top < window.innerHeight * 0.92 && rect.bottom > 40;
  }

  if (reduceMotion || !("IntersectionObserver" in window)) {
    motionNodes.forEach(showMotion);
  } else {
    var motion = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        showMotion(entry.target);
        observer.unobserve(entry.target);
      });
    }, {
      threshold: 0.18,
      rootMargin: "0px 0px -6% 0px"
    });

    motionNodes.forEach(function (node) {
      if (inView(node)) showMotion(node);
      else motion.observe(node);
    });
  }

  root.classList.add("js");

  var bench = document.querySelector(".bench");
  var sample = document.querySelector(".sample");
  var hero = document.getElementById("hero");

  function placeBench() {
    if (!bench || !hero) return;
    bench.style.top = hero.offsetHeight + "px";
  }

  function placeSample() {
    if (!sample || !bench || reduceMotion) return;
    var trackTop = bench.getBoundingClientRect().top + 24;
    var trackHeight = bench.getBoundingClientRect().height - 48;
    if (trackHeight <= 0) return;
    var mark = window.innerHeight * 0.46;
    var next = (mark - trackTop) / trackHeight;
    if (next < 0) next = 0;
    if (next > 1) next = 1;
    sample.style.top = (next * 100) + "%";
  }

  placeBench();
  if (reduceMotion && sample) sample.style.top = "12%";
  else {
    placeSample();
    window.addEventListener("scroll", placeSample, { passive: true });
    window.addEventListener("resize", function () {
      placeBench();
      placeSample();
    });
  }
})();
