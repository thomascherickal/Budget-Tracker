# Sovereign Budget - Test Execution Results

**Execution Timestamp**: `2026-10-24T12:41:31.363Z` (Sat, 24 Oct 2026 12:41:31 GMT)  
**Environment**: Node.js `v24.19.0` (linux x64)  
**Overall Status**: ✅ **ALL TESTS PASSED (100% Line Coverage)**

## 1. Summary Statistics

| Metric | Count | Status |
| :--- | :---: | :--- |
| **Total Tests** | **128** | Complete suite |
| **Passed** | **128** | ✅ 100% Pass Rate |
| **Failed** | **0** | ✅ 0 Failures |
| **Skipped** | **0** | ✅ 0 Skipped |
| **Execution Time** | **5.36s** (`5360.31ms`) | High performance |

## 2. Code Coverage Breakdown

| Target File | Line Coverage | Branch Coverage | Function Coverage | Uncovered Lines |
| :--- | :---: | :---: | :---: | :--- |
| `app.js` | 100.00% | 82.97% | 88.79% | None |
| `js/constants.js` | 100.00% | 100.00% | 100.00% | None |
| `js/crypto.js` | 100.00% | 91.67% | 100.00% | None |
| `js/currencies.js` | 100.00% | 90.32% | 100.00% | None |
| `js/financials.js` | 100.00% | 83.69% | 87.50% | None |
| `js/responsive.js` | 100.00% | 93.62% | 100.00% | None |
| `js/storage.js` | 100.00% | 90.08% | 100.00% | None |
| `js/ui.js` | 100.00% | 95.08% | 100.00% | None |
| **All Files** | **100.00%** | **86.43%** | **91.23%** | **None** |

## 3. Test Suites Executed

- ✔ Application Orchestrator Suite (`tests/app.test.js`)
- ✔ Constants Definition Suite (`tests/constants.test.js`)
- ✔ Currencies & Internationalization Suite (`tests/currencies.test.js`)
- ✔ Crypto Module Suite (`tests/crypto.test.js`)
- ✔ AES-256-GCM Encryption Suite (`tests/encryption.test.js`)
- ✔ Financial Calculations Engine Suite (`tests/financials.test.js`)
- ✔ Storage Persistence & Autosave Suite (`tests/storage.test.js`)
- ✔ UI Helpers & DOM Sync Suite (`tests/ui.test.js`)
- ✔ Responsive Layout Engine Suite (`tests/responsive.test.js`)
- ✔ End-to-End Integration Lifecycle Suite (`tests/integration.test.js`)

## 4. Execution Log & Verification

<details>
<summary>Click to view raw test runner output</summary>

```text
▶ Application Orchestrator Suite (app.js Full Lifecycle)
  ✔ should boot application, load cache, and render initial views (31.788328ms)
  ✔ should switch tabs across all panels and update header titles (4.480672ms)
  ✔ should navigate months forward and backward (2.346609ms)
  ✔ should submit quick transaction form with valid and invalid inputs (2.048918ms)
  ✔ should submit modal transaction form with valid and invalid inputs (2.315072ms)
  ✔ should update savings requirement setting (3.410409ms)
  ✔ should add and delete recurring and one-time planned expenses (4.910904ms)
  ✔ should change currency and update state and dropdowns (1.3907ms)
  ✔ should filter transactions by search, type, category and reset (2.293533ms)
  ✔ should handle export operations (plain and encrypted) (43.326474ms)
  ✔ should handle plain and encrypted import flows (3.124389ms)
  ✔ should clear local memory and restart fresh (1.901719ms)
  ✔ should trigger window resize and dispatch keyboard escape dismissal (1.215981ms)
  ✔ should return null when document is undefined or null (0.136634ms)
  ✔ should exercise dashboard savings variations and negative balance (4.736523ms)
  ✔ should exercise delete buttons on rendered tables (3.51203ms)
  ✔ should exercise chart rendering with Chart mock and callback handlers (1.980778ms)
Service Worker registered successfully. /
  ✔ should exercise handleImportJSON with mock FileReader (23.04202ms)
  ✔ should exercise service worker load event listener (2.272384ms)
  ✔ should initialize lucide icons when lucide is globally present (1.355278ms)
  ✔ should notify when autosaved budget is loaded with existing records (454.536909ms)
  ✔ should handle loadData catch block when storage throws (1.007013ms)
  ✔ should handle saveData catch block when storage quota is exceeded (0.693407ms)
  ✔ should handle export error gracefully in exportPlainJSON and exportDatabaseBackup (19.696787ms)
  ✔ should handle cancelled and corrupted processImportedContent flows (1.240887ms)
  ✔ should exercise interactive event listeners for nav, mobile-nav, scope tabs, clear db, backdrop, and type changes (3.850687ms)
  ✔ should validate rejection paths in formAddRecurring and formAddOnetime (0.761663ms)
  ✔ should filter transactions by specific category in renderTransactionsLog (2.064682ms)
  ✔ should exercise window resize when AppState.currentTab is reports (251.456443ms)
  ✔ should initialize db.settings.currency during init when currency setting is absent (1.530651ms)
  ✔ should test DOMContentLoaded registration when document is available (0.689968ms)
  ✔ should exercise dashboard savings target achieved message (1.095735ms)
  ✔ should exercise storage status UI and cross-platform guide modal interactions (100.784646ms)
  ✔ should boot application in fallback mode and trigger warning toast (650.696733ms)
  ✔ should handle auto-persistence and quota check on startup (50.990988ms)
  ✔ should exercise bootApp default parameter when getUniversalStorage is absent (1.563483ms)
✔ Application Orchestrator Suite (app.js Full Lifecycle) (1695.421412ms)
▶ Constants Suite
  ✔ should verify storage cache and autosave keys (1.340343ms)
  ✔ should define valid expense and income category arrays (0.304671ms)
  ✔ should define valid chart palette and tab titles (0.659156ms)
  ✔ should attach properties to window in browser environment (4.192905ms)
✔ Constants Suite (8.766718ms)
▶ Crypto Module Suite
  ✔ should convert ArrayBuffer to Base64 and back across diverse byte lengths (2.904653ms)
  ✔ should test browser fallback conversion loops using btoa and atob (1.111247ms)
  ✔ should sanitize username during hashing (trimming and lowercasing) (8.005036ms)
  ✔ should derive a valid CryptoKey from PBKDF2 (25.213875ms)
  ✔ should encrypt and decrypt plaintext payloads accurately (54.074335ms)
  ✔ should reject decryption with incorrect username (53.415357ms)
  ✔ should reject invalid or tampered envelopes (57.432061ms)
  ✔ should throw WebCrypto API not available if crypto is missing (0.86848ms)
  ✔ should attach properties to window in browser environment (1.399733ms)
✔ Crypto Module Suite (209.032931ms)
▶ Currencies Suite
  ✔ should accurately detect currency from exact BCP-47 locale tags (3.292551ms)
  ✔ should match currency by language prefix if exact regional locale is absent (2.340288ms)
  ✔ should fallback to USD and $ for completely unknown locales or missing params in Node (0.4766ms)
  ✔ should detect user currency from navigator.language and navigator.languages in browser (0.217406ms)
  ✔ should resolve correct symbol for currency codes (0.380816ms)
  ✔ should resolve correct locale for currency codes (0.326301ms)
  ✔ should detect currencies for newly added countries and territories (0.292843ms)
  ✔ should resolve correct symbols for expanded currency options (0.851582ms)
  ✔ should format numerical amounts into localized currency strings (22.847566ms)
  ✔ should gracefully handle invalid currency codes with fallback formatting (0.742698ms)
  ✔ should fallback to en-US when window navigator lacks language properties (0.21758ms)
  ✔ should attach properties to window in browser environment (1.873996ms)
✔ Currencies Suite (39.39083ms)
▶ Cryptography Suite
  ✔ should convert ArrayBuffer to Base64 and back (9.858332ms)
  ✔ should sanitize username during hashing (case-insensitive and trim) (11.0924ms)
  ✔ should encrypt and decrypt data correctly with the correct username (61.651487ms)
  ✔ should fail decryption if an incorrect username is provided (58.709685ms)
  ✔ should succeed decryption with variations in whitespace and casing of the correct username (74.95287ms)
✔ Cryptography Suite (219.441102ms)
▶ Financial Calculations Suite
  ✔ should calculate financials correctly for a specific month (1.747408ms)
  ✔ should compute correct savings progress when surplus is below the requirement (0.235868ms)
  ✔ should clamp savings progress to 0% if actual surplus is negative (1.870157ms)
  ✔ should return 100% savings progress if savings requirement is 0 (0.227302ms)
  ✔ should throw an error if database state is missing (1.267851ms)
  ✔ should compile weekly report metrics accurately (19.171234ms)
  ✔ should compile monthly report metrics split into weeks (0.739765ms)
  ✔ should compile annual report metrics split into 12 months (0.563282ms)
  ✔ should generate appropriate diagnostic insights (0.8044ms)
  ✔ should gracefully handle empty or malformed database fields in getMonthFinancials (0.179034ms)
  ✔ should handle default arguments and edge cases in compileReportMetrics (1.975923ms)
  ✔ should attach properties to window in browser environment (2.173174ms)
✔ Financial Calculations Suite (34.573621ms)
▶ Integration Lifecycle Suite
  ✔ should successfully export and import a backup using matching usernames (77.558991ms)
  ✔ should block import and throw error if decryption username does not match export username (80.450836ms)
  ✔ should abort export if username prompt is cancelled (1.089626ms)
  ✔ should abort export and show warning if username prompt is empty (0.605742ms)
  ✔ should abort import if import username prompt is cancelled (22.727674ms)
  ✔ should abort import and show warning if import username is empty (21.310606ms)
  ✔ should support backward-compatibility for importing legacy unencrypted database schema without prompt (0.472049ms)
  ✔ should test currency symbol, locale mappings, and user currency detection logic (0.651912ms)
  ✔ should test autosave JSON serialization on exit and import on startup (0.396878ms)
  ✔ should test clear local memory and starting from scratch (0.423212ms)
✔ Integration Lifecycle Suite (210.060403ms)
▶ Responsive Layout Engine Suite
  ✔ should define valid breakpoint constants (1.034287ms)
  ✔ should correctly classify screen modes based on viewport width (0.232196ms)
  ✔ should evaluate device view booleans accurately (0.252438ms)
  ✔ should handle default arguments and window fallbacks for screen detection (3.335413ms)
  ✔ should exercise scrollToContentTop with mock elements and document query fallback (1.885194ms)
  ✔ should sync screen mode attributes on DOM elements (0.383187ms)
  ✔ should setup and cleanup responsive window listeners (0.418508ms)
  ✔ should verify modular responsive CSS files exist and contain required anti-overlap rules (0.708557ms)
  ✔ should attach properties to window in browser environment (3.576064ms)
✔ Responsive Layout Engine Suite (14.760054ms)
▶ Storage Module Suite
  ✔ should return a valid clean database template (5.130389ms)
  ✔ should validate database schema accurately (0.642806ms)
  ✔ should persist data to both primary cache and autosave keys (0.38111ms)
  ✔ should handle storage errors gracefully in saveDataToStorage (1.381503ms)
  ✔ should load data prioritizing autosaved JSON export on startup (0.62808ms)
  ✔ should clear local memory keys safely and catch errors (2.059426ms)
  ✔ should create valid plain JSON export package (0.314473ms)
  ✔ should create encrypted backup and parse it back upon import (76.903191ms)
  ✔ should setup exit autosave event listeners on window and document (0.966699ms)
  ✔ should exercise createMemoryStorage adapter methods and properties (0.414851ms)
  ✔ should verify isStorageAvailable under diverse window environments (0.211087ms)
  ✔ should resolve universal storage with proper cascade priority (0.185557ms)
  ✔ should request persistent storage permission via StorageManager API (0.22964ms)
  ✔ should check storage quota and persistence state safely (0.292536ms)
  ✔ should attach properties to window in browser environment (0.342044ms)
✔ Storage Module Suite (100.191986ms)
▶ UI Helpers Suite
  ✔ should calculate next and previous months with proper year rollover (2.24092ms)
  ✔ should format YYYY-MM into human-readable month labels and handle fallbacks (23.021971ms)
  ✔ should simulate DOM operations without crashing in headless environment (3.834575ms)
  ✔ should gracefully handle missing DOM elements in ui functions (0.394634ms)
  ✔ should handle headless environment safely when document is undefined (0.157973ms)
  ✔ should attach properties to window in browser environment (0.535578ms)
✔ UI Helpers Suite (36.806ms)
ℹ tests 128
ℹ suites 0
ℹ pass 128
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 5360.312925
ℹ start of coverage report
ℹ ---------------------------------------------------------------
ℹ file           | line % | branch % | funcs % | uncovered lines
ℹ ---------------------------------------------------------------
ℹ app.js         | 100.00 |    82.97 |   88.79 | 
ℹ js             |        |          |         | 
ℹ  constants.js  | 100.00 |   100.00 |  100.00 | 
ℹ  crypto.js     | 100.00 |    91.67 |  100.00 | 
ℹ  currencies.js | 100.00 |    90.32 |  100.00 | 
ℹ  financials.js | 100.00 |    83.69 |   87.50 | 
ℹ  responsive.js | 100.00 |    93.62 |  100.00 | 
ℹ  storage.js    | 100.00 |    90.08 |  100.00 | 
ℹ  ui.js         | 100.00 |    95.08 |  100.00 | 
ℹ ---------------------------------------------------------------
ℹ all files      | 100.00 |    86.43 |   91.23 | 
ℹ ---------------------------------------------------------------
ℹ end of coverage report
```
</details>
