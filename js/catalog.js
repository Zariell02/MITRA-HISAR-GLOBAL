let packageList = [];
function renderCategories(packages) {
  const s = document.querySelector("[data-category]");
  if (!s) return;
  const c = ["Semua", ...new Set(packages.map((i) => i.category))];
  s.innerHTML = c.map((x) => `<option value="${x}">${x}</option>`).join("");
}
function renderCatalog(packages) {
  const g = document.querySelector("[data-catalog]"),
    c = document.querySelector("[data-count]"),
    e = document.querySelector("[data-empty]");
  if (!g) return;
  g.innerHTML = packages.map(packageCard).join("");
  if (c) c.textContent = `${packages.length} paket tersedia`;
  if (e) e.style.display = packages.length ? "none" : "block";
}
function filterCatalog() {
  const k =
      document.querySelector("[data-search]")?.value.toLowerCase().trim() || "",
    cat = document.querySelector("[data-category]")?.value || "Semua",
    sort = document.querySelector("[data-sort]")?.value || "default";
  let f = packageList.filter(
    (i) =>
      [i.title, i.category, i.duration, i.departure, i.summary]
        .join(" ")
        .toLowerCase()
        .includes(k) &&
      (cat === "Semua" || i.category === cat),
  );
  if (sort === "price-low")
    f.sort(
      (a, b) => (a.price || Number.MAX_VALUE) - (b.price || Number.MAX_VALUE),
    );
  else if (sort === "price-high")
    f.sort((a, b) => (b.price || 0) - (a.price || 0));
  else if (sort === "name")
    f.sort((a, b) => a.title.localeCompare(b.title, "id-ID"));
  renderCatalog(f);
}
document.addEventListener("DOMContentLoaded", async () => {
  const g = document.querySelector("[data-catalog]");
  if (!g) return;
  try {
    packageList = await loadPackages();
    renderCategories(packageList);
    renderCatalog(packageList);
    document
      .querySelector("[data-search]")
      ?.addEventListener("input", filterCatalog);
    document
      .querySelector("[data-category]")
      ?.addEventListener("change", filterCatalog);
    document
      .querySelector("[data-sort]")
      ?.addEventListener("change", filterCatalog);
  } catch (e) {
    g.innerHTML = `<div class="notice">Data katalog gagal dimuat. Pastikan website dijalankan menggunakan server lokal.</div>`;
    console.error(e);
  }
});
