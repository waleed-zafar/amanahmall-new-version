/* =========================================================
   AMANAH MALL — shared site script (js/custom.js)
   ---------------------------------------------------------
   1. Shared UI   : nav, menu + search overlays, newsletter, year
   2. Page motion : GSAP + ScrollTrigger reveals with an
                    IntersectionObserver fallback (about-us.html and
                    the 11 inner pages, body.ip-page)
   3. Inner pages : FAQ accordions, hero videos, floor map, news
                    filter, contact form
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
      .map(function (n) { return [n, "Dining", "food-court.html"]; }),
    [["Magic Planet","magic-planet.html"],["Trampoline Park","trampoline-park.html"],["Bowling Alley","bowling-alley.html"],["American Pool & Snooker Club","snooker-club.html"],
     ["Fun Factory Playland",HOME + "#entertainment"],["Cinepax Cinema","floor-map.html#5"],["Velocity Fitness Club","velocity.html"]]
      .map(function (r) { return [r[0], "Entertainment", r[1]]; }),
    [["About Amanah Mall","Page","about-us.html"],["Amanah Group","About","about-us.html#who-we-are"],["Facilities","About","about-us.html#facilities"],
     ["Serviced Apartments","Facilities","about-us.html#facilities"],["Parking","Floor map","floor-map.html#b1"],["Shopping Brands","Page","shopping-brands.html"],
     ["Floor Map","Page","floor-map.html"],["Events","Page","events.html"],["Latest News","Page","news.html"],["Message from the GM","Page","message-from-gm.html"],
     ["How to Find Us","Page","contacts.html"],["Contact Us","Page","contact-us.html"],["Opening hours","Visit","contacts.html#timings"]]
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
     2. PAGE MOTION  (one engine, two attribute prefixes)
        about-us.html  → initMotion("about")   data-about-*
        inner pages    → initMotion("ip")      data-ip-*
     GSAP + ScrollTrigger are loaded once per page (CDN tags in the
     page head). If they are missing, the IntersectionObserver
     fallback below runs the same reveals with CSS transitions.
     ========================================================= */
  var ST_READY = false;                       // registerPlugin runs once only
  function refreshMotion() { if (ST_READY && window.ScrollTrigger) window.ScrollTrigger.refresh(); }

  if (doc.body.classList.contains("about-page")) {
    initMotion("about", { groupSel: ".about-voice-track" });
    initVideo();
    initVoices();
  }
  if (doc.body.classList.contains("ip-page")) {
    initMotion("ip", { groupSel: "[data-ip-group]" });
    initFaq();
    initHeroVideos();
    initTodayHours();
    initFloorMap();
    initNews();
    initContactForm();
    initBowling();
  }

  function initMotion(p, opts) {
    opts = opts || {};
    var A = function (n) { return "[data-" + p + "-" + n + "]"; };
    root.classList.add(p + "-anim-live");          // tells the head failsafe that motion is in hand

    var heroBits   = $$(A("hero"));
    var heroTitle  = $(A("hero-title"));
    var heroImgs   = $$(A("hero-img"));
    var splits     = $$("." + p + "-split").filter(function (el) { return el !== heroTitle; });
    var reveals    = $$(A("reveal"));
    var imgs       = $$(A("img"));
    var counters   = $$(A("count"));
    var bars       = $$(A("bar"));

    /* Remote photos: try a smaller fallback file first, then show the brand-blue plate */
    $$(A("fallback") + " img").forEach(function (img) {
      var miss = function () {
        var alt = img.getAttribute("data-fallback-src");
        if (alt && img.src.indexOf(alt) < 0) { img.src = alt; return; }
        img.parentNode.classList.add("is-missing");
      };
      if (img.complete && img.naturalWidth === 0 && img.currentSrc) miss();
      img.addEventListener("error", miss);
    });

    /* ---- Reduced motion: everything visible, numbers final ---- */
    if (reduce) {
      root.classList.remove(p + "-anim-ready");
      if (heroTitle) heroTitle.classList.add("in");
      splits.forEach(function (el) { el.classList.add("in"); });
      bars.forEach(function (b) { b.classList.add("is-in"); });
      return;
    }

    var gsap = window.gsap, ST = window.ScrollTrigger;

    if (gsap && ST) {
      /* ---------- GSAP path ---------- */
      if (!ST_READY) { gsap.registerPlugin(ST); ST_READY = true; }

      /* Hero entrance */
      var tl = gsap.timeline({ defaults: { ease: "expo.out" } });
      tl.call(function () { if (heroTitle) heroTitle.classList.add("in"); }, null, 0.1);
      if (heroBits.length) tl.fromTo(heroBits, { autoAlpha: 0, y: 28 }, { autoAlpha: 1, y: 0, duration: 1.2, stagger: 0.08 }, 0.25);
      if (heroImgs.length) {
        tl.fromTo(heroImgs, { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.6, ease: "expo.inOut", stagger: 0.14 }, 0.35);
        var heroPics = heroImgs.map(function (f) { return $("img, video", f); }).filter(Boolean);
        if (heroPics.length) tl.fromTo(heroPics, { scale: 1.18 }, { scale: 1, duration: 2.2, ease: "expo.out", stagger: 0.14 }, 0.35);
      }

      /* Headings: existing split-line pattern, class toggled on enter */
      splits.forEach(function (el) {
        ST.create({ trigger: el, start: "top 86%", once: true, onEnter: function () { el.classList.add("in"); } });
      });

      /* Text + cards: batched, softly staggered rises */
      if (reveals.length) ST.batch(reveals, {
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
      counters.forEach(function (el) { ST.create({ trigger: el, start: "top 90%", once: true, onEnter: function () { countUp(el, p); } }); });
      bars.forEach(function (b, i) {
        ST.create({ trigger: b, start: "top 92%", once: true, onEnter: function () { setTimeout(function () { b.classList.add("is-in"); }, i * 90); } });
      });

      /* Gentle parallax on large photos (desktop only) */
      var mm = gsap.matchMedia();
      mm.add("(min-width: 961px)", function () {
        $$(A("parallax")).forEach(function (img) {
          gsap.fromTo(img, { yPercent: -4 }, {
            yPercent: 4, ease: "none",
            scrollTrigger: { trigger: img.parentNode, start: "top bottom", end: "bottom top", scrub: true }
          });
        });
      });

      window.addEventListener("load", refreshMotion);
      return;
    }

    /* ---------- Fallback path: IntersectionObserver ---------- */
    window.requestAnimationFrame(function () {
      if (heroTitle) heroTitle.classList.add("in");
      heroBits.forEach(function (el, i) { el.style.transitionDelay = (0.15 + i * 0.07) + "s"; el.classList.add("is-in"); });
      heroImgs.forEach(function (el, i) { el.style.transitionDelay = (0.25 + i * 0.12) + "s"; el.classList.add("is-in"); });
    });
    /* A clip-path'd element never reports as intersecting, so image reveals
       are triggered by watching their parent instead. */
    var imgByParent = new Map();
    imgs.forEach(function (el) { var par = el.parentNode; imgByParent.set(par, (imgByParent.get(par) || []).concat(el)); });
    var io = new IntersectionObserver(function (entries) {
      var n = 0;
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        if (el.hasAttribute("data-" + p + "-reveal")) {
          /* items in a swipeable row reveal together, even the off-screen ones */
          var grp = opts.groupSel && el.parentNode.closest && el.parentNode.closest(opts.groupSel);
          var group = grp ? $$(A("reveal"), grp) : [el];
          group.forEach(function (g) { if (!g.classList.contains("is-in")) { g.style.transitionDelay = (n++ * 0.08) + "s"; g.classList.add("is-in"); io.unobserve(g); } });
        }
        if (imgByParent.has(el)) imgByParent.get(el).forEach(function (img, i) { img.style.transitionDelay = (i * 0.12) + "s"; img.classList.add("is-in"); });
        if (el.classList.contains(p + "-split")) el.classList.add("in");
        if (el.hasAttribute("data-" + p + "-count")) countUp(el, p);
        if (el.hasAttribute("data-" + p + "-bar")) el.classList.add("is-in");
        io.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    reveals.concat(splits, counters, bars).forEach(function (el) { io.observe(el); });
    imgByParent.forEach(function (_, parent) { io.observe(parent); });
  }

  /* Count-up with thousands separators */
  function countUp(el, p) {
    var to = +el.getAttribute("data-" + (p || "about") + "-count"), t0 = performance.now(), fmt = new Intl.NumberFormat("en-US");
    var step = function (t) {
      var q = Math.min(1, (t - t0) / 1800), e = 1 - Math.pow(1 - q, 4);
      el.textContent = fmt.format(Math.round(to * e));
      if (q < 1) window.requestAnimationFrame(step);
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

  /* =========================================================
     3. INNER PAGE MODULES  (each returns early if its markup is absent)
     ========================================================= */

  /* ---- FAQ accordion (all inner pages) ---- */
  function initFaq() {
    $$(".ip-faq").forEach(function (list) {
      $$(".ip-faq-q button", list).forEach(function (btn) {
        var item = btn.closest(".ip-faq-item"), panel = $("#" + btn.getAttribute("aria-controls"));
        if (!panel) return;
        btn.addEventListener("click", function () {
          var open = btn.getAttribute("aria-expanded") !== "true";
          btn.setAttribute("aria-expanded", open);
          item.classList.toggle("is-open", open);
          setTimeout(refreshMotion, 650);
        });
      });
    });
  }

  /* ---- Hero videos: muted loop while visible, desktop + full motion only ---- */
  function initHeroVideos() {
    $$("[data-ip-video]").forEach(function (v) {
      var btn = v.parentNode.querySelector(".ip-video-toggle");
      var sync = function () { if (btn) btn.setAttribute("aria-pressed", !v.paused); };
      var play = function () { var pr = v.play(); if (pr && pr.catch) pr.catch(sync); };
      var userPaused = false;
      v.addEventListener("play", sync); v.addEventListener("pause", sync);
      v.addEventListener("error", function () { if (btn) btn.hidden = true; }, true);
      if (btn) btn.addEventListener("click", function () { if (v.paused) { userPaused = false; play(); } else { userPaused = true; v.pause(); } });
      var auto = !reduce && window.matchMedia("(min-width: 961px)").matches && "IntersectionObserver" in window;
      if (!auto) return;
      new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { if (!userPaused) play(); } else if (!v.paused) v.pause(); });
      }, { threshold: 0.3 }).observe(v);
    });
  }

  /* ---- Highlight today's row in hours lists (Pakistan time, UTC+5) ---- */
  function pkNow() { var d = new Date(); return new Date(d.getTime() + (d.getTimezoneOffset() + 300) * 60000); }
  function initTodayHours() {
    var day = pkNow().getDay();                       // 0 = Sunday
    $$("[data-ip-days]").forEach(function (row) {
      var days = row.getAttribute("data-ip-days").split(",").map(Number);
      row.classList.toggle("is-today", days.indexOf(day) > -1);
    });
  }

  /* ---- FLOOR MAP: lift-style tabs, cross-floor search, deep links ---- */
  function initFloorMap() {
    var app = $("#floorMapApp");
    if (!app) return;
    var tabs = $$(".floor-map-tab", app), panels = $$(".floor-map-panel", app);
    var input = $("#floorMapQ"), results = $("#floorMapResults");

    function show(id, opts) {
      opts = opts || {};
      var tab = $('.floor-map-tab[aria-controls="' + id + '"]', app), panel = $("#" + id);
      if (!tab || !panel) return;
      tabs.forEach(function (t) { var on = t === tab; t.setAttribute("aria-selected", on); t.tabIndex = on ? 0 : -1; });
      panels.forEach(function (pn) { if (pn !== panel) pn.hidden = true; });
      if (panel.hidden || opts.force) {
        panel.hidden = false;
        panel.classList.remove("is-entering");
        if (!reduce) {
          if (window.gsap) {
            window.gsap.fromTo(panel.children, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.8, ease: "power3.out", stagger: 0.06, overwrite: true });
          } else { void panel.offsetWidth; panel.classList.add("is-entering"); }
        }
      }
      if (tab.scrollIntoView && window.matchMedia("(max-width: 960px)").matches) tab.scrollIntoView({ block: "nearest", inline: "center", behavior: reduce ? "auto" : "smooth" });
      if (opts.hash !== false) history.replaceState(null, "", "#" + tab.getAttribute("data-floor"));
      if (opts.focus) tab.focus();
      refreshMotion();
    }

    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () { show(t.getAttribute("aria-controls")); });
      t.addEventListener("keydown", function (e) {
        var k = e.key, n = null;
        if (k === "ArrowDown" || k === "ArrowRight") n = tabs[(i + 1) % tabs.length];
        if (k === "ArrowUp" || k === "ArrowLeft") n = tabs[(i - 1 + tabs.length) % tabs.length];
        if (k === "Home") n = tabs[0];
        if (k === "End") n = tabs[tabs.length - 1];
        if (n) { e.preventDefault(); show(n.getAttribute("aria-controls"), { focus: true }); }
      });
    });
    /* Building stack in the hero jumps to a floor */
    $$("[data-floor-jump]").forEach(function (b) {
      b.addEventListener("click", function () {
        show("floor-" + b.getAttribute("data-floor-jump"));
        app.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      });
    });

    /* Search index built from the markup itself */
    var index = [];
    panels.forEach(function (pn) {
      var floorName = pn.getAttribute("data-floor-name");
      $$("[data-unit]", pn).forEach(function (u) { index.push({ name: u.getAttribute("data-unit"), kind: u.getAttribute("data-kind") || "Shop", floor: floorName, panel: pn.id, el: u }); });
    });
    function render(v) {
      var s = v.trim().toLowerCase();
      if (!s) { results.hidden = true; input.setAttribute("aria-expanded", "false"); return; }
      var hits = index.filter(function (r) { return r.name.toLowerCase().indexOf(s) > -1; }).slice(0, 12);
      results.innerHTML = hits.length
        ? hits.map(function (r, i) { return '<li role="option"><button type="button" data-hit="' + i + '">' + esc(r.name) + "<small>" + esc(r.kind) + " · " + esc(r.floor) + "</small></button></li>"; }).join("")
        : '<li class="none">No store or facility matches “' + esc(v.trim()) + '” on the floor map.</li>';
      results.hidden = false; input.setAttribute("aria-expanded", "true");
      $$("[data-hit]", results).forEach(function (b) {
        b.addEventListener("click", function () {
          var r = hits[+b.getAttribute("data-hit")];
          show(r.panel, { force: true });
          results.hidden = true; input.setAttribute("aria-expanded", "false");
          setTimeout(function () {
            r.el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
            r.el.classList.remove("is-hit"); void r.el.offsetWidth; r.el.classList.add("is-hit");
          }, 120);
        });
      });
    }
    if (input && results) {
      input.addEventListener("input", function () { render(input.value); });
      input.addEventListener("keydown", function (e) {
        if (e.key === "Escape") { input.value = ""; render(""); }
        if (e.key === "ArrowDown") { var f = $("button", results); if (f) { e.preventDefault(); f.focus(); } }
      });
      doc.addEventListener("click", function (e) { if (!e.target.closest(".floor-map-search")) { results.hidden = true; input.setAttribute("aria-expanded", "false"); } });
    }

    /* Deep link: floor-map.html#3 opens the 3rd floor */
    var h = location.hash.slice(1);
    var start = h && $('.floor-map-tab[data-floor="' + h + '"]', app);
    show(start ? start.getAttribute("aria-controls") : tabs[0].getAttribute("aria-controls"), { hash: !!start, force: true });
  }

  /* ---- NEWS: category filter over the article list ---- */
  function initNews() {
    var bar = $("#newsFilters"), cards = $$(".news-card");
    if (!bar || !cards.length) return;
    var count = $("#newsCount");
    bar.addEventListener("click", function (e) {
      var b = e.target.closest("button[data-cat]");
      if (!b) return;
      var cat = b.getAttribute("data-cat"), k = 0;
      $$("button[data-cat]", bar).forEach(function (x) { x.setAttribute("aria-pressed", x === b); });
      cards.forEach(function (c) {
        var show = cat === "all" || (c.getAttribute("data-cats") || "").split("|").indexOf(cat) > -1;
        c.classList.toggle("is-hidden", !show);
        c.classList.remove("is-pop");
        if (show && !reduce) { void c.offsetWidth; c.style.animationDelay = (k * 0.05) + "s"; c.classList.add("is-pop"); }
        if (show) k++;
      });
      if (count) count.innerHTML = "Showing <b>" + k + "</b> of " + cards.length + " articles on this page" + (cat === "all" ? "" : " in <b>" + esc(b.getAttribute("data-label")) + "</b>");
      refreshMotion();
    });
  }

  /* ---- CONTACT FORM: client-side validation, honest delivery ----
     No backend ships with this static site. If you add a form service,
     put its endpoint in the form's data-endpoint attribute (it must
     accept a JSON POST). Without one, the form opens the visitor's
     email app with the message ready to send to info@amanahmall.com.pk. */
  function initContactForm() {
    var form = $("#contactForm");
    if (!form) return;
    var status = $("#contactStatus"), submit = $("button[type=submit]", form);
    var rules = {
      name:    function (v) { return v.trim().length >= 2 ? "" : "Please enter your name."; },
      email:   function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? "" : "Please enter a valid email address, like name@example.com."; },
      phone:   function (v) { var d = v.replace(/\D/g, ""); return /^[+\d][\d\s()-]*$/.test(v.trim()) && d.length >= 10 && d.length <= 15 ? "" : "Please enter a valid phone number, for example 0300 1234567 or +92 300 1234567."; },
      message: function (v) { return v.length <= 2000 ? "" : "Please keep your message under 2,000 characters."; }
    };
    function check(field) {
      var rule = rules[field.name]; if (!rule) return true;
      var msg = rule(field.value), err = $("#" + field.id + "-err");
      field.setAttribute("aria-invalid", msg ? "true" : "false");
      if (err) err.textContent = msg;
      return !msg;
    }
    $$("input, textarea", form).forEach(function (f) {
      f.addEventListener("blur", function () { if (f.value || f.required) check(f); });
      f.addEventListener("input", function () { if (f.getAttribute("aria-invalid") === "true") check(f); });
    });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var fields = $$("input, textarea", form), bad = fields.filter(function (f) { return !check(f); });
      status.className = "contact-form-status";
      if (bad.length) {
        status.classList.add("is-error");
        status.innerHTML = "<b>Please check " + (bad.length === 1 ? "1 field" : bad.length + " fields") + ".</b>The highlighted " + (bad.length === 1 ? "field needs" : "fields need") + " attention before you send.";
        bad[0].focus();
        return;
      }
      var data = {}; fields.forEach(function (f) { data[f.name] = f.value.trim(); });
      var endpoint = form.getAttribute("data-endpoint");
      if (endpoint) {
        submit.disabled = true;
        fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json", "Accept": "application/json" }, body: JSON.stringify(data) })
          .then(function (r) { if (!r.ok) throw new Error(r.status); form.reset(); status.classList.add("is-ok"); status.innerHTML = "<b>Thank you, " + esc(data.name) + ".</b>Your inquiry has been sent. Our team will get back to you by email or phone."; })
          .catch(function () { status.classList.add("is-error"); status.innerHTML = "<b>Your message couldn't be sent.</b>Please try again, or email <a href=\"mailto:info@amanahmall.com.pk\">info@amanahmall.com.pk</a>."; })
          .then(function () { submit.disabled = false; status.focus(); });
        return;
      }
      /* No form service configured: hand the message to the visitor's email app */
      var body = "Name: " + data.name + "\nEmail: " + data.email + "\nPhone: " + data.phone + "\n\n" + (data.message || "");
      var href = "mailto:info@amanahmall.com.pk?subject=" + encodeURIComponent("Website inquiry from " + data.name) + "&body=" + encodeURIComponent(body);
      status.classList.add("is-ok");
      status.innerHTML = "<b>Your message is ready to send.</b>We've opened your email app with it addressed to info@amanahmall.com.pk. Nothing is sent until you press send there. If it didn't open, <a href=\"" + href + "\">open it here</a> or call 042 3513 1699.";
      status.focus();
      window.location.href = href;
    });
  }

  /* ---- BOWLING ALLEY: ball rolls down the lane once it scrolls into view ---- */
  function initBowling() {
    var lane = $("#bowlingLane"), again = $("#bowlingReplay");
    if (!lane) return;
    var roll = function () { lane.classList.remove("is-rolling"); void lane.offsetWidth; lane.classList.add("is-rolling"); };
    if (again) again.addEventListener("click", roll);
    if (reduce || !("IntersectionObserver" in window)) return;
    var io = new IntersectionObserver(function (es) {
      if (es[0].isIntersecting) { roll(); io.disconnect(); }
    }, { threshold: 0.6 });
    io.observe(lane);
  }
})();
