/**
 * Sovereign Budget - Cryptographic Engine
 * Zero-knowledge client-side encryption using WebCrypto PBKDF2 & AES-256-GCM.
 */

function getCryptoApi() {
    if (typeof crypto !== 'undefined' && crypto.subtle) {
        return crypto;
    }
    return (typeof window !== 'undefined' && window.crypto) ? window.crypto : null;
}

/**
 * Converts an ArrayBuffer to a Base64 string.
 * Supports both Node.js (Buffer) and standard Browser (btoa) runtimes.
 * @param {ArrayBuffer} buffer
 * @returns {string} Base64 encoded string
 */
function arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    if (typeof Buffer !== 'undefined') {
        return Buffer.from(bytes).toString('base64');
    }
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

/**
 * Converts a Base64 string back into an ArrayBuffer.
 * Supports both Node.js (Buffer) and standard Browser (atob) runtimes.
 * @param {string} base64
 * @returns {ArrayBuffer} Decoded ArrayBuffer
 */
function base64ToArrayBuffer(base64) {
    if (typeof Buffer !== 'undefined') {
        const buf = Buffer.from(base64, 'base64');
        return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
    }
    const binaryStr = atob(base64);
    const len = binaryStr.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
    }
    return bytes.buffer;
}

/**
 * Hashes a username with SHA-256 after case-folding and trimming.
 * @param {string} username
 * @returns {Promise<ArrayBuffer>} SHA-256 digest buffer
 */
async function hashUsername(username) {
    const cryptoObj = getCryptoApi();
    if (!cryptoObj) throw new Error('WebCrypto API not available');

    const sanitized = (username || '').trim().toLowerCase();
    const encoder = new TextEncoder();
    const data = encoder.encode(sanitized);
    return await cryptoObj.subtle.digest('SHA-256', data);
}

/**
 * Derives an AES-256-GCM symmetric key using PBKDF2 with 100,000 iterations.
 * @param {ArrayBuffer} usernameHash - Precomputed username digest
 * @param {Uint8Array} salt - 16-byte cryptographically secure salt
 * @returns {Promise<CryptoKey>} Derived AES-GCM CryptoKey
 */
async function deriveKey(usernameHash, salt) {
    const cryptoObj = getCryptoApi();
    if (!cryptoObj) throw new Error('WebCrypto API not available');

    const baseKey = await cryptoObj.subtle.importKey(
        'raw',
        usernameHash,
        'PBKDF2',
        false,
        ['deriveKey']
    );

    return await cryptoObj.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: salt,
            iterations: 100000,
            hash: 'SHA-256'
        },
        baseKey,
        {
            name: 'AES-GCM',
            length: 256
        },
        false,
        ['encrypt', 'decrypt']
    );
}

/**
 * Encrypts a plaintext payload using AES-256-GCM derived from the provided username.
 * @param {string} plaintext - JSON or string payload to protect
 * @param {string} username - User password / OS username for key derivation
 * @returns {Promise<{ version: string, salt: string, iv: string, ciphertext: string, lastUpdated: string }>}
 */
async function encryptData(plaintext, username) {
    const cryptoObj = getCryptoApi();
    if (!cryptoObj) throw new Error('WebCrypto API not available');

    const usernameHash = await hashUsername(username);
    const salt = cryptoObj.getRandomValues(new Uint8Array(16));
    const aesKey = await deriveKey(usernameHash, salt);

    const iv = cryptoObj.getRandomValues(new Uint8Array(12));
    const encoder = new TextEncoder();
    const encodedPlaintext = encoder.encode(plaintext);

    const ciphertextBuffer = await cryptoObj.subtle.encrypt(
        {
            name: 'AES-GCM',
            iv: iv
        },
        aesKey,
        encodedPlaintext
    );

    return {
        version: 'encrypted-v1',
        salt: arrayBufferToBase64(salt),
        iv: arrayBufferToBase64(iv),
        ciphertext: arrayBufferToBase64(ciphertextBuffer),
        lastUpdated: new Date().toISOString()
    };
}

/**
 * Decrypts an encrypted envelope using the provided username.
 * Throws if the envelope is invalid or key does not match (authentication tag failure).
 * @param {{ version: string, salt: string, iv: string, ciphertext: string }} envelope
 * @param {string} username
 * @returns {Promise<string>} Decrypted plaintext string
 */
async function decryptData(envelope, username) {
    const cryptoObj = getCryptoApi();
    if (!cryptoObj) throw new Error('WebCrypto API not available');

    if (!envelope || envelope.version !== 'encrypted-v1') {
        throw new Error('Unsupported backup format or missing encryption version.');
    }

    const usernameHash = await hashUsername(username);
    const salt = new Uint8Array(base64ToArrayBuffer(envelope.salt));
    const iv = new Uint8Array(base64ToArrayBuffer(envelope.iv));
    const ciphertext = base64ToArrayBuffer(envelope.ciphertext);

    const aesKey = await deriveKey(usernameHash, salt);

    const decryptedBuffer = await cryptoObj.subtle.decrypt(
        {
            name: 'AES-GCM',
            iv: iv
        },
        aesKey,
        ciphertext
    );

    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
}

// Universal export pattern
const AppCrypto = {
    arrayBufferToBase64,
    base64ToArrayBuffer,
    hashUsername,
    deriveKey,
    encryptData,
    decryptData
};

if (typeof window !== 'undefined') {
    window.AppCrypto = AppCrypto;
    window.arrayBufferToBase64 = arrayBufferToBase64;
    window.base64ToArrayBuffer = base64ToArrayBuffer;
    window.hashUsername = hashUsername;
    window.deriveKey = deriveKey;
    window.encryptData = encryptData;
    window.decryptData = decryptData;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = AppCrypto;
}
