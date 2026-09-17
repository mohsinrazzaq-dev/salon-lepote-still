document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".nav-links");

  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Zatvori meni" : "Otvori meni");
    });
    nav.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
      nav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Otvori meni");
    }));
  }

  // Gallery lightbox
  const lightbox = document.getElementById("lightbox");
  const lightboxImage = document.getElementById("lightboxImage");
  let lastGalleryTrigger = null;
  const closeLightbox = () => {
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("no-scroll");
    lightboxImage.removeAttribute("src");
    lastGalleryTrigger?.focus();
    lastGalleryTrigger = null;
  };

  document.querySelectorAll(".gallery-item").forEach(item => {
    item.addEventListener("click", () => {
      lastGalleryTrigger = item;
      lightboxImage.src = item.dataset.full;
      lightboxImage.alt = item.querySelector("img")?.alt || "Galerija";
      lightbox.classList.add("open");
      lightbox.setAttribute("aria-hidden", "false");
      requestAnimationFrame(() => lightbox.querySelector(".lightbox-close")?.focus());
      document.body.classList.add("no-scroll");
    });
  });
  document.querySelector(".lightbox-close")?.addEventListener("click", closeLightbox);
  lightbox?.addEventListener("click", e => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeLightbox(); });

  // Videos are intentionally lazy-loaded only when they approach the viewport.
  // This prevents all 16+ MB of MP4 files from competing with the first paint.
  const lazyVideos = document.querySelectorAll("video.lazy-video");
  const loadVideo = (video) => {
    if (video.dataset.loaded === "true") return;
    const src = video.dataset.src;
    if (!src) return;
    const poster = video.dataset.poster;
    if (poster) video.poster = poster;
    video.src = src;
    video.dataset.loaded = "true";
    video.load();
    video.play().catch(() => {});
  };

  if ("IntersectionObserver" in window) {
    const videoObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          loadVideo(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: "300px 0px" });
    lazyVideos.forEach(video => videoObserver.observe(video));
  } else {
    lazyVideos.forEach(loadVideo);
  }

  // Videos: muted autoplay by default. The visitor can enable sound with one click.
  document.querySelectorAll(".video-card").forEach(card => {
    const video = card.querySelector("video");
    const button = card.querySelector(".sound-toggle");
    if (!video || !button) return;

    video.muted = true;
    video.volume = 1;

    button.addEventListener("click", () => {
      video.muted = !video.muted;
      if (!video.muted) {
        video.volume = 1;
        button.textContent = "🔊 Isključi zvuk";
        video.play().catch(() => {});
      } else {
        button.textContent = "🔇 Uključi zvuk";
      }
    });

    video.addEventListener("volumechange", () => {
      if (video.muted || video.volume === 0) {
        button.textContent = "🔇 Uključi zvuk";
      } else {
        button.textContent = "🔊 Isključi zvuk";
      }
    });
  });

  // Booking -> WhatsApp
  const form = document.getElementById("bookingForm");
  if (form) {
    const dateInput = document.getElementById("date");
    const today = new Date();
    const localToday = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().split("T")[0];
    dateInput.min = localToday;

    form.addEventListener("submit", e => {
      e.preventDefault();
      const name = document.getElementById("name").value.trim();
      const phone = document.getElementById("phone").value.trim();
      const service = document.getElementById("service").value;
      const date = document.getElementById("date").value;
      const time = document.getElementById("time").value;
      const note = document.getElementById("note").value.trim();

      const msg =
        `Zdravo, želela/želeo bih da zakažem termin.\n\n` +
        `Ime: ${name}\n` +
        `Telefon: ${phone}\n` +
        `Usluga: ${service}\n` +
        `Datum: ${date}\n` +
        `Vreme: ${time}` +
        (note ? `\nNapomena: ${note}` : "");

      const url = "https://wa.me/381638920968?text=" + encodeURIComponent(msg);
      const popup = window.open(url, "_blank", "noopener,noreferrer");
      const message = document.getElementById("formMessage");
      message.textContent = popup
        ? "WhatsApp je otvoren sa pripremljenim zahtevom. Molimo pošaljite poruku radi potvrde."
        : "Ako se WhatsApp nije otvorio, kliknite na WhatsApp dugme na stranici.";
    });
  }

  // Back to top
  const backTop = document.getElementById("backTop");
  let scrollTicking = false;
  window.addEventListener("scroll", () => {
    if (scrollTicking) return;
    scrollTicking = true;
    requestAnimationFrame(() => {
      if (window.scrollY > 500) backTop.classList.add("show");
      else backTop.classList.remove("show");
      scrollTicking = false;
    });
  }, { passive: true });
  backTop?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
});
