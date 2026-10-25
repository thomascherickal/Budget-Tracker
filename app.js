/* ==========================================================================
   Sovereign Budget - Application Controller & View Orchestrator
   Coordinates modular engines (Constants, Currencies, Crypto, Financials, Storage, UI)
   ========================================================================== */

// If running in Node.js test environment, import modular dependencies
if (typeof require !== 'undefined') {
    if (typeof AppConstants === 'undefined') {
        try { Object.assign(globalThis, require('./js/constants.js')); } catch (e) {}
    }
    if (typeof AppCurrencies === 'undefined') {
        try { Object.assign(globalThis, require('./js/currencies.js')); } catch (e) {}
    }
    if (typeof AppCrypto === 'undefined') {
        try { Object.assign(globalThis, require('./js/crypto.js')); } catch (e) {}
    }
    if (typeof AppFinancials === 'undefined') {
        try { Object.assign(globalThis, require('./js/financials.js')); } catch (e) {}
    }
    if (typeof AppStorage === 'undefined') {
        try { Object.assign(globalThis, require('./js/storage.js')); } catch (e) {}
    }
    if (typeof AppUI === 'undefined') {
        try { Object.assign(globalThis, require('./js/ui.js')); } catch (e) {}
    }
    if (typeof ResponsiveLayout === 'undefined') {
        try { Object.assign(globalThis, require('./js/responsive.js')); } catch (e) {}
    }
}

// Application State Container
const AppState = {
    db: {
        version: '1.0.0',
        lastUpdated: new Date().toISOString(),
        settings: {
            savingsRequirement: 0,
            currency: 'USD'
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

/**
 * Boots the Sovereign Budget application controller.
 * @param {Window|object} [win]
 * @param {Document|object} [doc]
 * @param {Storage|object} [storage]
 * @param {function} [promptFn]
 * @returns {object|null}
 */
function bootApp(win = (typeof window !== 'undefined' ? window : null), doc = (typeof document !== 'undefined' ? document : null), storage = null, promptFn = null) {
    const activeDoc = doc || (typeof document !== 'undefined' ? document : null);
    if (!activeDoc) return null;

    const activeWin = win || (typeof window !== 'undefined' ? window : null);
    const storageEngine = (typeof getUniversalStorage === 'function')
        ? getUniversalStorage(activeWin, storage)
        : { storage: storage || null, type: 'custom', isFallback: false, persistent: true };
    const activeStorage = storageEngine.storage;
    AppState.storageType = storageEngine.type;
    AppState.isStorageFallback = storageEngine.isFallback;
    AppState.storagePersisted = storageEngine.persistent;
    AppState.storageQuota = null;
    const activePrompt = promptFn || (activeWin && typeof activeWin.prompt === 'function' ? activeWin.prompt.bind(activeWin) : (typeof prompt === 'function' ? prompt : () => null));

    // Initialize Lucide Icons
    if (typeof lucide !== 'undefined' && typeof lucide.createIcons === 'function') {
        lucide.createIcons();
    }

    /* ==========================================================================
       1. Storage & Lifecycle Integration
       ========================================================================== */

    function loadData() {
        try {
            const result = loadDataFromStorage(activeStorage);
            AppState.db = result.db;

            if (AppState.db.settings && AppState.db.settings.currency) {
                AppState.currencyCode = AppState.db.settings.currency;
                AppState.currencySymbol = getSymbolForCurrency(AppState.currencyCode);
            }

            if (result.loadedFromAutosave && (AppState.db.transactions.length > 0 || AppState.db.recurringExpenses.length > 0)) {
                setTimeout(() => showToast('Autosaved budget loaded from JSON backup.', 'info'), 400);
            }
        } catch (err) {
            console.error('Failed to load data:', err);
            AppState.db = getCleanDatabaseObject();
            showToast('Cache read error. Reset to default state.', 'error');
        }
    }

    function saveData(isExit = false) {
        if (!isExit) {
            showSaveIndicator(true);
        }

        try {
            saveDataToStorage(activeStorage, AppState.db, isExit);
        } catch (err) {
            console.error('Failed to save data:', err);
            if (!isExit) {
                showToast('Auto-save failed! Local cache storage quota exceeded.', 'error');
            }
        }

        if (!isExit) {
            setTimeout(() => showSaveIndicator(false), 500);
        }
    }

    function setupExitAutosave() {
        setupExitAutosaveListeners(activeWin, activeDoc, saveData);
    }

    function updateStorageStatusUI() {
        const badgeEl = activeDoc.getElementById('db-status-badge');
        const modalBadgeEl = activeDoc.getElementById('modal-storage-badge');
        const modalInfoEl = activeDoc.getElementById('modal-storage-info-text');

        if (AppState.isStorageFallback) {
            if (badgeEl) {
                badgeEl.textContent = 'Session Memory';
                badgeEl.className = 'badge badge-fallback';
                badgeEl.title = 'Storage restricted. Operating in session memory mode.';
            }
            if (modalBadgeEl) {
                modalBadgeEl.textContent = 'Session Memory';
                modalBadgeEl.className = 'badge badge-fallback';
            }
            if (modalInfoEl) {
                modalInfoEl.innerHTML = '<strong>Storage Restricted:</strong> Running in ephemeral session memory mode. Use <em>Export Backup</em> to prevent data loss upon browser restart, or consult the <em>Platform Guide</em> to allow storage.';
            }
        } else {
            const label = AppState.storagePersisted ? 'Local Cache' : 'Local Cache';
            if (badgeEl) {
                badgeEl.textContent = label;
                badgeEl.className = 'badge badge-connected';
                badgeEl.title = 'Persistent offline browser storage active.';
            }
            if (modalBadgeEl) {
                modalBadgeEl.textContent = label;
                modalBadgeEl.className = 'badge badge-connected';
            }
            if (modalInfoEl) {
                modalInfoEl.innerHTML = '<strong>Cross-Platform Storage:</strong> Auto-saves on change and exports to JSON on exit. Operating natively with local persistence.';
            }
        }

        if (AppState.storageQuota) {
            const quotaContainer = activeDoc.getElementById('modal-quota-container');
            const quotaText = activeDoc.getElementById('modal-quota-text');
            if (quotaContainer && quotaText) {
                quotaContainer.style.display = 'block';
                const usageMB = (AppState.storageQuota.usage / (1024 * 1024)).toFixed(2);
                const quotaMB = (AppState.storageQuota.quota / (1024 * 1024)).toFixed(0);
                quotaText.textContent = `Storage: ${usageMB} MB used of ${quotaMB} MB quota (${AppState.storageQuota.percentUsed}%)`;
            }
        }
    }

    function clearLocalMemory() {
        clearLocalStorageKeys(activeStorage);

        AppState.db = getCleanDatabaseObject();
        const detected = detectUserCurrency();
        AppState.currencyCode = detected.code;
        AppState.currencySymbol = detected.symbol;
        AppState.db.settings.currency = AppState.currencyCode;

        saveData();

        // Sync all currency select dropdowns
        const s1 = activeDoc.getElementById('settings-currency-select');
        if (s1) s1.value = AppState.currencyCode;
        const s2 = activeDoc.getElementById('modal-currency-select');
        if (s2) s2.value = AppState.currencyCode;

        // Reset inputs
        const descEl = activeDoc.getElementById('quick-description');
        if (descEl) descEl.value = '';
        const amtEl = activeDoc.getElementById('quick-amount');
        if (amtEl) amtEl.value = '';

        updateCurrencySymbolsUI(AppState.currencySymbol);
        closeAllModals();
        renderActiveTab();
        showToast('Local memory cleared. Started fresh with a clean budget.', 'success');
    }

    function exportPlainJSON() {
        try {
            const { filename, dataUri } = createPlainJsonExport(AppState.db);
            const linkElement = activeDoc.createElement('a');
            linkElement.setAttribute('href', dataUri);
            linkElement.setAttribute('download', filename);
            linkElement.click();
            showToast('JSON backup exported and downloaded.', 'success');
        } catch (err) {
            console.error('Failed to export JSON:', err);
            showToast('Export failed: ' + err.message, 'error');
        }
    }

    async function exportDatabaseBackup() {
        const username = activePrompt('Enter your OS Username to encrypt this backup:');
        if (username === null) {
            return; // User cancelled
        }
        const trimmed = (username || '').trim();
        if (!trimmed) {
            showToast('Backup aborted. Username is required for encryption.', 'warning');
            return;
        }

        try {
            const { filename, dataUri } = await createEncryptedBackup(AppState.db, trimmed, encryptData);
            const linkElement = activeDoc.createElement('a');
            linkElement.setAttribute('href', dataUri);
            linkElement.setAttribute('download', filename);
            linkElement.click();
            showToast('Encrypted database backup downloaded.', 'success');
        } catch (err) {
            console.error('Failed to encrypt backup:', err);
            showToast('Encryption failed: ' + err.message, 'error');
        }
    }

    function handleImportJSON(event) {
        const file = event && event.target && event.target.files ? event.target.files[0] : null;
        if (!file) return;

        if (typeof FileReader !== 'undefined') {
            const reader = new FileReader();
            reader.onload = async (e) => {
                await processImportedContent(e.target.result);
            };
            reader.readAsText(file);
        }
    }

    async function processImportedContent(fileContent) {
        try {
            const promptCallback = () => activePrompt('This backup is encrypted. Enter the OS Username used during export to decrypt:');
            const importedDb = await parseImportContent(fileContent, promptCallback, decryptData);

            if (!importedDb) {
                return; // Cancelled
            }

            AppState.db = importedDb;

            if (AppState.db.settings && AppState.db.settings.currency) {
                AppState.currencyCode = AppState.db.settings.currency;
                AppState.currencySymbol = getSymbolForCurrency(AppState.currencyCode);
            }

            const s1 = activeDoc.getElementById('settings-currency-select');
            if (s1) s1.value = AppState.currencyCode;
            const s2 = activeDoc.getElementById('modal-currency-select');
            if (s2) s2.value = AppState.currencyCode;

            saveData();
            updateCurrencySymbolsUI(AppState.currencySymbol);
            closeAllModals();
            showToast('Database imported successfully from JSON.', 'success');
            renderActiveTab();
        } catch (err) {
            showToast('Failed to import database: ' + err.message, 'error');
        }
    }

    /* ==========================================================================
       2. Date & Currency State Sync
       ========================================================================== */

    function formatCurrencyDisplay(amount) {
        const currencyCode = AppState.db.settings.currency || AppState.currencyCode || 'USD';
        return formatCurrency(amount, currencyCode);
    }

    function updateMonthDisplay() {
        const monthDisplay = activeDoc.getElementById('current-month-display');
        if (monthDisplay) {
            monthDisplay.textContent = formatMonthLabel(AppState.currentMonth);
        }

        const now = new Date();
        const dateString = AppState.currentMonth === now.toISOString().slice(0, 7)
            ? now.toISOString().slice(0, 10)
            : `${AppState.currentMonth}-01`;

        const quickDate = activeDoc.getElementById('quick-date');
        if (quickDate) quickDate.value = dateString;
        const modalDate = activeDoc.getElementById('modal-date');
        if (modalDate) modalDate.value = dateString;
    }

    function handleMonthChange(direction) {
        AppState.currentMonth = calculateNextMonth(AppState.currentMonth, direction);
        updateMonthDisplay();
        renderActiveTab();
    }

    /* ==========================================================================
       3. View Rendering Controllers
       ========================================================================== */

    function renderActiveTab() {
        activeDoc.querySelectorAll('.tab-panel').forEach(panel => {
            panel.classList.remove('active');
        });
        const targetPanel = activeDoc.getElementById(`tab-${AppState.currentTab}`);
        if (targetPanel) targetPanel.classList.add('active');

        const pageTitle = activeDoc.getElementById('page-title');
        if (pageTitle) {
            pageTitle.textContent = TAB_TITLES[AppState.currentTab] || 'Sovereign Budget';
        }

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

    function deleteTransaction(id) {
        if (!id) return false;
        AppState.db.transactions = AppState.db.transactions.filter(x => x.id !== id);
        saveData();
        showToast('Transaction deleted successfully.', 'info');
        renderActiveTab();
        return true;
    }

    // 3.1 Dashboard Render
    function renderDashboard() {
        const financials = getMonthFinancials(AppState.currentMonth, AppState.db);

        const elIncome = activeDoc.getElementById('stat-total-income');
        if (elIncome) elIncome.textContent = formatCurrencyDisplay(financials.totalIncome);

        const elExpenses = activeDoc.getElementById('stat-total-expenses');
        if (elExpenses) elExpenses.textContent = formatCurrencyDisplay(financials.totalExpenses);

        const elExpenseSub = activeDoc.getElementById('stat-expense-sub');
        if (elExpenseSub) {
            elExpenseSub.textContent = `Fixed: ${formatCurrencyDisplay(financials.recurringTotal + financials.onetimeTotal)} | Variable: ${formatCurrencyDisplay(financials.loggedExpenses)}`;
        }

        const savingsReqVal = financials.savingsRequirement;
        const elSavingsSub = activeDoc.getElementById('stat-savings-sub');
        if (elSavingsSub) elSavingsSub.textContent = `Goal: ${formatCurrencyDisplay(savingsReqVal)}`;

        const elSavingsProgress = activeDoc.getElementById('stat-savings-progress');
        const elProgressRatio = activeDoc.getElementById('savings-progress-ratio');
        const elProgressBar = activeDoc.getElementById('savings-progress-bar');
        const elStatusMessage = activeDoc.getElementById('savings-status-message');

        if (savingsReqVal > 0) {
            if (elSavingsProgress) elSavingsProgress.textContent = `${Math.round(financials.savingsProgressPct)}%`;
            if (elProgressRatio) elProgressRatio.textContent = `${formatCurrencyDisplay(Math.max(0, financials.actualSurplus))} / ${formatCurrencyDisplay(savingsReqVal)}`;
            if (elProgressBar) elProgressBar.style.width = `${financials.savingsProgressPct}%`;

            if (elStatusMessage) {
                if (financials.actualSurplus >= savingsReqVal) {
                    elStatusMessage.textContent = 'Amazing! You have fully satisfied your savings requirement for this month!';
                    elStatusMessage.className = 'text-sm text-success';
                } else if (financials.actualSurplus > 0) {
                    const remaining = savingsReqVal - financials.actualSurplus;
                    elStatusMessage.textContent = `You need ${formatCurrencyDisplay(remaining)} more in net surplus to achieve your target.`;
                    elStatusMessage.className = 'text-sm text-warning';
                } else {
                    elStatusMessage.textContent = 'No current savings surplus. Keep expenses low or log more earnings.';
                    elStatusMessage.className = 'text-sm text-danger';
                }
            }
        } else {
            if (elSavingsProgress) elSavingsProgress.textContent = 'N/A';
            if (elProgressRatio) elProgressRatio.textContent = 'No target';
            if (elProgressBar) elProgressBar.style.width = '0%';
            if (elStatusMessage) {
                elStatusMessage.textContent = 'Define a monthly savings requirement in the "Fixed & Savings" tab to track goal progress.';
                elStatusMessage.className = 'text-sm text-muted';
            }
        }

        const balanceEl = activeDoc.getElementById('stat-net-balance');
        const balanceSub = activeDoc.getElementById('stat-balance-sub');
        if (balanceEl) {
            balanceEl.textContent = formatCurrencyDisplay(financials.netBalance);
            if (financials.netBalance < 0) {
                balanceEl.className = 'stat-value text-danger';
                if (balanceSub) balanceSub.textContent = 'Outflows & savings exceed inflows!';
            } else {
                balanceEl.className = 'stat-value text-success';
                if (balanceSub) balanceSub.textContent = 'Available discretionary budget';
            }
        }

        const recentListContainer = activeDoc.getElementById('recent-transactions-list');
        if (!recentListContainer) return;

        const monthTx = AppState.db.transactions
            .filter(tx => tx.date && tx.date.startsWith(AppState.currentMonth))
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5);

        if (monthTx.length === 0) {
            recentListContainer.innerHTML = `
                <div class="empty-state">
                    <i data-lucide="receipt" class="empty-icon"></i>
                    <p>No transactions logged for this month yet.</p>
                </div>
            `;
            if (typeof lucide !== 'undefined') lucide.createIcons();
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
                        <span class="tx-val ${valueClass}">${prefix}${formatCurrencyDisplay(tx.amount)}</span>
                        <button class="btn-delete-row btn-delete-tx" data-id="${tx.id}" aria-label="Delete transaction" title="Delete transaction">
                            <i data-lucide="x"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        const recentDeleteBtns = (typeof recentListContainer.querySelectorAll === 'function')
            ? recentListContainer.querySelectorAll('.btn-delete-tx')
            : [];

        recentDeleteBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                deleteTransaction(id);
            });
        });

        if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    // 3.2 Budget & Commitments Manager Render
    function renderBudgetManager() {
        const savingsReqInput = activeDoc.getElementById('savings-requirement-amount');
        if (savingsReqInput) savingsReqInput.value = AppState.db.settings.savingsRequirement || 0;

        const recTbody = activeDoc.getElementById('recurring-list-tbody');
        if (recTbody) {
            if (AppState.db.recurringExpenses.length === 0) {
                recTbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted">No monthly recurring expenses defined.</td></tr>`;
            } else {
                recTbody.innerHTML = AppState.db.recurringExpenses.map(item => `
                    <tr>
                        <td><strong>${item.name}</strong></td>
                        <td><span class="tx-category-badge">${item.category}</span></td>
                        <td>${formatCurrencyDisplay(item.amount)}</td>
                        <td class="text-center">
                            <button class="btn-delete-row btn-delete-recurring" data-id="${item.id}" aria-label="Delete recurring expense" title="Delete recurring expense">
                                <i data-lucide="x"></i>
                            </button>
                        </td>
                    </tr>
                `).join('');
            }
        }

        const otTbody = activeDoc.getElementById('onetime-list-tbody');
        if (otTbody) {
            const activeMonthOnetimes = AppState.db.oneTimeExpenses.filter(item => item.date && item.date.startsWith(AppState.currentMonth));

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
                            <td>${formatCurrencyDisplay(item.amount)}</td>
                            <td class="text-center">
                                <button class="btn-delete-row btn-delete-onetime" data-id="${item.id}" aria-label="Delete planned expense" title="Delete planned expense">
                                    <i data-lucide="x"></i>
                                </button>
                            </td>
                        </tr>
                    `;
                }).join('');
            }
        }

        activeDoc.querySelectorAll('.btn-delete-recurring').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                AppState.db.recurringExpenses = AppState.db.recurringExpenses.filter(x => x.id !== id);
                saveData();
                showToast('Recurring expense deleted.', 'info');
                renderBudgetManager();
            });
        });

        activeDoc.querySelectorAll('.btn-delete-onetime').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                AppState.db.oneTimeExpenses = AppState.db.oneTimeExpenses.filter(x => x.id !== id);
                saveData();
                showToast('One-time planned expense deleted.', 'info');
                renderBudgetManager();
            });
        });

        if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    // 3.3 Transaction Logs Table Render
    function renderTransactionsLog() {
        const tbody = activeDoc.getElementById('log-list-tbody');
        if (!tbody) return;

        const searchEl = activeDoc.getElementById('log-search');
        const searchVal = searchEl ? searchEl.value.toLowerCase() : '';
        const typeEl = activeDoc.getElementById('filter-type');
        const typeFilter = typeEl ? typeEl.value : 'all';
        const catEl = activeDoc.getElementById('filter-category');
        const catFilter = catEl ? catEl.value : 'all';

        const categoriesSet = new Set(AppState.db.transactions.map(t => t.category).filter(Boolean));
        if (catEl) {
            const prevSelected = catEl.value;
            catEl.innerHTML = '<option value="all">All Categories</option>' +
                Array.from(categoriesSet).map(cat => `<option value="${cat}">${cat}</option>`).join('');
            catEl.value = prevSelected;
        }

        let filtered = AppState.db.transactions.filter(tx => tx.date && tx.date.startsWith(AppState.currentMonth));

        if (searchVal) {
            filtered = filtered.filter(tx => (tx.description || '').toLowerCase().includes(searchVal));
        }

        if (typeFilter !== 'all') {
            filtered = filtered.filter(tx => tx.type === typeFilter);
        }

        if (catFilter !== 'all' && catFilter) {
            filtered = filtered.filter(tx => tx.category === catFilter);
        }

        filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

        const logCount = activeDoc.getElementById('log-count');
        if (logCount) logCount.textContent = `Showing ${filtered.length} transactions`;

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
                    <td class="text-right ${valClass}"><strong>${isIncome ? '+' : '-'}${formatCurrencyDisplay(tx.amount)}</strong></td>
                    <td class="text-center">
                        <button class="btn-delete-row btn-delete-tx" data-id="${tx.id}" aria-label="Delete transaction" title="Delete transaction">
                            <i data-lucide="x"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');

        if (typeof activeDoc.querySelectorAll === 'function') {
            activeDoc.querySelectorAll('.btn-delete-tx').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = e.currentTarget.getAttribute('data-id');
                    deleteTransaction(id);
                });
            });
        }

        if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    // 3.4 Reports & Analytics Render
    function renderReports() {
        const metrics = compileReportMetrics(AppState.reportScope, AppState.db, AppState.currentMonth);

        const scopeDisplay = activeDoc.getElementById('report-scope-display');
        if (scopeDisplay) scopeDisplay.textContent = metrics.scopeLabel;

        const elIncome = activeDoc.getElementById('report-total-income');
        if (elIncome) elIncome.textContent = formatCurrencyDisplay(metrics.earnings);

        const elExpenses = activeDoc.getElementById('report-total-expenses');
        if (elExpenses) elExpenses.textContent = formatCurrencyDisplay(metrics.outflows);

        const elSavingsRate = activeDoc.getElementById('report-savings-rate');
        if (elSavingsRate) elSavingsRate.textContent = `${Math.round(metrics.savingsRate)}%`;

        const insightsList = activeDoc.getElementById('insights-list');
        if (insightsList) {
            const insightItems = generateInsightItems(
                metrics.earnings,
                metrics.outflows,
                metrics.savingsRate,
                metrics.categorySpend,
                AppState.reportScope,
                formatCurrencyDisplay
            );

            insightsList.innerHTML = insightItems.map(item => `
                <li>
                    <i data-lucide="${item.icon}" class="${item.class}"></i>
                    <span>${item.text}</span>
                </li>
            `).join('');

            if (typeof lucide !== 'undefined') lucide.createIcons();
        }

        renderCategoryChart(metrics.categorySpend);
        renderTrendChart(metrics.chartData);
    }

    // 3.4.1 Category Breakdown Chart
    function renderCategoryChart(categoryData) {
        const canvas = activeDoc.getElementById('categoryChart');
        if (!canvas) return;

        if (AppState.charts.category && typeof AppState.charts.category.destroy === 'function') {
            AppState.charts.category.destroy();
        }

        const labels = Object.keys(categoryData);
        const data = Object.values(categoryData);

        if (labels.length === 0) {
            if (typeof canvas.getContext === 'function') {
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.fillStyle = '#6b7280';
                    ctx.font = '14px Plus Jakarta Sans';
                    ctx.textAlign = 'center';
                    ctx.fillText('No expenses logged for breakdown', canvas.width / 2, canvas.height / 2);
                }
            }
            return;
        }

        if (typeof Chart === 'undefined') return;

        const isMobile = activeWin && typeof activeWin.innerWidth === 'number' && activeWin.innerWidth < 640;

        AppState.charts.category = new Chart(canvas, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: CHART_PALETTE.slice(0, labels.length),
                    borderWidth: 1,
                    borderColor: '#111827'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: isMobile ? 'bottom' : 'right',
                        labels: {
                            color: '#9ca3af',
                            font: { family: 'Plus Jakarta Sans', size: isMobile ? 10 : 11, weight: '600' },
                            boxWidth: isMobile ? 10 : 12,
                            padding: isMobile ? 8 : 10
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                return ` ${context.label}: ${formatCurrencyDisplay(context.raw)}`;
                            }
                        }
                    }
                },
                cutout: '65%'
            }
        });
    }

    // 3.4.2 Trend Chart
    function renderTrendChart(trendData) {
        const canvas = activeDoc.getElementById('trendChart');
        if (!canvas) return;

        if (AppState.charts.trend && typeof AppState.charts.trend.destroy === 'function') {
            AppState.charts.trend.destroy();
        }

        if (typeof Chart === 'undefined') return;

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
                            callback: function (value) {
                                return formatCurrencyDisplay(value).split('.')[0];
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
                            label: function (context) {
                                return ` ${context.dataset.label}: ${formatCurrencyDisplay(context.raw)}`;
                            }
                        }
                    }
                }
            }
        });
    }

    /* ==========================================================================
       4. Event Handlers & Submissions
       ========================================================================== */

    function switchTab(tabId) {
        AppState.currentTab = tabId;
        activeDoc.querySelectorAll('.nav-item').forEach(x => {
            x.classList.toggle('active', x.getAttribute('data-tab') === tabId);
        });
        activeDoc.querySelectorAll('.mobile-nav-item[data-tab]').forEach(x => {
            x.classList.toggle('active', x.getAttribute('data-tab') === tabId);
        });
        renderActiveTab();
        if (typeof scrollToContentTop === 'function') {
            const main = activeDoc.querySelector('.main-content');
            scrollToContentTop(main);
        }
    }

    activeDoc.querySelectorAll('.nav-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tab = e.currentTarget.getAttribute('data-tab');
            if (tab) switchTab(tab);
        });
    });

    activeDoc.querySelectorAll('.mobile-nav-item[data-tab]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tab = e.currentTarget.getAttribute('data-tab');
            if (tab) switchTab(tab);
        });
    });

    const viewAllBtn = activeDoc.querySelector('.btn-view-all');
    if (viewAllBtn) {
        viewAllBtn.addEventListener('click', () => switchTab('transaction-log'));
    }

    const prevMonthBtn = activeDoc.getElementById('btn-prev-month');
    if (prevMonthBtn) prevMonthBtn.addEventListener('click', () => handleMonthChange(-1));

    const nextMonthBtn = activeDoc.getElementById('btn-next-month');
    if (nextMonthBtn) nextMonthBtn.addEventListener('click', () => handleMonthChange(1));

    const btnMobileSettings = activeDoc.getElementById('btn-mobile-settings');
    if (btnMobileSettings) {
        btnMobileSettings.addEventListener('click', () => openModal('modal-settings-data'));
    }

    const mobileNavSettings = activeDoc.getElementById('mobile-nav-settings');
    if (mobileNavSettings) {
        mobileNavSettings.addEventListener('click', () => openModal('modal-settings-data'));
    }

    function triggerImportFile() {
        const input = activeDoc.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = handleImportJSON;
        input.click();
    }

    const btnExportDb = activeDoc.getElementById('btn-export-db');
    if (btnExportDb) btnExportDb.addEventListener('click', exportPlainJSON);

    const btnImportDb = activeDoc.getElementById('btn-import-db');
    if (btnImportDb) btnImportDb.addEventListener('click', triggerImportFile);

    const modalBtnExportPlain = activeDoc.getElementById('modal-btn-export-plain');
    if (modalBtnExportPlain) modalBtnExportPlain.addEventListener('click', exportPlainJSON);

    const modalBtnExportEnc = activeDoc.getElementById('modal-btn-export-enc');
    if (modalBtnExportEnc) modalBtnExportEnc.addEventListener('click', exportDatabaseBackup);

    const modalBtnImportDb = activeDoc.getElementById('modal-btn-import-db');
    if (modalBtnImportDb) modalBtnImportDb.addEventListener('click', triggerImportFile);

    const btnClearDb = activeDoc.getElementById('btn-clear-db');
    if (btnClearDb) btnClearDb.addEventListener('click', () => openModal('modal-confirm-clear'));

    const modalBtnClearDb = activeDoc.getElementById('modal-btn-clear-db');
    if (modalBtnClearDb) {
        modalBtnClearDb.addEventListener('click', () => {
            closeAllModals();
            openModal('modal-confirm-clear');
        });
    }

    const btnClearExportFirst = activeDoc.getElementById('btn-clear-export-first');
    if (btnClearExportFirst) btnClearExportFirst.addEventListener('click', exportPlainJSON);

    const btnConfirmClearAction = activeDoc.getElementById('btn-confirm-clear-action');
    if (btnConfirmClearAction) btnConfirmClearAction.addEventListener('click', clearLocalMemory);

    const btnSidebarStorageGuide = activeDoc.getElementById('btn-sidebar-storage-guide');
    if (btnSidebarStorageGuide) {
        btnSidebarStorageGuide.addEventListener('click', () => openModal('modal-storage-guide'));
    }

    const btnOpenStorageGuide = activeDoc.getElementById('btn-open-storage-guide');
    if (btnOpenStorageGuide) {
        btnOpenStorageGuide.addEventListener('click', () => openModal('modal-storage-guide'));
    }

    const btnRequestStoragePerm = activeDoc.getElementById('btn-request-storage-perm');
    if (btnRequestStoragePerm) {
        btnRequestStoragePerm.addEventListener('click', async () => {
            const granted = await requestPersistentStorage(activeWin);
            if (granted) {
                AppState.storagePersisted = true;
                showToast('Persistent storage permission granted by browser!', 'success');
            } else {
                showToast('Persistent permission not granted or already active.', 'info');
            }
            updateStorageStatusUI();
        });
    }

    activeDoc.querySelectorAll('.modal-backdrop').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeAllModals();
        });
    });

    activeDoc.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeAllModals();
    });

    activeDoc.querySelectorAll('input[name="quick-type"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            syncFormCategoryOptions(e.target.value, 'quick-category');
        });
    });

    activeDoc.querySelectorAll('input[name="modal-type"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            syncFormCategoryOptions(e.target.value, 'modal-category');
        });
    });

    const formQuickLog = activeDoc.getElementById('form-quick-log');
    if (formQuickLog) {
        formQuickLog.addEventListener('submit', (e) => {
            e.preventDefault();

            const typeChecked = activeDoc.querySelector('input[name="quick-type"]:checked');
            const type = typeChecked ? typeChecked.value : 'expense';
            const date = activeDoc.getElementById('quick-date') ? activeDoc.getElementById('quick-date').value : '';
            const description = activeDoc.getElementById('quick-description') ? activeDoc.getElementById('quick-description').value.trim() : '';
            const amount = parseFloat(activeDoc.getElementById('quick-amount') ? activeDoc.getElementById('quick-amount').value : 0);
            const category = activeDoc.getElementById('quick-category') ? activeDoc.getElementById('quick-category').value : 'Other';

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

            const descInput = activeDoc.getElementById('quick-description');
            if (descInput) {
                descInput.value = '';
                updateClearButtonState(descInput);
            }
            const amtInput = activeDoc.getElementById('quick-amount');
            if (amtInput) {
                amtInput.value = '';
                updateClearButtonState(amtInput);
            }
            renderActiveTab();
        });
    }

    const btnQuickLog = activeDoc.getElementById('btn-quick-log');
    if (btnQuickLog) {
        btnQuickLog.addEventListener('click', () => {
            const typeChecked = activeDoc.querySelector('input[name="modal-type"]:checked');
            const type = typeChecked ? typeChecked.value : 'expense';
            syncFormCategoryOptions(type, 'modal-category');

            const dateInput = activeDoc.getElementById('modal-date');
            if (dateInput) {
                const now = new Date();
                dateInput.value = AppState.currentMonth === now.toISOString().slice(0, 7)
                    ? now.toISOString().slice(0, 10)
                    : `${AppState.currentMonth}-01`;
            }

            openModal('modal-transaction');
        });
    }

    activeDoc.querySelectorAll('.btn-close-modal').forEach(btn => {
        btn.addEventListener('click', closeAllModals);
    });

    const formModalTx = activeDoc.getElementById('form-modal-tx');
    if (formModalTx) {
        formModalTx.addEventListener('submit', (e) => {
            e.preventDefault();

            const typeChecked = activeDoc.querySelector('input[name="modal-type"]:checked');
            const type = typeChecked ? typeChecked.value : 'expense';
            const date = activeDoc.getElementById('modal-date') ? activeDoc.getElementById('modal-date').value : '';
            const description = activeDoc.getElementById('modal-description') ? activeDoc.getElementById('modal-description').value.trim() : '';
            const amount = parseFloat(activeDoc.getElementById('modal-amount') ? activeDoc.getElementById('modal-amount').value : 0);
            const category = activeDoc.getElementById('modal-category') ? activeDoc.getElementById('modal-category').value : 'Other';

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

            const descInput = activeDoc.getElementById('modal-description');
            if (descInput) {
                descInput.value = '';
                updateClearButtonState(descInput);
            }
            const amtInput = activeDoc.getElementById('modal-amount');
            if (amtInput) {
                amtInput.value = '';
                updateClearButtonState(amtInput);
            }
            renderActiveTab();
        });
    }

    const formSavingsReq = activeDoc.getElementById('form-savings-requirement');
    if (formSavingsReq) {
        formSavingsReq.addEventListener('submit', (e) => {
            e.preventDefault();

            const amtEl = activeDoc.getElementById('savings-requirement-amount');
            const amt = parseFloat(amtEl ? amtEl.value : 0);
            if (isNaN(amt) || amt < 0) {
                showToast('Please enter a valid amount.', 'warning');
                return;
            }

            AppState.db.settings.savingsRequirement = amt;
            saveData();
            showToast('Savings target updated.', 'success');
            renderBudgetManager();
        });
    }

    function handleCurrencyChange(selCurrency) {
        AppState.db.settings.currency = selCurrency;
        AppState.currencyCode = selCurrency;
        AppState.currencySymbol = getSymbolForCurrency(selCurrency);

        const sel1 = activeDoc.getElementById('settings-currency-select');
        if (sel1) sel1.value = selCurrency;
        const sel2 = activeDoc.getElementById('modal-currency-select');
        if (sel2) sel2.value = selCurrency;

        saveData();
        updateCurrencySymbolsUI(AppState.currencySymbol);
        showToast('Currency updated to ' + selCurrency, 'success');
        renderActiveTab();
    }

    const currencySelect = activeDoc.getElementById('settings-currency-select');
    if (currencySelect) {
        currencySelect.addEventListener('change', (e) => handleCurrencyChange(e.target.value));
    }

    const modalCurrencySelect = activeDoc.getElementById('modal-currency-select');
    if (modalCurrencySelect) {
        modalCurrencySelect.addEventListener('change', (e) => handleCurrencyChange(e.target.value));
    }

    const formAddRecurring = activeDoc.getElementById('form-add-recurring');
    if (formAddRecurring) {
        formAddRecurring.addEventListener('submit', (e) => {
            e.preventDefault();

            const nameEl = activeDoc.getElementById('recurring-name');
            const amtEl = activeDoc.getElementById('recurring-amount');
            const catEl = activeDoc.getElementById('recurring-category');

            const name = nameEl ? nameEl.value.trim() : '';
            const amount = parseFloat(amtEl ? amtEl.value : 0);
            const category = catEl ? catEl.value : 'Other';

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

            if (nameEl) {
                nameEl.value = '';
                updateClearButtonState(nameEl);
            }
            if (amtEl) {
                amtEl.value = '';
                updateClearButtonState(amtEl);
            }

            renderBudgetManager();
        });
    }

    const formAddOnetime = activeDoc.getElementById('form-add-onetime');
    if (formAddOnetime) {
        formAddOnetime.addEventListener('submit', (e) => {
            e.preventDefault();

            const nameEl = activeDoc.getElementById('onetime-name');
            const amtEl = activeDoc.getElementById('onetime-amount');
            const dateEl = activeDoc.getElementById('onetime-date');
            const catEl = activeDoc.getElementById('onetime-category');

            const name = nameEl ? nameEl.value.trim() : '';
            const amount = parseFloat(amtEl ? amtEl.value : 0);
            const date = dateEl ? dateEl.value : '';
            const category = catEl ? catEl.value : 'Other';

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

            if (nameEl) {
                nameEl.value = '';
                updateClearButtonState(nameEl);
            }
            if (amtEl) {
                amtEl.value = '';
                updateClearButtonState(amtEl);
            }

            renderBudgetManager();
        });
    }

    const logSearchInput = activeDoc.getElementById('log-search');
    if (logSearchInput) logSearchInput.addEventListener('input', renderTransactionsLog);

    const filterTypeSelect = activeDoc.getElementById('filter-type');
    if (filterTypeSelect) filterTypeSelect.addEventListener('change', renderTransactionsLog);

    const filterCatSelect = activeDoc.getElementById('filter-category');
    if (filterCatSelect) filterCatSelect.addEventListener('change', renderTransactionsLog);

    const btnResetFilters = activeDoc.getElementById('btn-reset-filters');
    if (btnResetFilters) {
        btnResetFilters.addEventListener('click', () => {
            if (logSearchInput) {
                logSearchInput.value = '';
                updateClearButtonState(logSearchInput);
            }
            if (filterTypeSelect) filterTypeSelect.value = 'all';
            if (filterCatSelect) filterCatSelect.value = 'all';
            renderTransactionsLog();
        });
    }

    activeDoc.querySelectorAll('.report-tabs .btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            activeDoc.querySelectorAll('.report-tabs .btn').forEach(x => x.classList.remove('active'));
            e.currentTarget.classList.add('active');
            AppState.reportScope = e.currentTarget.getAttribute('data-scope');
            renderReports();
        });
    });

    /* ==========================================================================
       5. Application Initialization Orchestration
       ========================================================================== */
    function init() {
        const detected = detectUserCurrency();
        AppState.currencyCode = detected.code;
        AppState.currencySymbol = detected.symbol;

        updateMonthDisplay();
        syncFormCategoryOptions('expense', 'quick-category');

        loadData();
        setupExitAutosave();
        setupInputClearButtons(activeDoc);

        if (!AppState.db.settings.currency) {
            AppState.db.settings.currency = AppState.currencyCode;
            saveData();
        }

        const activeCurr = AppState.db.settings.currency || AppState.currencyCode || 'USD';
        const s1 = activeDoc.getElementById('settings-currency-select');
        if (s1) s1.value = activeCurr;
        const s2 = activeDoc.getElementById('modal-currency-select');
        if (s2) s2.value = activeCurr;

        updateCurrencySymbolsUI(AppState.currencySymbol);
        renderActiveTab();
        updateStorageStatusUI();

        if (typeof setupResponsiveListeners === 'function') {
            setupResponsiveListeners(activeWin, activeDoc);
        }

        if (AppState.isStorageFallback) {
            setTimeout(() => showToast('Browser storage restricted. Running in session memory mode. Use "Export Backup" to save data.', 'warning'), 600);
        } else if (activeWin && activeWin.navigator && activeWin.navigator.storage && typeof activeWin.navigator.storage.persist === 'function') {
            requestPersistentStorage(activeWin).then(granted => {
                if (granted) {
                    AppState.storagePersisted = true;
                    updateStorageStatusUI();
                }
            }).catch(() => {});
        }

        if (activeWin && activeWin.navigator && activeWin.navigator.storage) {
            checkStorageQuota(activeWin).then(info => {
                if (info) {
                    AppState.storageQuota = info;
                    updateStorageStatusUI();
                }
            }).catch(() => {});
        }

        let resizeTimer;
        if (activeWin && typeof activeWin.addEventListener === 'function') {
            activeWin.addEventListener('resize', () => {
                clearTimeout(resizeTimer);
                resizeTimer = setTimeout(() => {
                    if (AppState.currentTab === 'reports') {
                        renderReports();
                    }
                }, 200);
            });
        }

        if (activeWin && activeWin.navigator && 'serviceWorker' in activeWin.navigator && activeWin.location && activeWin.location.protocol && activeWin.location.protocol.startsWith('http')) {
            activeWin.addEventListener('load', () => {
                activeWin.navigator.serviceWorker.register('./sw.js')
                    .then(reg => console.log('Service Worker registered successfully.', reg.scope))
                    .catch(err => console.warn('Service Worker registration failed:', err));
            });
        }
    }

    init();

    return {
        AppState,
        loadData,
        saveData,
        setupExitAutosave,
        clearLocalMemory,
        exportPlainJSON,
        exportDatabaseBackup,
        handleImportJSON,
        processImportedContent,
        renderActiveTab,
        renderDashboard,
        renderBudgetManager,
        renderTransactionsLog,
        renderReports,
        renderCategoryChart,
        renderTrendChart,
        switchTab,
        handleMonthChange,
        handleCurrencyChange,
        formatCurrencyDisplay,
        updateMonthDisplay,
        updateStorageStatusUI,
        deleteTransaction,
        setupInputClearButtons: () => setupInputClearButtons(activeDoc),
        clearInputField,
        updateClearButtonState,
        init
    };
}

if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        bootApp(typeof window !== 'undefined' ? window : null, document);
    });
}

// Universal module exports for Node.js test runner and backward-compatibility
if (typeof module !== 'undefined' && module.exports) {
    const constants = require('./js/constants.js');
    const currencies = require('./js/currencies.js');
    const cryptoMod = require('./js/crypto.js');
    const financials = require('./js/financials.js');
    const storage = require('./js/storage.js');
    const ui = require('./js/ui.js');
    const responsive = require('./js/responsive.js');

    module.exports = {
        AppState,
        bootApp,
        // Crypto
        arrayBufferToBase64: cryptoMod.arrayBufferToBase64,
        base64ToArrayBuffer: cryptoMod.base64ToArrayBuffer,
        hashUsername: cryptoMod.hashUsername,
        deriveKey: cryptoMod.deriveKey,
        encryptData: cryptoMod.encryptData,
        decryptData: cryptoMod.decryptData,
        // Currencies
        getSymbolForCurrency: currencies.getSymbolForCurrency,
        getLocaleForCurrency: currencies.getLocaleForCurrency,
        detectUserCurrency: currencies.detectUserCurrency,
        formatCurrency: currencies.formatCurrency,
        LOCALE_CURRENCIES: currencies.LOCALE_CURRENCIES,
        // Financials
        getMonthFinancials: financials.getMonthFinancials,
        getMonthFinancialsGlobal: financials.getMonthFinancials,
        compileReportMetrics: financials.compileReportMetrics,
        generateInsightItems: financials.generateInsightItems,
        // Storage
        getCleanDatabaseObject: storage.getCleanDatabaseObject,
        validateDatabaseSchema: storage.validateDatabaseSchema,
        saveDataToStorage: storage.saveDataToStorage,
        loadDataFromStorage: storage.loadDataFromStorage,
        clearLocalStorageKeys: storage.clearLocalStorageKeys,
        createPlainJsonExport: storage.createPlainJsonExport,
        createEncryptedBackup: storage.createEncryptedBackup,
        parseImportContent: storage.parseImportContent,
        setupExitAutosaveListeners: storage.setupExitAutosaveListeners,
        createMemoryStorage: storage.createMemoryStorage,
        isStorageAvailable: storage.isStorageAvailable,
        getUniversalStorage: storage.getUniversalStorage,
        requestPersistentStorage: storage.requestPersistentStorage,
        checkStorageQuota: storage.checkStorageQuota,
        // UI
        showToast: ui.showToast,
        showSaveIndicator: ui.showSaveIndicator,
        openModal: ui.openModal,
        closeAllModals: ui.closeAllModals,
        updateCurrencySymbolsUI: ui.updateCurrencySymbolsUI,
        syncFormCategoryOptions: ui.syncFormCategoryOptions,
        calculateNextMonth: ui.calculateNextMonth,
        formatMonthLabel: ui.formatMonthLabel,
        clearInputField: ui.clearInputField,
        updateClearButtonState: ui.updateClearButtonState,
        setupInputClearButtons: ui.setupInputClearButtons,
        // Responsive Layout Engine
        ResponsiveLayout: responsive.ResponsiveLayout,
        BREAKPOINTS: responsive.BREAKPOINTS,
        getScreenMode: responsive.getScreenMode,
        isMobileView: responsive.isMobileView,
        isTabletView: responsive.isTabletView,
        isDesktopView: responsive.isDesktopView,
        isSmallMobileView: responsive.isSmallMobileView,
        scrollToContentTop: responsive.scrollToContentTop,
        syncScreenModeDOM: responsive.syncScreenModeDOM,
        setupResponsiveListeners: responsive.setupResponsiveListeners,
        // Constants
        ...constants
    };
}
