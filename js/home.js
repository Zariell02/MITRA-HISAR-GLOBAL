/* =========================================================
   HOME PAGE SCRIPT
   - Render produk homepage dari data/packages.json
   - Mengisi:
     1. Keberangkatan Terdekat  -> [data-nearest-packages]
     2. Layanan Utama           -> [data-service-shortcuts]
     3. Paket Pilihan           -> [data-featured-packages]

   Catatan:
   - Banner slider sudah ditangani oleh js/main.js.
   - File ini fokus ke management produk homepage.
========================================================= */

const HOME_FALLBACK_IDS = {
  nearest: [
    "umrah-paket-silver",
    "umrah-eko-plus",
    "umrah-nyaman-direct",
    "umrah-plus-dubai",
  ],
  shortcuts: ["umrah-reguler", "umrah-private", "tabungan-umroh"],
  featured: [
    "umrah-reguler",
    "umrah-ziarah-badar",
    "umrah-plus-dubai",
    "umrah-plus-oman",
  ],
};

const HOME_LIMITS = {
  nearest: 4,
  shortcuts: 3,
  featured: 4,
};

function escapeHomeHTML(value = "") {
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

function normalizeHomeText(value = "") {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]/gi, "")
    .trim();
}

function formatHomeRupiah(value) {
  if (typeof formatRupiah === "function") {
    return formatRupiah(value);
  }

  const numberValue = Number(value || 0);

  if (!numberValue) return "Konsultasi Admin";

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(numberValue);
}

function buildHomeWhatsAppLink(message) {
  if (typeof buildWhatsAppLink === "function") {
    return buildWhatsAppLink(message);
  }

  const whatsappNumber = "6281234567890";
  const defaultMessage =
    "Assalamu'alaikum, saya ingin konsultasi paket Umrah/Haji melalui Mitra HisarGlobal.";

  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    message || defaultMessage,
  )}`;
}

async function loadHomePackages() {
  if (typeof loadPackages === "function") {
    return loadPackages();
  }

  const response = await fetch("data/packages.json");

  if (!response.ok) {
    throw new Error("Data paket gagal dimuat.");
  }

  return response.json();
}

function getHomeImage(item = {}) {
  return item.thumbnail || item.image || "assets/images/logo.jpg";
}

function getHomePriceLabel(item = {}) {
  return item.priceLabel || formatHomeRupiah(item.price);
}

function getHomeStatus(item = {}) {
  return String(item.status || "available")
    .toLowerCase()
    .trim();
}

function getHomeStatusLabel(item = {}) {
  const statusLabelMap = {
    available: "Tersedia",
    limited: "Seat Terbatas",
    full: "Full Seat",
    closed: "Ditutup",
    "coming-soon": "Segera Hadir",
  };

  const status = getHomeStatus(item);

  return item.statusLabel || statusLabelMap[status] || "Tersedia";
}

function getMiniStatusClass(item = {}) {
  const status = getHomeStatus(item);

  if (status === "full" || status === "closed") {
    return "status-full-soft";
  }

  return "status-limited-soft";
}

function getFeaturedStatusClass(item = {}) {
  const status = getHomeStatus(item);

  if (status === "full" || status === "closed") {
    return "status-full";
  }

  if (status === "limited" || status === "coming-soon") {
    return "status-limited";
  }

  return "status-check";
}

function getHomeProductType(item = {}) {
  const rawText = [item.type, item.category, item.title]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (rawText.includes("haji")) return "haji";
  if (rawText.includes("tour") || rawText.includes("wisata")) return "tour";
  if (
    rawText.includes("pembiayaan") ||
    rawText.includes("tabungan") ||
    rawText.includes("talangan") ||
    rawText.includes("cicilan")
  ) {
    return "pembiayaan";
  }

  return "umrah";
}

function getHomeProductIcon(item = {}) {
  const productType = getHomeProductType(item);

  const iconMap = {
    haji: "🕋",
    umrah: "🕋",
    pembiayaan: "🧾",
    tour: "✦",
  };

  return item.icon || iconMap[productType] || "◇";
}

function getHomeRouteLabel(item = {}) {
  if (item.route) return item.route;

  const title = String(item.title || "").toLowerCase();

  if (title.includes("dubai")) return "Jakarta - Dubai - Jeddah";
  if (title.includes("oman")) return "Jakarta - Oman - Jeddah";
  if (title.includes("turki")) return "Jakarta - Istanbul - Jeddah";
  if (title.includes("haji")) return "Jakarta - Jeddah";

  return "Jakarta - Jeddah";
}

function getHomeSeatLabel(item = {}) {
  return item.seatLabel || item.quotaLabel || getHomeStatusLabel(item);
}

function getHomeDetailUrl(item = {}) {
  if (!item.id) return "paket.html";

  return `detail-paket.html?id=${encodeURIComponent(item.id)}`;
}

function getHomeWhatsappText(item = {}) {
  return (
    item.whatsappText ||
    `Assalamu'alaikum, saya tertarik dengan ${item.title || "paket ini"}. Mohon info lengkapnya.`
  );
}

function getActiveSortedPackages(packages = []) {
  return packages
    .filter((item) => item && item.isActive !== false)
    .sort((a, b) => {
      const orderA = Number.isFinite(Number(a.order)) ? Number(a.order) : 9999;
      const orderB = Number.isFinite(Number(b.order)) ? Number(b.order) : 9999;

      if (orderA !== orderB) return orderA - orderB;

      return String(a.title || "").localeCompare(
        String(b.title || ""),
        "id-ID",
      );
    });
}

function pickPackagesByFlag(
  packages = [],
  flagName,
  fallbackIds = [],
  limit = 4,
) {
  const flaggedPackages = packages.filter((item) => item[flagName] === true);

  if (flaggedPackages.length) {
    return flaggedPackages.slice(0, limit);
  }

  const fallbackPackages = fallbackIds
    .map((id) => packages.find((item) => item.id === id))
    .filter(Boolean);

  if (fallbackPackages.length) {
    return fallbackPackages.slice(0, limit);
  }

  return packages.slice(0, limit);
}

function renderNotice(container, message) {
  if (!container) return;

  container.innerHTML = `
    <div class="notice">
      ${escapeHomeHTML(message)}
    </div>
  `;
}

/* =========================================================
   RENDER: KEBERANGKATAN TERDEKAT
========================================================= */

function nearestPackageCard(item) {
  const title = escapeHomeHTML(item.title || "Paket");
  const image = escapeHomeHTML(getHomeImage(item));
  const fallbackImage = "assets/images/logo.jpg";
  const departure = escapeHomeHTML(item.departure || "Perlu Konfirmasi");
  const duration = escapeHomeHTML(item.duration || "-");
  const route = escapeHomeHTML(getHomeRouteLabel(item));
  const seatLabel = escapeHomeHTML(getHomeSeatLabel(item));
  const priceLabel = escapeHomeHTML(getHomePriceLabel(item));
  const statusClass = getMiniStatusClass(item);
  const detailUrl = getHomeDetailUrl(item);

  return `
    <a class="mini-departure-card" href="${detailUrl}" aria-label="Lihat detail ${title}">
      <div class="mini-departure-thumb">
        <img
          src="${image}"
          alt="Poster ${title}"
          loading="lazy"
          onerror="this.onerror=null;this.src='${fallbackImage}'"
        />
      </div>

      <div class="mini-departure-body">
        <div class="mini-meta">
          <span>${departure}</span>
          <span>${duration}</span>
        </div>

        <h3>${title}</h3>

        <div class="mini-route">
          <span>${route}</span>
          <span>${seatLabel}</span>
        </div>

        <div class="mini-bottom">
          <strong>${priceLabel}</strong>
          <span class="mini-status ${statusClass}">
            ${seatLabel}
          </span>
        </div>
      </div>
    </a>
  `;
}

function renderNearestPackages(packages = []) {
  const container = document.querySelector("[data-nearest-packages]");

  if (!container) return;

  if (!packages.length) {
    renderNotice(
      container,
      "Data keberangkatan belum tersedia. Silakan cek katalog lengkap atau hubungi admin.",
    );
    return;
  }

  container.innerHTML = packages
    .slice(0, HOME_LIMITS.nearest)
    .map(nearestPackageCard)
    .join("");
}

/* =========================================================
   RENDER: LAYANAN UTAMA
========================================================= */

function serviceShortcutCard(item, index = 0) {
  const title = escapeHomeHTML(item.shortcutTitle || item.title || "Layanan");
  const tag = escapeHomeHTML(
    item.shortcutTag || item.tag || item.category || "Layanan",
  );
  const summary = escapeHomeHTML(
    item.shortcutSummary ||
      item.summary ||
      "Pilih layanan yang Anda butuhkan dan lanjutkan konsultasi melalui admin.",
  );
  const image = escapeHomeHTML(getHomeImage(item));
  const fallbackImage = "assets/images/logo.jpg";
  const detailUrl = getHomeDetailUrl(item);

  const featuredClass =
    item.isShortcutFeatured === true || index === 1
      ? " service-shortcut-card-featured"
      : "";

  return `
    <a class="service-shortcut-card${featuredClass}" href="${detailUrl}">
      <div class="service-shortcut-image">
        <img
          src="${image}"
          alt="Poster ${title}"
          loading="lazy"
          onerror="this.onerror=null;this.src='${fallbackImage}'"
        />
      </div>

      <div class="service-shortcut-body">
        <span class="service-shortcut-tag">${tag}</span>

        <h3>${title}</h3>

        <p>${summary}</p>

        <span class="service-shortcut-button">Lihat Detail →</span>
      </div>
    </a>
  `;
}

function renderServiceShortcuts(packages = []) {
  const container = document.querySelector("[data-service-shortcuts]");

  if (!container) return;

  if (!packages.length) {
    renderNotice(
      container,
      "Layanan utama belum tersedia. Silakan hubungi admin untuk konsultasi.",
    );
    return;
  }

  container.innerHTML = packages
    .slice(0, HOME_LIMITS.shortcuts)
    .map(serviceShortcutCard)
    .join("");
}

/* =========================================================
   RENDER: PAKET PILIHAN
========================================================= */

function featuredPackageCard(item, index = 0) {
  const title = escapeHomeHTML(item.title || "Paket");
  const summary = escapeHomeHTML(
    item.featuredSummary ||
      item.summary ||
      "Paket pilihan yang dapat dikonsultasikan melalui admin.",
  );
  const statusLabel = escapeHomeHTML(getHomeStatusLabel(item));
  const statusClass = getFeaturedStatusClass(item);
  const icon = escapeHomeHTML(getHomeProductIcon(item));
  const detailUrl = getHomeDetailUrl(item);
  const whatsappText = getHomeWhatsappText(item);
  const ctaLabel = escapeHomeHTML(
    item.ctaLabel ||
      (getHomeStatus(item) === "full"
        ? "Tanya Alternatif Paket"
        : "Cek Seat Paket Ini"),
  );

  const features = Array.isArray(item.homeFeatures)
    ? item.homeFeatures
    : Array.isArray(item.features)
      ? item.features.slice(0, 3)
      : [
          `Harga: ${getHomePriceLabel(item)}`,
          `Jadwal: ${item.departure || "Perlu konfirmasi"}`,
          `Durasi: ${item.duration || "-"}`,
        ];

  const featuredClass =
    item.isFeaturedHighlight === true || index === 1 ? " featured-product" : "";

  return `
    <article class="mitra-product-card${featuredClass}">
      <div class="product-card-top">
        <span class="package-status ${statusClass}">
          ${statusLabel}
        </span>

        <span class="product-icon">${icon}</span>
      </div>

      <h3>${title}</h3>

      <p>${summary}</p>

      <ul>
        ${features
          .slice(0, 3)
          .map((feature) => `<li>${escapeHomeHTML(feature)}</li>`)
          .join("")}
      </ul>

      <a
        class="btn btn-primary product-cta"
        href="${buildHomeWhatsAppLink(whatsappText)}"
        target="_blank"
        rel="noopener"
      >
        ${ctaLabel}
      </a>

      <a class="chat-mini" href="${detailUrl}" aria-label="Lihat detail ${title}">
        Lihat Detail
      </a>
    </article>
  `;
}

function renderFeaturedPackages(packages = []) {
  const container = document.querySelector("[data-featured-packages]");

  if (!container) return;

  if (!packages.length) {
    renderNotice(
      container,
      "Paket pilihan belum tersedia. Silakan cek katalog lengkap.",
    );
    return;
  }

  container.innerHTML = packages
    .slice(0, HOME_LIMITS.featured)
    .map(featuredPackageCard)
    .join("");
}

/* =========================================================
   FILTER: KEBERANGKATAN TERDEKAT
========================================================= */

function setupNearestPackageFilters(allPackages = []) {
  const monthSelect = document.querySelector("[data-home-month]");
  const promoSelect = document.querySelector("[data-home-promo]");
  const typeSelect = document.querySelector("[data-home-type]");
  const resetButton = document.querySelector(".search-action-row .btn-outline");
  const tabs = Array.from(document.querySelectorAll(".search-tab"));

  let activeTab = "umrah";

  function getFilteredPackages() {
    const monthValue = monthSelect?.value || "";
    const promoValue = promoSelect?.value || "";
    const typeValue = typeSelect?.value || "";

    const hasAnyFilter = Boolean(
      monthValue || promoValue || typeValue || activeTab,
    );

    if (!hasAnyFilter) {
      return pickPackagesByFlag(
        allPackages,
        "isNearest",
        HOME_FALLBACK_IDS.nearest,
        HOME_LIMITS.nearest,
      );
    }

    const normalizedMonth = normalizeHomeText(monthValue);
    const normalizedPromo = normalizeHomeText(promoValue);
    const normalizedType = normalizeHomeText(typeValue);
    const normalizedTab = normalizeHomeText(activeTab);

    return allPackages
      .filter((item) => {
        const productText = normalizeHomeText(
          [
            item.title,
            item.category,
            item.type,
            item.tag,
            item.departure,
            item.summary,
            item.promoType,
          ]
            .filter(Boolean)
            .join(" "),
        );

        const productType = normalizeHomeText(getHomeProductType(item));

        const matchTab =
          !normalizedTab ||
          productType.includes(normalizedTab) ||
          productText.includes(normalizedTab);

        const matchMonth =
          !normalizedMonth || productText.includes(normalizedMonth);

        const matchPromo =
          !normalizedPromo || productText.includes(normalizedPromo);

        const matchType =
          !normalizedType || productText.includes(normalizedType);

        return matchTab && matchMonth && matchPromo && matchType;
      })
      .slice(0, HOME_LIMITS.nearest);
  }

  function applyFilters() {
    const filteredPackages = getFilteredPackages();

    renderNearestPackages(filteredPackages);
  }

  [monthSelect, promoSelect, typeSelect].forEach((select) => {
    if (!select) return;
    select.addEventListener("change", applyFilters);
  });

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((item) => item.classList.remove("active"));
      tab.classList.add("active");

      activeTab = tab.textContent.toLowerCase().includes("haji")
        ? "haji"
        : "umrah";

      applyFilters();
    });
  });

  if (resetButton) {
    resetButton.addEventListener("click", () => {
      if (monthSelect) monthSelect.value = "";
      if (promoSelect) promoSelect.value = "";
      if (typeSelect) typeSelect.value = "";

      activeTab = "umrah";

      tabs.forEach((tab) => {
        const isUmrahTab = tab.textContent.toLowerCase().includes("umrah");
        tab.classList.toggle("active", isUmrahTab);
      });

      renderNearestPackages(
        pickPackagesByFlag(
          allPackages,
          "isNearest",
          HOME_FALLBACK_IDS.nearest,
          HOME_LIMITS.nearest,
        ),
      );
    });
  }
}

/* =========================================================
   INIT
========================================================= */

document.addEventListener("DOMContentLoaded", async () => {
  const nearestContainer = document.querySelector("[data-nearest-packages]");
  const shortcutContainer = document.querySelector("[data-service-shortcuts]");
  const featuredContainer = document.querySelector("[data-featured-packages]");

  if (!nearestContainer && !shortcutContainer && !featuredContainer) return;

  try {
    const rawPackages = await loadHomePackages();
    const activePackages = getActiveSortedPackages(rawPackages);

    const nearestPackages = pickPackagesByFlag(
      activePackages,
      "isNearest",
      HOME_FALLBACK_IDS.nearest,
      HOME_LIMITS.nearest,
    );

    const shortcutPackages = pickPackagesByFlag(
      activePackages,
      "isShortcut",
      HOME_FALLBACK_IDS.shortcuts,
      HOME_LIMITS.shortcuts,
    );

    const featuredPackages = pickPackagesByFlag(
      activePackages,
      "isFeatured",
      HOME_FALLBACK_IDS.featured,
      HOME_LIMITS.featured,
    );

    renderNearestPackages(nearestPackages);
    renderServiceShortcuts(shortcutPackages);
    renderFeaturedPackages(featuredPackages);

    setupNearestPackageFilters(activePackages);
  } catch (error) {
    console.error(error);

    renderNotice(
      nearestContainer,
      "Data keberangkatan gagal dimuat. Pastikan website dijalankan melalui server lokal atau hosting.",
    );

    renderNotice(shortcutContainer, "Data layanan utama gagal dimuat.");

    renderNotice(featuredContainer, "Data paket pilihan gagal dimuat.");
  }
});
