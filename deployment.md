# Sovereign Budget Tracker - Deployment & Usage Guide

Sovereign Budget is a serverless, static Progressive Web App (PWA) designed to manage personal finances. It runs entirely on the client-side (inside the web browser) and stores all data locally in the browser's cache (`localStorage`).

This guide details how to deploy the application on the Web and run it as a standalone app across all operating systems (**Windows, macOS, Linux, Android, iOS**) and form factors (**Laptops, Tablets, Mobiles**).

**Created by Thomas Cherickal, Generative AI Consultant.**

---

## 🌐 1. Web Deployment (Hosting)

Since Sovereign Budget consists of pure static files (HTML, CSS, JavaScript, and asset graphics), it can be hosted for free on any static web hosting provider. 

> [!IMPORTANT]
> To enable Progressive Web App (PWA) features (such as offline caching and standalone installation), the application **MUST** be served over a secure connection (**HTTPS**).

### A. Deploying to GitHub Pages (Recommended)
1. Push your repository to GitHub: `https://github.com/thomascherickal/Budget-Tracker`
2. Go to your repository settings on GitHub.
3. Scroll down to the **Pages** section in the left sidebar.
4. Under **Build and deployment**, set the Source to **Deploy from a branch**.
5. Select the **`master`** branch and the root directory `/(root)`, then click **Save**.
6. GitHub will build and host your app. Within 1–2 minutes, it will be live at:
   `https://thomascherickal.github.io/Budget-Tracker/`

### B. Deploying to Other Static Platforms (Vercel, Netlify, Cloudflare Pages)
- **Netlify**: Drag and drop the project folder directly onto the Netlify dashboard.
- **Vercel**: Run `vercel` in the project root directory or link the GitHub repository to Vercel.
- **Cloudflare Pages**: Connect your GitHub repository to Cloudflare Pages, choose the root folder, and deploy.

All of these platforms automatically provision free SSL certificates (HTTPS), enabling full PWA installability.

---

## 💻 2. Operating System Instructions

Sovereign Budget can be used in two ways on PCs: via a Web URL, or by running local source files directly.

### 🪟 Windows (Laptops, Desktops, & Surface Tablets)
1. **Web App / PWA Installation**:
   - Open Google Chrome, Microsoft Edge, or Brave and navigate to the hosted Web URL.
   - Click the **Install Icon** (a monitor screen with a down arrow) on the right side of the address bar.
   - Click **Install** in the prompt. Sovereign Budget will now run in a dedicated borderless window and have its own desktop shortcut and Start Menu entry.
2. **Local Standalone Run (Offline-only)**:
   - Download the source ZIP from GitHub and extract it.
   - Double-click **`index.html`** in your file explorer to run the application immediately via the `file:///` protocol.
   *Note: PWA installation is disabled in browser runtimes when using `file:///` directly. If offline installation is required, serve the folder locally (e.g., via Python).*

### 🍎 macOS (MacBook, iMac, & Mac mini)
1. **Web App / PWA Installation**:
   - Open Safari, Chrome, or Edge and go to the hosted Web URL.
   - **Safari**: Click **File** in the menu bar, then click **Add to Dock**.
   - **Chrome/Edge**: Click the **Install** button in the URL bar, or open the settings menu (three dots) and choose **Save and Share** -> **Install page as app**.
   - The app icon will be added to your Launchpad and Dock.
2. **Local Standalone Run (Offline-only)**:
   - Extract the project folder and double-click **`index.html`** to run locally.

### 🐧 Linux (Laptops & Desktops)
1. **Web App / PWA Installation**:
   - Open Chrome, Chromium, or Edge and navigate to the Web URL.
   - Click the **Install** icon in the address bar to add the launcher shortcut to your desktop environment's application menu (e.g. GNOME, KDE).
2. **Local Standalone Run (Offline-only)**:
   - Double-click **`index.html`** to run locally in your default web browser.

### 🤖 Android (Smartphones & Tablets)
1. **PWA Mobile App Installation**:
   - Open Google Chrome on your phone or tablet and go to the Web URL.
   - Tap the **three-dot menu** button in the top-right corner.
   - Tap **Install app** (or **Add to Home screen**).
   - Tap **Install** in the confirmation dialog.
   - Sovereign Budget will appear in your mobile app drawer and home screen.
2. **Web Mode**:
   - Save the Web URL bookmark in Firefox, Chrome, or Opera for quick browser access.

### 🍏 iOS / iPadOS (iPhone & iPad)
1. **PWA Mobile App Installation**:
   - Open Apple Safari and navigate to the Web URL.
   - Tap the **Share** button (square with an up arrow at the bottom).
   - Scroll down the sheet and tap **Add to Home Screen**.
   - Tap **Add** in the top-right corner.
   - The app launcher will be placed on your home screen and run as a standalone fullscreen app.

---

## 📱 3. Device Form Factor Experience

Sovereign Budget utilizes a modern glassmorphism design that scales dynamically to match the user's screen space.

```
+-------------------------------------------------------------------+
|                           Device Matrix                           |
+----------------------+--------------------+-----------------------+
| Laptop/Desktop       | Tablet             | Mobile (iPhone/Galaxy)|
+----------------------+--------------------+-----------------------+
| - Multi-column view  | - Flexible Grid    | - Stacked vertical    |
| - Widescreen graphs  | - Collapsible tabs | - Mobile navigation   |
| - Sidebar database   | - Large tap targets| - Responsive graphs   |
+----------------------+--------------------+-----------------------+
```

### 💻 Laptops & Desktops (Large Screens)
*   **Layout**: Displays a multi-column dashboard with the permanent navigation sidebar and a database status module on the left.
*   **Visuals**: Rendered graphs (category breakdown and cash flow trends) display side-by-side, offering a complete overview at a glance.
*   **Inputs**: Supports standard keyboard text inputs and numeric pads for rapid transaction logging.

### 🧮 Tablets (Medium Screens - iPad, Galaxy Tab)
*   **Layout**: Adapts automatically to landscape and portrait orientations. The sidebar connection block condenses to maintain clear visibility.
*   **Interactions**: Supports multi-touch interactions. Users can tap chart segments to inspect values and easily open category picker lists.
*   **Portability**: Changes auto-save instantly, allowing users to safely log transactions on the go.

### 📱 Mobiles (Small Screens - iPhones & Android Devices)
*   **Layout**: Collapses the sidebar into a bottom navigation tab bar or a stacked layout, prioritizing core content visibility.
*   **Visuals**: Charts scale down dynamically and display sequentially. The categories layout wraps into a single-column, thumb-friendly format.
*   **UX**: Inputs use native phone keyboards (e.g., numbers-only keyboards for amount fields) to streamline entries.
