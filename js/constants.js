/**
 * Sovereign Budget - Application Constants
 * Core configuration keys, taxonomies, and UI definitions.
 */

const CACHE_KEY = 'sovereign_budget_cache';
const AUTOSAVE_KEY = 'sovereign_budget_autosave_json';
const EXIT_TIMESTAMP_KEY = 'sovereign_budget_exit_timestamp';
const APP_VERSION = '1.0.0';

const EXPENSE_CATEGORIES = [
    'Food',
    'Housing',
    'Utilities',
    'Transportation',
    'Entertainment',
    'Shopping',
    'Healthcare',
    'Education',
    'Insurance',
    'Subscriptions',
    'Debt',
    'Other'
];

const INCOME_CATEGORIES = [
    'Salary',
    'Freelance',
    'Investment',
    'Other'
];

const CHART_PALETTE = [
    '#6366f1', // Indigo
    '#ec4899', // Pink
    '#14b8a6', // Teal
    '#f59e0b', // Amber
    '#3b82f6', // Blue
    '#a855f7', // Purple
    '#f43f5e', // Rose
    '#10b981', // Emerald
    '#84cc16', // Lime
    '#06b6d4', // Cyan
    '#e11d48', // Dark Rose
    '#6b7280'  // Grey
];

const TAB_TITLES = {
    'dashboard': 'Dashboard',
    'recurring-expenses': 'Fixed Commitments & Savings',
    'transaction-log': 'Transactions Audit Log',
    'reports': 'Reports & Financial Insights'
};

// Universal export pattern
const AppConstants = {
    CACHE_KEY,
    AUTOSAVE_KEY,
    EXIT_TIMESTAMP_KEY,
    APP_VERSION,
    EXPENSE_CATEGORIES,
    INCOME_CATEGORIES,
    CHART_PALETTE,
    TAB_TITLES
};

if (typeof window !== 'undefined') {
    window.AppConstants = AppConstants;
    window.CACHE_KEY = CACHE_KEY;
    window.AUTOSAVE_KEY = AUTOSAVE_KEY;
    window.EXIT_TIMESTAMP_KEY = EXIT_TIMESTAMP_KEY;
    window.APP_VERSION = APP_VERSION;
    window.EXPENSE_CATEGORIES = EXPENSE_CATEGORIES;
    window.INCOME_CATEGORIES = INCOME_CATEGORIES;
    window.CHART_PALETTE = CHART_PALETTE;
    window.TAB_TITLES = TAB_TITLES;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = AppConstants;
}
