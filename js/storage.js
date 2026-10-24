/**
 * Sovereign Budget - Storage & Data Persistence Engine
 * LocalStorage serialization, autosave on exit/visibility change,
 * JSON imports/exports, encrypted backups, and schema validation.
 */

// Fallback constant references if not defined in global scope
const STORAGE_CACHE_KEY = (typeof CACHE_KEY !== 'undefined') ? CACHE_KEY : 'sovereign_budget_cache';
const STORAGE_AUTOSAVE_KEY = (typeof AUTOSAVE_KEY !== 'undefined') ? AUTOSAVE_KEY : 'sovereign_budget_autosave_json';
const STORAGE_EXIT_TIMESTAMP_KEY = (typeof EXIT_TIMESTAMP_KEY !== 'undefined') ? EXIT_TIMESTAMP_KEY : 'sovereign_budget_exit_timestamp';
const STORAGE_APP_VERSION = (typeof APP_VERSION !== 'undefined') ? APP_VERSION : '1.0.0';

/**
 * Returns a clean, default database template.
 * @param {string} [defaultCurrency='USD']
 * @returns {object} Fresh database template
 */
function getCleanDatabaseObject(defaultCurrency = 'USD') {
    return {
        version: STORAGE_APP_VERSION,
        lastUpdated: new Date().toISOString(),
        settings: {
            savingsRequirement: 0,
            currency: defaultCurrency || 'USD'
        },
        recurringExpenses: [],
        oneTimeExpenses: [],
        transactions: []
    };
}

/**
 * Validates whether an imported or cached object matches the required database schema.
 * @param {any} dbData
 * @returns {boolean} True if schema is valid
 */
function validateDatabaseSchema(dbData) {
    if (!dbData || typeof dbData !== 'object') {
        return false;
    }
    if (!Array.isArray(dbData.transactions) || !Array.isArray(dbData.recurringExpenses)) {
        return false;
    }
    return true;
}

/**
 * Persists application database to local storage (both primary cache and autosave JSON).
 * @param {Storage|object} storage - Target storage engine (localStorage or mock)
 * @param {object} db - Database state to serialize
 * @param {boolean} [isExit=false] - Whether this save was triggered by window close/exit
 * @returns {boolean} Success status
 */
function saveDataToStorage(storage, db, isExit = false) {
    if (!storage || typeof storage.setItem !== 'function') {
        return false;
    }
    try {
        db.lastUpdated = new Date().toISOString();
        const dataStr = JSON.stringify(db, null, 2);
        storage.setItem(STORAGE_CACHE_KEY, dataStr);
        storage.setItem(STORAGE_AUTOSAVE_KEY, dataStr);
        if (isExit) {
            storage.setItem(STORAGE_EXIT_TIMESTAMP_KEY, new Date().toISOString());
        }
        return true;
    } catch (err) {
        console.error('saveDataToStorage failed:', err);
        throw err;
    }
}

/**
 * Loads database from storage, prioritizing autosaved JSON export on startup.
 * @param {Storage|object} storage
 * @returns {{ db: object, loadedFromAutosave: boolean }}
 */
function loadDataFromStorage(storage) {
    let sourceData = null;
    let loadedFromAutosave = false;

    if (!storage || typeof storage.getItem !== 'function') {
        return { db: getCleanDatabaseObject(), loadedFromAutosave: false };
    }

    try {
        // 1. Check for autosaved JSON export on startup
        const autosaved = storage.getItem(STORAGE_AUTOSAVE_KEY);
        if (autosaved) {
            const parsedAutosave = JSON.parse(autosaved);
            if (validateDatabaseSchema(parsedAutosave)) {
                sourceData = parsedAutosave;
                loadedFromAutosave = true;
            }
        }

        // 2. Fallback to primary cache if autosave key is missing or invalid
        if (!sourceData) {
            const cached = storage.getItem(STORAGE_CACHE_KEY);
            if (cached) {
                const parsedCache = JSON.parse(cached);
                if (validateDatabaseSchema(parsedCache)) {
                    sourceData = parsedCache;
                }
            }
        }

        if (sourceData) {
            // Ensure schema invariants
            if (!sourceData.settings) sourceData.settings = { savingsRequirement: 0, currency: 'USD' };
            if (!Array.isArray(sourceData.oneTimeExpenses)) sourceData.oneTimeExpenses = [];
            return { db: sourceData, loadedFromAutosave };
        }
    } catch (err) {
        console.error('loadDataFromStorage parse error:', err);
    }

    return { db: getCleanDatabaseObject(), loadedFromAutosave: false };
}

/**
 * Wipes local cache keys from storage.
 * @param {Storage|object} storage
 */
function clearLocalStorageKeys(storage) {
    if (!storage) return;
    try {
        if (typeof storage.removeItem === 'function') {
            storage.removeItem(STORAGE_CACHE_KEY);
            storage.removeItem(STORAGE_AUTOSAVE_KEY);
            storage.removeItem(STORAGE_EXIT_TIMESTAMP_KEY);
        }
    } catch (err) {
        console.warn('Error clearing localStorage keys:', err);
    }
}

/**
 * Creates plain JSON export payload and data URI for download.
 * @param {object} db
 * @returns {{ filename: string, jsonStr: string, dataUri: string }}
 */
function createPlainJsonExport(db) {
    const jsonStr = JSON.stringify(db, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(jsonStr);
    const filename = 'sovereign_budget_backup_' + new Date().toISOString().slice(0, 10) + '.json';
    return { filename, jsonStr, dataUri };
}

/**
 * Creates an encrypted database backup envelope.
 * @param {object} db
 * @param {string} username
 * @param {function} encryptFn - Encryption implementation
 * @returns {Promise<{ filename: string, envelope: object, jsonStr: string, dataUri: string }>}
 */
async function createEncryptedBackup(db, username, encryptFn) {
    if (!username || !username.trim()) {
        throw new Error('Username is required for encryption.');
    }
    const dataStr = JSON.stringify(db, null, 2);
    const envelope = await encryptFn(dataStr, username.trim());
    const jsonStr = JSON.stringify(envelope, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(jsonStr);
    const filename = 'sovereign_budget_encrypted_' + new Date().toISOString().slice(0, 10) + '.json';
    return { filename, envelope, jsonStr, dataUri };
}

/**
 * Parses and verifies an imported file content string (plain or encrypted).
 * @param {string} fileText - File contents
 * @param {function} promptFn - Prompt callback to request decryption username
 * @param {function} decryptFn - Decryption function
 * @returns {Promise<object>} Decrypted and validated database object
 */
async function parseImportContent(fileText, promptFn, decryptFn) {
    const parsed = JSON.parse(fileText);

    let dbData;
    if (parsed && parsed.version === 'encrypted-v1') {
        const username = promptFn();
        if (username === null) {
            return null; // Cancelled
        }
        const trimmed = (username || '').trim();
        if (!trimmed) {
            throw new Error('Username is required for decryption.');
        }
        try {
            const decryptedStr = await decryptFn(parsed, trimmed);
            dbData = JSON.parse(decryptedStr);
        } catch (decryptErr) {
            throw new Error('Decryption failed. Please verify your username.');
        }
    } else {
        dbData = parsed;
    }

    if (!validateDatabaseSchema(dbData)) {
        throw new Error('Invalid schema: Missing primary transaction array keys.');
    }

    if (!dbData.settings) dbData.settings = { savingsRequirement: 0, currency: 'USD' };
    if (!Array.isArray(dbData.oneTimeExpenses)) dbData.oneTimeExpenses = [];

    return dbData;
}

/**
 * Attaches pagehide, beforeunload, and visibilitychange event listeners for autosaving.
 * @param {Window} win
 * @param {Document} doc
 * @param {function} onSaveCallback
 */
function setupExitAutosaveListeners(win, doc, onSaveCallback) {
    if (win && typeof win.addEventListener === 'function') {
        win.addEventListener('pagehide', () => onSaveCallback(true));
        win.addEventListener('beforeunload', () => onSaveCallback(true));
    }
    if (doc && typeof doc.addEventListener === 'function') {
        doc.addEventListener('visibilitychange', () => {
            if (doc.visibilityState === 'hidden') {
                onSaveCallback(true);
            }
        });
    }
}

// Universal export pattern
const AppStorage = {
    getCleanDatabaseObject,
    validateDatabaseSchema,
    saveDataToStorage,
    loadDataFromStorage,
    clearLocalStorageKeys,
    createPlainJsonExport,
    createEncryptedBackup,
    parseImportContent,
    setupExitAutosaveListeners
};

if (typeof window !== 'undefined') {
    window.AppStorage = AppStorage;
    window.getCleanDatabaseObject = getCleanDatabaseObject;
    window.validateDatabaseSchema = validateDatabaseSchema;
    window.saveDataToStorage = saveDataToStorage;
    window.loadDataFromStorage = loadDataFromStorage;
    window.clearLocalStorageKeys = clearLocalStorageKeys;
    window.createPlainJsonExport = createPlainJsonExport;
    window.createEncryptedBackup = createEncryptedBackup;
    window.parseImportContent = parseImportContent;
    window.setupExitAutosaveListeners = setupExitAutosaveListeners;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = AppStorage;
}
