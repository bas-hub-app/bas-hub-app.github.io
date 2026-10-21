(function () {
  "use strict";

  
  document.documentElement.classList.add("js");
  if ("IntersectionObserver" in window &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var revealEls = document.querySelectorAll(".shot-frame, .device-frame");
    revealEls.forEach(function (el) { el.setAttribute("data-reveal", ""); });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".main-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  
  var box = document.querySelector(".lightbox");
  if (!box) return;
  var img = box.querySelector("img");
  var cap = box.querySelector("figcaption");
  var closeBtn = box.querySelector(".lb-close");
  var lastFocus = null;

  function open(link) {
    lastFocus = link;
    img.src = link.getAttribute("href");
    img.alt = link.getAttribute("data-alt") || "";
    cap.textContent = link.getAttribute("data-caption") || "";
    box.classList.add("open");
    document.body.style.overflow = "hidden";
    closeBtn.focus();
  }
  function close() {
    box.classList.remove("open");
    img.removeAttribute("src");
    document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  }

  document.querySelectorAll("a[data-lightbox]").forEach(function (link) {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      open(link);
    });
  });
  closeBtn.addEventListener("click", close);
  box.addEventListener("click", function (e) {
    if (e.target === box) close();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && box.classList.contains("open")) close();
  });
})();

(function () {
  "use strict";
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Explore-modules dropdown: CSS alone reveals the panel on hover and
  // focus-within (the no-JS path); this adds click toggle, Esc, arrow
  // keys, and close-on-select. On mobile the panel is a static grouping
  // under its heading, so the toggle stands down there.
  var group = document.querySelector("[data-nav-group]");
  if (group) {
    var gBtn = group.querySelector("[data-nav-group-btn]");
    var gPanel = group.querySelector("[data-nav-dropdown]");
    var gLinks = gPanel.querySelectorAll("a");
    var mobileMq = window.matchMedia("(max-width: 760px)");
    // With JS running, .open alone owns the panel (the CSS hover /
    // focus-within reveal applies only in the no-JS path — see site.css).
    function setOpen(open) {
      group.classList.toggle("open", open);
      gBtn.setAttribute("aria-expanded", open ? "true" : "false");
    }
    function isOpen() { return group.classList.contains("open"); }
    gBtn.addEventListener("click", function () {
      if (mobileMq.matches) return;
      setOpen(!isOpen());
    });
    gBtn.addEventListener("keydown", function (e) {
      if (mobileMq.matches) return;
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        setOpen(true);
        (e.key === "ArrowDown" ? gLinks[0] : gLinks[gLinks.length - 1]).focus();
      }
    });
    gPanel.addEventListener("keydown", function (e) {
      var i = Array.prototype.indexOf.call(gLinks, document.activeElement);
      if (i === -1) return;
      var n = null;
      if (e.key === "ArrowDown") n = (i + 1) % gLinks.length;
      else if (e.key === "ArrowUp") n = (i - 1 + gLinks.length) % gLinks.length;
      else if (e.key === "Home") n = 0;
      else if (e.key === "End") n = gLinks.length - 1;
      else if (e.key === "Tab") { setOpen(false); return; }
      if (n !== null) { e.preventDefault(); gLinks[n].focus(); }
    });
    gLinks.forEach(function (a) {
      a.addEventListener("click", function () { setOpen(false); });
    });
    document.addEventListener("click", function (e) {
      if (isOpen() && !group.contains(e.target)) setOpen(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key !== "Escape") return;
      if (isOpen() || group.contains(document.activeElement)) { setOpen(false); gBtn.focus(); }
    });
    group.addEventListener("focusout", function (e) {
      if (isOpen() && !group.contains(e.relatedTarget)) setOpen(false);
    });
  }

  var palette = document.querySelector("[data-palette]");
  if (palette) {
    var input = palette.querySelector("[data-palette-input]");
    var list = palette.querySelector("[data-palette-list]");
    var lastFocus = null, items = [], sel = 0;

    function dest(hash) {
      return document.querySelector(hash) ? hash : "index.html" + hash;
    }
    var ENTRIES = [
      { kind: "Section", title: "The demo", url: function () { return dest("#demo"); } },
      { kind: "Section", title: "Who it's for — one hub, not a folder of tools", url: function () { return dest("#modules"); } },
      { kind: "Module", title: "Modules — the index", url: function () { return dest("#modules"); } },
      { kind: "Module", title: "On stage — each module in turn", url: function () { return dest("#stage"); } },
      { kind: "Module", title: "The Hub — home screen", url: function () { return dest("#home"); } },
      { kind: "Module", title: "Programmer+ — the PPCL workbench", url: function () { return dest("#programmer"); } },
      { kind: "Module", title: "Network+ — the network workbench", url: function () { return dest("#network"); } },
      { kind: "Module", title: "The device page, taken apart (tour)", url: function () { return dest("#tour"); } },
      { kind: "Module", title: "BAS Copilot — help that stays on the machine", url: function () { return dest("#copilot"); } },
      { kind: "Section", title: "Screenshots — the real app, as shipped", url: function () { return dest("#screenshots"); } },
      { kind: "Section", title: "Help, built in — the topic index", url: function () { return dest("#help"); } },
      { kind: "Section", title: "Download & install", url: function () { return dest("#download"); } },
      { kind: "Action", title: "Check this PC — what this machine runs", url: function () { return dest("#pccheck"); } },
      { kind: "Section", title: "Updates — when you say so", url: function () { return dest("#updates"); } },
      { kind: "Section", title: "Trust, by design", url: function () { return dest("#trust"); } },
      { kind: "Section", title: "FAQ", url: function () { return dest("#faq"); } },
      { kind: "Page", title: "Versions — every release, on the record", url: function () { return "releases.html"; } },
      { kind: "Action", title: "Download — current release 0.9.1", url: function () { return "https://github.com/JacobHamrac/bas-hub-releases/releases/latest"; } },
      { kind: "Support", title: "Report a bug", url: function () { return dest("#support-bug"); } },
      { kind: "Support", title: "Send feedback", url: function () { return dest("#support-feedback"); } }
    ];

    function render(q) {
      items = ENTRIES.filter(function (e) {
        return (e.kind + " " + e.title).toLowerCase().indexOf(q.toLowerCase()) !== -1;
      });
      if (sel >= items.length) sel = Math.max(0, items.length - 1);
      list.innerHTML = "";
      items.forEach(function (e, i) {
        var li = document.createElement("li");
        var b = document.createElement("button");
        b.type = "button";
        b.setAttribute("role", "option");
        if (i === sel) b.classList.add("sel");
        var k = document.createElement("span"); k.className = "pl-kind"; k.textContent = e.kind;
        var t = document.createElement("span"); t.className = "pl-title"; t.textContent = e.title;
        b.appendChild(k); b.appendChild(t);
        b.addEventListener("click", function () { go(e); });
        b.addEventListener("mousemove", function () { if (sel !== i) { sel = i; render(input.value); } });
        li.appendChild(b); list.appendChild(li);
      });
      if (!items.length) {
        var li2 = document.createElement("li");
        li2.style.cssText = "padding:12px;color:var(--text-3);font-size:15px;";
        li2.textContent = "No destination matches that.";
        list.appendChild(li2);
      }
    }
    function go(e) {
      if (!e) return;
      closePalette();
      window.location.href = e.url();
    }
    function openPalette() {
      lastFocus = document.activeElement;
      palette.classList.add("open");
      document.body.style.overflow = "hidden";
      sel = 0; input.value = "";
      render("");
      input.focus();
    }
    function closePalette() {
      palette.classList.remove("open");
      document.body.style.overflow = "";
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }
    document.querySelectorAll("[data-palette-open]").forEach(function (b) {
      b.addEventListener("click", openPalette);
    });
    palette.addEventListener("click", function (e) { if (e.target === palette) closePalette(); });
    input.addEventListener("input", function () { sel = 0; render(input.value); });
    input.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown") { e.preventDefault(); if (sel < items.length - 1) { sel++; render(input.value); } }
      else if (e.key === "ArrowUp") { e.preventDefault(); if (sel > 0) { sel--; render(input.value); } }
      else if (e.key === "Enter") { e.preventDefault(); go(items[sel]); }
    });
    document.addEventListener("keydown", function (e) {
      if ((e.ctrlKey || e.metaKey) && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        if (palette.classList.contains("open")) closePalette(); else openPalette();
      } else if (e.key === "Escape" && palette.classList.contains("open")) {
        closePalette();
      }
    });
  }

  
  var stage = document.querySelector("[data-stage]");
  if (stage && "IntersectionObserver" in window) {
    var sImg = stage.querySelector("[data-stage-img]");
    var sEye = stage.querySelector("[data-stage-eyebrow]");
    var sCap = stage.querySelector("[data-stage-cap]");
    var bars = stage.querySelectorAll(".stage-progress i");
    var steps = stage.querySelectorAll("[data-stage-step]");
    steps.forEach(function (st) { var im = new Image(); im.src = st.getAttribute("data-img"); });
    var current = -1;
    function activate(i) {
      if (i === current) return;
      current = i;
      var st = steps[i];
      sImg.src = st.getAttribute("data-img");
      sEye.textContent = st.getAttribute("data-eyebrow");
      sCap.innerHTML = st.getAttribute("data-cap");
      bars.forEach(function (b, j) { b.classList.toggle("on", j === i); });
    }
    var sio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) activate(Array.prototype.indexOf.call(steps, en.target));
      });
    }, { rootMargin: "-42% 0px -42% 0px" });
    steps.forEach(function (st) { sio.observe(st); });
  }

  
  var tour = document.querySelector("[data-tour]");
  if (tour) {
    var TOUR = [
      { title: "Identity and state", body: "The page leads with what the device is and whether it is answering: its name, protocol, address, and model \u2014 here a BACnet controller, device 100204 at 192.168.14.21 \u2014 and a state card that says how it was found and when it last answered. Values on this page are read live from the device, labelled with how they were read." },
      { title: "The health axes", body: "Connected, Performing, Clean \u2014 the three axes of the 40-check health catalog, carried on the device\u2019s own page. An axis fills in when a health run has evidence for it; until then it says Not measured yet instead of guessing. The health check fills these in, and this device\u2019s slice lands here with its findings." },
      { title: "Look \u2014 points, schedules, history", body: "Everything the controller reports, live, in plain units: points and values, the schedule and calendar as the device itself reports them, and trend history \u2014 graphs first, tables second, exportable with the report. A Modbus device\u2019s page reads its registers the same way; an OPC UA device shows its endpoints the same way." },
      { title: "Watch & Check", body: "Watch these points move, or open Watch filtered to this device \u2014 its questions, answers, and announcements in plain sentences. \u201CWhy is this device offline?\u201D runs the evidence: name, ping, switch testimony, and this laptop as witness, landing on one verdict card. Audit lists out-of-service points, stale flags, and held priorities as sentences." },
      { title: "Change & Talk \u2014 the only door that writes", body: "Commanding lives here, and only here: a command opens the points list and the change itself goes through the safety path \u2014 preview \u2192 backup \u2192 confirm \u2192 log. Prove runs a checkout plan in the Test Bench; the console opens SSH, Telnet, or serial prefilled from this record, the host key judged before any password; and a baseline saves how this device should look, so the next visit can flag what moved." }
    ];
    var btns = tour.querySelectorAll("[data-tour-btn]");
    var tEye = tour.querySelector("[data-tour-eyebrow]");
    var tTitle = tour.querySelector("[data-tour-title]");
    var tBody = tour.querySelector("[data-tour-body]");
    function showTour(i) {
      btns.forEach(function (b, j) { b.setAttribute("aria-pressed", j === i ? "true" : "false"); });
      tEye.textContent = "Callout " + (i + 1) + " of " + TOUR.length;
      tTitle.textContent = TOUR[i].title;
      tBody.textContent = TOUR[i].body;
    }
    btns.forEach(function (b, i) {
      b.addEventListener("click", function () { showTour(i); });
      b.addEventListener("keydown", function (e) {
        var n = null;
        if (e.key === "ArrowRight" || e.key === "ArrowDown") n = (i + 1) % btns.length;
        if (e.key === "ArrowLeft" || e.key === "ArrowUp") n = (i - 1 + btns.length) % btns.length;
        if (n !== null) { e.preventDefault(); btns[n].focus(); showTour(n); }
      });
    });
  }

  
  var lab = document.querySelector("[data-tier-lab]");
  if (lab) {
    var ramBtns = lab.querySelectorAll("[data-ram]");
    var cards = lab.querySelectorAll(".tier-card");
    function setRam(ram) {
      var best = null;
      cards.forEach(function (c) {
        var min = parseInt(c.getAttribute("data-minram"), 10);
        c.classList.remove("offered", "locked", "recommended");
        var st = c.querySelector(".tc-state");
        if (min <= ram) { c.classList.add("offered"); st.textContent = "Offered by Setup"; best = c; }
        else { c.classList.add("locked"); st.textContent = "Locked \u2014 needs " + min + " GB RAM"; }
      });
      if (best) {
        best.classList.remove("offered");
        best.classList.add("recommended");
        best.querySelector(".tc-state").textContent = "Setup\u2019s pick for " + ram + " GB";
      }
      ramBtns.forEach(function (b) {
        b.setAttribute("aria-pressed", parseInt(b.getAttribute("data-ram"), 10) === ram ? "true" : "false");
      });
    }
    ramBtns.forEach(function (b) {
      b.addEventListener("click", function () { setRam(parseInt(b.getAttribute("data-ram"), 10)); });
    });
  }

  
  var film = document.querySelector("[data-film]");
  if (film) {
    var posterLink = film.querySelector(".film-poster");
    var frame = film.closest(".device-frame");
    var stopBtn = null;
    posterLink.addEventListener("click", function (e) {
      e.preventDefault();
      var img = document.createElement("img");
      img.className = "film-img";
      img.src = film.getAttribute("data-gif");
      img.alt = film.getAttribute("data-alt");
      img.width = 1000; img.height = 649;
      film.replaceChild(img, posterLink);
      stopBtn = document.createElement("button");
      stopBtn.type = "button";
      stopBtn.className = "film-stop";
      stopBtn.textContent = "\u25A0 Stop the demo";
      stopBtn.addEventListener("click", function () {
        film.replaceChild(posterLink, img);
        stopBtn.remove(); stopBtn = null;
        posterLink.focus();
      });
      frame.parentNode.insertBefore(stopBtn, frame.nextSibling);
    });
  }

  
  var hInput = document.querySelector("[data-help-filter]");
  if (hInput) {
    var hIndex = document.querySelector("[data-help-index]");
    var hCount = document.querySelector("[data-help-count]");
    var hNone = document.querySelector("[data-help-none]");
    var rows = hIndex.querySelectorAll("[data-help-row]");
    var groups = hIndex.querySelectorAll(".help-group");
    var total = rows.length;
    hInput.addEventListener("input", function () {
      var q = hInput.value.trim().toLowerCase();
      var visible = 0;
      rows.forEach(function (r) {
        var show = !q || r.textContent.toLowerCase().indexOf(q) !== -1;
        r.style.display = show ? "" : "none";
        if (show) visible++;
      });
      groups.forEach(function (g) {
        var n = g.nextElementSibling, any = false;
        while (n && !n.classList.contains("help-group") && !n.hasAttribute("data-help-none")) {
          if (n.hasAttribute("data-help-row") && n.style.display !== "none") any = true;
          n = n.nextElementSibling;
        }
        g.style.display = any ? "" : "none";
      });
      hNone.style.display = visible === 0 ? "block" : "none";
      hCount.textContent = q
        ? visible + " of " + total + " topics match \u201C" + hInput.value.trim() + "\u201D"
        : total + " topics \u2014 the complete index, as shipped in 0.9.1";
    });
  }

  
  document.querySelectorAll("[data-issue-form]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var params = new URLSearchParams();
      new FormData(form).forEach(function (v, k) {
        if (String(v).trim() !== "") params.set(k, v);
      });
      window.open(form.action + "?" + params.toString(), "_blank", "noopener");
    });
  });
})();

(function () {
  "use strict";

  // Check this PC: what this browser reports about the machine, answered
  // against the product's own rules — Setup's hardware read and the
  // D-033 tier gate (a tier is offered when the machine's memory class
  // reaches the tier's minimum; Setup reads the real figure). Everything
  // runs on this page: nothing is sent, stored, or recorded. Where the
  // browser cannot know — exact memory above its capped report, an
  // architecture it does not offer — the row says so and defers to
  // Setup. No value here is ever guessed.
  var wrap = document.querySelector("[data-pccheck]");
  if (!wrap) return;
  wrap.hidden = false;

  var runBtn = wrap.querySelector("[data-pccheck-run]");
  var results = wrap.querySelector("[data-pccheck-results]");
  var summary = wrap.querySelector("[data-pccheck-summary]");

  // Tier names and memory minimums: the product's catalog, verbatim
  // (src/BasHub.Platform/TierCatalog.cs).
  var TIERS = [
    { name: "Field Helper", min: 4 },
    { name: "Standard", min: 8 },
    { name: "Solid", min: 16 },
    { name: "Workshop", min: 32 }
  ];

  function cell(name) { return wrap.querySelector('[data-pccell="' + name + '"]'); }
  function makeTag(text, cls) {
    var s = document.createElement("span");
    s.className = "pc-tag " + cls;
    s.textContent = text;
    return s;
  }
  function set(name, text, tagText, tagCls) {
    var c = cell(name);
    c.textContent = text;
    if (tagText) c.appendChild(makeTag(tagText, tagCls));
  }

  function osFromUA(ua) {
    if (/Windows NT 10/.test(ua)) return { key: "windows", label: "Windows 10 / 11" };
    if (/Windows NT/.test(ua)) return { key: "windows", label: "Windows (older release)" };
    if (/Android/.test(ua)) return { key: "other", label: "Android" };
    if (/(iPhone|iPad|iPod)/.test(ua)) return { key: "other", label: "iOS" };
    if (/CrOS/.test(ua)) return { key: "other", label: "ChromeOS" };
    if (/Mac OS X|Macintosh/.test(ua)) return { key: "macos", label: "macOS" };
    if (/Linux/.test(ua)) return { key: "linux", label: "Linux" };
    return { key: "unknown", label: "Not reported" };
  }

  function detect() {
    var base = {
      os: osFromUA(navigator.userAgent || ""),
      arch: { label: "Not reported by this browser", known: false, isArm: false, is32: false },
      cores: (typeof navigator.hardwareConcurrency === "number" && navigator.hardwareConcurrency > 0)
        ? navigator.hardwareConcurrency : null,
      dm: (typeof navigator.deviceMemory === "number" && navigator.deviceMemory > 0)
        ? navigator.deviceMemory : null
    };
    var uad = navigator.userAgentData;
    if (!uad || typeof uad.getHighEntropyValues !== "function") {
      return Promise.resolve(base);
    }
    var he = uad.getHighEntropyValues(["platform", "platformVersion", "architecture", "bitness"])
      .then(function (v) {
        if (v.platform === "Windows") {
          var major = parseInt(v.platformVersion, 10);
          if (!isNaN(major) && major >= 13) base.os = { key: "windows", label: "Windows 11" };
          else if (!isNaN(major) && major >= 1) base.os = { key: "windows", label: "Windows 10" };
          else base.os = { key: "windows", label: "Windows" };
        } else if (v.platform === "macOS") {
          base.os = { key: "macos", label: v.platformVersion ? "macOS " + v.platformVersion : "macOS" };
        } else if (v.platform === "Linux") {
          base.os = { key: "linux", label: "Linux" };
        } else if (v.platform === "Chrome OS") {
          base.os = { key: "other", label: "ChromeOS" };
        } else if (v.platform === "Android") {
          base.os = { key: "other", label: "Android" };
        }
        if (v.architecture === "x86" && v.bitness === "64") {
          base.arch = { label: "x64", known: true, isArm: false, is32: false };
        } else if (v.architecture === "arm" && v.bitness === "64") {
          base.arch = { label: "ARM64", known: true, isArm: true, is32: false };
        } else if (v.bitness === "32" || v.architecture === "x86" || v.architecture === "arm") {
          base.arch = { label: "32-bit", known: true, isArm: false, is32: true };
        }
        return base;
      })
      .catch(function () { return base; });
    var timeout = new Promise(function (resolve) { setTimeout(function () { resolve(base); }, 1200); });
    return Promise.race([he, timeout]);
  }

  function clearHighlight() {
    document.querySelectorAll(".release-card tr.pc-rec").forEach(function (tr) {
      tr.classList.remove("pc-rec");
    });
    document.querySelectorAll(".release-card .pc-this").forEach(function (el) { el.remove(); });
  }

  function highlight(pkgKey, tagText) {
    if (!pkgKey) return;
    var tr = document.querySelector('.release-card tr[data-pkg="' + pkgKey + '"]');
    if (!tr) return;
    tr.classList.add("pc-rec");
    tr.scrollIntoView({ block: "nearest", behavior: "auto" });
    var statusCell = tr.querySelector("td:last-child");
    var s = document.createElement("span");
    s.className = "pc-this";
    s.textContent = tagText;
    statusCell.appendChild(s);
  }

  function render(d) {
    clearHighlight();

    // --- Operating system ---
    var osV;
    if (d.os.key === "windows") osV = "Windows package below";
    else if (d.os.key === "linux") osV = "Linux package below";
    else if (d.os.key === "unknown") osV = "Packages: Windows, Linux";
    else osV = "No package — Windows and Linux only";
    set("os", d.os.label, d.os.key === "unknown" ? "Not reported" : "Reported", d.os.key === "unknown" ? "" : "reported");
    set("os-v", osV);

    // --- Architecture ---
    var archV;
    if (!d.arch.known) {
      archV = d.os.key === "windows" ? "Pick x64 or ARM64 at download — Setup verifies"
        : d.os.key === "linux" ? "The Linux package is x64"
        : "—";
      set("arch", d.arch.label, "Not reported", "");
    } else if (d.arch.is32) {
      archV = "BAS Hub is 64-bit only";
      set("arch", d.arch.label, "Reported", "reported");
    } else if (d.arch.isArm) {
      archV = d.os.key === "windows" ? "The ARM64 build — in preparation"
        : d.os.key === "linux" ? "The Linux package is x64 — no ARM64 Linux build"
        : "—";
      set("arch", d.arch.label, "Reported", "reported");
    } else {
      archV = d.os.key === "macos" || d.os.key === "other" ? "—" : "The x64 build";
      set("arch", d.arch.label, "Reported", "reported");
    }
    set("arch-v", archV);

    // --- Processor ---
    if (d.cores) {
      set("cores", d.cores + (d.cores === 1 ? " logical core" : " logical cores"), "Reported", "reported");
    } else {
      set("cores", "Not reported by this browser", "Not reported", "");
    }
    set("cores-v", "No minimum set");

    // --- Memory: the browser's figure is a class, never an exact size ---
    var tiersInClass = [], tiersAbove = [];
    if (d.dm === null) {
      set("ram", "Not reported by this browser", "Not reported", "");
      var rv0 = cell("ram-v");
      rv0.textContent = "Every tier: ";
      rv0.appendChild(makeTag("Confirmed by the installer", "installer"));
    } else {
      TIERS.forEach(function (t) {
        if (t.min <= d.dm) tiersInClass.push(t.name); else tiersAbove.push(t.name);
      });
      var dmLabel = d.dm >= 8
        ? "8 GB class or more — this browser caps its report at 8"
        : (d.dm >= 1 ? d.dm + " GB class" : "Under 1 GB class");
      set("ram", dmLabel, "Reported", "reported");
      var rv = cell("ram-v");
      rv.textContent = "";
      if (tiersInClass.length && tiersAbove.length) {
        rv.appendChild(document.createTextNode(tiersInClass.join(", ") + ": in class. " + tiersAbove.join(", ") + ": "));
        rv.appendChild(makeTag("Confirmed by the installer", "installer"));
      } else if (tiersAbove.length) {
        rv.appendChild(document.createTextNode("No Copilot tier starts below the 4 GB class — the Hub itself sets no memory minimum. Tiers: "));
        rv.appendChild(makeTag("Confirmed by the installer", "installer"));
      } else {
        rv.appendChild(document.createTextNode("Every tier: in class."));
      }
    }

    // --- Recommendation + highlight ---
    var parts = [d.os.label];
    if (d.arch.known && !d.arch.is32) parts.push(d.arch.label);
    if (d.cores) parts.push(d.cores + " logical cores");
    if (d.dm !== null) parts.push(d.dm >= 8 ? "memory in the 8 GB class or above" : "memory in the " + d.dm + " GB class");
    var sentence;
    if (d.arch.is32) {
      sentence = "BAS Hub is 64-bit only — no package for this machine.";
    } else if (d.os.key === "windows") {
      if (d.arch.isArm) {
        sentence = "Your download: the Windows package (x64) — the native ARM64 build is in preparation; x64 runs under Windows emulation, as your explicit choice.";
        highlight("windows", "This machine · ARM64 build");
      } else if (d.arch.known) {
        sentence = "Your download: the Windows package (x64).";
        highlight("windows", "This machine");
      } else {
        sentence = "Your download: the Windows package — this browser did not report x64 or ARM64.";
        highlight("windows", "This machine · architecture not reported");
      }
    } else if (d.os.key === "linux") {
      if (d.arch.isArm) {
        sentence = "The Linux package is x64 — no package for this machine's architecture.";
        highlight("linux", "This machine · Linux package is x64");
      } else {
        sentence = "Your download: the Linux package.";
        highlight("linux", "This machine");
      }
    } else if (d.os.key === "unknown") {
      sentence = "This browser reported too little to name a package — the packages are Windows and Linux.";
    } else {
      sentence = "BAS Hub runs on Windows and Linux — no package for this OS.";
    }
    summary.textContent = "This machine: " + parts.join(" · ") + ". " + sentence;

    results.hidden = false;
    runBtn.textContent = "Run it again";
    summary.focus({ preventScroll: true });
    wrap.scrollIntoView({ block: "nearest", behavior: "auto" });
  }

  runBtn.addEventListener("click", function () {
    detect().then(render);
  });
})();
