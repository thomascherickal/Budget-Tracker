const assert = require('assert');
const test = require('node:test');
const {
    CACHE_KEY,
    AUTOSAVE_KEY,
    EXIT_TIMESTAMP_KEY,
    APP_VERSION,
    EXPENSE_CATEGORIES,
    INCOME_CATEGORIES,
    CHART_PALETTE,
    TAB_TITLES
} = require('../js/constants.js');

test('Constants Suite', async (t) => {
    await t.test('should verify storage cache and autosave keys', () => {
        assert.strictEqual(CACHE_KEY, 'sovereign_budget_cache');
        assert.strictEqual(AUTOSAVE_KEY, 'sovereign_budget_autosave_json');
        assert.strictEqual(EXIT_TIMESTAMP_KEY, 'sovereign_budget_exit_timestamp');
        assert.strictEqual(APP_VERSION, '1.0.0');
    });

    await t.test('should define valid expense and income category arrays', () => {
        assert.ok(Array.isArray(EXPENSE_CATEGORIES));
        assert.ok(EXPENSE_CATEGORIES.length >= 10);
        assert.ok(EXPENSE_CATEGORIES.includes('Food'));
        assert.ok(EXPENSE_CATEGORIES.includes('Housing'));
        assert.ok(EXPENSE_CATEGORIES.includes('Utilities'));
        assert.ok(EXPENSE_CATEGORIES.includes('Subscriptions'));

        assert.ok(Array.isArray(INCOME_CATEGORIES));
        assert.ok(INCOME_CATEGORIES.length >= 4);
        assert.ok(INCOME_CATEGORIES.includes('Salary'));
        assert.ok(INCOME_CATEGORIES.includes('Freelance'));
    });

    await t.test('should define valid chart palette and tab titles', () => {
        assert.ok(Array.isArray(CHART_PALETTE));
        assert.ok(CHART_PALETTE.length >= 10);
        CHART_PALETTE.forEach(color => {
            assert.match(color, /^#[0-9a-fA-F]{6}$/);
        });

        assert.ok(TAB_TITLES['dashboard']);
        assert.ok(TAB_TITLES['recurring-expenses']);
        assert.ok(TAB_TITLES['transaction-log']);
        assert.ok(TAB_TITLES['reports']);
    });

    await t.test('should attach properties to window in browser environment', () => {
        const fakeWindow = {};
        globalThis.window = fakeWindow;

        // Invalidate require cache to trigger browser export branch
        delete require.cache[require.resolve('../js/constants.js')];
        require('../js/constants.js');

        assert.ok(fakeWindow.AppConstants);
        assert.strictEqual(fakeWindow.CACHE_KEY, 'sovereign_budget_cache');
        assert.strictEqual(fakeWindow.APP_VERSION, '1.0.0');

        delete globalThis.window;
    });
});
