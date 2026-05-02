// parallax.js — home page parallax scenes
// Loads GSAP from CDN and animates each .scene-featured.

const GSAP_CDN = "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js";
const ST_CDN = "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js";

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = src;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(s);
  });
}

(async function init() {
  try {
    await loadScript(GSAP_CDN);
    await loadScript(ST_CDN);
  } catch (e) {
    console.warn("GSAP failed to load — parallax disabled.", e);
    return;
  }

  const { gsap, ScrollTrigger } = window;
  gsap.registerPlugin(ScrollTrigger);

  const scenes = gsap.utils.toArray(".scene-featured");
  if (!scenes.length) return;

  scenes.forEach((scene) => {
    const sky   = scene.querySelector(".layer-sky");
    const far   = scene.querySelector(".layer-far");
    const mid   = scene.querySelector(".layer-mid");
    const front = scene.querySelector(".layer-front");
    const title = scene.querySelector(".scene-title h2");
    const meta  = scene.querySelector(".scene-meta");
    const info  = scene.querySelector(".scene-info");

    // initial states
    gsap.set(sky,   { opacity: 0 });
    gsap.set(far,   { opacity: 0, y: 80 });
    gsap.set(mid,   { opacity: 0, y: 140 });
    gsap.set(front, { opacity: 0, y: 200 });
    if (title) gsap.set(title, { opacity: 0, y: 60, scale: 1.05 });
    if (meta)  gsap.set(meta, { opacity: 0, y: -16 });
    if (info)  gsap.set(info.children, { opacity: 0, y: 20 });

    ScrollTrigger.create({
      trigger: scene,
      start: "top 70%",
      onEnter: () => {
        const tl = gsap.timeline();
        tl.to(sky,   { opacity: 1, duration: 1.0, ease: "power2.out" }, 0)
          .to(far,   { opacity: 1, y: 0, duration: 1.3, ease: "power3.out" }, 0.05)
          .to(title, { opacity: 1, y: 0, scale: 1, duration: 1.3, ease: "power3.out" }, 0.2)
          .to(mid,   { opacity: 1, y: 0, duration: 1.1, ease: "power3.out" }, 0.3)
          .to(front, { opacity: 1, y: 0, duration: 1.0, ease: "power3.out" }, 0.45)
          .to(meta,  { opacity: 0.7, y: 0, duration: 0.8, ease: "power2.out" }, 0.65)
          .to(info ? info.children : [],  { opacity: 1, y: 0, duration: 0.8, stagger: 0.08, ease: "power2.out" }, 0.75);
      },
      once: true
    });

    // Subtle scroll-driven parallax within the scene
    gsap.to(far, {
      yPercent: -8,
      ease: "none",
      scrollTrigger: { trigger: scene, start: "top bottom", end: "bottom top", scrub: true }
    });
    gsap.to(title, {
      yPercent: -16,
      ease: "none",
      scrollTrigger: { trigger: scene, start: "top bottom", end: "bottom top", scrub: true }
    });
    gsap.to(mid, {
      yPercent: 4,
      ease: "none",
      scrollTrigger: { trigger: scene, start: "top bottom", end: "bottom top", scrub: true }
    });
  });

  // Mouse parallax (subtle)
  let mx = 0, my = 0;
  window.addEventListener("mousemove", (e) => {
    mx = (e.clientX / window.innerWidth - 0.5) * 2;
    my = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  function tick() {
    scenes.forEach((scene) => {
      const sky = scene.querySelector(".layer-sky");
      const far = scene.querySelector(".layer-far");
      const title = scene.querySelector(".scene-title");
      const mid = scene.querySelector(".layer-mid");
      const front = scene.querySelector(".layer-front");
      gsap.to(sky,   { x: mx * -4, y: my * -2, duration: 1, overwrite: "auto" });
      gsap.to(far,   { x: mx * -10, duration: 1, overwrite: "auto" });
      gsap.to(title, { x: mx * -16, duration: 1, overwrite: "auto" });
      gsap.to(mid,   { x: mx * -22, duration: 1, overwrite: "auto" });
      gsap.to(front, { x: mx * -32, duration: 1, overwrite: "auto" });
    });
    requestAnimationFrame(tick);
  }
  tick();

  window.addEventListener("load", () => ScrollTrigger.refresh());
})();
