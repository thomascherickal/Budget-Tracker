const assert = require('assert');
const test = require('node:test');
const { getMonthFinancialsGlobal } = require('../app.js');

test('Financial Calculations Suite', async (t) => {
    // Helper to generate a clean mock database state
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
                { id: 'one-2', name: 'Ski trip', amount: 400, date: '2026-07-15', category: 'Entertainment' } // different month
            ],
            transactions: [
                { id: 'tx-1', type: 'income', date: '2026-06-01', description: 'Salary', amount: 3000, category: 'Salary' },
                { id: 'tx-2', type: 'income', date: '2026-06-15', description: 'Freelance', amount: 500, category: 'Freelance' },
                { id: 'tx-3', type: 'expense', date: '2026-06-05', description: 'Groceries', amount: 150, category: 'Food' },
                { id: 'tx-4', type: 'expense', date: '2026-06-20', description: 'Dinner', amount: 50, category: 'Food' },
                { id: 'tx-5', type: 'expense', date: '2026-07-02', description: 'Next month groceries', amount: 100, category: 'Food' } // different month
            ]
        };
    }

    await t.test('should calculate financials correctly for a specific month', () => {
        const db = getMockDb();
        const monthStr = '2026-06';
        
        const financials = getMonthFinancialsGlobal(monthStr, db);
        
        // Calculations verification:
        // Income in June: tx-1 (3000) + tx-2 (500) = 3500
        assert.strictEqual(financials.totalIncome, 3500);
        
        // Logged variable expenses in June: tx-3 (150) + tx-4 (50) = 200
        assert.strictEqual(financials.loggedExpenses, 200);
        
        // Recurring total: rec-1 (1200) + rec-2 (15) = 1215
        assert.strictEqual(financials.recurringTotal, 1215);
        
        // One-time planned expenses in June: one-1 (200) = 200
        assert.strictEqual(financials.onetimeTotal, 200);
        
        // Total expenses: logged (200) + recurring (1215) + onetime (200) = 1615
        assert.strictEqual(financials.totalExpenses, 1615);
        
        // Savings requirement: 500
        assert.strictEqual(financials.savingsRequirement, 500);
        
        // Actual surplus: Income (3500) - Expenses (1615) = 1885
        assert.strictEqual(financials.actualSurplus, 1885);
        
        // Net balance (Discretionary balance after savings goal): Income (3500) - Expenses (1615) - Savings (500) = 1385
        assert.strictEqual(financials.netBalance, 1385);
        
        // Savings progress: since actual surplus (1885) >= savings requirement (500), it should be 100%
        assert.strictEqual(financials.savingsProgressPct, 100);
    });

    await t.test('should compute correct savings progress when surplus is below the requirement', () => {
        const db = getMockDb();
        // Modify savings requirement to be higher than surplus
        db.settings.savingsRequirement = 2000;
        
        const monthStr = '2026-06';
        const financials = getMonthFinancialsGlobal(monthStr, db);
        
        // Surplus is 1885. Requirement is 2000.
        // Progress percentage: (1885 / 2000) * 100 = 94.25%
        assert.strictEqual(financials.savingsProgressPct, 94.25);
        
        // Net balance should be negative: 3500 (income) - 1615 (expenses) - 2000 (savings req) = -115
        assert.strictEqual(financials.netBalance, -115);
    });

    await t.test('should clamp savings progress to 0% if actual surplus is negative', () => {
        const db = getMockDb();
        // Add a huge expense to make surplus negative
        db.transactions.push({
            id: 'tx-huge',
            type: 'expense',
            date: '2026-06-25',
            description: 'Emergency repair',
            amount: 3000,
            category: 'Other'
        });
        
        const monthStr = '2026-06';
        const financials = getMonthFinancialsGlobal(monthStr, db);
        
        // Income: 3500. Total expenses: 1615 + 3000 = 4615.
        // Actual surplus: -1115.
        assert.strictEqual(financials.actualSurplus, -1115);
        // Savings progress percentage should be clamped to 0
        assert.strictEqual(financials.savingsProgressPct, 0);
    });

    await t.test('should return 100% savings progress if savings requirement is 0', () => {
        const db = getMockDb();
        db.settings.savingsRequirement = 0;
        
        const monthStr = '2026-06';
        const financials = getMonthFinancialsGlobal(monthStr, db);
        
        assert.strictEqual(financials.savingsProgressPct, 100);
    });
});
