# Deploying to GitHub Pages

This repository is designed to be immediately deployable to GitHub Pages with minimal setup.

## 1. Enable GitHub Pages

After merging or pushing to the main repository, follow these exact steps to enable the frontend:

1. Open your repository **Settings**.
2. Click on **Pages** in the left sidebar.
3. Under **Build and deployment**, set the **Source** to **Deploy from a branch**.
4. Select the **main** branch.
5. Select the **`/docs`** folder.
6. Click **Save**.

The website will now be available at your GitHub Pages URL (e.g., `https://<your-username>.github.io/<repository-name>/`).

## 2. Automatic Future Updates

The frontend fetches its list of files from `docs/data/index.json`. 

When you add a new Markdown file to the repository, a lightweight GitHub Action (`.github/workflows/update-archive-index.yml`) will automatically run. 

This action runs the generic index generator (`scripts/build-site-index.mjs`) and commits the updated `index.json` back to the repository. This automatically triggers GitHub Pages to redeploy, ensuring your new prompts appear on the website without any manual intervention.

## Troubleshooting

- **404 Errors on assets:** The site uses relative paths (e.g., `assets/main.js`). This ensures it works correctly regardless of whether it's hosted at the root of a domain or under a project subpath (`/system_prompts_leaks/`).
- **New files not showing up:** Ensure the GitHub Action ran successfully. You can always run `node scripts/build-site-index.mjs` locally and commit the `docs/data/index.json` changes manually if needed.
