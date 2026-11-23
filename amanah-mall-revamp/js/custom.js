/* =========================================================
   AMANAH MALL — shared site script (js/custom.js)
   ---------------------------------------------------------
   1. Shared UI   : nav, menu + search overlays, newsletter, year
   2. About page  : GSAP + ScrollTrigger motion, with an
                    IntersectionObserver fallback (about-us.html)
   Every block checks that its elements exist first, so this file
   is safe to load on any page.
   ========================================================= */
(function () {
  "use strict";

  var doc = document, root = doc.documentElement;
  var $  = function (s, c) { return (c || doc).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); };
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var HOME = "amanah-mall-redesign-new.html";

  /* =========================================================
     1. SHARED UI
     ========================================================= */

  /* ---- Nav: solid on scroll, hide on scroll-down ---- */
  var nav = $("#nav");
  if (nav) {
    var lastY = 0, ticking = false;
    var onScroll = function () {
      var y = window.scrollY, vh = window.innerHeight;
      nav.classList.toggle("scrolled", y > 40);
      nav.classList.toggle("hide", y > vh * 0.6 && y > lastY + 4 && !doc.body.classList.contains("lock"));
      if (y < lastY - 4) nav.classList.remove("hide");
      lastY = y; ticking = false;
    };
    window.addEventListener("scroll", function () { if (!ticking) { window.requestAnimationFrame(onScroll); ticking = true; } }, { passive: true });
    onScroll();
  }

  /* ---- Menu + search overlays ---- */
  var menu = $("#menu"), search = $("#search"), q = $("#q");
  var lock = function (on) { doc.body.style.overflow = on ? "hidden" : ""; doc.body.classList.toggle("lock", on); };
  var openO = function (o) { o.classList.add("open"); o.setAttribute("aria-hidden", "false"); lock(true); };
  var closeO = function (o) { if (!o) return; o.classList.remove("open"); o.setAttribute("aria-hidden", "true"); lock(false); };

  if (menu && $("#openMenu") && $("#closeMenu")) {
    $("#openMenu").addEventListener("click", function () { openO(menu); this.setAttribute("aria-expanded", "true"); });
    $("#closeMenu").addEventListener("click", function () { closeO(menu); $("#openMenu").setAttribute("aria-expanded", "false"); });
    $$("[data-close]", menu).forEach(function (a) { a.addEventListener("click", function () { closeO(menu); $("#openMenu").setAttribute("aria-expanded", "false"); }); });
  }

  /* Search index: brands + dining + entertainment + pages */
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var SEARCH_INDEX = [].concat(
    ["Bareeze","Bold Street","Bonanza Satrangi","Breakout","Charcoal","Cougar","Diners","Edenrobe","Engine","Hemani","Humna Momina","Ideas","J.","Kross Kulture","Lakhany","Limelight","Miandad","Miniso","Minnie Minors","Monark","Saeed Ghani","Sapphire","Saya","The Fabric Store","Ultra Club","Uniworth","Unze"]
      .map(function (n) { return [n, "Brand", "shopping-brands.html?q=" + encodeURIComponent(n)]; }),
    ["McDonald's","KFC","Fat Burger","HFC","OPTP","Subway","Alo Wala","Red Chilli","Butt Karahi","Chaye Qawali","Timmys","BonTon","Baskin Robbins","Gelato Affair","Food Court","Rooftop dining"]
      .map(function (n) { return [n, "Dining", HOME + "#dining"]; }),
    ["Magic Planet","Trampoline Park","Bowling & Snooker","American Pool & Snooker Club","Fun Factory Playland","Cinepax Cinema","Velocity Fitness Club"]
      .map(function (n) { return [n, "Entertainment", HOME + "#entertainment"]; }),
    [["About Amanah Mall","Page","about-us.html"],["Amanah Group","About","about-us.html#who-we-are"],["Facilities","About","about-us.html#facilities"],
     ["Serviced Apartments","Facilities","about-us.html#facilities"],["Parking","Facilities","about-us.html#facilities"],["Shopping Brands","Page","shopping-brands.html"],["Opening hours","Visit",HOME + "#visit"]]
  );
  function renderResults(v) {
    var s = v.trim().toLowerCase(), list = $("#results"), none = $("#noResults");
    if (!list) return;
    var hits = SEARCH_INDEX.filter(function (r) { return !s || r[0].toLowerCase().indexOf(s) > -1 || r[1].toLowerCase().indexOf(s) > -1; });
    list.innerHTML = hits.map(function (r) { return '<div><a href="' + r[2] + '" data-go>' + esc(r[0]) + "</a><small>" + esc(r[1]) + "</small></div>"; }).join("");
    if (none) none.hidden = hits.length > 0;
    $$("[data-go]", list).forEach(function (a) { a.addEventListener("click", function () { closeO(search); }); });
  }
  if (search && q && $("#openSearch") && $("#closeSearch")) {
    $("#openSearch").addEventListener("click", function () { openO(search); setTimeout(function () { q.focus(); }, 200); renderResults(""); });
    $("#closeSearch").addEventListener("click", function () { closeO(search); });
    q.addEventListener("input", function (e) { renderResults(e.target.value); });
  }
  window.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { if (menu && menu.classList.contains("open")) { closeO(menu); } if (search && search.classList.contains("open")) { closeO(search); } }
    if (e.key === "/" && search && ["INPUT", "TEXTAREA"].indexOf(doc.activeElement.tagName) < 0) { e.preventDefault(); $("#openSearch").click(); }
  });

  /* ---- Newsletter + footer year ---- */
  var news = $("#newsForm");
  if (news) news.addEventListener("submit", function (e) {
    e.preventDefault();
    var v = $("#email").value.trim(), msg = $("#fMsg");
    msg.textContent = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? "Thank you — you're on the list." : "Please enter a valid email address.";
  });
  if ($("#yr")) $("#yr").textContent = new Date().getFullYear();


  /* =========================================================
     2. ABOUT PAGE  (body.about-page)
     ========================================================= */
  if (doc.body.classList.contains("about-page")) initAbout();

  function initAbout() {
    root.classList.add("about-anim-live");          // tells the head failsafe that motion is in hand

    var heroBits   = $$("[data-about-hero]");
    var heroTitle  = $("[data-about-hero-title]");
    var heroImgs   = $$("[data-about-hero-img]");
    var splits     = $$(".about-split").filter(function (el) { return el !== heroTitle; });
    var reveals    = $$("[data-about-reveal]");
    var imgs       = $$("[data-about-img]");
    var counters   = $$("[data-about-count]");
    var bars       = $$("[data-about-bar]");

    /* Remote photos: show the brand-blue plate if one fails to load */
    $$("[data-about-fallback] img").forEach(function (img) {
      var miss = function () { img.parentNode.classList.add("is-missing"); };
      if (img.complete && img.naturalWidth === 0 && img.currentSrc) miss();
      img.addEventListener("error", miss);
    });

    initVideo();
    initVoices();

    /* ---- Reduced motion: everything visible, numbers final ---- */
    if (reduce) {
      root.classList.remove("about-anim-ready");
      if (heroTitle) heroTitle.classList.add("in");
      splits.forEach(function (el) { el.classList.add("in"); });
      bars.forEach(function (b) { b.classList.add("is-in"); });
      return;
    }

    var gsap = window.gsap, ST = window.ScrollTrigger;

    if (gsap && ST) {
      /* ---------- GSAP path ---------- */
      gsap.registerPlugin(ST);

      /* Hero entrance */
      var tl = gsap.timeline({ defaults: { ease: "expo.out" } });
      tl.call(function () { if (heroTitle) heroTitle.classList.add("in"); }, null, 0.1)
        .fromTo(heroBits, { autoAlpha: 0, y: 28 }, { autoAlpha: 1, y: 0, duration: 1.2, stagger: 0.08 }, 0.25)
        .fromTo(heroImgs, { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.6, ease: "expo.inOut", stagger: 0.14 }, 0.35)
        .fromTo(heroImgs.map(function (f) { return $("img", f); }).filter(Boolean), { scale: 1.18 }, { scale: 1, duration: 2.2, ease: "expo.out", stagger: 0.14 }, 0.35);

      /* Headings: existing split-line pattern, class toggled on enter */
      splits.forEach(function (el) {
        ST.create({ trigger: el, start: "top 86%", once: true, onEnter: function () { el.classList.add("in"); } });
      });

      /* Text + cards: batched, softly staggered rises */
      ST.batch(reveals, {
        start: "top 88%", once: true,
        onEnter: function (batch) {
          gsap.fromTo(batch, { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 1, ease: "power3.out", stagger: 0.09, overwrite: true });
        }
      });

      /* Image reveals: clip-path "door" + settle */
      imgs.forEach(function (el) {
        var img = $("img", el);
        var t = gsap.timeline({ scrollTrigger: { trigger: el, start: "top 86%", once: true } });
        t.fromTo(el, { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.4, ease: "expo.inOut" });
        if (img) t.fromTo(img, { scale: 1.16 }, { scale: 1, duration: 1.8, ease: "expo.out" }, 0);
      });

      /* Counters + bars */
      counters.forEach(function (el) { ST.create({ trigger: el, start: "top 90%", once: true, onEnter: function () { countUp(el); } }); });
      bars.forEach(function (b, i) {
        ST.create({ trigger: b, start: "top 92%", once: true, onEnter: function () { setTimeout(function () { b.classList.add("is-in"); }, i * 90); } });
      });

      /* Gentle parallax on large photos (desktop only) */
      var mm = gsap.matchMedia();
      mm.add("(min-width: 961px)", function () {
        $$("[data-about-parallax]").forEach(function (img) {
          gsap.fromTo(img, { yPercent: -4 }, {
            yPercent: 4, ease: "none",
            scrollTrigger: { trigger: img.parentNode, start: "top bottom", end: "bottom top", scrub: true }
          });
        });
      });

      window.addEventListener("load", function () { ST.refresh(); });
      return;
    }

    /* ---------- Fallback path: IntersectionObserver (same pattern as the other pages) ---------- */
    window.requestAnimationFrame(function () {
      if (heroTitle) heroTitle.classList.add("in");
      heroBits.forEach(function (el, i) { el.style.transitionDelay = (0.15 + i * 0.07) + "s"; el.classList.add("is-in"); });
      heroImgs.forEach(function (el, i) { el.style.transitionDelay = (0.25 + i * 0.12) + "s"; el.classList.add("is-in"); });
    });
    /* A clip-path'd element never reports as intersecting, so image reveals
       are triggered by watching their parent instead. */
    var imgByParent = new Map();
    imgs.forEach(function (el) { var p = el.parentNode; imgByParent.set(p, (imgByParent.get(p) || []).concat(el)); });
    var io = new IntersectionObserver(function (entries) {
      var n = 0;
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        if (el.hasAttribute("data-about-reveal")) {
          /* cards in the swipeable testimonial row reveal together, even the off-screen ones */
          var group = el.closest(".about-voice-track") ? $$("[data-about-reveal]", el.parentNode) : [el];
          group.forEach(function (g) { if (!g.classList.contains("is-in")) { g.style.transitionDelay = (n++ * 0.08) + "s"; g.classList.add("is-in"); io.unobserve(g); } });
        }
        if (imgByParent.has(el)) imgByParent.get(el).forEach(function (img, i) { img.style.transitionDelay = (i * 0.12) + "s"; img.classList.add("is-in"); });
        if (el.classList.contains("about-split")) el.classList.add("in");
        if (el.hasAttribute("data-about-count")) countUp(el);
        if (el.hasAttribute("data-about-bar")) el.classList.add("is-in");
        io.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    reveals.concat(splits, counters, bars).forEach(function (el) { io.observe(el); });
    imgByParent.forEach(function (_, parent) { io.observe(parent); });
  }

  /* Count-up with thousands separators */
  function countUp(el) {
    var to = +el.getAttribute("data-about-count"), t0 = performance.now(), fmt = new Intl.NumberFormat("en-US");
    var step = function (t) {
      var p = Math.min(1, (t - t0) / 1800), e = 1 - Math.pow(1 - p, 4);
      el.textContent = fmt.format(Math.round(to * e));
      if (p < 1) window.requestAnimationFrame(step);
    };
    el.textContent = "0";
    window.requestAnimationFrame(step);
  }

  /* Film: loads only when near view, autoplays muted, with an accessible toggle */
  function initVideo() {
    var v = $("#aboutVideo"), btn = $("#aboutVideoBtn"), label = $("#aboutVideoLabel");
    if (!v || !btn) return;
    var userPaused = false;
    var sync = function () { var on = !v.paused; btn.setAttribute("aria-pressed", on); label.textContent = on ? "Pause film" : "Play film"; };
    var play = function () { var p = v.play(); if (p && p.catch) p.catch(function () { sync(); }); };
    v.addEventListener("play", sync); v.addEventListener("pause", sync);
    btn.addEventListener("click", function () { if (v.paused) { userPaused = false; play(); } else { userPaused = true; v.pause(); } });
    if (reduce || !("IntersectionObserver" in window)) return;   // no autoplay for reduced motion
    new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting && e.intersectionRatio > 0.35) { if (!userPaused) play(); }
        else if (!v.paused) v.pause();
      });
    }, { threshold: [0, 0.35, 0.6] }).observe(v);
  }

  /* Testimonials: prev / next on the swipeable row (tablet + mobile) */
  function initVoices() {
    var track = $("#aboutVoices");
    if (!track) return;
    $$("[data-about-voice]").forEach(function (b) {
      b.addEventListener("click", function () {
        var card = $(".about-voice", track), gap = parseFloat(getComputedStyle(track).columnGap) || 16;
        track.scrollBy({ left: (+b.getAttribute("data-about-voice")) * (card.offsetWidth + gap), behavior: reduce ? "auto" : "smooth" });
      });
    });
  }
})();
