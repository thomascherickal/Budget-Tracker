const assert = require('assert');
const test = require('node:test');
const {
    getMonthFinancials,
    compileReportMetrics,
    generateInsightItems
} = require('../js/financials.js');

test('Financial Calculations Suite', async (t) => {
    function getMockDb() {
        return {
            version: '1.0.0',
            settings: {
                savingsRequirement: 500,
                currency: 'USD'
            },
            recurringExpenses: [
                { id: 'rec-1', name: 'Rent', amount: 1200, category: 'Housing', frequency: 'monthly' },
                { id: 'rec-2', name: 'Spotify', amount: 15, category: 'Subscriptions', frequency: 'monthly' }
            ],
            oneTimeExpenses: [
                { id: 'one-1', name: 'Car service', amount: 200, date: '2026-06-10', category: 'Transportation' },
                { id: 'one-2', name: 'Ski trip', amount: 400, date: '2026-07-15', category: 'Entertainment' }
            ],
            transactions: [
                { id: 'tx-1', type: 'income', date: '2026-06-01', description: 'Salary', amount: 3000, category: 'Salary' },
                { id: 'tx-2', type: 'income', date: '2026-06-15', description: 'Freelance', amount: 500, category: 'Freelance' },
                { id: 'tx-3', type: 'expense', date: '2026-06-05', description: 'Groceries', amount: 150, category: 'Food' },
                { id: 'tx-4', type: 'expense', date: '2026-06-20', description: 'Dinner', amount: 50, category: 'Food' },
                { id: 'tx-5', type: 'expense', date: '2026-07-02', description: 'Next month groceries', amount: 100, category: 'Food' }
            ]
        };
    }

    await t.test('should calculate financials correctly for a specific month', () => {
        const db = getMockDb();
        const monthStr = '2026-06';
        const financials = getMonthFinancials(monthStr, db);

        // Income: 3000 + 500 = 3500
        assert.strictEqual(financials.totalIncome, 3500);
        // Logged expenses: 150 + 50 = 200
        assert.strictEqual(financials.loggedExpenses, 200);
        // Recurring: 1200 + 15 = 1215
        assert.strictEqual(financials.recurringTotal, 1215);
        // Onetime in June: 200
        assert.strictEqual(financials.onetimeTotal, 200);
        // Total expenses: 200 + 1215 + 200 = 1615
        assert.strictEqual(financials.totalExpenses, 1615);
        // Savings requirement: 500
        assert.strictEqual(financials.savingsRequirement, 500);
        // Surplus: 3500 - 1615 = 1885
        assert.strictEqual(financials.actualSurplus, 1885);
        // Net balance: 3500 - 1615 - 500 = 1385
        assert.strictEqual(financials.netBalance, 1385);
        // Progress: surplus >= goal => 100%
        assert.strictEqual(financials.savingsProgressPct, 100);
    });

    await t.test('should compute correct savings progress when surplus is below the requirement', () => {
        const db = getMockDb();
        db.settings.savingsRequirement = 2000;
        const monthStr = '2026-06';
        const financials = getMonthFinancials(monthStr, db);

        // Surplus 1885 / 2000 * 100 = 94.25%
        assert.strictEqual(financials.savingsProgressPct, 94.25);
        assert.strictEqual(financials.netBalance, -115);
    });

    await t.test('should clamp savings progress to 0% if actual surplus is negative', () => {
        const db = getMockDb();
        db.transactions.push({
            id: 'tx-huge',
            type: 'expense',
            date: '2026-06-25',
            description: 'Emergency repair',
            amount: 3000,
            category: 'Other'
        });

        const monthStr = '2026-06';
        const financials = getMonthFinancials(monthStr, db);
        assert.strictEqual(financials.actualSurplus, -1115);
        assert.strictEqual(financials.savingsProgressPct, 0);
    });

    await t.test('should return 100% savings progress if savings requirement is 0', () => {
        const db = getMockDb();
        db.settings.savingsRequirement = 0;
        const financials = getMonthFinancials('2026-06', db);
        assert.strictEqual(financials.savingsProgressPct, 100);
    });

    await t.test('should throw an error if database state is missing', () => {
        assert.throws(() => getMonthFinancials('2026-06', null), /Database state is required/);
        assert.throws(() => compileReportMetrics('monthly', null), /Database state is required/);
    });

    await t.test('should compile weekly report metrics accurately', () => {
        const db = getMockDb();
        const refDate = new Date('2026-06-20T12:00:00Z');
        const metrics = compileReportMetrics('weekly', db, '2026-06', refDate);

        assert.strictEqual(metrics.scope, 'weekly');
        assert.ok(metrics.chartData.length === 7);
        assert.ok(metrics.earnings >= 500); // tx-2 is on 2026-06-15 (within 7 days)
        assert.ok(metrics.outflows > 0);
        assert.ok(metrics.categorySpend['Fixed (Recurring)'] > 0);
    });

    await t.test('should compile monthly report metrics split into weeks', () => {
        const db = getMockDb();
        const metrics = compileReportMetrics('monthly', db, '2026-06');

        assert.strictEqual(metrics.scope, 'monthly');
        assert.strictEqual(metrics.earnings, 3500);
        assert.strictEqual(metrics.outflows, 1615);
        assert.ok(metrics.chartData.length === 4); // 4 weeks
        assert.strictEqual(metrics.chartData[0].label, 'Week 1');
        assert.strictEqual(metrics.chartData[3].label, 'Week 4+');
        assert.strictEqual(metrics.categorySpend['Fixed Commitments'], 1215);
        assert.strictEqual(metrics.categorySpend['Planned One-Times'], 200);
    });

    await t.test('should compile annual report metrics split into 12 months', () => {
        const db = getMockDb();
        const metrics = compileReportMetrics('annual', db, '2026-06');

        assert.strictEqual(metrics.scope, 'annual');
        assert.strictEqual(metrics.earnings, 3500);
        assert.ok(metrics.outflows >= 1215 * 12); // Annualized recurring
        assert.strictEqual(metrics.chartData.length, 12);
        assert.strictEqual(metrics.chartData[0].label, 'Jan');
        assert.strictEqual(metrics.chartData[11].label, 'Dec');
    });

    await t.test('should generate appropriate diagnostic insights', () => {
        // Empty state
        const emptyInsights = generateInsightItems(0, 0, 0, {}, 'monthly');
        assert.strictEqual(emptyInsights.length, 1);
        assert.strictEqual(emptyInsights[0].type, 'empty');

        // Deficit state
        const deficitInsights = generateInsightItems(1000, 1500, 0, { Food: 500 }, 'monthly');
        assert.ok(deficitInsights.some(i => i.type === 'deficit'));
        assert.ok(deficitInsights.some(i => i.type === 'highest-variable'));

        // Solid savings rate (>= 20%)
        const solidInsights = generateInsightItems(4000, 2000, 50, { Food: 500, Housing: 800 }, 'monthly');
        assert.ok(solidInsights.some(i => i.type === 'solid-savings'));

        // Increment plan (< 20%)
        const incrementInsights = generateInsightItems(2000, 1800, 10, { Food: 600 }, 'monthly');
        assert.ok(incrementInsights.some(i => i.type === 'increment-plan'));

        // Low income alert (< 1500 in monthly scope)
        const lowIncomeInsights = generateInsightItems(1200, 800, 33, { Food: 300 }, 'monthly');
        assert.ok(lowIncomeInsights.some(i => i.type === 'cashflow-expansion'));

        // Default parameters test
        const defaultInsights = generateInsightItems(2500, 1000, 60);
        assert.ok(defaultInsights.length > 0);
    });

    await t.test('should gracefully handle empty or malformed database fields in getMonthFinancials', () => {
        const bareDb = {
            transactions: null,
            recurringExpenses: null,
            oneTimeExpenses: null,
            settings: null
        };
        const res = getMonthFinancials('2026-06', bareDb);
        assert.strictEqual(res.totalIncome, 0);
        assert.strictEqual(res.totalExpenses, 0);
        assert.strictEqual(res.savingsRequirement, 0);
        assert.strictEqual(res.savingsProgressPct, 100);
    });

    await t.test('should handle default arguments and edge cases in compileReportMetrics', () => {
        const db = getMockDb();

        // 1. Monthly scope without currentMonth parameter (uses current date)
        const monthlyDefault = compileReportMetrics('monthly', db);
        assert.strictEqual(monthlyDefault.scope, 'monthly');
        assert.ok(monthlyDefault.chartData.length === 4);

        // 2. Annual scope without currentMonth parameter (uses referenceDate.getFullYear())
        const annualDefault = compileReportMetrics('annual', db, '');
        assert.strictEqual(annualDefault.scope, 'annual');
        assert.ok(annualDefault.chartData.length === 12);

        // 3. Weekly scope with default referenceDate
        const weeklyDefault = compileReportMetrics('weekly', db, '2026-06');
        assert.strictEqual(weeklyDefault.scope, 'weekly');
        assert.ok(weeklyDefault.chartData.length === 7);

        // 4. Zero earnings savings rate clamp to 0
        const zeroEarningsDb = {
            transactions: [{ type: 'expense', amount: 50, date: '2026-06-05', category: 'Food' }],
            recurringExpenses: [],
            oneTimeExpenses: [],
            settings: {}
        };
        const zeroMetrics = compileReportMetrics('monthly', zeroEarningsDb, '2026-06');
        assert.strictEqual(zeroMetrics.savingsRate, 0);
    });

    await t.test('should attach properties to window in browser environment', () => {
        const fakeWindow = {};
        globalThis.window = fakeWindow;

        delete require.cache[require.resolve('../js/financials.js')];
        require('../js/financials.js');

        assert.ok(fakeWindow.AppFinancials);
        assert.strictEqual(typeof fakeWindow.getMonthFinancials, 'function');
        assert.strictEqual(typeof fakeWindow.compileReportMetrics, 'function');
        assert.strictEqual(typeof fakeWindow.generateInsightItems, 'function');

        delete globalThis.window;
    });
});
