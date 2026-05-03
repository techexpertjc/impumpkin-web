// blogs-atlas.js — orchestrates the journey/atlas page animations
// Loaded only on /blogs/.
//
// What happens on scroll:
//   1. Route segment between previous and current destination draws progressively
//   2. A small plane flies along the route
//   3. Pin "drops" at the destination with a back-out bounce
//   4. The dest-content card and polaroid animate in
//   5. Stamp + ticket reveal at the end

const GSAP_CDN  = "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js";
const ST_CDN    = "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js";
const MP_CDN    = "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/MotionPathPlugin.min.js";

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = src; s.onload = () => resolve(); s.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(s);
  });
}

(async function init() {
  try {
    await loadScript(GSAP_CDN);
    await loadScript(ST_CDN);
    await loadScript(MP_CDN);
  } catch (e) {
    console.warn("GSAP failed to load — atlas animations disabled.", e);
    return;
  }

  const { gsap, ScrollTrigger, MotionPathPlugin } = window;
  gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

  // ─── Pre-set every route path to be invisible ───
  document.querySelectorAll(".route, .route-glow").forEach((path) => {
    const length = path.getTotalLength();
    path.style.strokeDasharray = length;
    path.style.strokeDashoffset = length;
  });

  gsap.set("#plane", { opacity: 0 });

  // ─── Intro entry animation ───
  gsap.from(".atlas-intro-eyebrow", { opacity: 0, y: 20, duration: 1, delay: 0.2, ease: "power2.out" });
  gsap.from(".atlas-intro-title",   { opacity: 0, y: 40, duration: 1.6, delay: 0.4, ease: "power3.out" });
  gsap.from(".atlas-intro-sub",     { opacity: 0, y: 20, duration: 1, delay: 1.2, ease: "power2.out" });
  gsap.from(".atlas-intro-byline",  { opacity: 0, duration: 1.2, delay: 1.7, ease: "power2.out" });
  gsap.from(".atlas-intro-scroll",  { opacity: 0, duration: 1.2, delay: 2.2, ease: "power2.out" });

  // ─── Per-section animations ───
  const sections = gsap.utils.toArray(".atlas-dest");

  sections.forEach((section) => {
    const countryName = section.dataset.country;
    const content  = section.querySelector(".atlas-dest-content");
    const photoStage = section.querySelector(".atlas-dest-photo-stage");
    const polaroid = photoStage?.querySelector(".atlas-polaroid");
    const stamp    = photoStage?.querySelector(".atlas-stamp");
    const ticket   = photoStage?.querySelector(".atlas-ticket");
    const contentChildren = content ? content.children : [];

    let played = false;

    ScrollTrigger.create({
      trigger: section,
      start: "top 65%",
      end: "bottom 35%",
      onEnter: () => animate(),
      onEnterBack: () => animate(),
    });

    function animate() {
      if (played) return;
      played = true;
      const tl = gsap.timeline();

      // 1. Drop all pins for this country
      const countryPins = document.querySelectorAll(`.pin-group[data-country="${countryName}"]`);
      countryPins.forEach((pin, idx) => {
        if (!pin.classList.contains("visible")) {
          pin.classList.add("visible");
          tl.fromTo(pin,
            { opacity: 0, scale: 0, transformOrigin: "center" },
            { opacity: 1, scale: 1, duration: 0.8, ease: "back.out(2.4)" },
            idx * 0.15 // Stagger pins slightly
          );
        }
      });

      // 2. Reveal dest-content (text card)
      if (contentChildren.length) {
        tl.to(contentChildren, {
          opacity: 1,
          y: 0,
          duration: 0.9,
          stagger: 0.08,
          ease: "power3.out"
        }, 0.2);
      }

      // 3. Polaroid entry
      if (polaroid) {
        tl.fromTo(polaroid,
          { opacity: 0, y: 50, rotation: -8, scale: 0.92 },
          { opacity: 1, y: 0, rotation: -3, scale: 1, duration: 1.1, ease: "power3.out" },
          0.6
        );
      }

      // 4. Stamp + ticket
      if (stamp) {
        tl.fromTo(stamp,
          { opacity: 0, scale: 1.6 },
          { opacity: 0.78, scale: 1, duration: 0.4, ease: "power4.out" },
          1.3
        );
      }
      if (ticket) {
        tl.fromTo(ticket,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" },
          1.0
        );
      }
    }
  });

  // ─── Outro animation ───
  ScrollTrigger.create({
    trigger: ".atlas-outro",
    start: "top 65%",
    onEnter: () => {
      gsap.from(".atlas-outro-stat",      { opacity: 0, y: 20, duration: 1, ease: "power2.out" });
      gsap.from(".atlas-outro-title",     { opacity: 0, y: 30, duration: 1.4, delay: 0.2, ease: "power3.out" });
      gsap.from(".atlas-outro-stats > *", { opacity: 0, y: 30, duration: 1, delay: 0.6, stagger: 0.15, ease: "power3.out" });
      gsap.from(".atlas-outro-sign",      { opacity: 0, duration: 1.2, delay: 1.4, ease: "power2.out" });
    }
  });

  // ─── Progress dots + page numbers ───
  const allSteps = gsap.utils.toArray(".atlas-snap section");
  const progressDots = document.querySelectorAll(".atlas-progress-dot");
  const pageNumEl = document.getElementById("atlas-page-num");
  const romanPages = ["— i —", "— ii —", "— iii —", "— iv —", "— v —", "— vi —", "— vii —", "— viii —", "— ix —", "— x —", "— xi —", "— xii —"];

  allSteps.forEach((sec, i) => {
    ScrollTrigger.create({
      trigger: sec,
      start: "top 50%",
      end: "bottom 50%",
      onToggle: (self) => {
        if (!self.isActive) return;
        progressDots.forEach((d, idx) => {
          d.classList.toggle("active", idx === i);
          d.classList.toggle("passed", idx < i);
        });
        if (pageNumEl) {
          pageNumEl.style.opacity = "0";
          setTimeout(() => {
            pageNumEl.textContent = romanPages[i] || `— ${i + 1} —`;
            pageNumEl.style.opacity = "1";
          }, 200);
        }
      }
    });
  });

  // ─── Subtle compass rotation as user scrolls ───
  gsap.to(".compass", {
    rotation: 360,
    transformOrigin: "50% 50%",
    ease: "none",
    scrollTrigger: { trigger: "body", start: "top top", end: "bottom bottom", scrub: 1.5 }
  });

  // ─── Map breathing parallax ───
  gsap.to(".world-map", {
    scale: 1.03,
    ease: "none",
    scrollTrigger: { trigger: "body", start: "top top", end: "bottom bottom", scrub: 2 }
  });

  window.addEventListener("load", () => ScrollTrigger.refresh());

  // ─── Country Detail Zoom ───
  const countryDetailOverlay = document.getElementById("country-detail-overlay");
  const countryDetailClose = document.getElementById("country-detail-close");
  const snapContainer = document.querySelector(".atlas-snap");
  const countryCtaButtons = document.querySelectorAll("[data-country-cta]");

  countryCtaButtons.forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const countryName = btn.dataset.countryCta;
      showCountryDetail(countryName);
    });
  });

  if (countryDetailClose) {
    countryDetailClose.addEventListener("click", hideCountryDetail);
  }

  function showCountryDetail(countryName) {
    // Find the country section to get its bounds
    const countrySection = document.querySelector(`.atlas-dest[data-country="${countryName}"]`);

    if (countrySection && countrySection.dataset.bounds) {
      const bounds = JSON.parse(countrySection.dataset.bounds);

      // Add padding
      const padding = 100;
      const width = (bounds.maxX - bounds.minX) + padding * 2;
      const height = (bounds.maxY - bounds.minY) + padding * 2;

      // Calculate zoom scale (limit to 2.5x max zoom)
      const scaleX = 968.2 / width;
      const scaleY = 506.2 / height;
      const scale = Math.min(scaleX, scaleY, 2.5);

      // Calculate new viewBox
      const newWidth = 968.2 / scale;
      const newHeight = 506.2 / scale;
      const newX = bounds.centerX - newWidth / 2;
      const newY = bounds.centerY - newHeight / 2;

      // Zoom the map
      const worldMap = document.querySelector(".world-map");
      if (worldMap) {
        gsap.to(worldMap, {
          attr: { viewBox: `${newX} ${newY} ${newWidth} ${newHeight}` },
          duration: 1.2,
          ease: "power2.inOut"
        });
      }
    }

    // Hide scroll-snap container
    if (snapContainer) {
      gsap.to(snapContainer, { opacity: 0, duration: 0.4, onComplete: () => {
        snapContainer.style.display = "none";
      }});
    }

    // Show overlay and detail view
    if (countryDetailOverlay) {
      countryDetailOverlay.style.display = "block";
      gsap.fromTo(countryDetailOverlay, { opacity: 0 }, { opacity: 1, duration: 0.8, delay: 0.4 });
    }

    // Show the specific country's detail view
    const allDetailViews = document.querySelectorAll(".country-detail-view");
    allDetailViews.forEach(view => {
      if (view.dataset.country === countryName) {
        view.classList.add("active");
        gsap.fromTo(view, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, delay: 0.8 });
      } else {
        view.classList.remove("active");
      }
    });

    // Disable scroll snap
    document.body.style.overflow = "auto";
  }

  function hideCountryDetail() {
    // Zoom map back to original viewBox
    const worldMap = document.querySelector(".world-map");
    if (worldMap) {
      gsap.to(worldMap, {
        attr: { viewBox: "-4.1 0.4 968.2 506.2" },
        duration: 1.2,
        ease: "power2.inOut"
      });
    }

    // Hide overlay
    if (countryDetailOverlay) {
      gsap.to(countryDetailOverlay, { opacity: 0, duration: 0.4, onComplete: () => {
        countryDetailOverlay.style.display = "none";
      }});
    }

    // Show scroll-snap container
    if (snapContainer) {
      snapContainer.style.display = "block";
      gsap.to(snapContainer, { opacity: 1, duration: 0.6, delay: 0.4 });
    }

    // Re-enable scroll snap
    document.body.style.overflow = "";

    // Hide all detail views
    const allDetailViews = document.querySelectorAll(".country-detail-view");
    allDetailViews.forEach(view => view.classList.remove("active"));
  }

})();
