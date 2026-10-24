const assert = require('assert');
const test = require('node:test');
const { webcrypto } = require('node:crypto');

if (!globalThis.crypto) {
    globalThis.crypto = webcrypto;
}

const { bootApp, AppState } = require('../app.js');

// Mock DOM factory simulating index.html elements and browser window
function createFullMockEnvironment() {
    const elements = new Map();
    const eventListeners = new Map();

    function createMockElement(id, classes = '', tag = 'div') {
        const classSet = new Set(classes.split(' ').filter(Boolean));
        const listeners = new Map();
        const attrs = new Map();

        const el = {
            id,
            tagName: tag.toUpperCase(),
            classList: {
                add: (c) => classSet.add(c),
                remove: (c) => classSet.delete(c),
                contains: (c) => classSet.has(c),
                toggle: (c, val) => (val ? classSet.add(c) : classSet.delete(c))
            },
            attributes: attrs,
            getAttribute: (a) => attrs.get(a) || null,
            setAttribute: (a, v) => attrs.set(a, String(v)),
            style: {},
            textContent: '',
            innerHTML: '',
            value: '',
            checked: true,
            files: [],
            click: function () {
                this.dispatchEvent({ type: 'click', currentTarget: this, target: this });
            },
            addEventListener: (evt, fn) => {
                if (!listeners.has(evt)) listeners.set(evt, []);
                listeners.get(evt).push(fn);
            },
            dispatchEvent: (eventObj) => {
                const fns = listeners.get(eventObj.type) || [];
                fns.forEach(fn => fn({
                    ...eventObj,
                    preventDefault: () => {},
                    currentTarget: el,
                    target: el
                }));
            },
            getContext: () => ({
                clearRect: () => {},
                fillText: () => {}
            })
        };
        elements.set(id, el);
        return el;
    }

    // Pre-create all elements from index.html
    const ids = [
        'page-title', 'current-month-display', 'btn-prev-month', 'btn-next-month',
        'stat-total-income', 'stat-total-expenses', 'stat-expense-sub', 'stat-savings-sub',
        'stat-savings-progress', 'savings-progress-ratio', 'savings-progress-bar', 'savings-status-message',
        'stat-net-balance', 'stat-balance-sub', 'recent-transactions-list',
        'savings-requirement-amount', 'recurring-list-tbody', 'onetime-list-tbody',
        'log-list-tbody', 'log-search', 'filter-type', 'filter-category', 'log-count', 'btn-reset-filters',
        'report-scope-display', 'report-total-income', 'report-total-expenses', 'report-savings-rate',
        'insights-list', 'categoryChart', 'trendChart', 'toast-container', 'save-status',
        'btn-mobile-settings', 'mobile-nav-settings', 'btn-export-db', 'btn-import-db',
        'modal-btn-export-plain', 'modal-btn-export-enc', 'modal-btn-import-db',
        'btn-clear-db', 'modal-btn-clear-db', 'btn-clear-export-first', 'btn-confirm-clear-action',
        'settings-currency-select', 'modal-currency-select',
        'quick-description', 'quick-amount', 'quick-date', 'quick-category',
        'modal-description', 'modal-amount', 'modal-date', 'modal-category',
        'form-quick-log', 'btn-quick-log', 'form-modal-tx', 'form-savings-requirement',
        'form-add-recurring', 'recurring-name', 'recurring-amount', 'recurring-category',
        'form-add-onetime', 'onetime-name', 'onetime-amount', 'onetime-date', 'onetime-category',
        'tab-dashboard', 'tab-recurring-expenses', 'tab-transaction-log', 'tab-reports',
        'modal-settings-data', 'modal-confirm-clear', 'modal-transaction'
    ];

    ids.forEach(id => createMockElement(id));

    // Default select values matching HTML
    elements.get('filter-type').value = 'all';
    elements.get('filter-category').value = 'all';

    // Panels
    ['dashboard', 'recurring-expenses', 'transaction-log', 'reports'].forEach(tab => {
        elements.get(`tab-${tab}`).classList.add('tab-panel');
    });

    // Nav items
    const navItems = [];
    ['dashboard', 'recurring-expenses', 'transaction-log', 'reports'].forEach(tab => {
        const nav = createMockElement(`nav-${tab}`, 'nav-item');
        nav.setAttribute('data-tab', tab);
        navItems.push(nav);

        const mNav = createMockElement(`mnav-${tab}`, 'mobile-nav-item');
        mNav.setAttribute('data-tab', tab);
        navItems.push(mNav);
    });

    // Report scope buttons
    const reportScopeBtns = ['weekly', 'monthly', 'annual'].map(scope => {
        const btn = createMockElement(`scope-${scope}`, 'btn');
        btn.setAttribute('data-scope', scope);
        return btn;
    });

    // Mock document
    const mockDoc = {
        getElementById: (id) => elements.get(id) || null,
        querySelector: (sel) => {
            if (sel === 'input[name="quick-type"]:checked') {
                return { value: 'expense' };
            }
            if (sel === 'input[name="modal-type"]:checked') {
                return { value: 'income' };
            }
            if (sel === '.btn-view-all') {
                return createMockElement('btn-view-all');
            }
            return null;
        },
        querySelectorAll: (sel) => {
            if (sel === '.tab-panel') {
                return ['dashboard', 'recurring-expenses', 'transaction-log', 'reports'].map(t => elements.get(`tab-${t}`));
            }
            if (sel === '.nav-item') {
                return navItems.filter(n => n.classList.contains('nav-item'));
            }
            if (sel === '.mobile-nav-item[data-tab]') {
                return navItems.filter(n => n.classList.contains('mobile-nav-item'));
            }
            if (sel === '.report-tabs .btn') {
                return reportScopeBtns;
            }
            if (sel === '.currency-symbol') {
                return [createMockElement('c1'), createMockElement('c2')];
            }
            if (sel === '.modal-backdrop') {
                return [elements.get('modal-settings-data'), elements.get('modal-confirm-clear')];
            }
            if (sel === 'input[name="quick-type"]') {
                return quickTypeRadios;
            }
            if (sel === 'input[name="modal-type"]') {
                return modalTypeRadios;
            }
            if (sel === '.btn-close-modal') {
                return [createMockElement('close1'), createMockElement('close2')];
            }
            if (sel === '.btn-delete-recurring') {
                return [delRecBtn];
            }
            if (sel === '.btn-delete-onetime') {
                return [delOtBtn];
            }
            if (sel === '.btn-delete-tx') {
                return [delTxBtn];
            }
            return [];
        },
        createElement: (tag) => {
            const dyn = createMockElement(`dyn-${Date.now()}`, '', tag);
            dyn.type = '';
            dyn.accept = '';
            dyn.onchange = null;
            return dyn;
        },
        addEventListener: (evt, fn) => {
            if (!eventListeners.has(evt)) eventListeners.set(evt, []);
            eventListeners.get(evt).push(fn);
        },
        dispatchEvent: (eventObj) => {
            const fns = eventListeners.get(eventObj.type) || [];
            fns.forEach(fn => fn(eventObj));
        }
    };

    // Pre-create persistent radio mock buttons
    const quickTypeRadios = [
        createMockElement('qt-exp', '', 'input'),
        createMockElement('qt-inc', '', 'input')
    ];
    quickTypeRadios[0].value = 'expense';
    quickTypeRadios[1].value = 'income';

    const modalTypeRadios = [
        createMockElement('mt-exp', '', 'input'),
        createMockElement('mt-inc', '', 'input')
    ];
    modalTypeRadios[0].value = 'expense';
    modalTypeRadios[1].value = 'income';

    // Pre-create persistent delete buttons
    const delRecBtn = createMockElement('del-rec');
    delRecBtn.setAttribute('data-id', 'rec-test');
    const delOtBtn = createMockElement('del-ot');
    delOtBtn.setAttribute('data-id', 'one-test');
    const delTxBtn = createMockElement('del-tx');
    delTxBtn.setAttribute('data-id', 'tx-test');

    // Mock Window
    const winListeners = new Map();
    const mockWin = {
        innerWidth: 1024,
        addEventListener: (evt, fn) => {
            if (!winListeners.has(evt)) winListeners.set(evt, []);
            winListeners.get(evt).push(fn);
        },
        dispatchEvent: (eventObj) => {
            const fns = winListeners.get(eventObj.type) || [];
            fns.forEach(fn => fn(eventObj));
        },
        navigator: {
            serviceWorker: {
                register: () => Promise.resolve({ scope: '/' })
            }
        },
        location: {
            protocol: 'http:'
        }
    };

    // Mock Storage
    const store = new Map();
    const mockStorage = {
        getItem: (k) => (store.has(k) ? store.get(k) : null),
        setItem: (k, v) => store.set(k, String(v)),
        removeItem: (k) => store.delete(k),
        clear: () => store.clear(),
        _store: store
    };

    return {
        mockDoc,
        mockWin,
        mockStorage,
        elements,
        navItems,
        reportScopeBtns,
        quickTypeRadios,
        modalTypeRadios,
        delRecBtn,
        delOtBtn,
        delTxBtn
    };
}

test('Application Orchestrator Suite (app.js Full Lifecycle)', async (t) => {
    await t.test('should boot application, load cache, and render initial views', () => {
        const { mockDoc, mockWin, mockStorage, elements } = createFullMockEnvironment();

        const controller = bootApp(mockWin, mockDoc, mockStorage);
        assert.ok(controller);
        assert.ok(controller.AppState);

        // Verify initial render
        assert.strictEqual(elements.get('page-title').textContent, 'Dashboard');
        assert.ok(elements.get('current-month-display').textContent.length > 3);
    });

    await t.test('should switch tabs across all panels and update header titles', () => {
        const { mockDoc, mockWin, mockStorage, elements } = createFullMockEnvironment();
        const controller = bootApp(mockWin, mockDoc, mockStorage);

        controller.switchTab('recurring-expenses');
        assert.strictEqual(AppState.currentTab, 'recurring-expenses');
        assert.strictEqual(elements.get('page-title').textContent, 'Fixed Commitments & Savings');

        controller.switchTab('transaction-log');
        assert.strictEqual(AppState.currentTab, 'transaction-log');
        assert.strictEqual(elements.get('page-title').textContent, 'Transactions Audit Log');

        controller.switchTab('reports');
        assert.strictEqual(AppState.currentTab, 'reports');
        assert.strictEqual(elements.get('page-title').textContent, 'Reports & Financial Insights');

        controller.switchTab('dashboard');
        assert.strictEqual(AppState.currentTab, 'dashboard');
        assert.strictEqual(elements.get('page-title').textContent, 'Dashboard');
    });

    await t.test('should navigate months forward and backward', () => {
        const { mockDoc, mockWin, mockStorage } = createFullMockEnvironment();
        const controller = bootApp(mockWin, mockDoc, mockStorage);

        const initialMonth = controller.AppState.currentMonth;
        controller.handleMonthChange(1);
        assert.notStrictEqual(controller.AppState.currentMonth, initialMonth);

        controller.handleMonthChange(-1);
        assert.strictEqual(controller.AppState.currentMonth, initialMonth);
    });

    await t.test('should submit quick transaction form with valid and invalid inputs', () => {
        const { mockDoc, mockWin, mockStorage, elements } = createFullMockEnvironment();
        const controller = bootApp(mockWin, mockDoc, mockStorage);

        const initialTxCount = controller.AppState.db.transactions.length;

        // 1. Submit invalid form (missing fields)
        elements.get('form-quick-log').dispatchEvent({ type: 'submit' });
        assert.strictEqual(controller.AppState.db.transactions.length, initialTxCount);

        // 2. Submit valid form
        elements.get('quick-date').value = '2026-06-15';
        elements.get('quick-description').value = 'Coffee';
        elements.get('quick-amount').value = '4.50';
        elements.get('quick-category').value = 'Food';

        elements.get('form-quick-log').dispatchEvent({ type: 'submit' });
        assert.strictEqual(controller.AppState.db.transactions.length, initialTxCount + 1);
        assert.strictEqual(elements.get('quick-description').value, '');
    });

    await t.test('should submit modal transaction form with valid and invalid inputs', () => {
        const { mockDoc, mockWin, mockStorage, elements } = createFullMockEnvironment();
        const controller = bootApp(mockWin, mockDoc, mockStorage);

        const initialTxCount = controller.AppState.db.transactions.length;

        // Click open modal transaction
        elements.get('btn-quick-log').click();

        // Invalid submit
        elements.get('form-modal-tx').dispatchEvent({ type: 'submit' });
        assert.strictEqual(controller.AppState.db.transactions.length, initialTxCount);

        // Valid submit
        elements.get('modal-date').value = '2026-06-18';
        elements.get('modal-description').value = 'Consulting Bonus';
        elements.get('modal-amount').value = '1200.00';
        elements.get('modal-category').value = 'Freelance';

        elements.get('form-modal-tx').dispatchEvent({ type: 'submit' });
        assert.strictEqual(controller.AppState.db.transactions.length, initialTxCount + 1);
    });

    await t.test('should update savings requirement setting', () => {
        const { mockDoc, mockWin, mockStorage, elements } = createFullMockEnvironment();
        const controller = bootApp(mockWin, mockDoc, mockStorage);

        // Invalid submit
        elements.get('savings-requirement-amount').value = '-50';
        elements.get('form-savings-requirement').dispatchEvent({ type: 'submit' });

        // Valid submit
        elements.get('savings-requirement-amount').value = '750';
        elements.get('form-savings-requirement').dispatchEvent({ type: 'submit' });
        assert.strictEqual(controller.AppState.db.settings.savingsRequirement, 750);
    });

    await t.test('should add and delete recurring and one-time planned expenses', () => {
        const { mockDoc, mockWin, mockStorage, elements } = createFullMockEnvironment();
        const controller = bootApp(mockWin, mockDoc, mockStorage);

        // Add Recurring
        elements.get('recurring-name').value = 'Gym';
        elements.get('recurring-amount').value = '50';
        elements.get('recurring-category').value = 'Healthcare';
        elements.get('form-add-recurring').dispatchEvent({ type: 'submit' });

        assert.ok(controller.AppState.db.recurringExpenses.some(r => r.name === 'Gym'));

        // Add One-Time
        elements.get('onetime-name').value = 'Concert';
        elements.get('onetime-amount').value = '120';
        elements.get('onetime-date').value = '2026-06-25';
        elements.get('onetime-category').value = 'Entertainment';
        elements.get('form-add-onetime').dispatchEvent({ type: 'submit' });

        assert.ok(controller.AppState.db.oneTimeExpenses.some(o => o.name === 'Concert'));
    });

    await t.test('should change currency and update state and dropdowns', () => {
        const { mockDoc, mockWin, mockStorage, elements } = createFullMockEnvironment();
        const controller = bootApp(mockWin, mockDoc, mockStorage);

        controller.handleCurrencyChange('EUR');
        assert.strictEqual(controller.AppState.currencyCode, 'EUR');
        assert.strictEqual(controller.AppState.currencySymbol, '€');
        assert.strictEqual(elements.get('settings-currency-select').value, 'EUR');
        assert.strictEqual(elements.get('modal-currency-select').value, 'EUR');
    });

    await t.test('should filter transactions by search, type, category and reset', () => {
        const { mockDoc, mockWin, mockStorage, elements } = createFullMockEnvironment();
        const controller = bootApp(mockWin, mockDoc, mockStorage);

        controller.AppState.db.transactions = [
            { id: '1', date: controller.AppState.currentMonth + '-05', description: 'Grocery Market', type: 'expense', category: 'Food', amount: 50 },
            { id: '2', date: controller.AppState.currentMonth + '-10', description: 'Monthly Salary', type: 'income', category: 'Salary', amount: 3000 }
        ];

        controller.renderTransactionsLog();
        assert.ok(elements.get('log-count').textContent.includes('2 transactions'));

        // Search filter
        elements.get('log-search').value = 'Grocery';
        controller.renderTransactionsLog();
        assert.ok(elements.get('log-count').textContent.includes('1 transactions'));

        // Type filter
        elements.get('log-search').value = '';
        elements.get('filter-type').value = 'income';
        controller.renderTransactionsLog();
        assert.ok(elements.get('log-count').textContent.includes('1 transactions'));

        // Reset button
        elements.get('btn-reset-filters').click();
        assert.strictEqual(elements.get('log-search').value, '');
        assert.strictEqual(elements.get('filter-type').value, 'all');
    });

    await t.test('should handle export operations (plain and encrypted)', async () => {
        const { mockDoc, mockWin, mockStorage } = createFullMockEnvironment();
        let promptResponse = 'alice';
        const controller = bootApp(mockWin, mockDoc, mockStorage, () => promptResponse);

        // Plain export
        controller.exportPlainJSON();

        // Encrypted export success
        await controller.exportDatabaseBackup();

        // Cancelled export
        promptResponse = null;
        await controller.exportDatabaseBackup();

        // Empty export
        promptResponse = '   ';
        await controller.exportDatabaseBackup();
    });

    await t.test('should handle plain and encrypted import flows', async () => {
        const { mockDoc, mockWin, mockStorage } = createFullMockEnvironment();
        let promptResponse = 'alice';
        const controller = bootApp(mockWin, mockDoc, mockStorage, () => promptResponse);

        // Plain import
        const plainData = JSON.stringify({
            transactions: [{ id: 'tx-imp', amount: 100, type: 'expense', category: 'Food', date: '2026-06-01' }],
            recurringExpenses: []
        });
        await controller.processImportedContent(plainData);
        assert.strictEqual(controller.AppState.db.transactions[0].id, 'tx-imp');
    });

    await t.test('should clear local memory and restart fresh', () => {
        const { mockDoc, mockWin, mockStorage } = createFullMockEnvironment();
        const controller = bootApp(mockWin, mockDoc, mockStorage);

        controller.AppState.db.transactions.push({ id: 'tx-old', amount: 999 });
        controller.clearLocalMemory();

        assert.strictEqual(controller.AppState.db.transactions.length, 0);
    });

    await t.test('should trigger window resize and dispatch keyboard escape dismissal', () => {
        const { mockDoc, mockWin, mockStorage } = createFullMockEnvironment();
        bootApp(mockWin, mockDoc, mockStorage);

        // Dispatch resize
        mockWin.dispatchEvent({ type: 'resize' });

        // Dispatch Escape keydown
        mockDoc.dispatchEvent({ type: 'keydown', key: 'Escape' });
    });

    await t.test('should return null when document is undefined or null', () => {
        assert.strictEqual(bootApp(null, null), null);
    });

    await t.test('should exercise dashboard savings variations and negative balance', () => {
        const { mockDoc, mockWin, mockStorage, elements } = createFullMockEnvironment();
        const controller = bootApp(mockWin, mockDoc, mockStorage);

        // 1. Surplus > 0 but less than goal
        controller.AppState.db.settings.savingsRequirement = 1000;
        controller.AppState.db.transactions = [
            { id: 'inc-1', date: controller.AppState.currentMonth + '-01', type: 'income', amount: 800, category: 'Salary' },
            { id: 'exp-1', date: controller.AppState.currentMonth + '-02', type: 'expense', amount: 300, category: 'Food' }
        ];
        controller.renderDashboard();
        assert.ok(elements.get('savings-status-message').textContent.includes('You need'));

        // 2. Surplus <= 0
        controller.AppState.db.transactions.push({
            id: 'exp-big',
            date: controller.AppState.currentMonth + '-03',
            type: 'expense',
            amount: 2000,
            category: 'Other'
        });
        controller.renderDashboard();
        assert.ok(elements.get('savings-status-message').textContent.includes('No current savings surplus'));
        assert.ok(elements.get('stat-balance-sub').textContent.includes('exceed inflows'));

        // 3. Goal == 0
        controller.AppState.db.settings.savingsRequirement = 0;
        controller.renderDashboard();
        assert.strictEqual(elements.get('stat-savings-progress').textContent, 'N/A');
    });

    await t.test('should exercise delete buttons on rendered tables', () => {
        const { mockDoc, mockWin, mockStorage, delRecBtn, delOtBtn, delTxBtn } = createFullMockEnvironment();
        const controller = bootApp(mockWin, mockDoc, mockStorage);

        // Populate items
        controller.AppState.db.recurringExpenses = [{ id: 'rec-test', name: 'Rent', amount: 500, category: 'Housing' }];
        controller.AppState.db.oneTimeExpenses = [{ id: 'one-test', name: 'Repairs', amount: 100, date: controller.AppState.currentMonth + '-01', category: 'Other' }];
        controller.AppState.db.transactions = [{ id: 'tx-test', date: controller.AppState.currentMonth + '-01', amount: 50, type: 'expense', category: 'Food', description: 'Lunch' }];

        controller.renderBudgetManager();
        controller.renderTransactionsLog();

        // Click delete buttons
        delRecBtn.click();
        assert.strictEqual(controller.AppState.db.recurringExpenses.length, 0);

        delOtBtn.click();
        assert.strictEqual(controller.AppState.db.oneTimeExpenses.length, 0);

        delTxBtn.click();
        assert.strictEqual(controller.AppState.db.transactions.length, 0);
    });

    await t.test('should exercise chart rendering with Chart mock and callback handlers', () => {
        const { mockDoc, mockWin, mockStorage } = createFullMockEnvironment();

        let chartConstructed = 0;
        let lastTrendConfig = null;
        let lastCatConfig = null;
        let destroyCount = 0;

        globalThis.Chart = function (canvas, config) {
            chartConstructed++;
            this.destroy = () => { destroyCount++; };
            this.config = config;
            if (config.type === 'bar') {
                lastTrendConfig = config;
            } else if (config.type === 'doughnut') {
                lastCatConfig = config;
            }
        };

        const controller = bootApp(mockWin, mockDoc, mockStorage);

        // Render charts with data
        controller.renderCategoryChart({ Food: 150, Housing: 800 });
        assert.ok(chartConstructed > 0);
        if (lastCatConfig && lastCatConfig.options && lastCatConfig.options.plugins && lastCatConfig.options.plugins.tooltip) {
            const labelStr = lastCatConfig.options.plugins.tooltip.callbacks.label({ label: 'Food', raw: 150 });
            assert.ok(labelStr.includes('Food'));
        }

        controller.renderTrendChart([
            { label: 'Week 1', income: 1000, expense: 500 },
            { label: 'Week 2', income: 1200, expense: 600 }
        ]);
        assert.ok(chartConstructed > 1);

        if (lastTrendConfig && lastTrendConfig.options) {
            if (lastTrendConfig.options.scales && lastTrendConfig.options.scales.y && lastTrendConfig.options.scales.y.ticks) {
                const tickVal = lastTrendConfig.options.scales.y.ticks.callback(500);
                assert.ok(typeof tickVal === 'string');
            }
            if (lastTrendConfig.options.plugins && lastTrendConfig.options.plugins.tooltip) {
                const ttVal = lastTrendConfig.options.plugins.tooltip.callbacks.label({ dataset: { label: 'Total Earnings' }, raw: 1000 });
                assert.ok(ttVal.includes('Total Earnings'));
            }
        }

        // Re-render trend chart to test destroy branch
        controller.renderTrendChart([
            { label: 'Week 3', income: 800, expense: 400 }
        ]);
        assert.ok(destroyCount > 0);

        // Render charts with empty data
        controller.renderCategoryChart({});

        delete globalThis.Chart;
    });

    await t.test('should exercise handleImportJSON with mock FileReader', async () => {
        const { mockDoc, mockWin, mockStorage } = createFullMockEnvironment();
        const controller = bootApp(mockWin, mockDoc, mockStorage);

        globalThis.FileReader = function () {
            this.readAsText = function (file) {
                setTimeout(() => {
                    if (this.onload) {
                        this.onload({ target: { result: JSON.stringify({ transactions: [{ id: 'tx-fr', amount: 40 }], recurringExpenses: [] }) } });
                    }
                }, 5);
            };
        };

        const fakeEvent = {
            target: {
                files: [{ name: 'backup.json' }]
            }
        };

        controller.handleImportJSON(fakeEvent);

        await new Promise(resolve => setTimeout(resolve, 20));
        assert.ok(controller.AppState.db.transactions.some(t => t.id === 'tx-fr'));

        delete globalThis.FileReader;
    });

    await t.test('should exercise service worker load event listener', () => {
        const { mockDoc, mockWin, mockStorage } = createFullMockEnvironment();
        bootApp(mockWin, mockDoc, mockStorage);

        // Trigger load event on mockWin
        mockWin.dispatchEvent({ type: 'load' });
    });

    await t.test('should initialize lucide icons when lucide is globally present', () => {
        let lucideCount = 0;
        globalThis.lucide = {
            createIcons: () => { lucideCount++; }
        };

        const { mockDoc, mockWin, mockStorage } = createFullMockEnvironment();
        const controller = bootApp(mockWin, mockDoc, mockStorage);
        assert.ok(lucideCount > 0);

        delete globalThis.lucide;
    });

    await t.test('should notify when autosaved budget is loaded with existing records', async () => {
        const { mockDoc, mockWin, mockStorage } = createFullMockEnvironment();
        const autosaveDb = {
            version: '1.0.0',
            settings: { currency: 'USD', savingsRequirement: 0 },
            transactions: [{ id: 'tx-auto-1', amount: 100, type: 'income', category: 'Salary', date: '2026-06-01' }],
            recurringExpenses: [],
            oneTimeExpenses: []
        };
        mockStorage.setItem('sovereign_budget_autosave_json', JSON.stringify(autosaveDb));

        const controller = bootApp(mockWin, mockDoc, mockStorage);
        assert.strictEqual(controller.AppState.db.transactions[0].id, 'tx-auto-1');

        await new Promise(resolve => setTimeout(resolve, 450));
    });

    await t.test('should handle loadData catch block when storage throws', () => {
        const { mockDoc, mockWin } = createFullMockEnvironment();
        const corruptStorage = {
            get getItem() { throw new Error('Storage access forbidden'); },
            setItem: () => {},
            removeItem: () => {}
        };

        const origError = console.error;
        console.error = () => {};
        try {
            const controller = bootApp(mockWin, mockDoc, corruptStorage);
            assert.ok(controller.AppState.db);
            assert.strictEqual(controller.AppState.db.transactions.length, 0);
        } finally {
            console.error = origError;
        }
    });

    await t.test('should handle saveData catch block when storage quota is exceeded', () => {
        const { mockDoc, mockWin, mockStorage } = createFullMockEnvironment();
        const controller = bootApp(mockWin, mockDoc, mockStorage);

        mockStorage.setItem = () => { throw new Error('QuotaExceededError'); };
        const origError = console.error;
        console.error = () => {};
        try {
            // Test non-exit save
            controller.saveData(false);
            // Test exit save
            controller.saveData(true);
        } finally {
            console.error = origError;
        }
    });

    await t.test('should handle export error gracefully in exportPlainJSON and exportDatabaseBackup', async () => {
        const { mockDoc, mockWin, mockStorage } = createFullMockEnvironment();
        const promptController = bootApp(mockWin, mockDoc, mockStorage, () => 'Alice');

        const origCreate = mockDoc.createElement;
        mockDoc.createElement = (tag) => {
            if (tag === 'a') throw new Error('Mock anchor creation failure');
            return origCreate(tag);
        };

        const origError = console.error;
        console.error = () => {};
        try {
            promptController.exportPlainJSON();

            // Export encrypted backup with error (anchor creation throws inside try-catch)
            await promptController.exportDatabaseBackup();
        } finally {
            console.error = origError;
            mockDoc.createElement = origCreate;
        }
    });

    await t.test('should handle cancelled and corrupted processImportedContent flows', async () => {
        const { mockDoc, mockWin, mockStorage } = createFullMockEnvironment();
        const cancelPrompt = () => null;
        const controller = bootApp(mockWin, mockDoc, mockStorage, cancelPrompt);

        // 1. Encrypted content with prompt returning null (cancelled)
        const encryptedEnvelope = JSON.stringify({
            version: 'encrypted-v1',
            salt: 'AAAA',
            iv: 'BBBB',
            ciphertext: 'CCCC'
        });
        await controller.processImportedContent(encryptedEnvelope);

        // 2. Corrupted content throwing an error
        await controller.processImportedContent('NOT_JSON_OR_CORRUPT');
    });

    await t.test('should exercise interactive event listeners for nav, mobile-nav, scope tabs, clear db, backdrop, and type changes', () => {
        const { mockDoc, mockWin, mockStorage, elements, navItems, reportScopeBtns, quickTypeRadios, modalTypeRadios } = createFullMockEnvironment();
        const controller = bootApp(mockWin, mockDoc, mockStorage);

        // Nav click
        const navDash = navItems.find(n => n.id === 'nav-dashboard');
        if (navDash) navDash.click();
        assert.strictEqual(controller.AppState.currentTab, 'dashboard');

        const navRec = navItems.find(n => n.id === 'nav-recurring-expenses');
        if (navRec) navRec.click();
        assert.strictEqual(controller.AppState.currentTab, 'recurring-expenses');

        // Mobile Nav click
        const mnavLog = navItems.find(n => n.id === 'mnav-transaction-log');
        if (mnavLog) mnavLog.click();
        assert.strictEqual(controller.AppState.currentTab, 'transaction-log');

        // Scope button click
        reportScopeBtns[0].click();
        assert.strictEqual(controller.AppState.reportScope, 'weekly');
        reportScopeBtns[1].click();
        assert.strictEqual(controller.AppState.reportScope, 'monthly');

        // Modal btn clear db
        elements.get('modal-btn-clear-db').click();

        // Backdrop click on itself
        const modal = elements.get('modal-settings-data');
        modal.dispatchEvent({ type: 'click', target: modal });

        // Quick type change
        quickTypeRadios[1].dispatchEvent({ type: 'change', target: { value: 'income' } });

        // Modal type change
        modalTypeRadios[0].dispatchEvent({ type: 'change', target: { value: 'expense' } });

        // Import triggers
        elements.get('btn-import-db').click();
        elements.get('modal-btn-import-db').click();
    });

    await t.test('should validate rejection paths in formAddRecurring and formAddOnetime', () => {
        const { mockDoc, mockWin, mockStorage, elements } = createFullMockEnvironment();
        const controller = bootApp(mockWin, mockDoc, mockStorage);

        // 1. form-add-recurring with invalid inputs
        elements.get('recurring-name').value = '';
        elements.get('recurring-amount').value = '0';
        elements.get('form-add-recurring').dispatchEvent({ type: 'submit' });

        // 2. form-add-onetime with invalid inputs
        elements.get('onetime-name').value = '';
        elements.get('onetime-amount').value = '-5';
        elements.get('onetime-date').value = '';
        elements.get('form-add-onetime').dispatchEvent({ type: 'submit' });
    });

    await t.test('should filter transactions by specific category in renderTransactionsLog', () => {
        const { mockDoc, mockWin, mockStorage, elements } = createFullMockEnvironment();
        const controller = bootApp(mockWin, mockDoc, mockStorage);

        controller.AppState.db.transactions = [
            { id: 'tx-cat-1', type: 'expense', amount: 30, category: 'Food', date: controller.AppState.currentMonth + '-01', description: 'Groceries' },
            { id: 'tx-cat-2', type: 'expense', amount: 70, category: 'Transportation', date: controller.AppState.currentMonth + '-02', description: 'Gas' }
        ];

        elements.get('filter-category').value = 'Food';
        controller.renderTransactionsLog();
        assert.ok(elements.get('log-count').textContent.includes('1 transactions'));
    });

    await t.test('should exercise window resize when AppState.currentTab is reports', async () => {
        const { mockDoc, mockWin, mockStorage } = createFullMockEnvironment();
        const controller = bootApp(mockWin, mockDoc, mockStorage);

        controller.switchTab('reports');
        mockWin.dispatchEvent({ type: 'resize' });

        await new Promise(resolve => setTimeout(resolve, 250));
    });

    await t.test('should initialize db.settings.currency during init when currency setting is absent', () => {
        const { mockDoc, mockWin, mockStorage } = createFullMockEnvironment();
        const dbWithoutCurrency = {
            version: '1.0.0',
            settings: { currency: null, savingsRequirement: 100 },
            transactions: [],
            recurringExpenses: [],
            oneTimeExpenses: []
        };
        mockStorage.setItem('sovereign_budget_cache', JSON.stringify(dbWithoutCurrency));

        const controller = bootApp(mockWin, mockDoc, mockStorage);
        assert.ok(controller.AppState.db.settings.currency);
    });

    await t.test('should test DOMContentLoaded registration when document is available', () => {
        let domLoadedCallback = null;
        globalThis.document = {
            addEventListener: (evt, cb) => {
                if (evt === 'DOMContentLoaded') domLoadedCallback = cb;
            },
            getElementById: () => null,
            querySelector: () => null,
            querySelectorAll: () => []
        };

        delete require.cache[require.resolve('../app.js')];
        require('../app.js');

        assert.ok(typeof domLoadedCallback === 'function');
        domLoadedCallback();

        delete globalThis.document;
    });

    await t.test('should exercise dashboard savings target achieved message', () => {
        const { mockDoc, mockWin, mockStorage, elements } = createFullMockEnvironment();
        const controller = bootApp(mockWin, mockDoc, mockStorage);

        controller.AppState.db.settings.savingsRequirement = 500;
        controller.AppState.db.transactions = [
            { id: 'tx-inc-big', type: 'income', amount: 2000, category: 'Salary', date: controller.AppState.currentMonth + '-01' },
            { id: 'tx-exp-sm', type: 'expense', amount: 200, category: 'Food', date: controller.AppState.currentMonth + '-02' }
        ];

        controller.renderDashboard();
        assert.ok(elements.get('savings-status-message').textContent.includes('Amazing!'));
    });
});
