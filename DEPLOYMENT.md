# Deployment Guide for Amin Rice Trading

This application is ready to be deployed. Since you already have a MongoDB Atlas database set up, the process will be straightforward.

## Recommended Platform: **Render.com** (Free/Low Cost)

### Step 1: Upload to GitHub
1. Create a new private repository on GitHub named `amin-rice-trading`.
2. Push your code to this repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

### Step 2: Create a Web Service on Render
1. Log in to [Render.com](https://render.com).
2. Click **New +** and select **Web Service**.
3. Connect your GitHub repository.
4. Use the following settings:
   - **Name**: `amin-rice-trading`
   - **Environment**: `Node`
   - **Build Command**: `npm run install-all && npm run build`
   - **Start Command**: `npm start`

### Step 3: Configure Environment Variables
In the **Environment** tab of your Render service, add the following variables:
- `MONGO_URI`: `mongodb+srv://abdahadamin_db_user:khatapass@khata.qafiuuw.mongodb.net/?appName=khata`
- `NODE_ENV`: `production`

### Step 4: Deploy
Render will start the build process. Once finished, your application will be live at a URL like `https://amin-rice-trading.onrender.com`.

---

## Option 2: **Vercel** (Popular for Frontend)

Vercel is great for this project because it handles the Frontend and Backend automatically using the `vercel.json` and `api/` folder.

### Step 1: Connect to Vercel
1. Go to [Vercel.com](https://vercel.com) and click **Add New > Project**.
2. Connect your GitHub repository.

### Step 2: Configure Settings
Vercel should detect the configuration, but double-check these settings:
- **Framework Preset**: Other (or Vite)
- **Root Directory**: `./` (The root of your project)

### Step 3: Add Environment Variables
In the Vercel dashboard, go to **Settings > Environment Variables** and add:
- `MONGO_URI`: `mongodb+srv://abdahadamin_db_user:khatapass@khata.qafiuuw.mongodb.net/?appName=khata`
- `NODE_ENV`: `production`

### Step 4: Deploy
Click **Deploy**. Vercel will build the frontend and serve the backend from the `api/` folder.

---

## Important Note
After deployment, your application will be accessible via a public URL. Since this is for your business, ensure you keep your GitHub repository **Private**.
