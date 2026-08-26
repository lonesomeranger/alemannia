import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const css = fs.readFileSync(path.join(root, "styles.css"), "utf8");
const failures = [];

const check = (condition, message) => {
  if (!condition) failures.push(message);
};

const imageTags = [...html.matchAll(/<img\b[^>]*>/g)].map((match) => match[0]);
for (const tag of imageTags) {
  check(/\balt="[^"]*"/.test(tag), `Image is missing alt text: ${tag}`);
  check(/\bwidth="\d+"/.test(tag) && /\bheight="\d+"/.test(tag), `Image is missing dimensions: ${tag}`);
}

for (const tag of imageTags.slice(2)) {
  check(/\bloading="lazy"/.test(tag), `Below-fold image is not lazy-loaded: ${tag}`);
}

const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
check(ids.length === new Set(ids).size, "The document contains duplicate IDs.");

for (const match of html.matchAll(/href="#([^"]+)"/g)) {
  check(ids.includes(match[1]), `Fragment link has no target: #${match[1]}`);
}

for (const match of html.matchAll(/assets\/[a-z0-9-]+\.webp/g)) {
  check(fs.existsSync(path.join(root, match[0])), `Missing optimized asset: ${match[0]}`);
}

check(html.includes('class="skip-link"'), "The skip link is missing.");
check(html.indexOf('class="menu-button"') < html.indexOf('<nav id="navigation"'), "The mobile menu button must precede the navigation in keyboard order.");
check(html.includes('class="principles" role="list"'), "The principles container must expose list semantics.");
check((html.match(/role="listitem"/g) || []).length === 4, "Every principle must expose list-item semantics.");
check(!css.includes("@import"), "Do not load fonts through a duplicate CSS @import.");

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(`Static checks passed: ${imageTags.length} images, ${new Set(ids).size} unique IDs.`);
