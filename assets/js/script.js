// Open Forge Studio — shared behaviour
// (theme toggle, header, mobile menu, scroll reveal, card spotlight, hero orbit animation, contact form)
// The initial theme is set by a small inline script in each page's <head>, before first paint.
(function () {
  "use strict";

  var root = document.documentElement;
  root.classList.add("js");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  // ---- Theme: saved choice > system preference > dark ----
  var THEME_KEY = "ofs-theme";
  var THEME_COLORS = { dark: "#090D16", light: "#F8FAFC" };
  var themeMeta = document.querySelector('meta[name="theme-color"]');
  var toggles = document.querySelectorAll(".theme-toggle");

  function savedTheme() {
    try {
      var t = localStorage.getItem(THEME_KEY);
      return t === "light" || t === "dark" ? t : null;
    } catch (e) { return null; }
  }
  function systemTheme() {
    return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  }
  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    if (themeMeta) themeMeta.setAttribute("content", THEME_COLORS[theme]);
    var next = theme === "dark" ? "light" : "dark";
    toggles.forEach(function (btn) {
      btn.setAttribute("aria-label", "Switch to " + next + " theme");
      btn.setAttribute("title", "Switch to " + next + " theme");
    });
  }

  function switchTheme(e) {
    var next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
    try { localStorage.setItem(THEME_KEY, next); } catch (err) { /* private mode: still switch */ }

    if (reduceMotion) { applyTheme(next); return; }

    // Circular reveal from the button where View Transitions exist, colour fade elsewhere
    if (document.startViewTransition) {
      var r = e.currentTarget.getBoundingClientRect();
      var x = r.left + r.width / 2, y = r.top + r.height / 2;
      var radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
      document.startViewTransition(function () { applyTheme(next); }).ready.then(function () {
        root.animate(
          { clipPath: ["circle(0px at " + x + "px " + y + "px)", "circle(" + radius + "px at " + x + "px " + y + "px)"] },
          { duration: 600, easing: "cubic-bezier(0.2, 0.7, 0.2, 1)", pseudoElement: "::view-transition-new(root)" }
        );
      });
    } else {
      root.classList.add("theme-fade");
      applyTheme(next);
      setTimeout(function () { root.classList.remove("theme-fade"); }, 500);
    }
  }

  applyTheme(savedTheme() || root.getAttribute("data-theme") || systemTheme());
  toggles.forEach(function (btn) { btn.addEventListener("click", switchTheme); });
  // Follow the OS setting until the visitor picks a theme themselves
  window.matchMedia("(prefers-color-scheme: light)").addEventListener("change", function () {
    if (!savedTheme()) applyTheme(systemTheme());
  });

  // ---- Header: hairline once the page scrolls ----
  var header = document.querySelector(".site-header");
  function onScrollHeader() {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 8);
  }

  // ---- Mobile menu ----
  var navToggle = document.querySelector(".nav-toggle");
  var menu = document.getElementById("mobile-menu");
  function setMenu(open) {
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    menu.classList.toggle("is-open", open);
    menu.inert = !open;
    document.body.classList.toggle("no-scroll", open);
  }
  if (navToggle && menu) {
    menu.inert = true;
    navToggle.addEventListener("click", function () {
      setMenu(navToggle.getAttribute("aria-expanded") !== "true");
    });
    menu.addEventListener("click", function (e) {
      if (e.target.closest("a")) setMenu(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && navToggle.getAttribute("aria-expanded") === "true") {
        setMenu(false);
        navToggle.focus();
      }
    });
    window.matchMedia("(min-width: 921px)").addEventListener("change", function (mq) {
      if (mq.matches) setMenu(false);
    });
  }

  // ---- Scroll reveal: .fade-in / .slide-up get .is-visible on entering the viewport ----
  var revealables = document.querySelectorAll(".fade-in, .slide-up");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealables.forEach(function (el) { el.classList.add("is-visible"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    revealables.forEach(function (el) { io.observe(el); });
  }

  // ---- Nav: highlight the link for the section in view (home page anchors only) ----
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav-links a[href^="#"]'));
  var navTargets = navLinks.map(function (a) { return document.querySelector(a.getAttribute("href")); });
  function onScrollSpy() {
    if (!navLinks.length) return;
    var line = window.innerHeight * 0.35, active = -1;
    navTargets.forEach(function (sec, i) {
      if (sec && sec.getBoundingClientRect().top <= line) active = i;
    });
    navLinks.forEach(function (a, i) { a.classList.toggle("is-active", i === active); });
  }

  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      onScrollHeader();
      onScrollSpy();
      ticking = false;
    });
  }
  onScrollHeader();
  onScrollSpy();
  window.addEventListener("scroll", onScroll, { passive: true });

  // ---- Card spotlight: the glow follows the pointer ----
  if (finePointer) {
    document.querySelectorAll(".card").forEach(function (card) {
      card.addEventListener("pointermove", function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty("--mx", (e.clientX - r.left) + "px");
        card.style.setProperty("--my", (e.clientY - r.top) + "px");
      });
    });
  }

  // ---- Ecosystem hero: product cards spiralling out from behind the copy ----
  // Each card travels outward along a spiral (radius grows while the angle turns), fading in near the
  // centre and out past the edge, then starts again. Only transform and opacity change, so the browser
  // can composite every frame. Hovering a card holds the field still so it's easy to look at.
  var orbit = document.querySelector(".orbit");
  var ecoHero = document.querySelector(".eco-hero");
  if (orbit && ecoHero) {
    var LOOP = 64;       // seconds for a card to travel from the centre to the edge
    var TURN = 0.55;     // turns made on the way out
    var GOLDEN = 137.5;  // golden-angle start offsets keep the cards evenly spread
    var orbs = Array.prototype.slice.call(orbit.querySelectorAll(".orb-card")).map(function (el, i, all) {
      return { el: el, phase: i / all.length, angle: i * GOLDEN, depth: 0.5 + (i % 3) * 0.35 };
    });
    var w = 0, h = 0, rMin = 0, rMax = 0, k = 1;
    var px = 0, py = 0, tx = 0, ty = 0;   // pointer parallax, smoothed toward the target

    var measure = function () {
      w = ecoHero.clientWidth;
      h = ecoHero.clientHeight;
      rMin = Math.min(w, h) * 0.3;              // start at the edge of the copy
      rMax = Math.hypot(w / 2, h / 2) * 0.92;   // leave just past the corners
      k = w < 640 ? 0.78 : 1;                   // smaller cards on phones
    };
    var place = function (t) {
      px += (tx - px) * 0.06;
      py += (ty - py) * 0.06;
      orbs.forEach(function (o) {
        var p = (o.phase + t / LOOP) % 1;
        var r = rMin + (rMax - rMin) * p;
        var a = (o.angle + p * TURN * 360) * Math.PI / 180;
        var x = w / 2 + Math.cos(a) * r + px * o.depth;
        var y = h / 2 + Math.sin(a) * r * 0.68 + py * o.depth;   // flattened, like a tilted disc
        var fade = Math.min(1, p / 0.15, (1 - p) / 0.12);
        o.el.style.opacity = fade.toFixed(3);
        o.el.style.transform = "translate3d(" + x.toFixed(1) + "px," + y.toFixed(1) + "px,0) scale(" + ((0.7 + 0.42 * p) * k).toFixed(3) + ")";
      });
    };

    measure();
    if ("ResizeObserver" in window) new ResizeObserver(function () { measure(); if (reduceMotion) place(LOOP * 0.2); }).observe(ecoHero);

    if (reduceMotion) {
      place(LOOP * 0.2);   // a still, spread-out arrangement
    } else {
      var elapsed = 0, last = 0, raf = 0, held = false;
      var frame = function (now) {
        var dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
        last = now;
        if (!held) elapsed += dt;
        place(elapsed);
        raf = requestAnimationFrame(frame);
      };
      var run = function (on) {
        cancelAnimationFrame(raf);
        last = 0;
        if (on) raf = requestAnimationFrame(frame);
      };
      // Only animate while the hero is on screen
      if ("IntersectionObserver" in window) {
        new IntersectionObserver(function (entries) { run(entries[0].isIntersecting); }).observe(ecoHero);
      } else {
        run(true);
      }
      orbs.forEach(function (o) {
        o.el.addEventListener("pointerenter", function () { held = true; });
        o.el.addEventListener("pointerleave", function () { held = false; });
      });
      if (finePointer) {
        ecoHero.addEventListener("pointermove", function (e) {
          var r = ecoHero.getBoundingClientRect();
          tx = (e.clientX - r.left - w / 2) * -0.04;
          ty = (e.clientY - r.top - h / 2) * -0.04;
        });
        ecoHero.addEventListener("pointerleave", function () { tx = 0; ty = 0; });
      }

      // Spotlight: cycle the accent apps; the hero recolours and that app's card glows
      var spotlight = ["vault", "shield", "flow", "devkit"], s = 0;
      var light = function () {
        var app = spotlight[s % spotlight.length];
        ecoHero.setAttribute("data-app", app);
        orbs.forEach(function (o) { o.el.classList.toggle("is-lit", o.el.getAttribute("data-app") === app && !o.el.classList.contains("chip")); });
      };
      light();
      setInterval(function () { if (!document.hidden) { s++; light(); } }, 4500);
    }
  }

  // ---- Ciphertext shimmer: [data-cipher] shows ever-changing encrypted bytes ----
  var ciphers = document.querySelectorAll("[data-cipher]");
  if (ciphers.length) {
    var HEX = "0123456789abcdef";
    var scramble = function (el) {
      var n = parseInt(el.getAttribute("data-cipher"), 10) || 10, s = "";
      for (var i = 0; i < n; i++) s += HEX[Math.floor(Math.random() * 16)];
      el.textContent = s;
    };
    ciphers.forEach(scramble);
    if (!reduceMotion) {
      var k = 0;
      setInterval(function () {
        if (document.hidden) return;
        scramble(ciphers[k++ % ciphers.length]);
      }, 700);
    }
  }

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
