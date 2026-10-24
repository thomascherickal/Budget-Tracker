/**
 * Sovereign Budget - UI Helpers & Modal Manager
 * Toast notifications, modal lifecycles, form option synchronization,
 * and DOM currency label updates.
 */

/**
 * Renders a floating notification toast.
 * @param {string} message
 * @param {'info'|'success'|'error'|'warning'} [type='info']
 * @param {string} [containerId='toast-container']
 * @returns {HTMLElement|null} Created toast element
 */
function showToast(message, type = 'info', containerId = 'toast-container') {
    if (typeof document === 'undefined') return null;

    const container = document.getElementById(containerId);
    if (!container) return null;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let iconName = 'info';
    if (type === 'success') iconName = 'check-circle';
    if (type === 'error') iconName = 'alert-triangle';
    if (type === 'warning') iconName = 'alert-circle';

    toast.innerHTML = `<i data-lucide="${iconName}"></i> <span>${message}</span>`;
    container.appendChild(toast);

    if (typeof lucide !== 'undefined' && typeof lucide.createIcons === 'function') {
        lucide.createIcons();
    }

    setTimeout(() => {
        if (toast && toast.parentNode) {
            toast.remove();
        }
    }, 4300);

    return toast;
}

/**
 * Toggles visibility of the auto-save status indicator.
 * @param {boolean} show
 * @param {string} [elementId='save-status']
 */
function showSaveIndicator(show, elementId = 'save-status') {
    if (typeof document === 'undefined') return;
    const container = document.getElementById(elementId);
    if (!container) return;

    if (show) {
        container.classList.remove('hidden');
    } else {
        container.classList.add('hidden');
    }
}

/**
 * Opens a modal dialog by removing the hidden class.
 * @param {string} modalId
 */
function openModal(modalId) {
    if (typeof document === 'undefined') return;
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');
    }
}

/**
 * Closes all active modal dialogs.
 */
function closeAllModals() {
    if (typeof document === 'undefined') return;
    document.querySelectorAll('.modal-backdrop').forEach(modal => {
        modal.classList.add('hidden');
    });
}

/**
 * Updates all DOM elements with the class 'currency-symbol' to the specified symbol.
 * @param {string} symbol - Currency symbol string (e.g. '$', '€', '₹')
 */
function updateCurrencySymbolsUI(symbol) {
    if (typeof document === 'undefined') return;
    const sym = symbol || '$';
    document.querySelectorAll('.currency-symbol').forEach(el => {
        el.textContent = sym;
    });
}

/**
 * Synchronizes select options for transaction categories based on type ('income' or 'expense').
 * @param {'income'|'expense'} typeSelectValue
 * @param {string} categorySelectId - DOM id of the target select element
 * @param {string[]} [incomeCats]
 * @param {string[]} [expenseCats]
 */
function syncFormCategoryOptions(typeSelectValue, categorySelectId, incomeCats, expenseCats) {
    if (typeof document === 'undefined') return;
    const select = document.getElementById(categorySelectId);
    if (!select) return;

    const defaultIncome = (typeof INCOME_CATEGORIES !== 'undefined') ? INCOME_CATEGORIES : ['Salary', 'Freelance', 'Investment', 'Other'];
    const defaultExpense = (typeof EXPENSE_CATEGORIES !== 'undefined') ? EXPENSE_CATEGORIES : ['Food', 'Housing', 'Utilities', 'Transportation', 'Entertainment', 'Shopping', 'Healthcare', 'Education', 'Insurance', 'Subscriptions', 'Debt', 'Other'];

    const incomes = incomeCats || defaultIncome;
    const expenses = expenseCats || defaultExpense;

    const categories = typeSelectValue === 'income' ? incomes : expenses;
    select.innerHTML = categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
}

/**
 * Computes new month string 'YYYY-MM' given a current month and offset (+1 or -1).
 * Pure month arithmetic function.
 * @param {string} currentMonth - 'YYYY-MM'
 * @param {number} direction - +1 or -1
 * @returns {string} New 'YYYY-MM' string
 */
function calculateNextMonth(currentMonth, direction) {
    const defaultMonth = new Date().toISOString().slice(0, 7);
    const validMonth = (currentMonth && currentMonth.length === 7) ? currentMonth : defaultMonth;

    let year = parseInt(validMonth.slice(0, 4), 10);
    let month = parseInt(validMonth.slice(5, 7), 10);

    month += direction;
    if (month > 12) {
        month = 1;
        year += 1;
    } else if (month < 1) {
        month = 12;
        year -= 1;
    }

    return `${year}-${String(month).padStart(2, '0')}`;
}

/**
 * Formats a 'YYYY-MM' string into a friendly title, e.g. 'June 2026'.
 * @param {string} monthStr
 * @returns {string}
 */
function formatMonthLabel(monthStr) {
    if (!monthStr || monthStr.length < 7) {
        monthStr = new Date().toISOString().slice(0, 7);
    }
    const year = parseInt(monthStr.slice(0, 4), 10);
    const month = parseInt(monthStr.slice(5, 7), 10) - 1;
    const dateObj = new Date(year, month, 1);
    return dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

// Universal export pattern
const AppUI = {
    showToast,
    showSaveIndicator,
    openModal,
    closeAllModals,
    updateCurrencySymbolsUI,
    syncFormCategoryOptions,
    calculateNextMonth,
    formatMonthLabel
};

if (typeof window !== 'undefined') {
    window.AppUI = AppUI;
    window.showToast = showToast;
    window.showSaveIndicator = showSaveIndicator;
    window.openModal = openModal;
    window.closeAllModals = closeAllModals;
    window.updateCurrencySymbolsUI = updateCurrencySymbolsUI;
    window.syncFormCategoryOptions = syncFormCategoryOptions;
    window.calculateNextMonth = calculateNextMonth;
    window.formatMonthLabel = formatMonthLabel;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = AppUI;
}
