// contact-form.js — submits the contact form to Firestore /messages
import { db } from "./firebase-init.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

const form = document.getElementById("contact-form");
const statusEl = document.querySelector("[data-form-status]");
const submitBtn = form?.querySelector("button[type='submit']");
const submitText = form?.querySelector("[data-submit-text]");
const sendingText = form?.querySelector("[data-sending-text]");

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(form);

    // honeypot — spambot trap
    if ((fd.get("website") || "").toString().trim() !== "") {
      // silently "succeed" to avoid signaling
      showStatus("Thank you — I'll write back soon.", "success");
      form.reset();
      return;
    }

    const payload = {
      name: (fd.get("name") || "").toString().trim(),
      email: (fd.get("email") || "").toString().trim().toLowerCase(),
      message: (fd.get("message") || "").toString().trim(),
      createdAt: serverTimestamp(),
      userAgent: navigator.userAgent,
      page: window.location.pathname
    };

    if (!payload.name || !payload.email || !payload.message) {
      showStatus("Please fill in all fields.", "error");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
      showStatus("Please enter a valid email.", "error");
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, "messages"), payload);
      form.reset();
      showStatus("Thank you — I'll write back soon.", "success");
    } catch (err) {
      console.error(err);
      showStatus("Something went wrong. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  });
}

function setLoading(loading) {
  if (!submitBtn) return;
  submitBtn.disabled = loading;
  if (submitText) submitText.hidden = loading;
  if (sendingText) sendingText.hidden = !loading;
}

function showStatus(message, type) {
  if (!statusEl) return;
  statusEl.textContent = message;
  statusEl.className = `form-status is-${type}`;
}
