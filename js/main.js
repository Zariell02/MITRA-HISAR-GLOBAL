const APP_CONFIG = {
  whatsappNumber: "6281234567890",
  defaultMessage:
    "Assalamu'alaikum, saya ingin konsultasi paket Umrah/Haji melalui Mitra HisarGlobal. Mohon info jadwal, fasilitas, biaya, dan syarat pendaftarannya.",
};

function buildWhatsAppLink(message = APP_CONFIG.defaultMessage) {
  return `https://wa.me/${APP_CONFIG.whatsappNumber}?text=${encodeURIComponent(
    message,
  )}`;
}

function formatRupiah(value) {
  const n = Number(value || 0);

  if (!n) return "Konsultasi Admin";

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
}

async function loadPackages() {
  const response = await fetch("data/packages.json");

  if (!response.ok) {
    throw new Error("Data paket gagal dimuat.");
  }

  return response.json();
}

/* =========================================================
   GLOBAL HELPER
   Dipakai untuk render data produk dari JSON
========================================================= */

function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, (char) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };

    return entities[char];
  });
}

function getPackageImage(item = {}) {
  return item.thumbnail || item.image || "assets/images/logo.jpg";
}

function getPackageStatus(item = {}) {
  return String(item.status || "available")
    .toLowerCase()
    .trim();
}

function getPackageStatusLabel(item = {}) {
  const statusLabelMap = {
    available: "Tersedia",
    limited: "Seat Terbatas",
    full: "Full Seat",
    closed: "Ditutup",
    "coming-soon": "Segera Hadir",
  };

  const status = getPackageStatus(item);

  return item.statusLabel || statusLabelMap[status] || "Tersedia";
}

function getPackageStatusClass(item = {}) {
  const status = getPackageStatus(item);

  const allowedStatus = [
    "available",
    "limited",
    "full",
    "closed",
    "coming-soon",
  ];

  if (!allowedStatus.includes(status)) {
    return "status-available";
  }

  return `status-${status}`;
}

function getPackagePriceLabel(item = {}) {
  return item.priceLabel || formatRupiah(item.price);
}

function getPackageDetailUrl(item = {}) {
  if (!item.id) return "paket.html";

  return `detail-paket.html?id=${encodeURIComponent(item.id)}`;
}

function getPackageWhatsAppText(item = {}) {
  return (
    item.whatsappText ||
    `Assalamu'alaikum, saya tertarik dengan ${item.title || "paket ini"}. Mohon info lengkapnya.`
  );
}

/* =========================================================
   PRODUCT CARD
   Dipakai oleh catalog.js untuk render katalog produk
========================================================= */

function packageCard(item = {}) {
  const title = escapeHTML(item.title || "Paket");
  const category = escapeHTML(item.category || "Paket");
  const tag = escapeHTML(item.tag || item.category || "Paket");
  const duration = escapeHTML(item.duration || "-");
  const hotel = escapeHTML(item.hotel || "-");
  const summary = escapeHTML(item.summary || item.departure || "");
  const priceLabel = escapeHTML(getPackagePriceLabel(item));

  const imageSource = escapeHTML(getPackageImage(item));
  const fallbackImage = "assets/images/logo.jpg";

  const statusLabel = escapeHTML(getPackageStatusLabel(item));
  const statusClass = getPackageStatusClass(item);

  const detailUrl = getPackageDetailUrl(item);
  const whatsappText = getPackageWhatsAppText(item);

  return `
    <article class="package-card catalog-product-card" data-product-id="${escapeHTML(
      item.id || "",
    )}">
      <div class="package-image catalog-product-image">
        <img
          src="${imageSource}"
          alt="${title}"
          loading="lazy"
          onerror="this.onerror=null;this.src='${fallbackImage}'"
        />

        <div class="package-badge-row">
          <span class="package-tag">${tag}</span>
          <span class="product-status ${statusClass}">
            ${statusLabel}
          </span>
        </div>
      </div>

      <div class="package-body catalog-product-body">
        <div>
          <h3>${title}</h3>

          <div class="meta-line catalog-meta-line">
            <span>🗓 ${duration}</span>
            <span>🏨 ${hotel}</span>
          </div>

          <p class="package-price">
            ${priceLabel}
          </p>

          <p class="catalog-product-summary">
            ${summary}
          </p>

          <p class="catalog-product-category">
            ${category}
          </p>
        </div>

        <div class="catalog-action-row">
          <a
            class="catalog-detail-btn"
            href="${detailUrl}"
          >
            Lihat Detail
          </a>

          <a
            class="catalog-wa-btn"
            href="${buildWhatsAppLink(whatsappText)}"
            target="_blank"
            rel="noopener"
            aria-label="Chat WhatsApp ${title}"
            title="Chat WhatsApp"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.34 4.96L2 22l5.28-1.39a9.85 9.85 0 0 0 4.76 1.21h.01c5.46 0 9.91-4.45 9.91-9.91S17.51 2 12.04 2Zm5.78 14.15c-.24.67-1.39 1.28-1.94 1.36-.5.07-1.13.1-1.82-.11-.42-.13-.96-.31-1.65-.61-2.91-1.26-4.8-4.18-4.95-4.37-.14-.19-1.18-1.57-1.18-3s.75-2.13 1.02-2.42c.27-.29.59-.36.79-.36h.57c.18.01.43-.07.67.51.24.58.82 2.01.89 2.16.07.15.12.33.02.52-.1.19-.15.31-.29.48-.15.17-.31.38-.44.51-.15.15-.3.31-.13.6.17.29.75 1.23 1.6 1.99 1.1.98 2.03 1.28 2.32 1.43.29.15.46.12.63-.07.17-.19.72-.84.91-1.13.19-.29.38-.24.65-.15.27.1 1.7.8 1.99.94.29.15.48.22.55.34.07.12.07.69-.17 1.36Z"
              />
            </svg>
          </a>
        </div>
      </div>
    </article>
  `;
}

/* =========================================================
   GLOBAL UI SETUP
========================================================= */

function setupWhatsAppLinks() {
  document.querySelectorAll("[data-whatsapp]").forEach((element) => {
    const message =
      element.getAttribute("data-message") || APP_CONFIG.defaultMessage;

    element.href = buildWhatsAppLink(message);
  });
}

function setupMobileMenu() {
  const toggleButton = document.querySelector("[data-menu-toggle]");
  const navMenu = document.querySelector("[data-nav-menu]");

  if (!toggleButton || !navMenu) return;

  const submenuItems = Array.from(navMenu.querySelectorAll("[data-submenu]"));

  function closeAllSubmenus(exceptItem = null) {
    submenuItems.forEach((item) => {
      if (item === exceptItem) return;

      item.classList.remove("open");

      const button = item.querySelector("[data-submenu-toggle]");

      if (button) {
        button.setAttribute("aria-expanded", "false");
      }
    });
  }

  function closeMobileMenu() {
    navMenu.classList.remove("open");
    document.body.classList.remove("no-scroll");
    closeAllSubmenus();
  }

  toggleButton.addEventListener("click", () => {
    const isOpen = navMenu.classList.toggle("open");

    document.body.classList.toggle("no-scroll", isOpen);

    if (!isOpen) {
      closeAllSubmenus();
    }
  });

  submenuItems.forEach((item) => {
    const button = item.querySelector("[data-submenu-toggle]");

    if (!button) return;

    button.addEventListener("click", (event) => {
      event.preventDefault();

      const isOpen = item.classList.toggle("open");

      button.setAttribute("aria-expanded", String(isOpen));

      closeAllSubmenus(item);
    });
  });

  navMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMobileMenu);
  });

  document.addEventListener("click", (event) => {
    const isClickInsideNav = navMenu.contains(event.target);
    const isClickOnToggle = toggleButton.contains(event.target);

    if (isClickInsideNav || isClickOnToggle) return;

    closeAllSubmenus();
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 840) {
      navMenu.classList.remove("open");
      document.body.classList.remove("no-scroll");
      closeAllSubmenus();
    }
  });
}

function setupYear() {
  const yearTarget = document.querySelector("[data-year]");

  if (yearTarget) {
    yearTarget.textContent = new Date().getFullYear();
  }
}

/* =========================================================
   BANNER SLIDER
========================================================= */

function setupBannerSlider() {
  const slider = document.querySelector("[data-banner-slider]");

  if (!slider) return;

  const slides = Array.from(slider.querySelectorAll(".banner-slide"));
  const dots = Array.from(slider.querySelectorAll("[data-banner-dot]"));
  const prevButton = slider.querySelector("[data-banner-prev]");
  const nextButton = slider.querySelector("[data-banner-next]");

  if (!slides.length) return;

  let currentIndex = 0;
  let timer = null;
  const intervalTime = 5000;

  function showSlide(index) {
    currentIndex = (index + slides.length) % slides.length;

    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("active", slideIndex === currentIndex);
    });

    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("active", dotIndex === currentIndex);
    });
  }

  function nextSlide() {
    showSlide(currentIndex + 1);
  }

  function prevSlide() {
    showSlide(currentIndex - 1);
  }

  function stopAutoSlide() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  function startAutoSlide() {
    stopAutoSlide();

    if (slides.length <= 1) return;

    timer = setInterval(nextSlide, intervalTime);
  }

  if (prevButton) {
    prevButton.addEventListener("click", () => {
      prevSlide();
      startAutoSlide();
    });
  }

  if (nextButton) {
    nextButton.addEventListener("click", () => {
      nextSlide();
      startAutoSlide();
    });
  }

  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      const targetIndex = Number(dot.dataset.bannerDot);

      if (Number.isNaN(targetIndex)) return;

      showSlide(targetIndex);
      startAutoSlide();
    });
  });

  slider.addEventListener("mouseenter", stopAutoSlide);
  slider.addEventListener("mouseleave", startAutoSlide);

  let touchStartX = 0;
  let touchEndX = 0;

  slider.addEventListener(
    "touchstart",
    (event) => {
      touchStartX = event.changedTouches[0].screenX;
    },
    { passive: true },
  );

  slider.addEventListener(
    "touchend",
    (event) => {
      touchEndX = event.changedTouches[0].screenX;

      const swipeDistance = touchEndX - touchStartX;
      const minSwipeDistance = 45;

      if (Math.abs(swipeDistance) < minSwipeDistance) return;

      if (swipeDistance < 0) {
        nextSlide();
      } else {
        prevSlide();
      }

      startAutoSlide();
    },
    { passive: true },
  );

  showSlide(0);
  startAutoSlide();
}

/* =========================================================
   INIT
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  setupWhatsAppLinks();
  setupMobileMenu();
  setupYear();
  setupBannerSlider();
});
