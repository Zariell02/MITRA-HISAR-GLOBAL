/* =========================================================
   DETAIL PAGE SCRIPT
   - Render detail produk dari data/packages.json
   - Support thumbnail, status, isActive, fallback image
========================================================= */

function escapeDetailHTML(value = "") {
  if (typeof escapeHTML === "function") {
    return escapeHTML(value);
  }

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

function getDetailImage(item = {}) {
  if (typeof getPackageImage === "function") {
    return getPackageImage(item);
  }

  return item.thumbnail || item.image || "assets/images/logo.jpg";
}

function getDetailStatus(item = {}) {
  if (typeof getPackageStatus === "function") {
    return getPackageStatus(item);
  }

  return String(item.status || "available")
    .toLowerCase()
    .trim();
}

function getDetailStatusLabel(item = {}) {
  if (typeof getPackageStatusLabel === "function") {
    return getPackageStatusLabel(item);
  }

  const statusLabelMap = {
    available: "Tersedia",
    limited: "Seat Terbatas",
    full: "Full Seat",
    closed: "Ditutup",
    "coming-soon": "Segera Hadir",
  };

  const status = getDetailStatus(item);

  return item.statusLabel || statusLabelMap[status] || "Tersedia";
}

function getDetailStatusClass(item = {}) {
  if (typeof getPackageStatusClass === "function") {
    return getPackageStatusClass(item);
  }

  const allowedStatus = [
    "available",
    "limited",
    "full",
    "closed",
    "coming-soon",
  ];

  const status = getDetailStatus(item);

  if (!allowedStatus.includes(status)) {
    return "status-available";
  }

  return `status-${status}`;
}

function getDetailPriceLabel(item = {}) {
  if (typeof getPackagePriceLabel === "function") {
    return getPackagePriceLabel(item);
  }

  if (item.priceLabel) return item.priceLabel;

  if (typeof formatRupiah === "function") {
    return formatRupiah(item.price);
  }

  const price = Number(item.price || 0);

  if (!price) return "Konsultasi Admin";

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(price);
}

function getDetailWhatsAppText(item = {}) {
  if (typeof getPackageWhatsAppText === "function") {
    return getPackageWhatsAppText(item);
  }

  return (
    item.whatsappText ||
    `Assalamu'alaikum, saya tertarik dengan ${item.title || "paket ini"}. Mohon info lengkapnya.`
  );
}

function detailWhatsAppLink(message) {
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

function listItems(items = []) {
  if (!Array.isArray(items) || !items.length) {
    return `<li>Detail fasilitas dapat dikonfirmasi melalui admin.</li>`;
  }

  return items.map((item) => `<li>${escapeDetailHTML(item)}</li>`).join("");
}

function renderInactiveProduct(item = {}) {
  const container = document.querySelector("[data-detail]");

  if (!container) return;

  const title = escapeDetailHTML(item.title || "Paket");

  document.title = `${title} | Mitra HisarGlobal`;

  container.innerHTML = `
    <div class="notice">
      <strong>Paket sedang tidak aktif.</strong>
      <br />
      Produk atau layanan ini sedang tidak ditampilkan di katalog. Silakan kembali ke katalog untuk melihat paket lain yang tersedia.
      <div style="margin-top: 16px">
        <a class="btn btn-outline" href="paket.html">Kembali ke Katalog</a>
      </div>
    </div>
  `;
}

function renderDetail(item = {}) {
  const container = document.querySelector("[data-detail]");

  if (!container) return;

  const title = escapeDetailHTML(item.title || "Detail Paket");
  const category = escapeDetailHTML(item.category || "Paket");
  const type = escapeDetailHTML(item.type || "-");
  const summary = escapeDetailHTML(
    item.summary ||
      "Informasi detail paket dapat dikonsultasikan melalui admin.",
  );
  const image = escapeDetailHTML(getDetailImage(item));
  const fallbackImage = "assets/images/logo.jpg";
  const duration = escapeDetailHTML(item.duration || "-");
  const hotel = escapeDetailHTML(item.hotel || "-");
  const departure = escapeDetailHTML(item.departure || "Perlu Konfirmasi");
  const priceLabel = escapeDetailHTML(getDetailPriceLabel(item));
  const statusLabel = escapeDetailHTML(getDetailStatusLabel(item));
  const statusClass = getDetailStatusClass(item);
  const notes = escapeDetailHTML(
    item.notes ||
      "Harga, jadwal, fasilitas, seat, hotel, dan maskapai perlu dikonfirmasi ulang melalui admin.",
  );
  const whatsappText = getDetailWhatsAppText(item);

  document.title = `${title} | Mitra HisarGlobal`;

  container.innerHTML = `
    <div class="detail-layout">
      <aside class="detail-image">
        <img
          src="${image}"
          alt="${title}"
          loading="lazy"
          onerror="this.onerror=null;this.src='${fallbackImage}'"
        />
      </aside>

      <section class="detail-info">
        <div class="detail-card">
          <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;">
            <span class="kicker">${category}</span>
            <span class="product-status ${statusClass}">
              ${statusLabel}
            </span>
          </div>

          <h1 style="margin-top:14px;">${title}</h1>

          <p class="lead" style="margin-top:12px;">
            ${summary}
          </p>

          <div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:22px;">
            <a
              class="btn btn-primary"
              href="${detailWhatsAppLink(whatsappText)}"
              target="_blank"
              rel="noopener"
            >
              Tanya Paket via WhatsApp
            </a>

            <a class="btn btn-outline" href="paket.html">
              Kembali ke Katalog
            </a>
          </div>
        </div>

        <div class="detail-card">
          <h3>Informasi Paket</h3>

          <table class="info-table">
            <tr>
              <th>Kategori</th>
              <td>${category}</td>
            </tr>

            <tr>
              <th>Tipe</th>
              <td>${type}</td>
            </tr>

            <tr>
              <th>Status</th>
              <td>
                <span class="product-status ${statusClass}">
                  ${statusLabel}
                </span>
              </td>
            </tr>

            <tr>
              <th>Durasi</th>
              <td>${duration}</td>
            </tr>

            <tr>
              <th>Hotel</th>
              <td>${hotel}</td>
            </tr>

            <tr>
              <th>Keberangkatan</th>
              <td>${departure}</td>
            </tr>

            <tr>
              <th>Harga</th>
              <td>${priceLabel}</td>
            </tr>
          </table>
        </div>

        <div class="detail-card">
          <h3>Fasilitas / Informasi Awal</h3>

          <ul class="list-check">
            ${listItems(item.features)}
          </ul>
        </div>

        <div class="notice">
          ${notes}
        </div>
      </section>
    </div>
  `;
}

document.addEventListener("DOMContentLoaded", async () => {
  const container = document.querySelector("[data-detail]");

  if (!container) return;

  const id = new URLSearchParams(window.location.search).get("id");

  if (!id) {
    container.innerHTML = `
      <div class="notice">
        ID paket tidak ditemukan. Silakan kembali ke katalog.
        <div style="margin-top: 16px">
          <a class="btn btn-outline" href="paket.html">Kembali ke Katalog</a>
        </div>
      </div>
    `;
    return;
  }

  try {
    const packages = await loadPackages();
    const item = packages.find((product) => product.id === id);

    if (!item) {
      container.innerHTML = `
        <div class="notice">
          Paket tidak ditemukan. Silakan cek kembali katalog.
          <div style="margin-top: 16px">
            <a class="btn btn-outline" href="paket.html">Kembali ke Katalog</a>
          </div>
        </div>
      `;
      return;
    }

    if (item.isActive === false) {
      renderInactiveProduct(item);
      return;
    }

    renderDetail(item);
  } catch (error) {
    container.innerHTML = `
      <div class="notice">
        Detail paket gagal dimuat. Pastikan website dijalankan menggunakan server lokal atau hosting.
      </div>
    `;

    console.error(error);
  }
});
