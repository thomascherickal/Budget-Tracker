const assert = require('assert');
const test = require('node:test');
const { webcrypto } = require('node:crypto');

// Polyfill global crypto for Node.js
if (!globalThis.crypto) {
    globalThis.crypto = webcrypto;
}

const {
    encryptData,
    decryptData,
    getSymbolForCurrency,
    getLocaleForCurrency,
    detectUserCurrency
} = require('../app.js');

// Simulated App State
function createInitialState() {
    return {
        db: {
            version: '1.0.0',
            lastUpdated: new Date().toISOString(),
            settings: {
                savingsRequirement: 350,
                currency: 'EUR'
            },
            recurringExpenses: [
                { id: 'rec-1', name: 'Rent', amount: 1200, category: 'Housing', frequency: 'monthly' }
            ],
            oneTimeExpenses: [
                { id: 'one-1', name: 'Car service', amount: 150, date: '2026-06-12', category: 'Transportation' }
            ],
            transactions: [
                { id: 'tx-1', type: 'income', date: '2026-06-01', description: 'Salary', amount: 3500, category: 'Salary' },
                { id: 'tx-2', type: 'expense', date: '2026-06-05', description: 'Groceries', amount: 80, category: 'Food' }
            ]
        }
    };
}

// Integration simulator for exportDatabaseBackup
async function simulateExport(appState, mockPromptFn, mockShowToastFn) {
    const username = mockPromptFn();
    if (username === null) {
        return null; // Cancelled
    }
    const trimmed = username.trim();
    if (!trimmed) {
        mockShowToastFn('Backup aborted. Username is required for encryption.', 'warning');
        return null;
    }

    try {
        const dataStr = JSON.stringify(appState.db, null, 2);
        const envelope = await encryptData(dataStr, trimmed);
        return JSON.stringify(envelope, null, 2);
    } catch (err) {
        mockShowToastFn('Encryption failed: ' + err.message, 'error');
        throw err;
    }
}

// Integration simulator for handleImportJSON
async function simulateImport(fileContent, mockPromptFn, mockShowToastFn, appState) {
    try {
        const parsed = JSON.parse(fileContent);
        
        let dbData;
        if (parsed.version === 'encrypted-v1') {
            const username = mockPromptFn();
            if (username === null) {
                return false; // Cancelled
            }
            const trimmed = username.trim();
            if (!trimmed) {
                mockShowToastFn('Import aborted. Username is required for decryption.', 'warning');
                return false;
            }
            try {
                const decryptedStr = await decryptData(parsed, trimmed);
                dbData = JSON.parse(decryptedStr);
            } catch (decryptErr) {
                throw new Error('Decryption failed. Please verify your username.');
            }
        } else {
            dbData = parsed;
        }

        if (!dbData.transactions || !dbData.recurringExpenses) {
            throw new Error('Invalid schema: Missing primary transaction array keys.');
        }
        
        appState.db = dbData;
        mockShowToastFn('Database imported successfully.', 'success');
        return true;
    } catch (err) {
        mockShowToastFn('Failed to import database: ' + err.message, 'error');
        throw err;
    }
}

test('Integration Lifecycle Suite', async (t) => {
    
    await t.test('should successfully export and import a backup using matching usernames', async () => {
        const AppState = createInitialState();
        let toastMsg = null;
        let toastType = null;
        
        const showToastMock = (msg, type) => {
            toastMsg = msg;
            toastType = type;
        };
        
        // 1. Export database with username 'thomas'
        const promptForExport = () => 'thomas';
        const backupJson = await simulateExport(AppState, promptForExport, showToastMock);
        assert.ok(backupJson);
        assert.match(backupJson, /"version": "encrypted-v1"/);
        
        // 2. Modify State to simulate dirty state/cleared state
        const dirtyAppState = { db: { version: '1.0.0', settings: { savingsRequirement: 0, currency: 'USD' }, recurringExpenses: [], oneTimeExpenses: [], transactions: [] } };
        
        // 3. Import database using same username 'thomas'
        const promptForImport = () => 'thomas';
        const success = await simulateImport(backupJson, promptForImport, showToastMock, dirtyAppState);
        
        // 4. Assertions
        assert.strictEqual(success, true);
        assert.strictEqual(toastMsg, 'Database imported successfully.');
        assert.strictEqual(toastType, 'success');
        assert.deepStrictEqual(dirtyAppState.db, AppState.db);
    });

    await t.test('should block import and throw error if decryption username does not match export username', async () => {
        const AppState = createInitialState();
        let toastMsg = null;
        let toastType = null;
        
        const showToastMock = (msg, type) => {
            toastMsg = msg;
            toastType = type;
        };
        
        const backupJson = await simulateExport(AppState, () => 'thomas', showToastMock);
        
        // Dirty State
        const dirtyAppState = { db: { version: '1.0.0', settings: { savingsRequirement: 0 }, recurringExpenses: [], oneTimeExpenses: [], transactions: [] } };
        const oldDbState = JSON.parse(JSON.stringify(dirtyAppState.db));
        
        // Try importing with wrong username
        await assert.rejects(async () => {
            await simulateImport(backupJson, () => 'hacker', showToastMock, dirtyAppState);
        }, /Decryption failed/);
        
        // Verify state is untouched and toast error occurred
        assert.strictEqual(toastType, 'error');
        assert.match(toastMsg, /Decryption failed/);
        assert.deepStrictEqual(dirtyAppState.db, oldDbState);
    });

    await t.test('should abort export if username prompt is cancelled', async () => {
        const AppState = createInitialState();
        let toastMsg = null;
        const showToastMock = (msg, type) => { toastMsg = msg; };
        
        const backupJson = await simulateExport(AppState, () => null, showToastMock);
        
        assert.strictEqual(backupJson, null);
        assert.strictEqual(toastMsg, null); // No message, just silent cancellation
    });

    await t.test('should abort export and show warning if username prompt is empty', async () => {
        const AppState = createInitialState();
        let toastMsg = null;
        let toastType = null;
        const showToastMock = (msg, type) => {
            toastMsg = msg;
            toastType = type;
        };
        
        const backupJson = await simulateExport(AppState, () => '   ', showToastMock);
        
        assert.strictEqual(backupJson, null);
        assert.strictEqual(toastType, 'warning');
        assert.match(toastMsg, /Username is required/);
    });

    await t.test('should abort import if import username prompt is cancelled', async () => {
        const AppState = createInitialState();
        let toastMsg = null;
        const showToastMock = (msg, type) => { toastMsg = msg; };
        
        const backupJson = await simulateExport(AppState, () => 'thomas', showToastMock);
        const dirtyAppState = { db: { version: '1.0.0', transactions: [] } };
        
        const success = await simulateImport(backupJson, () => null, showToastMock, dirtyAppState);
        
        assert.strictEqual(success, false);
        assert.deepStrictEqual(dirtyAppState.db.transactions, []);
    });

    await t.test('should abort import and show warning if import username is empty', async () => {
        const AppState = createInitialState();
        let toastMsg = null;
        let toastType = null;
        const showToastMock = (msg, type) => {
            toastMsg = msg;
            toastType = type;
        };
        
        const backupJson = await simulateExport(AppState, () => 'thomas', showToastMock);
        const dirtyAppState = { db: { version: '1.0.0', transactions: [] } };
        
        const success = await simulateImport(backupJson, () => '   ', showToastMock, dirtyAppState);
        
        assert.strictEqual(success, false);
        assert.strictEqual(toastType, 'warning');
        assert.match(toastMsg, /Username is required/);
        assert.deepStrictEqual(dirtyAppState.db.transactions, []);
    });

    await t.test('should support backward-compatibility for importing legacy unencrypted database schema without prompt', async () => {
        const legacyDb = {
            version: '1.0.0',
            settings: { savingsRequirement: 0 },
            recurringExpenses: [],
            oneTimeExpenses: [],
            transactions: [
                { id: 'legacy-1', type: 'income', date: '2026-05-01', description: 'Legacy Cash', amount: 50, category: 'Other' }
            ]
        };
        
        const legacyJson = JSON.stringify(legacyDb);
        const targetAppState = { db: null };
        let toastMsg = null;
        const showToastMock = (msg, type) => { toastMsg = msg; };
        
        // Prompt function should NOT be called
        let promptCalled = false;
        const promptMock = () => {
            promptCalled = true;
            return 'thomas';
        };
        
        const success = await simulateImport(legacyJson, promptMock, showToastMock, targetAppState);
        
        assert.strictEqual(success, true);
        assert.strictEqual(promptCalled, false);
        assert.strictEqual(toastMsg, 'Database imported successfully.');
        assert.deepStrictEqual(targetAppState.db, legacyDb);
    });

    await t.test('should test currency symbol, locale mappings, and user currency detection logic', () => {
        // Assertions for symbol and locale mappings
        assert.strictEqual(getSymbolForCurrency('USD'), '$');
        assert.strictEqual(getSymbolForCurrency('EUR'), '€');
        assert.strictEqual(getSymbolForCurrency('GBP'), '£');
        assert.strictEqual(getSymbolForCurrency('INR'), '₹');
        assert.strictEqual(getSymbolForCurrency('XYZ'), '$'); // Fallback
        
        assert.strictEqual(getLocaleForCurrency('USD'), 'en-US');
        assert.strictEqual(getLocaleForCurrency('EUR'), 'de-DE');
        assert.strictEqual(getLocaleForCurrency('INR'), 'en-IN');
        assert.strictEqual(getLocaleForCurrency('XYZ'), 'en-US'); // Fallback
        
        // Assert currency detection fallback when navigator is undefined (Node.js environment)
        const detected = detectUserCurrency();
        assert.strictEqual(detected.code, 'USD');
        assert.strictEqual(detected.symbol, '$');
    });
});
