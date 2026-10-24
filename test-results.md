# Sovereign Budget - Test Execution Results

**Execution Timestamp**: `2026-10-24T12:07:27.286Z` (Sat, 24 Oct 2026 12:07:27 GMT)  
**Environment**: Node.js `v24.19.0` (linux x64)  
**Overall Status**: ✅ **ALL TESTS PASSED (100% Line Coverage)**

## 1. Summary Statistics

| Metric | Count | Status |
| :--- | :---: | :--- |
| **Total Tests** | **109** | Complete suite |
| **Passed** | **109** | ✅ 100% Pass Rate |
| **Failed** | **0** | ✅ 0 Failures |
| **Skipped** | **0** | ✅ 0 Skipped |
| **Execution Time** | **4.59s** (`4585.34ms`) | High performance |

## 2. Code Coverage Breakdown

| Target File | Line Coverage | Branch Coverage | Function Coverage | Uncovered Lines |
| :--- | :---: | :---: | :---: | :--- |
| `app.js` | 100.00% | 81.01% | 89.80% | None |
| `js/constants.js` | 100.00% | 100.00% | 100.00% | None |
| `js/crypto.js` | 100.00% | 91.67% | 100.00% | None |
| `js/currencies.js` | 100.00% | 90.32% | 100.00% | None |
| `js/financials.js` | 100.00% | 83.69% | 87.50% | None |
| `js/storage.js` | 100.00% | 93.65% | 100.00% | None |
| `js/ui.js` | 100.00% | 94.83% | 100.00% | None |
| **All Files** | **100.00%** | **85.03%** | **90.86%** | **None** |

## 3. Test Suites Executed

- ✔ Application Orchestrator Suite (`tests/app.test.js`)
- ✔ Constants Definition Suite (`tests/constants.test.js`)
- ✔ Currencies & Internationalization Suite (`tests/currencies.test.js`)
- ✔ Crypto Module Suite (`tests/crypto.test.js`)
- ✔ AES-256-GCM Encryption Suite (`tests/encryption.test.js`)
- ✔ Financial Calculations Engine Suite (`tests/financials.test.js`)
- ✔ Storage Persistence & Autosave Suite (`tests/storage.test.js`)
- ✔ UI Helpers & DOM Sync Suite (`tests/ui.test.js`)
- ✔ End-to-End Integration Lifecycle Suite (`tests/integration.test.js`)

## 4. Execution Log & Verification

<details>
<summary>Click to view raw test runner output</summary>

```text
▶ Application Orchestrator Suite (app.js Full Lifecycle)
  ✔ should boot application, load cache, and render initial views (29.638871ms)
  ✔ should switch tabs across all panels and update header titles (6.998889ms)
  ✔ should navigate months forward and backward (2.478639ms)
  ✔ should submit quick transaction form with valid and invalid inputs (2.147222ms)
  ✔ should submit modal transaction form with valid and invalid inputs (1.917709ms)
  ✔ should update savings requirement setting (1.556359ms)
  ✔ should add and delete recurring and one-time planned expenses (3.814126ms)
  ✔ should change currency and update state and dropdowns (5.367931ms)
  ✔ should filter transactions by search, type, category and reset (3.83082ms)
  ✔ should handle export operations (plain and encrypted) (51.704559ms)
  ✔ should handle plain and encrypted import flows (2.175608ms)
  ✔ should clear local memory and restart fresh (3.886698ms)
  ✔ should trigger window resize and dispatch keyboard escape dismissal (2.321643ms)
  ✔ should return null when document is undefined or null (0.254608ms)
  ✔ should exercise dashboard savings variations and negative balance (4.780101ms)
  ✔ should exercise delete buttons on rendered tables (1.817849ms)
  ✔ should exercise chart rendering with Chart mock and callback handlers (1.708525ms)
Service Worker registered successfully. /
  ✔ should exercise handleImportJSON with mock FileReader (23.309478ms)
  ✔ should exercise service worker load event listener (3.79042ms)
  ✔ should initialize lucide icons when lucide is globally present (1.809056ms)
  ✔ should notify when autosaved budget is loaded with existing records (451.066317ms)
  ✔ should handle loadData catch block when storage throws (1.184887ms)
  ✔ should handle saveData catch block when storage quota is exceeded (1.75223ms)
  ✔ should handle export error gracefully in exportPlainJSON and exportDatabaseBackup (22.247932ms)
  ✔ should handle cancelled and corrupted processImportedContent flows (1.008898ms)
  ✔ should exercise interactive event listeners for nav, mobile-nav, scope tabs, clear db, backdrop, and type changes (2.151637ms)
  ✔ should validate rejection paths in formAddRecurring and formAddOnetime (0.408389ms)
  ✔ should filter transactions by specific category in renderTransactionsLog (0.580087ms)
  ✔ should exercise window resize when AppState.currentTab is reports (250.720472ms)
  ✔ should initialize db.settings.currency during init when currency setting is absent (0.909582ms)
  ✔ should test DOMContentLoaded registration when document is available (0.541992ms)
  ✔ should exercise dashboard savings target achieved message (1.260772ms)
✔ Application Orchestrator Suite (app.js Full Lifecycle) (897.253195ms)
▶ Constants Suite
  ✔ should verify storage cache and autosave keys (1.070458ms)
  ✔ should define valid expense and income category arrays (0.315917ms)
  ✔ should define valid chart palette and tab titles (0.532501ms)
  ✔ should attach properties to window in browser environment (2.059608ms)
✔ Constants Suite (6.242346ms)
▶ Crypto Module Suite
  ✔ should convert ArrayBuffer to Base64 and back across diverse byte lengths (2.303338ms)
  ✔ should test browser fallback conversion loops using btoa and atob (0.41612ms)
  ✔ should sanitize username during hashing (trimming and lowercasing) (15.383474ms)
  ✔ should derive a valid CryptoKey from PBKDF2 (30.892604ms)
  ✔ should encrypt and decrypt plaintext payloads accurately (85.089921ms)
  ✔ should reject decryption with incorrect username (64.452718ms)
  ✔ should reject invalid or tampered envelopes (37.9923ms)
  ✔ should throw WebCrypto API not available if crypto is missing (0.418737ms)
  ✔ should attach properties to window in browser environment (0.366324ms)
✔ Crypto Module Suite (240.281761ms)
▶ Currencies Suite
  ✔ should accurately detect currency from exact BCP-47 locale tags (3.230732ms)
  ✔ should match currency by language prefix if exact regional locale is absent (1.907025ms)
  ✔ should fallback to USD and $ for completely unknown locales or missing params in Node (0.629488ms)
  ✔ should detect user currency from navigator.language and navigator.languages in browser (0.329946ms)
  ✔ should resolve correct symbol for currency codes (0.241481ms)
  ✔ should resolve correct locale for currency codes (0.237887ms)
  ✔ should detect currencies for newly added countries and territories (0.233371ms)
  ✔ should resolve correct symbols for expanded currency options (1.303322ms)
  ✔ should format numerical amounts into localized currency strings (27.25081ms)
  ✔ should gracefully handle invalid currency codes with fallback formatting (1.236544ms)
  ✔ should fallback to en-US when window navigator lacks language properties (0.191634ms)
  ✔ should attach properties to window in browser environment (1.689188ms)
✔ Currencies Suite (42.045396ms)
▶ Cryptography Suite
  ✔ should convert ArrayBuffer to Base64 and back (5.409523ms)
  ✔ should sanitize username during hashing (case-insensitive and trim) (11.60094ms)
  ✔ should encrypt and decrypt data correctly with the correct username (76.569108ms)
  ✔ should fail decryption if an incorrect username is provided (50.400781ms)
  ✔ should succeed decryption with variations in whitespace and casing of the correct username (80.481482ms)
✔ Cryptography Suite (227.647121ms)
▶ Financial Calculations Suite
  ✔ should calculate financials correctly for a specific month (1.408223ms)
  ✔ should compute correct savings progress when surplus is below the requirement (0.252635ms)
  ✔ should clamp savings progress to 0% if actual surplus is negative (1.154174ms)
  ✔ should return 100% savings progress if savings requirement is 0 (0.179416ms)
  ✔ should throw an error if database state is missing (1.199244ms)
  ✔ should compile weekly report metrics accurately (21.44075ms)
  ✔ should compile monthly report metrics split into weeks (0.877662ms)
  ✔ should compile annual report metrics split into 12 months (0.565529ms)
  ✔ should generate appropriate diagnostic insights (1.810407ms)
  ✔ should gracefully handle empty or malformed database fields in getMonthFinancials (0.286567ms)
  ✔ should handle default arguments and edge cases in compileReportMetrics (1.364921ms)
  ✔ should attach properties to window in browser environment (1.440224ms)
✔ Financial Calculations Suite (37.971321ms)
▶ Integration Lifecycle Suite
  ✔ should successfully export and import a backup using matching usernames (71.56641ms)
  ✔ should block import and throw error if decryption username does not match export username (43.245601ms)
  ✔ should abort export if username prompt is cancelled (0.459731ms)
  ✔ should abort export and show warning if username prompt is empty (0.158502ms)
  ✔ should abort import if import username prompt is cancelled (23.627183ms)
  ✔ should abort import and show warning if import username is empty (24.908815ms)
  ✔ should support backward-compatibility for importing legacy unencrypted database schema without prompt (0.494755ms)
  ✔ should test currency symbol, locale mappings, and user currency detection logic (0.956204ms)
  ✔ should test autosave JSON serialization on exit and import on startup (0.273624ms)
  ✔ should test clear local memory and starting from scratch (0.20488ms)
✔ Integration Lifecycle Suite (171.371128ms)
▶ Storage Module Suite
  ✔ should return a valid clean database template (2.36082ms)
  ✔ should validate database schema accurately (0.357575ms)
  ✔ should persist data to both primary cache and autosave keys (0.490907ms)
  ✔ should handle storage errors gracefully in saveDataToStorage (0.819804ms)
  ✔ should load data prioritizing autosaved JSON export on startup (0.747145ms)
  ✔ should clear local memory keys safely and catch errors (0.313917ms)
  ✔ should create valid plain JSON export package (0.368683ms)
  ✔ should create encrypted backup and parse it back upon import (99.225941ms)
  ✔ should setup exit autosave event listeners on window and document (0.355017ms)
  ✔ should attach properties to window in browser environment (0.893866ms)
✔ Storage Module Suite (112.034427ms)
▶ UI Helpers Suite
  ✔ should calculate next and previous months with proper year rollover (1.390763ms)
  ✔ should format YYYY-MM into human-readable month labels and handle fallbacks (16.856598ms)
  ✔ should simulate DOM operations without crashing in headless environment (6.860564ms)
  ✔ should gracefully handle missing DOM elements in ui functions (0.258875ms)
  ✔ should handle headless environment safely when document is undefined (0.202486ms)
  ✔ should attach properties to window in browser environment (0.502696ms)
✔ UI Helpers Suite (29.181449ms)
ℹ tests 109
ℹ suites 0
ℹ pass 109
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 4585.336974
ℹ start of coverage report
ℹ ---------------------------------------------------------------
ℹ file           | line % | branch % | funcs % | uncovered lines
ℹ ---------------------------------------------------------------
ℹ app.js         | 100.00 |    81.01 |   89.80 | 
ℹ js             |        |          |         | 
ℹ  constants.js  | 100.00 |   100.00 |  100.00 | 
ℹ  crypto.js     | 100.00 |    91.67 |  100.00 | 
ℹ  currencies.js | 100.00 |    90.32 |  100.00 | 
ℹ  financials.js | 100.00 |    83.69 |   87.50 | 
ℹ  storage.js    | 100.00 |    93.65 |  100.00 | 
ℹ  ui.js         | 100.00 |    94.83 |  100.00 | 
ℹ ---------------------------------------------------------------
ℹ all files      | 100.00 |    85.03 |   90.86 | 
ℹ ---------------------------------------------------------------
ℹ end of coverage report
```
</details>
