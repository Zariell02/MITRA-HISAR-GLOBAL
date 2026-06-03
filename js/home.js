/* =========================================================
   HOME PAGE SCRIPT
   - Featured package loader
   - Banner slider homepage
========================================================= */

/* Banner slider poster promo */
function setupHomeBannerSlider() {
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

  // Pause saat cursor berada di atas banner
  slider.addEventListener("mouseenter", stopAutoSlide);
  slider.addEventListener("mouseleave", startAutoSlide);

  // Swipe support untuk mobile
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

/* Featured packages lama, tetap dipertahankan */
async function setupFeaturedPackages() {
  const featured = document.querySelector("[data-featured]");

  if (!featured) return;

  try {
    const packages = await loadPackages();
    featured.innerHTML = packages.slice(0, 3).map(packageCard).join("");
  } catch (error) {
    featured.innerHTML = `
      <div class="notice">
        Data paket belum berhasil dimuat. Jalankan melalui server lokal atau deploy ke hosting.
      </div>
    `;

    console.error(error);
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  setupHomeBannerSlider();
  await setupFeaturedPackages();
});