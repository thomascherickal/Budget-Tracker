const assert = require('assert');
const test = require('node:test');
const { webcrypto } = require('node:crypto');

if (!globalThis.crypto) {
    globalThis.crypto = webcrypto;
}

const {
    getCleanDatabaseObject,
    validateDatabaseSchema,
    saveDataToStorage,
    loadDataFromStorage,
    clearLocalStorageKeys,
    createPlainJsonExport,
    createEncryptedBackup,
    parseImportContent,
    setupExitAutosaveListeners
} = require('../js/storage.js');

const { encryptData, decryptData } = require('../js/crypto.js');

// Mock in-memory storage implementation resembling Web Storage API
function createMockStorage() {
    const store = new Map();
    return {
        getItem: (k) => (store.has(k) ? store.get(k) : null),
        setItem: (k, v) => store.set(k, String(v)),
        removeItem: (k) => store.delete(k),
        clear: () => store.clear(),
        _store: store
    };
}

test('Storage Module Suite', async (t) => {
    await t.test('should return a valid clean database template', () => {
        const cleanDb = getCleanDatabaseObject('EUR');
        assert.strictEqual(cleanDb.version, '1.0.0');
        assert.strictEqual(cleanDb.settings.currency, 'EUR');
        assert.strictEqual(cleanDb.settings.savingsRequirement, 0);
        assert.deepStrictEqual(cleanDb.transactions, []);
        assert.deepStrictEqual(cleanDb.recurringExpenses, []);
        assert.deepStrictEqual(cleanDb.oneTimeExpenses, []);
    });

    await t.test('should validate database schema accurately', () => {
        assert.strictEqual(validateDatabaseSchema(null), false);
        assert.strictEqual(validateDatabaseSchema('not an object'), false);
        assert.strictEqual(validateDatabaseSchema({}), false);
        assert.strictEqual(validateDatabaseSchema({ transactions: [] }), false);
        assert.strictEqual(validateDatabaseSchema({ recurringExpenses: [] }), false);
        assert.strictEqual(validateDatabaseSchema({ transactions: [], recurringExpenses: [] }), true);
    });

    await t.test('should persist data to both primary cache and autosave keys', () => {
        const storage = createMockStorage();
        const db = getCleanDatabaseObject('USD');
        db.transactions.push({ id: 'tx-1', amount: 100, type: 'expense', category: 'Food' });

        const saved = saveDataToStorage(storage, db, false);
        assert.strictEqual(saved, true);

        const cacheVal = storage.getItem('sovereign_budget_cache');
        const autosaveVal = storage.getItem('sovereign_budget_autosave_json');
        assert.ok(cacheVal && cacheVal.includes('tx-1'));
        assert.ok(autosaveVal && autosaveVal.includes('tx-1'));
        assert.strictEqual(storage.getItem('sovereign_budget_exit_timestamp'), null);

        // When saved on exit, timestamp should be recorded
        saveDataToStorage(storage, db, true);
        assert.ok(storage.getItem('sovereign_budget_exit_timestamp'));
    });

    await t.test('should handle storage errors gracefully in saveDataToStorage', () => {
        // Null or invalid storage returns false
        assert.strictEqual(saveDataToStorage(null, {}), false);
        assert.strictEqual(saveDataToStorage({}, {}), false);

        // Storage that throws on setItem propagates error
        const throwingStorage = {
            setItem: () => { throw new Error('QuotaExceededError'); }
        };
        const origError = console.error;
        console.error = () => {};
        try {
            assert.throws(() => saveDataToStorage(throwingStorage, {}), /QuotaExceededError/);
        } finally {
            console.error = origError;
        }
    });

    await t.test('should load data prioritizing autosaved JSON export on startup', () => {
        const storage = createMockStorage();

        // 1. When empty, returns default clean database
        const emptyResult = loadDataFromStorage(storage);
        assert.strictEqual(emptyResult.loadedFromAutosave, false);
        assert.strictEqual(emptyResult.db.transactions.length, 0);

        // 2. When storage is null, returns default clean database
        const nullStorageResult = loadDataFromStorage(null);
        assert.strictEqual(nullStorageResult.loadedFromAutosave, false);

        // 3. When only cache is present
        const cacheDb = getCleanDatabaseObject('USD');
        cacheDb.transactions.push({ id: 'cache-tx', amount: 50, type: 'income', category: 'Salary' });
        storage.setItem('sovereign_budget_cache', JSON.stringify(cacheDb));

        const cacheResult = loadDataFromStorage(storage);
        assert.strictEqual(cacheResult.loadedFromAutosave, false);
        assert.strictEqual(cacheResult.db.transactions[0].id, 'cache-tx');

        // 4. When autosave is present, it takes precedence
        const autosaveDb = getCleanDatabaseObject('GBP');
        autosaveDb.transactions.push({ id: 'autosave-tx', amount: 75, type: 'expense', category: 'Food' });
        storage.setItem('sovereign_budget_autosave_json', JSON.stringify(autosaveDb));

        const autosaveResult = loadDataFromStorage(storage);
        assert.strictEqual(autosaveResult.loadedFromAutosave, true);
        assert.strictEqual(autosaveResult.db.transactions[0].id, 'autosave-tx');
        assert.strictEqual(autosaveResult.db.settings.currency, 'GBP');

        // 5. Corrupted JSON recovers cleanly to default
        storage.setItem('sovereign_budget_autosave_json', 'MALFORMED_JSON_STRING{{{');
        storage.setItem('sovereign_budget_cache', 'MALFORMED_JSON_STRING{{{');
        const origErr = console.error;
        console.error = () => {};
        try {
            const corruptResult = loadDataFromStorage(storage);
            assert.strictEqual(corruptResult.loadedFromAutosave, false);
            assert.ok(corruptResult.db.version);
        } finally {
            console.error = origErr;
        }
    });

    await t.test('should clear local memory keys safely and catch errors', () => {
        const storage = createMockStorage();
        storage.setItem('sovereign_budget_cache', '{"data":1}');
        storage.setItem('sovereign_budget_autosave_json', '{"data":1}');
        storage.setItem('sovereign_budget_exit_timestamp', '2026-10-24T12:00:00Z');

        clearLocalStorageKeys(storage);

        assert.strictEqual(storage.getItem('sovereign_budget_cache'), null);
        assert.strictEqual(storage.getItem('sovereign_budget_autosave_json'), null);
        assert.strictEqual(storage.getItem('sovereign_budget_exit_timestamp'), null);

        // Null storage handles safely
        clearLocalStorageKeys(null);

        // Throwing storage catches error without crashing
        const throwingStorage = {
            removeItem: () => { throw new Error('StorageLockedError'); }
        };
        const origWarn = console.warn;
        console.warn = () => {};
        try {
            clearLocalStorageKeys(throwingStorage);
        } finally {
            console.warn = origWarn;
        }
    });

    await t.test('should create valid plain JSON export package', () => {
        const db = getCleanDatabaseObject('USD');
        const exportObj = createPlainJsonExport(db);

        assert.ok(exportObj.filename.startsWith('sovereign_budget_backup_'));
        assert.ok(exportObj.filename.endsWith('.json'));
        assert.ok(exportObj.dataUri.startsWith('data:application/json;charset=utf-8,'));
        const parsed = JSON.parse(exportObj.jsonStr);
        assert.strictEqual(parsed.settings.currency, 'USD');
    });

    await t.test('should create encrypted backup and parse it back upon import', async () => {
        const db = getCleanDatabaseObject('EUR');
        db.transactions.push({ id: 'tx-sec', amount: 999, type: 'income', category: 'Salary' });
        const username = 'Alice';

        // Empty username check
        await assert.rejects(
            async () => createEncryptedBackup(db, '   ', encryptData),
            /Username is required for encryption/
        );

        const backupObj = await createEncryptedBackup(db, username, encryptData);
        assert.ok(backupObj.filename.startsWith('sovereign_budget_encrypted_'));
        assert.strictEqual(backupObj.envelope.version, 'encrypted-v1');

        // Import with correct username
        const imported = await parseImportContent(backupObj.jsonStr, () => 'alice', decryptData);
        assert.strictEqual(imported.transactions[0].id, 'tx-sec');
        assert.strictEqual(imported.settings.currency, 'EUR');

        // Import with wrong username rejects
        await assert.rejects(
            async () => parseImportContent(backupObj.jsonStr, () => 'Bob', decryptData),
            /Decryption failed/
        );

        // Import with cancelled prompt returns null
        const cancelled = await parseImportContent(backupObj.jsonStr, () => null, decryptData);
        assert.strictEqual(cancelled, null);

        // Import with empty username throws error
        await assert.rejects(
            async () => parseImportContent(backupObj.jsonStr, () => '   ', decryptData),
            /Username is required/
        );

        // Parse invalid schema content
        await assert.rejects(
            async () => parseImportContent(JSON.stringify({ notASchema: true }), () => 'alice', decryptData),
            /Invalid schema/
        );
    });

    await t.test('should setup exit autosave event listeners on window and document', () => {
        let saveCalls = 0;
        const fakeWin = {
            listeners: {},
            addEventListener: function (evt, fn) { this.listeners[evt] = fn; }
        };
        const fakeDoc = {
            visibilityState: 'hidden',
            listeners: {},
            addEventListener: function (evt, fn) { this.listeners[evt] = fn; }
        };

        setupExitAutosaveListeners(fakeWin, fakeDoc, (isExit) => {
            if (isExit) saveCalls++;
        });

        // Trigger simulated pagehide
        fakeWin.listeners['pagehide']();
        // Trigger simulated beforeunload
        fakeWin.listeners['beforeunload']();
        // Trigger simulated visibilitychange
        fakeDoc.listeners['visibilitychange']();

        assert.strictEqual(saveCalls, 3);

        // Safe with null win and doc
        setupExitAutosaveListeners(null, null, () => {});
    });

    await t.test('should attach properties to window in browser environment', () => {
        const fakeWindow = {};
        globalThis.window = fakeWindow;

        delete require.cache[require.resolve('../js/storage.js')];
        require('../js/storage.js');

        assert.ok(fakeWindow.AppStorage);
        assert.strictEqual(typeof fakeWindow.saveDataToStorage, 'function');
        assert.strictEqual(typeof fakeWindow.loadDataFromStorage, 'function');
        assert.strictEqual(typeof fakeWindow.clearLocalStorageKeys, 'function');

        delete globalThis.window;
    });
});
