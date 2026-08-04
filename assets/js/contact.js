/* =================================================================
   GLONIX — 1:1 상담 신청 폼 (조건부 표시 + 클라이언트 검증 + 제출)
   제출 경로: Netlify Forms (폼 name="consult"). 수신 메일 주소는 Netlify
   대시보드 Forms → 알림 설정에서 관리한다(코드에 하드코딩하지 않음).
   ================================================================= */
(function () {
  "use strict";
  var form = document.getElementById("consult-form");
  if (!form) return;

  /* ---- 상담 희망 시간 옵션 생성 (평일 09:00–18:00, 점심 12:00–13:00 제외) ---- */
  var timeSel = form.querySelector("#time");
  if (timeSel) {
    var slots = [];
    for (var h = 9; h < 18; h++) {
      if (h === 12) continue; // 점심시간 제외
      slots.push(h + ":00", h + ":30");
    }
    slots.forEach(function (t) {
      var o = document.createElement("option");
      var hh = t.split(":")[0];
      o.value = (hh.length === 1 ? "0" + hh : hh) + ":" + t.split(":")[1];
      o.textContent = o.value;
      timeSel.appendChild(o);
    });
  }

  /* ---- 상담 희망 날짜: 오늘 이후 + 평일만 ---- */
  var dateInput = form.querySelector("#date");
  if (dateInput) {
    var today = new Date();
    dateInput.min = today.toISOString().slice(0, 10);
  }

  /* ---- 조건부 필드 토글 ---- */
  function bindToggle(triggerName, value, targetId, focusEl) {
    var target = document.getElementById(targetId);
    if (!target) return;
    form.querySelectorAll('[name="' + triggerName + '"]').forEach(function (el) {
      el.addEventListener("change", function () {
        var on;
        if (el.type === "checkbox") on = el.checked;
        else on = form.querySelector('[name="' + triggerName + '"]:checked');
        if (el.type === "radio") on = (form.querySelector('[name="' + triggerName + '"]:checked') || {}).value === value;
        target.hidden = !on;
        if (on && focusEl) { var f = target.querySelector(focusEl); if (f) f.focus(); }
      });
    });
  }
  bindToggle("residence", "domestic", "cond-domestic");
  bindToggle("visa-cat-noniv", null, "cond-noniv");      // checkbox
  bindToggle("current-status", "hold", "cond-hold");
  bindToggle("current-status", "denied", "cond-denied");
  bindToggle("consult-method", "visit", "cond-visit");

  /* ---- 검증 헬퍼 ---- */
  function setError(fieldEl, on) {
    if (!fieldEl) return;
    fieldEl.classList.toggle("is-invalid", on);
  }
  function showToast(msg, isError) {
    var toast = document.getElementById("toast");
    if (!toast) { alert(msg); return; }
    toast.querySelector(".toast__msg").textContent = msg;
    toast.classList.toggle("is-error", !!isError);
    toast.classList.add("show");
    clearTimeout(showToast._t);
    showToast._t = setTimeout(function () { toast.classList.remove("show"); }, 5000);
  }

  var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  var telRe = /^[0-9+\-\s()]{7,}$/;

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var ok = true;
    var firstInvalid = null;

    function fail(field) { ok = false; setError(field, true); if (!firstInvalid) firstInvalid = field; }

    // 텍스트 필수
    [["name", function (v) { return v.trim().length > 0; }],
     ["phone", function (v) { return telRe.test(v.trim()); }],
     ["email", function (v) { return emailRe.test(v.trim()); }]
    ].forEach(function (pair) {
      var input = form.querySelector("#" + pair[0]);
      var field = input.closest(".field");
      if (!pair[1](input.value)) fail(field); else setError(field, false);
    });

    // 거주지역 (라디오 필수)
    var resField = document.getElementById("field-residence");
    if (!form.querySelector('[name="residence"]:checked')) fail(resField); else setError(resField, false);

    // 비자 카테고리 (체크박스 1개 이상)
    var catField = document.getElementById("field-category");
    if (!form.querySelector('[name="visa-cat"]:checked, [name="visa-cat-noniv"]:checked')) fail(catField); else setError(catField, false);

    // 상담 방식 (라디오 필수)
    var methodField = document.getElementById("field-method");
    if (!form.querySelector('[name="consult-method"]:checked')) fail(methodField); else setError(methodField, false);

    // 희망 날짜 (필수 + 평일)
    var dateField = document.getElementById("field-date");
    var dv = dateInput.value;
    if (!dv) { fail(dateField); }
    else {
      var day = new Date(dv + "T00:00").getDay();
      if (day === 0 || day === 6) { fail(dateField); }
      else setError(dateField, false);
    }

    // 개인정보 동의 (필수)
    var agreeField = document.getElementById("field-agree");
    if (!form.querySelector("#agree-privacy").checked) fail(agreeField); else setError(agreeField, false);

    // 허니팟(스팸 차단)
    if (form.querySelector("#company-hp").value) return; // 봇

    if (!ok) {
      showToast("필수 항목을 다시 확인해 주세요.", true);
      if (firstInvalid) {
        var t = firstInvalid.querySelector("input,select,textarea,button");
        firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
        if (t) t.focus();
      }
      return;
    }

    // ----- 제출: Netlify Forms 로 POST -----
    // 페이지 이동 없이 보내고 토스트로 결과를 알린다. 체크박스 복수 선택은
    // 같은 name 이 여러 번 실려 Netlify 쪽에 그대로 누적된다.
    var btn = form.querySelector('button[type="submit"]');
    var btnLabel = btn.textContent;
    btn.disabled = true; btn.textContent = "접수 처리 중…";

    fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(new FormData(form)).toString()
    }).then(function (res) {
      if (!res.ok) throw new Error("HTTP " + res.status);
      showToast("상담 신청이 접수되었습니다. 영업일 기준 24시간 이내에 회신드립니다.");
      form.reset();
      form.querySelectorAll(".conditional").forEach(function (c) { c.hidden = true; });
    }).catch(function (err) {
      console.error("[GLONIX] 상담 신청 전송 실패:", err);
      showToast("전송에 실패했습니다. 070-7709-1313 또는 admin@glonix.co.kr 로 연락해 주세요.", true);
    }).then(function () {
      btn.disabled = false; btn.textContent = btnLabel;
    });
  });
})();
