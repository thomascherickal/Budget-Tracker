# Sovereign Budget - Test Execution Results

**Execution Timestamp**: `2026-10-24T12:08:40.977Z` (Sat, 24 Oct 2026 12:08:40 GMT)  
**Environment**: Node.js `v24.19.0` (linux x64)  
**Overall Status**: ✅ **ALL TESTS PASSED (100% Line Coverage)**

## 1. Summary Statistics

| Metric | Count | Status |
| :--- | :---: | :--- |
| **Total Tests** | **109** | Complete suite |
| **Passed** | **109** | ✅ 100% Pass Rate |
| **Failed** | **0** | ✅ 0 Failures |
| **Skipped** | **0** | ✅ 0 Skipped |
| **Execution Time** | **4.57s** (`4565.30ms`) | High performance |

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
  ✔ should boot application, load cache, and render initial views (31.369554ms)
  ✔ should switch tabs across all panels and update header titles (5.466787ms)
  ✔ should navigate months forward and backward (2.28708ms)
  ✔ should submit quick transaction form with valid and invalid inputs (2.253884ms)
  ✔ should submit modal transaction form with valid and invalid inputs (2.717112ms)
  ✔ should update savings requirement setting (1.568065ms)
  ✔ should add and delete recurring and one-time planned expenses (2.68893ms)
  ✔ should change currency and update state and dropdowns (3.714225ms)
  ✔ should filter transactions by search, type, category and reset (3.133868ms)
  ✔ should handle export operations (plain and encrypted) (59.767036ms)
  ✔ should handle plain and encrypted import flows (1.455933ms)
  ✔ should clear local memory and restart fresh (1.7004ms)
  ✔ should trigger window resize and dispatch keyboard escape dismissal (1.197356ms)
  ✔ should return null when document is undefined or null (0.090694ms)
  ✔ should exercise dashboard savings variations and negative balance (3.521708ms)
  ✔ should exercise delete buttons on rendered tables (2.149344ms)
  ✔ should exercise chart rendering with Chart mock and callback handlers (2.349261ms)
Service Worker registered successfully. /
  ✔ should exercise handleImportJSON with mock FileReader (22.98272ms)
  ✔ should exercise service worker load event listener (1.954784ms)
  ✔ should initialize lucide icons when lucide is globally present (1.002085ms)
  ✔ should notify when autosaved budget is loaded with existing records (452.059309ms)
  ✔ should handle loadData catch block when storage throws (1.519944ms)
  ✔ should handle saveData catch block when storage quota is exceeded (1.951254ms)
  ✔ should handle export error gracefully in exportPlainJSON and exportDatabaseBackup (19.576286ms)
  ✔ should handle cancelled and corrupted processImportedContent flows (0.95382ms)
  ✔ should exercise interactive event listeners for nav, mobile-nav, scope tabs, clear db, backdrop, and type changes (1.89807ms)
  ✔ should validate rejection paths in formAddRecurring and formAddOnetime (0.35641ms)
  ✔ should filter transactions by specific category in renderTransactionsLog (0.522669ms)
  ✔ should exercise window resize when AppState.currentTab is reports (250.537852ms)
  ✔ should initialize db.settings.currency during init when currency setting is absent (1.285322ms)
  ✔ should test DOMContentLoaded registration when document is available (0.595669ms)
  ✔ should exercise dashboard savings target achieved message (1.115848ms)
✔ Application Orchestrator Suite (app.js Full Lifecycle) (894.120446ms)
▶ Constants Suite
  ✔ should verify storage cache and autosave keys (0.677082ms)
  ✔ should define valid expense and income category arrays (0.274613ms)
  ✔ should define valid chart palette and tab titles (0.320526ms)
  ✔ should attach properties to window in browser environment (1.538111ms)
✔ Constants Suite (4.112207ms)
▶ Crypto Module Suite
  ✔ should convert ArrayBuffer to Base64 and back across diverse byte lengths (2.563025ms)
  ✔ should test browser fallback conversion loops using btoa and atob (0.410882ms)
  ✔ should sanitize username during hashing (trimming and lowercasing) (18.391319ms)
  ✔ should derive a valid CryptoKey from PBKDF2 (31.893297ms)
  ✔ should encrypt and decrypt plaintext payloads accurately (44.642884ms)
  ✔ should reject decryption with incorrect username (47.325751ms)
  ✔ should reject invalid or tampered envelopes (48.801163ms)
  ✔ should throw WebCrypto API not available if crypto is missing (0.626994ms)
  ✔ should attach properties to window in browser environment (1.517363ms)
✔ Crypto Module Suite (200.183428ms)
▶ Currencies Suite
  ✔ should accurately detect currency from exact BCP-47 locale tags (2.571129ms)
  ✔ should match currency by language prefix if exact regional locale is absent (1.332077ms)
  ✔ should fallback to USD and $ for completely unknown locales or missing params in Node (0.420182ms)
  ✔ should detect user currency from navigator.language and navigator.languages in browser (0.205621ms)
  ✔ should resolve correct symbol for currency codes (0.245979ms)
  ✔ should resolve correct locale for currency codes (0.229305ms)
  ✔ should detect currencies for newly added countries and territories (0.224558ms)
  ✔ should resolve correct symbols for expanded currency options (0.293696ms)
  ✔ should format numerical amounts into localized currency strings (20.402414ms)
  ✔ should gracefully handle invalid currency codes with fallback formatting (0.419994ms)
  ✔ should fallback to en-US when window navigator lacks language properties (0.169264ms)
  ✔ should attach properties to window in browser environment (1.663093ms)
✔ Currencies Suite (31.560716ms)
▶ Cryptography Suite
  ✔ should convert ArrayBuffer to Base64 and back (3.282221ms)
  ✔ should sanitize username during hashing (case-insensitive and trim) (14.494134ms)
  ✔ should encrypt and decrypt data correctly with the correct username (73.584537ms)
  ✔ should fail decryption if an incorrect username is provided (57.79031ms)
  ✔ should succeed decryption with variations in whitespace and casing of the correct username (62.615049ms)
✔ Cryptography Suite (214.464679ms)
▶ Financial Calculations Suite
  ✔ should calculate financials correctly for a specific month (1.44383ms)
  ✔ should compute correct savings progress when surplus is below the requirement (0.247045ms)
  ✔ should clamp savings progress to 0% if actual surplus is negative (1.753224ms)
  ✔ should return 100% savings progress if savings requirement is 0 (0.190744ms)
  ✔ should throw an error if database state is missing (1.232846ms)
  ✔ should compile weekly report metrics accurately (22.824469ms)
  ✔ should compile monthly report metrics split into weeks (0.88573ms)
  ✔ should compile annual report metrics split into 12 months (0.825515ms)
  ✔ should generate appropriate diagnostic insights (1.021714ms)
  ✔ should gracefully handle empty or malformed database fields in getMonthFinancials (0.285086ms)
  ✔ should handle default arguments and edge cases in compileReportMetrics (1.812147ms)
  ✔ should attach properties to window in browser environment (1.306743ms)
✔ Financial Calculations Suite (37.953807ms)
▶ Integration Lifecycle Suite
  ✔ should successfully export and import a backup using matching usernames (75.179946ms)
  ✔ should block import and throw error if decryption username does not match export username (51.766993ms)
  ✔ should abort export if username prompt is cancelled (0.413277ms)
  ✔ should abort export and show warning if username prompt is empty (0.166514ms)
  ✔ should abort import if import username prompt is cancelled (27.307769ms)
  ✔ should abort import and show warning if import username is empty (22.91586ms)
  ✔ should support backward-compatibility for importing legacy unencrypted database schema without prompt (0.500602ms)
  ✔ should test currency symbol, locale mappings, and user currency detection logic (0.600096ms)
  ✔ should test autosave JSON serialization on exit and import on startup (0.351234ms)
  ✔ should test clear local memory and starting from scratch (0.219073ms)
✔ Integration Lifecycle Suite (184.470584ms)
▶ Storage Module Suite
  ✔ should return a valid clean database template (2.245683ms)
  ✔ should validate database schema accurately (0.401186ms)
  ✔ should persist data to both primary cache and autosave keys (0.454784ms)
  ✔ should handle storage errors gracefully in saveDataToStorage (0.6427ms)
  ✔ should load data prioritizing autosaved JSON export on startup (0.556269ms)
  ✔ should clear local memory keys safely and catch errors (0.277835ms)
  ✔ should create valid plain JSON export package (1.466158ms)
  ✔ should create encrypted backup and parse it back upon import (100.5575ms)
  ✔ should setup exit autosave event listeners on window and document (0.849367ms)
  ✔ should attach properties to window in browser environment (1.343231ms)
✔ Storage Module Suite (112.127835ms)
▶ UI Helpers Suite
  ✔ should calculate next and previous months with proper year rollover (1.527608ms)
  ✔ should format YYYY-MM into human-readable month labels and handle fallbacks (25.437926ms)
  ✔ should simulate DOM operations without crashing in headless environment (3.715032ms)
  ✔ should gracefully handle missing DOM elements in ui functions (0.28697ms)
  ✔ should handle headless environment safely when document is undefined (0.146518ms)
  ✔ should attach properties to window in browser environment (0.517119ms)
✔ UI Helpers Suite (34.319769ms)
ℹ tests 109
ℹ suites 0
ℹ pass 109
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 4565.298426
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
