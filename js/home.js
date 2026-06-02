document.addEventListener("DOMContentLoaded", async () => {
  const featured = document.querySelector("[data-featured]");
  if (!featured) return;
  try {
    const packages = await loadPackages();
    featured.innerHTML = packages.slice(0, 3).map(packageCard).join("");
  } catch (e) {
    featured.innerHTML = `<div class="notice">Data paket belum berhasil dimuat. Jalankan melalui server lokal atau deploy ke hosting.</div>`;
    console.error(e);
  }
});
