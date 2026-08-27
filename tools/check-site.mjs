import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const pageNames = ["index.html", "geschichte.html", "impressum.html", "datenschutz.html"];
const pages = new Map(pageNames.map((name) => [name, fs.readFileSync(path.join(root, name), "utf8")]));
const css = fs.readFileSync(path.join(root, "styles.css"), "utf8");
const pageCss = fs.readFileSync(path.join(root, "pages.css"), "utf8");
const failures = [];

const check = (condition, message) => {
  if (!condition) failures.push(message);
};

let imageCount = 0;
for (const [pageName, html] of pages) {
  const imageTags = [...html.matchAll(/<img\b[^>]*>/g)].map((match) => match[0]);
  imageCount += imageTags.length;
  for (const tag of imageTags) {
    check(/\balt="[^"]*"/.test(tag), `${pageName}: image is missing alt text: ${tag}`);
    check(/\bwidth="\d+"/.test(tag) && /\bheight="\d+"/.test(tag), `${pageName}: image is missing dimensions: ${tag}`);
  }

  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
  check(ids.length === new Set(ids).size, `${pageName}: document contains duplicate IDs.`);

  for (const match of html.matchAll(/href="#([^"]+)"/g)) {
    check(ids.includes(match[1]), `${pageName}: fragment link has no target: #${match[1]}`);
  }

  for (const match of html.matchAll(/href="([a-z0-9-]+\.html)(?:#([^"]+))?"/gi)) {
    const [, targetPage, targetId] = match;
    check(pages.has(targetPage), `${pageName}: linked page is not part of the site: ${targetPage}`);
    if (targetId && pages.has(targetPage)) {
      check(new RegExp(`\\bid="${targetId}"`).test(pages.get(targetPage)), `${pageName}: cross-page fragment has no target: ${targetPage}#${targetId}`);
    }
  }

  for (const match of html.matchAll(/assets\/[a-z0-9-]+\.webp/g)) {
    check(fs.existsSync(path.join(root, match[0])), `${pageName}: missing optimized asset: ${match[0]}`);
  }

  check(html.includes('class="skip-link"'), `${pageName}: skip link is missing.`);
  check(html.indexOf('class="menu-button"') < html.indexOf('<nav id="navigation"'), `${pageName}: mobile menu button must precede navigation.`);
  check(!html.includes("alemannia-braunschweig.eu"), `${pageName}: still links to the retired external site.`);
}

const indexHtml = pages.get("index.html");
check(indexHtml.includes('class="principles" role="list"'), "index.html: principles container must expose list semantics.");
check((indexHtml.match(/role="listitem"/g) || []).length === 4, "index.html: every principle must expose list-item semantics.");
check((indexHtml.match(/class="house-photo house-photo-reveal"/g) || []).length === 3, "index.html: all three house photos must support original-image reveal.");
check((indexHtml.match(/data-original-srcset=/g) || []).length === 3, "index.html: every house photo must provide a responsive original source.");
check(/\.house-gallery \{[^}]*max-width: 1240px;/.test(indexHtml), "index.html: house gallery must align to the 1240px content grid.");
check(/\.room-offer \{[^}]*max-width: 1240px;/.test(indexHtml), "index.html: room offer must align to the 1240px content grid.");
check(css.includes("--mobile-crest-space: 120px"), "Mobile header must reserve space for the crest.");
check((css.match(/right: var\(--mobile-crest-space\)/g) || []).length === 2, "Mobile menu button and panel must share the crest offset.");
check(!css.includes("@import") && !pageCss.includes("@import"), "Do not load fonts through a duplicate CSS @import.");

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(`Static checks passed: ${pageNames.length} pages and ${imageCount} image references.`);
