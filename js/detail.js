function listItems(items = []) {
  return items.map((i) => `<li>${i}</li>`).join("");
}
function renderDetail(item) {
  document.title = `${item.title} | Mitra HisarGlobal`;
  const c = document.querySelector("[data-detail]");
  if (!c) return;
  c.innerHTML = `<div class="detail-layout"><aside class="detail-image"><img src="${item.image}" alt="${item.title}"></aside><section class="detail-info"><div class="detail-card"><span class="kicker">${item.category}</span><h1 style="margin-top:14px;">${item.title}</h1><p class="lead" style="margin-top:12px;">${item.summary}</p><div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:22px;"><a class="btn btn-primary" href="${buildWhatsAppLink(item.whatsappText)}" target="_blank" rel="noopener">Tanya Paket via WhatsApp</a><a class="btn btn-outline" href="paket.html">Kembali ke Katalog</a></div></div><div class="detail-card"><h3>Informasi Paket</h3><table class="info-table"><tr><th>Kategori</th><td>${item.category}</td></tr><tr><th>Durasi</th><td>${item.duration}</td></tr><tr><th>Hotel</th><td>${item.hotel}</td></tr><tr><th>Keberangkatan</th><td>${item.departure}</td></tr><tr><th>Harga</th><td>${item.priceLabel || formatRupiah(item.price)}</td></tr></table></div><div class="detail-card"><h3>Fasilitas / Informasi Awal</h3><ul class="list-check">${listItems(item.features)}</ul></div><div class="notice">${item.notes}</div></section></div>`;
}
document.addEventListener("DOMContentLoaded", async () => {
  const c = document.querySelector("[data-detail]");
  if (!c) return;
  const id = new URLSearchParams(window.location.search).get("id");
  if (!id) {
    c.innerHTML = `<div class="notice">ID paket tidak ditemukan. Silakan kembali ke katalog.</div>`;
    return;
  }
  try {
    const p = await loadPackages(),
      item = p.find((x) => x.id === id);
    if (!item) {
      c.innerHTML = `<div class="notice">Paket tidak ditemukan. Silakan cek kembali katalog.</div>`;
      return;
    }
    renderDetail(item);
  } catch (e) {
    c.innerHTML = `<div class="notice">Detail paket gagal dimuat.</div>`;
    console.error(e);
  }
});
