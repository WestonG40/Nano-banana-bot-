# GitHub Secrets Quick Setup - Copy & Paste Ready

This is a quick reference for adding the 4 required secrets to your GitHub repository.

## 🔑 Step-by-Step Secret Addition

### **Go to GitHub Settings**
Visit: https://github.com/WestonG40/Nano-banana-bot-/settings/secrets/actions

---

## Secret 1️⃣: GEMINI_API_KEY

**Where to get it:**
1. Go to: https://ai.google.dev/
2. Sign in with your Google account
3. Click "Get API Key"
4. Copy your API key

**How to add:**
1. Click **"New repository secret"** button
2. **Name:** `GEMINI_API_KEY`
3. **Value:** Paste your API key
4. Click **"Add secret"**

Example value starts with: `AIza...`

---

## Secret 2️⃣: VERCEL_TOKEN

**Where to get it:**
1. Go to: https://vercel.com/account/tokens
2. Click **"Create"**
3. Leave name as default (or name it "GitHub Actions")
4. Click **"Create"**
5. Copy the token that appears

**How to add:**
1. Click **"New repository secret"** button
2. **Name:** `VERCEL_TOKEN`
3. **Value:** Paste your Vercel token
4. Click **"Add secret"**

Example value: Long alphanumeric string

---

## Secret 3️⃣: VERCEL_ORG_ID

**Where to get it:**
1. Go to: https://vercel.com/dashboard/settings
2. In left sidebar, look for your **Team name** or **Team ID**
3. Copy the **Team ID** (usually looks like: `team_xxx` or alphanumeric)

**How to add:**
1. Click **"New repository secret"** button
2. **Name:** `VERCEL_ORG_ID`
3. **Value:** Paste your Team ID
4. Click **"Add secret"**

---

## Secret 4️⃣: VERCEL_PROJECT_ID

**Where to get it:**
1. Go to: https://vercel.com/dashboard
2. Click on your **Nano-banana-bot-** project
3. Go to **Settings** → **General**
4. Look for **Project ID** section
5. Copy the Project ID

**How to add:**
1. Click **"New repository secret"** button
2. **Name:** `VERCEL_PROJECT_ID`
3. **Value:** Paste your Project ID
4. Click **"Add secret"**

---

## ✅ Verification

After adding all 4 secrets, go to:
https://github.com/WestonG40/Nano-banana-bot-/settings/secrets/actions

You should see all 4 listed:
- [ ] GEMINI_API_KEY
- [ ] VERCEL_ORG_ID
- [ ] VERCEL_PROJECT_ID
- [ ] VERCEL_TOKEN

---

## 🚀 Test the CI/CD Pipeline

After adding secrets, trigger the workflow:

```bash
cd /workspaces/Nano-banana-bot-
git commit --allow-empty -m "test: trigger CI/CD pipeline"
git push origin main
```

**View the workflow:**
https://github.com/WestonG40/Nano-banana-bot-/actions

---

## ⚠️ Common Issues

**"Secret not recognized"**
- Double-check the exact spelling (case-sensitive)
- Make sure you're adding to the right repository
- Refresh the page and try again

**"Deployment failed"**
- Verify all 4 secrets are added
- Check that values are correct and not truncated
- Review the Actions log for specific errors

**"Can't find API key"**
- Go to https://ai.google.dev/
- Make sure you're signed in
- Create a new API key if needed

---

## 🎯 Done!

Once all 4 secrets are added:
1. ✅ Push code to main
2. ✅ Workflow auto-runs
3. ✅ App auto-deploys to Vercel
4. ✅ Preview URLs on pull requests
5. ✅ Production updates on merges

Your CI/CD pipeline is now **LIVE** 🚀
