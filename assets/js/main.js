/* =================================================================
   GLONIX — 공통 인터랙션 (헤더/드로어/리빌/탭/아코디언/캐러셀)
   가능한 한 의존성 없는 바닐라 JS. 접근성·reduced-motion 고려.
   ================================================================= */
(function () {
  "use strict";
  var docEl = document.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Sticky header: 글래스 → 솔리드 전환 ---- */
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () {
      if (window.scrollY > 40) header.classList.add("is-solid");
      else header.classList.remove("is-solid");
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---- 모바일 드로어 ---- */
  var hamburger = document.querySelector(".hamburger");
  var drawer = document.querySelector(".drawer");
  function setDrawer(open) {
    document.body.classList.toggle("drawer-open", open);
    if (hamburger) hamburger.setAttribute("aria-expanded", String(open));
    if (drawer) drawer.setAttribute("aria-hidden", String(!open));
  }
  if (hamburger && drawer) {
    hamburger.addEventListener("click", function () {
      setDrawer(!document.body.classList.contains("drawer-open"));
    });
    drawer.addEventListener("click", function (e) {
      if (e.target.closest("a")) setDrawer(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setDrawer(false);
    });
  }

  /* ---- 스크롤 fade-up 리빌 ---- */
  var revealEls = document.querySelectorAll(".reveal");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.style.transitionDelay = (entry.target.dataset.delay || "0") + "ms";
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ---- 탭 (role=tab / role=tabpanel) ---- */
  document.querySelectorAll("[data-tabs]").forEach(function (group) {
    var tabs = Array.prototype.slice.call(group.querySelectorAll('[role="tab"]'));
    function select(tab) {
      tabs.forEach(function (t) {
        var selected = t === tab;
        t.setAttribute("aria-selected", String(selected));
        t.tabIndex = selected ? 0 : -1;
        var panel = document.getElementById(t.getAttribute("aria-controls"));
        if (panel) panel.hidden = !selected;
      });
    }
    tabs.forEach(function (tab, i) {
      tab.addEventListener("click", function () { select(tab); });
      tab.addEventListener("keydown", function (e) {
        var idx = null;
        if (e.key === "ArrowRight") idx = (i + 1) % tabs.length;
        if (e.key === "ArrowLeft") idx = (i - 1 + tabs.length) % tabs.length;
        if (idx !== null) { tabs[idx].focus(); select(tabs[idx]); e.preventDefault(); }
      });
    });
  });

  /* ---- 아코디언 ---- */
  document.querySelectorAll("[data-accordion]").forEach(function (acc) {
    acc.querySelectorAll(".accordion__btn").forEach(function (btn) {
      var panel = document.getElementById(btn.getAttribute("aria-controls"));
      btn.addEventListener("click", function () {
        var expanded = btn.getAttribute("aria-expanded") === "true";
        btn.setAttribute("aria-expanded", String(!expanded));
        if (!panel) return;
        if (expanded) {
          panel.style.height = panel.scrollHeight + "px";
          requestAnimationFrame(function () { panel.style.height = "0px"; });
        } else {
          panel.style.height = panel.scrollHeight + "px";
          var clear = function () { panel.style.height = "auto"; panel.removeEventListener("transitionend", clear); };
          panel.addEventListener("transitionend", clear);
        }
      });
    });
  });

  /* ---- 캐러셀 (scroll-snap + 버튼) ---- */
  document.querySelectorAll("[data-carousel]").forEach(function (car) {
    var track = car.querySelector(".carousel__track");
    var prev = car.querySelector("[data-car-prev]");
    var next = car.querySelector("[data-car-next]");
    if (!track) return;
    function step() {
      var first = track.querySelector(".carousel__item");
      return first ? first.getBoundingClientRect().width + 20 : 320;
    }
    if (prev) prev.addEventListener("click", function () { track.scrollBy({ left: -step(), behavior: reduceMotion ? "auto" : "smooth" }); });
    if (next) next.addEventListener("click", function () { track.scrollBy({ left: step(), behavior: reduceMotion ? "auto" : "smooth" }); });
  });

  /* ---- 현재 연도 ---- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
