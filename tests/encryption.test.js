const assert = require('assert');
const test = require('node:test');
const { webcrypto } = require('node:crypto');

// Polyfill global crypto for Node.js
if (!globalThis.crypto) {
    globalThis.crypto = webcrypto;
}

const {
    arrayBufferToBase64,
    base64ToArrayBuffer,
    hashUsername,
    encryptData,
    decryptData
} = require('../app.js');

test('Cryptography Suite', async (t) => {
    await t.test('should convert ArrayBuffer to Base64 and back', () => {
        const testData = new Uint8Array([72, 101, 108, 108, 111]); // "Hello"
        const base64 = arrayBufferToBase64(testData.buffer);
        assert.strictEqual(base64, 'SGVsbG8=');
        
        const decoded = new Uint8Array(base64ToArrayBuffer(base64));
        assert.deepStrictEqual(decoded, testData);
    });

    await t.test('should sanitize username during hashing (case-insensitive and trim)', async () => {
        const hash1 = await hashUsername('  ThomasCherickal  ');
        const hash2 = await hashUsername('thomascherickal');
        
        assert.deepStrictEqual(new Uint8Array(hash1), new Uint8Array(hash2));
    });

    await t.test('should encrypt and decrypt data correctly with the correct username', async () => {
        const plaintext = JSON.stringify({ secret: 'Sovereign Budget Data 123' });
        const username = 'thomas';
        
        const envelope = await encryptData(plaintext, username);
        assert.strictEqual(envelope.version, 'encrypted-v1');
        assert.ok(envelope.salt);
        assert.ok(envelope.iv);
        assert.ok(envelope.ciphertext);
        
        const decrypted = await decryptData(envelope, username);
        assert.strictEqual(decrypted, plaintext);
    });

    await t.test('should fail decryption if an incorrect username is provided', async () => {
        const plaintext = JSON.stringify({ secret: 'Sovereign Budget Data 123' });
        const username = 'thomas';
        
        const envelope = await encryptData(plaintext, username);
        
        await assert.rejects(
            async () => {
                await decryptData(envelope, 'wrong_user');
            },
            /Decryption failed|Cipher job failed|OperationError/
        );
    });

    await t.test('should succeed decryption with variations in whitespace and casing of the correct username', async () => {
        const plaintext = JSON.stringify({ secret: 'Sovereign Budget Data 123' });
        const username = 'Thomas';
        
        const envelope = await encryptData(plaintext, username);
        
        // Casing and spacing variations should succeed because we sanitize inputs
        const decrypted1 = await decryptData(envelope, '  thomas  ');
        assert.strictEqual(decrypted1, plaintext);
        
        const decrypted2 = await decryptData(envelope, 'THOMAS');
        assert.strictEqual(decrypted2, plaintext);
    });
});
