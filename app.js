/* ==========================================================================
   Sovereign Budget - Application Controller Logic (Cache-only Local Mode)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide Icons
    lucide.createIcons();
    
    // Application State
    const AppState = {
        db: {
            version: '1.0.0',
            lastUpdated: new Date().toISOString(),
            settings: {
                savingsRequirement: 0,
                currency: '' // Will be set to detected currency if empty
            },
            recurringExpenses: [],
            oneTimeExpenses: [],
            transactions: []
        },
        currentMonth: new Date().toISOString().slice(0, 7), // YYYY-MM
        currentTab: 'dashboard',
        reportScope: 'monthly', // weekly, monthly, annual
        charts: {
            category: null,
            trend: null
        },
        currencyCode: 'USD',
        currencySymbol: '$'
    };

    // Constants
    const CACHE_KEY = 'sovereign_budget_cache';
    const EXPENSE_CATEGORIES = ['Food', 'Housing', 'Utilities', 'Transportation', 'Entertainment', 'Shopping', 'Healthcare', 'Education', 'Insurance', 'Subscriptions', 'Debt', 'Other'];
    const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Investment', 'Other'];

    // Map of 210 locales and their default currency codes and symbols
    const LOCALE_CURRENCIES = {
        // North America
        "en-US": ["USD", "$"], "es-US": ["USD", "$"], "en-CA": ["CAD", "$"], "fr-CA": ["CAD", "$"], "es-MX": ["MXN", "$"],
        // Eurozone
        "de-DE": ["EUR", "€"], "fr-FR": ["EUR", "€"], "es-ES": ["EUR", "€"], "it-IT": ["EUR", "€"], "nl-NL": ["EUR", "€"],
        "pt-PT": ["EUR", "€"], "fi-FI": ["EUR", "€"], "el-GR": ["EUR", "€"], "ga-IE": ["EUR", "€"], "de-AT": ["EUR", "€"],
        "fr-BE": ["EUR", "€"], "nl-BE": ["EUR", "€"], "et-EE": ["EUR", "€"], "sk-SK": ["EUR", "€"], "sl-SI": ["EUR", "€"],
        "lv-LV": ["EUR", "€"], "lt-LT": ["EUR", "€"], "mt-MT": ["EUR", "€"], "de-LU": ["EUR", "€"], "fr-LU": ["EUR", "€"],
        "en-IE": ["EUR", "€"], "es-AD": ["EUR", "€"], "fr-MC": ["EUR", "€"], "it-SM": ["EUR", "€"], "it-VA": ["EUR", "€"],
        "fr-GP": ["EUR", "€"], "fr-MQ": ["EUR", "€"], "fr-RE": ["EUR", "€"], "fr-YT": ["EUR", "€"], "fr-GF": ["EUR", "€"],
        // United Kingdom
        "en-GB": ["GBP", "£"], "cy-GB": ["GBP", "£"], "gd-GB": ["GBP", "£"],
        // Europe (Other)
        "ru-RU": ["RUB", "₽"], "uk-UA": ["UAH", "₴"], "pl-PL": ["PLN", "zł"], "cs-CZ": ["CZK", "Kč"], "hu-HU": ["HUF", "Ft"],
        "ro-RO": ["RON", "lei"], "bg-BG": ["BGN", "лв"], "hr-HR": ["EUR", "€"], "sr-RS": ["RSD", "RSD"], "bs-BA": ["BAM", "KM"],
        "mk-MK": ["MKD", "den"], "sq-AL": ["ALL", "L"], "sv-SE": ["SEK", "kr"], "no-NO": ["NOK", "kr"], "nb-NO": ["NOK", "kr"],
        "nn-NO": ["NOK", "kr"], "da-DK": ["DKK", "kr"], "is-IS": ["ISK", "kr"], "tr-TR": ["TRY", "₺"], "az-AZ": ["AZN", "₼"],
        "ka-GE": ["GEL", "₾"], "hy-AM": ["AMD", "֏"], "de-CH": ["CHF", "CHF"], "fr-CH": ["CHF", "CHF"], "it-CH": ["CHF", "CHF"],
        "be-BY": ["BYN", "Br"], "ro-MD": ["MDL", "L"], "sq-XK": ["EUR", "€"], "sr-XK": ["EUR", "€"], "fo-FO": ["DKK", "kr"],
        "kl-GL": ["DKK", "kr"], "gi-GI": ["GIP", "£"],
        // Asia
        "zh-CN": ["CNY", "¥"], "ja-JP": ["JPY", "¥"], "ko-KR": ["KRW", "₩"], "en-IN": ["INR", "₹"], "hi-IN": ["INR", "₹"],
        "bn-IN": ["INR", "₹"], "ta-IN": ["INR", "₹"], "te-IN": ["INR", "₹"], "kn-IN": ["INR", "₹"], "ml-IN": ["INR", "₹"],
        "mr-IN": ["INR", "₹"], "gu-IN": ["INR", "₹"], "pa-IN": ["INR", "₹"], "or-IN": ["INR", "₹"], "as-IN": ["INR", "₹"],
        "ur-IN": ["INR", "₹"], "ur-PK": ["PKR", "₨"], "en-PK": ["PKR", "₨"], "bn-BD": ["BDT", "৳"], "ne-NP": ["NPR", "₨"],
        "si-LK": ["LKR", "₨"], "ta-LK": ["LKR", "₨"], "my-MM": ["MMK", "K"], "th-TH": ["THB", "฿"], "vi-VN": ["VND", "₫"],
        "id-ID": ["IDR", "Rp"], "ms-MY": ["MYR", "RM"], "fil-PH": ["PHP", "₱"], "en-PH": ["PHP", "₱"], "en-SG": ["SGD", "$"],
        "zh-SG": ["SGD", "$"], "zh-HK": ["HKD", "$"], "en-HK": ["HKD", "$"], "zh-TW": ["TWD", "NT$"], "mn-MN": ["MNT", "₮"],
        "km-KH": ["KHR", "៛"], "lo-LA": ["LAK", "₭"], "uz-UZ": ["UZS", "so'm"], "kk-KZ": ["KZT", "₸"], "ky-KG": ["KGS", "сом"],
        "tg-TJ": ["TJS", "SM"], "tk-TM": ["TMT", "T"], "en-PG": ["PGK", "K"], "dz-BT": ["BTN", "Nu."], "dv-MV": ["MVR", "Rf"],
        "tl-TL": ["USD", "$"], "en-FM": ["USD", "$"], "en-MH": ["USD", "$"], "en-PW": ["USD", "$"], "en-SB": ["SBD", "$"],
        "en-VU": ["VUV", "VT"], "en-FJ": ["FJD", "$"], "en-TO": ["TOP", "T$"], "en-WS": ["WST", "WS$"], "en-KI": ["AUD", "$"],
        "en-NR": ["AUD", "$"], "en-TV": ["AUD", "$"],
        // Middle East & North Africa
        "ar-SA": ["SAR", "ر.س"], "ar-AE": ["AED", "د.إ"], "ar-EG": ["EGP", "E£"], "ar-IL": ["ILS", "₪"], "he-IL": ["ILS", "₪"],
        "ar-JO": ["JOD", "د.ا"], "ar-LB": ["LBP", "ل.ل"], "ar-SY": ["SYP", "ل.س"], "ar-IQ": ["IQD", "د.ع"], "ar-KW": ["KWD", "د.ك"],
        "ar-QA": ["QAR", "ر.ق"], "ar-BH": ["BHD", "د.ب"], "ar-OM": ["OMR", "ر.ع"], "ar-YE": ["YER", "ر.ي"], "fa-IR": ["IRR", "﷼"],
        "ar-DZ": ["DZD", "د.ج"], "ar-MA": ["MAD", "د.م."], "ar-TN": ["TND", "د.ت"], "ar-LY": ["LYD", "د.ل"], "ar-SD": ["SDG", "ج.س."],
        "ku-TR": ["TRY", "₺"], "ku-IQ": ["IQD", "د.ع"], "ar-MR": ["MRU", "UM"], "ar-DJ": ["DJF", "Fdj"], "ar-SO": ["SOS", "Sh.So."],
        // South & Central America
        "pt-BR": ["BRL", "R$"], "es-AR": ["ARS", "$"], "es-CO": ["COP", "$"], "es-CL": ["CLP", "$"], "es-PE": ["PEN", "S/."],
        "es-VE": ["VES", "Bs.S"], "es-EC": ["USD", "$"], "es-UY": ["UYU", "$"], "es-PY": ["PYG", "₲"], "es-BO": ["BOB", "Bs."],
        "es-CR": ["CRC", "₡"], "es-PA": ["PAB", "B/."], "es-NI": ["NIO", "C$"], "es-HN": ["HNL", "L"], "es-SV": ["USD", "$"],
        "es-GT": ["GTQ", "Q"], "es-DO": ["DOP", "RD$"], "es-PR": ["USD", "$"], "es-CU": ["CUP", "$"], "en-JM": ["JMD", "$"],
        "en-TT": ["TTD", "$"], "en-BS": ["BSD", "$"], "en-BB": ["BBD", "$"], "en-BZ": ["BZD", "$"], "en-GY": ["GYD", "$"],
        "nl-SR": ["SRD", "$"], "fr-GF": ["EUR", "€"], "es-HN": ["HNL", "L"], "es-PA": ["PAB", "B/."],
        // Africa (Other)
        "en-ZA": ["ZAR", "R"], "af-ZA": ["ZAR", "R"], "zu-ZA": ["ZAR", "R"], "xh-ZA": ["ZAR", "R"], "en-NG": ["NGN", "₦"],
        "yo-NG": ["NGN", "₦"], "ig-NG": ["NGN", "₦"], "ha-NG": ["NGN", "₦"], "sw-KE": ["KES", "KSh"], "en-KE": ["KES", "KSh"],
        "am-ET": ["ETB", "Br"], "en-GH": ["GHS", "GH₵"], "ak-GH": ["GHS", "GH₵"], "fr-CI": ["XOF", "CFA"], "fr-SN": ["XOF", "CFA"],
        "fr-CM": ["XAF", "FCFA"], "fr-CG": ["XAF", "FCFA"], "fr-GA": ["XAF", "FCFA"], "fr-NE": ["XOF", "CFA"], "fr-BF": ["XOF", "CFA"],
        "fr-ML": ["XOF", "CFA"], "fr-BJ": ["XOF", "CFA"], "fr-TG": ["XOF", "CFA"], "fr-MG": ["MGA", "Ar"], "en-UG": ["UGX", "USh"],
        "en-TZ": ["TZS", "TSh"], "sw-TZ": ["TZS", "TSh"], "pt-AO": ["AOA", "Kz"], "pt-MZ": ["MZN", "MT"], "en-ZW": ["USD", "$"],
        "en-ZM": ["ZMW", "ZK"], "en-MW": ["MWK", "MK"], "en-NA": ["NAD", "$"], "en-BW": ["BWP", "P"], "fr-CD": ["CDF", "FC"],
        "en-LR": ["LRD", "$"], "en-SL": ["SLL", "Le"], "en-GM": ["GMD", "D"], "pt-CV": ["CVE", "Esc"], "fr-MU": ["MUR", "₨"],
        "fr-BI": ["BIF", "FBu"], "fr-RW": ["RWF", "FRw"], "fr-DJ": ["DJF", "Fdj"], "en-LS": ["LSL", "L"], "en-SZ": ["SZL", "L"],
        "ar-KM": ["KMF", "CF"], "fr-KM": ["KMF", "CF"], "en-SS": ["SSP", "£"], "ar-SO": ["SOS", "Sh.So."], "en-SO": ["SOS", "Sh.So."],
        "fr-GN": ["GNF", "FG"], "en-GM": ["GMD", "D"], "en-LR": ["LRD", "$"], "en-SL": ["SLL", "Le"],
        // Oceania
        "en-AU": ["AUD", "$"], "en-NZ": ["NZD", "$"]
    };

    function detectUserCurrency() {
        const locale = navigator.language || (navigator.languages && navigator.languages[0]) || 'en-US';
        // Exact match
        if (LOCALE_CURRENCIES[locale]) {
            return { code: LOCALE_CURRENCIES[locale][0], symbol: LOCALE_CURRENCIES[locale][1] };
        }
        // Partial matching by language code
        const lang = locale.split('-')[0];
        for (const loc in LOCALE_CURRENCIES) {
            if (loc.startsWith(lang)) {
                return { code: LOCALE_CURRENCIES[loc][0], symbol: LOCALE_CURRENCIES[loc][1] };
            }
        }
        // Default USD fallback
        return { code: 'USD', symbol: '$' };
    }

    function updateCurrencySymbolsUI() {
        const symbol = AppState.currencySymbol || '$';
        document.querySelectorAll('.currency-symbol').forEach(el => {
            el.textContent = symbol;
        });
    }

    /* ==========================================================================
       1. Database Storage Management (LocalStorage & Backups)
       ========================================================================== */
    
    function getSymbolForCurrency(currencyCode) {
        for (const loc in LOCALE_CURRENCIES) {
            if (LOCALE_CURRENCIES[loc][0] === currencyCode) {
                return LOCALE_CURRENCIES[loc][1];
            }
        }
        return '$';
    }

    function getLocaleForCurrency(currencyCode) {
        for (const loc in LOCALE_CURRENCIES) {
            if (LOCALE_CURRENCIES[loc][0] === currencyCode) {
                return loc;
            }
        }
        return 'en-US';
    }

    function loadData() {
        try {
            const cached = localStorage.getItem(CACHE_KEY);
            if (cached) {
                const parsed = JSON.parse(cached);
                if (parsed.transactions && parsed.recurringExpenses) {
                    AppState.db = parsed;
                    
                    // Sync active settings currency with app properties
                    if (AppState.db.settings.currency) {
                        AppState.currencyCode = AppState.db.settings.currency;
                        AppState.currencySymbol = getSymbolForCurrency(AppState.currencyCode);
                    }
                    return;
                }
            }
        } catch (err) {
            console.error('Failed to parse cached database:', err);
            showToast('Cache read error. Resetting to default state.', 'error');
        }
        
        // Default clean state if none exists
        AppState.db = getCleanDatabaseObject();
        saveData();
    }

    function saveData() {
        showSaveIndicator(true);
        AppState.db.lastUpdated = new Date().toISOString();
        
        try {
            const dataStr = JSON.stringify(AppState.db, null, 2);
            localStorage.setItem(CACHE_KEY, dataStr);
        } catch (err) {
            console.error('Failed to save to localStorage:', err);
            showToast('Auto-save failed! Local cache storage quota exceeded.', 'error');
        }
        
        setTimeout(() => showSaveIndicator(false), 500);
    }

    function getCleanDatabaseObject() {
        return {
            version: '1.0.0',
            lastUpdated: new Date().toISOString(),
            settings: {
                savingsRequirement: 0,
                currency: 'USD'
            },
            recurringExpenses: [],
            oneTimeExpenses: [],
            transactions: []
        };
    }

    function exportDatabaseBackup() {
        const dataStr = JSON.stringify(AppState.db, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        
        const exportFileDefaultName = 'sovereign_budget_backup_' + new Date().toISOString().slice(0, 10) + '.json';
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        showToast('Database backup downloaded.', 'success');
    }

    function handleImportJSON(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const parsed = JSON.parse(e.target.result);
                if (!parsed.transactions || !parsed.recurringExpenses) {
                    throw new Error('Invalid schema: Missing primary transaction array keys.');
                }
                AppState.db = parsed;
                saveData();
                showToast('Database imported successfully.', 'success');
                renderActiveTab();
            } catch (err) {
                showToast('Failed to import database: ' + err.message, 'error');
            }
        };
        reader.readAsText(file);
    }

    /* ==========================================================================
       2. UI Notifications, Modals & Toast Manager
       ========================================================================== */
    function showSaveIndicator(show) {
        const container = document.getElementById('save-status');
        if (show) {
            container.classList.remove('hidden');
        } else {
            container.classList.add('hidden');
        }
    }

    function showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        let iconName = 'info';
        if (type === 'success') iconName = 'check-circle';
        if (type === 'error') iconName = 'alert-triangle';
        if (type === 'warning') iconName = 'alert-circle';
        
        toast.innerHTML = `<i data-lucide="${iconName}"></i> <span>${message}</span>`;
        container.appendChild(toast);
        lucide.createIcons();
        
        setTimeout(() => {
            toast.remove();
        }, 4300);
    }

    function openModal(modalId) {
        document.getElementById(modalId).classList.remove('hidden');
    }

    function closeAllModals() {
        document.querySelectorAll('.modal-backdrop').forEach(modal => {
            modal.classList.add('hidden');
        });
    }

    /* ==========================================================================
       3. Date Formatting & Helpers
       ========================================================================== */
    function formatCurrency(amount) {
        const currencyCode = AppState.db.settings.currency || AppState.currencyCode || 'USD';
        const formatLocale = getLocaleForCurrency(currencyCode);
        try {
            return new Intl.NumberFormat(formatLocale, {
                style: 'currency',
                currency: currencyCode
            }).format(amount);
        } catch (err) {
            return (AppState.currencySymbol || '$') + amount.toFixed(2);
        }
    }

    function updateMonthDisplay() {
        const year = parseInt(AppState.currentMonth.slice(0, 4));
        const month = parseInt(AppState.currentMonth.slice(5, 7)) - 1;
        const dateObj = new Date(year, month, 1);
        
        const monthLabel = dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        document.getElementById('current-month-display').textContent = monthLabel;
        
        // Synchronize all date inputs to point to the active month by default
        const now = new Date();
        const dateString = AppState.currentMonth === now.toISOString().slice(0, 7) 
            ? now.toISOString().slice(0, 10) 
            : `${AppState.currentMonth}-01`;
            
        document.getElementById('quick-date').value = dateString;
        document.getElementById('modal-date').value = dateString;
    }

    function handleMonthChange(direction) {
        let year = parseInt(AppState.currentMonth.slice(0, 4));
        let month = parseInt(AppState.currentMonth.slice(5, 7));
        
        month += direction;
        if (month > 12) {
            month = 1;
            year += 1;
        } else if (month < 1) {
            month = 12;
            year -= 1;
        }
        
        AppState.currentMonth = `${year}-${String(month).padStart(2, '0')}`;
        updateMonthDisplay();
        renderActiveTab();
    }

    /* ==========================================================================
       4. Financial Calculations & State Sync
       ========================================================================== */
    function getMonthFinancials(monthStr) {
        // 1. Logged Income
        const loggedIncome = AppState.db.transactions
            .filter(tx => tx.type === 'income' && tx.date.startsWith(monthStr))
            .reduce((sum, tx) => sum + tx.amount, 0);

        // 2. Logged Variable Expenses
        const loggedExpenses = AppState.db.transactions
            .filter(tx => tx.type === 'expense' && tx.date.startsWith(monthStr))
            .reduce((sum, tx) => sum + tx.amount, 0);

        // 3. Recurring Commitments
        const recurringTotal = AppState.db.recurringExpenses
            .reduce((sum, item) => sum + item.amount, 0);

        // 4. One-Time planned commitments for this specific month
        const onetimeTotal = AppState.db.oneTimeExpenses
            .filter(item => item.date.startsWith(monthStr))
            .reduce((sum, item) => sum + item.amount, 0);

        // Compute aggregations
        const totalIncome = loggedIncome;
        const totalExpenses = loggedExpenses + recurringTotal + onetimeTotal;
        const savingsRequirement = AppState.db.settings.savingsRequirement || 0;
        
        // Net remaining after meeting expenses AND savings requirement
        const netBalance = totalIncome - totalExpenses - savingsRequirement;
        
        // Actual surplus = Income - Expenses
        const actualSurplus = totalIncome - totalExpenses;
        
        // Savings Progress %
        let savingsProgressPct = 0;
        if (savingsRequirement > 0) {
            // Calculate progress based on actual surplus
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

    /* ==========================================================================
       5. Render Modules for Panels
       ========================================================================== */
    
    // Main Orchestrator
    function renderActiveTab() {
        // Toggle view
        document.querySelectorAll('.tab-panel').forEach(panel => {
            panel.classList.remove('active');
        });
        document.getElementById(`tab-${AppState.currentTab}`).classList.add('active');
        
        // Set Header Title
        const tabTitleMap = {
            'dashboard': 'Dashboard',
            'recurring-expenses': 'Fixed Commitments & Savings',
            'transaction-log': 'Transactions Audit Log',
            'reports': 'Reports & Financial Insights'
        };
        document.getElementById('page-title').textContent = tabTitleMap[AppState.currentTab] || 'Sovereign Budget';

        // Render target module
        if (AppState.currentTab === 'dashboard') {
            renderDashboard();
        } else if (AppState.currentTab === 'recurring-expenses') {
            renderBudgetManager();
        } else if (AppState.currentTab === 'transaction-log') {
            renderTransactionsLog();
        } else if (AppState.currentTab === 'reports') {
            renderReports();
        }
    }

    // 5.1 Dashboard Render
    function renderDashboard() {
        const financials = getMonthFinancials(AppState.currentMonth);
        
        // Update stats cards
        document.getElementById('stat-total-income').textContent = formatCurrency(financials.totalIncome);
        document.getElementById('stat-total-expenses').textContent = formatCurrency(financials.totalExpenses);
        
        // Detail values for subtitle
        document.getElementById('stat-expense-sub').textContent = 
            `Fixed: ${formatCurrency(financials.recurringTotal + financials.onetimeTotal)} | Variable: ${formatCurrency(financials.loggedExpenses)}`;
            
        // Savings goal UI
        const savingsReqVal = financials.savingsRequirement;
        document.getElementById('stat-savings-sub').textContent = `Goal: ${formatCurrency(savingsReqVal)}`;
        
        if (savingsReqVal > 0) {
            document.getElementById('stat-savings-progress').textContent = `${Math.round(financials.savingsProgressPct)}%`;
            document.getElementById('savings-progress-ratio').textContent = `${formatCurrency(Math.max(0, financials.actualSurplus))} / ${formatCurrency(savingsReqVal)}`;
            document.getElementById('savings-progress-bar').style.width = `${financials.savingsProgressPct}%`;
            
            if (financials.actualSurplus >= savingsReqVal) {
                document.getElementById('savings-status-message').textContent = 'Amazing! You have fully satisfied your savings requirement for this month!';
                document.getElementById('savings-status-message').className = 'text-sm text-success';
            } else if (financials.actualSurplus > 0) {
                const remaining = savingsReqVal - financials.actualSurplus;
                document.getElementById('savings-status-message').textContent = `You need ${formatCurrency(remaining)} more in net surplus to achieve your target.`;
                document.getElementById('savings-status-message').className = 'text-sm text-warning';
            } else {
                document.getElementById('savings-status-message').textContent = 'No current savings surplus. Keep expenses low or log more earnings.';
                document.getElementById('savings-status-message').className = 'text-sm text-danger';
            }
        } else {
            document.getElementById('stat-savings-progress').textContent = 'N/A';
            document.getElementById('savings-progress-ratio').textContent = 'No target';
            document.getElementById('savings-progress-bar').style.width = '0%';
            document.getElementById('savings-status-message').textContent = 'Define a monthly savings requirement in the "Fixed & Savings" tab to track goal progress.';
            document.getElementById('savings-status-message').className = 'text-sm text-muted';
        }
        
        // Net balance UI styling
        const balanceEl = document.getElementById('stat-net-balance');
        balanceEl.textContent = formatCurrency(financials.netBalance);
        if (financials.netBalance < 0) {
            balanceEl.className = 'stat-value text-danger';
            document.getElementById('stat-balance-sub').textContent = 'Outflows & savings exceed inflows!';
        } else {
            balanceEl.className = 'stat-value text-success';
            document.getElementById('stat-balance-sub').textContent = 'Available discretionary budget';
        }
        
        // Recent transaction list rendering (last 5 items)
        const recentListContainer = document.getElementById('recent-transactions-list');
        const monthTx = AppState.db.transactions
            .filter(tx => tx.date.startsWith(AppState.currentMonth))
            .sort((a, b) => new Date(b.date) - new Date(a.date)) // descending date
            .slice(0, 5);
            
        if (monthTx.length === 0) {
            recentListContainer.innerHTML = `
                <div class="empty-state">
                    <i data-lucide="receipt" class="empty-icon"></i>
                    <p>No transactions logged for this month yet.</p>
                </div>
            `;
            lucide.createIcons();
            return;
        }
        
        recentListContainer.innerHTML = monthTx.map(tx => {
            const isIncome = tx.type === 'income';
            const iconName = isIncome ? 'arrow-up-right' : 'arrow-down-left';
            const iconClass = isIncome ? 'tx-icon-income' : 'tx-icon-expense';
            const valueClass = isIncome ? 'tx-val-income' : 'tx-val-expense';
            const prefix = isIncome ? '+' : '-';
            const parsedDate = new Date(tx.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
            
            return `
                <div class="transaction-item">
                    <div class="tx-left">
                        <div class="tx-icon ${iconClass}">
                            <i data-lucide="${iconName}"></i>
                        </div>
                        <div class="tx-details">
                            <span class="tx-desc">${tx.description}</span>
                            <span class="tx-meta">${parsedDate} <span class="tx-category-badge">${tx.category}</span></span>
                        </div>
                    </div>
                    <div class="tx-right">
                        <span class="tx-val ${valueClass}">${prefix}${formatCurrency(tx.amount)}</span>
                    </div>
                </div>
            `;
        }).join('');
        
        lucide.createIcons();
    }

    // 5.2 Budget & Commitments Manager Render
    function renderBudgetManager() {
        // Set value in form
        document.getElementById('savings-requirement-amount').value = AppState.db.settings.savingsRequirement || 0;
        
        // Render Monthly Recurring table
        const recTbody = document.getElementById('recurring-list-tbody');
        if (AppState.db.recurringExpenses.length === 0) {
            recTbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted">No monthly recurring expenses defined.</td></tr>`;
        } else {
            recTbody.innerHTML = AppState.db.recurringExpenses.map(item => `
                <tr>
                    <td><strong>${item.name}</strong></td>
                    <td><span class="tx-category-badge">${item.category}</span></td>
                    <td>${formatCurrency(item.amount)}</td>
                    <td class="text-center">
                        <button class="btn-delete-row btn-delete-recurring" data-id="${item.id}">
                            <i data-lucide="trash-2"></i>
                        </button>
                    </td>
                </tr>
            `).join('');
        }
        
        // Render One-time planned expenses table (only for active month)
        const otTbody = document.getElementById('onetime-list-tbody');
        const activeMonthOnetimes = AppState.db.oneTimeExpenses.filter(item => item.date.startsWith(AppState.currentMonth));
        
        if (activeMonthOnetimes.length === 0) {
            otTbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">No planned one-time expenses for this month.</td></tr>`;
        } else {
            otTbody.innerHTML = activeMonthOnetimes.map(item => {
                const parsedDate = new Date(item.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
                return `
                    <tr>
                        <td><strong>${item.name}</strong></td>
                        <td>${parsedDate}</td>
                        <td><span class="tx-category-badge">${item.category}</span></td>
                        <td>${formatCurrency(item.amount)}</td>
                        <td class="text-center">
                            <button class="btn-delete-row btn-delete-onetime" data-id="${item.id}">
                                <i data-lucide="trash-2"></i>
                            </button>
                        </td>
                    </tr>
                `;
            }).join('');
        }
        
        // Bind Delete Triggers
        document.querySelectorAll('.btn-delete-recurring').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                AppState.db.recurringExpenses = AppState.db.recurringExpenses.filter(x => x.id !== id);
                saveData();
                showToast('Recurring expense deleted.', 'info');
                renderBudgetManager();
            });
        });
        
        document.querySelectorAll('.btn-delete-onetime').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                AppState.db.oneTimeExpenses = AppState.db.oneTimeExpenses.filter(x => x.id !== id);
                saveData();
                showToast('One-time planned expense deleted.', 'info');
                renderBudgetManager();
            });
        });
        
        lucide.createIcons();
    }

    // 5.3 Transaction Logs Table Render
    function renderTransactionsLog() {
        const tbody = document.getElementById('log-list-tbody');
        const searchVal = document.getElementById('log-search').value.toLowerCase();
        const typeFilter = document.getElementById('filter-type').value;
        const catFilter = document.getElementById('filter-category').value;
        
        // 1. Collect all categories for select input filter list
        const categoriesSet = new Set(AppState.db.transactions.map(t => t.category));
        const catSelect = document.getElementById('filter-category');
        const prevSelected = catSelect.value;
        
        catSelect.innerHTML = '<option value="all">All Categories</option>' + 
            Array.from(categoriesSet).map(cat => `<option value="${cat}">${cat}</option>`).join('');
        catSelect.value = prevSelected;
        
        // 2. Filter transactions list (active month only)
        let filtered = AppState.db.transactions.filter(tx => tx.date.startsWith(AppState.currentMonth));
        
        if (searchVal) {
            filtered = filtered.filter(tx => tx.description.toLowerCase().includes(searchVal));
        }
        
        if (typeFilter !== 'all') {
            filtered = filtered.filter(tx => tx.type === typeFilter);
        }
        
        if (catFilter !== 'all' && catFilter) {
            filtered = filtered.filter(tx => tx.category === catFilter);
        }
        
        // Sort by date descending
        filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Render rows
        document.getElementById('log-count').textContent = `Showing ${filtered.length} transactions`;
        
        if (filtered.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted">No transactions match filters.</td></tr>`;
            return;
        }
        
        tbody.innerHTML = filtered.map(tx => {
            const isIncome = tx.type === 'income';
            const badgeClass = isIncome ? 'badge-connected' : 'badge-disconnected';
            const valClass = isIncome ? 'text-success' : 'text-danger';
            const parsedDate = new Date(tx.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
            
            return `
                <tr>
                    <td>${parsedDate}</td>
                    <td><strong>${tx.description}</strong></td>
                    <td><span class="tx-category-badge">${tx.category}</span></td>
                    <td><span class="badge ${badgeClass}">${tx.type}</span></td>
                    <td class="text-right ${valClass}"><strong>${isIncome ? '+' : '-'}${formatCurrency(tx.amount)}</strong></td>
                    <td class="text-center">
                        <button class="btn-delete-row btn-delete-tx" data-id="${tx.id}">
                            <i data-lucide="trash-2"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
        
        // Bind Delete row triggers
        document.querySelectorAll('.btn-delete-tx').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                AppState.db.transactions = AppState.db.transactions.filter(x => x.id !== id);
                saveData();
                showToast('Transaction deleted successfully.', 'info');
                renderTransactionsLog();
            });
        });
        
        lucide.createIcons();
    }

    // 5.4 Reports & Analytics Render
    function renderReports() {
        const scope = AppState.reportScope;
        
        // Compile reports analytics data
        let earnings = 0;
        let outflows = 0;
        let chartData = [];
        let categorySpend = {};
        
        const now = new Date();
        let scopeLabel = '';
        
        if (scope === 'weekly') {
            // Get last 7 days
            const weekAgo = new Date();
            weekAgo.setDate(now.getDate() - 7);
            scopeLabel = `From ${weekAgo.toLocaleDateString('en-US', {day:'numeric', month:'short'})} to ${now.toLocaleDateString('en-US', {day:'numeric', month:'short', year:'numeric'})}`;
            
            // Collect transactions within 7 days
            const txs = AppState.db.transactions.filter(tx => {
                const d = new Date(tx.date);
                return d >= weekAgo && d <= now;
            });
            
            earnings = txs.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
            outflows = txs.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
            
            // Add proportional weekly recurring and planned one-times
            const weeklyRecurring = AppState.db.recurringExpenses.reduce((sum, item) => sum + item.amount, 0) * 12 / 52;
            outflows += weeklyRecurring;
            
            // Organize chartData by day
            const days = [];
            for (let i = 6; i >= 0; i--) {
                const d = new Date();
                d.setDate(now.getDate() - i);
                const dayStr = d.toISOString().slice(0, 10);
                const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
                
                const dayInc = txs.filter(t => t.type === 'income' && t.date === dayStr).reduce((sum, t) => sum + t.amount, 0);
                const dayExp = txs.filter(t => t.type === 'expense' && t.date === dayStr).reduce((sum, t) => sum + t.amount, 0) + (weeklyRecurring / 7);
                
                days.push({ label: dayLabel, income: dayInc, expense: dayExp });
            }
            chartData = days;
            
            // Category breakdowns
            txs.filter(t => t.type === 'expense').forEach(t => {
                categorySpend[t.category] = (categorySpend[t.category] || 0) + t.amount;
            });
            if (weeklyRecurring > 0) {
                categorySpend['Fixed (Recurring)'] = weeklyRecurring;
            }
            
        } else if (scope === 'monthly') {
            // Active Month
            scopeLabel = document.getElementById('current-month-display').textContent;
            
            const monthStr = AppState.currentMonth;
            const financials = getMonthFinancials(monthStr);
            earnings = financials.totalIncome;
            outflows = financials.totalExpenses;
            
            // Category breakdowns
            AppState.db.transactions
                .filter(t => t.type === 'expense' && t.date.startsWith(monthStr))
                .forEach(t => {
                    categorySpend[t.category] = (categorySpend[t.category] || 0) + t.amount;
                });
                
            if (financials.recurringTotal > 0) {
                categorySpend['Fixed Commitments'] = financials.recurringTotal;
            }
            if (financials.onetimeTotal > 0) {
                categorySpend['Planned One-Times'] = financials.onetimeTotal;
            }
            
            // Build trend chart data split by weeks
            const txs = AppState.db.transactions.filter(t => t.date.startsWith(monthStr));
            const w1Txs = txs.filter(t => parseInt(t.date.slice(8, 10)) <= 7);
            const w2Txs = txs.filter(t => parseInt(t.date.slice(8, 10)) > 7 && parseInt(t.date.slice(8, 10)) <= 14);
            const w3Txs = txs.filter(t => parseInt(t.date.slice(8, 10)) > 14 && parseInt(t.date.slice(8, 10)) <= 21);
            const w4Txs = txs.filter(t => parseInt(t.date.slice(8, 10)) > 21);
            
            const weeklyBase = (financials.recurringTotal + financials.onetimeTotal) / 4;
            
            chartData = [
                {
                    label: 'Week 1',
                    income: w1Txs.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0),
                    expense: w1Txs.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0) + weeklyBase
                },
                {
                    label: 'Week 2',
                    income: w2Txs.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0),
                    expense: w2Txs.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0) + weeklyBase
                },
                {
                    label: 'Week 3',
                    income: w3Txs.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0),
                    expense: w3Txs.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0) + weeklyBase
                },
                {
                    label: 'Week 4+',
                    income: w4Txs.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0),
                    expense: w4Txs.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0) + weeklyBase
                }
            ];
            
        } else if (scope === 'annual') {
            // Calendar Year
            const yearStr = AppState.currentMonth.slice(0, 4);
            scopeLabel = `Calendar Year ${yearStr}`;
            
            // Aggregate all transactions for this year
            const yearTxs = AppState.db.transactions.filter(t => t.date.startsWith(yearStr));
            earnings = yearTxs.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
            
            // Aggregated recurring expenses (multiplied by 12 months)
            const annualRecurring = AppState.db.recurringExpenses.reduce((sum, item) => sum + item.amount, 0) * 12;
            const yearOnetimes = AppState.db.oneTimeExpenses.filter(item => item.date.startsWith(yearStr)).reduce((sum, item) => sum + item.amount, 0);
            
            outflows = yearTxs.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0) + annualRecurring + yearOnetimes;
            
            // Build trend chart data month-by-month
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const monthlyRecurring = annualRecurring / 12;
            
            chartData = months.map((m, idx) => {
                const prefix = `${yearStr}-${String(idx + 1).padStart(2, '0')}`;
                
                const monthInc = yearTxs.filter(t => t.type === 'income' && t.date.startsWith(prefix)).reduce((sum, t) => sum + t.amount, 0);
                const monthOnetime = AppState.db.oneTimeExpenses.filter(item => item.date.startsWith(prefix)).reduce((sum, item) => sum + item.amount, 0);
                const monthExp = yearTxs.filter(t => t.type === 'expense' && t.date.startsWith(prefix)).reduce((sum, t) => sum + t.amount, 0) + monthlyRecurring + monthOnetime;
                
                return { label: m, income: monthInc, expense: monthExp };
            });
            
            // Category breakdowns
            yearTxs.filter(t => t.type === 'expense').forEach(t => {
                categorySpend[t.category] = (categorySpend[t.category] || 0) + t.amount;
            });
            if (annualRecurring > 0) {
                categorySpend['Fixed Commitments'] = annualRecurring;
            }
            if (yearOnetimes > 0) {
                categorySpend['Planned One-Times'] = yearOnetimes;
            }
        }
        
        // Update key indicators on UI
        document.getElementById('report-scope-display').textContent = scopeLabel;
        document.getElementById('report-total-income').textContent = formatCurrency(earnings);
        document.getElementById('report-total-expenses').textContent = formatCurrency(outflows);
        
        let savingsRate = 0;
        if (earnings > 0) {
            savingsRate = Math.max(0, ((earnings - outflows) / earnings) * 100);
        }
        document.getElementById('report-savings-rate').textContent = `${Math.round(savingsRate)}%`;
        
        // Generate Automated Key Insights
        generateInsights(earnings, outflows, savingsRate, categorySpend);
        
        // Render / Update Charts
        renderCategoryChart(categorySpend);
        renderTrendChart(chartData);
    }

    // 5.4.1 Insights Engine
    function generateInsights(earnings, outflows, savingsRate, categorySpend) {
        const list = document.getElementById('insights-list');
        const insights = [];
        
        if (earnings === 0 && outflows === 0) {
            list.innerHTML = `<li><i data-lucide="info" class="text-indigo"></i> <span>No transactions logged. Log income and expense logs to generate diagnostics.</span></li>`;
            lucide.createIcons();
            return;
        }

        if (outflows > earnings) {
            insights.push({
                icon: 'alert-triangle',
                class: 'text-danger',
                text: `<strong>Deficit Alert</strong>: Outflows exceed total earnings by ${formatCurrency(outflows - earnings)}. Liquid savings will be depleted.`
            });
        } else if (savingsRate >= 20) {
            insights.push({
                icon: 'check-circle',
                class: 'text-success',
                text: `<strong>Solid Savings Rate</strong>: Retaining ${Math.round(savingsRate)}% of income meets professional wealth-building thresholds.`
            });
        } else {
            insights.push({
                icon: 'trending-up',
                class: 'text-warning',
                text: `<strong>Target Increment Plan</strong>: Savings rate of ${Math.round(savingsRate)}% is below the 20% benchmark. Look for subscriptions or shopping items to prune.`
            });
        }

        // Find largest category
        let largestCategory = '';
        let largestAmt = 0;
        
        Object.entries(categorySpend).forEach(([cat, amt]) => {
            if (cat !== 'Fixed Commitments' && cat !== 'Fixed (Recurring)' && amt > largestAmt) {
                largestAmt = amt;
                largestCategory = cat;
            }
        });
        
        if (largestCategory && largestAmt > 0) {
            const pct = Math.round((largestAmt / outflows) * 100);
            insights.push({
                icon: 'pie-chart',
                class: 'text-indigo',
                text: `<strong>Highest Variable Outflow</strong>: Spending on <strong>${largestCategory}</strong> is ${formatCurrency(largestAmt)} (${pct}% of total outflows).`
            });
        }
        
        // Low income alert
        if (earnings > 0 && earnings < 1500 && AppState.reportScope === 'monthly') {
            insights.push({
                icon: 'briefcase',
                class: 'text-info',
                text: `<strong>Cash Flow Expansion</strong>: Discretionary balance is low. Focus on increasing primary earnings to scale savings.`
            });
        }

        list.innerHTML = insights.map(item => `
            <li>
                <i data-lucide="${item.icon}" class="${item.class}"></i>
                <span>${item.text}</span>
            </li>
        `).join('');
        
        lucide.createIcons();
    }

    // 5.4.2 Category breakdown chart (Donut)
    function renderCategoryChart(categoryData) {
        const canvas = document.getElementById('categoryChart');
        if (!canvas) return;
        
        if (AppState.charts.category) {
            AppState.charts.category.destroy();
        }
        
        const labels = Object.keys(categoryData);
        const data = Object.values(categoryData);
        
        if (labels.length === 0) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#6b7280';
            ctx.font = '14px Plus Jakarta Sans';
            ctx.textAlign = 'center';
            ctx.fillText('No expenses logged for breakdown', canvas.width / 2, canvas.height / 2);
            return;
        }

        const palette = [
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

        AppState.charts.category = new Chart(canvas, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: palette.slice(0, labels.length),
                    borderWidth: 1,
                    borderColor: '#111827'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            color: '#9ca3af',
                            font: { family: 'Plus Jakarta Sans', size: 11, weight: '600' },
                            boxWidth: 12
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return ` ${context.label}: ${formatCurrency(context.raw)}`;
                            }
                        }
                    }
                },
                cutout: '65%'
            }
        });
    }

    // 5.4.3 Cash Flow trend chart (Double Bar / Line)
    function renderTrendChart(trendData) {
        const canvas = document.getElementById('trendChart');
        if (!canvas) return;
        
        if (AppState.charts.trend) {
            AppState.charts.trend.destroy();
        }

        const labels = trendData.map(d => d.label);
        const incomes = trendData.map(d => d.income);
        const expenses = trendData.map(d => d.expense);

        AppState.charts.trend = new Chart(canvas, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Total Earnings',
                        data: incomes,
                        backgroundColor: 'rgba(16, 185, 129, 0.75)',
                        borderColor: '#10b981',
                        borderWidth: 1,
                        borderRadius: 4
                    },
                    {
                        label: 'Total Outflows',
                        data: expenses,
                        backgroundColor: 'rgba(244, 63, 94, 0.75)',
                        borderColor: '#f43f5e',
                        borderWidth: 1,
                        borderRadius: 4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        grid: { color: 'rgba(255, 255, 255, 0.03)' },
                        ticks: { color: '#9ca3af', font: { family: 'Plus Jakarta Sans', weight: '600' } }
                    },
                    y: {
                        grid: { color: 'rgba(255, 255, 255, 0.03)' },
                        ticks: {
                            color: '#9ca3af',
                            font: { family: 'Plus Jakarta Sans', weight: '600' },
                            callback: function(value) {
                                return formatCurrency(value).split('.')[0];
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            color: '#9ca3af',
                            font: { family: 'Plus Jakarta Sans', size: 12, weight: '600' }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return ` ${context.dataset.label}: ${formatCurrency(context.raw)}`;
                            }
                        }
                    }
                }
            }
        });
    }

    /* ==========================================================================
       6. Event Handlers & Submissions
       ========================================================================== */
    
    // Tab Navigation
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.nav-item').forEach(x => x.classList.remove('active'));
            e.currentTarget.classList.add('active');
            
            AppState.currentTab = e.currentTarget.getAttribute('data-tab');
            renderActiveTab();
        });
    });
    
    document.querySelector('.btn-view-all').addEventListener('click', () => {
        document.querySelector('.nav-item[data-tab="transaction-log"]').click();
    });

    // Month Selector Hooks
    document.getElementById('btn-prev-month').addEventListener('click', () => handleMonthChange(-1));
    document.getElementById('btn-next-month').addEventListener('click', () => handleMonthChange(1));

    // Data Export & Import Action Triggers
    document.getElementById('btn-export-db').addEventListener('click', exportDatabaseBackup);
    document.getElementById('btn-import-db').addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = handleImportJSON;
        input.click();
    });

    // Dynamic Category Selection helper based on transaction type
    function syncFormCategoryOptions(typeSelectValue, categorySelectId) {
        const select = document.getElementById(categorySelectId);
        const categories = typeSelectValue === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
        
        select.innerHTML = categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
    }

    document.querySelectorAll('input[name="quick-type"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            syncFormCategoryOptions(e.target.value, 'quick-category');
        });
    });

    document.querySelectorAll('input[name="modal-type"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            syncFormCategoryOptions(e.target.value, 'modal-category');
        });
    });

    // Quick Log Form Submission
    document.getElementById('form-quick-log').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const type = document.querySelector('input[name="quick-type"]:checked').value;
        const date = document.getElementById('quick-date').value;
        const description = document.getElementById('quick-description').value.trim();
        const amount = parseFloat(document.getElementById('quick-amount').value);
        const category = document.getElementById('quick-category').value;
        
        if (!date || !description || isNaN(amount) || amount <= 0) {
            showToast('Please verify all entries.', 'warning');
            return;
        }

        const newTx = {
            id: `tx-${Date.now()}`,
            type,
            date,
            description,
            amount,
            category
        };

        AppState.db.transactions.push(newTx);
        saveData();
        
        showToast('Transaction logged successfully!', 'success');
        
        // Reset inputs, preserving type & date
        document.getElementById('quick-description').value = '';
        document.getElementById('quick-amount').value = '';
        
        renderActiveTab();
    });

    // Modal Forms Setup
    document.getElementById('btn-quick-log').addEventListener('click', () => {
        const type = document.querySelector('input[name="modal-type"]:checked').value;
        syncFormCategoryOptions(type, 'modal-category');
        
        const dateInput = document.getElementById('modal-date');
        const now = new Date();
        dateInput.value = AppState.currentMonth === now.toISOString().slice(0, 7) 
            ? now.toISOString().slice(0, 10) 
            : `${AppState.currentMonth}-01`;
            
        openModal('modal-transaction');
    });

    document.querySelectorAll('.btn-close-modal').forEach(btn => {
        btn.addEventListener('click', closeAllModals);
    });

    // Detailed Modal Form Save
    document.getElementById('form-modal-tx').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const type = document.querySelector('input[name="modal-type"]:checked').value;
        const date = document.getElementById('modal-date').value;
        const description = document.getElementById('modal-description').value.trim();
        const amount = parseFloat(document.getElementById('modal-amount').value);
        const category = document.getElementById('modal-category').value;
        
        if (!date || !description || isNaN(amount) || amount <= 0) {
            showToast('Please check form fields.', 'warning');
            return;
        }

        const newTx = {
            id: `tx-${Date.now()}`,
            type,
            date,
            description,
            amount,
            category
        };

        AppState.db.transactions.push(newTx);
        saveData();
        
        showToast('Transaction logged successfully!', 'success');
        closeAllModals();
        
        // Reset modal fields
        document.getElementById('modal-description').value = '';
        document.getElementById('modal-amount').value = '';
        
        renderActiveTab();
    });

    // Savings Requirement Settings Update
    document.getElementById('form-savings-requirement').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const amt = parseFloat(document.getElementById('savings-requirement-amount').value);
        if (isNaN(amt) || amt < 0) {
            showToast('Please enter a valid amount.', 'warning');
            return;
        }

        AppState.db.settings.savingsRequirement = amt;
        saveData();
        showToast('Savings target updated.', 'success');
        renderBudgetManager();
    });

    // Currency Settings Form Submission
    document.getElementById('form-currency-settings').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const selCurrency = document.getElementById('settings-currency-select').value;
        AppState.db.settings.currency = selCurrency;
        AppState.currencyCode = selCurrency;
        AppState.currencySymbol = getSymbolForCurrency(selCurrency);
        
        saveData();
        updateCurrencySymbolsUI();
        showToast('Currency settings updated.', 'success');
        renderActiveTab();
    });

    // Add Recurring Expense Settings Submit
    document.getElementById('form-add-recurring').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = document.getElementById('recurring-name').value.trim();
        const amount = parseFloat(document.getElementById('recurring-amount').value);
        const category = document.getElementById('recurring-category').value;
        
        if (!name || isNaN(amount) || amount <= 0) {
            showToast('Verify form values.', 'warning');
            return;
        }

        const newRec = {
            id: `rec-${Date.now()}`,
            name,
            amount,
            category,
            frequency: 'monthly'
        };

        AppState.db.recurringExpenses.push(newRec);
        saveData();
        showToast('Monthly recurring expense added.', 'success');
        
        document.getElementById('recurring-name').value = '';
        document.getElementById('recurring-amount').value = '';
        
        renderBudgetManager();
    });

    // Add One-Time Planned Expense Settings Submit
    document.getElementById('form-add-onetime').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = document.getElementById('onetime-name').value.trim();
        const amount = parseFloat(document.getElementById('onetime-amount').value);
        const date = document.getElementById('onetime-date').value;
        const category = document.getElementById('onetime-category').value;
        
        if (!name || isNaN(amount) || amount <= 0 || !date) {
            showToast('Verify planned expense fields.', 'warning');
            return;
        }

        const newOt = {
            id: `one-${Date.now()}`,
            name,
            amount,
            date,
            category
        };

        AppState.db.oneTimeExpenses.push(newOt);
        saveData();
        showToast('One-time planned expense added.', 'success');
        
        document.getElementById('onetime-name').value = '';
        document.getElementById('onetime-amount').value = '';
        
        renderBudgetManager();
    });

    // Transaction filter controls listener
    document.getElementById('log-search').addEventListener('input', renderTransactionsLog);
    document.getElementById('filter-type').addEventListener('change', renderTransactionsLog);
    document.getElementById('filter-category').addEventListener('change', renderTransactionsLog);
    document.getElementById('btn-reset-filters').addEventListener('click', () => {
        document.getElementById('log-search').value = '';
        document.getElementById('filter-type').value = 'all';
        document.getElementById('filter-category').value = 'all';
        renderTransactionsLog();
    });

    // Report scope toggle triggers
    document.querySelectorAll('.report-tabs .btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.report-tabs .btn').forEach(x => x.classList.remove('active'));
            e.currentTarget.classList.add('active');
            AppState.reportScope = e.currentTarget.getAttribute('data-scope');
            renderReports();
        });
    });

    /* ==========================================================================
       7. Initialization Orchestration
       ========================================================================== */
    function init() {
        // Detect user currency and symbol based on locale
        const detected = detectUserCurrency();
        AppState.currencyCode = detected.code;
        AppState.currencySymbol = detected.symbol;

        updateMonthDisplay();
        syncFormCategoryOptions('expense', 'quick-category');
        
        // Load data immediately from LocalStorage
        loadData();

        // Initialize state settings currency if not loaded
        if (!AppState.db.settings.currency) {
            AppState.db.settings.currency = AppState.currencyCode;
            saveData();
        }

        // Sync dropdown value to loaded currency settings
        document.getElementById('settings-currency-select').value = AppState.db.settings.currency || AppState.currencyCode || 'USD';

        // Sync custom currency indicators in DOM
        updateCurrencySymbolsUI();
        renderActiveTab();

        // Register Service Worker for PWA (Only in HTTP/HTTPS contexts)
        if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('./sw.js')
                    .then(reg => console.log('Service Worker registered successfully.', reg.scope))
                    .catch(err => console.warn('Service Worker registration failed:', err));
            });
        }
    }

    // Fire application load
    init();
});
