const assert = require('assert');
const test = require('node:test');
const {
    LOCALE_CURRENCIES,
    detectUserCurrency,
    getSymbolForCurrency,
    getLocaleForCurrency,
    formatCurrency
} = require('../js/currencies.js');

test('Currencies Suite', async (t) => {
    await t.test('should accurately detect currency from exact BCP-47 locale tags', () => {
        assert.deepStrictEqual(detectUserCurrency('en-US'), { code: 'USD', symbol: '$' });
        assert.deepStrictEqual(detectUserCurrency('de-DE'), { code: 'EUR', symbol: '€' });
        assert.deepStrictEqual(detectUserCurrency('en-GB'), { code: 'GBP', symbol: '£' });
        assert.deepStrictEqual(detectUserCurrency('ja-JP'), { code: 'JPY', symbol: '¥' });
        assert.deepStrictEqual(detectUserCurrency('en-IN'), { code: 'INR', symbol: '₹' });
        assert.deepStrictEqual(detectUserCurrency('es-MX'), { code: 'MXN', symbol: '$' });
        assert.deepStrictEqual(detectUserCurrency('ar-AE'), { code: 'AED', symbol: 'د.إ' });
    });

    await t.test('should match currency by language prefix if exact regional locale is absent', () => {
        const deRes = detectUserCurrency('de-CH');
        assert.strictEqual(deRes.code, 'CHF');

        const jaRes = detectUserCurrency('ja-XX');
        assert.strictEqual(jaRes.code, 'JPY');
    });

    await t.test('should fallback to USD and $ for completely unknown locales or missing params in Node', () => {
        const unknown = detectUserCurrency('xx-YY');
        assert.deepStrictEqual(unknown, { code: 'USD', symbol: '$' });

        const empty = detectUserCurrency('');
        assert.deepStrictEqual(empty, { code: 'USD', symbol: '$' });
    });

    await t.test('should detect user currency from navigator.language and navigator.languages in browser', () => {
        // 1. Using window.navigator.language
        globalThis.window = { navigator: { language: 'ja-JP' } };
        const res1 = detectUserCurrency();
        assert.strictEqual(res1.code, 'JPY');

        // 2. Using window.navigator.languages
        globalThis.window = { navigator: { languages: ['de-DE', 'en-US'] } };
        const res2 = detectUserCurrency();
        assert.strictEqual(res2.code, 'EUR');

        delete globalThis.window;
    });

    await t.test('should resolve correct symbol for currency codes', () => {
        assert.strictEqual(getSymbolForCurrency('USD'), '$');
        assert.strictEqual(getSymbolForCurrency('EUR'), '€');
        assert.strictEqual(getSymbolForCurrency('GBP'), '£');
        assert.strictEqual(getSymbolForCurrency('JPY'), '¥');
        assert.strictEqual(getSymbolForCurrency('INR'), '₹');
        assert.strictEqual(getSymbolForCurrency('CAD'), '$');
        assert.strictEqual(getSymbolForCurrency('UNKNOWN'), '$');
    });

    await t.test('should resolve correct locale for currency codes', () => {
        assert.strictEqual(getLocaleForCurrency('USD'), 'en-US');
        assert.strictEqual(getLocaleForCurrency('EUR'), 'de-DE');
        assert.strictEqual(getLocaleForCurrency('GBP'), 'en-GB');
        assert.strictEqual(getLocaleForCurrency('INR'), 'en-IN');
        assert.strictEqual(getLocaleForCurrency('UNKNOWN'), 'en-US');
    });

    await t.test('should detect currencies for newly added countries and territories', () => {
        assert.deepStrictEqual(detectUserCurrency('el-CY'), { code: 'EUR', symbol: '€' }); // Cyprus
        assert.deepStrictEqual(detectUserCurrency('de-LI'), { code: 'CHF', symbol: 'CHF' }); // Liechtenstein
        assert.deepStrictEqual(detectUserCurrency('sr-ME'), { code: 'EUR', symbol: '€' }); // Montenegro
        assert.deepStrictEqual(detectUserCurrency('ms-BN'), { code: 'BND', symbol: 'B$' }); // Brunei
        assert.deepStrictEqual(detectUserCurrency('fa-AF'), { code: 'AFN', symbol: '؋' }); // Afghanistan
        assert.deepStrictEqual(detectUserCurrency('zh-MO'), { code: 'MOP', symbol: 'MOP$' }); // Macau
        assert.deepStrictEqual(detectUserCurrency('fr-SC'), { code: 'SCR', symbol: 'SR' }); // Seychelles
        assert.deepStrictEqual(detectUserCurrency('en-KY'), { code: 'KYD', symbol: 'CI$' }); // Cayman Islands
        assert.deepStrictEqual(detectUserCurrency('en-BM'), { code: 'BMD', symbol: 'BD$' }); // Bermuda
        assert.deepStrictEqual(detectUserCurrency('fr-HT'), { code: 'HTG', symbol: 'G' }); // Haiti
    });

    await t.test('should resolve correct symbols for expanded currency options', () => {
        assert.strictEqual(getSymbolForCurrency('CHF'), 'CHF');
        assert.strictEqual(getSymbolForCurrency('BRL'), 'R$');
        assert.strictEqual(getSymbolForCurrency('ZAR'), 'R');
        assert.strictEqual(getSymbolForCurrency('SGD'), '$');
        assert.strictEqual(getSymbolForCurrency('AED'), 'د.إ');
        assert.strictEqual(getSymbolForCurrency('SAR'), 'ر.س');
        assert.strictEqual(getSymbolForCurrency('MXN'), '$');
        assert.strictEqual(getSymbolForCurrency('KRW'), '₩');
        assert.strictEqual(getSymbolForCurrency('SEK'), 'kr');
        assert.strictEqual(getSymbolForCurrency('NOK'), 'kr');
    });

    await t.test('should format numerical amounts into localized currency strings', () => {
        const usdFormatted = formatCurrency(1250.50, 'USD');
        assert.ok(usdFormatted.includes('1,250.50') || usdFormatted.includes('$1,250.50'));

        const eurFormatted = formatCurrency(500, 'EUR');
        assert.ok(eurFormatted.includes('500') && (eurFormatted.includes('€') || eurFormatted.includes('EUR')));

        const inrFormatted = formatCurrency(99999, 'INR');
        assert.ok(inrFormatted.includes('99,999') || inrFormatted.includes('₹'));

        const chfFormatted = formatCurrency(1500, 'CHF');
        assert.ok(chfFormatted.includes('1,500') || chfFormatted.includes('CHF'));

        const brlFormatted = formatCurrency(250, 'BRL');
        assert.ok(brlFormatted.includes('250') || brlFormatted.includes('R$'));

        const zeroFormatted = formatCurrency(0, 'USD');
        assert.ok(zeroFormatted.includes('0.00'));
    });

    await t.test('should gracefully handle invalid currency codes with fallback formatting', () => {
        const fallback = formatCurrency(75.50, 'INVALID_CURRENCY_CODE_123');
        assert.strictEqual(fallback, '$75.50');

        // Test default currencyCode parameter
        const defaultFormatted = formatCurrency(100);
        assert.ok(defaultFormatted.includes('100'));
    });

    await t.test('should fallback to en-US when window navigator lacks language properties', () => {
        globalThis.window = { navigator: {} };
        const res = detectUserCurrency();
        assert.deepStrictEqual(res, { code: 'USD', symbol: '$' });
        delete globalThis.window;
    });

    await t.test('should attach properties to window in browser environment', () => {
        const fakeWindow = {};
        globalThis.window = fakeWindow;

        delete require.cache[require.resolve('../js/currencies.js')];
        require('../js/currencies.js');

        assert.ok(fakeWindow.AppCurrencies);
        assert.strictEqual(typeof fakeWindow.detectUserCurrency, 'function');
        assert.strictEqual(typeof fakeWindow.formatCurrency, 'function');

        delete globalThis.window;
    });
});
