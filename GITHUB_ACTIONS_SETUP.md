# GitHub Actions CI/CD Setup Guide

This guide explains how to set up and configure the GitHub Actions CI/CD pipeline for Nano-banana-bot.

## Overview

The CI/CD workflow automatically:
- ✅ Runs on every push to `main` and `develop` branches
- ✅ Runs on every pull request
- ✅ Tests with Node.js 18.x and 20.x
- ✅ Lints and type-checks code
- ✅ Builds the production bundle
- ✅ Deploys previews on pull requests
- ✅ Deploys to production on main branch pushes
- ✅ Checks for security vulnerabilities

## Workflow File Location

The workflow is defined in:
```
.github/workflows/ci-cd.yml
```

## Step 1: Add GitHub Secrets

GitHub Actions workflows need secrets for sensitive information. Go to your repository settings to add them.

### How to Add Secrets

1. Go to your GitHub repository: `https://github.com/WestonG40/Nano-banana-bot-`
2. Click **Settings** (top menu)
3. In left sidebar, click **Secrets and variables** → **Actions**
4. Click **"New repository secret"**

### Required Secrets

#### 1. **GEMINI_API_KEY** (Required)
Your Google Gemini API key for authentication.

- **Name:** `GEMINI_API_KEY`
- **Value:** Your actual API key from https://ai.google.dev/
- Click **"Add secret"**

#### 2. **VERCEL_TOKEN** (Required for deployment)
Your Vercel authentication token.

**How to get it:**
1. Go to https://vercel.com/account/tokens
2. Click **"Create"**
3. Name it (e.g., "GitHub Actions CI/CD")
4. Click **"Create"**
5. Copy the token
6. Paste it as the secret value

- **Name:** `VERCEL_TOKEN`
- **Value:** Your Vercel token
- Click **"Add secret"**

#### 3. **VERCEL_ORG_ID** (Required for deployment)
Your Vercel organization ID.

**How to get it:**
1. Go to https://vercel.com/dashboard
2. Click **"Settings"**
3. Look for **Team ID** in the left sidebar
4. Copy the ID

- **Name:** `VERCEL_ORG_ID`
- **Value:** Your Vercel Team/Org ID
- Click **"Add secret"**

#### 4. **VERCEL_PROJECT_ID** (Required for deployment)
Your Vercel project ID.

**How to get it:**
1. Go to https://vercel.com/dashboard
2. Select your **Nano-banana-bot-** project
3. Go to **Settings** → **General**
4. Look for **Project ID**
5. Copy it

- **Name:** `VERCEL_PROJECT_ID`
- **Value:** Your Vercel Project ID
- Click **"Add secret"**

## Step 2: Verify Secrets Are Set

Run this command to verify (you won't see the values, just ✓):

```bash
gh secret list
```

You should see:
```
GEMINI_API_KEY             **** Updated May 01, 2026
VERCEL_ORG_ID              **** Updated May 01, 2026
VERCEL_PROJECT_ID          **** Updated May 01, 2026
VERCEL_TOKEN               **** Updated May 01, 2026
```

## Step 3: Test the Workflow

### Trigger on Main Branch
Push to main to test production deployment:
```bash
git commit --allow-empty -m "test: trigger CI/CD workflow"
git push origin main
```

### Trigger on Pull Request
Create a test PR to see the preview deployment:
```bash
git checkout -b test-ci-cd
git commit --allow-empty -m "test: CI/CD workflow on PR"
git push origin test-ci-cd
# Then create a PR on GitHub
```

### Monitor Workflow

1. Go to your repository
2. Click **Actions** tab
3. You'll see your workflows listed
4. Click on a workflow to see detailed logs

## Workflow Jobs Explained

### 1. **build-and-test**
- Tests on multiple Node versions (18.x, 20.x)
- Installs dependencies
- Runs linter
- Builds the project
- Uploads artifacts

**When:** Every push and PR

### 2. **code-quality**
- Type-checks with TypeScript
- Checks for security vulnerabilities
- Audits dependencies

**When:** Every push and PR

### 3. **deploy-preview**
- Creates preview deployment on Vercel
- Comments on PR with preview URL
- Only runs on pull requests

**When:** Pull requests only

### 4. **deploy-production**
- Deploys to production on Vercel
- Only when merging to main

**When:** Push to main branch only

### 5. **notify-success**
- Summary of all checks
- Confirms workflow completion

**When:** Always (after other jobs)

## Environment Variables in Workflow

The workflow passes environment variables:

```yaml
env:
  GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
  CI: true
```

These are available during:
- Build process
- Tests
- Deployment

## Customizing the Workflow

### Change Node Versions

Edit `.github/workflows/ci-cd.yml`:

```yaml
strategy:
  matrix:
    node-version: [18.x, 20.x, 22.x]  # Add 22.x
```

### Change Branches

Edit triggers:

```yaml
on:
  push:
    branches:
      - main
      - develop
      - staging  # Add staging
```

### Add Custom Steps

Example - add a test step:

```yaml
- name: Run tests
  run: npm test
  continue-on-error: true
```

## Troubleshooting

### Workflow Fails: "Secrets not found"

**Solution:**
1. Go to Settings → Secrets and variables
2. Verify all 4 secrets are added
3. Check spelling matches exactly
4. Redeploy (the workflow will retry)

### Build Fails with TypeScript Errors

**Solution:**
1. Check the error in the Actions log
2. Fix it locally: `npm run lint`
3. Push the fix
4. Workflow will auto-retry

### Deployment Fails with 403 Forbidden

**Solution:**
1. Verify `GEMINI_API_KEY` secret is set
2. Check the API key is valid
3. Ensure it hasn't expired
4. Re-trigger the workflow

### Vercel Deployment Fails

**Solution:**
1. Check that `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID` are correct
2. Verify they're all set as secrets (not in the code)
3. Check Vercel project settings are correct
4. Test manual deployment to Vercel

## Viewing Workflow Logs

1. Go to **Actions** tab
2. Click the workflow run
3. Expand each job to see detailed logs
4. Look for error messages in red

## Disabling the Workflow

If you need to disable CI/CD temporarily:

1. Go to **Actions** tab
2. Click **...** menu on the workflow
3. Click **"Disable workflow"**

To re-enable:
1. Click the disabled workflow
2. Click **"Enable workflow"**

## Advanced Features

### Skip Workflow on Specific Commits

Add to commit message:
```bash
git commit -m "docs: update README [skip ci]"
```

### Manual Workflow Trigger

Add to workflow trigger:
```yaml
on:
  workflow_dispatch:
```

Then manually run from Actions tab.

### Run Only on Tags

```yaml
on:
  push:
    tags:
      - 'v*'
```

Triggers only when you create version tags like `v1.0.0`.

## Security Best Practices

- ✅ Secrets are encrypted at rest
- ✅ Secrets are not logged in output
- ✅ Use fine-grained tokens when possible
- ✅ Rotate tokens periodically
- ✅ Never commit secrets to Git
- ✅ Use branch protection rules
- ✅ Require CI checks to pass before merging

## Performance Tips

- Workflow takes ~2-3 minutes to complete
- Parallel jobs run simultaneously
- Caching is enabled for faster builds
- Artifacts are kept for 7 days

## Useful Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vercel GitHub Action](https://github.com/amondnet/vercel-action)
- [Node.js Setup Action](https://github.com/actions/setup-node)
- [Upload Artifacts Action](https://github.com/actions/upload-artifact)

---

**Workflow Last Updated:** 2026-08-15

## Quick Checklist

- [ ] Added GEMINI_API_KEY secret
- [ ] Added VERCEL_TOKEN secret
- [ ] Added VERCEL_ORG_ID secret
- [ ] Added VERCEL_PROJECT_ID secret
- [ ] Pushed code to trigger first workflow
- [ ] Verified workflow runs in Actions tab
- [ ] Verified preview deployment on PR
- [ ] Verified production deployment on main

Once all checkboxes are done, your CI/CD pipeline is fully operational! 🚀
