# Alemannia CI test site

A dependency-free static fixture deployed to GitHub Pages by GitHub Actions.

## Local preview

Open `index.html` directly, or serve the repository with any static file server.

## Deployment

Pushes to `main` run asset smoke checks and deploy the site. Pull requests run the checks without deploying.

Before the first deployment, open **Settings > Pages** in GitHub and set **Source** to **GitHub Actions**. GitHub does not allow a repository's default Actions token to enable Pages itself.

The published URL is expected to be:

<https://lonesomeranger.github.io/alemannia/>
