# Sovereign Budget

Sovereign Budget is a high-fidelity, professional personal finance application with a premium dark-slate glassmorphic interface. It runs entirely in the browser, allowing you to log and track your monthly budget, monthly recurring expenses, planned one-time expenses, and savings targets securely.

**Software created by Thomas Cherickal, Generative AI Consultant.**

This project is licensed under the **MIT License**, making it free of cost, open source, and fully customizable.

## 📱 Cross-Platform Progressive Web App (PWA)

Sovereign Budget is packaged as a **Progressive Web App (PWA)**. This enables you to run the app as a standalone local application across all major desktop and mobile operating systems:
- **Desktop (Windows, macOS, Linux)**: Click the install icon in your browser's URL bar (e.g., Chrome, Edge) to install Sovereign Budget onto your desktop and add it to your apps list.
- **Mobile (Android, iOS)**: Open the app URL in Chrome (Android) or Safari (iOS), select **Add to Home Screen**, and install it. It will open in a standalone, immersive full-screen window.
- **100% Offline Capability**: Powered by a service worker (`sw.js`), the app caches all assets (HTML, CSS, JS, fonts, icons, charts) locally. Once loaded or installed, you can use the app without an internet connection.

## 🔐 Privacy-First Architecture

- All your budget inputs, expenses, and transactions are auto-saved directly inside your browser's private local cache (`localStorage`).
- Your sensitive data is never uploaded to any remote servers.
- **Portability**: You can easily export your database to a standard plain-text file (`.json`) using the **Export Backup** button in the sidebar, and restore it on any device using the **Import Backup** button.
- **Static Hosting**: Because the application contains no backend components, it works out-of-the-box when hosted on static hosting services like GitHub Pages or when launched directly from your local hard drive by opening `index.html` in your browser.

---

## 🚀 Key Features

- **Professional Dark Theme**: Premium slate background with indigo highlights, glowing elements, custom scrollbars, and glassmorphic card overlays.
- **Auto-Save Indicators**: Instantly saves changes directly to your local browser cache with a visual status indicator in the sidebar.
- **Automatic Budget Calculation**:
  - **Total Income**: Sum of logged income transactions.
  - **Total Expenses**: Sum of variable expenses + monthly recurring commitments + planned one-time expenses for the active month.
  - **Savings Requirement**: Set a target monthly savings and view goal progress.
  - **Net Discretionary Balance**: Computes remaining "free spending money" after meeting expenses and savings targets.
- **Fixed & Savings Hub**: Manage fixed commitments and one-time planned large expenses for the selected month.
- **Transaction Audit Log**: Search, filter by type or category, and delete logged entries.
- **Analytics & Key Insights**:
  - Toggle reports between **Weekly**, **Monthly**, and **Annual** scopes.
  - Interactive doughnut chart showing expense allocations.
  - Cash flow history comparison bar graphs.
  - Auto-generated key diagnostic insights (e.g., deficit alerts, variable cost highlight, savings rate calculations).

---

## 💻 Running Locally

To run the application locally:
1. Double-click the `index.html` file in your file explorer to open it directly in any modern browser (e.g. Chrome, Firefox, Safari, Edge).
2. Alternatively, you can serve the directory using a simple command line server if you prefer:
   ```bash
   python3 -m http.server 8000
   ```
   and navigate to `http://localhost:8000`.

---

## 🌐 Setting Up Free Hosting on GitHub Pages

Since Sovereign Budget is built entirely with static HTML, CSS, and JavaScript, you can host it for free on GitHub Pages in under two minutes:

1. **Create a GitHub Repository**:
   - Go to [github.com](https://github.com) and create a new repository named `budget-tracker` (or any name you prefer). Make it Public.

2. **Initialize Git and Push Code**:
   - In your local project directory, run the following terminal commands:
     ```bash
     git init
     git add .
     git commit -m "Initial commit - Sovereign Budget PWA"
     git branch -M main
     git remote add origin https://github.com/thomascherickal/budget-tracker.git
     git push -u origin main
     ```

3. **Enable GitHub Pages**:
   - Go to your repository page on GitHub.
   - Click on the **Settings** tab.
   - On the left sidebar, click on **Pages** (under the "Code and automation" section).
   - Under **Build and deployment**, set the Source dropdown to **Deploy from a branch**.
   - Under **Branch**, click the dropdown and select **main** (and keep the folder as `/ (root)`).
   - Click the **Save** button.

4. **Access Your Application**:
   - Within 1–2 minutes, GitHub will build and host your site.
   - You can access it securely over HTTPS at:
     ```
     https://thomascherickal.github.io/budget-tracker/
     ```
