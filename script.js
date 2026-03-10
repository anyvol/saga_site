document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector(".header");
  const toggle = document.querySelector(".nav-toggle");
  const navLinks = document.querySelectorAll(".nav a");

  const modal = document.getElementById("product-modal");
  const modalCloseButtons = modal
    ? modal.querySelectorAll(".modal-close")
    : null;
  const modalBackdrop = modal ? modal.querySelector(".modal-backdrop") : null;
  const modalTitle = modal ? modal.querySelector(".modal-title") : null;
  const modalLead = modal ? modal.querySelector(".modal-lead") : null;
  const modalList = modal ? modal.querySelector(".modal-list") : null;
  const modalLink = modal ? modal.querySelector(".modal-link") : null;
  const modalBooklet = modal ? modal.querySelector(".modal-booklet") : null;

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

  const contentModal = document.getElementById("content-modal");
  const contentModalBackdrop = contentModal
    ? contentModal.querySelector(".modal-backdrop")
    : null;
  const contentModalCloseButtons = contentModal
    ? contentModal.querySelectorAll(
        ".content-modal-close, .content-modal-close-bottom"
      )
    : null;
  const contentModalKicker = contentModal
    ? contentModal.querySelector("#content-modal-kicker")
    : null;
  const contentModalTitle = contentModal
    ? contentModal.querySelector("#content-modal-title")
    : null;
  const contentModalText = contentModal
    ? contentModal.querySelector("#content-modal-text")
    : null;

  const CAROUSEL_INTERVAL = 5000;
  const PRODUCT_INTERVAL = 4500;
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
          const y = target.getBoundingClientRect().top + window.scrollY - 72;
          window.scrollTo({ top: y, behavior: "smooth" });
        }

        if (header) {
          header.classList.remove("nav-open");
        }
      }
    });
  });

  const contentPages = {
    company: {
      kicker: "О корпорации",
      title: "АО «САГА Технологии»",
      body: `
        <p>Здесь будет динамический контент о корпорации. Этот блок можно позже наполнить реальными данными о компании, истории развития, производственной базе и ключевых направлениях деятельности.</p>
        <p>Пока используется аккуратная заглушка, чтобы проверить механику открытия окна из футера и из секции «О компании».</p>
      `
    },
    privacy: {
      kicker: "Документы",
      title: "Политика конфиденциальности",
      body: `
        <p>Здесь будет размещён текст политики конфиденциальности или краткая карточка с основными положениями и ссылкой на полный документ.</p>
        <p>Пока используется временная заглушка для проверки работы динамического окна.</p>
      `
    }
  };

  function openContentModal(key) {
    if (!contentModal || !contentPages[key]) return;

    const page = contentPages[key];

    if (contentModalKicker) contentModalKicker.textContent = page.kicker || "";
    if (contentModalTitle) contentModalTitle.textContent = page.title || "";
    if (contentModalText) contentModalText.innerHTML = page.body || "";

    contentModal.classList.add("is-open");
    contentModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeContentModal() {
    if (!contentModal) return;

    contentModal.classList.remove("is-open");
    contentModal.setAttribute("aria-hidden", "true");

    if (contentModalKicker) contentModalKicker.textContent = "";
    if (contentModalTitle) contentModalTitle.textContent = "";
    if (contentModalText) contentModalText.innerHTML = "";

    document.body.style.overflow = "";
  }

  document.querySelectorAll("[data-open-content]").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      const key = el.getAttribute("data-open-content");
      openContentModal(key);
    });
  });

  document.querySelectorAll("[data-scroll-to]").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      const id = el.getAttribute("data-scroll-to");
      const target = document.getElementById(id);

      if (!target) return;

      const y = target.getBoundingClientRect().top + window.scrollY - 72;
      window.scrollTo({ top: y, behavior: "smooth" });
    });
  });

  if (contentModalBackdrop) {
    contentModalBackdrop.addEventListener("click", closeContentModal);
  }

  if (contentModalCloseButtons) {
    contentModalCloseButtons.forEach((btn) => {
      btn.addEventListener("click", closeContentModal);
    });
  }

  const productConfig = {
    atm: {
      title: "Банкоматы SAGA",
      lead:
        "Российские банкоматы с современным дизайном и поддержкой рециркуляции наличных.",
      bullets: [
        "Экраны 19″, 27″ и 32″, удобный интерфейс клиента.",
        "Функция рециркуляции для оптимизации инкассации.",
        "Успешное прохождение испытаний Банка России.",
        "Включены в реестр российской промышленной продукции."
      ],
      slides: [
        {
          image: "assets/atms/saga_atm_19_front.jpg",
          title: "Банкоматы SAGA",
          subtitle: "Диагональ 19″"
        },
        {
          image: "assets/atms/saga_atm_27_front.jpg",
          title: "Банкоматы SAGA",
          subtitle: "Диагональ 27″"
        },
        {
          image: "assets/atms/saga_atm_32_front.jpg",
          title: "Банкоматы SAGA",
          subtitle: "Диагональ 32″"
        }
      ],
      link: "https://sagacorporation.com/products/bankomaty/",
      booklet: "assets/booklets/atm_booklet.pdf"
    },
    queue: {
      title: "Системы управления очередью",
      lead:
        "Комплексные решения для организации электронных очередей в офисах, МФЦ, банках и клиниках.",
      bullets: [
        "Гибкая настройка сценариев обслуживания и приоритетов.",
        "Понятный интерфейс для клиентов и персонала.",
        "Интеграция с информационными и платёжными сервисами.",
        "Статистика и аналитика по загруженности точек обслуживания."
      ],
      slides: [
        {
          image: "assets/qms/syo_19_saga_front.jpg",
          title: "Системы управления очередью",
          subtitle: "19″ вертикальная ориентация"
        },
        {
          image: "assets/qms/syo_19_saga_front_2.jpg",
          title: "Системы управления очередью",
          subtitle: "19″ горизонтальная ориентация"
        },
        {
          image: "assets/qms/syo_21_saga_front.jpg",
          title: "Системы управления очередью",
          subtitle: "21″ вертикальная ориентация"
        },
        {
          image: "assets/qms/syo_21_saga_front_2.jpg",
          title: "Системы управления очередью",
          subtitle: "21″ горизонтальная ориентация"
        },
        {
          image: "assets/qms/syo_27_saga_front.jpg",
          title: "Системы управления очередью",
          subtitle: "27″ вертикальная ориентация"
        },
        {
          image: "assets/qms/syo_32_saga_front.jpg",
          title: "Системы управления очередью",
          subtitle: "32″ вертикальная ориентация"
        }
      ],
      link: "https://sagacorporation.com/solutions/elektronnaya-ochered/",
      booklet: "assets/booklets/qms_booklet.pdf"
    },
    selfcheckout: {
      title: "Кассы самообслуживания SAGA",
      lead:
        "Линейка касс самообслуживания для розничной торговли и АЗС, сокращающая время обслуживания клиентов.",
      bullets: [
        "Поддержка различных сценариев оплаты и скидок.",
        "Интеграция с существующими POS и учётными системами.",
        "Удобный интерфейс для покупателей и персонала.",
        "Увеличение пропускной способности торговых точек."
      ],
      slides: [
        {
          image: "assets/ssc/ssc_21_front_2.jpg",
          title: "Кассы самообслуживания SAGA",
          subtitle: "Диагональ 21″"
        }
      ],
      link: "https://sagacorporation.com/products/kassy-samoobsluzhivaniya/",
      booklet: "assets/booklets/ssc_booklet.pdf"
    }
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

  function setupCarousel(images, title, startIndex = 0) {
    if (!carouselTrack || !images || !images.length) return;

    resetCarouselState();
    carouselImages = images.slice();

    images.forEach((src) => {
      const slide = document.createElement("div");
      slide.className = "modal-carousel-slide";

      const img = document.createElement("img");
      img.src = src;
      img.alt = title || "";

      img.addEventListener("click", () => {
        if (!lightbox || !lightboxImg) return;
        lightboxImg.src = src;
        lightboxImg.alt = title || "";
        lightbox.classList.add("is-open");
        lightbox.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
      });

      slide.appendChild(img);
      carouselTrack.appendChild(slide);
    });

    carouselIndex = Math.max(0, Math.min(startIndex, images.length - 1));
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

  function openProductModal(kind, startIndex = 0) {
    const config = productConfig[kind];
    if (!config || !modal) return;

    if (modalTitle) modalTitle.textContent = config.title || "";
    if (modalLead) modalLead.textContent = config.lead || "";

    if (modalList) {
      modalList.innerHTML = "";
      (config.bullets || []).forEach((text) => {
        const li = document.createElement("li");
        li.textContent = text;
        modalList.appendChild(li);
      });
    }

    if (modalLink) modalLink.href = config.link || "#";
    if (modalBooklet) modalBooklet.href = config.booklet || "#";

    setupCarousel(
      (config.slides || []).map((slide) => slide.image),
      config.title,
      startIndex
    );

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeProductModal() {
    if (!modal) return;

    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    resetCarouselState();
  }

  function closeLightbox() {
    if (!lightbox) return;

    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");

    if (lightboxImg) {
      lightboxImg.src = "";
      lightboxImg.alt = "";
    }

    if (modal && modal.classList.contains("is-open")) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
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
      } else {
        updateCarousel();
        startCarouselAuto();
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

  if (modalBackdrop) {
    modalBackdrop.addEventListener("click", closeProductModal);
  }

  if (modalCloseButtons) {
    modalCloseButtons.forEach((btn) => {
      btn.addEventListener("click", closeProductModal);
    });
  }

  if (lightboxBackdrop) {
    lightboxBackdrop.addEventListener("click", closeLightbox);
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (lightbox && lightbox.classList.contains("is-open")) {
        closeLightbox();
        return;
      }

      if (contentModal && contentModal.classList.contains("is-open")) {
        closeContentModal();
        return;
      }

      if (modal && modal.classList.contains("is-open")) {
        closeProductModal();
      }
    }

    if (modal && modal.classList.contains("is-open")) {
      if (e.key === "ArrowLeft") {
        goToPrevSlide();
      }

      if (e.key === "ArrowRight") {
        goToNextSlide();
      }
    }
  });

  function initProductCarousel(root, kind, slides) {
    const track = root.querySelector("[data-product-carousel-track]");
    const progressBar = root.querySelector("[data-product-carousel-progress]");
    const prevBtn = root.querySelector('[data-carousel-control="prev"]');
    const nextBtn = root.querySelector('[data-carousel-control="next"]');
    const openButtons = document.querySelectorAll(`[data-open-product="${kind}"]`);

    if (!track || !slides || !slides.length) return;

    let index = 0;
    let timer = null;
    let pointerId = null;
    let startX = 0;
    let deltaX = 0;

    track.innerHTML = "";

    slides.forEach((item, slideIndex) => {
      const slide = document.createElement("div");
      slide.className = "product-carousel-slide";

      const img = document.createElement("img");
      img.src = item.image;
      img.alt = item.alt || item.title || "";

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

      slide.appendChild(img);
      slide.appendChild(overlay);

      slide.addEventListener("click", () => {
        openProductModal(kind, slideIndex);
      });

      track.appendChild(slide);
    });

    const slidesEls = Array.from(
      track.querySelectorAll(".product-carousel-slide")
    );

    const paint = () => {
      slidesEls.forEach((el, i) => {
        el.classList.toggle("is-active", i === index);
      });

      if (progressBar) {
        progressBar.style.width = `${((index + 1) / slides.length) * 100}%`;
      }
    };

    const goPrev = () => {
      index = (index - 1 + slides.length) % slides.length;
      paint();
    };

    const goNext = () => {
      index = (index + 1) % slides.length;
      paint();
    };

    const restartAuto = () => {
      clearInterval(timer);

      if (slides.length > 1) {
        timer = setInterval(goNext, PRODUCT_INTERVAL);
      }
    };

    if (prevBtn) {
      prevBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        goPrev();
        restartAuto();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        goNext();
        restartAuto();
      });
    }

    openButtons.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        openProductModal(kind, index);
      });
    });

    track.addEventListener("pointerdown", (e) => {
      pointerId = e.pointerId;
      startX = e.clientX;
      deltaX = 0;
      track.setPointerCapture(pointerId);
      clearInterval(timer);
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
      }

      restartAuto();
    };

    track.addEventListener("pointerup", finishSwipe);
    track.addEventListener("pointercancel", finishSwipe);

    root.addEventListener("mouseenter", () => clearInterval(timer));
    root.addEventListener("mouseleave", restartAuto);

    paint();
    restartAuto();
  }

  const productCarousels = document.querySelectorAll("[data-product-carousel]");

  productCarousels.forEach((root) => {
    const kind = root.getAttribute("data-product-carousel");
    if (!kind || !productConfig[kind] || !productConfig[kind].slides) return;
    initProductCarousel(root, kind, productConfig[kind].slides);
  });
});
