const assert = require('assert');
const test = require('node:test');
const {
    calculateNextMonth,
    formatMonthLabel,
    showToast,
    showSaveIndicator,
    openModal,
    closeAllModals,
    updateCurrencySymbolsUI,
    syncFormCategoryOptions
} = require('../js/ui.js');

test('UI Helpers Suite', async (t) => {
    await t.test('should calculate next and previous months with proper year rollover', () => {
        // Normal advancement
        assert.strictEqual(calculateNextMonth('2026-06', 1), '2026-07');
        assert.strictEqual(calculateNextMonth('2026-06', -1), '2026-05');

        // Year boundary forward rollover
        assert.strictEqual(calculateNextMonth('2026-12', 1), '2027-01');

        // Year boundary backward rollover
        assert.strictEqual(calculateNextMonth('2026-01', -1), '2025-12');

        // Empty or invalid month defaults safely
        const fallbackNext = calculateNextMonth('', 1);
        assert.ok(fallbackNext.length === 7);
    });

    await t.test('should format YYYY-MM into human-readable month labels and handle fallbacks', () => {
        assert.strictEqual(formatMonthLabel('2026-06'), 'June 2026');
        assert.strictEqual(formatMonthLabel('2026-12'), 'December 2026');
        assert.strictEqual(formatMonthLabel('2027-01'), 'January 2027');

        // Empty/null fallback
        const emptyLabel = formatMonthLabel('');
        assert.ok(typeof emptyLabel === 'string' && emptyLabel.length > 3);
    });

    await t.test('should simulate DOM operations without crashing in headless environment', async () => {
        const elements = new Map();
        function createMockElement(id, className = '') {
            const classes = new Set(className.split(' ').filter(Boolean));
            const el = {
                id,
                parentNode: true,
                classList: {
                    add: (c) => classes.add(c),
                    remove: (c) => classes.delete(c),
                    contains: (c) => classes.has(c),
                    toggle: (c, val) => (val ? classes.add(c) : classes.delete(c))
                },
                textContent: '',
                innerHTML: '',
                appendChild: (child) => child,
                remove: function () { this.parentNode = null; }
            };
            elements.set(id, el);
            return el;
        }

        const fakeSaveStatus = createMockElement('save-status', 'hidden');
        const fakeModal = createMockElement('test-modal', 'modal-backdrop hidden');
        const fakeSelect = createMockElement('test-category-select');
        const fakeContainer = createMockElement('toast-container');

        const fakeDoc = {
            getElementById: (id) => elements.get(id) || null,
            querySelectorAll: (sel) => {
                if (sel === '.currency-symbol') {
                    return [
                        { textContent: '' },
                        { textContent: '' }
                    ];
                }
                if (sel === '.modal-backdrop') {
                    return [fakeModal];
                }
                return [];
            },
            createElement: (tag) => createMockElement(`dyn-${Date.now()}`)
        };

        globalThis.document = fakeDoc;
        let lucideIconsCreated = 0;
        globalThis.lucide = {
            createIcons: () => { lucideIconsCreated++; }
        };

        // Test showSaveIndicator
        showSaveIndicator(true, 'save-status');
        assert.strictEqual(fakeSaveStatus.classList.contains('hidden'), false);
        showSaveIndicator(false, 'save-status');
        assert.strictEqual(fakeSaveStatus.classList.contains('hidden'), true);

        // Test modal controls
        openModal('test-modal');
        assert.strictEqual(fakeModal.classList.contains('hidden'), false);
        closeAllModals();
        assert.strictEqual(fakeModal.classList.contains('hidden'), true);

        // Test category select syncing
        syncFormCategoryOptions('income', 'test-category-select', ['Salary', 'Freelance'], ['Food', 'Housing']);
        assert.ok(fakeSelect.innerHTML.includes('Salary'));
        assert.ok(fakeSelect.innerHTML.includes('Freelance'));
        assert.strictEqual(fakeSelect.innerHTML.includes('Food'), false);

        syncFormCategoryOptions('expense', 'test-category-select', ['Salary', 'Freelance'], ['Food', 'Housing']);
        assert.ok(fakeSelect.innerHTML.includes('Food'));
        assert.ok(fakeSelect.innerHTML.includes('Housing'));
        assert.strictEqual(fakeSelect.innerHTML.includes('Salary'), false);

        // Default categories sync
        syncFormCategoryOptions('income', 'test-category-select');
        assert.ok(fakeSelect.innerHTML.includes('Salary'));

        // Test currency symbol update
        updateCurrencySymbolsUI('€');

        // Test showToast with various types
        const toast1 = showToast('Saved!', 'success', 'toast-container');
        assert.ok(toast1);
        const toast2 = showToast('Warning!', 'warning', 'toast-container');
        assert.ok(toast2);
        const toast3 = showToast('Error!', 'error', 'toast-container');
        assert.ok(toast3);
        const toast4 = showToast('Info!', 'info', 'toast-container');
        assert.ok(toast4);

        assert.ok(lucideIconsCreated > 0);

        // Clean up global document and lucide
        delete globalThis.document;
        delete globalThis.lucide;
    });

    await t.test('should gracefully handle missing DOM elements in ui functions', () => {
        globalThis.document = {
            getElementById: () => null,
            querySelectorAll: () => []
        };

        assert.strictEqual(showToast('Missing container'), null);
        assert.strictEqual(showSaveIndicator(true, 'missing-save-indicator'), undefined);
        assert.strictEqual(openModal('missing-modal'), undefined);
        assert.strictEqual(syncFormCategoryOptions('income', 'missing-select'), undefined);
        assert.strictEqual(updateCurrencySymbolsUI('$'), undefined);

        delete globalThis.document;
    });

    await t.test('should handle headless environment safely when document is undefined', () => {
        delete globalThis.document;
        assert.strictEqual(showToast('test'), null);
        assert.strictEqual(showSaveIndicator(true), undefined);
        assert.strictEqual(openModal('m'), undefined);
        assert.strictEqual(closeAllModals(), undefined);
        assert.strictEqual(updateCurrencySymbolsUI('$'), undefined);
        assert.strictEqual(syncFormCategoryOptions('income', 'cat'), undefined);
    });

    await t.test('should attach properties to window in browser environment', () => {
        const fakeWindow = {};
        globalThis.window = fakeWindow;

        delete require.cache[require.resolve('../js/ui.js')];
        require('../js/ui.js');

        assert.ok(fakeWindow.AppUI);
        assert.strictEqual(typeof fakeWindow.showToast, 'function');
        assert.strictEqual(typeof fakeWindow.calculateNextMonth, 'function');

        delete globalThis.window;
    });
});
