/**
 * Sovereign Budget - Financial Engine
 * Core financial calculations, aggregations, report metrics, and diagnostic insights.
 */

/**
 * Aggregates monthly figures for income, recurring expenses, planned one-time expenses,
 * logged expenses, and savings goal progress.
 * @param {string} monthStr - Month in 'YYYY-MM' format
 * @param {object} db - Database state object
 * @returns {object} Aggregated financials
 */
function getMonthFinancials(monthStr, db) {
    if (!db) {
        throw new Error('Database state is required');
    }

    const transactions = Array.isArray(db.transactions) ? db.transactions : [];
    const recurringExpenses = Array.isArray(db.recurringExpenses) ? db.recurringExpenses : [];
    const oneTimeExpenses = Array.isArray(db.oneTimeExpenses) ? db.oneTimeExpenses : [];
    const settings = db.settings || {};

    // 1. Logged Income
    const loggedIncome = transactions
        .filter(tx => tx.type === 'income' && tx.date && tx.date.startsWith(monthStr))
        .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);

    // 2. Logged Variable Expenses
    const loggedExpenses = transactions
        .filter(tx => tx.type === 'expense' && tx.date && tx.date.startsWith(monthStr))
        .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);

    // 3. Recurring Commitments
    const recurringTotal = recurringExpenses
        .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

    // 4. One-Time planned commitments for this specific month
    const onetimeTotal = oneTimeExpenses
        .filter(item => item.date && item.date.startsWith(monthStr))
        .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

    // Compute aggregations
    const totalIncome = loggedIncome;
    const totalExpenses = loggedExpenses + recurringTotal + onetimeTotal;
    const savingsRequirement = Number(settings.savingsRequirement) || 0;

    // Actual surplus = Income - Expenses
    const actualSurplus = totalIncome - totalExpenses;

    // Net remaining after meeting expenses AND savings requirement
    const netBalance = totalIncome - totalExpenses - savingsRequirement;

    // Savings Progress %
    let savingsProgressPct = 0;
    if (savingsRequirement > 0) {
        savingsProgressPct = Math.max(0, Math.min(100, (actualSurplus / savingsRequirement) * 100));
    } else {
        savingsProgressPct = 100;
    }

    return {
        totalIncome,
        totalExpenses,
        loggedExpenses,
        recurringTotal,
        onetimeTotal,
        savingsRequirement,
        netBalance,
        actualSurplus,
        savingsProgressPct
    };
}

/**
 * Compiles comprehensive analytics metrics for weekly, monthly, or annual scopes.
 * @param {'weekly'|'monthly'|'annual'} scope
 * @param {object} db - Database state object
 * @param {string} currentMonth - Target month 'YYYY-MM'
 * @param {Date} [referenceDate] - Optional reference timestamp for testing
 * @returns {object} Compiled metrics for reports and charts
 */
function compileReportMetrics(scope, db, currentMonth, referenceDate = new Date()) {
    if (!db) {
        throw new Error('Database state is required');
    }

    const transactions = Array.isArray(db.transactions) ? db.transactions : [];
    const recurringExpenses = Array.isArray(db.recurringExpenses) ? db.recurringExpenses : [];
    const oneTimeExpenses = Array.isArray(db.oneTimeExpenses) ? db.oneTimeExpenses : [];

    let earnings = 0;
    let outflows = 0;
    let chartData = [];
    const categorySpend = {};
    let scopeLabel = '';

    if (scope === 'weekly') {
        const now = new Date(referenceDate);
        const weekAgo = new Date(referenceDate);
        weekAgo.setDate(now.getDate() - 7);
        scopeLabel = `From ${weekAgo.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })} to ${now.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}`;

        // Filter transactions within 7 days window
        const txs = transactions.filter(tx => {
            const d = new Date(tx.date);
            return d >= weekAgo && d <= now;
        });

        earnings = txs.filter(t => t.type === 'income').reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
        outflows = txs.filter(t => t.type === 'expense').reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

        // Add proportional weekly recurring commitments
        const weeklyRecurring = recurringExpenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0) * 12 / 52;
        outflows += weeklyRecurring;

        // Organize 7 daily data points
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(now.getDate() - i);
            const dayStr = d.toISOString().slice(0, 10);
            const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });

            const dayInc = txs.filter(t => t.type === 'income' && t.date === dayStr).reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
            const dayExp = txs.filter(t => t.type === 'expense' && t.date === dayStr).reduce((sum, t) => sum + (Number(t.amount) || 0), 0) + (weeklyRecurring / 7);

            days.push({ label: dayLabel, income: dayInc, expense: dayExp });
        }
        chartData = days;

        txs.filter(t => t.type === 'expense').forEach(t => {
            categorySpend[t.category] = (categorySpend[t.category] || 0) + Number(t.amount);
        });
        if (weeklyRecurring > 0) {
            categorySpend['Fixed (Recurring)'] = weeklyRecurring;
        }

    } else if (scope === 'annual') {
        const yearStr = (currentMonth || '').slice(0, 4) || String(referenceDate.getFullYear());
        scopeLabel = `Calendar Year ${yearStr}`;

        const yearTxs = transactions.filter(t => t.date && t.date.startsWith(yearStr));
        earnings = yearTxs.filter(t => t.type === 'income').reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

        const annualRecurring = recurringExpenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0) * 12;
        const yearOnetimes = oneTimeExpenses.filter(item => item.date && item.date.startsWith(yearStr)).reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

        outflows = yearTxs.filter(t => t.type === 'expense').reduce((sum, t) => sum + (Number(t.amount) || 0), 0) + annualRecurring + yearOnetimes;

        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthlyRecurring = annualRecurring / 12;

        chartData = months.map((m, idx) => {
            const prefix = `${yearStr}-${String(idx + 1).padStart(2, '0')}`;
            const monthInc = yearTxs.filter(t => t.type === 'income' && t.date.startsWith(prefix)).reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
            const monthOnetime = oneTimeExpenses.filter(item => item.date && item.date.startsWith(prefix)).reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
            const monthExp = yearTxs.filter(t => t.type === 'expense' && t.date.startsWith(prefix)).reduce((sum, t) => sum + (Number(t.amount) || 0), 0) + monthlyRecurring + monthOnetime;

            return { label: m, income: monthInc, expense: monthExp };
        });

        yearTxs.filter(t => t.type === 'expense').forEach(t => {
            categorySpend[t.category] = (categorySpend[t.category] || 0) + Number(t.amount);
        });
        if (annualRecurring > 0) {
            categorySpend['Fixed Commitments'] = annualRecurring;
        }
        if (yearOnetimes > 0) {
            categorySpend['Planned One-Times'] = yearOnetimes;
        }

    } else {
        // Default: 'monthly'
        const monthStr = currentMonth || new Date().toISOString().slice(0, 7);
        const year = parseInt(monthStr.slice(0, 4));
        const month = parseInt(monthStr.slice(5, 7)) - 1;
        const dateObj = new Date(year, month, 1);
        scopeLabel = dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

        const financials = getMonthFinancials(monthStr, db);
        earnings = financials.totalIncome;
        outflows = financials.totalExpenses;

        transactions
            .filter(t => t.type === 'expense' && t.date && t.date.startsWith(monthStr))
            .forEach(t => {
                categorySpend[t.category] = (categorySpend[t.category] || 0) + Number(t.amount);
            });

        if (financials.recurringTotal > 0) {
            categorySpend['Fixed Commitments'] = financials.recurringTotal;
        }
        if (financials.onetimeTotal > 0) {
            categorySpend['Planned One-Times'] = financials.onetimeTotal;
        }

        const txs = transactions.filter(t => t.date && t.date.startsWith(monthStr));
        const w1Txs = txs.filter(t => parseInt(t.date.slice(8, 10)) <= 7);
        const w2Txs = txs.filter(t => parseInt(t.date.slice(8, 10)) > 7 && parseInt(t.date.slice(8, 10)) <= 14);
        const w3Txs = txs.filter(t => parseInt(t.date.slice(8, 10)) > 14 && parseInt(t.date.slice(8, 10)) <= 21);
        const w4Txs = txs.filter(t => parseInt(t.date.slice(8, 10)) > 21);

        const weeklyBase = (financials.recurringTotal + financials.onetimeTotal) / 4;

        chartData = [
            {
                label: 'Week 1',
                income: w1Txs.filter(t => t.type === 'income').reduce((sum, t) => sum + (Number(t.amount) || 0), 0),
                expense: w1Txs.filter(t => t.type === 'expense').reduce((sum, t) => sum + (Number(t.amount) || 0), 0) + weeklyBase
            },
            {
                label: 'Week 2',
                income: w2Txs.filter(t => t.type === 'income').reduce((sum, t) => sum + (Number(t.amount) || 0), 0),
                expense: w2Txs.filter(t => t.type === 'expense').reduce((sum, t) => sum + (Number(t.amount) || 0), 0) + weeklyBase
            },
            {
                label: 'Week 3',
                income: w3Txs.filter(t => t.type === 'income').reduce((sum, t) => sum + (Number(t.amount) || 0), 0),
                expense: w3Txs.filter(t => t.type === 'expense').reduce((sum, t) => sum + (Number(t.amount) || 0), 0) + weeklyBase
            },
            {
                label: 'Week 4+',
                income: w4Txs.filter(t => t.type === 'income').reduce((sum, t) => sum + (Number(t.amount) || 0), 0),
                expense: w4Txs.filter(t => t.type === 'expense').reduce((sum, t) => sum + (Number(t.amount) || 0), 0) + weeklyBase
            }
        ];
    }

    let savingsRate = 0;
    if (earnings > 0) {
        savingsRate = Math.max(0, ((earnings - outflows) / earnings) * 100);
    }

    return {
        scope,
        scopeLabel,
        earnings,
        outflows,
        savingsRate,
        categorySpend,
        chartData
    };
}

/**
 * Evaluates budget performance and generates actionable diagnostic insights.
 * @param {number} earnings
 * @param {number} outflows
 * @param {number} savingsRate
 * @param {object} categorySpend
 * @param {string} [reportScope='monthly']
 * @param {function} [formatFn] - Formatting function for currency amounts
 * @returns {Array<{ icon: string, class: string, text: string, type: string }>}
 */
function generateInsightItems(earnings, outflows, savingsRate, categorySpend = {}, reportScope = 'monthly', formatFn = (n) => `$${Number(n).toFixed(2)}`) {
    const insights = [];

    if (earnings === 0 && outflows === 0) {
        return [{
            icon: 'info',
            class: 'text-indigo',
            text: 'No transactions logged. Log income and expense logs to generate diagnostics.',
            type: 'empty'
        }];
    }

    if (outflows > earnings) {
        insights.push({
            icon: 'alert-triangle',
            class: 'text-danger',
            text: `<strong>Deficit Alert</strong>: Outflows exceed total earnings by ${formatFn(outflows - earnings)}. Liquid savings will be depleted.`,
            type: 'deficit'
        });
    } else if (savingsRate >= 20) {
        insights.push({
            icon: 'check-circle',
            class: 'text-success',
            text: `<strong>Solid Savings Rate</strong>: Retaining ${Math.round(savingsRate)}% of income meets professional wealth-building thresholds.`,
            type: 'solid-savings'
        });
    } else {
        insights.push({
            icon: 'trending-up',
            class: 'text-warning',
            text: `<strong>Target Increment Plan</strong>: Savings rate of ${Math.round(savingsRate)}% is below the 20% benchmark. Look for subscriptions or shopping items to prune.`,
            type: 'increment-plan'
        });
    }

    // Find largest variable expense category
    let largestCategory = '';
    let largestAmt = 0;

    Object.entries(categorySpend).forEach(([cat, amt]) => {
        if (cat !== 'Fixed Commitments' && cat !== 'Fixed (Recurring)' && amt > largestAmt) {
            largestAmt = amt;
            largestCategory = cat;
        }
    });

    if (largestCategory && largestAmt > 0 && outflows > 0) {
        const pct = Math.round((largestAmt / outflows) * 100);
        insights.push({
            icon: 'pie-chart',
            class: 'text-indigo',
            text: `<strong>Highest Variable Outflow</strong>: Spending on <strong>${largestCategory}</strong> is ${formatFn(largestAmt)} (${pct}% of total outflows).`,
            type: 'highest-variable'
        });
    }

    // Low income / cash flow expansion alert
    if (earnings > 0 && earnings < 1500 && reportScope === 'monthly') {
        insights.push({
            icon: 'briefcase',
            class: 'text-info',
            text: '<strong>Cash Flow Expansion</strong>: Discretionary balance is low. Focus on increasing primary earnings to scale savings.',
            type: 'cashflow-expansion'
        });
    }

    return insights;
}

// Universal export pattern
const AppFinancials = {
    getMonthFinancials,
    compileReportMetrics,
    generateInsightItems
};

if (typeof window !== 'undefined') {
    window.AppFinancials = AppFinancials;
    window.getMonthFinancials = getMonthFinancials;
    window.getMonthFinancialsGlobal = getMonthFinancials; // Backward compatibility alias
    window.compileReportMetrics = compileReportMetrics;
    window.generateInsightItems = generateInsightItems;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        getMonthFinancials,
        getMonthFinancialsGlobal: getMonthFinancials,
        compileReportMetrics,
        generateInsightItems
    };
}
