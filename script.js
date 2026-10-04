const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector(".site-nav");

if (menuToggle && siteNav) {
  const closeMenu = () => {
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Abrir menu");
    siteNav.classList.remove("is-open");
    document.body.classList.remove("menu-open");
  };

  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";

    menuToggle.setAttribute("aria-expanded", String(!isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Abrir menu" : "Fechar menu");
    siteNav.classList.toggle("is-open", !isOpen);
    document.body.classList.toggle("menu-open", !isOpen);
  });

  siteNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  });
}

const currentYear = document.querySelector("#current-year");
if (currentYear) {
  currentYear.textContent = String(new Date().getFullYear());
}

document.querySelectorAll(".book-description-toggle").forEach((button) => {
  const description = document.getElementById(button.getAttribute("aria-controls"));
  const label = button.firstChild;

  if (!description || !label) {
    return;
  }

  button.addEventListener("click", () => {
    const isExpanded = button.getAttribute("aria-expanded") === "true";
    button.setAttribute("aria-expanded", String(!isExpanded));
    description.hidden = isExpanded;
    label.textContent = isExpanded ? "Ver mais " : "Ver menos ";
  });
});

const bookTabs = [...document.querySelectorAll(".book-tab")];
const shelfPanels = [...document.querySelectorAll(".book-shelf-panel")];

const activateBookTab = (tab, moveFocus = false) => {
  bookTabs.forEach((item) => {
    const isSelected = item === tab;
    item.setAttribute("aria-selected", String(isSelected));
    item.tabIndex = isSelected ? 0 : -1;
  });

  shelfPanels.forEach((panel) => {
    panel.hidden = panel.id !== tab.getAttribute("aria-controls");
    updateShelfControls(panel);
  });

  if (moveFocus) {
    tab.focus();
  }
};

bookTabs.forEach((tab, index) => {
  tab.addEventListener("click", () => activateBookTab(tab));

  tab.addEventListener("keydown", (event) => {
    let nextIndex;

    if (event.key === "ArrowRight") {
      nextIndex = (index + 1) % bookTabs.length;
    } else if (event.key === "ArrowLeft") {
      nextIndex = (index - 1 + bookTabs.length) % bookTabs.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = bookTabs.length - 1;
    } else {
      return;
    }

    event.preventDefault();
    activateBookTab(bookTabs[nextIndex], true);
  });
});

const shelfGrids = [...document.querySelectorAll(".book-grid")];

const updateShelfControls = (panel) => {
  const grid = panel.querySelector(".book-grid");
  if (!grid) {
    return;
  }

  const hasOverflow = grid.scrollWidth > grid.clientWidth + 1;
  const atStart = grid.scrollLeft <= 1;
  const atEnd = grid.scrollLeft + grid.clientWidth >= grid.scrollWidth - 1;

  panel.querySelectorAll(".shelf-arrow").forEach((button) => {
    const direction = Number(button.dataset.direction);
    button.disabled = !hasOverflow || (direction < 0 ? atStart : atEnd);
  });
};

shelfPanels.forEach((panel) => {
  const grid = panel.querySelector(".book-grid");
  if (!grid) {
    return;
  }

  const syncControls = () => updateShelfControls(panel);
  grid.addEventListener("scroll", syncControls, { passive: true });
  panel.querySelectorAll(".shelf-arrow").forEach((button) => {
    button.addEventListener("click", () => {
      const card = grid.querySelector(".book-card, .phase-empty-card");
      const gap = Number.parseFloat(getComputedStyle(grid).columnGap) || 0;
      const distance = card ? card.getBoundingClientRect().width + gap : grid.clientWidth * 0.8;
      grid.scrollBy({
        left: distance * Number(button.dataset.direction),
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
      });
    });
  });

  let dragStartX = 0;
  let scrollStart = 0;
  let didDrag = false;

  grid.addEventListener("pointerdown", (event) => {
    if (event.pointerType !== "mouse" || event.button !== 0 || event.target.closest("a, button, summary, details")) {
      return;
    }

    dragStartX = event.clientX;
    scrollStart = grid.scrollLeft;
    didDrag = false;
    grid.setPointerCapture(event.pointerId);
  });

  grid.addEventListener("pointermove", (event) => {
    if (!grid.hasPointerCapture(event.pointerId)) {
      return;
    }

    const distance = event.clientX - dragStartX;
    if (Math.abs(distance) > 4) {
      didDrag = true;
      grid.classList.add("is-dragging");
      grid.scrollLeft = scrollStart - distance;
    }
  });

  const finishDragging = (event) => {
    if (grid.hasPointerCapture(event.pointerId)) {
      grid.releasePointerCapture(event.pointerId);
    }
    grid.classList.remove("is-dragging");
  };

  grid.addEventListener("pointerup", finishDragging);
  grid.addEventListener("pointercancel", finishDragging);
  grid.addEventListener("click", (event) => {
    if (didDrag) {
      event.preventDefault();
      event.stopPropagation();
      didDrag = false;
    }
  }, true);

  syncControls();
});

const locationCarousels = [...document.querySelectorAll(".location-carousel")];

locationCarousels.forEach((carousel) => {
  const grid = carousel.querySelector(".location-grid");
  if (!grid) {
    return;
  }

  const syncControls = () => {
    const hasOverflow = grid.scrollWidth > grid.clientWidth + 1;
    const atStart = grid.scrollLeft <= 1;
    const atEnd = grid.scrollLeft + grid.clientWidth >= grid.scrollWidth - 1;

    carousel.querySelectorAll(".shelf-arrow").forEach((button) => {
      const direction = Number(button.dataset.direction);
      button.disabled = !hasOverflow || (direction < 0 ? atStart : atEnd);
    });
  };

  grid.addEventListener("scroll", syncControls, { passive: true });
  carousel.querySelectorAll(".shelf-arrow").forEach((button) => {
    button.addEventListener("click", () => {
      const card = grid.querySelector(".location-card");
      const gap = Number.parseFloat(getComputedStyle(grid).columnGap) || Number.parseFloat(getComputedStyle(grid).gap) || 0;
      const distance = card ? card.getBoundingClientRect().width + gap : grid.clientWidth * 0.8;
      grid.scrollBy({
        left: distance * Number(button.dataset.direction),
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
      });
    });
  });

  let dragStartX = 0;
  let scrollStart = 0;
  let didDrag = false;

  grid.addEventListener("pointerdown", (event) => {
    if (event.pointerType !== "mouse" || event.button !== 0 || event.target.closest("a, button")) {
      return;
    }

    dragStartX = event.clientX;
    scrollStart = grid.scrollLeft;
    didDrag = false;
    grid.setPointerCapture(event.pointerId);
  });

  grid.addEventListener("pointermove", (event) => {
    if (!grid.hasPointerCapture(event.pointerId)) {
      return;
    }

    const distance = event.clientX - dragStartX;
    if (Math.abs(distance) > 4) {
      didDrag = true;
      grid.classList.add("is-dragging");
      grid.scrollLeft = scrollStart - distance;
    }
  });

  const finishDragging = (event) => {
    if (grid.hasPointerCapture(event.pointerId)) {
      grid.releasePointerCapture(event.pointerId);
    }
    grid.classList.remove("is-dragging");
  };

  grid.addEventListener("pointerup", finishDragging);
  grid.addEventListener("pointercancel", finishDragging);
  grid.addEventListener("click", (event) => {
    if (didDrag) {
      event.preventDefault();
      event.stopPropagation();
      didDrag = false;
    }
  }, true);

  syncControls();
});

window.addEventListener("resize", () => {
  shelfPanels.forEach(updateShelfControls);
  locationCarousels.forEach((carousel) => {
    const grid = carousel.querySelector(".location-grid");
    if (grid) {
      const syncControls = () => {
        const hasOverflow = grid.scrollWidth > grid.clientWidth + 1;
        const atStart = grid.scrollLeft <= 1;
        const atEnd = grid.scrollLeft + grid.clientWidth >= grid.scrollWidth - 1;

        carousel.querySelectorAll(".shelf-arrow").forEach((button) => {
          const direction = Number(button.dataset.direction);
          button.disabled = !hasOverflow || (direction < 0 ? atStart : atEnd);
        });
      };

      syncControls();
    }
  });
});
