document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector(".header");
  const toggle = document.querySelector(".nav-toggle");
  const navLinks = document.querySelectorAll(".nav a");
  const products = document.querySelectorAll(".product");
  const modal = document.getElementById("product-modal");
  const modalDialog = modal ? modal.querySelector(".modal-dialog") : null;
  const modalCloseButtons = modal ? modal.querySelectorAll(".modal-close") : null;
  const modalBackdrop = modal ? modal.querySelector(".modal-backdrop") : null;
  const modalTitle = modal ? modal.querySelector(".modal-title") : null;
  const modalLead = modal ? modal.querySelector(".modal-lead") : null;
  const modalList = modal ? modal.querySelector(".modal-list") : null;
  const modalLink = modal ? modal.querySelector(".modal-link") : null;
  const modalBooklet = modal ? modal.querySelector(".modal-booklet") : null;
  const carousel = modal ? modal.querySelector("[data-carousel]") : null;
  const carouselTrack = modal ? modal.querySelector("[data-carousel-track]") : null;
  const carouselProgress = modal ? modal.querySelector("[data-carousel-progress]") : null;

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
      images: [
        "assets/atms/saga_atm_19_front.jpg",
        "assets/atms/saga_atm_27_front.jpg",
        "assets/atms/saga_atm_32_front.jpg",
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
      images: [
        "assets/qms/syo_19_saga_front.jpg",
        "assets/qms/syo_19_saga_front_2.jpg",
        "assets/qms/syo_21_saga_front.jpg",
        "assets/qms/syo_21_saga_front_2.jpg",
        "assets/qms/syo_27_saga_front.jpg",
        "assets/qms/syo_32_saga_front.jpg",
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
      images: [
        "assets/ssc/ssc_21_front_1.jpg",
        "assets/ssc/ssc_21_front_2.jpg",
        "assets/ssc/ssc_21_front_3.jpg",
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
          carouselIndex = (carouselIndex + 1) % carouselImages.length;
        } else {
          carouselIndex =
            (carouselIndex - 1 + carouselImages.length) % carouselImages.length;
        }
        updateCarousel();
      }
      startCarouselAuto();
    };

    carouselTrack.addEventListener("pointerup", finishSwipe);
    carouselTrack.addEventListener("pointercancel", finishSwipe);
  }

  function openProductModal(kind) {
    if (!modal || !productConfig[kind]) return;
    const cfg = productConfig[kind];

    if (modalTitle) modalTitle.textContent = cfg.title;
    if (modalLead) modalLead.textContent = cfg.lead;
    if (cfg.images) {
      setupCarousel(cfg.images, cfg.title);
    } else {
      resetCarouselState();
    }
    if (modalList) {
      modalList.innerHTML = "";
      cfg.bullets.forEach((text) => {
        const li = document.createElement("li");
        li.textContent = text;
        modalList.appendChild(li);
      });
    }
    if (modalLink) {
      modalLink.href = cfg.link;
    }
    if (modalBooklet && cfg.booklet) {
      modalBooklet.href = cfg.booklet;
      modalBooklet.setAttribute("download", "");
      modalBooklet.style.display = "inline-flex";
    } else if (modalBooklet) {
      modalBooklet.removeAttribute("href");
      modalBooklet.style.display = "none";
    }

    modal.classList.add("is-open");
    document.body.style.overflow = "hidden";
  }

  function closeProductModal() {
    if (!modal) return;
    modal.classList.remove("is-open");
    document.body.style.overflow = "";
    clearInterval(carouselTimer);
    carouselTimer = null;
  }

  products.forEach((card) => {
    const kind = card.getAttribute("data-product");
    if (!kind) return;
    card.style.cursor = "pointer";
    card.addEventListener("click", (e) => {
      const target = e.target;
      if (target.closest && target.closest("a")) {
        return;
      }
      openProductModal(kind);
    });
  });

  if (modalCloseButtons) {
    modalCloseButtons.forEach((btn) => {
      btn.addEventListener("click", closeProductModal);
    });
  }
  if (modalBackdrop) {
    modalBackdrop.addEventListener("click", closeProductModal);
  }
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeProductModal();
    }
  });
});