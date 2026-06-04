/* =========================================================
   CATALOG PAGE SCRIPT
   - Render katalog dari data/packages.json
   - Support product management:
     isActive, order, type, status, thumbnail
========================================================= */

let packageList = [];
let catalogUrlFilters = {
  type: "",
  status: "",
};

function escapeCatalogHTML(value = "") {
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

function normalizeCatalogText(value = "") {
  return String(value).toLowerCase().trim();
}

function getCatalogStatus(item = {}) {
  if (typeof getPackageStatus === "function") {
    return getPackageStatus(item);
  }

  return String(item.status || "available")
    .toLowerCase()
    .trim();
}

function getCatalogType(item = {}) {
  const rawText = [item.type, item.category, item.title, item.tag]
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

function getCatalogOrder(item = {}) {
  const order = Number(item.order);

  return Number.isFinite(order) ? order : 9999;
}

function getCatalogPrice(item = {}) {
  const price = Number(item.price || 0);

  return Number.isFinite(price) && price > 0 ? price : null;
}

function getCatalogSearchText(item = {}) {
  return [
    item.id,
    item.title,
    item.type,
    item.category,
    item.tag,
    item.duration,
    item.hotel,
    item.departure,
    item.priceLabel,
    item.status,
    item.statusLabel,
    item.summary,
    ...(Array.isArray(item.features) ? item.features : []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function getActivePackages(packages = []) {
  return packages
    .filter((item) => item && item.isActive !== false)
    .sort((a, b) => {
      const orderDiff = getCatalogOrder(a) - getCatalogOrder(b);

      if (orderDiff !== 0) return orderDiff;

      return String(a.title || "").localeCompare(
        String(b.title || ""),
        "id-ID",
      );
    });
}

function renderCategories(packages = []) {
  const select = document.querySelector("[data-category]");

  if (!select) return;

  const categories = [
    "Semua",
    ...new Set(packages.map((item) => item.category).filter(Boolean)),
  ];

  select.innerHTML = categories
    .map((category) => {
      const safeCategory = escapeCatalogHTML(category);

      return `<option value="${safeCategory}">${safeCategory}</option>`;
    })
    .join("");
}

function renderCatalog(packages = []) {
  const grid = document.querySelector("[data-catalog]");
  const count = document.querySelector("[data-count]");
  const empty = document.querySelector("[data-empty]");

  if (!grid) return;

  if (!packages.length) {
    grid.innerHTML = "";

    if (count) {
      count.textContent = "0 paket tersedia";
    }

    if (empty) {
      empty.style.display = "block";
    }

    return;
  }

  grid.innerHTML = packages.map(packageCard).join("");

  if (count) {
    count.textContent = `${packages.length} paket tersedia`;
  }

  if (empty) {
    empty.style.display = "none";
  }
}

function sortCatalog(packages = [], sort = "default") {
  const sortedPackages = [...packages];

  if (sort === "price-low") {
    sortedPackages.sort((a, b) => {
      const priceA = getCatalogPrice(a) ?? Number.MAX_SAFE_INTEGER;
      const priceB = getCatalogPrice(b) ?? Number.MAX_SAFE_INTEGER;

      return priceA - priceB;
    });

    return sortedPackages;
  }

  if (sort === "price-high") {
    sortedPackages.sort((a, b) => {
      const priceA = getCatalogPrice(a) ?? -1;
      const priceB = getCatalogPrice(b) ?? -1;

      return priceB - priceA;
    });

    return sortedPackages;
  }

  if (sort === "name") {
    sortedPackages.sort((a, b) =>
      String(a.title || "").localeCompare(String(b.title || ""), "id-ID"),
    );

    return sortedPackages;
  }

  sortedPackages.sort((a, b) => {
    const orderDiff = getCatalogOrder(a) - getCatalogOrder(b);

    if (orderDiff !== 0) return orderDiff;

    return String(a.title || "").localeCompare(String(b.title || ""), "id-ID");
  });

  return sortedPackages;
}

function filterCatalog() {
  const searchKeyword =
    document.querySelector("[data-search]")?.value.toLowerCase().trim() || "";

  const selectedCategory =
    document.querySelector("[data-category]")?.value || "Semua";

  const selectedSort =
    document.querySelector("[data-sort]")?.value || "default";

  const selectedType = normalizeCatalogText(catalogUrlFilters.type);
  const selectedStatus = normalizeCatalogText(catalogUrlFilters.status);

  let filteredPackages = packageList.filter((item) => {
    const searchText = getCatalogSearchText(item);
    const itemType = getCatalogType(item);
    const itemStatus = getCatalogStatus(item);

    const matchKeyword = !searchKeyword || searchText.includes(searchKeyword);

    const matchCategory =
      selectedCategory === "Semua" || item.category === selectedCategory;

    const matchType =
      !selectedType ||
      itemType === selectedType ||
      searchText.includes(selectedType);

    const matchStatus =
      !selectedStatus ||
      itemStatus === selectedStatus ||
      searchText.includes(selectedStatus);

    return matchKeyword && matchCategory && matchType && matchStatus;
  });

  filteredPackages = sortCatalog(filteredPackages, selectedSort);

  renderCatalog(filteredPackages);
}

function applyCatalogUrlParams() {
  const params = new URLSearchParams(window.location.search);

  const query = params.get("q") || params.get("search") || "";
  const category = params.get("category") || "";
  const type = params.get("type") || "";
  const status = params.get("status") || "";

  const searchInput = document.querySelector("[data-search]");
  const categorySelect = document.querySelector("[data-category]");

  catalogUrlFilters = {
    type,
    status,
  };

  if (searchInput && query) {
    searchInput.value = query;
  }

  if (categorySelect && category) {
    const isCategoryAvailable = Array.from(categorySelect.options).some(
      (option) => option.value === category,
    );

    if (isCategoryAvailable) {
      categorySelect.value = category;
    }
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const grid = document.querySelector("[data-catalog]");

  if (!grid) return;

  try {
    const rawPackages = await loadPackages();

    packageList = getActivePackages(rawPackages);

    renderCategories(packageList);
    applyCatalogUrlParams();
    filterCatalog();

    document
      .querySelector("[data-search]")
      ?.addEventListener("input", filterCatalog);

    document
      .querySelector("[data-category]")
      ?.addEventListener("change", filterCatalog);

    document
      .querySelector("[data-sort]")
      ?.addEventListener("change", filterCatalog);
  } catch (error) {
    grid.innerHTML = `
      <div class="notice">
        Data katalog gagal dimuat. Pastikan website dijalankan menggunakan server lokal atau hosting.
      </div>
    `;

    console.error(error);
  }
});
