module.exports = {
  // ─── Basic site info ───
  title: "Pumpkin Travels",
  tagline: "Stories from a girl, a passport, and too much curiosity.",
  description:
    "Travel blog of Bao Ngoc (Pumpkin) — Vietnamese social media marketer chasing cultures, food, and quiet places across the world.",
  author: {
    name: "Bao Ngoc",
    nickname: "Pumpkin",
    role: "Social Media Marketer & Traveler",
    home: "Vietnam",
    bio: "I tell stories on the internet for work, and tell them for myself when I travel.",
    photo: "/assets/images/profile/pumpkin-profile.avif",
  },

  // ─── URLs ───
  url: "https://pumpkinblog.web.app", // change once you have a custom domain
  baseUrl: "/",
  language: "en",
  locales: ["en", "vi"],

  // ─── Social media ───
  social: {
    instagram: {
      handle: "@pumpkin.travels",
      url: "https://instagram.com/pumpkin.travels",
    },
    youtube: {
      handle: "@pumpkintravels",
      url: "https://youtube.com/@pumpkintravels",
    },
    tiktok: {
      handle: "@pumpkin.travels",
      url: "https://tiktok.com/@pumpkin.travels",
    },
  },

  // ─── Navigation ───
  nav: [
    { label_en: "Home", label_vi: "Trang chủ", url: "/" },
    { label_en: "Blogs", label_vi: "Bài viết", url: "/blogs/" },
    { label_en: "Gallery", label_vi: "Thư viện", url: "/gallery/" },
    { label_en: "About", label_vi: "Giới thiệu", url: "/about/" },
    { label_en: "Contact", label_vi: "Liên hệ", url: "/contact/" },
  ],

  // ─── Firebase web config ───
  // Get this from Firebase Console -> Project Settings -> Your apps
  // Safe to keep public; security is enforced by Firestore rules.
  firebase: {
    apiKey: "REPLACE_ME",
    authDomain: "REPLACE_ME.firebaseapp.com",
    projectId: "REPLACE_ME",
    storageBucket: "REPLACE_ME.appspot.com",
    messagingSenderId: "REPLACE_ME",
    appId: "REPLACE_ME",
  },

  // ─── SEO defaults ───
  seo: {
    ogImage: "/assets/images/og-image.jpg",
    twitterHandle: "@pumpkin.travels",
    keywords:
      "travel blog, Vietnam, Southeast Asia, India, Thailand, solo travel, food, culture, photography",
  },

  // ─── Build info ───
  buildTime: new Date().toISOString(),
};
