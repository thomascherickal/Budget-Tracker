const assert = require('assert');
const test = require('node:test');
const { webcrypto } = require('node:crypto');

if (!globalThis.crypto) {
    globalThis.crypto = webcrypto;
}

const {
    arrayBufferToBase64,
    base64ToArrayBuffer,
    hashUsername,
    deriveKey,
    encryptData,
    decryptData
} = require('../js/crypto.js');

test('Crypto Module Suite', async (t) => {
    await t.test('should convert ArrayBuffer to Base64 and back across diverse byte lengths', () => {
        const testCases = [
            new Uint8Array([0, 255, 127, 64, 32]),
            new Uint8Array(100).fill(42),
            new TextEncoder().encode('Sovereign Budget Secure Cryptographic Engine')
        ];

        for (const input of testCases) {
            const b64 = arrayBufferToBase64(input.buffer);
            assert.ok(typeof b64 === 'string');
            const recovered = new Uint8Array(base64ToArrayBuffer(b64));
            assert.deepStrictEqual(recovered, input);
        }
    });

    await t.test('should test browser fallback conversion loops using btoa and atob', () => {
        const originalBuffer = globalThis.Buffer;
        try {
            // Temporarily hide Buffer to force browser btoa/atob loops
            delete globalThis.Buffer;
            globalThis.btoa = (str) => originalBuffer.from(str, 'binary').toString('base64');
            globalThis.atob = (b64) => originalBuffer.from(b64, 'base64').toString('binary');

            const testData = new Uint8Array([72, 101, 108, 108, 111, 33]);
            const b64 = arrayBufferToBase64(testData.buffer);
            assert.strictEqual(b64, 'SGVsbG8h');

            const recovered = new Uint8Array(base64ToArrayBuffer(b64));
            assert.deepStrictEqual(recovered, testData);
        } finally {
            globalThis.Buffer = originalBuffer;
            delete globalThis.btoa;
            delete globalThis.atob;
        }
    });

    await t.test('should sanitize username during hashing (trimming and lowercasing)', async () => {
        const hash1 = await hashUsername('   Alice_Smith   ');
        const hash2 = await hashUsername('alice_smith');
        assert.deepStrictEqual(new Uint8Array(hash1), new Uint8Array(hash2));
    });

    await t.test('should derive a valid CryptoKey from PBKDF2', async () => {
        const hash = await hashUsername('testuser');
        const salt = new Uint8Array(16).fill(7);
        const key = await deriveKey(hash, salt);
        assert.ok(key);
        assert.strictEqual(key.type, 'secret');
        assert.strictEqual(key.algorithm.name, 'AES-GCM');
    });

    await t.test('should encrypt and decrypt plaintext payloads accurately', async () => {
        const payload = JSON.stringify({
            transactions: [{ id: 1, amount: 250 }],
            settings: { currency: 'EUR' }
        });
        const username = 'MasterUser';

        const envelope = await encryptData(payload, username);
        assert.strictEqual(envelope.version, 'encrypted-v1');
        assert.ok(envelope.salt);
        assert.ok(envelope.iv);
        assert.ok(envelope.ciphertext);

        const decrypted = await decryptData(envelope, username);
        assert.strictEqual(decrypted, payload);
    });

    await t.test('should reject decryption with incorrect username', async () => {
        const payload = 'Confidential financial data';
        const envelope = await encryptData(payload, 'correct_user');

        await assert.rejects(
            async () => {
                await decryptData(envelope, 'wrong_user');
            },
            /Decryption failed|Cipher job failed|OperationError/
        );
    });

    await t.test('should reject invalid or tampered envelopes', async () => {
        await assert.rejects(
            async () => {
                await decryptData(null, 'user');
            },
            /Unsupported backup format/
        );

        await assert.rejects(
            async () => {
                await decryptData({ version: 'legacy-v0' }, 'user');
            },
            /Unsupported backup format/
        );

        // Tampered ciphertext
        const payload = 'Data';
        const envelope = await encryptData(payload, 'user');
        envelope.ciphertext = arrayBufferToBase64(new Uint8Array([1, 2, 3, 4, 5]).buffer);

        await assert.rejects(
            async () => {
                await decryptData(envelope, 'user');
            },
            /Decryption failed|Cipher job failed|OperationError/
        );
    });

    await t.test('should throw WebCrypto API not available if crypto is missing', async () => {
        const origCrypto = globalThis.crypto;
        delete globalThis.crypto;

        try {
            await assert.rejects(async () => await hashUsername('user'), /WebCrypto API not available/);
            await assert.rejects(async () => await deriveKey(new Uint8Array(32), new Uint8Array(16)), /WebCrypto API not available/);
            await assert.rejects(async () => await encryptData('test', 'user'), /WebCrypto API not available/);
            await assert.rejects(async () => await decryptData({ version: 'encrypted-v1' }, 'user'), /WebCrypto API not available/);
        } finally {
            globalThis.crypto = origCrypto;
        }
    });

    await t.test('should attach properties to window in browser environment', () => {
        const fakeWindow = { crypto: globalThis.crypto };
        globalThis.window = fakeWindow;

        delete require.cache[require.resolve('../js/crypto.js')];
        require('../js/crypto.js');

        assert.ok(fakeWindow.AppCrypto);
        assert.strictEqual(typeof fakeWindow.encryptData, 'function');
        assert.strictEqual(typeof fakeWindow.decryptData, 'function');

        delete globalThis.window;
    });
});
