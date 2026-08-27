const menuButton = document.querySelector(".menu-button");
const navigation = document.querySelector("#navigation");
const navigationLinks = [...navigation.querySelectorAll('a[href^="#"]')];

const closeMenu = ({ restoreFocus = false } = {}) => {
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.querySelector(".sr-only").textContent = "Menü öffnen";
  navigation.classList.remove("is-open");
  if (restoreFocus) menuButton.focus();
};

menuButton.addEventListener("click", () => {
  const isOpen = menuButton.getAttribute("aria-expanded") === "true";
  menuButton.setAttribute("aria-expanded", String(!isOpen));
  menuButton.querySelector(".sr-only").textContent = isOpen ? "Menü öffnen" : "Menü schließen";
  navigation.classList.toggle("is-open", !isOpen);
});

navigation.addEventListener("click", (event) => {
  if (event.target.closest("a")) {
    closeMenu();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && menuButton.getAttribute("aria-expanded") === "true") {
    closeMenu({ restoreFocus: true });
  }
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 900) closeMenu();
});

const observedSections = navigationLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

const sectionObserver = new IntersectionObserver((entries) => {
  const visibleSection = entries
    .filter((entry) => entry.isIntersecting)
    .sort((first, second) => second.intersectionRatio - first.intersectionRatio)[0];

  if (!visibleSection) return;
  navigationLinks.forEach((link) => {
    const isActive = link.getAttribute("href") === `#${visibleSection.target.id}`;
    link.classList.toggle("is-active", isActive);
    if (isActive) link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  });
}, { rootMargin: "-25% 0px -60%", threshold: [0, .2, .5] });

observedSections.forEach((section) => sectionObserver.observe(section));

const revealableHousePhotos = [...document.querySelectorAll(".house-photo-reveal")];
const hasPersistentPhotoReveal = window.matchMedia("(hover: none)");

const loadOriginalPhoto = (photo) => {
  if (photo.classList.contains("is-original-loading") || photo.classList.contains("is-original-ready")) return;

  photo.classList.add("is-original-loading");
  const original = new Image();
  original.className = "house-photo-original";
  original.alt = "";
  original.width = 4080;
  original.height = 3072;
  original.decoding = "async";
  original.sizes = photo.dataset.originalSizes;
  original.srcset = photo.dataset.originalSrcset;
  original.src = photo.dataset.originalSrc;

  original.addEventListener("load", () => {
    photo.classList.remove("is-original-loading");
    photo.classList.add("is-original-ready");
  }, { once: true });
  original.addEventListener("error", () => {
    photo.classList.remove("is-original-loading");
    original.remove();
  }, { once: true });

  photo.insertBefore(original, photo.querySelector("figcaption"));
};

revealableHousePhotos.forEach((photo) => {
  photo.addEventListener("pointerenter", () => loadOriginalPhoto(photo), { once: true });
  photo.addEventListener("focus", () => loadOriginalPhoto(photo), { once: true });
  photo.addEventListener("click", () => {
    if (!hasPersistentPhotoReveal.matches) return;
    loadOriginalPhoto(photo);
    photo.classList.toggle("is-original-visible");
  });
});
