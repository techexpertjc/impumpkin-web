// main.js — shared site interactions
import { db } from "./firebase-init.js";
import { collection, addDoc, serverTimestamp, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

// ─── Mobile nav toggle ───
const navToggle = document.querySelector("[data-nav-toggle]");
const header = document.querySelector(".site-header");
if (navToggle && header) {
  navToggle.addEventListener("click", () => header.classList.toggle("is-open"));
}

// ─── Language toggle (stub) ───
// TODO: wire this to a proper i18n system once VI translations are filled in.
// For now it just stores preference in localStorage.
const langToggle = document.querySelector("[data-lang-toggle]");
if (langToggle) {
  langToggle.addEventListener("click", () => {
    const current = localStorage.getItem("lang") || "en";
    const next = current === "en" ? "vi" : "en";
    localStorage.setItem("lang", next);
    // Reload to pick up new language (simplest approach for v1).
    // Later: build /vi/ versions of pages and route accordingly.
    alert(
      next === "vi"
        ? "Tiếng Việt sẽ có sớm! / Vietnamese coming soon — translations being added."
        : "English active."
    );
  });
}

// ─── Newsletter signup (writes to Firestore /newsletter) ───
const newsletterForm = document.getElementById("newsletter-form");
const newsletterStatus = document.querySelector("[data-newsletter-status]");

if (newsletterForm && newsletterStatus) {
  newsletterForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(newsletterForm);
    const email = (formData.get("email") || "").toString().trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showNewsletterStatus("Please enter a valid email.", "error");
      return;
    }

    try {
      // Check if already subscribed (best-effort; may fail if rules block reads — that's OK)
      // Skip duplicate check to keep rules tight; just write.
      await addDoc(collection(db, "newsletter"), {
        email,
        createdAt: serverTimestamp(),
        source: window.location.pathname
      });
      newsletterForm.reset();
      showNewsletterStatus("You're in. Welcome 🌱", "success");
    } catch (err) {
      console.error(err);
      showNewsletterStatus("Couldn't subscribe — try again?", "error");
    }
  });
}

function showNewsletterStatus(message, type) {
  if (!newsletterStatus) return;
  newsletterStatus.textContent = message;
  newsletterStatus.className = `form-status is-${type}`;
}
