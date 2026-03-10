document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector(".header");
  const toggle = document.querySelector(".nav-toggle");
  const navLinks = document.querySelectorAll(".nav a");
  const products = document.querySelectorAll(".product");
  const modal = document.getElementById("product-modal");
  const modalDialog = modal ? modal.querySelector(".modal-dialog") : null;
  const modalCloseButtons = modal
    ? modal.querySelectorAll(".modal-close")
    : null;
  const modalBackdrop = modal ? modal.querySelector(".modal-backdrop") : null;
  const modalTitle = modal ? modal.querySelector(".modal-title") : null;
  const modalLead = modal ? modal.querySelector(".modal-lead") : null;
  const modalList = modal ? modal.querySelector(".modal-list") : null;
  const modalLink = modal ? modal.querySelector(".modal-link") : null;
  const modalBooklet = modal ? modal.querySelector(".modal-booklet") : null;
  const carousel = modal ? modal.querySelector("[data-carousel]") : null;
  const carouselTrack = modal
    ? modal.querySelector("[data-carousel-track]")
    : null;
  const carouselProgress = modal
    ? modal.querySelector("[data-carousel-progress]")
    : null;
  const carouselPrev = modal ? modal.querySelector("[data-carousel-prev]") : null;
  const carouselNext = modal ? modal.querySelector("[data-carousel-next]") : null;
  const lightbox = document.getElementById("image-lightbox");
  const lightboxImg = lightbox
    ? lightbox.querySelector(".image-lightbox-img")
    : null;
  const lightboxBackdrop = lightbox
    ? lightbox.querySelector(".image-lightbox-backdrop")
    : null;

  const CAROUSEL_INTERVAL = 5000;
  const SWIPE_THRESHOLD = 40;
  let carouselTimer = null;
  let carouselIndex = 0;
  let carouselImages = [];
  let carouselPointerId = null;
  let carouselStartX = 0;
  let carouselDeltaX = 0;

  if (toggle && header) {
    toggle.addEventListener("click", () => {
      header.classList.toggle("nav-open");
    });
  }

  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      const href = link.getAttribute("href");
      if (href && href.startsWith("#")) {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          const y =
            target.getBoundingClientRect().top + window.scrollY - 72;
          window.scrollTo({ top: y, behavior: "smooth" });
        }
        if (header) {
          header.classList.remove("nav-open");
        }
      }
    });
  });

  const productConfig = {
    atm: {
      title: "Банкоматы SAGA",
      lead:
        "Российские банкоматы с современным дизайном и поддержкой рециркуляции наличных.",
      bullets: [
        "Экраны 19″, 27″ и 32″, удобный интерфейс клиента.",
        "Функция рециркуляции для оптимизации инкассации.",
        "Успешное прохождение испытаний Банка России.",
        "Включены в реестр российской промышленной продукции.",
      ],
      slides: [
        {
          image: "assets/atms/saga_atm_19_front.jpg",
          title: "Банкоматы SAGA",
          subtitle: "Диагональ 19″",
        },
        {
          image: "assets/atms/saga_atm_27_front.jpg",
          title: "Банкоматы SAGA",
          subtitle: "Диагональ 27″",
        },
        {
          image: "assets/atms/saga_atm_32_front.jpg",
          title: "Банкоматы SAGA",
          subtitle: "Диагональ 32″",
        },
      ],
      link: "https://sagacorporation.com/products/bankomaty/",
      booklet: "assets/booklets/atm_booklet.pdf",
    },
    queue: {
      title: "Системы управления очередью",
      lead:
        "Комплексные решения для организации электронных очередей в офисах, МФЦ, банках и клиниках.",
      bullets: [
        "Гибкая настройка сценариев обслуживания и приоритетов.",
        "Понятный интерфейс для клиентов и персонала.",
        "Интеграция с информационными и платёжными сервисами.",
        "Статистика и аналитика по загруженности точек обслуживания.",
      ],
      slides: [
        {
          image: "assets/qms/syo_19_saga_front.jpg",
          title: "Системы управления очередью",
          subtitle: "Диагональ 19″",
        },
        {
          image: "assets/qms/syo_21_saga_front.jpg",
          title: "Системы управления очередью",
          subtitle: "Диагональ 21″",
        },
        {
          image: "assets/qms/syo_27_saga_front.jpg",
          title: "Системы управления очередью",
          subtitle: "Диагональ 27″",
        },
        {
          image: "assets/qms/syo_32_saga_front.jpg",
          title: "Системы управления очередью",
          subtitle: "Диагональ 32″",
        },
      ],
      link: "https://sagacorporation.com/solutions/elektronnaya-ochered/",
      booklet: "assets/booklets/qms_booklet.pdf",
    },
    selfcheckout: {
      title: "Кассы самообслуживания SAGA",
      lead:
        "Линейка касс самообслуживания для розничной торговли и АЗС, сокращающая время обслуживания клиентов.",
      bullets: [
        "Поддержка различных сценариев оплаты и скидок.",
        "Интеграция с существующими POS и учётными системами.",
        "Удобный интерфейс для покупателей и персонала.",
        "Увеличение пропускной способности торговых точек.",
      ],
      slides: [
        {
          image: "assets/ssc/ssc_21_front_2.jpg",
          title: "Кассы самообслуживания SAGA",
          subtitle: "Диагональ 21″",
        },
      ],
      link: "https://sagacorporation.com/products/kassy-samoobsluzhivaniya/",
      booklet: "assets/booklets/ssc_booklet.pdf",
    },
  };

  function resetCarouselState() {
    if (!carouselTrack) return;
    clearInterval(carouselTimer);
    carouselTimer = null;
    carouselIndex = 0;
    carouselImages = [];
    carouselPointerId = null;
    carouselStartX = 0;
    carouselDeltaX = 0;
    carouselTrack.style.transform = "translateX(0)";
    carouselTrack.innerHTML = "";
    if (carouselProgress) {
      carouselProgress.style.transition = "none";
      carouselProgress.style.width = "0%";
    }
  }

  function startCarouselProgress() {
    if (!carouselProgress) return;
    carouselProgress.style.transition = "none";
    carouselProgress.style.width = "0%";
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        carouselProgress.style.transition = `width ${CAROUSEL_INTERVAL}ms linear`;
        carouselProgress.style.width = "100%";
      });
    });
  }

  function updateCarousel() {
    if (!carouselTrack || !carouselImages.length) return;
    carouselTrack.style.transform = `translateX(-${carouselIndex * 100}%)`;
    startCarouselProgress();
  }

  function startCarouselAuto() {
    clearInterval(carouselTimer);
    if (!carouselImages.length || carouselImages.length === 1) {
      startCarouselProgress();
      return;
    }
    startCarouselProgress();
    carouselTimer = setInterval(() => {
      carouselIndex = (carouselIndex + 1) % carouselImages.length;
      updateCarousel();
    }, CAROUSEL_INTERVAL);
  }

  function setupCarousel(images, title) {
    if (!carouselTrack || !images || !images.length) return;
    resetCarouselState();
    carouselImages = images.slice();
    images.forEach((src) => {
      const slide = document.createElement("div");
      slide.className = "modal-carousel-slide";
      const img = document.createElement("img");
      img.src = src;
      img.alt = title || "";
      slide.appendChild(img);
      carouselTrack.appendChild(slide);
    });
    carouselIndex = 0;
    updateCarousel();
    startCarouselAuto();
  }

  function goToPrevSlide() {
    if (!carouselImages.length) return;
    carouselIndex =
      (carouselIndex - 1 + carouselImages.length) % carouselImages.length;
    updateCarousel();
    startCarouselAuto();
  }

  function goToNextSlide() {
    if (!carouselImages.length) return;
    carouselIndex = (carouselIndex + 1) % carouselImages.length;
    updateCarousel();
    startCarouselAuto();
  }

  if (carouselTrack) {
    carouselTrack.addEventListener("pointerdown", (e) => {
      if (!carouselImages.length) return;
      carouselPointerId = e.pointerId;
      carouselStartX = e.clientX;
      carouselDeltaX = 0;
      carouselTrack.setPointerCapture(carouselPointerId);
      clearInterval(carouselTimer);
      if (carouselProgress) {
        carouselProgress.style.transition = "none";
      }
    });

    carouselTrack.addEventListener("pointermove", (e) => {
      if (carouselPointerId === null || e.pointerId !== carouselPointerId) return;
      carouselDeltaX = e.clientX - carouselStartX;
    });

    const finishSwipe = (e) => {
      if (carouselPointerId === null || e.pointerId !== carouselPointerId) return;
      const delta = carouselDeltaX;
      carouselTrack.releasePointerCapture(carouselPointerId);
      carouselPointerId = null;
      carouselDeltaX = 0;

      if (Math.abs(delta) > SWIPE_THRESHOLD && carouselImages.length > 1) {
        if (delta < 0) {
          goToNextSlide();
        } else {
          goToPrevSlide();
        }
      }
    };

    carouselTrack.addEventListener("pointerup", finishSwipe);
    carouselTrack.addEventListener("pointercancel", finishSwipe);
  }

  if (carouselPrev) {
    carouselPrev.addEventListener("click", (e) => {
      e.stopPropagation();
      goToPrevSlide();
    });
  }

  if (carouselNext) {
    carouselNext.addEventListener("click", (e) => {
      e.stopPropagation();
      goToNextSlide();
    });
  }

  function initProductCarousel(root, slides) {
    const track = root.querySelector("[data-product-carousel-track]");
    const progress = root.querySelector("[data-product-carousel-progress]");
    const prev = root.querySelector('[data-carousel-control="prev"]');
    const next = root.querySelector('[data-carousel-control="next"]');
    if (!track || !slides || !slides.length) return;

    let index = 0;

    track.innerHTML = "";
    slides.forEach((item) => {
      const slide = document.createElement("div");
      slide.className = "product-carousel-slide";
      const img = document.createElement("img");
      img.src = item.image;
      img.alt = item.alt || "";
      slide.appendChild(img);

      const overlay = document.createElement("div");
      overlay.className = "product-carousel-overlay";
      const overlayInner = document.createElement("div");
      overlayInner.className = "product-carousel-overlay-inner";
      const tag = document.createElement("div");
      tag.className = "product-carousel-tag";
      tag.textContent = item.tag || item.title || "";
      const title = document.createElement("div");
      title.className = "product-carousel-title";
      title.textContent = item.subtitle || "";
      overlayInner.appendChild(tag);
      overlayInner.appendChild(title);
      overlay.appendChild(overlayInner);
      slide.appendChild(overlay);

      track.appendChild(slide);
    });

    const slidesEls = Array.from(
      track.querySelectorAll(".product-carousel-slide")
    );

    const update = () => {
      track.style.transform = `translateX(-${index * 100}%)`;
      slidesEls.forEach((el, i) => {
        if (i === index) {
          el.classList.add("is-active");
        } else {
          el.classList.remove("is-active");
        }
      });
    };

    const goPrev = () => {
      index = (index - 1 + slides.length) % slides.length;
      update();
    };

    const goNext = () => {
      index = (index + 1) % slides.length;
      update();
    };

    if (prev) {
      prev.addEventListener("click", (e) => {
        e.stopPropagation();
        goPrev();
      });
    }

    if (next) {
      next.addEventListener("click", (e) => {
        e.stopPropagation();
        goNext();
      });
    }

    let pointerId = null;
    let startX = 0;
    let deltaX = 0;

    track.addEventListener("pointerdown", (e) => {
      pointerId = e.pointerId;
      startX = e.clientX;
      deltaX = 0;
      track.setPointerCapture(pointerId);
    });

    track.addEventListener("pointermove", (e) => {
      if (pointerId === null || e.pointerId !== pointerId) return;
      deltaX = e.clientX - startX;
    });

    const finishSwipe = (e) => {
      if (pointerId === null || e.pointerId !== pointerId) return;
      const delta = deltaX;
      track.releasePointerCapture(pointerId);
      pointerId = null;
      deltaX = 0;

      if (Math.abs(delta) > SWIPE_THRESHOLD) {
        if (delta < 0) {
          goNext();
        } else {
          goPrev();
        }
      } else {
        update();
      }
    };

    track.addEventListener("pointerup", finishSwipe);
    track.addEventListener("pointercancel", finishSwipe);

    update();
  }

  const productCarousels = document.querySelectorAll("[data-product-carousel]");
  productCarousels.forEach((root) => {
    const kind = root.getAttribute("data-product-carousel");
    if (!kind || !productConfig[kind] || !productConfig[kind].slides) return;
    initProductCarousel(root, productConfig[kind].slides);
  });
});