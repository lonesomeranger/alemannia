const menuButton = document.querySelector(".menu-button");
const navigation = document.querySelector("#navigation");
const navigationLinks = [...navigation.querySelectorAll('a[href^="#"]')];
const brand = document.querySelector(".brand");
const brandWordmark = brand.querySelector(".brand-wordmark");
const brandVariantCount = brand.querySelector(".brand-variant-count");
const brandVariants = [
  "alemannia-wortmarke.png",
  "alemannia-header-2-klassisch.png",
  "alemannia-header-3-elegant.png",
  "alemannia-header-4-modern.png",
];
let brandVariantIndex = 0;

brandVariants.slice(1).forEach((source) => {
  const image = new Image();
  image.src = source;
});

brand.addEventListener("click", (event) => {
  event.preventDefault();
  brandVariantIndex = (brandVariantIndex + 1) % brandVariants.length;
  brandWordmark.src = brandVariants[brandVariantIndex];
  brandVariantCount.textContent = `${brandVariantIndex + 1} / ${brandVariants.length}`;
  brand.setAttribute("aria-label", `Wortmarke Variante ${brandVariantIndex + 1} von ${brandVariants.length}. Klicken für die nächste Variante`);
});

const closeMenu = () => {
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.querySelector(".sr-only").textContent = "Menü öffnen";
  navigation.classList.remove("is-open");
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
  if (event.key === "Escape") closeMenu();
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
