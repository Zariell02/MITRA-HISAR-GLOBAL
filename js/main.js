const APP_CONFIG = {
  whatsappNumber: "6281234567890",
  defaultMessage:
    "Assalamu'alaikum, saya ingin konsultasi paket Umrah/Haji melalui Mitra HisarGlobal. Mohon info jadwal, fasilitas, biaya, dan syarat pendaftarannya.",
};
function buildWhatsAppLink(message = APP_CONFIG.defaultMessage) {
  return `https://wa.me/${APP_CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`;
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
  const r = await fetch("data/packages.json");
  if (!r.ok) throw new Error("Data paket gagal dimuat.");
  return r.json();
}
function packageCard(item) {
  return `<article class="package-card"><div class="package-image"><img src="${item.image}" alt="${item.title}" loading="lazy"><span class="package-tag">${item.tag || item.category}</span></div><div class="package-body"><h3>${item.title}</h3><div class="meta-line"><span>🗓 ${item.duration}</span><span>🏨 ${item.hotel}</span></div><p class="package-price">${item.priceLabel || formatRupiah(item.price)}</p><p style="color:var(--muted);font-size:.9rem;">${item.departure}</p><div class="package-bottom"><a class="chat-mini" href="detail-paket.html?id=${encodeURIComponent(item.id)}">Lihat Detail</a><a class="arrow-round" href="${buildWhatsAppLink(item.whatsappText)}" target="_blank" rel="noopener" aria-label="Tanya paket">›</a></div></div></article>`;
}
function setupWhatsAppLinks() {
  document.querySelectorAll("[data-whatsapp]").forEach((el) => {
    const msg = el.getAttribute("data-message") || APP_CONFIG.defaultMessage;
    el.href = buildWhatsAppLink(msg);
  });
}
function setupMobileMenu() {
  const t = document.querySelector("[data-menu-toggle]"),
    m = document.querySelector("[data-nav-menu]");
  if (!t || !m) return;
  t.addEventListener("click", () => {
    m.classList.toggle("open");
    document.body.classList.toggle("no-scroll", m.classList.contains("open"));
  });
  m.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => {
      m.classList.remove("open");
      document.body.classList.remove("no-scroll");
    }),
  );
}
function setupYear() {
  const y = document.querySelector("[data-year]");
  if (y) y.textContent = new Date().getFullYear();
}
document.addEventListener("DOMContentLoaded", () => {
  setupWhatsAppLinks();
  setupMobileMenu();
  setupYear();
});
