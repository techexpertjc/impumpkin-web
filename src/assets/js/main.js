// ============================================
// I'm Pumpkin - Main JavaScript
// ============================================

(function () {
  var prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  // Detect environment
  var heroSection = document.querySelector(".snap-section--hero");
  var isHomepage = heroSection !== null;
  var hasGSAP =
    typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined";

  // ---- Route to the correct init path ----
  if (isHomepage && hasGSAP && !prefersReducedMotion) {
    initHomepageGSAP();
  } else if (isHomepage && !hasGSAP && !prefersReducedMotion) {
    initHomepageVanilla();
  } else if (isHomepage && prefersReducedMotion) {
    initHomepageReduced();
  }

  // ---- Shared features (all pages) ----
  initNavScroll();
  initInstagramNotification();
  initMobileNav();
  initLightbox();

  // ================================================
  // Homepage GSAP Animations (CSS handles snapping)
  // ================================================
  function initHomepageGSAP() {
    gsap.registerPlugin(ScrollTrigger);

    // Mark GSAP as active so CSS yields animation control
    document.documentElement.classList.add("gsap-active");

    var parallaxBg = document.querySelector(".parallax-bg");
    var parallaxContent = document.querySelector(".parallax-content");
    var profileImg = document.querySelector(".parallax-profile__img");
    var scrollIndicator = document.querySelector(".scroll-indicator");

    // ---- Hero entrance animation ----
    var heroTl = gsap.timeline();
    heroTl
      .set(parallaxContent, { opacity: 0, y: 30 })
      .set(profileImg, { opacity: 0, scale: 0.8, y: 20 })
      .to(parallaxContent, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out",
        delay: 0.3,
      })
      .to(
        profileImg,
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.6,
          ease: "back.out(1.4)",
        },
        "-=0.3"
      );

    // ---- Hero parallax zoom ----
    if (parallaxBg) {
      gsap.fromTo(
        parallaxBg,
        { scale: 1.3 },
        {
          scale: 1,
          ease: "none",
          scrollTrigger: {
            trigger: heroSection,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        }
      );
    }

    // ---- Scroll indicator fade ----
    if (scrollIndicator) {
      gsap.to(scrollIndicator, {
        opacity: 0,
        ease: "none",
        scrollTrigger: {
          trigger: heroSection,
          start: "top top",
          end: "30% top",
          scrub: true,
        },
      });

      // Click scrolls to next section
      scrollIndicator.addEventListener("click", function () {
        var nextSection = heroSection.nextElementSibling;
        if (nextSection) {
          nextSection.scrollIntoView({ behavior: "smooth" });
        }
      });
    }

    // ---- Section entrance animations ----
    // About section
    var aboutSection = document.querySelector('[data-section="about"]');
    if (aboutSection) {
      var aboutElements = aboutSection.querySelectorAll("[data-animate]");
      aboutElements.forEach(function (el, index) {
        gsap.fromTo(
          el,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            delay: index * 0.15,
            ease: "power2.out",
            scrollTrigger: {
              trigger: aboutSection,
              start: "top 80%",
              once: true,
            },
          }
        );
      });
    }

    // Featured section
    var featuredSection = document.querySelector(
      '[data-section="featured"]'
    );
    if (featuredSection) {
      var featuredLabel = featuredSection.querySelector(".hero-label");
      var featuredPost = featuredSection.querySelector(".featured-post");

      if (featuredLabel) {
        gsap.fromTo(
          featuredLabel,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power2.out",
            scrollTrigger: {
              trigger: featuredSection,
              start: "top 80%",
              once: true,
            },
          }
        );
      }

      if (featuredPost) {
        gsap.fromTo(
          featuredPost,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            delay: 0.2,
            ease: "power2.out",
            scrollTrigger: {
              trigger: featuredSection,
              start: "top 80%",
              once: true,
            },
          }
        );
      }

      // Subtle image zoom on featured image
      var featuredImg = featuredSection.querySelector(
        ".featured-post__image"
      );
      if (featuredImg) {
        gsap.fromTo(
          featuredImg,
          { scale: 1.05 },
          {
            scale: 1,
            ease: "none",
            scrollTrigger: {
              trigger: featuredSection,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          }
        );
      }
    }

    // Posts section
    var postsSection = document.querySelector('[data-section="posts"]');
    if (postsSection) {
      var postsHeader = postsSection.querySelector(".posts-section__header");
      if (postsHeader) {
        gsap.fromTo(
          postsHeader,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power2.out",
            scrollTrigger: {
              trigger: postsSection,
              start: "top 80%",
              once: true,
            },
          }
        );
      }

      var postCards = postsSection.querySelectorAll(".post-card");
      postCards.forEach(function (card, index) {
        gsap.fromTo(
          card,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            delay: 0.15 + index * 0.12,
            ease: "power2.out",
            scrollTrigger: {
              trigger: postsSection,
              start: "top 80%",
              once: true,
            },
          }
        );
      });
    }

    // Connect section
    var connectSection = document.querySelector(
      '[data-section="connect"]'
    );
    if (connectSection) {
      var connectContent = connectSection.querySelector(".connect-content");
      if (connectContent) {
        gsap.fromTo(
          connectContent,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
              trigger: connectSection,
              start: "top 80%",
              once: true,
            },
          }
        );
      }
    }

    // Refresh ScrollTrigger after layout is ready
    window.addEventListener("load", function () {
      ScrollTrigger.refresh();
    });
  }

  // ================================================
  // Homepage Vanilla Fallback (when GSAP fails)
  // ================================================
  function initHomepageVanilla() {
    var parallaxBg = document.querySelector(".parallax-bg");
    var parallaxContent = document.querySelector(".parallax-content");
    var profileImg = document.querySelector(".parallax-profile__img");
    var scrollIndicator = document.querySelector(".scroll-indicator");

    // Hero entrance
    setTimeout(function () {
      if (parallaxContent) parallaxContent.classList.add("is-visible");
    }, 300);
    setTimeout(function () {
      if (profileImg) profileImg.classList.add("is-visible");
    }, 600);

    // Scroll handler for parallax
    var cachedHeroHeight = heroSection ? heroSection.offsetHeight : 0;
    var scrollTicking = false;
    var lastScale = 1.3;

    var resizeTimer;
    window.addEventListener(
      "resize",
      function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
          if (heroSection) cachedHeroHeight = heroSection.offsetHeight;
        }, 200);
      },
      { passive: true }
    );

    function onScroll() {
      if (scrollTicking) return;
      scrollTicking = true;

      window.requestAnimationFrame(function () {
        var scrollY = window.scrollY;

        if (cachedHeroHeight && parallaxBg) {
          var progress = Math.min(scrollY / cachedHeroHeight, 1);
          var scale = 1.3 - 0.3 * progress;

          if (Math.abs(scale - lastScale) > 0.001) {
            parallaxBg.style.transform =
              "scale3d(" + scale + "," + scale + ",1)";
            lastScale = scale;
          }

          if (scrollIndicator) {
            scrollIndicator.style.opacity = String(
              Math.max(0, 1 - progress * 3)
            );
          }
        }

        scrollTicking = false;
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });

    // Scroll indicator click
    if (scrollIndicator) {
      scrollIndicator.addEventListener("click", function () {
        var nextSection = heroSection.nextElementSibling;
        if (nextSection) {
          nextSection.scrollIntoView({ behavior: "smooth" });
        }
      });
    }

    // Scroll-triggered animations (IntersectionObserver)
    var animateElements = document.querySelectorAll("[data-animate]");
    if (animateElements.length > 0) {
      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              observer.unobserve(entry.target);
            }
          });
        },
        {
          threshold: 0.1,
          rootMargin: "0px 0px -40px 0px",
        }
      );

      animateElements.forEach(function (el) {
        observer.observe(el);
      });
    }
  }

  // ================================================
  // Homepage Reduced Motion (show everything)
  // ================================================
  function initHomepageReduced() {
    var parallaxBg = document.querySelector(".parallax-bg");
    var parallaxContent = document.querySelector(".parallax-content");
    var profileImg = document.querySelector(".parallax-profile__img");

    // Remove snap on reduced motion
    document.documentElement.classList.remove("snap-page");

    if (parallaxBg) parallaxBg.style.transform = "scale(1)";
    if (parallaxContent) parallaxContent.classList.add("is-visible");
    if (profileImg) profileImg.classList.add("is-visible");

    // Make all animated elements visible
    document.querySelectorAll("[data-animate]").forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  // ================================================
  // Shared: Nav Scroll Effect (all pages)
  // ================================================
  function initNavScroll() {
    var siteNav = document.querySelector(".site-nav");
    if (!siteNav) return;

    function checkScroll() {
      if (window.scrollY > 50) {
        siteNav.classList.add("is-scrolled");
      } else {
        siteNav.classList.remove("is-scrolled");
      }
    }

    window.addEventListener("scroll", checkScroll, { passive: true });
    checkScroll();
  }

  // ================================================
  // Shared: Instagram Chat Notification
  // ================================================
  function initInstagramNotification() {
    var igNotif = document.getElementById("ig-notif");
    if (!igNotif) return;

    var igClose = igNotif.querySelector(".ig-notif__close");
    var dismissed = sessionStorage.getItem("ig-notif-dismissed");

    if (!dismissed) {
      setTimeout(function () {
        igNotif.classList.add("is-visible");
      }, 2500);
    }

    if (igClose) {
      igClose.addEventListener("click", function () {
        igNotif.classList.add("is-hiding");
        igNotif.classList.remove("is-visible");
        sessionStorage.setItem("ig-notif-dismissed", "1");
        setTimeout(function () {
          igNotif.remove();
        }, 400);
      });
    }
  }

  // ================================================
  // Shared: Mobile Navigation Toggle
  // ================================================
  function initMobileNav() {
    document.addEventListener("DOMContentLoaded", function () {
      var navToggle = document.querySelector(".nav-toggle");
      var navLinks = document.querySelector(".nav-links");

      if (navToggle && navLinks) {
        navToggle.addEventListener("click", function () {
          navLinks.classList.toggle("open");
          var isOpen = navLinks.classList.contains("open");
          navToggle.setAttribute("aria-expanded", isOpen);
        });

        navLinks.querySelectorAll("a").forEach(function (link) {
          link.addEventListener("click", function () {
            navLinks.classList.remove("open");
            navToggle.setAttribute("aria-expanded", "false");
          });
        });
      }
    });
  }

  // ================================================
  // Shared: Lightbox for Gallery
  // ================================================
  function initLightbox() {
    document.addEventListener("DOMContentLoaded", function () {
      var galleryItems = document.querySelectorAll(".gallery-item img");
      var lightbox = document.querySelector(".lightbox-overlay");

      if (!lightbox || galleryItems.length === 0) return;

      var lightboxImg = lightbox.querySelector("img");

      galleryItems.forEach(function (img) {
        img.addEventListener("click", function () {
          lightboxImg.src = img.src;
          lightboxImg.alt = img.alt;
          lightbox.classList.add("active");
          document.body.style.overflow = "hidden";
        });
      });

      lightbox.addEventListener("click", function () {
        lightbox.classList.remove("active");
        document.body.style.overflow = "";
      });

      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && lightbox.classList.contains("active")) {
          lightbox.classList.remove("active");
          document.body.style.overflow = "";
        }
      });
    });
  }
})();
