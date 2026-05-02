// gallery.js — tab filtering and lightbox
const tabs = document.querySelectorAll(".gallery-tab");
const items = document.querySelectorAll(".gallery-item");
const lightbox = document.querySelector("[data-lightbox]");
const lightboxImage = lightbox?.querySelector(".lightbox-image");
const lightboxCaption = lightbox?.querySelector(".lightbox-caption");
const lightboxClose = lightbox?.querySelector(".lightbox-close");
const lightboxPrev = lightbox?.querySelector(".lightbox-prev");
const lightboxNext = lightbox?.querySelector(".lightbox-next");

let currentIndex = 0;
let visibleItems = [];

// ─── Tab filtering ───
tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const filter = tab.dataset.tab;
    tabs.forEach((t) => t.classList.toggle("is-active", t === tab));
    items.forEach((item) => {
      const matches = filter === "all" || item.dataset.tab === filter;
      item.classList.toggle("is-hidden", !matches);
    });
    refreshVisibleItems();
  });
});

function refreshVisibleItems() {
  visibleItems = Array.from(items).filter((it) => !it.classList.contains("is-hidden"));
}
refreshVisibleItems();

// ─── Lightbox ───
items.forEach((item) => {
  item.addEventListener("click", (e) => {
    e.preventDefault();
    refreshVisibleItems();
    currentIndex = visibleItems.indexOf(item);
    openLightbox();
  });
});

function openLightbox() {
  if (!lightbox || !visibleItems[currentIndex]) return;
  const item = visibleItems[currentIndex];
  const src = item.getAttribute("href");
  const caption = item.dataset.caption || "";
  lightboxImage.src = src;
  lightboxImage.alt = caption;
  lightboxCaption.textContent = caption;
  lightbox.classList.add("is-open");
  lightbox.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}
function closeLightbox() {
  if (!lightbox) return;
  lightbox.classList.remove("is-open");
  lightbox.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}
function nextImage() {
  if (!visibleItems.length) return;
  currentIndex = (currentIndex + 1) % visibleItems.length;
  openLightbox();
}
function prevImage() {
  if (!visibleItems.length) return;
  currentIndex = (currentIndex - 1 + visibleItems.length) % visibleItems.length;
  openLightbox();
}

lightboxClose?.addEventListener("click", closeLightbox);
lightboxNext?.addEventListener("click", nextImage);
lightboxPrev?.addEventListener("click", prevImage);
lightbox?.addEventListener("click", (e) => { if (e.target === lightbox) closeLightbox(); });
document.addEventListener("keydown", (e) => {
  if (!lightbox?.classList.contains("is-open")) return;
  if (e.key === "Escape") closeLightbox();
  if (e.key === "ArrowRight") nextImage();
  if (e.key === "ArrowLeft") prevImage();
});
