# Alemannia CI test site

A dependency-free static website deployed to GitHub Pages by GitHub Actions. The focused one-page homepage is complemented by an internal history timeline and legal pages.

Production: <https://burschenschaftalemannia.de/>

## Local preview

Open `index.html` directly, or serve the repository with any static file server.

Run the local static checks before committing:

```text
node --check script.js
node tools/check-site.mjs
```

Regenerate the responsive WebP assets after replacing a source image:

```text
python tools/optimize_images.py
```

## Deployment

Pushes to `main` run asset smoke checks and deploy the site. Pull requests run the checks without deploying.

GitHub Pages must use **GitHub Actions** as its source. Pushes to `main` publish the custom domain; the repository URL redirects there.
