document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector(".header");
  const toggle = document.querySelector(".nav-toggle");
  const navLinks = document.querySelectorAll(".nav a");
  const products = document.querySelectorAll(".product");
  const modal = document.getElementById("product-modal");
  const modalDialog = modal ? modal.querySelector(".modal-dialog") : null;
  const modalClose = modal ? modal.querySelector(".modal-close") : null;
  const modalBackdrop = modal ? modal.querySelector(".modal-backdrop") : null;
  const modalTitle = modal ? modal.querySelector(".modal-title") : null;
  const modalLead = modal ? modal.querySelector(".modal-lead") : null;
  const modalList = modal ? modal.querySelector(".modal-list") : null;
  const modalImage = modal ? modal.querySelector(".modal-image") : null;
  const modalLink = modal ? modal.querySelector(".modal-link") : null;

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
      image: "assets/atms/6e9d836c342f688c47f924c5f2a8926c.jpg",
      link: "https://sagacorporation.com/products/bankomaty/",
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
      image: "assets/pre.png",
      link: "https://sagacorporation.com/solutions/elektronnaya-ochered/",
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
      image: "assets/logo-small_v3.png",
      link: "https://sagacorporation.com/products/kassy-samoobsluzhivaniya/",
    },
  };

  function openProductModal(kind) {
    if (!modal || !productConfig[kind]) return;
    const cfg = productConfig[kind];

    if (modalTitle) modalTitle.textContent = cfg.title;
    if (modalLead) modalLead.textContent = cfg.lead;
    if (modalImage) {
      modalImage.src = cfg.image;
      modalImage.alt = cfg.title;
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

    modal.classList.add("is-open");
    document.body.style.overflow = "hidden";
  }

  function closeProductModal() {
    if (!modal) return;
    modal.classList.remove("is-open");
    document.body.style.overflow = "";
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

  if (modalClose) {
    modalClose.addEventListener("click", closeProductModal);
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