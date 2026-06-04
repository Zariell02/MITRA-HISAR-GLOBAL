/* =========================================================
   SPLIT CATALOG SCRIPT
   Untuk halaman:
   - haji.html
   - umrah.html
   - tabungan-umroh.html
========================================================= */

let splitCatalogProducts = [];

const SPLIT_CATALOG_CONFIG = {
  haji: {
    label: "haji",
    includeTypes: ["haji"],
  },
  umrah: {
    label: "umrah",
    includeTypes: ["umrah"],
    excludeKeywords: ["tabungan", "talangan", "cicilan", "pembiayaan"],
  },
  tabungan: {
    label: "tabungan umroh",
    includeTypes: ["tabungan", "pembiayaan"],
    includeKeywords: ["tabungan", "talangan", "cicilan", "btpn", "bukopin"],
  },
};

function splitNormalize(value = "") {
  return String(value).toLowerCase().trim();
}

function splitSearchText(item = {}) {
  return [
    item.id,
    item.title,
    item.type,
    item.category,
    item.tag,
    item.status,
    item.statusLabel,
    item.departure,
    item.duration,
    item.hotel,
    item.priceLabel,
    item.summary,
    ...(Array.isArray(item.features) ? item.features : []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function splitGetType(item = {}) {
  const rawText = splitSearchText(item);

  if (item.type) return splitNormalize(item.type);

  if (rawText.includes("haji")) return "haji";

  if (
    rawText.includes("tabungan") ||
    rawText.includes("talangan") ||
    rawText.includes("cicilan") ||
    rawText.includes("pembiayaan") ||
    rawText.includes("btpn") ||
    rawText.includes("bukopin")
  ) {
    return "tabungan";
  }

  return "umrah";
}

function splitGetStatus(item = {}) {
  if (typeof getPackageStatus === "function") {
    return getPackageStatus(item);
  }

  return splitNormalize(item.status || "available");
}

function splitGetOrder(item = {}) {
  const order = Number(item.order);
  return Number.isFinite(order) ? order : 9999;
}

function splitGetPrice(item = {}) {
  const price = Number(item.price || 0);
  return Number.isFinite(price) && price > 0 ? price : null;
}

function splitIsProductAllowed(item = {}, mode = "umrah") {
  const config = SPLIT_CATALOG_CONFIG[mode];

  if (!config) return false;

  if (item.isActive === false) return false;

  const productType = splitGetType(item);
  const searchText = splitSearchText(item);

  const matchType = config.includeTypes.includes(productType);

  const matchIncludeKeyword = Array.isArray(config.includeKeywords)
    ? config.includeKeywords.some((keyword) => searchText.includes(keyword))
    : false;

  const matchExcludeKeyword = Array.isArray(config.excludeKeywords)
    ? config.excludeKeywords.some((keyword) => searchText.includes(keyword))
    : false;

  if (matchExcludeKeyword) return false;

  return matchType || matchIncludeKeyword;
}

function splitRenderCategories(products = []) {
  const categorySelect = document.querySelector("[data-split-category]");
  if (!categorySelect) return;

  const categories = [
    "Semua",
    ...new Set(products.map((item) => item.category).filter(Boolean)),
  ];

  categorySelect.innerHTML = categories
    .map((category) => `<option value="${category}">${category}</option>`)
    .join("");
}

function splitSortProducts(products = [], sort = "default") {
  const result = [...products];

  if (sort === "name") {
    return result.sort((a, b) =>
      String(a.title || "").localeCompare(String(b.title || ""), "id-ID"),
    );
  }

  if (sort === "price-low") {
    return result.sort((a, b) => {
      const priceA = splitGetPrice(a) ?? Number.MAX_SAFE_INTEGER;
      const priceB = splitGetPrice(b) ?? Number.MAX_SAFE_INTEGER;
      return priceA - priceB;
    });
  }

  if (sort === "price-high") {
    return result.sort((a, b) => {
      const priceA = splitGetPrice(a) ?? -1;
      const priceB = splitGetPrice(b) ?? -1;
      return priceB - priceA;
    });
  }

  return result.sort((a, b) => {
    const orderDiff = splitGetOrder(a) - splitGetOrder(b);

    if (orderDiff !== 0) return orderDiff;

    return String(a.title || "").localeCompare(String(b.title || ""), "id-ID");
  });
}

function splitRenderProducts(products = []) {
  const grid = document.querySelector("[data-split-grid]");
  const count = document.querySelector("[data-split-count]");
  const empty = document.querySelector("[data-split-empty]");

  if (!grid) return;

  if (!products.length) {
    grid.innerHTML = "";

    if (count) count.textContent = "0 produk tersedia";
    if (empty) empty.style.display = "block";

    return;
  }

  grid.innerHTML = products.map(packageCard).join("");

  if (count) count.textContent = `${products.length} produk tersedia`;
  if (empty) empty.style.display = "none";
}

function splitApplyUrlQuery() {
  const params = new URLSearchParams(window.location.search);
  const query = params.get("q") || params.get("search") || "";
  const searchInput = document.querySelector("[data-split-search]");

  if (searchInput && query) {
    searchInput.value = query;
  }
}

function splitFilterProducts() {
  const keyword =
    document.querySelector("[data-split-search]")?.value.toLowerCase().trim() ||
    "";

  const category =
    document.querySelector("[data-split-category]")?.value || "Semua";

  const status = document.querySelector("[data-split-status]")?.value || "";

  const sort = document.querySelector("[data-split-sort]")?.value || "default";

  let filtered = splitCatalogProducts.filter((item) => {
    const text = splitSearchText(item);

    const matchKeyword = !keyword || text.includes(keyword);

    const matchCategory = category === "Semua" || item.category === category;

    const matchStatus = !status || splitGetStatus(item) === status;

    return matchKeyword && matchCategory && matchStatus;
  });

  filtered = splitSortProducts(filtered, sort);

  splitRenderProducts(filtered);
}

document.addEventListener("DOMContentLoaded", async () => {
  const catalogRoot = document.querySelector("[data-split-catalog]");

  if (!catalogRoot) return;

  const mode = catalogRoot.dataset.splitCatalog || "umrah";

  try {
    const products = await loadPackages();

    splitCatalogProducts = products.filter((item) =>
      splitIsProductAllowed(item, mode),
    );

    splitCatalogProducts = splitSortProducts(splitCatalogProducts, "default");

    splitRenderCategories(splitCatalogProducts);
    splitApplyUrlQuery();
    splitFilterProducts();

    document
      .querySelector("[data-split-search]")
      ?.addEventListener("input", splitFilterProducts);

    document
      .querySelector("[data-split-category]")
      ?.addEventListener("change", splitFilterProducts);

    document
      .querySelector("[data-split-status]")
      ?.addEventListener("change", splitFilterProducts);

    document
      .querySelector("[data-split-sort]")
      ?.addEventListener("change", splitFilterProducts);
  } catch (error) {
    const grid = document.querySelector("[data-split-grid]");

    if (grid) {
      grid.innerHTML = `
        <div class="notice">
          Data katalog gagal dimuat. Pastikan website dijalankan melalui server lokal atau hosting.
        </div>
      `;
    }

    console.error(error);
  }
});
