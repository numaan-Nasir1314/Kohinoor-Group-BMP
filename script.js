/* ================================
   Kohinoor Group Script
   ================================ */

// Demo credentials
const DEMO_CREDENTIALS = {
    username: 'admin',
    password: 'admin123'
};

const LASER_STORAGE_KEY = 'kohinoorLaserTransactions';
const MANGO_LEDGER_ACCOUNTS_KEY = 'kohinoorMangoLedgerAccounts';
const INFRA_PURCHASES_KEY = 'kohinoorInfraPurchases';
const INFRA_SALES_KEY = 'kohinoorInfraSales';
const INFRA_STOCK_KEY = 'kohinoorInfraStock';
const INFRA_LEDGER_KEY = 'kohinoorInfraLedger';
const ACTIVE_BUSINESS_NAME_KEY = 'kohinoorActiveBusinessName';
const ARRIVAL_BILL_HISTORY_KEY = 'kohinoorArrivalBillHistory';

// Date format conversion utilities
function formatDateToDDMMYYYY(dateStr) {
    if (!dateStr) return '';
    if (dateStr.includes('/')) return dateStr; // Already in DD/MM/YYYY format
    const date = new Date(dateStr + 'T00:00:00');
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

function formatDateToYYYYMMDD(dateStr) {
    if (!dateStr) return '';
    if (dateStr.includes('-')) return dateStr; // Already in YYYY-MM-DD format
    const parts = dateStr.split('/');
    if (parts.length === 3) {
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateStr;
}

function getTodayDDMMYYYY() {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    return `${day}/${month}/${year}`;
}

function formatDateForDisplay(dateStr) {
    return formatDateToDDMMYYYY(formatDateToYYYYMMDD(dateStr || ''));
}

// Check if user is logged in
function checkAuth() {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    const currentPage = window.location.pathname.split('/').pop() || window.location.href.split('/').pop();
    
    if (isLoggedIn === 'true' && (currentPage === 'index.html' || currentPage === '')) {
        window.location.href = 'dashboard.html';
        return;
    } else if (isLoggedIn !== 'true' && currentPage === 'dashboard.html') {
        window.location.href = 'index.html';
        return;
    }
}

function getActiveBusinessName() {
    const stored = localStorage.getItem(ACTIVE_BUSINESS_NAME_KEY);
    if (stored && stored.trim()) return stored.trim();

    const currentPage = window.location.pathname.split('/').pop();
    const businessMap = {
        'mango.html': 'Kohinoor Mango Traders',
        'kohinoor-infra.html': 'Kohinoor Infra',
        'infra-purchase.html': 'Kohinoor Infra',
        'infra-sale.html': 'Kohinoor Infra',
        'infra-ledger.html': 'Kohinoor Infra',
        'infra-stock.html': 'Kohinoor Infra',
        'laser.html': 'Kohinoor Mango Traders',
        'voucher.html': 'Kohinoor Mango Traders',
        'purchase-entry.html': 'Kohinoor Mango Traders',
        'sales.html': 'Kohinoor Mango Traders',
        'ledger-account.html': 'Kohinoor Mango Traders',
        'bill-entry.html': 'Kohinoor Mango Traders'
    };

    return businessMap[currentPage] || 'Kohinoor Group';
}

function updateBrandLabels() {
    const activeBusiness = getActiveBusinessName();
    const labelText = activeBusiness && activeBusiness !== 'Kohinoor Group'
        ? `Kohinoor Group (${activeBusiness})`
        : 'Kohinoor Group';

    document.querySelectorAll('.navbar-brand-text').forEach(element => {
        element.textContent = labelText;
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    updateBrandLabels();
    
    const currentPage = window.location.pathname.split('/').pop();
    
    if (currentPage === 'index.html') {
        initLoginPage();
    } else if (currentPage === 'dashboard.html') {
        initDashboardPage();
    } else if (currentPage === 'mango.html') {
        initMangoPage();
    } else if (currentPage === 'kohinoor-infra.html') {
        initInfraDashboardPage();
    } else if (currentPage === 'infra-purchase.html') {
        initInfraPurchasePage();
    } else if (currentPage === 'infra-sale.html') {
        initInfraSalePage();
    } else if (currentPage === 'infra-ledger.html') {
        initInfraLedgerPage();
    } else if (currentPage === 'infra-stock.html') {
        initInfraStockPage();
    } else if (currentPage === 'laser.html') {
        initLaserPage();
    } else if (currentPage === 'ledger-account.html') {
        initLedgerAccountPage();
    } else if (currentPage === 'voucher.html') {
        initVoucherPage();
    } else if (currentPage === 'purchase-entry.html') {
        initPurchaseEntryPage();
    } else if (currentPage === 'sales.html') {
        initSalesPage();
    } else if (currentPage === 'bill-entry.html') {
        initBillEntryPage();
    }

    setupGlobalKeyboardNavigation();
});

function setupGlobalKeyboardNavigation() {
    document.addEventListener('click', function(e) {
        const row = e.target.closest('tbody tr');
        if (!row) return;
        document.querySelectorAll('tbody tr.keyboard-selected-row').forEach(item => item.classList.remove('keyboard-selected-row'));
        row.classList.add('keyboard-selected-row');
    });

    document.addEventListener('keydown', function(e) {
        const active = document.activeElement;
        if (!active) return;

        const isTextField = ['INPUT', 'TEXTAREA', 'SELECT'].includes(active.tagName);

        if (e.key === 'Delete') {
            const row = active.closest('tbody tr');
            const body = row?.parentElement;
            if (row?.classList.contains('keyboard-selected-row') && body && body.children.length > 1) {
                e.preventDefault();
                if (window.confirm('Delete this row?')) {
                    row.remove();
                    if (body.id === 'billDetailsBody') {
                        renumberBillRows();
                        updateBillGrandTotal();
                    } else if (body.id === 'purchaseDetailsBody') {
                        renumberRows();
                    }
                }
            }
            return;
        }

        if (e.key === 'Escape') {
            const form = active.form;
            const hasChanges = form && Array.from(form.elements).some(field => field.value && field.defaultValue !== field.value);
            if (hasChanges && !window.confirm('Discard unsaved changes and go back?')) {
                e.preventDefault();
                return;
            }
            window.history.back();
            return;
        }

        if (active.tagName === 'SELECT' || active.matches('input[list]')) return;

        if (isTextField && e.key === 'Enter' && active.form) {
            e.preventDefault();
            const fields = Array.from(active.form.querySelectorAll('input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled])'));
            const next = fields[fields.indexOf(active) + 1];
            if (next) next.focus();
            else active.form.requestSubmit();
            return;
        }

        if (isTextField && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key) && active.form) {
            const fields = Array.from(active.form.querySelectorAll('input:not([disabled]), select:not([disabled]), textarea:not([disabled])'));
            const currentIndex = fields.indexOf(active);
            if (currentIndex >= 0 && fields.length) {
                e.preventDefault();
                const direction = e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 1;
                fields[(currentIndex + direction + fields.length) % fields.length].focus();
            }
            return;
        }


        if (e.key === 'Enter' && active && (active.tagName === 'BUTTON' || active.tagName === 'A')) {
            e.preventDefault();
            active.click();
        }
    });
}

function createNormalizedLedgerId(prefixValue, numericValue) {
    const normalizedPrefix = String(prefixValue || '').trim()
        .replace(/[^A-Za-z-]/g, '')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');
    const normalizedNumeric = String(numericValue || '').trim().replace(/[^0-9]/g, '');

    if (!normalizedPrefix && !normalizedNumeric) return '';
    if (!normalizedPrefix) return normalizedNumeric;
    if (!normalizedNumeric) return normalizedPrefix;
    return `${normalizedPrefix}-${normalizedNumeric}`;
}

function createDistinctLedgerPrefix(name, station) {
    const cleanName = String(name || '').trim();
    const cleanStation = String(station || '').trim();
    const nameWords = cleanName.split(/\s+/).filter(Boolean);
    const stationWords = cleanStation.split(/\s+/).filter(Boolean);

    const lettersOnly = (words, maxLength = 4) => {
        const letters = words
            .map(word => word.replace(/[^A-Za-z]/g, ''))
            .join('')
            .toUpperCase();
        return letters.slice(0, maxLength) || 'X';
    };

    const buildStationCode = (length) => {
        const first = lettersOnly(stationWords, length);
        return first.length >= length ? first : first.padEnd(length, 'X');
    };

    const buildNameCode = (length) => {
        const first = lettersOnly(nameWords, length);
        return first.length >= length ? first : first.padEnd(length, 'X');
    };

    const usedPrefixes = new Set(
        [...getMangoLedgerAccounts(), ...getLaserTransactions()]
            .map(record => String(record && record.id ? record.id : '').split('-').slice(0, -1).join('-'))
            .filter(Boolean)
    );

    let stationLength = 3;
    let nameLength = 2;
    let candidate = `${buildStationCode(stationLength)}-${buildNameCode(nameLength)}`;

    while (usedPrefixes.has(candidate)) {
        stationLength += 1;
        nameLength += 1;
        candidate = `${buildStationCode(stationLength)}-${buildNameCode(nameLength)}`;
        if (stationLength > 8 || nameLength > 8) break;
    }

    return candidate.toUpperCase();
}

function syncCrateCountFields(parent = document) {
    const selects = parent.querySelectorAll ? parent.querySelectorAll('.crate-mode-select') : [];
    selects.forEach(select => {
        const countField = select.parentElement?.querySelector('.crate-count-input');
        if (!countField) return;
        const showCount = select.value === 'Crates';
        countField.classList.toggle('d-none', !showCount);
        countField.disabled = !showCount;
        if (!showCount) {
            countField.value = '';
        }
    });
}

function getNextLedgerNumberForPrefix(prefix) {
    const ledgerAccounts = getMangoLedgerAccounts();
    const matchingNumbers = ledgerAccounts
        .map(account => String(account && account.id ? account.id : ''))
        .filter(id => id.startsWith(`${prefix}-`))
        .map(id => Number(String(id).split('-').pop() || '0'))
        .filter(value => Number.isFinite(value) && value > 0);

    return matchingNumbers.length ? Math.max(...matchingNumbers) + 1 : 1;
}

// ================================
// Login Page Functions
// ================================

function initLoginPage() {
    const loginForm = document.getElementById('loginForm');
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');

    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);

            const icon = this.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-eye');
                icon.classList.toggle('fa-eye-slash');
            }
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleLogin();
        });
    }
}

function handleLogin() {
    const usernameField = document.getElementById('username');
    const passwordField = document.getElementById('password');
    const loginBtn = document.getElementById('loginBtn');
    const errorMessage = document.getElementById('errorMessage');

    if (!usernameField || !passwordField || !loginBtn || !errorMessage) {
        return;
    }

    const username = usernameField.value.trim();
    const password = passwordField.value.trim();

    errorMessage.style.display = 'none';
    loginBtn.classList.add('loading');
    loginBtn.disabled = true;

    setTimeout(function() {
        if (username === DEMO_CREDENTIALS.username && password === DEMO_CREDENTIALS.password) {
            sessionStorage.setItem('isLoggedIn', 'true');
            sessionStorage.setItem('username', username);

            loginBtn.classList.remove('loading');
            loginBtn.disabled = false;
            window.location.href = 'dashboard.html';
        } else {
            errorMessage.textContent = 'Invalid Username or Password.';
            errorMessage.style.display = 'block';

            loginBtn.classList.remove('loading');
            loginBtn.disabled = false;
            passwordField.value = '';
            passwordField.focus();
        }
    }, 1500);
}

// ================================
// Dashboard Page Functions
// ================================

function initDashboardPage() {
    const logoutBtn = document.getElementById('logoutBtn');
    const businessCards = document.querySelectorAll('.business-card');
    
    // Handle logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            handleLogout();
        });
    }
    
    // Handle business card clicks
    businessCards.forEach(card => {
        card.addEventListener('click', function(e) {
            // Prevent button click from triggering twice
            if (e.target.closest('.btn-card')) {
                e.stopPropagation();
            }
            handleCardClick(this);
        });
        
        // Handle button clicks specifically
        const cardButton = card.querySelector('.btn-card');
        if (cardButton) {
            cardButton.addEventListener('click', function(e) {
                e.stopPropagation();
                handleCardClick(card);
            });
        }
    });
}

function initMangoPage() {
    const logoutBtn = document.getElementById('logoutBtn');
    const backBtn = document.getElementById('backToDashboardBtn');
    const moduleCards = document.querySelectorAll('.module-card');

    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            handleLogout();
        });
    }

    if (backBtn) {
        backBtn.addEventListener('click', function() {
            window.location.href = 'dashboard.html';
        });
    }

    moduleCards.forEach(card => {
        card.addEventListener('click', function(e) {
            if (e.target.closest('.btn-card')) {
                e.stopPropagation();
            }
            handleModuleCardClick(this);
        });

        const cardButton = card.querySelector('.btn-card');
        if (cardButton) {
            cardButton.addEventListener('click', function(e) {
                e.stopPropagation();
                handleModuleCardClick(card);
            });
        }
    });
}

function initLaserPage() {
    const logoutBtn = document.getElementById('logoutBtn');
    const backBtn = document.getElementById('backToMangoBtn');
    const createAccountBtn = document.getElementById('createLedgerAccountBtn');
    const createAccountForm = document.getElementById('createLedgerAccountForm');
    const accountNameInput = document.getElementById('ledgerAccountName');
    const accountTypeInput = document.getElementById('ledgerAccountType');
    const farmerIdInput = document.getElementById('ledgerFarmerId');
    const proprietorInput = document.getElementById('ledgerAccountProprietor');
    const stationInput = document.getElementById('ledgerStation');
    const folioInput = document.getElementById('ledgerAccountFolio');
    const idPrefixInput = document.getElementById('ledgerIdPrefix');
    const searchInput = document.getElementById('ledgerSearchInput');
    const accountTableBody = document.getElementById('ledgerAccountTableBody');
    const detailTableBody = document.getElementById('ledgerDetailTableBody');
    const selectedAccountLabel = document.getElementById('selectedLedgerAccount');
    const accountEditIdInput = document.getElementById('ledgerAccountEditId');
    const cancelEditBtn = document.getElementById('cancelLedgerAccountEditBtn');
    const saveAccountBtn = document.getElementById('saveLedgerAccountBtn');
    const printLedgerBtn = document.getElementById('printLedgerBtn');

    function resetAccountFormState() {
        if (createAccountForm) createAccountForm.reset();
        if (idPrefixInput) idPrefixInput.value = '';
        if (accountEditIdInput) accountEditIdInput.value = '';
        if (cancelEditBtn) cancelEditBtn.classList.add('d-none');
        if (saveAccountBtn) saveAccountBtn.textContent = 'Save Account';
        if (accountTypeInput) accountTypeInput.value = 'Farmer';
    }

    function enableLedgerKeyboardNavigation() {
        if (!accountTableBody) return;
        const buttons = () => Array.from(accountTableBody.querySelectorAll('[data-action="select-account"]'));

        document.addEventListener('keydown', function(e) {
            if (!accountTableBody || !buttons().length) return;
            const activeTag = document.activeElement && document.activeElement.tagName;
            if (activeTag === 'INPUT' || activeTag === 'TEXTAREA' || activeTag === 'SELECT') return;

            if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
                e.preventDefault();
                const list = buttons();
                const currentIndex = list.findIndex(button => button === document.activeElement);
                const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % list.length : 0;
                list[nextIndex].focus();
                list[nextIndex].click();
            }

            if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
                e.preventDefault();
                const list = buttons();
                const currentIndex = list.findIndex(button => button === document.activeElement);
                const prevIndex = currentIndex >= 0 ? (currentIndex - 1 + list.length) % list.length : list.length - 1;
                list[prevIndex].focus();
                list[prevIndex].click();
            }

            if (e.key === 'Enter') {
                const active = document.activeElement;
                if (active && active.matches('[data-action="select-account"]')) {
                    e.preventDefault();
                    active.click();
                }
            }
        });
    }

    enableLedgerKeyboardNavigation();

    if (cancelEditBtn) {
        cancelEditBtn.addEventListener('click', function() {
            resetAccountFormState();
            if (createAccountForm) createAccountForm.classList.remove('d-none');
        });
    }

    if (createAccountForm) {
        createAccountForm.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && e.target && e.target.tagName !== 'TEXTAREA') {
                const formFields = Array.from(createAccountForm.querySelectorAll('input, select, button'));
                const currentIndex = formFields.indexOf(e.target);
                if (currentIndex >= 0) {
                    const next = formFields[currentIndex + 1];
                    if (next && typeof next.focus === 'function') {
                        e.preventDefault();
                        next.focus();
                    }
                }
            }
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            handleLogout();
        });
    }

    if (backBtn) {
        backBtn.addEventListener('click', function() {
            window.location.href = 'mango.html';
        });
    }

    function generateIdPrefix() {
        if (!accountNameInput || !stationInput || !idPrefixInput) return;
        const type = accountTypeInput ? accountTypeInput.value : 'Farmer';
        const name = accountNameInput.value.trim();
        const station = stationInput.value.trim();
        
        if (type !== 'Farmer' || !name || !station) {
            idPrefixInput.value = '';
            return;
        }
        
        const stationCode = station.split(/\s+/).filter(Boolean).slice(0, 2).map(word => word.charAt(0).toUpperCase()).join('');
        const nameCode = name.split(/\s+/).filter(Boolean).slice(0, 3).map(word => word.charAt(0).toUpperCase()).join('');
        const prefix = `${stationCode || 'ST'}-${nameCode || 'AC'}`.replace(/-+/g, '-').replace(/^-+|-+$/g, '');
        idPrefixInput.value = prefix;
    }

    [accountNameInput, stationInput, accountTypeInput].forEach(input => {
        if (input) input.addEventListener('input', generateIdPrefix);
        if (input) input.addEventListener('change', generateIdPrefix);
    });

    if (createAccountForm) {
        createAccountForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const name = accountNameInput ? accountNameInput.value.trim() : '';
            const type = accountTypeInput ? accountTypeInput.value : 'Farmer';
            const numericId = farmerIdInput ? farmerIdInput.value.trim() : '';
            const station = stationInput ? stationInput.value.trim() : '';
            const proprietor = proprietorInput ? proprietorInput.value.trim() : '';
            const folio = folioInput ? folioInput.value.trim() : '';
            const prefix = idPrefixInput ? idPrefixInput.value.trim() : '';
            const editingId = accountEditIdInput ? accountEditIdInput.value.trim() : '';

            if (!name || !station) {
                alert('Account holder name and station are required.');
                return;
            }

            const isFarmer = String(type).trim() === 'Farmer';
            const id = isFarmer ? createNormalizedLedgerId(prefix, numericId) : '';

            if (isFarmer && !numericId) {
                alert('Numeric ID is required for Farmer accounts.');
                return;
            }

            if (!isFarmer && numericId) {
                farmerIdInput.value = '';
            }

            if (editingId) {
                const updated = {
                    id,
                    name,
                    type,
                    station,
                    proprietor,
                    ledgerFolio: folio,
                    createdAt: new Date().toISOString()
                };

                const success = updateMangoLedgerAccount(editingId, updated);
                if (!success) {
                    alert('The account could not be updated.');
                    return;
                }

                resetAccountFormState();
                renderMangoLedgerAccounts(searchInput ? searchInput.value.trim() : '');
                alert('Account updated successfully.');
                return;
            }

            const account = {
                id,
                name,
                type,
                station,
                proprietor,
                ledgerFolio: folio,
                createdAt: new Date().toISOString()
            };

            upsertMangoLedgerAccount(account);
            resetAccountFormState();
            renderMangoLedgerAccounts(searchInput ? searchInput.value.trim() : '');
            alert('Account created successfully.');
        });
    }

    if (createAccountBtn) {
        createAccountBtn.addEventListener('click', function() {
            const form = document.getElementById('createLedgerAccountForm');
            if (form) {
                form.classList.toggle('d-none');
                if (!form.classList.contains('d-none') && accountNameInput) {
                    accountNameInput.focus();
                }
            }
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', function() {
            renderMangoLedgerAccounts(this.value.trim());
        });
    }

    if (printLedgerBtn) {
        printLedgerBtn.addEventListener('click', function() {
            window.print();
        });
    }

    accountTableBody.addEventListener('click', function(e) {
        const toggleButton = e.target.closest('[data-action="toggle-account-menu"]');
        if (toggleButton) {
            const accountId = toggleButton.getAttribute('data-account-id');
            const menu = document.querySelector(`[data-menu-for="${CSS.escape(accountId)}"]`);
            if (!menu) return;

            const shouldOpen = menu.classList.contains('d-none');
            document.querySelectorAll('.account-menu').forEach(item => {
                if (item !== menu) item.classList.add('d-none');
            });
            menu.classList.toggle('d-none', !shouldOpen);
            return;
        }

        const editButton = e.target.closest('[data-action="edit-account"]');
        if (editButton) {
            const accountId = editButton.getAttribute('data-account-id');
            const account = getMangoLedgerAccounts().find(item => (item.id || item.name) === accountId);
            if (!account) return;

            document.querySelectorAll('.account-menu').forEach(item => item.classList.add('d-none'));
            if (createAccountForm) createAccountForm.classList.remove('d-none');
            if (accountNameInput) accountNameInput.value = account.name || '';
            if (accountTypeInput) accountTypeInput.value = account.type || 'Farmer';
            if (stationInput) stationInput.value = account.station || '';
            if (proprietorInput) proprietorInput.value = account.proprietor || '';
            if (folioInput) folioInput.value = account.ledgerFolio || '';
            if (farmerIdInput) {
                const numericId = String(account.id || '').replace(/[^0-9]/g, '');
                farmerIdInput.value = numericId || '';
            }
            if (idPrefixInput) {
                const prefixMatch = String(account.id || '').split('-');
                if (prefixMatch.length > 1) {
                    idPrefixInput.value = prefixMatch.slice(0, -1).join('-').replace(/-+/g, '-').replace(/^-+|-+$/g, '');
                } else {
                    idPrefixInput.value = '';
                }
            }
            if (accountEditIdInput) accountEditIdInput.value = account.id || account.name || '';
            if (cancelEditBtn) cancelEditBtn.classList.remove('d-none');
            if (saveAccountBtn) saveAccountBtn.textContent = 'Update Account';
            if (accountNameInput) accountNameInput.focus();
            return;
        }

        const deleteButton = e.target.closest('[data-action="delete-account"]');
        if (deleteButton) {
            const accountId = deleteButton.getAttribute('data-account-id');
            const account = getMangoLedgerAccounts().find(item => (item.id || item.name) === accountId);
            if (!account) return;

            document.querySelectorAll('.account-menu').forEach(item => item.classList.add('d-none'));
            const confirmed = window.confirm(`Delete account "${account.name || account.id || 'this account'}" and all related ledger entries?`);
            if (!confirmed) return;

            const deleted = deleteMangoLedgerAccount(account.id || account.name, account.station || '');
            if (!deleted) {
                alert('The account could not be deleted.');
                return;
            }

            resetAccountFormState();
            renderMangoLedgerAccounts(searchInput ? searchInput.value.trim() : '');
            alert('Account deleted successfully.');
            return;
        }

        const selectButton = e.target.closest('[data-action="select-account"]');
        if (selectButton) {
            const selectedId = selectButton.getAttribute('data-account-id');
            sessionStorage.setItem('selectedMangoLedgerAccountId', selectedId);
            window.location.href = 'ledger-account.html';
            return;
        }

        const row = e.target.closest('tr[data-account-id]');
        if (!row) return;
        const selectedId = row.getAttribute('data-account-id');
        sessionStorage.setItem('selectedMangoLedgerAccountId', selectedId);
        renderMangoLedgerAccounts(searchInput ? searchInput.value.trim() : '');
    });

    renderMangoLedgerAccounts(searchInput ? searchInput.value.trim() : '');
}

function getMangoLedgerAccounts() {
    try {
        const stored = localStorage.getItem(MANGO_LEDGER_ACCOUNTS_KEY);
        const accounts = stored ? JSON.parse(stored) : [];
        return accounts.map(account => {
            const cleaned = { ...account };
            if (String(cleaned.type || '').trim() !== 'Farmer') {
                cleaned.id = '';
            }
            return cleaned;
        });
    } catch (error) {
        console.error('Error reading Mango ledger accounts:', error);
        return [];
    }
}

function saveMangoLedgerAccounts(accounts) {
    localStorage.setItem(MANGO_LEDGER_ACCOUNTS_KEY, JSON.stringify(accounts));
}

function getMangoLedgerAccountMatchKey(account) {
    const normalizedId = String(account && account.id ? account.id : '').trim();
    const normalizedName = String(account && account.name ? account.name : '').trim();
    const normalizedStation = String(account && account.station ? account.station : '').trim();
    const normalizedProprietor = String(account && account.proprietor ? account.proprietor : '').trim();
    return { normalizedId, normalizedName, normalizedStation, normalizedProprietor };
}

function findMangoLedgerAccountIndex(accountIdOrName, station = '') {
    const accounts = getMangoLedgerAccounts();
    const targetId = String(accountIdOrName || '').trim();
    const targetName = String(accountIdOrName || '').trim();
    const targetStation = String(station || '').trim();

    return accounts.findIndex(account => {
        const current = getMangoLedgerAccountMatchKey(account);
        if (targetId && current.normalizedId && current.normalizedId === targetId) return true;
        if (targetName && targetStation && current.normalizedName && current.normalizedStation && current.normalizedName === targetName && current.normalizedStation === targetStation) return true;
        if (targetName && !targetStation && current.normalizedName && current.normalizedName === targetName) return true;
        return false;
    });
}

function deleteMangoLedgerAccount(accountIdOrName, station = '') {
    const accounts = getMangoLedgerAccounts();
    const targetIndex = findMangoLedgerAccountIndex(accountIdOrName, station);
    if (targetIndex === -1) return false;

    const [deletedAccount] = accounts.splice(targetIndex, 1);
    saveMangoLedgerAccounts(accounts);

    if (sessionStorage.getItem('selectedMangoLedgerAccountId') === String(accountIdOrName || '')) {
        sessionStorage.removeItem('selectedMangoLedgerAccountId');
    }

    const transactions = getLaserTransactions().filter(record => {
        if (!record) return false;
        const sameName = deletedAccount && deletedAccount.name && record.name === deletedAccount.name;
        const sameId = deletedAccount && deletedAccount.id && record.id === deletedAccount.id;
        return !(sameName || sameId);
    });
    localStorage.setItem(LASER_STORAGE_KEY, JSON.stringify(transactions));
    return true;
}

function updateMangoLedgerAccount(accountIdOrName, updatedValues) {
    const accounts = getMangoLedgerAccounts();
    const targetIndex = findMangoLedgerAccountIndex(accountIdOrName, updatedValues && updatedValues.station ? updatedValues.station : '');
    if (targetIndex === -1) return false;

    const previousAccount = { ...accounts[targetIndex] };
    accounts[targetIndex] = {
        ...accounts[targetIndex],
        ...updatedValues,
        id: String(updatedValues.id || accounts[targetIndex].id || '').trim(),
        name: String(updatedValues.name || accounts[targetIndex].name || '').trim(),
        type: String(updatedValues.type || accounts[targetIndex].type || 'Non-Farmer').trim(),
        station: String(updatedValues.station || accounts[targetIndex].station || '').trim(),
        ledgerFolio: String(updatedValues.ledgerFolio || accounts[targetIndex].ledgerFolio || '').trim(),
    };
    saveMangoLedgerAccounts(accounts);

    const transactions = getLaserTransactions().map(record => {
        if (!record) return record;
        const previousName = previousAccount.name || '';
        const previousId = previousAccount.id || '';
        const sameName = previousName && record.name === previousName;
        const sameId = previousId && record.id === previousId;
        if (!sameName && !sameId) return record;

        return {
            ...record,
            name: accounts[targetIndex].name || record.name,
            station: accounts[targetIndex].station || record.station,
            id: accounts[targetIndex].type === 'Farmer' ? (accounts[targetIndex].id || record.id) : '',
            proprietor: accounts[targetIndex].proprietor || record.proprietor || '',
            type: accounts[targetIndex].type || record.type || 'Non-Farmer'
        };
    });
    localStorage.setItem(LASER_STORAGE_KEY, JSON.stringify(transactions));
    return true;
}

function upsertMangoLedgerAccount(account) {
    const normalizedType = String(account.type || 'Non-Farmer').trim();
    const cleaned = {
        id: String(normalizedType) === 'Farmer' ? String(account.id || '').trim() : '',
        name: String(account.name || '').trim(),
        type: normalizedType,
        station: String(account.station || '').trim(),
        proprietor: String(account.proprietor || '').trim(),
        ledgerFolio: String(account.ledgerFolio || '').trim(),
        createdAt: account.createdAt || new Date().toISOString()
    };

    if (!cleaned.name && !cleaned.station && !cleaned.id) return;

    const accounts = getMangoLedgerAccounts();
    const existingIndex = accounts.findIndex(item => {
        if (cleaned.id && item.id === cleaned.id) return true;
        if (cleaned.name && item.name === cleaned.name && cleaned.station && item.station === cleaned.station) return true;
        return false;
    });

    if (existingIndex >= 0) {
        accounts[existingIndex] = { ...accounts[existingIndex], ...cleaned };
    } else {
        accounts.push(cleaned);
    }

    saveMangoLedgerAccounts(accounts);
}

function findMatchingLedgerRecord(nameOrId, station = '') {
    const lookup = String(nameOrId || '').trim();
    if (!lookup) return null;

    const records = [...getMangoLedgerAccounts(), ...getLaserTransactions()];
    const normalizedLookup = lookup.toLowerCase();
    const normalizedStation = String(station || '').trim().toLowerCase();

    return records.find(record => {
        if (!record) return false;
        const recordId = String(record.id || '').trim().toLowerCase();
        const recordName = String(record.name || '').trim().toLowerCase();
        const recordStation = String(record.station || '').trim().toLowerCase();

        if (recordId && recordId === normalizedLookup) return true;
        if (recordName && recordName === normalizedLookup) {
            if (!normalizedStation || !recordStation || recordStation === normalizedStation) return true;
        }
        if (!normalizedStation && recordName && recordName.includes(normalizedLookup)) return true;
        return false;
    }) || null;
}

function getNextFarmerId() {
    const accounts = getMangoLedgerAccounts();
    const existingIds = accounts
        .map(account => Number(String(account.id || '').replace(/[^0-9]/g, '')))
        .filter(value => Number.isFinite(value) && value > 0);
    return String(Math.max(0, ...existingIds, 0) + 1);
}

function getNextVoucherNumber(voucherType) {
    const transactions = getLaserTransactions();
    const prefix = voucherType === 'Receipt Voucher' ? 'R' : 'P';
    
    const voucherNos = transactions
        .filter(record => record && record.voucherNo && String(record.voucherNo).startsWith(prefix))
        .map(record => {
            const voucherNo = String(record.voucherNo).slice(1);
            const numeric = voucherNo.replace(/[^0-9]/g, '');
            return numeric ? Number(numeric) : 0;
        })
        .filter(value => Number.isFinite(value) && value > 0);
    
    const nextNumber = voucherNos.length ? Math.max(...voucherNos) + 1 : 1;
    return `${prefix}${String(nextNumber).padStart(3, '0')}`;
}


function getMangoAccountTotals(accountName, accountId = '') {
    const account = { name: accountName, id: accountId };
    const transactions = getPersonalLedgerTransactions(account);
    let debit = 0;
    let credit = 0;

    transactions.forEach(record => {
        if (!record) return;
        const source = (record.source || '').toLowerCase();
        const amount = Number(record.grandTotal || record.amount || record.paid || 0);

        if (source === 'purchase bill' || source === 'receipt voucher') {
            debit += amount;
        }
        if (source === 'sale' || source === 'payment voucher') {
            credit += amount;
        }
    });

    const balance = debit - credit;
    return balance >= 0
        ? { debit: balance, credit: 0 }
        : { debit: 0, credit: Math.abs(balance) };
}

function renderMangoLedgerAccounts(searchTerm = '') {
    const accountTableBody = document.getElementById('ledgerAccountTableBody');
    const detailTableBody = document.getElementById('ledgerDetailTableBody');
    const selectedAccountLabel = document.getElementById('selectedLedgerAccount');

    if (!accountTableBody) return;

    const accounts = [...getMangoLedgerAccounts()].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    const filtered = !searchTerm ? accounts : accounts.filter(account => {
        const haystack = `${account.name || ''} ${account.station || ''} ${account.id || ''}`.toLowerCase();
        return haystack.includes(searchTerm.toLowerCase());
    });

    accountTableBody.innerHTML = '';

    if (!filtered.length) {
        accountTableBody.innerHTML = '<tr><td colspan="7" class="text-center py-4 text-muted">No accounts available.</td></tr>';
        if (detailTableBody) detailTableBody.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-muted">Select an account to view details.</td></tr>';
        if (selectedAccountLabel) selectedAccountLabel.textContent = 'Selected Account: None';
        return;
    }

    const selectedId = sessionStorage.getItem('selectedMangoLedgerAccountId') || filtered[0].id || filtered[0].name;
    sessionStorage.setItem('selectedMangoLedgerAccountId', selectedId);

    filtered.forEach((account, index) => {
        const totals = getMangoAccountTotals(account.name, account.id || '');
        const row = document.createElement('tr');
        const rowId = account.id || account.name;
        row.setAttribute('data-account-id', rowId);
        row.style.cursor = 'pointer';
        row.style.background = rowId === selectedId ? 'rgba(30,58,138,0.06)' : '';
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${account.id || ''}</td>
            <td><button type="button" class="btn btn-link p-0 text-start text-dark text-decoration-none fw-semibold" data-account-id="${rowId}" data-action="select-account">${account.name || ''}</button></td>
            <td>${account.station || ''}</td>
            <td style="width: 90px; min-width: 90px;">
                <input type="text" class="form-control form-control-sm ledger-folio-input px-1 py-1" value="${account.ledgerFolio || ''}" data-account-id="${rowId}" style="min-width: 70px; width: 70px; height: 31px; font-size: 0.8rem;">
            </td>
            <td class="text-end">${totals.debit.toFixed(2)}</td>
            <td class="text-end">${totals.credit.toFixed(2)}</td>
            <td class="text-center" style="position: relative; width: 70px; min-width: 70px;">
                <div class="dropdown d-inline-block">
                    <button type="button" class="btn btn-sm btn-light border rounded-circle p-1" data-action="toggle-account-menu" data-account-id="${rowId}" aria-label="Open account actions" title="Account actions">
                        <i class="fas fa-ellipsis-v"></i>
                    </button>
                    <div class="account-menu d-none position-absolute end-0 top-100 bg-white border rounded shadow-sm mt-1 z-3" data-menu-for="${rowId}" style="min-width: 120px;">
                        <button type="button" class="btn btn-link btn-sm text-primary text-decoration-none w-100 text-start px-3 py-2" data-action="edit-account" data-account-id="${rowId}">Edit</button>
                        <button type="button" class="btn btn-link btn-sm text-danger text-decoration-none w-100 text-start px-3 py-2" data-action="delete-account" data-account-id="${rowId}">Delete</button>
                    </div>
                </div>
            </td>
        `;
        accountTableBody.appendChild(row);
    });

    if (selectedAccountLabel) {
        const active = filtered.find(account => (account.id || account.name) === selectedId) || filtered[0];
        selectedAccountLabel.textContent = `Selected Account: ${active.name || ''}`;
    }

    renderMangoLedgerDetails(selectedId);
}

function renderMangoLedgerDetails(accountId) {
    const detailTableBody = document.getElementById('ledgerDetailTableBody');
    if (!detailTableBody) return;

    const desired = accountId || sessionStorage.getItem('selectedMangoLedgerAccountId');
    const accounts = getMangoLedgerAccounts();
    const currentAccount = accounts.find(account => (account.id || account.name) === desired) || accounts[0];

    if (!currentAccount) {
        detailTableBody.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-muted">No account selected.</td></tr>';
        return;
    }

    const transactions = getPersonalLedgerTransactions(currentAccount);

    detailTableBody.innerHTML = '';

    if (!transactions.length) {
        detailTableBody.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-muted">No transactions for this account.</td></tr>';
        return;
    }

    transactions.forEach(record => {
        const source = String(record.source || '').trim();
        const amount = Number(record.amount || record.paid || 0);
        const isDebit = ['purchase bill', 'receipt voucher'].includes(source.toLowerCase());
        const isCredit = ['sale', 'payment voucher'].includes(source.toLowerCase());

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${formatDateForDisplay(record.date)}</td>
            <td>${source || 'Entry'}</td>
            <td>${record.voucherNo || record.invoiceId || record.arrivalNo || record.id || ''}</td>
            <td class="text-end">${isDebit ? amount.toFixed(2) : '0.00'}</td>
            <td class="text-end">${isCredit ? amount.toFixed(2) : '0.00'}</td>
        `;
        detailTableBody.appendChild(row);
    });
}

function initLedgerAccountPage() {
    const backBtn = document.getElementById('backToLedgerBtn');
    const printBtn = document.getElementById('printAccountLedgerBtn');
    const detailContainer = document.getElementById('personalAccountLedgerDetails');
    const accountTitle = document.getElementById('accountDetailTitle');
    const accountMeta = document.getElementById('accountDetailMeta');
    const detailTableBody = document.getElementById('accountDetailTableBody');
    const noDataText = document.getElementById('accountNoDataText');

    if (backBtn) {
        backBtn.addEventListener('click', function() {
            window.location.href = 'laser.html';
        });
    }

    if (printBtn) {
        printBtn.addEventListener('click', function() {
            window.print();
        });
    }

    const selectedId = sessionStorage.getItem('selectedMangoLedgerAccountId');
    const accounts = getMangoLedgerAccounts();
    const selectedAccount = accounts.find(account => (account.id || account.name) === selectedId) || accounts[0];

    if (!selectedAccount) {
        if (accountTitle) accountTitle.textContent = 'No account selected';
        if (accountMeta) accountMeta.textContent = 'Choose an account from the ledger first.';
        if (detailTableBody) detailTableBody.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-muted">No transactions available.</td></tr>';
        return;
    }

    if (accountTitle) accountTitle.textContent = selectedAccount.name || 'Account';
    if (accountMeta) {
        const idValue = selectedAccount.id || 'N/A';
        const typeValue = selectedAccount.type || 'Farmer';
        const stationValue = selectedAccount.station || 'N/A';
        const folioValue = selectedAccount.ledgerFolio || '—';
        const proprietorValue = selectedAccount.proprietor || '—';
        accountMeta.textContent = `ID: ${idValue} | Type: ${typeValue} | Station: ${stationValue} | Proprietor: ${proprietorValue} | Folio: ${folioValue}`;
    }

    const transactions = getPersonalLedgerTransactions(selectedAccount);

    if (detailTableBody) {
        detailTableBody.innerHTML = '';
        if (!transactions.length) {
            detailTableBody.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-muted">No transactions for this account.</td></tr>';
            if (noDataText) noDataText.textContent = 'No transactions available for this account yet.';
            return;
        }

        transactions.forEach(record => {
            const source = String(record.source || '').trim();
            const debit = ['purchase bill', 'receipt voucher'].includes((source || '').toLowerCase()) ? Number(record.grandTotal || record.amount || record.paid || 0) : 0;
            const credit = ['sale', 'payment voucher'].includes((source || '').toLowerCase()) ? Number(record.amount || record.paid || 0) : 0;
            const row = document.createElement('tr');
            row.title = 'Open transaction';
            row.addEventListener('click', function() {
                if (source.toLowerCase() === 'purchase bill') {
                    window.open(`bill-entry.html?arrivalNo=${encodeURIComponent(record.arrivalNo || '')}`, '_blank');
                    return;
                }
                if (source.toLowerCase().includes('voucher')) {
                    window.open(`voucher.html?voucherNo=${encodeURIComponent(record.voucherNo || '')}`, '_blank');
                }
            });
            row.innerHTML = `
                <td>${formatDateForDisplay(record.date)}</td>
                <td>${source || 'Entry'}</td>
                <td>${record.voucherNo || record.invoiceId || record.arrivalNo || record.id || ''}</td>
                <td>${source.toLowerCase() === 'purchase bill' ? '' : (record.mode || 'Cash')}</td>
                <td class="text-end">${debit.toFixed(2)}</td>
                <td class="text-end">${credit.toFixed(2)}</td>
            `;
            detailTableBody.appendChild(row);
        });
    }
}

function getPersonalLedgerTransactions(account) {
    const transactions = getLaserTransactions().filter(record => {
        if (!record) return false;
        if (String(record.source || '').toLowerCase() === 'purchase') return false;
        return (account.name && record.name === account.name) || (account.id && record.id === account.id);
    });
    const latestBills = new Map();
    Object.values(getArrivalBillHistory()).flat().forEach(bill => {
        if (bill && bill.arrivalNo) latestBills.set(String(bill.arrivalNo), bill);
    });
    latestBills.forEach(bill => {
        if (!bill || bill.farmerName !== account.name) return;
        transactions.push({
            ...bill,
            source: 'Purchase Bill',
            name: bill.farmerName,
            amount: bill.grandTotal || 0,
            mode: 'Bill',
            voucherNo: bill.arrivalNo,
            details: `Purchase Bill\nArrival No.: ${bill.arrivalNo}\nDate: ${bill.date}\nGrand Total: ${bill.grandTotal}`
        });
    });
    return transactions.sort((a, b) => new Date(formatDateToYYYYMMDD(a.date || '')) - new Date(formatDateToYYYYMMDD(b.date || '')));
}

function renderVoucherList(searchTerm = '') {
    const tableBody = document.getElementById('voucherListTableBody');
    const listSection = document.getElementById('voucherListSection');
    if (!tableBody || !listSection) return;

    const records = getLaserTransactions().filter(record => {
        const source = String(record?.source || '').trim();
        return source.toLowerCase().includes('voucher');
    });

    const query = String(searchTerm || '').trim().toLowerCase();
    const filtered = !query ? records : records.filter(record => {
        const haystack = [
            record?.source || '',
            record?.date || '',
            record?.name || '',
            record?.id || '',
            record?.amount || '',
            record?.station || '',
            record?.mode || ''
        ].join(' ').toLowerCase();
        return haystack.includes(query);
    });

    if (!filtered.length) {
        tableBody.innerHTML = '<tr><td colspan="8" class="text-center py-4 text-muted">No vouchers found.</td></tr>';
        return;
    }

    tableBody.innerHTML = filtered.map((record, index) => `
        <tr>
            <td>${record?.source || ''}</td>
            <td>${record?.date || ''}</td>
            <td>${record?.name || ''}</td>
            <td>${record?.id || ''}</td>
            <td class="text-end">${Number(record?.amount || 0).toFixed(2)}</td>
            <td>${record?.station || ''}</td>
            <td>${record?.mode || ''}</td>
            <td>
                <div class="d-flex gap-2">
                    <button type="button" class="btn btn-sm btn-outline-primary" data-action="edit-voucher" data-voucher-no="${String(record?.voucherNo || record?.id || index)}" data-voucher-type="${String(record?.source || '')}" data-voucher-date="${String(record?.date || '')}">Edit</button>
                    <button type="button" class="btn btn-sm btn-outline-danger" data-action="delete-voucher" data-voucher-no="${String(record?.voucherNo || record?.id || index)}" data-voucher-type="${String(record?.source || '')}" data-voucher-date="${String(record?.date || '')}">Delete</button>
                </div>
            </td>
        </tr>
    `).join('');
}

function populateLedgerSuggestions() {
    const nameList = document.getElementById('ledgerNameSuggestions');
    const stationList = document.getElementById('ledgerStationSuggestions');
    const idList = document.getElementById('ledgerIdSuggestions');

    const records = [...getMangoLedgerAccounts(), ...getLaserTransactions()];
    const names = [...new Set(records.map(record => record && record.name).filter(Boolean))].sort();
    const stations = [...new Set(records.map(record => record && record.station).filter(Boolean))].sort();
    const ids = [...new Set(records.map(record => record && record.id).filter(Boolean))].sort();

    [nameList, stationList, idList].forEach(list => {
        if (!list) return;
        list.innerHTML = '';
    });

    if (nameList) {
        names.forEach(name => {
            const option = document.createElement('option');
            option.value = name;
            nameList.appendChild(option);
        });
    }

    if (stationList) {
        stations.forEach(station => {
            const option = document.createElement('option');
            option.value = station;
            stationList.appendChild(option);
        });
    }

    if (idList) {
        ids.forEach(id => {
            const option = document.createElement('option');
            option.value = id;
            idList.appendChild(option);
        });
    }
}

function initVoucherPage() {
    populateLedgerSuggestions();

    const backBtn = document.getElementById('backToMangoBtn');
    const voucherCards = document.querySelectorAll('.voucher-card');
    const voucherFormContainer = document.getElementById('voucherFormContainer');
    const voucherForm = document.getElementById('voucherForm');
    const voucherListSection = document.getElementById('voucherListSection');
    const voucherListSearchInput = document.getElementById('voucherListSearch');
    const voucherListTableBody = document.getElementById('voucherListTableBody');
    const accountNameInput = document.getElementById('voucherAccountName');
    const stationInput = document.getElementById('voucherStation');
    const voucherIdInput = document.getElementById('voucherId');
    const voucherNoInput = document.getElementById('voucherNo');
    const backToVoucherCardsBtn = document.getElementById('backToVoucherCards');
    const voucherTypeTitle = document.getElementById('voucherTypeTitle');
    const voucherDateInput = document.getElementById('voucherDate');
    const amountInput = document.getElementById('voucherAmount');
    let selectedVoucherType = '';
    let editingVoucherNo = '';

    function fillVoucherFormFromRecord(record) {
        if (!record) return;
        if (accountNameInput) accountNameInput.value = record.name || '';
        if (stationInput) stationInput.value = record.station || '';
        if (voucherIdInput) voucherIdInput.value = record.id || '';
        if (amountInput) amountInput.value = record.amount || '';
        if (voucherDateInput) voucherDateInput.value = record.date ? formatDateToYYYYMMDD(record.date) : voucherDateInput.value;
        if (voucherNoInput) voucherNoInput.value = record.voucherNo || '';
        if (document.getElementById('voucherMode')) {
            document.getElementById('voucherMode').value = record.mode || 'Cash';
        }
        if (document.getElementById('voucherNarration')) {
            document.getElementById('voucherNarration').value = record.narration || '';
        }
    }

    const requestedVoucherNo = new URLSearchParams(window.location.search).get('voucherNo');
    if (requestedVoucherNo) {
        const requestedVoucher = getLaserTransactions().find(record => String(record?.voucherNo || '') === String(requestedVoucherNo));
        if (requestedVoucher) {
            selectedVoucherType = String(requestedVoucher.source || 'Payment Voucher');
            editingVoucherNo = String(requestedVoucher.voucherNo || '');
            document.querySelector('.row.g-4.justify-content-center')?.classList.add('d-none');
            voucherFormContainer?.classList.remove('d-none');
            if (voucherTypeTitle) voucherTypeTitle.textContent = `View ${selectedVoucherType}`;
            fillVoucherFormFromRecord(requestedVoucher);
        }
    }

    if (voucherListSearchInput) {
        voucherListSearchInput.addEventListener('input', function() {
            renderVoucherList(this.value);
        });
    }

    if (voucherListTableBody) {
        voucherListTableBody.addEventListener('click', function(e) {
            const actionButton = e.target.closest('[data-action]');
            if (!actionButton) return;
            const action = actionButton.getAttribute('data-action');
            const voucherNo = actionButton.getAttribute('data-voucher-no');
            const voucherType = actionButton.getAttribute('data-voucher-type');
            const voucherDate = actionButton.getAttribute('data-voucher-date');
            const allTransactions = getLaserTransactions();
            const targetIndex = allTransactions.findIndex(record => {
                const matchesNo = String(record?.voucherNo || record?.id || '').trim() === String(voucherNo || '').trim();
                const matchesType = String(record?.source || '').trim() === String(voucherType || '').trim();
                const matchesDate = String(record?.date || '').trim() === String(voucherDate || '').trim();
                return matchesNo && matchesType && matchesDate;
            });
            if (targetIndex === -1) return;

            if (action === 'delete-voucher') {
                const confirmed = window.confirm('Delete this voucher?');
                if (!confirmed) return;
                allTransactions.splice(targetIndex, 1);
                localStorage.setItem(LASER_STORAGE_KEY, JSON.stringify(allTransactions));
                renderVoucherList(voucherListSearchInput ? voucherListSearchInput.value : '');
                return;
            }

            if (action === 'edit-voucher') {
                const record = allTransactions[targetIndex];
                selectedVoucherType = String(record?.source || 'Payment Voucher');
                editingVoucherNo = String(record?.voucherNo || '');
                const cardsContainer = document.querySelector('.row.g-4.justify-content-center');
                if (cardsContainer) cardsContainer.classList.add('d-none');
                if (voucherListSection) voucherListSection.classList.add('d-none');
                if (voucherFormContainer) voucherFormContainer.classList.remove('d-none');
                if (voucherTypeTitle) voucherTypeTitle.textContent = `Edit ${selectedVoucherType}`;
                fillVoucherFormFromRecord(record);
                if (accountNameInput) accountNameInput.focus();
            }
        });
    }

    renderVoucherList();
    
    // Set today's date in ISO format for the date picker
    if (voucherDateInput) {
        const today = new Date();
        voucherDateInput.value = today.toISOString().split('T')[0];
    }

    if (backBtn) {
        backBtn.addEventListener('click', function() {
            window.location.href = 'mango.html';
        });
    }

    voucherCards.forEach(card => {
        card.addEventListener('click', function() {
            selectedVoucherType = this.getAttribute('data-voucher-type');
            const cardsContainer = document.querySelector('.row.g-4.justify-content-center');
            if (cardsContainer) {
                cardsContainer.classList.add('d-none');
            }
            if (voucherListSection) {
                voucherListSection.classList.add('d-none');
            }
            if (selectedVoucherType === 'Voucher List') {
                if (voucherListSection) {
                    voucherListSection.classList.remove('d-none');
                    renderVoucherList(voucherListSearchInput ? voucherListSearchInput.value : '');
                }
                return;
            }
            if (voucherFormContainer) {
                voucherFormContainer.classList.remove('d-none');
            }
            if (voucherTypeTitle) {
                voucherTypeTitle.textContent = `Create ${selectedVoucherType}`;
            }
            if (voucherNoInput) {
                voucherNoInput.value = getNextVoucherNumber(selectedVoucherType);
            }
            if (accountNameInput) {
                accountNameInput.focus();
            }
        });
    });

    if (backToVoucherCardsBtn) {
        backToVoucherCardsBtn.addEventListener('click', function() {
            const cardsContainer = document.querySelector('.row.g-4.justify-content-center');
            if (cardsContainer) {
                cardsContainer.classList.remove('d-none');
            }
            if (voucherFormContainer) {
                voucherFormContainer.classList.add('d-none');
            }
            if (voucherListSection) {
                voucherListSection.classList.add('d-none');
            }
            selectedVoucherType = '';
            voucherForm.reset();
            if (voucherIdInput) voucherIdInput.value = '';
        });
    }

    function updateVoucherId() {
        if (!accountNameInput || !stationInput || !voucherIdInput) return;
        const name = accountNameInput.value.trim();
        const station = stationInput.value.trim();
        if (!name || !station) {
            voucherIdInput.value = '';
            return;
        }

        const matchedRecord = findMatchingLedgerRecord(name, station) || findMatchingLedgerRecord(voucherIdInput.value.trim(), station);
        if (matchedRecord && matchedRecord.id) {
            voucherIdInput.value = String(matchedRecord.id).trim();
            return;
        }

        const prefix = createDistinctLedgerPrefix(name, station);
        const nextId = getNextLedgerNumberForPrefix(prefix);
        voucherIdInput.value = `${prefix}-${nextId}`;
    }

    [accountNameInput, stationInput].forEach(input => {
        if (input) input.addEventListener('input', updateVoucherId);
    });

    if (accountNameInput) {
        accountNameInput.addEventListener('change', function() {
            const matchedRecord = findMatchingLedgerRecord(this.value.trim());
            if (!matchedRecord) return;
            if (stationInput && !stationInput.value.trim()) stationInput.value = matchedRecord.station || '';
            if (voucherIdInput && !voucherIdInput.value.trim()) voucherIdInput.value = matchedRecord.id || '';
        });
    }

    if (voucherIdInput) {
        voucherIdInput.addEventListener('change', function() {
            const matchedRecord = findMatchingLedgerRecord(this.value.trim());
            if (!matchedRecord) return;
            if (accountNameInput && !accountNameInput.value.trim()) accountNameInput.value = matchedRecord.name || '';
            if (stationInput && !stationInput.value.trim()) stationInput.value = matchedRecord.station || '';
        });
    }

    if (voucherForm) {
        voucherForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const name = accountNameInput ? accountNameInput.value.trim() : '';
            const station = stationInput ? stationInput.value.trim() : '';
            const id = voucherIdInput ? voucherIdInput.value.trim() : '';
            const amount = Number(document.getElementById('voucherAmount')?.value || 0);
            const voucherNo = voucherNoInput ? voucherNoInput.value.trim() : '';
            const dateValue = document.getElementById('voucherDate')?.value;
            const date = dateValue ? formatDateToDDMMYYYY(dateValue) : getTodayDDMMYYYY();
            const mode = document.getElementById('voucherMode')?.value || 'Cash';
            const narration = document.getElementById('voucherNarration')?.value.trim() || '';

            if (!selectedVoucherType || !name || !station || !id || !voucherNo || !amount) {
                alert('Please complete all voucher fields.');
                return;
            }

            const allTransactions = getLaserTransactions();
            const targetIndex = editingVoucherNo
                ? allTransactions.findIndex(record => String(record?.voucherNo || record?.id || '').trim() === editingVoucherNo)
                : -1;

            const payload = {
                source: selectedVoucherType,
                name,
                station,
                id,
                date,
                amount: String(amount),
                paid: '0',
                voucherNo,
                mode,
                narration
            };

            if (targetIndex >= 0) {
                allTransactions[targetIndex] = { ...allTransactions[targetIndex], ...payload };
            } else {
                allTransactions.push(payload);
            }
            localStorage.setItem(LASER_STORAGE_KEY, JSON.stringify(allTransactions));

            renderVoucherList(voucherListSearchInput ? voucherListSearchInput.value : '');

            upsertMangoLedgerAccount({
                name,
                type: 'Non-Farmer',
                station,
                id,
                ledgerFolio: ''
            });

            alert(`${selectedVoucherType} ${targetIndex >= 0 ? 'updated' : 'posted'} successfully to the ledger.`);
            voucherForm.reset();
            editingVoucherNo = '';
            if (voucherIdInput) voucherIdInput.value = '';
            if (voucherNoInput) voucherNoInput.value = '';
            const cardsContainer = document.querySelector('.row.g-4.justify-content-center');
            if (cardsContainer) {
                cardsContainer.classList.remove('d-none');
            }
            if (voucherFormContainer) {
                voucherFormContainer.classList.add('d-none');
            }
            selectedVoucherType = '';
        });
    }
}

function populateNameSuggestions() {
    const nameSuggestions = document.getElementById('nameSuggestions');
    if (!nameSuggestions) return;

    const transactions = getLaserTransactions();
    const uniqueNames = [...new Set(transactions.map(t => t.name).filter(name => name))];

    nameSuggestions.innerHTML = '';
    uniqueNames.forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        nameSuggestions.appendChild(option);
    });
}

function searchLedger() {
    const ledgerNameInput = document.getElementById('ledgerName');
    const ledgerIdInput = document.getElementById('ledgerId');
    const ledgerTableBody = document.getElementById('ledgerTableBody');

    if (!ledgerNameInput || !ledgerIdInput || !ledgerTableBody) return;

    const searchName = ledgerNameInput.value.trim();
    const searchId = ledgerIdInput.value.trim();

    if (!searchName) {
        alert('Please enter a name to search.');
        return;
    }

    const transactions = getLaserTransactions();
    const filteredTransactions = transactions.filter(t => 
        t.name === searchName && (!searchId || t.id === searchId)
    );

    ledgerTableBody.innerHTML = '';

    if (filteredTransactions.length === 0) {
        ledgerTableBody.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-muted">No transactions found for this name and ID.</td></tr>';
        return;
    }

    let runningBalance = 0;
    filteredTransactions.forEach(record => {
        const credit = parseFloat(record.amount) || 0;
        const debit = parseFloat(record.paid) || 0;
        runningBalance += credit - debit;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${record.date || ''}</td>
            <td>${record.source || ''}</td>
            <td>${record.mode || ''}</td>
            <td class="text-end">${credit.toFixed(2)}</td>
            <td class="text-end">${debit.toFixed(2)}</td>
            <td class="text-end">${runningBalance.toFixed(2)}</td>
        `;
        ledgerTableBody.appendChild(row);
    });
}

function initSalesPage() {
    populateLedgerSuggestions();

    const logoutBtn = document.getElementById('logoutBtn');
    const backBtn = document.getElementById('backToMangoBtn');
    const salesForm = document.getElementById('salesForm');
    const saleDateInput = document.getElementById('saleDate');
    const customerNameInput = document.getElementById('customerName');
    const invoiceIdInput = document.getElementById('invoiceId');
    const saleAmountInput = document.getElementById('saleAmount');
    const paidAmountInput = document.getElementById('paidAmount');
    
    function syncSalesSuggestionFields() {
        const nameValue = customerNameInput ? customerNameInput.value.trim() : '';
        const idValue = invoiceIdInput ? invoiceIdInput.value.trim() : '';
        const matchedRecord = nameValue ? findMatchingLedgerRecord(nameValue) : (idValue ? findMatchingLedgerRecord(idValue) : null);

        if (!matchedRecord) return;
        if (customerNameInput && !customerNameInput.value.trim()) customerNameInput.value = matchedRecord.name || '';
        if (invoiceIdInput && !invoiceIdInput.value.trim()) invoiceIdInput.value = matchedRecord.id || '';
        if (saleAmountInput && !saleAmountInput.value.trim() && matchedRecord.amount) saleAmountInput.value = matchedRecord.amount;
        if (paidAmountInput && !paidAmountInput.value.trim() && matchedRecord.paid) paidAmountInput.value = matchedRecord.paid;
    }

    if (customerNameInput) {
        customerNameInput.addEventListener('change', syncSalesSuggestionFields);
    }
    if (invoiceIdInput) {
        invoiceIdInput.addEventListener('change', syncSalesSuggestionFields);
    }
    
    // Set today's date in ISO format for the date picker
    if (saleDateInput) {
        const today = new Date();
        saleDateInput.value = today.toISOString().split('T')[0];
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            handleLogout();
        });
    }

    if (backBtn) {
        backBtn.addEventListener('click', function() {
            window.location.href = 'mango.html';
        });
    }

    const salesBillingBtn = document.getElementById('salesBillingBtn');
    if (salesBillingBtn) {
        salesBillingBtn.addEventListener('click', function() {
            window.open('bill-entry.html', '_blank');
        });
    }

    if (salesForm) {
        salesForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const record = {
                source: 'Sale',
                name: document.getElementById('customerName').value,
                id: document.getElementById('invoiceId').value,
                date: formatDateToDDMMYYYY(document.getElementById('saleDate')?.value) || getTodayDDMMYYYY(),
                amount: document.getElementById('saleAmount').value,
                mode: document.getElementById('paymentMode').value,
                paid: document.getElementById('paidAmount').value
            };

            saveLaserTransaction(record);
            alert('Sale entry saved successfully. Laser table will update when opened.');
            salesForm.reset();
        });
    }
}

function getPurchaseArrivalEntries() {
    const records = getLaserTransactions().filter(record => record && record.source && record.source.toLowerCase() === 'purchase');
    return [...records].sort((a, b) => {
        const aNo = Number(String(a.arrivalNo || '').replace(/[^0-9]/g, '')) || 0;
        const bNo = Number(String(b.arrivalNo || '').replace(/[^0-9]/g, '')) || 0;
        return aNo - bNo;
    });
}

function renderPurchaseArrivalList(searchTerm = '') {
    const tableBody = document.getElementById('arrivalListTableBody');
    if (!tableBody) return;

    const records = getPurchaseArrivalEntries();
    const query = String(searchTerm || '').trim().toLowerCase();
    const filtered = !query ? records : records.filter(record => {
        const vehicleText = Array.isArray(record.vehicleTypes) ? record.vehicleTypes.join(' ') : (record.vehicleType || '');
        const haystack = `${record.arrivalNo || ''} ${record.date || ''} ${record.name || ''} ${record.station || ''} ${vehicleText}`.toLowerCase();
        return haystack.includes(query);
    });

    if (!filtered.length) {
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-4">No arrivals found.</td></tr>';
        return;
    }

    tableBody.innerHTML = '';
    filtered.forEach(record => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${record.arrivalNo || ''}</td>
            <td>${record.date || ''}</td>
            <td>${record.name || ''}</td>
            <td>${record.station || ''}</td>
            <td>${record.vehicleCount || (Array.isArray(record.vehicleTypes) ? record.vehicleTypes.length : (record.vehicleType ? 1 : 0))}</td>
            <td><button type="button" class="btn btn-sm btn-outline-primary" data-arrival-no="${record.arrivalNo || ''}" data-action="view-arrival">View</button></td>
        `;
        tableBody.appendChild(row);
    });
}

function initPurchaseEntryPage() {
    populateLedgerSuggestions();

    const logoutBtn = document.getElementById('logoutBtn');
    const backButtons = document.querySelectorAll('#backToMangoBtn, #backToMangoBtnSecondary');
    const clearBtn = document.getElementById('clearFormBtn');
    const purchaseForm = document.getElementById('purchaseForm');
    const addRowBtn = document.getElementById('addRowBtn');
    const detailsBody = document.getElementById('purchaseDetailsBody');
    const freightEntry = document.getElementById('freightEntry');
    const billingBtn = document.getElementById('billingBtn');
    const vehicleCountInput = document.getElementById('vehicleCount');
    const vehicleTypeRowsContainer = document.getElementById('vehicleTypeRowsContainer');
    const vehicleTypeRows = document.getElementById('vehicleTypeRows');
    const arrivalNoInput = document.getElementById('arrivalNo');
    const farmerNameInput = document.getElementById('farmerName');
    const stationNameInput = document.getElementById('stationName');
    const farmerIdInput = document.getElementById('farmerId');
    const dateInput = document.getElementById('date');
    const arrivalSearchInput = document.getElementById('arrivalListSearch');
    const tableBody = document.getElementById('arrivalListTableBody');
    const unloadingTypeInput = document.getElementById('unloadingType');
    const inchargeNameInput = document.getElementById('inchargeName');
    const arrivalUnloadingAmount = document.getElementById('arrivalUnloadingAmount');
    
    // Set today's date in ISO format for the date picker
    if (dateInput) {
        const today = new Date();
        dateInput.value = today.toISOString().split('T')[0];
    }

    function renderVehicleTypeRows() {
        if (!vehicleCountInput || !vehicleTypeRowsContainer || !vehicleTypeRows) return;

        const count = Math.max(1, Number.parseInt(vehicleCountInput.value, 10) || 1);
        if (count <= 1) {
            vehicleTypeRowsContainer.style.display = 'none';
            vehicleTypeRows.innerHTML = '';
            return;
        }

        vehicleTypeRowsContainer.style.display = 'block';
        const currentValues = Array.from(vehicleTypeRows.querySelectorAll('select')).map(select => select.value);
        vehicleTypeRows.innerHTML = '';

        for (let index = 1; index < count; index += 1) {
            const wrapper = document.createElement('div');
            wrapper.className = 'row g-2 mb-2';
            wrapper.innerHTML = `
                <div class="col-md-4">
                    <label class="form-label">Vehicle ${index + 1} Type</label>
                </div>
                <div class="col-md-8">
                    <select class="form-select vehicle-type-row-select">
                        <option value="">Select vehicle type</option>
                        <option value="Tractor">Tractor</option>
                        <option value="Pickup">Pickup</option>
                        <option value="407">407</option>
                        <option value="Eicher">Eicher</option>
                        <option value="Mini Van">Mini Van</option>
                        <option value="Car">Car</option>
                        <option value="2 Wheeler">2 Wheeler</option>
                    </select>
                </div>
            `;
            const select = wrapper.querySelector('select');
            if (select && currentValues[index - 1]) {
                select.value = currentValues[index - 1];
            }
            vehicleTypeRows.appendChild(wrapper);
        }
        const newVehicle = vehicleTypeRows.querySelectorAll('select')[currentValues.length];
        if (newVehicle && count - 1 > currentValues.length) newVehicle.focus();
    }

    function updateArrivalUnloadingAmount() {
        if (!arrivalUnloadingAmount) return;
        const quantity = Array.from(detailsBody.querySelectorAll('tr')).reduce((sum, row) => sum + Number(row.querySelector('.crate-count-input')?.value || 0), 0);
        const amount = unloadingTypeInput?.value === 'Mandi Labours' ? quantity / 1000 * 120 : 0;
        arrivalUnloadingAmount.value = amount.toFixed(2);
    }

    function updateFarmerIdField() {
        if (!farmerIdInput) return;
        const farmerName = farmerNameInput ? farmerNameInput.value.trim() : '';
        const stationName = stationNameInput ? stationNameInput.value.trim() : '';

        if (!farmerName || !stationName) {
            farmerIdInput.value = '';
            return;
        }

        const matchingAccount = getMangoLedgerAccounts().find(account => {
            if (!account) return false;
            const sameName = String(account.name || '').trim().toLowerCase() === farmerName.toLowerCase();
            const sameStation = String(account.station || '').trim().toLowerCase() === stationName.toLowerCase();
            return sameName && sameStation;
        });

        if (matchingAccount && matchingAccount.id) {
            farmerIdInput.value = String(matchingAccount.id).trim();
            return;
        }

        const prefix = createDistinctLedgerPrefix(farmerName, stationName);
        const nextId = getNextLedgerNumberForPrefix(prefix);
        farmerIdInput.value = `${prefix}-${nextId}`;
    }

    if (arrivalNoInput) {
        arrivalNoInput.value = getNextArrivalNumber();
        arrivalNoInput.dataset.autoGenerated = 'true';
        arrivalNoInput.addEventListener('input', function() {
            if (this.value.trim() !== '') {
                this.dataset.autoGenerated = 'false';
            }
        });
    }

    [farmerNameInput, stationNameInput].forEach(input => {
        if (input) {
            input.addEventListener('input', updateFarmerIdField);
        }
    });

    if (farmerIdInput) {
        updateFarmerIdField();
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            handleLogout();
        });
    }

    backButtons.forEach(button => {
        button.addEventListener('click', function() {
            window.location.href = 'mango.html';
        });
    });

    if (clearBtn) {
        clearBtn.addEventListener('click', function() {
            purchaseForm.reset();
            resetDetailRows();
            if (arrivalNoInput) {
                arrivalNoInput.value = getNextArrivalNumber();
                arrivalNoInput.dataset.autoGenerated = 'true';
            }
            if (farmerIdInput) {
                farmerIdInput.value = '';
            }
        });
    }

    if (addRowBtn && detailsBody) {
        addRowBtn.addEventListener('click', function() {
            addDetailRow();
        });
    }

    if (detailsBody) {
        detailsBody.addEventListener('change', function(e) {
            if (e.target && e.target.classList && e.target.classList.contains('crate-mode-select')) {
                syncCrateCountFields(detailsBody);
            }
            updateArrivalUnloadingAmount();
        });
        detailsBody.addEventListener('input', updateArrivalUnloadingAmount);
    }

    if (vehicleCountInput) {
        vehicleCountInput.addEventListener('input', renderVehicleTypeRows);
    }
    renderVehicleTypeRows();
    updateArrivalUnloadingAmount();
    syncCrateCountFields(document);
    if (unloadingTypeInput) unloadingTypeInput.addEventListener('change', updateArrivalUnloadingAmount);

    if (billingBtn) {
        billingBtn.addEventListener('click', function() {
            const activeArrival = arrivalNoInput ? arrivalNoInput.value.trim() : '';
            const billingUrl = activeArrival ? `bill-entry.html?arrivalNo=${encodeURIComponent(activeArrival)}` : 'bill-entry.html';
            window.open(billingUrl, '_blank');
        });
    }

    if (arrivalSearchInput) {
        arrivalSearchInput.addEventListener('input', function() {
            renderPurchaseArrivalList(this.value);
        });
    }

    if (tableBody) {
        tableBody.addEventListener('click', function(e) {
            const button = e.target.closest('[data-action="view-arrival"]');
            if (!button) return;
            const arrivalNo = button.getAttribute('data-arrival-no');
            const selected = getPurchaseArrivalEntries().find(record => String(record.arrivalNo || '') === String(arrivalNo || ''));
            if (!selected) return;

            if (arrivalNoInput) arrivalNoInput.value = selected.arrivalNo || '';
            if (dateInput) dateInput.value = selected.date ? formatDateToYYYYMMDD(selected.date) : '';
            if (document.getElementById('vehicleType')) document.getElementById('vehicleType').value = selected.vehicleType || '';
            if (document.getElementById('vehicleCount')) document.getElementById('vehicleCount').value = selected.vehicleCount || '';
            if (farmerNameInput) farmerNameInput.value = selected.name || '';
            if (stationNameInput) stationNameInput.value = selected.station || '';
            if (farmerIdInput) farmerIdInput.value = selected.id || '';

            const details = Array.isArray(selected.details) ? selected.details : [];
            detailsBody.innerHTML = '';
            if (!details.length) {
                addDetailRow();
            } else {
                details.forEach((detail, index) => {
                    const mode = detail.mode || (detail.crates ? 'Crates' : 'Loose');
                    const cratesValue = mode === 'Crates' ? (detail.crates || detail.quantity || '') : '';
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${index + 1}</td>
                        <td><input type="text" class="form-control form-control-sm detail-variety" value="${detail.variety || ''}"></td>
                        <td>
                            <div class="d-flex gap-2 align-items-center">
                                <select class="form-select form-select-sm crate-mode-select">
                                    <option value="Loose" ${mode === 'Loose' ? 'selected' : ''}>Loose</option>
                                    <option value="Crates" ${mode === 'Crates' ? 'selected' : ''}>Crates</option>
                                </select>
                                <input type="number" class="form-control form-control-sm crate-count-input ${mode === 'Crates' ? '' : 'd-none'}" min="1" value="${cratesValue}" placeholder="0">
                            </div>
                        </td>
                        <td><button type="button" class="btn btn-outline-danger btn-sm delete-row-btn"><i class="fas fa-trash"></i></button></td>
                    `;
                    detailsBody.appendChild(row);
                });
            }
            syncCrateCountFields(detailsBody);

            if (selected.expenseDetails) {
                const expense = selected.expenseDetails;
                if (freightEntry) freightEntry.value = expense.freightEntry || '';
                if (document.getElementById('expenseNarration')) document.getElementById('expenseNarration').value = expense.narration || '';
                if (inchargeNameInput) inchargeNameInput.value = expense.inchargeName || '';
                if (unloadingTypeInput) unloadingTypeInput.value = expense.unloadingType || 'Self';
                if (document.getElementById('purchasePaymentMode')) document.getElementById('purchasePaymentMode').value = expense.paymentMode || selected.mode || 'Cash';
            }

            if (Array.isArray(selected.vehicleTypes) && selected.vehicleTypes.length > 1) {
                if (vehicleCountInput) vehicleCountInput.value = selected.vehicleTypes.length;
                renderVehicleTypeRows();
                const typeSelects = document.querySelectorAll('#vehicleTypeRows select.vehicle-type-row-select');
                typeSelects.forEach((select, index) => {
                    select.value = selected.vehicleTypes[index + 1] || '';
                });
            } else {
                if (vehicleCountInput) vehicleCountInput.value = selected.vehicleTypes && selected.vehicleTypes.length ? selected.vehicleTypes.length : 1;
                if (vehicleTypeRowsContainer) vehicleTypeRowsContainer.style.display = 'none';
                if (vehicleTypeRows) vehicleTypeRows.innerHTML = '';
            }

            if (document.getElementById('billEntrySection')) document.getElementById('billEntrySection').style.display = 'none';
            purchaseForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    }

    renderPurchaseArrivalList(arrivalSearchInput ? arrivalSearchInput.value : '');

    detailsBody.addEventListener('click', function(e) {
        if (e.target.closest('.delete-row-btn')) {
            const row = e.target.closest('tr');
            if (detailsBody.children.length > 1) {
                row.remove();
                renumberRows();
            }
        }
    });

    if (purchaseForm) {
        purchaseForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const headerData = {
                arrivalNo: document.getElementById('arrivalNo').value,
                date: document.getElementById('date').value,
                vehicleType: document.getElementById('vehicleType').value,
                vehicleCount: document.getElementById('vehicleCount').value,
                farmerName: document.getElementById('farmerName').value,
                stationName: document.getElementById('stationName').value,
                farmerId: document.getElementById('farmerId').value || "AUTO-" + Date.now()
            };

            const detailRows = Array.from(detailsBody.querySelectorAll('tr')).map((row, index) => {
                const variety = row.querySelector('.detail-variety')?.value || '';
                const modeSelect = row.querySelector('.crate-mode-select');
                const countInput = row.querySelector('.crate-count-input');
                const mode = modeSelect ? modeSelect.value : 'Loose';
                const cratesValue = mode === 'Crates' ? (countInput?.value || '') : '';
                return {
                    serialNo: index + 1,
                    variety,
                    mode,
                    crates: cratesValue,
                    quantity: mode === 'Crates' ? Number(cratesValue || 0) : 0,
                    rawValue: mode === 'Loose' ? 'Loose' : cratesValue
                };
            });

            const vehicleTypeEntries = Array.from(document.querySelectorAll('#vehicleTypeRows select.vehicle-type-row-select')).map(select => select.value).filter(Boolean);
            const vehicleTypes = [headerData.vehicleType, ...vehicleTypeEntries].filter(Boolean);

            const expenseData = {
                freightEntry: freightEntry ? freightEntry.value : '',
                paymentMode: document.getElementById('purchasePaymentMode')?.value || 'Cash',
                narration: document.getElementById('expenseNarration')?.value || '',
                inchargeName: inchargeNameInput ? inchargeNameInput.value : '',
                unloadingType: unloadingTypeInput ? unloadingTypeInput.value : 'Self'
            };

            const purchaseRecord = {
                source: 'Purchase',
                name: headerData.farmerName,
                id: headerData.farmerId,
                station: headerData.stationName,
                arrivalNo: headerData.arrivalNo,
                date: headerData.date || new Date().toISOString().split('T')[0],
                amount: freightEntry ? freightEntry.value : '0',
                mode: document.getElementById('purchasePaymentMode')?.value || 'Cash',
                vehicleType: headerData.vehicleType,
                vehicleCount: headerData.vehicleCount,
                vehicleTypes,
                details: detailRows,
                expenseDetails: expenseData
            };

            const previousArrival = getPurchaseArrivalEntries().find(record => String(record.arrivalNo || '') === String(purchaseRecord.arrivalNo || ''));
            const savedArrival = upsertPurchaseArrival(purchaseRecord);
            renderPurchaseArrivalList(arrivalSearchInput ? arrivalSearchInput.value : '');

            console.log('Purchase Entry Saved:', { headerData, detailRows, expenseData, purchaseRecord });
            alert(`${previousArrival ? 'Arrival updated' : 'Purchase entry saved'} successfully.${describeArrivalChanges(previousArrival, savedArrival)}`);
            purchaseForm.reset();
            resetDetailRows();
            if (arrivalNoInput) {
                arrivalNoInput.value = getNextArrivalNumber();
                arrivalNoInput.dataset.autoGenerated = 'true';
            }
            if (farmerIdInput) {
                farmerIdInput.value = '';
            }
            if (vehicleTypeRows) {
                vehicleTypeRows.innerHTML = '';
            }
            if (vehicleTypeRowsContainer) {
                vehicleTypeRowsContainer.style.display = 'none';
            }
            if (freightEntry) {
                freightEntry.value = '';
            }
            if (inchargeNameInput) {
                inchargeNameInput.value = '';
            }
            if (unloadingTypeInput) {
                unloadingTypeInput.value = 'Self';
            }
        });
    }
}

function addDetailRow() {
    const detailsBody = document.getElementById('purchaseDetailsBody');
    if (!detailsBody) return;

    const rowCount = detailsBody.children.length + 1;
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td>${rowCount}</td>
        <td><input type="text" class="form-control form-control-sm detail-variety" placeholder="Enter variety"></td>
        <td>
            <div class="d-flex gap-2 align-items-center">
                <select class="form-select form-select-sm crate-mode-select">
                    <option value="Loose">Loose</option>
                    <option value="Crates">Crates</option>
                </select>
                <input type="number" class="form-control form-control-sm crate-count-input d-none" min="1" placeholder="0">
            </div>
        </td>
        <td><button type="button" class="btn btn-outline-danger btn-sm delete-row-btn"><i class="fas fa-trash"></i></button></td>
    `;
    detailsBody.appendChild(newRow);
    syncCrateCountFields(detailsBody);
}

function renumberRows() {
    const rows = document.querySelectorAll('#purchaseDetailsBody tr');
    rows.forEach((row, index) => {
        row.querySelector('td').textContent = index + 1;
    });
}

function resetDetailRows() {
    const detailsBody = document.getElementById('purchaseDetailsBody');
    if (!detailsBody) return;
    detailsBody.innerHTML = `
        <tr>
            <td>1</td>
            <td><input type="text" class="form-control form-control-sm detail-variety" placeholder="Enter variety"></td>
            <td>
                <div class="d-flex gap-2 align-items-center">
                    <select class="form-select form-select-sm crate-mode-select">
                        <option value="Loose">Loose</option>
                        <option value="Crates">Crates</option>
                    </select>
                    <input type="number" class="form-control form-control-sm crate-count-input d-none" min="1" placeholder="0">
                </div>
            </td>
            <td><button type="button" class="btn btn-outline-danger btn-sm delete-row-btn"><i class="fas fa-trash"></i></button></td>
        </tr>
    `;
    syncCrateCountFields(detailsBody);
}

function updateTotalExpense() {
    return;
}

function getArrivalBillHistory() {
    try {
        const stored = localStorage.getItem(ARRIVAL_BILL_HISTORY_KEY);
        const parsed = stored ? JSON.parse(stored) : {};
        return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (error) {
        console.error('Error reading arrival billing history:', error);
        return {};
    }
}

function getArrivalBillingHistoryForNumber(arrivalNo) {
    const historyMap = getArrivalBillHistory();
    const key = String(arrivalNo || '').trim();
    return key ? (Array.isArray(historyMap[key]) ? historyMap[key] : []) : [];
}

function notifyArrivalBillingHistory(arrivalNo, currentSequence) {
    const priorEntries = getArrivalBillingHistoryForNumber(arrivalNo);
    if (!priorEntries.length) return;

    const previousDetails = priorEntries.map(entry => `${entry.date || '-'} ${entry.time || ''}`.trim()).join(', ');
    const countLabel = priorEntries.length === 1 ? '1 time' : `${priorEntries.length} times`;
    alert(`This Arrival No. has already been billed ${countLabel}. Previous bills were created on ${previousDetails}. The bill currently being created will be the ${currentSequence}th bill for this Arrival Number.`);
}

function recordArrivalBillingHistory(arrivalNo, billData) {
    const historyMap = getArrivalBillHistory();
    const key = String(arrivalNo || '').trim();
    const entry = {
        arrivalNo: key,
        date: billData.date || getTodayDDMMYYYY(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }),
        grandTotal: Number(billData.grandTotal || 0),
        totalAmount: Number(billData.totalAmount || 0),
        expenseAmount: Number(billData.expenseAmount || 0),
        farmerName: billData.farmerName || '',
        station: billData.station || '',
        rows: Array.isArray(billData.rows) ? billData.rows : [],
        createdAt: new Date().toISOString(),
        sequenceNumber: 1
    };

    historyMap[key] = [entry];
    localStorage.setItem(ARRIVAL_BILL_HISTORY_KEY, JSON.stringify(historyMap));
    return entry;
}

function populateArrivalBillingExpense(arrivalNo) {
    const expenseSummary = document.getElementById('billingExpenseSummary');
    if (!expenseSummary) return;

    const selectedArrival = getPurchaseArrivalEntries().find(record => String(record.arrivalNo || '') === String(arrivalNo || ''));
    const expenseDetails = selectedArrival && selectedArrival.expenseDetails ? selectedArrival.expenseDetails : {};

    if (!selectedArrival || !Object.keys(expenseDetails).length) {
        expenseSummary.innerHTML = '<p class="mb-0">No expense details available for this arrival.</p>';
        expenseSummary.dataset.expenseAmount = '0';
        const unloadingElement = document.getElementById('billUnloadingAmount');
        if (unloadingElement) unloadingElement.textContent = '0.00';
        updateBillGrandTotal();
        return;
    }

    const freightValue = expenseDetails.freightEntry || '0';
    const paymentMode = expenseDetails.paymentMode || 'Cash';
    const inchargeName = expenseDetails.inchargeName || 'N/A';
    const unloadingType = expenseDetails.unloadingType || 'Self';
    const arrivalQuantity = (selectedArrival.details || []).reduce((sum, detail) => sum + Number(detail.quantity || 0), 0);
    const unloadingAmount = unloadingType === 'Mandi Labours' ? (arrivalQuantity / 1000) * 120 : 0;
    const totalExpense = (Number(freightValue) || 0) + unloadingAmount;

    expenseSummary.innerHTML = `
        <div class="mb-2"><strong>Freight:</strong> ${freightValue}</div>
        <div class="mb-2"><strong>Payment Mode:</strong> ${paymentMode}</div>
        <div class="mb-2"><strong>Incharge:</strong> ${inchargeName}</div>
        <div class="mb-2"><strong>U/L:</strong> ${unloadingAmount.toFixed(2)}</div>
    `;
    expenseSummary.dataset.expenseAmount = String(totalExpense);
    expenseSummary.dataset.unloadingAmount = String(unloadingAmount);
    const unloadingField = document.getElementById('billUnloadingAmount');
    if (unloadingField) unloadingField.textContent = unloadingAmount.toFixed(2);
    updateBillGrandTotal();
}

function initBillEntryPage() {
    const logoutBtn = document.getElementById('logoutBtn');
    const backButtons = document.querySelectorAll('#backToPurchaseBtn, #backToPurchaseBtnSecondary');
    const clearBtn = document.getElementById('clearBillBtn');
    const billForm = document.getElementById('billEntryForm');
    const billDateInput = document.getElementById('billDate');
    const addBillRowBtn = document.getElementById('addBillRowBtn');
    const billDetailsBody = document.getElementById('billDetailsBody');
    const printBillBtn = document.getElementById('printBillBtn');
    const urlParams = new URLSearchParams(window.location.search);
    const selectedArrivalNo = urlParams.get('arrivalNo') || '';

    if (billDateInput) {
        const today = new Date();
        billDateInput.value = today.toISOString().split('T')[0];
    }

    if (selectedArrivalNo) {
        const billArrivalField = document.getElementById('billSerialNo');
        if (billArrivalField) billArrivalField.value = selectedArrivalNo;
        const billFarmerNameField = document.getElementById('billFarmerName');
        const billStationField = document.getElementById('billStation');
        const selectedArrival = getPurchaseArrivalEntries().find(record => String(record.arrivalNo || '') === String(selectedArrivalNo || ''));
        if (selectedArrival && billFarmerNameField) {
            billFarmerNameField.value = selectedArrival.name || '';
        }
        if (selectedArrival && billStationField) {
            billStationField.value = selectedArrival.station || '';
        }
        const vehicleCountField = document.getElementById('billVehicleCount');
        const vehicleTypesField = document.getElementById('billVehicleTypes');
        if (selectedArrival && vehicleCountField) {
            vehicleCountField.value = selectedArrival.vehicleCount || selectedArrival.vehicleTypes?.length || '';
        }
        if (selectedArrival && vehicleTypesField) {
            vehicleTypesField.value = (selectedArrival.vehicleTypes || [selectedArrival.vehicleType]).filter(Boolean).join(', ');
        }
        if (selectedArrival && billDateInput && selectedArrival.date) {
            billDateInput.value = formatDateToYYYYMMDD(selectedArrival.date);
        }
        populateArrivalBillingExpense(selectedArrivalNo);
        const savedBill = getArrivalBillingHistoryForNumber(selectedArrivalNo)[0];
        if (savedBill && Array.isArray(savedBill.rows) && savedBill.rows.length) {
            billDetailsBody.innerHTML = savedBill.rows.map((row, index) => `
                <tr>
                    <td><input type="number" class="form-control form-control-sm bill-base-rate" value="${row.baseRate || ''}" min="0" step="0.01"></td>
                    <td class="bill-sl-no-cell">${index + 1}</td>
                    <td><input type="text" class="form-control form-control-sm bill-variety" value="${row.variety || ''}"></td>
                    <td><input type="number" class="form-control form-control-sm bill-qty" value="${row.qty || ''}" min="0" step="1"></td>
                    <td><input type="number" class="form-control form-control-sm bill-rate" value="${row.rate || ''}" readonly></td>
                    <td><input type="number" class="form-control form-control-sm bill-amount" value="${row.amount || ''}" readonly></td>
                    <td><button type="button" class="btn btn-outline-danger btn-sm delete-bill-row-btn"><i class="fas fa-trash"></i></button></td>
                </tr>
            `).join('');
            updateBillGrandTotal();
        } else if (selectedArrival && Array.isArray(selectedArrival.details) && selectedArrival.details.length) {
            billDetailsBody.innerHTML = selectedArrival.details.map((detail, index) => `
                <tr>
                    <td><input type="number" class="form-control form-control-sm bill-base-rate" min="0" step="0.01" placeholder="0"></td>
                    <td class="bill-sl-no-cell">${index + 1}</td>
                    <td><input type="text" class="form-control form-control-sm bill-variety" value="${detail.variety || ''}"></td>
                    <td><input type="number" class="form-control form-control-sm bill-qty" value="${detail.quantity || ''}" min="0" step="1"></td>
                    <td><input type="number" class="form-control form-control-sm bill-rate" readonly placeholder="0"></td>
                    <td><input type="number" class="form-control form-control-sm bill-amount" readonly placeholder="0"></td>
                    <td><button type="button" class="btn btn-outline-danger btn-sm delete-bill-row-btn"><i class="fas fa-trash"></i></button></td>
                </tr>
            `).join('');
            updateBillGrandTotal();
        }
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            handleLogout();
        });
    }

    backButtons.forEach(button => {
        button.addEventListener('click', function() {
            window.location.href = 'purchase-entry.html';
        });
    });

    populateBillDefaults();

    if (clearBtn && billForm) {
        clearBtn.addEventListener('click', function() {
            billForm.reset();
            resetBillRows();
            populateBillDefaults();
            if (selectedArrivalNo) {
                const billSerialNo = document.getElementById('billSerialNo');
                if (billSerialNo) billSerialNo.value = selectedArrivalNo;
                populateArrivalBillingExpense(selectedArrivalNo);
            }
        });
    }

    if (addBillRowBtn && billDetailsBody) {
        addBillRowBtn.addEventListener('click', function() {
            addBillDetailRow();
        });
    }

    if (printBillBtn) {
        printBillBtn.addEventListener('click', function() {
            printBill();
        });
    }

    billDetailsBody.addEventListener('click', function(e) {
        if (e.target.closest('.delete-bill-row-btn')) {
            const row = e.target.closest('tr');
            if (billDetailsBody.children.length > 1) {
                row.remove();
                renumberBillRows();
                updateBillGrandTotal();
            }
        }
    });

    billDetailsBody.addEventListener('input', function(e) {
        const row = e.target.closest('tr');
        if (!row) return;

        if (e.target.classList.contains('bill-base-rate') || e.target.classList.contains('bill-qty')) {
            updateBillRowAmount(row);
            updateBillGrandTotal();
        }
    });

    billDetailsBody.addEventListener('keydown', function(e) {
        if (e.key !== 'Enter' || !e.target.matches('.bill-base-rate, .bill-variety, .bill-qty')) return;
        const row = e.target.closest('tr');
        if (!row || row !== billDetailsBody.lastElementChild) return;
        e.preventDefault();
        addBillDetailRow();
        billDetailsBody.lastElementChild.querySelector('.bill-base-rate')?.focus();
    });

    if (billForm) {
        billForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const arrivalNo = document.getElementById('billSerialNo').value.trim();
            const previousEntries = getArrivalBillingHistoryForNumber(arrivalNo);
            const currentSequence = previousEntries.length + 1;

            if (previousEntries.length) {
                notifyArrivalBillingHistory(arrivalNo, currentSequence);
            }

            const billData = {
                farmerName: document.getElementById('billFarmerName').value,
                arrivalNo,
                serialNo: arrivalNo,
                station: document.getElementById('billStation')?.value || '',
                date: document.getElementById('billDate').value,
                rows: Array.from(billDetailsBody.querySelectorAll('tr')).map((row, index) => {
                    const baseRate = row.querySelector('.bill-base-rate')?.value || 0;
                    const variety = row.querySelector('.bill-variety')?.value || '';
                    const qty = row.querySelector('.bill-qty')?.value || 0;
                    const rate = row.querySelector('.bill-rate')?.value || 0;
                    const amount = row.querySelector('.bill-amount')?.value || 0;
                    return {
                        baseRate,
                        serialNo: index + 1,
                        variety,
                        qty,
                        rate,
                        amount
                    };
                }),
                totalAmount: document.getElementById('billTotalAmount')?.textContent || '0',
                expenseAmount: document.getElementById('billExpenseAmount')?.textContent || '0',
                grandTotal: document.getElementById('grandTotalAmount').textContent
            };

            recordArrivalBillingHistory(arrivalNo, billData);
            console.log('Bill Entry Saved:', billData);
            alert(`Bill entry saved successfully for Arrival No. ${arrivalNo}.`);
            billForm.reset();
            resetBillRows();
            populateBillDefaults();
            if (selectedArrivalNo) {
                const billSerialNo = document.getElementById('billSerialNo');
                if (billSerialNo) billSerialNo.value = selectedArrivalNo;
                populateArrivalBillingExpense(selectedArrivalNo);
            }
        });
    }
}

function populateBillDefaults() {
    const farmerNameField = document.getElementById('farmerName');
    const arrivalNoField = document.getElementById('arrivalNo');
    const dateField = document.getElementById('date');

    const billFarmerName = document.getElementById('billFarmerName');
    const billSerialNo = document.getElementById('billSerialNo');
    const billStation = document.getElementById('billStation');
    const billDate = document.getElementById('billDate');
    const stationField = document.getElementById('stationName');

    if (billFarmerName && farmerNameField) {
        billFarmerName.value = farmerNameField.value;
    }
    if (billSerialNo && arrivalNoField && !billSerialNo.value.trim()) {
        billSerialNo.value = arrivalNoField.value;
    }
    if (billStation && stationField) {
        billStation.value = stationField.value;
    }
    if (billDate && dateField) {
        billDate.value = dateField.value;
    }

    renumberBillRows();
}

function addBillDetailRow() {
    const billDetailsBody = document.getElementById('billDetailsBody');
    if (!billDetailsBody) return;

    const rowCount = billDetailsBody.children.length + 1;
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td>
            <div class="input-group input-group-sm">
                <input type="number" class="form-control bill-base-rate" min="0" step="0.01" placeholder="0">
            </div>
        </td>
        <td class="bill-sl-no-cell">${rowCount}</td>
        <td><input type="text" class="form-control form-control-sm bill-variety" placeholder="Enter variety"></td>
        <td><input type="number" class="form-control form-control-sm bill-qty" min="0" step="1" placeholder="0"></td>
        <td><input type="number" class="form-control form-control-sm bill-rate" min="0" step="0.01" readonly placeholder="0"></td>
        <td><input type="number" class="form-control form-control-sm bill-amount" readonly placeholder="0"></td>
        <td><button type="button" class="btn btn-outline-danger btn-sm delete-bill-row-btn"><i class="fas fa-trash"></i></button></td>
    `;
    billDetailsBody.appendChild(newRow);
}

function renumberBillRows() {
    const rows = document.querySelectorAll('#billDetailsBody tr');
    rows.forEach((row, index) => {
        const slCell = row.querySelector('.bill-sl-no-cell');
        if (slCell) {
            slCell.textContent = String(index + 1);
        }
    });
}

function updateBillRowAmount(row) {
    const baseInput = row.querySelector('.bill-base-rate');
    const qtyInput = row.querySelector('.bill-qty');
    const rateInput = row.querySelector('.bill-rate');
    const amountInput = row.querySelector('.bill-amount');

    if (!baseInput || !qtyInput || !rateInput || !amountInput) return;

    const baseValue = parseFloat(baseInput.value) || 0;
    const qty = parseFloat(qtyInput.value) || 0;
    const calculatedRate = baseValue * 0.9;
    rateInput.value = calculatedRate.toFixed(2);
    amountInput.value = (qty * calculatedRate).toFixed(2);
}

function updateBillGrandTotal() {
    const rows = document.querySelectorAll('#billDetailsBody tr');
    const grandTotalElement = document.getElementById('grandTotalAmount');
    if (!grandTotalElement) return;

    let total = 0;
    rows.forEach(row => {
        const amountInput = row.querySelector('.bill-amount');
        if (amountInput) {
            total += parseFloat(amountInput.value) || 0;
        }
    });

    const expenseSummary = document.getElementById('billingExpenseSummary');
    const arrivalNo = document.getElementById('billSerialNo')?.value || '';
    const arrival = getPurchaseArrivalEntries().find(record => String(record.arrivalNo || '') === String(arrivalNo));
    const freight = Number(arrival?.expenseDetails?.freightEntry || 0);
    const billQuantity = Array.from(rows).reduce((sum, row) => sum + Number(row.querySelector('.bill-qty')?.value || 0), 0);
    const arrivalQuantity = (arrival?.details || []).reduce((sum, detail) => sum + Number(detail.quantity || 0), 0);
    const unloadingType = arrival?.expenseDetails?.unloadingType || 'Self';
    const unloadingAmount = unloadingType === 'Mandi Labours' ? ((billQuantity || arrivalQuantity) / 1000) * 120 : 0;
    const expenseAmount = arrival ? freight + unloadingAmount : Number(expenseSummary?.dataset.expenseAmount || 0);
    if (expenseSummary) expenseSummary.dataset.expenseAmount = String(expenseAmount);
    const unloadingElement = document.getElementById('billUnloadingAmount');
    if (unloadingElement) unloadingElement.textContent = unloadingAmount.toFixed(2);
    const totalElement = document.getElementById('billTotalAmount');
    const expenseElement = document.getElementById('billExpenseAmount');
    if (totalElement) totalElement.textContent = total.toFixed(2);
    if (expenseElement) expenseElement.textContent = expenseAmount.toFixed(2);
    const freightElement = document.getElementById('billFreightAmount');
    if (freightElement) freightElement.textContent = freight.toFixed(2);
    grandTotalElement.textContent = Math.max(total - expenseAmount, 0).toFixed(2);
}

function printBill() {
    const billData = {
        farmerName: document.getElementById('billFarmerName').value || 'N/A',
        serialNo: document.getElementById('billSerialNo').value || 'N/A',
        station: document.getElementById('billStation')?.value || 'N/A',
        vehicleCount: document.getElementById('billVehicleCount')?.value || 'N/A',
        vehicleTypes: document.getElementById('billVehicleTypes')?.value || 'N/A',
        date: document.getElementById('billDate').value || 'N/A',
        expenses: document.getElementById('billingExpenseSummary')?.innerText || 'No expense details available.'
    };

    const rows = Array.from(document.querySelectorAll('#billDetailsBody tr')).map((row, index) => {
        return {
            no: row.querySelector('.bill-base-rate')?.value || '',
            serialNo: index + 1,
            variety: row.querySelector('.bill-variety')?.value || '',
            qty: row.querySelector('.bill-qty')?.value || '',
            rate: row.querySelector('.bill-rate')?.value || '',
            amount: row.querySelector('.bill-amount')?.value || ''
        };
    });

    const rowsMarkup = rows.map(row => `
        <tr>
            <td>${row.no}</td>
            <td>${row.serialNo}</td>
            <td>${row.variety}</td>
            <td>${row.qty}</td>
            <td>${row.rate}</td>
            <td>${row.amount}</td>
        </tr>
    `).join('');

    const printContents = `<!DOCTYPE html>
        <html>
            <head>
                <title>Bill Print</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 24px; color: #111; }
                    h2 { margin-bottom: 8px; }
                    .meta { margin-bottom: 16px; line-height: 1.6; }
                    table { width: 100%; border-collapse: collapse; margin-top: 12px; }
                    th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
                    th { background: #f5f5f5; }
                    .summary { margin-top: 16px; font-weight: bold; }
                </style>
            </head>
            <body>
                <h2>Kohinoor Group - Bill</h2>
                <div class="meta">
                    <div><strong>Farmer Name:</strong> ${billData.farmerName}</div>
                    <div><strong>Arrival No.:</strong> ${billData.serialNo}</div>
                    <div><strong>Station:</strong> ${billData.station}</div>
                    <div><strong>Vehicles:</strong> ${billData.vehicleCount}</div>
                    <div><strong>Vehicle Types:</strong> ${billData.vehicleTypes}</div>
                    <div><strong>Date:</strong> ${billData.date}</div>
                </div>
                <div class="summary">
                    <div>Total Amount: ${document.getElementById('billTotalAmount')?.textContent || '0.00'}</div>
                    <div>Less: Freight: ${document.getElementById('billFreightAmount')?.textContent || '0.00'}</div>
                    <div>U/L: ${document.getElementById('billUnloadingAmount')?.textContent || '0.00'}</div>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th></th>
                            <th>SL.No.</th>
                            <th>Variety</th>
                            <th>Qty</th>
                            <th>Rate</th>
                            <th>Amount</th>
                        </tr>
                    </thead>
                    <tbody>${rowsMarkup}</tbody>
                </table>
                <div class="summary">Grand Total: ${document.getElementById('grandTotalAmount').textContent}</div>
            </body>
        </html>`;

    const printFrame = document.createElement('iframe');
    printFrame.style.position = 'fixed';
    printFrame.style.right = '0';
    printFrame.style.bottom = '0';
    printFrame.style.width = '0';
    printFrame.style.height = '0';
    printFrame.style.border = '0';
    document.body.appendChild(printFrame);

    const frameDoc = printFrame.contentWindow.document;
    frameDoc.open();
    frameDoc.write(printContents);
    frameDoc.close();

    setTimeout(() => {
        printFrame.contentWindow.focus();
        printFrame.contentWindow.print();
        setTimeout(() => {
            if (printFrame.parentNode) {
                printFrame.parentNode.removeChild(printFrame);
            }
        }, 1000);
    }, 300);
}

function resetBillRows() {
    const billDetailsBody = document.getElementById('billDetailsBody');
    const grandTotalElement = document.getElementById('grandTotalAmount');
    if (!billDetailsBody) return;
    billDetailsBody.innerHTML = `
        <tr>
            <td>
                <div class="input-group input-group-sm">
                    <input type="number" class="form-control bill-base-rate" min="0" step="0.01" placeholder="0">
                </div>
            </td>
            <td class="bill-sl-no-cell">1</td>
            <td><input type="text" class="form-control form-control-sm bill-variety" placeholder="Enter variety"></td>
            <td><input type="number" class="form-control form-control-sm bill-qty" min="0" step="1" placeholder="0"></td>
            <td><input type="number" class="form-control form-control-sm bill-rate" min="0" step="0.01" readonly placeholder="0"></td>
            <td><input type="number" class="form-control form-control-sm bill-amount" readonly placeholder="0"></td>
            <td><button type="button" class="btn btn-outline-danger btn-sm delete-bill-row-btn"><i class="fas fa-trash"></i></button></td>
        </tr>
    `;
    if (grandTotalElement) {
        grandTotalElement.textContent = '0.00';
    }
}

function handleLogout() {
    // Clear session
    sessionStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('username');
    
    // Redirect to login page
    window.location.href = 'index.html';
}

function getMangoPurchaseRecords() {
    const transactions = getLaserTransactions();
    return transactions.filter(record => {
        const source = (record && record.source ? String(record.source).trim().toLowerCase() : '');
        return source === 'purchase';
    });
}

function getNextArrivalNumber() {
    const purchaseRecords = getMangoPurchaseRecords();
    const numericArrivalNos = purchaseRecords
        .map(record => {
            const arrivalNo = record && record.arrivalNo !== undefined ? String(record.arrivalNo).trim() : '';
            const cleaned = arrivalNo.replace(/[^0-9]/g, '');
            return cleaned ? Number(cleaned) : null;
        })
        .filter(value => Number.isFinite(value) && value > 0);

    if (!numericArrivalNos.length) {
        return '1';
    }

    return String(Math.max(...numericArrivalNos) + 1);
}

function getLaserTransactions() {
    try {
        const stored = localStorage.getItem(LASER_STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error('Error reading Laser transactions:', error);
        return [];
    }
}

function saveLaserTransaction(transaction) {
    if (!transaction || (!transaction.name && !transaction.id && !transaction.source)) return;
    const transactions = getLaserTransactions();
    transactions.push(transaction);
    localStorage.setItem(LASER_STORAGE_KEY, JSON.stringify(transactions));

    if (transaction.name || transaction.station || transaction.id) {
        upsertMangoLedgerAccount({
            id: transaction.id || '',
            name: transaction.name || '',
            type: transaction.type || 'Non-Farmer',
            station: transaction.station || '',
            ledgerFolio: transaction.ledgerFolio || ''
        });
    }
}

function upsertPurchaseArrival(transaction) {
    const transactions = getLaserTransactions();
    const arrivalNo = String(transaction.arrivalNo || '').trim();
    const matchingIndexes = transactions
        .map((record, index) => ({ record, index }))
        .filter(item => String(item.record?.source || '').toLowerCase() === 'purchase' && String(item.record.arrivalNo || '').trim() === arrivalNo)
        .map(item => item.index);
    const existingIndex = matchingIndexes[0] ?? -1;
    matchingIndexes.slice(1).reverse().forEach(index => transactions.splice(index, 1));
    const savedRecord = existingIndex >= 0
        ? { ...transactions[existingIndex], ...transaction, updatedAt: new Date().toISOString() }
        : { ...transaction, createdAt: new Date().toISOString() };
    if (existingIndex >= 0) transactions[existingIndex] = savedRecord;
    else transactions.push(savedRecord);
    localStorage.setItem(LASER_STORAGE_KEY, JSON.stringify(transactions));
    upsertMangoLedgerAccount({ id: savedRecord.id, name: savedRecord.name, type: 'Farmer', station: savedRecord.station });
    return savedRecord;
}

function describeArrivalChanges(previous, next) {
    if (!previous) return '';
    const previousFreight = previous.expenseDetails?.freightEntry || '0';
    const nextFreight = next.expenseDetails?.freightEntry || '0';
    if (String(previousFreight) === String(nextFreight)) return '';
    return `\nPrevious Freight: ${previousFreight}\nNew Freight: ${nextFreight}\nUpdated records: Arrival, Purchase Bill, Voucher and Ledger Entry.`;
}

function populateLaserTable() {
    const laserTableBody = document.getElementById('laserTableBody');
    if (!laserTableBody) return;

    const transactions = getLaserTransactions();
    laserTableBody.innerHTML = '';

    if (transactions.length === 0) {
        laserTableBody.innerHTML = '<tr><td colspan="7" class="text-center py-4 text-muted">No Laser transactions available yet.</td></tr>';
        return;
    }

    transactions.forEach(record => {
        const credit = parseFloat(record.amount) || 0;
        const debit = parseFloat(record.paid) || 0;
        const balance = Math.max(credit - debit, 0).toFixed(2);

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${record.name || ''}</td>
            <td>${record.id || ''}</td>
            <td>${record.date || ''}</td>
            <td>${record.mode || ''}</td>
            <td class="text-end"><span class="credit-value">${credit.toFixed(2)}</span></td>
            <td class="text-end"><input type="number" min="0" step="0.01" class="form-control form-control-sm debit-amount" value="${debit.toFixed(2)}"></td>
            <td class="balance-amount text-end">${balance}</td>
        `;
        laserTableBody.appendChild(row);
    });
}

function handleCardClick(card) {
    const businessType = card.getAttribute('data-business');
    const businessNames = {
        'building': 'Kohinoor Infra',
        'estates': 'Kohinoor Estates & Developers',
        'mango': 'Kohinoor Mango Traders',
        'fuel': 'Kohinoor Fuel Station'
    };
    
    const businessName = businessNames[businessType] || 'Business';
    localStorage.setItem(ACTIVE_BUSINESS_NAME_KEY, businessName);
    updateBrandLabels();
    
    // Add click animation
    card.style.transform = 'scale(0.98)';
    setTimeout(() => {
        card.style.transform = '';
    }, 150);
    
    if (businessType === 'building') {
        window.location.href = 'kohinoor-infra.html';
        return;
    }

    if (businessType === 'mango') {
        window.location.href = 'mango.html';
        return;
    }
    
    if (businessType === 'estates') {
        window.location.href = 'real-estate/dashboard.html';
        return;
    }
    
    // Show alert (in production, this would navigate to the business module)
    alert(`Opening ${businessName}...\n\nThis would navigate to the ${businessName} management module.`);
}

function handleModuleCardClick(card) {
    const moduleType = card.getAttribute('data-business');
    const cardTitle = card.querySelector('.card-title').textContent;

    card.style.transform = 'scale(0.98)';
    setTimeout(() => {
        card.style.transform = '';
    }, 150);

    if (moduleType === 'purchases') {
        window.location.href = 'purchase-entry.html';
        return;
    }

    if (moduleType === 'sales') {
        window.location.href = 'sales.html';
        return;
    }

    if (moduleType === 'laser') {
        window.location.href = 'laser.html';
        return;
    }

    if (moduleType === 'voucher') {
        window.location.href = 'voucher.html';
        return;
    }

    alert(`Opening ${cardTitle}...\n\nThis would navigate to the ${cardTitle} module.`);
}

function getInfraPurchases() {
    try {
        const stored = localStorage.getItem(INFRA_PURCHASES_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error('Error reading Infra purchases:', error);
        return [];
    }
}

function getInfraSales() {
    try {
        const stored = localStorage.getItem(INFRA_SALES_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error('Error reading Infra sales:', error);
        return [];
    }
}

function getInfraStock() {
    try {
        const stored = localStorage.getItem(INFRA_STOCK_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error('Error reading Infra stock:', error);
        return [];
    }
}

function getInfraLedger() {
    try {
        const stored = localStorage.getItem(INFRA_LEDGER_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error('Error reading Infra ledger:', error);
        return [];
    }
}

function saveInfraCollection(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
        if (!file) {
            resolve('');
            return;
        }

        const reader = new FileReader();
        reader.onload = function() {
            resolve(reader.result || '');
        };
        reader.onerror = function() {
            reject(new Error('Unable to read the selected file.'));
        };
        reader.readAsDataURL(file);
    });
}

function handleInfraModuleCardClick(card) {
    const moduleType = card.getAttribute('data-business');
    const routeMap = {
        'infra-purchases': 'infra-purchase.html',
        'infra-sales': 'infra-sale.html',
        'infra-ledger': 'infra-ledger.html',
        'infra-stock': 'infra-stock.html'
    };

    card.style.transform = 'scale(0.98)';
    setTimeout(() => {
        card.style.transform = '';
    }, 150);

    const targetPage = routeMap[moduleType];
    if (targetPage) {
        window.location.href = targetPage;
        return;
    }

    alert('This module is not available yet.');
}

function initInfraDashboardPage() {
    const logoutBtn = document.getElementById('logoutBtn');
    const backBtn = document.getElementById('backToDashboardBtn');
    const moduleCards = document.querySelectorAll('.module-card');

    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            handleLogout();
        });
    }

    if (backBtn) {
        backBtn.addEventListener('click', function() {
            window.location.href = 'dashboard.html';
        });
    }

    moduleCards.forEach(card => {
        card.addEventListener('click', function(e) {
            if (e.target.closest('.btn-card')) {
                e.stopPropagation();
            }
            handleInfraModuleCardClick(this);
        });

        const cardButton = card.querySelector('.btn-card');
        if (cardButton) {
            cardButton.addEventListener('click', function(e) {
                e.stopPropagation();
                handleInfraModuleCardClick(card);
            });
        }
    });
}

function initInfraPurchasePage() {
    const backBtn = document.getElementById('backToDashboardBtn');
    if (backBtn) {
        backBtn.addEventListener('click', function() {
            window.location.href = 'kohinoor-infra.html';
        });
    }

    const purchaseForm = document.getElementById('infraPurchaseForm');
    const purchaseTableBody = document.getElementById('infraPurchaseTableBody');
    const invoiceInput = document.getElementById('invoiceAttachment');
    const inventoryPhotoInput = document.getElementById('inventoryPhoto');
    const purchaseDateInput = document.getElementById('purchaseDate');
    
    // Set today's date in ISO format for the date picker
    if (purchaseDateInput) {
        const today = new Date();
        purchaseDateInput.value = today.toISOString().split('T')[0];
    }

    if (purchaseForm) {
        purchaseForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const supplier = document.getElementById('supplierName')?.value.trim();
            const invoice = document.getElementById('invoiceNumber')?.value.trim();
            const itemName = document.getElementById('inventoryItem')?.value.trim();
            const quantity = Number(document.getElementById('inventoryQty')?.value || 0);
            const unitRate = Number(document.getElementById('unitRate')?.value || 0);
            const purchaseDateValue = document.getElementById('purchaseDate')?.value;
            const date = purchaseDateValue ? formatDateToDDMMYYYY(purchaseDateValue) : getTodayDDMMYYYY();
            const paymentMode = document.getElementById('purchasePaymentMode')?.value || 'Cash';
            const paidAmount = Number(document.getElementById('paidAmount')?.value || 0);

            if (!supplier || !invoice || !itemName) {
                alert('Supplier, invoice number, and item name are required.');
                return;
            }

            const invoicePhoto = invoiceInput && invoiceInput.files && invoiceInput.files[0]
                ? await readFileAsDataUrl(invoiceInput.files[0])
                : '';
            const inventoryPhoto = inventoryPhotoInput && inventoryPhotoInput.files && inventoryPhotoInput.files[0]
                ? await readFileAsDataUrl(inventoryPhotoInput.files[0])
                : '';

            const purchaseRecord = {
                id: `PUR-${Date.now()}`,
                supplier,
                invoice,
                item: itemName,
                quantity,
                unitRate,
                totalAmount: quantity * unitRate,
                paymentMode,
                paidAmount,
                date,
                invoicePhoto,
                inventoryPhoto,
                createdAt: new Date().toISOString()
            };

            const purchases = getInfraPurchases();
            purchases.unshift(purchaseRecord);
            saveInfraCollection(INFRA_PURCHASES_KEY, purchases);

            const stock = getInfraStock();
            const stockIndex = stock.findIndex(item => item.name.toLowerCase() === itemName.toLowerCase());
            const newStockItem = {
                name: itemName,
                quantity,
                rate: unitRate,
                supplier,
                photo: inventoryPhoto,
                lastUpdated: date
            };

            if (stockIndex >= 0) {
                stock[stockIndex].quantity += quantity;
                stock[stockIndex].rate = unitRate;
                stock[stockIndex].supplier = supplier;
                stock[stockIndex].lastUpdated = date;
                if (inventoryPhoto) stock[stockIndex].photo = inventoryPhoto;
            } else {
                stock.unshift(newStockItem);
            }
            saveInfraCollection(INFRA_STOCK_KEY, stock);

            const ledger = getInfraLedger();
            ledger.unshift({
                id: `LED-${Date.now()}`,
                party: supplier,
                type: 'Purchase',
                item: itemName,
                invoice,
                amount: quantity * unitRate,
                paid: paidAmount,
                mode: paymentMode,
                date,
                createdAt: new Date().toISOString()
            });
            saveInfraCollection(INFRA_LEDGER_KEY, ledger);

            alert('Purchase saved and stock + ledger were updated automatically.');
            purchaseForm.reset();
            renderInfraPurchaseTable();
            renderInfraStockTable();
            renderInfraLedgerTable();
        });
    }

    renderInfraPurchaseTable();
}

function renderInfraPurchaseTable() {
    const tableBody = document.getElementById('infraPurchaseTableBody');
    if (!tableBody) return;

    const purchases = getInfraPurchases();
    tableBody.innerHTML = '';

    if (!purchases.length) {
        tableBody.innerHTML = '<tr><td colspan="8" class="text-center text-muted py-4">No purchase records found yet.</td></tr>';
        return;
    }

    purchases.forEach(record => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${record.date || ''}</td>
            <td>${record.supplier || ''}</td>
            <td>${record.invoice || ''}</td>
            <td>${record.item || ''}</td>
            <td class="text-end">${Number(record.quantity || 0)}</td>
            <td class="text-end">${Number(record.unitRate || 0).toFixed(2)}</td>
            <td class="text-end">${Number(record.totalAmount || 0).toFixed(2)}</td>
            <td>${record.invoicePhoto ? '<span class="badge bg-success">Invoice Added</span>' : '<span class="badge bg-secondary">No Invoice</span>'}</td>
        `;
        tableBody.appendChild(row);
    });
}

function initInfraSalePage() {
    const backBtn = document.getElementById('backToDashboardBtn');
    if (backBtn) {
        backBtn.addEventListener('click', function() {
            window.location.href = 'kohinoor-infra.html';
        });
    }

    const saleForm = document.getElementById('infraSaleForm');
    const stockSelect = document.getElementById('saleItem');
    const previewContainer = document.getElementById('saleItemPreview');
    const availableQtyLabel = document.getElementById('availableQty');
    const saleDateInput = document.getElementById('saleDate');
    
    // Set today's date in ISO format for the date picker
    if (saleDateInput) {
        const today = new Date();
        saleDateInput.value = today.toISOString().split('T')[0];
    }

    function populateSaleStockOptions() {
        const stock = getInfraStock();
        if (!stockSelect) return;
        stockSelect.innerHTML = '<option value="">Select inventory item</option>' + stock.map(item => `
            <option value="${item.name}">${item.name}</option>
        `).join('');
    }

    function updateSalePreview() {
        if (!stockSelect || !previewContainer || !availableQtyLabel) return;
        const selectedItem = getInfraStock().find(item => item.name === stockSelect.value);
        if (!selectedItem) {
            previewContainer.innerHTML = '<div class="text-muted">No image available</div>';
            availableQtyLabel.textContent = '0';
            return;
        }

        availableQtyLabel.textContent = String(selectedItem.quantity || 0);
        if (selectedItem.photo) {
            previewContainer.innerHTML = `<img src="${selectedItem.photo}" alt="${selectedItem.name}" class="img-fluid rounded border" style="max-height: 180px; object-fit: cover;" />`;
        } else {
            previewContainer.innerHTML = '<div class="text-muted">No inventory image uploaded</div>';
        }
    }

    populateSaleStockOptions();

    if (stockSelect) {
        stockSelect.addEventListener('change', updateSalePreview);
    }

    if (saleForm) {
        saleForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const customer = document.getElementById('customerName')?.value.trim();
            const saleItem = document.getElementById('saleItem')?.value.trim();
            const saleQty = Number(document.getElementById('saleQty')?.value || 0);
            const unitRate = Number(document.getElementById('saleUnitRate')?.value || 0);
            const saleDateValue = document.getElementById('saleDate')?.value;
            const saleDate = saleDateValue ? formatDateToDDMMYYYY(saleDateValue) : getTodayDDMMYYYY();
            const paymentMode = document.getElementById('salePaymentMode')?.value || 'Cash';
            const receivedAmount = Number(document.getElementById('receivedAmount')?.value || 0);

            if (!customer || !saleItem || !saleQty) {
                alert('Customer name, item, and quantity are required.');
                return;
            }

            const stock = getInfraStock();
            const stockItem = stock.find(item => item.name.toLowerCase() === saleItem.toLowerCase());
            if (!stockItem) {
                alert('Selected stock item was not found.');
                return;
            }

            if (saleQty > Number(stockItem.quantity || 0)) {
                alert('Sale quantity exceeds available stock.');
                return;
            }

            const saleAmount = saleQty * unitRate;
            const sales = getInfraSales();
            sales.unshift({
                id: `SAL-${Date.now()}`,
                customer,
                item: saleItem,
                quantity: saleQty,
                unitRate,
                totalAmount: saleAmount,
                paymentMode,
                receivedAmount,
                date: saleDate,
                photo: stockItem.photo || '',
                createdAt: new Date().toISOString()
            });
            saveInfraCollection(INFRA_SALES_KEY, sales);

            const updatedStock = stock.map(item => {
                if (item.name.toLowerCase() === saleItem.toLowerCase()) {
                    return { ...item, quantity: Number(item.quantity || 0) - saleQty, lastUpdated: saleDate };
                }
                return item;
            });
            saveInfraCollection(INFRA_STOCK_KEY, updatedStock);

            const ledger = getInfraLedger();
            ledger.unshift({
                id: `LED-${Date.now()}`,
                party: customer,
                type: 'Sale',
                item: saleItem,
                invoice: `SALE-${Date.now()}`,
                amount: saleAmount,
                paid: receivedAmount,
                mode: paymentMode,
                date: saleDate,
                createdAt: new Date().toISOString()
            });
            saveInfraCollection(INFRA_LEDGER_KEY, ledger);

            alert('Sale saved, stock updated, and ledger entry created.');
            saleForm.reset();
            renderInfraSaleTable();
            renderInfraStockTable();
            renderInfraLedgerTable();
            populateSaleStockOptions();
        });
    }

    renderInfraSaleTable();
}

function renderInfraSaleTable() {
    const tableBody = document.getElementById('infraSaleTableBody');
    if (!tableBody) return;

    const sales = getInfraSales();
    tableBody.innerHTML = '';

    if (!sales.length) {
        tableBody.innerHTML = '<tr><td colspan="8" class="text-center text-muted py-4">No sales records found yet.</td></tr>';
        return;
    }

    sales.forEach(record => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${record.date || ''}</td>
            <td>${record.customer || ''}</td>
            <td>${record.item || ''}</td>
            <td class="text-end">${Number(record.quantity || 0)}</td>
            <td class="text-end">${Number(record.unitRate || 0).toFixed(2)}</td>
            <td class="text-end">${Number(record.totalAmount || 0).toFixed(2)}</td>
            <td>${record.photo ? '<span class="badge bg-primary">Photo</span>' : '<span class="badge bg-secondary">No Photo</span>'}</td>
        `;
        tableBody.appendChild(row);
    });
}

function initInfraLedgerPage() {
    const backBtn = document.getElementById('backToDashboardBtn');
    if (backBtn) {
        backBtn.addEventListener('click', function() {
            window.location.href = 'kohinoor-infra.html';
        });
    }

    renderInfraLedgerTable();
}

function getInfraLedgerSummary() {
    const ledger = getInfraLedger();
    const summaryMap = new Map();

    ledger.forEach(entry => {
        const party = (entry.party || '').trim();
        if (!party) return;

        if (!summaryMap.has(party)) {
            summaryMap.set(party, {
                party,
                purchase: 0,
                sale: 0,
                transactions: []
            });
        }

        const current = summaryMap.get(party);
        current.transactions.push(entry);

        const amount = Number(entry.amount || 0);
        if (entry.type === 'Purchase') {
            current.purchase += amount;
        } else if (entry.type === 'Sale') {
            current.sale += amount;
        }
    });

    return Array.from(summaryMap.values()).map(item => {
        const balance = Number(item.sale || 0) - Number(item.purchase || 0);
        const nature = balance > 0 ? 'Debtor' : balance < 0 ? 'Creditor' : 'Settled';
        return {
            ...item,
            balance,
            nature
        };
    }).sort((a, b) => a.party.localeCompare(b.party));
}

function renderInfraLedgerTable() {
    const partyTableBody = document.getElementById('infraLedgerPartyTableBody');
    const detailTableBody = document.getElementById('infraLedgerDetailTableBody');
    const accountTitle = document.getElementById('infraLedgerAccountTitle');

    if (!partyTableBody || !detailTableBody) return;

    const summary = getInfraLedgerSummary();
    partyTableBody.innerHTML = '';
    detailTableBody.innerHTML = '';

    if (!summary.length) {
        partyTableBody.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-4">No creditor or debtor accounts found yet.</td></tr>';
        if (accountTitle) accountTitle.textContent = 'Personal Transactions';
        return;
    }

    let selectedParty = sessionStorage.getItem('infraSelectedLedgerParty');
    if (!selectedParty || !summary.some(item => item.party === selectedParty)) {
        selectedParty = summary[0].party;
    }
    sessionStorage.setItem('infraSelectedLedgerParty', selectedParty);

    const selectedSummary = summary.find(item => item.party === selectedParty) || summary[0];
    if (accountTitle) {
        accountTitle.textContent = `${selectedSummary.party} - Personal Transactions`;
    }

    const selectedTransactions = [...(selectedSummary.transactions || [])].sort((a, b) => {
        const dateA = formatDateToYYYYMMDD(a.date || '');
        const dateB = formatDateToYYYYMMDD(b.date || '');
        return new Date(dateA) - new Date(dateB);
    });
    let runningBalance = 0;
    selectedTransactions.forEach(record => {
        const amount = Number(record.amount || 0);
        if (record.type === 'Purchase') {
            runningBalance += amount;
        } else if (record.type === 'Sale') {
            runningBalance -= amount;
        }

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${record.date || ''}</td>
            <td>${record.type || ''}</td>
            <td>${record.item || ''}</td>
            <td>${record.invoice || ''}</td>
            <td class="text-end">${amount.toFixed(2)}</td>
            <td>${record.mode || ''}</td>
            <td class="text-end">${runningBalance.toFixed(2)}</td>
        `;
        detailTableBody.appendChild(row);
    });

    summary.forEach(item => {
        const row = document.createElement('tr');
        row.style.cursor = 'pointer';
        row.style.background = item.party === selectedParty ? 'rgba(30, 58, 138, 0.06)' : '';
        row.addEventListener('click', function() {
            sessionStorage.setItem('infraSelectedLedgerParty', item.party);
            renderInfraLedgerTable();
        });

        const balance = Number(item.balance || 0);
        const balanceText = Math.abs(balance).toFixed(2);
        const natureLabel = item.nature === 'Debtor' ? 'Debtor' : item.nature === 'Creditor' ? 'Creditor' : 'Settled';

        row.innerHTML = `
            <td><strong>${item.party}</strong></td>
            <td class="text-end">${Number(item.purchase || 0).toFixed(2)}</td>
            <td class="text-end">${Number(item.sale || 0).toFixed(2)}</td>
            <td class="text-end">${balanceText}</td>
            <td>${natureLabel}</td>
        `;
        partyTableBody.appendChild(row);
    });

    if (!selectedTransactions.length) {
        detailTableBody.innerHTML = '<tr><td colspan="7" class="text-center text-muted py-4">No personal transactions found for this account.</td></tr>';
    }
}

function initInfraStockPage() {
    const backBtn = document.getElementById('backToDashboardBtn');
    if (backBtn) {
        backBtn.addEventListener('click', function() {
            window.location.href = 'kohinoor-infra.html';
        });
    }

    renderInfraStockTable();
}

function renderInfraStockTable() {
    const tableBody = document.getElementById('infraStockTableBody');
    if (!tableBody) return;

    const stock = getInfraStock();
    tableBody.innerHTML = '';

    if (!stock.length) {
        tableBody.innerHTML = '<tr><td colspan="7" class="text-center text-muted py-4">No stock items found yet.</td></tr>';
        return;
    }

    stock.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.name || ''}</td>
            <td class="text-end">${Number(item.quantity || 0)}</td>
            <td class="text-end">${Number(item.rate || 0).toFixed(2)}</td>
            <td>${item.supplier || ''}</td>
            <td>${item.lastUpdated || ''}</td>
            <td>${item.photo ? '<img src="' + item.photo + '" alt="Inventory" class="img-fluid rounded" style="max-width: 90px; max-height: 60px; object-fit: cover;" />' : '<span class="badge bg-secondary">No photo</span>'}</td>
            <td>${Number(item.quantity || 0) > 0 ? '<span class="badge bg-success">Available</span>' : '<span class="badge bg-warning text-dark">Out of stock</span>'}</td>
        `;
        tableBody.appendChild(row);
    });
}

// ================================
// Utility Functions
// ================================

// Prevent form resubmission on page refresh
if (window.history.replaceState) {
    window.history.replaceState(null, null, window.location.href);
}
