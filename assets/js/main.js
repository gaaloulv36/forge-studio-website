// Forge Studio — shared behaviour (nav, scroll reveal, card glow, contact form)
(function () {
  "use strict";

  document.documentElement.classList.add("js");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---- Header: add a background once the page is scrolled ----
  var header = document.querySelector(".site-header");
  function onScroll() {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 8);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // ---- Mobile menu ----
  var toggle = document.querySelector(".nav-toggle");
  var menu = document.getElementById("mobile-menu");
  function setMenu(open) {
    if (!toggle || !menu) return;
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    menu.classList.toggle("is-open", open);
    menu.inert = !open;
    header.classList.toggle("menu-open", open);
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
    window.matchMedia("(min-width: 901px)").addEventListener("change", function (mq) {
      if (mq.matches) setMenu(false);
    });
  }

  // ---- Scroll reveal ----
  var revealEls = document.querySelectorAll(".reveal");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("is-in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  // ---- Card glow follows the pointer ----
  if (!reduceMotion) {
    document.querySelectorAll(".card").forEach(function (card) {
      card.addEventListener("pointermove", function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty("--mx", (e.clientX - r.left) + "px");
        card.style.setProperty("--my", (e.clientY - r.top) + "px");
      });
    });
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
