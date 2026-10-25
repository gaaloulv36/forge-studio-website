// Open Forge Studio — shared behaviour (nav, reveal, ruler + section index, contact form)
(function () {
  "use strict";

  document.documentElement.classList.add("js");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---- Mobile menu ----
  var toggle = document.querySelector(".nav-toggle");
  var menu = document.getElementById("mobile-menu");
  function setMenu(open) {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    menu.classList.toggle("is-open", open);
    menu.inert = !open;
    document.body.classList.toggle("no-scroll", open);
  }
  if (toggle && menu) {
    menu.inert = true;
    toggle.addEventListener("click", function () {
      setMenu(toggle.getAttribute("aria-expanded") !== "true");
    });
    menu.addEventListener("click", function (e) {
      if (e.target.closest("a")) setMenu(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        setMenu(false);
        toggle.focus();
      }
    });
    window.matchMedia("(min-width: 961px)").addEventListener("change", function (mq) {
      if (mq.matches) setMenu(false);
    });
  }

  // ---- Scroll reveal (elements) and rule drawing (sections) ----
  var targets = document.querySelectorAll(".reveal, .section");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    targets.forEach(function (el) { el.classList.add("is-in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.06 });
    targets.forEach(function (el) { io.observe(el); });
  }

  // ---- Side HUD: ruler with scroll marker, and section index ----
  var ruler = document.querySelector(".ruler");
  var index = document.querySelector(".section-index");
  if (ruler) {
    // Labels every 80px, matching the long ticks drawn in CSS
    var labels = Math.ceil(window.screen.height / 80);
    for (var i = 1; i < labels; i++) {
      var s = document.createElement("span");
      s.style.top = (i * 80) + "px";
      s.textContent = String(i * 5).padStart(2, "0");
      ruler.appendChild(s);
    }
    var marker = document.createElement("i");
    marker.className = "marker";
    ruler.appendChild(marker);
  }
  var indexLinks = index ? Array.prototype.slice.call(index.querySelectorAll("a")) : [];
  var indexed = indexLinks.map(function (a) { return document.querySelector(a.getAttribute("href")); });

  function onScroll() {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    var p = max > 0 ? window.scrollY / max : 0;
    if (ruler) marker.style.top = (p * ruler.clientHeight) + "px";

    if (indexLinks.length) {
      var line = window.innerHeight * 0.35, active = -1;
      indexed.forEach(function (sec, i) {
        if (sec && sec.getBoundingClientRect().top <= line) active = i;
      });
      indexLinks.forEach(function (a, i) { a.classList.toggle("is-active", i === active); });
    }
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);

  // ---- Footer year ----
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  // ---- Contact form (Formspree, works on any static host) ----
  var form = document.getElementById("contact-form");
  if (form) {
    var status = document.getElementById("form-status");
    var submit = form.querySelector("button[type=submit]");

    // Pre-select the product from ?product=thermoforge etc.
    var wanted = new URLSearchParams(window.location.search).get("product");
    var select = form.querySelector("#product");
    if (wanted && select) {
      Array.prototype.forEach.call(select.options, function (opt) {
        if (opt.value.toLowerCase() === wanted.toLowerCase()) select.value = opt.value;
      });
    }

    function show(kind, msg) {
      status.className = "form-status is-visible " + kind;
      status.textContent = msg;
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var invalid = form.querySelectorAll(":invalid");
      form.querySelectorAll("[aria-invalid]").forEach(function (el) { el.removeAttribute("aria-invalid"); });
      if (invalid.length) {
        invalid.forEach(function (el) { el.setAttribute("aria-invalid", "true"); });
        invalid[0].focus();
        show("err", "Please fill in your name, a valid email and what you need.");
        return;
      }

      if (form.action.indexOf("YOUR_FORM_ID") !== -1) {
        show("err", "The form isn't connected yet. Replace YOUR_FORM_ID in contact/index.html with your Formspree form ID.");
        return;
      }

      submit.disabled = true;
      var label = submit.querySelector("span");
      var original = label.textContent;
      label.textContent = "Sending…";

      fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" }
      }).then(function (res) {
        if (res.ok) {
          form.reset();
          show("ok", "Thanks, your message is on its way. I'll reply by email.");
        } else {
          return res.json().then(function (data) {
            var msg = data && data.errors ? data.errors.map(function (x) { return x.message; }).join(", ") : "";
            show("err", "Something went wrong" + (msg ? ": " + msg : ".") + " You can also reach me on LinkedIn.");
          });
        }
      }).catch(function () {
        show("err", "Couldn't send the message. Check your connection, or reach me on LinkedIn.");
      }).finally(function () {
        submit.disabled = false;
        label.textContent = original;
      });
    });
  }
})();
