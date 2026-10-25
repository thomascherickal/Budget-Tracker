# Sovereign Budget - Test Execution Results

**Execution Timestamp**: `2026-10-25T08:36:47.256Z` (Sun, 25 Oct 2026 08:36:47 GMT)  
**Environment**: Node.js `v24.19.0` (linux x64)  
**Overall Status**: ✅ **ALL TESTS PASSED (100% Line Coverage)**

## 1. Summary Statistics

| Metric | Count | Status |
| :--- | :---: | :--- |
| **Total Tests** | **131** | Complete suite |
| **Passed** | **131** | ✅ 100% Pass Rate |
| **Failed** | **0** | ✅ 0 Failures |
| **Skipped** | **0** | ✅ 0 Skipped |
| **Execution Time** | **5.35s** (`5349.40ms`) | High performance |

## 2. Code Coverage Breakdown

| Target File | Line Coverage | Branch Coverage | Function Coverage | Uncovered Lines |
| :--- | :---: | :---: | :---: | :--- |
| `app.js` | 100.00% | 83.02% | 88.29% | None |
| `js/constants.js` | 100.00% | 100.00% | 100.00% | None |
| `js/crypto.js` | 100.00% | 91.67% | 100.00% | None |
| `js/currencies.js` | 100.00% | 90.32% | 100.00% | None |
| `js/financials.js` | 100.00% | 83.56% | 92.19% | None |
| `js/responsive.js` | 100.00% | 93.62% | 100.00% | None |
| `js/storage.js` | 100.00% | 90.08% | 100.00% | None |
| `js/ui.js` | 100.00% | 92.71% | 100.00% | None |
| **All Files** | **100.00%** | **86.47%** | **92.53%** | **None** |

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
  ✔ should boot application, load cache, and render initial views (33.607726ms)
  ✔ should switch tabs across all panels and update header titles (5.609185ms)
  ✔ should navigate months forward and backward (2.483184ms)
  ✔ should submit quick transaction form with valid and invalid inputs (2.710913ms)
  ✔ should submit modal transaction form with valid and invalid inputs (2.16794ms)
  ✔ should update savings requirement setting (8.171077ms)
  ✔ should add and delete recurring and one-time planned expenses (1.90548ms)
  ✔ should change currency and update state and dropdowns (1.874574ms)
  ✔ should filter transactions by search, type, category and reset (4.13818ms)
  ✔ should handle export operations (plain and encrypted) (49.352123ms)
  ✔ should handle plain and encrypted import flows (4.611702ms)
  ✔ should clear local memory and restart fresh (2.40997ms)
  ✔ should trigger window resize and dispatch keyboard escape dismissal (2.008118ms)
  ✔ should return null when document is undefined or null (0.144975ms)
  ✔ should exercise dashboard savings variations and negative balance (4.825237ms)
  ✔ should exercise delete buttons on rendered tables (2.746534ms)
  ✔ should exercise chart rendering with Chart mock and callback handlers (2.435509ms)
Service Worker registered successfully. /
  ✔ should exercise handleImportJSON with mock FileReader (21.389347ms)
  ✔ should exercise service worker load event listener (1.355165ms)
  ✔ should initialize lucide icons when lucide is globally present (0.717256ms)
  ✔ should notify when autosaved budget is loaded with existing records (451.722105ms)
  ✔ should handle loadData catch block when storage throws (0.932267ms)
  ✔ should handle saveData catch block when storage quota is exceeded (0.701015ms)
  ✔ should handle export error gracefully in exportPlainJSON and exportDatabaseBackup (18.572805ms)
  ✔ should handle cancelled and corrupted processImportedContent flows (1.48607ms)
  ✔ should exercise interactive event listeners for nav, mobile-nav, scope tabs, clear db, backdrop, and type changes (3.335916ms)
  ✔ should validate rejection paths in formAddRecurring and formAddOnetime (0.379279ms)
  ✔ should filter transactions by specific category in renderTransactionsLog (0.456981ms)
  ✔ should exercise window resize when AppState.currentTab is reports (250.828108ms)
  ✔ should initialize db.settings.currency during init when currency setting is absent (0.867672ms)
  ✔ should test DOMContentLoaded registration when document is available (0.707336ms)
  ✔ should exercise dashboard savings target achieved message (0.973243ms)
  ✔ should exercise storage status UI and cross-platform guide modal interactions (100.290693ms)
  ✔ should boot application in fallback mode and trigger warning toast (651.739638ms)
  ✔ should handle auto-persistence and quota check on startup (50.735658ms)
  ✔ should exercise bootApp default parameter when getUniversalStorage is absent (0.80677ms)
  ✔ should wire clear buttons on text fields and delete entries when clicked (0.700186ms)
  ✔ should delete transaction from dashboard recent list via X button and via deleteTransaction (1.477859ms)
✔ Application Orchestrator Suite (app.js Full Lifecycle) (1700.051151ms)
▶ Constants Suite
  ✔ should verify storage cache and autosave keys (0.982891ms)
  ✔ should define valid expense and income category arrays (0.358089ms)
  ✔ should define valid chart palette and tab titles (0.537437ms)
  ✔ should attach properties to window in browser environment (3.607884ms)
✔ Constants Suite (7.700104ms)
▶ Crypto Module Suite
  ✔ should convert ArrayBuffer to Base64 and back across diverse byte lengths (2.205372ms)
  ✔ should test browser fallback conversion loops using btoa and atob (0.511081ms)
  ✔ should sanitize username during hashing (trimming and lowercasing) (12.406875ms)
  ✔ should derive a valid CryptoKey from PBKDF2 (40.495244ms)
  ✔ should encrypt and decrypt plaintext payloads accurately (65.10763ms)
  ✔ should reject decryption with incorrect username (62.530308ms)
  ✔ should reject invalid or tampered envelopes (38.013542ms)
  ✔ should throw WebCrypto API not available if crypto is missing (0.485672ms)
  ✔ should attach properties to window in browser environment (0.315666ms)
✔ Crypto Module Suite (227.3692ms)
▶ Currencies Suite
  ✔ should accurately detect currency from exact BCP-47 locale tags (2.770196ms)
  ✔ should match currency by language prefix if exact regional locale is absent (3.422657ms)
  ✔ should fallback to USD and $ for completely unknown locales or missing params in Node (0.49976ms)
  ✔ should detect user currency from navigator.language and navigator.languages in browser (0.311908ms)
  ✔ should resolve correct symbol for currency codes (0.23336ms)
  ✔ should resolve correct locale for currency codes (0.199075ms)
  ✔ should detect currencies for newly added countries and territories (0.234693ms)
  ✔ should resolve correct symbols for expanded currency options (1.342294ms)
  ✔ should format numerical amounts into localized currency strings (22.221338ms)
  ✔ should gracefully handle invalid currency codes with fallback formatting (0.420288ms)
  ✔ should fallback to en-US when window navigator lacks language properties (0.196047ms)
  ✔ should attach properties to window in browser environment (1.773979ms)
✔ Currencies Suite (39.364141ms)
▶ Cryptography Suite
  ✔ should convert ArrayBuffer to Base64 and back (2.248661ms)
  ✔ should sanitize username during hashing (case-insensitive and trim) (12.656101ms)
  ✔ should encrypt and decrypt data correctly with the correct username (51.275355ms)
  ✔ should fail decryption if an incorrect username is provided (57.87705ms)
  ✔ should succeed decryption with variations in whitespace and casing of the correct username (79.311362ms)
✔ Cryptography Suite (207.214032ms)
▶ Financial Calculations Suite
  ✔ should calculate financials correctly for a specific month (1.409622ms)
  ✔ should compute correct savings progress when surplus is below the requirement (0.355899ms)
  ✔ should clamp savings progress to 0% if actual surplus is negative (2.527537ms)
  ✔ should return 100% savings progress if savings requirement is 0 (0.451556ms)
  ✔ should throw an error if database state is missing (1.410485ms)
  ✔ should compile weekly report metrics accurately (23.809367ms)
  ✔ should compile monthly report metrics split into weeks (0.849093ms)
  ✔ should compile annual report metrics split into 12 months (0.568009ms)
  ✔ should generate appropriate diagnostic insights (0.564219ms)
  ✔ should gracefully handle empty or malformed database fields in getMonthFinancials (0.177659ms)
  ✔ should handle default arguments and edge cases in compileReportMetrics (1.549213ms)
  ✔ should attach properties to window in browser environment (0.554276ms)
✔ Financial Calculations Suite (38.096188ms)
▶ Integration Lifecycle Suite
  ✔ should successfully export and import a backup using matching usernames (60.146517ms)
  ✔ should block import and throw error if decryption username does not match export username (69.898698ms)
  ✔ should abort export if username prompt is cancelled (0.247352ms)
  ✔ should abort export and show warning if username prompt is empty (0.165227ms)
  ✔ should abort import if import username prompt is cancelled (32.122584ms)
  ✔ should abort import and show warning if import username is empty (28.195956ms)
  ✔ should support backward-compatibility for importing legacy unencrypted database schema without prompt (0.51686ms)
  ✔ should test currency symbol, locale mappings, and user currency detection logic (0.624997ms)
  ✔ should test autosave JSON serialization on exit and import on startup (0.220497ms)
  ✔ should test clear local memory and starting from scratch (0.198694ms)
✔ Integration Lifecycle Suite (195.117256ms)
▶ Responsive Layout Engine Suite
  ✔ should define valid breakpoint constants (1.442363ms)
  ✔ should correctly classify screen modes based on viewport width (0.34986ms)
  ✔ should evaluate device view booleans accurately (0.222877ms)
  ✔ should handle default arguments and window fallbacks for screen detection (2.176009ms)
  ✔ should exercise scrollToContentTop with mock elements and document query fallback (1.573191ms)
  ✔ should sync screen mode attributes on DOM elements (0.451263ms)
  ✔ should setup and cleanup responsive window listeners (0.354727ms)
  ✔ should verify modular responsive CSS files exist and contain required anti-overlap rules (0.748456ms)
  ✔ should attach properties to window in browser environment (0.903397ms)
✔ Responsive Layout Engine Suite (12.164005ms)
▶ Storage Module Suite
  ✔ should return a valid clean database template (2.718478ms)
  ✔ should validate database schema accurately (0.374341ms)
  ✔ should persist data to both primary cache and autosave keys (0.515638ms)
  ✔ should handle storage errors gracefully in saveDataToStorage (0.726073ms)
  ✔ should load data prioritizing autosaved JSON export on startup (0.876702ms)
  ✔ should clear local memory keys safely and catch errors (1.675574ms)
  ✔ should create valid plain JSON export package (0.384298ms)
  ✔ should create encrypted backup and parse it back upon import (96.535629ms)
  ✔ should setup exit autosave event listeners on window and document (0.302338ms)
  ✔ should exercise createMemoryStorage adapter methods and properties (0.253655ms)
  ✔ should verify isStorageAvailable under diverse window environments (0.212021ms)
  ✔ should resolve universal storage with proper cascade priority (0.185081ms)
  ✔ should request persistent storage permission via StorageManager API (0.221029ms)
  ✔ should check storage quota and persistence state safely (0.28671ms)
  ✔ should attach properties to window in browser environment (0.407196ms)
✔ Storage Module Suite (109.579623ms)
▶ UI Helpers Suite
  ✔ should calculate next and previous months with proper year rollover (1.008243ms)
  ✔ should format YYYY-MM into human-readable month labels and handle fallbacks (22.414724ms)
  ✔ should simulate DOM operations without crashing in headless environment (3.036725ms)
  ✔ should gracefully handle missing DOM elements in ui functions (0.320021ms)
  ✔ should handle headless environment safely when document is undefined (0.181149ms)
  ✔ should wire clear buttons, handle clicking, typing, and Escape key in setupInputClearButtons (1.117846ms)
  ✔ should attach properties to window in browser environment (0.720204ms)
✔ UI Helpers Suite (30.856065ms)
ℹ tests 131
ℹ suites 0
ℹ pass 131
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 5349.400027
ℹ start of coverage report
ℹ ---------------------------------------------------------------
ℹ file           | line % | branch % | funcs % | uncovered lines
ℹ ---------------------------------------------------------------
ℹ app.js         | 100.00 |    83.02 |   88.29 | 
ℹ js             |        |          |         | 
ℹ  constants.js  | 100.00 |   100.00 |  100.00 | 
ℹ  crypto.js     | 100.00 |    91.67 |  100.00 | 
ℹ  currencies.js | 100.00 |    90.32 |  100.00 | 
ℹ  financials.js | 100.00 |    83.56 |   92.19 | 
ℹ  responsive.js | 100.00 |    93.62 |  100.00 | 
ℹ  storage.js    | 100.00 |    90.08 |  100.00 | 
ℹ  ui.js         | 100.00 |    92.71 |  100.00 | 
ℹ ---------------------------------------------------------------
ℹ all files      | 100.00 |    86.47 |   92.53 | 
ℹ ---------------------------------------------------------------
ℹ end of coverage report
```
</details>
