# Sovereign Budget - Repository Rules & Agent Guidelines

## 1. Project Overview & Philosophy
- **Name**: Sovereign Budget
- **Architecture**: 100% offline-first, client-side, zero-knowledge personal finance tracker.
- **Privacy & Security**: All financial transactions and settings reside strictly in the user's browser local storage. No data is ever transmitted to remote servers. Backups support AES-256-GCM zero-knowledge client-side encryption derived via PBKDF2 with 100,000 iterations.
- **Portability**: Must run directly in modern browsers via standard HTTP, local servers (`python3 -m http.server`), or directly via the `file://` protocol without requiring build tools or bundlers.

---

## 2. Technology Stack & Coding Standards
- **Core**: Vanilla HTML5, Vanilla CSS3, modern Vanilla JavaScript (ES6+).
- **No Bundlers / Transpilers**: Do not introduce Webpack, Vite, Babel, TailwindCSS, or Node-dependent production bundles unless explicitly requested by the user.
- **Dual-Export Universal Module Pattern**:
  Every modular file under `js/` must adhere to the universal export pattern so it works seamlessly both in the browser (global/window scope) and in Node.js test environments (`module.exports`):
  ```javascript
  // Universal module export pattern
  const ModuleObject = { /* ... */ };

  if (typeof window !== 'undefined') {
      window.ModuleObject = ModuleObject;
      // Expose individual functions for browser accessibility:
      window.functionName = functionName;
  }

  if (typeof module !== 'undefined' && module.exports) {
      module.exports = ModuleObject;
  }
  ```

---

## 3. Modular Architecture (`js/`)
All application logic is partitioned into clean, single-responsibility modules:

1. **`js/constants.js`**:
   - Application storage keys (`CACHE_KEY`, `AUTOSAVE_KEY`, `EXIT_TIMESTAMP_KEY`).
   - Taxonomies: `EXPENSE_CATEGORIES`, `INCOME_CATEGORIES`.
   - UI configuration: `CHART_PALETTE`, `TAB_TITLES`.

2. **`js/currencies.js`**:
   - Global currency/locale dictionary (`LOCALE_CURRENCIES`).
   - `detectUserCurrency(customLocale)`: Auto-detects browser locale with safe fallback to `USD` in headless/Node environments.
   - `getSymbolForCurrency(code)` and `getLocaleForCurrency(code)`.
   - `formatCurrency(amount, currencyCode)`: Pure currency formatter.

3. **`js/crypto.js`**:
   - WebCrypto-based PBKDF2 key derivation (`deriveKey`).
   - User hashing with trim/case-folding (`hashUsername`).
   - AES-256-GCM symmetric encryption/decryption (`encryptData`, `decryptData`).
   - Binary buffer utilities (`arrayBufferToBase64`, `base64ToArrayBuffer`).

4. **`js/financials.js`**:
   - Pure calculation engine decoupled from the DOM.
   - `getMonthFinancials(monthStr, db)`: Monthly totals, recurring totals, planned one-times, surplus, and goal progress.
   - `compileReportMetrics(scope, db, currentMonth, referenceDate)`: Weekly, monthly, and annual rollups.
   - `generateInsightItems(...)`: Diagnostic automated wealth-building insights.

5. **`js/storage.js`**:
   - `getCleanDatabaseObject(defaultCurrency)`: Initial schema template.
   - `validateDatabaseSchema(dbData)`: Schema integrity verification.
   - `saveDataToStorage(storage, db, isExit)`: Dual persistence to cache and autosave keys.
   - `loadDataFromStorage(storage)`: Prioritizes autosaved JSON export on startup.
   - `clearLocalStorageKeys(storage)`: Wipes cache and autosave records.
   - `createPlainJsonExport(db)` and `createEncryptedBackup(db, username, encryptFn)`.
   - `parseImportContent(fileText, promptFn, decryptFn)`.
   - `setupExitAutosaveListeners(win, doc, callback)`: Hooks `pagehide`, `beforeunload`, and `visibilitychange`.

6. **`js/ui.js`**:
   - DOM UI controllers: `showToast()`, `showSaveIndicator()`, `openModal()`, `closeAllModals()`.
   - Dynamic currency symbol updates: `updateCurrencySymbolsUI()`.
   - Category select synchronization: `syncFormCategoryOptions()`.
   - Date helpers: `calculateNextMonth()`, `formatMonthLabel()`.

7. **`app.js`**:
   - Orchestrates `AppState`.
   - Renders active panels: Dashboard, Budget Manager, Transaction Audit Log, Reports & Charts.
   - Re-exports modular APIs for backward compatibility with existing tests.

---

## 4. Mobile & Responsive Design Guidelines
- **Viewport**: Always maintain `<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, viewport-fit=cover">`.
- **Navigation**: Dual-navigation layout:
  - Desktop: Collapsible glassmorphism sidebar (`.sidebar`).
  - Mobile: Fixed bottom navigation bar (`.mobile-bottom-nav`) and sticky mobile header.
- **Touch Ergonomics**: All interactive buttons, chips, and nav items must have a minimum tap target of `44px x 44px`.
- **Form Inputs**: Mobile inputs must maintain at least `16px` font-size to prevent iOS Safari auto-zooming.
- **Mobile Access to Settings**: Since the sidebar is hidden on small screens, database operations, currency selection, and memory controls must be fully accessible via `#modal-settings-data`.

---

## 5. Data Persistence & Autosave Rules
1. **Autosave on Exit**:
   - Automatically serializes data into `sovereign_budget_autosave_json` and records timestamp in `sovereign_budget_exit_timestamp`.
   - Must hook `pagehide` (mobile & desktop), `beforeunload` (desktop), and `visibilitychange` (fired when switching tabs or backgrounding mobile apps).
2. **Import on Startup**:
   - On application launch, prioritize loading valid data from `sovereign_budget_autosave_json`.
   - Fall back to `sovereign_budget_cache` if autosave is empty.
3. **Clear Local Memory**:
   - Always prompt user with confirmation modal (`#modal-confirm-clear`).
   - Offer a one-click "Download JSON Backup First" option before clearing.
   - Cleanly reset `AppState.db` to default template and re-detect currency.

---

## 6. Service Worker & Offline PWA Rules
- The app operates as an installable Progressive Web App (PWA).
- When any script, stylesheet, or static asset is added or modified:
  1. Add the file path to `ASSETS` in [`sw.js`](file:///home/thomas/Apps/Budget%20Tracker/sw.js).
  2. Increment the cache version constant in [`sw.js`](file:///home/thomas/Apps/Budget%20Tracker/sw.js) (e.g. `sovereign-budget-v3` -> `sovereign-budget-v4`).
- Update [`sovereign-budget-tracker.zip`](file:///home/thomas/Apps/Budget%20Tracker/sovereign-budget-tracker.zip) to include updated code and tests.

---

## 7. Mandatory Unit Testing Rules
- **Rule**: **Run all unit tests after every prompt**.
- **Test Command**: `node tests/run_tests.js` (uses native Node.js test runner with `--experimental-test-coverage --test`).
- **Zero Failures**: 100% pass rate is mandatory. Any failing or skipped test must be resolved immediately.
- **Coverage**: Keep unit tests comprehensive for all modules under `tests/`:
  - `tests/constants.test.js`
  - `tests/currencies.test.js`
  - `tests/crypto.test.js`
  - `tests/encryption.test.js`
  - `tests/financials.test.js`
  - `tests/storage.test.js`
  - `tests/ui.test.js`
  - `tests/integration.test.js`
  - `tests/app.test.js`
- **Automatic Test Results Markdown Generation**:
  - **Rule**: Write a new `test-results.md` after all tests are run, every time.
  - The test runner `tests/run_tests.js` must automatically parse test outcomes, pass/fail counts, execution timestamps, duration, and line/branch/function coverage breakdown into `test-results.md` at the repository root.

