# BrandSauce — Deployment Guide
## Fivefoottwo Marketing

---

## Step 1 — Create a Notion Integration Token

1. Go to: **https://www.notion.so/my-integrations**
2. Click **"+ New integration"**
3. Name it: `BrandSauce`
4. Workspace: select your Fivefoottwo workspace
5. Capabilities: check **Read content** (that's all you need)
6. Click **Save** → copy the **Internal Integration Token** (starts with `secret_...`)

### Share your databases with the integration
You need to do this for BOTH databases:

1. Open **Core Values Database** in Notion
2. Click the **"..."** menu (top right) → **Connections** → find `BrandSauce` → click Connect
3. Repeat for **Brand Voice Trait Database**

---

## Step 2 — Deploy to Vercel

### Option A: Deploy via GitHub (recommended)

1. Create a free account at **https://github.com** if you don't have one
2. Create a new repository called `brandsauce`
3. Upload all files from this folder to the repo
4. Go to **https://vercel.com** → sign up with GitHub
5. Click **"Add New Project"** → import your `brandsauce` repo
6. Click **Deploy** (Vercel auto-detects the config)

### Option B: Deploy via Vercel CLI

```bash
npm install -g vercel
cd brandsauce
vercel
```

---

## Step 3 — Add your Notion Token to Vercel

1. In Vercel, go to your project → **Settings** → **Environment Variables**
2. Add a new variable:
   - **Name:** `NOTION_TOKEN`
   - **Value:** `secret_xxxxxxxxxxxx` (your token from Step 1)
   - **Environment:** Production, Preview, Development (check all three)
3. Click **Save**
4. Go to **Deployments** → click **Redeploy** on your latest deployment

---

## Step 4 — You're live! 🎉

Your app will be at: `https://brandsauce.vercel.app` (or your custom domain)

---

## How live updates work

- When you **add or edit** a Core Value or Voice Trait in Notion, it will appear in the app automatically
- The app **caches data for 5 minutes** to keep things snappy — a "↻ Refresh" button lets users force a refresh
- No rebuilds needed — Notion changes go live instantly

---

## Local development

```bash
npm install
npx vercel dev
```

Then open: http://localhost:3000

Set your token locally:
```bash
export NOTION_TOKEN=secret_xxxxxxxxxxxx
```

Or create a `.env` file (never commit this!):
```
NOTION_TOKEN=secret_xxxxxxxxxxxx
```

---

## File structure

```
brandsauce/
├── api/
│   └── notion.js        ← Serverless function (proxies Notion API)
├── public/
│   └── index.html       ← The full BrandSauce app
├── package.json
├── vercel.json          ← Vercel routing config
└── DEPLOY.md            ← This file
```

---

## Notion database IDs (already configured)

- Core Values Database: `42de464ed01d47eab2c9b88bc5d8efaa`
- Brand Voice Trait Database: `9e7ca4ac0c684321ad4d1b063cf08d5e`

These are already set in `api/notion.js`. If you ever move the databases, update those IDs.

---

## Questions?

Built by Claude for Fivefoottwo Marketing.
