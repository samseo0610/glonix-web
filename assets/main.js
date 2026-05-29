/* 글로닉스 이민법인 — 공통 인터랙션 */
(function () {
  "use strict";

  /* ---------- 모바일 네비게이션 토글 ---------- */
  var toggle = document.querySelector(".nav__toggle");
  var menu = document.querySelector(".nav__menu");
  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      var open = menu.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    // 메뉴 내 일반 링크 클릭 시 닫기 (드롭다운 토글 제외)
    menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        if (window.innerWidth <= 768) menu.classList.remove("open");
      });
    });
  }

  /* ---------- 스크롤 reveal ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if (reveals.length && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- 상담신청 폼 → mailto ---------- */
  var form = document.getElementById("consult-form");
  if (form) {
    var errBox = document.getElementById("form-error");

    var labelFor = function (input) {
      // 그룹(체크박스/라디오)의 사람이 읽을 라벨
      var fieldset = input.closest(".field");
      var lbl = fieldset ? fieldset.querySelector("label") : null;
      return lbl ? lbl.textContent.replace(/[*✱]|필수|복수 선택 가능/g, "").trim() : input.name;
    };

    var collectGroup = function (name) {
      var picked = [];
      form.querySelectorAll('[name="' + name + '"]:checked').forEach(function (el) {
        var txt = el.closest("label") ? el.closest("label").textContent.trim() : el.value;
        // 인라인 select 값 덧붙이기
        var sel = el.closest("label") ? el.closest("label").querySelector("select") : null;
        if (sel && sel.value) txt += " (" + sel.value + ")";
        picked.push(txt.replace(/\s+/g, " "));
      });
      return picked;
    };

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (errBox) errBox.style.display = "none";

      // 기본 HTML5 검증
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      // 개인정보 동의 필수
      var agree = form.querySelector('[name="agree_privacy"]');
      if (agree && !agree.checked) {
        if (errBox) {
          errBox.textContent = "개인정보 수집·이용 동의(필수)에 체크해 주세요.";
          errBox.style.display = "block";
          errBox.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        return;
      }
      // 비자 카테고리 1개 이상
      if (collectGroup("category").length === 0) {
        if (errBox) {
          errBox.textContent = "상담 희망 비자 카테고리를 1개 이상 선택해 주세요.";
          errBox.style.display = "block";
          errBox.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        return;
      }

      var v = function (id) { var el = document.getElementById(id); return el ? el.value.trim() : ""; };
      var radio = function (name) {
        var el = form.querySelector('[name="' + name + '"]:checked');
        if (!el) return "";
        var t = el.closest("label") ? el.closest("label").textContent.trim() : el.value;
        var sel = el.closest("label") ? el.closest("label").querySelector("select, input[type=text]") : null;
        if (sel && sel.value) t += " (" + sel.value + ")";
        return t.replace(/\s+/g, " ");
      };

      var L = [];
      L.push("■ 신청자 정보");
      L.push("- 이름: " + v("name"));
      L.push("- 연락처: " + v("phone"));
      L.push("- 이메일: " + v("email"));
      L.push("- 거주지역: " + radio("region"));
      L.push("");
      L.push("■ 상담 내용");
      L.push("- 희망 비자 카테고리: " + collectGroup("category").join(", "));
      var interests = collectGroup("interest");
      if (interests.length) L.push("- 관심 사항: " + interests.join(", "));
      var visaStatus = radio("visa_status");
      if (visaStatus) L.push("- 현재 미국 비자/신분: " + visaStatus);
      var children = radio("children");
      if (children) L.push("- 자녀 수: " + children);
      L.push("");
      L.push("■ 상담 일정");
      L.push("- 희망 방식: " + radio("method"));
      L.push("- 희망 날짜/시간: " + v("pref_date") + " " + v("pref_time"));
      L.push("");
      L.push("■ 추가 정보");
      L.push("- 문의 사항: " + (v("message") || "(없음)"));
      var source = radio("source");
      if (source) L.push("- 알게 된 경로: " + source);
      L.push("");
      L.push("- 마케팅 수신 동의: " + (form.querySelector('[name="agree_marketing"]') && form.querySelector('[name="agree_marketing"]').checked ? "동의" : "미동의"));

      var subject = "[글로닉스 상담신청] " + (v("name") || "신청자") + " 님";
      var body = L.join("\r\n");
      var href = "mailto:admin@glonix.co.kr?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);

      // 사용자 안내 후 메일 클라이언트 오픈
      window.location.href = href;

      var done = document.getElementById("form-done");
      if (done) {
        done.style.display = "block";
        done.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });
  }

  /* ---------- 푸터 연도 ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
