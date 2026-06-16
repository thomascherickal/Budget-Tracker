# Sovereign Budget - Installation Guide

Sovereign Budget is a free, open-source, and fully cross-platform personal finance application. Since it is built as a static Progressive Web App (PWA), you can run it inside any web browser or install it to run as a native-like desktop or mobile application on **Windows, macOS, Linux, Android, and iOS** without compiling any code or paying app store fees.

**Software created by Thomas Cherickal, Generative AI Consultant.**

## 🔗 GitHub Repository Link
You can access the source code, open issues, or fork the repository on GitHub at:
https://github.com/thomascherickal/budget-tracker

---

## 📱 Installation Method 1: Install as a PWA (Recommended)

Installing the application as a Progressive Web App (PWA) adds a launcher icon to your desktop or home screen, runs the app in an immersive borderless window (separate from browser tabs), and caches all code so it works **100% offline**.

> [!NOTE]
> PWA installation requires the app to be served over a secure connection (**HTTPS** or `localhost`). Setting up free hosting on GitHub Pages (detailed in [README.md](README.md)) will automatically provide HTTPS.

### 🪟 Windows / 🍎 macOS / 🐧 Linux (Chrome/Edge/Brave)
1. Open Google Chrome, Microsoft Edge, or Brave and navigate to your deployed website URL:
   https://thomascherickal.github.io/budget-tracker/
2. Look at the right side of the browser's address bar (URL bar). You will see an **Install Icon** (a computer screen with a down arrow).
3. Click the **Install** icon, then click **Install** in the confirmation popup.
4. The application is now installed! A shortcut will be placed on your desktop and in your system's application menu/launcher.

### 🤖 Android (Google Chrome)
1. Open Google Chrome on your Android device and navigate to your website URL:
   https://thomascherickal.github.io/budget-tracker/
2. Tap the **three-dot menu** button in the top-right corner.
3. Tap **Install app** (or **Add to Home screen**).
4. Tap **Install** (or **Add**) in the dialog.
5. Sovereign Budget will now appear as an app icon in your app drawer and home screen.

### 🍏 iOS / iPadOS (Safari)
1. Open Apple Safari on your iPhone or iPad and navigate to your website URL:
   https://thomascherickal.github.io/budget-tracker/
2. Tap the **Share** button (the square icon with an arrow pointing upwards at the bottom center).
3. Scroll down the sharing sheet and tap **Add to Home Screen**.
4. Type the name you want (e.g. "SovereignBudget") and tap **Add** in the top-right corner.
5. The app icon will now appear on your home screen and load as a standalone application.

---

## 💻 Installation Method 2: Local Standalone Run (Offline-only)

If you prefer to run the application purely offline on a laptop or desktop computer without deploying it to GitHub Pages:

1. **Download the Repository**:
   - Clone the repository using Git:
     ```bash
     git clone https://github.com/thomascherickal/budget-tracker.git
     ```
   - Alternatively, download the source code as a ZIP file from your GitHub repository page and extract the files to a folder on your drive.

2. **Launch the Application**:
   - Navigate to the project directory in your file explorer.
   - Double-click the **`index.html`** file.
   - The app will load directly in your default browser. Since all resources (HTML, CSS, JS, and graphics) are contained in the local folder, it will work instantly.

*Note: Browsers disable PWA installation flags when running files directly from the local disk using the `file:///` protocol. If you want to install it as a standalone app on your local machine without GitHub Pages, serve the directory locally (e.g. `python3 -m http.server`) and navigate to `http://localhost:8000` to trigger PWA installation.*
