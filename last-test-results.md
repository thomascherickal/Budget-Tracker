# Sovereign Budget Test Execution & Coverage Report

**Run Date**: 2026-06-16  
**Node.js Version**: v18.19.1  
**Execution Environment**: Offline Headless Node.js (No browser dependencies)

---

## 1. Test Execution Summary

| Test Module / Suite | Nested Cases | Passed | Failed | Status |
| :--- | :---: | :---: | :---: | :---: |
| 🔑 **Cryptography Suite** (`tests/encryption.test.js`) | 5 | 5 | 0 | ✅ PASSED |
| 📊 **Financial Calculations Suite** (`tests/financials.test.js`) | 4 | 4 | 0 | ✅ PASSED |
| 🔄 **Integration Lifecycle Suite** (`tests/integration.test.js`) | 8 | 8 | 0 | ✅ PASSED |
| **Total Test Runs** (including suite contexts) | **20** | **20** | **0** | **✅ ALL PASSED** |

### Test Case Breakdown

#### 1. Cryptography Suite (`tests/encryption.test.js`)
*   `[x]` **should convert ArrayBuffer to Base64 and back**: Asserts correct encoding and decoding of binary data.
*   `[x]` **should sanitize username during hashing**: Asserts case-insensitivity and whitespace trimming for keys.
*   `[x]` **should encrypt and decrypt data correctly**: Asserts a successful cryptographic roundtrip for backup payloads.
*   `[x]` **should fail decryption if an incorrect username is provided**: Verifies authentication rejection of invalid keys.
*   `[x]` **should succeed decryption with variations in whitespace and casing**: Verifies user input resilience.

#### 2. Financial Calculations Suite (`tests/financials.test.js`)
*   `[x]` **should calculate financials correctly for a specific month**: Verifies aggregation of income, variable expenses, recurring commitments, and planned one-times.
*   `[x]` **should compute correct savings progress when surplus is below the requirement**: Asserts math behind target percentages.
*   `[x]` **should clamp savings progress to 0% if actual surplus is negative**: Asserts protection against negative values.
*   `[x]` **should return 100% savings progress if savings requirement is 0**: Asserts math logic fallback.

#### 3. Integration Lifecycle Suite (`tests/integration.test.js`)
*   `[x]` **should successfully export and import a backup**: Verifies matching username encryption/decryption state roundtrip.
*   `[x]` **should block import and throw error on username mismatch**: Mocks `prompt()` responses to verify that state modification is prevented on failure.
*   `[x]` **should abort export if username prompt is cancelled**: Asserts correct escape routing.
*   `[x]` **should abort export and show warning if username prompt is empty**: Verifies empty string validations.
*   `[x]` **should abort import if import username prompt is cancelled**: Asserts escape routing on import.
*   `[x]` **should abort import and show warning if import username is empty**: Verifies user input checks.
*   `[x]` **should support backward-compatibility for importing legacy unencrypted schema**: Asserts that old, unencrypted JSON files can be imported seamlessly without prompting for a username.
*   `[x]` **should test currency symbol, locale mappings, and user currency detection logic**: Asserts lookup dictionaries and environment checks.

---

## 2. Test Code Coverage Report

Code coverage was evaluated using Node.js's native coverage runner (`--experimental-test-coverage` flag).

| File | Line Coverage % | Branch Coverage % | Function Coverage % | Uncovered Lines |
| :--- | :---: | :---: | :---: | :--- |
| **[app.js](file:///home/thomas/Projects/Budget%20Tracker/app.js)** | 17.72% | 63.83% | 94.44% | 6-1269, 1280-1285, 1293-1295 (DOM/Browser-only blocks) |
| **[tests/encryption.test.js](file:///home/thomas/Projects/Budget%20Tracker/tests/encryption.test.js)** | 100.00% | 88.89% | 100.00% | *None* |
| **[tests/financials.test.js](file:///home/thomas/Projects/Budget%20Tracker/tests/financials.test.js)** | 100.00% | 100.00% | 100.00% | *None* |
| **[tests/integration.test.js](file:///home/thomas/Projects/Budget%20Tracker/tests/integration.test.js)** | 97.43% | 93.48% | 90.32% | 59-61, 91-92, 242-243 (Error callbacks & test contexts) |
| **All Files combined** | **36.15%** | **80.73%** | **93.55%** | |

> [!NOTE]
> `app.js` line coverage reflects that the vast majority of the file is code wrapped inside the browser's `DOMContentLoaded` block. This block cannot run in a Node.js head-less environment due to browser-specific DOM dependencies. However, **94.44% of all shared utility, mathematical calculation, and cryptographic functions in `app.js` are covered by tests.**

---

## 3. How to Run the Tests

To run the offline test suite and generate a live code coverage report locally, execute the following command in the workspace directory:

```bash
node tests/run_tests.js
```
