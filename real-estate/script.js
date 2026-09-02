/* ================================
   Kohinoor Group Script
   ================================ */

// Demo credentials
const DEMO_CREDENTIALS = {
    username: 'admin',
    password: 'admin123'
};

// Check if user is logged in
function checkAuth() {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    const currentPage = window.location.pathname.split('/').pop();
    
    if (isLoggedIn === 'true' && currentPage === 'index.html') {
        window.location.href = 'dashboard.html';
    } else if (isLoggedIn !== 'true' && currentPage === 'dashboard.html') {
        window.location.href = 'index.html';
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    
    const currentPage = window.location.pathname.split('/').pop();
    
    if (currentPage === 'index.html') {
        initLoginPage();
    } else if (currentPage === 'dashboard.html') {
        initDashboardPage();
    } else if (currentPage === 'mango.html') {
        initMangoPage();
    } else if (currentPage === 'purchase-entry.html') {
        initPurchaseEntryPage();
    } else if (currentPage === 'bill-entry.html') {
        initBillEntryPage();
    }
});

// ================================
// Login Page Functions
// ================================

function initLoginPage() {
    const loginForm = document.getElementById('loginForm');
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');
    
    // Toggle password visibility
    if (togglePassword) {
        togglePassword.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            
            const icon = this.querySelector('i');
            icon.classList.toggle('fa-eye');
            icon.classList.toggle('fa-eye-slash');
        });
    }
    
    // Handle login form submission
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleLogin();
        });
    }
}

function handleLogin() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const loginBtn = document.getElementById('loginBtn');
    const errorMessage = document.getElementById('errorMessage');
    
    // Hide previous error message
    errorMessage.style.display = 'none';
    
    // Show loading state
    loginBtn.classList.add('loading');
    loginBtn.disabled = true;
    
    // Simulate API call delay
    setTimeout(function() {
        // Validate credentials
        if (username === DEMO_CREDENTIALS.username && password === DEMO_CREDENTIALS.password) {
            // Successful login
            sessionStorage.setItem('isLoggedIn', 'true');
            sessionStorage.setItem('username', username);
            
            // Remove loading state
            loginBtn.classList.remove('loading');
            loginBtn.disabled = false;
            
            // Redirect to dashboard
            window.location.href = 'dashboard.html';
        } else {
            // Failed login
            errorMessage.textContent = 'Invalid Username or Password.';
            errorMessage.style.display = 'block';
            
            // Remove loading state
            loginBtn.classList.remove('loading');
            loginBtn.disabled = false;
            
            // Clear password field
            document.getElementById('password').value = '';
            
            // Focus on password field
            document.getElementById('password').focus();
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

function initPurchaseEntryPage() {
    const logoutBtn = document.getElementById('logoutBtn');
    const backButtons = document.querySelectorAll('#backToMangoBtn, #backToMangoBtnSecondary');
    const clearBtn = document.getElementById('clearFormBtn');
    const purchaseForm = document.getElementById('purchaseForm');
    const addRowBtn = document.getElementById('addRowBtn');
    const detailsBody = document.getElementById('purchaseDetailsBody');
    const freightEntry = document.getElementById('freightEntry');
    const cash = document.getElementById('cash');
    const unloadCharges = document.getElementById('unloadCharges');
    const totalExpense = document.getElementById('totalExpense');
    const addBillBtn = document.getElementById('addBillBtn');

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
        });
    }

    if (addRowBtn && detailsBody) {
        addRowBtn.addEventListener('click', function() {
            addDetailRow();
        });
    }

    [freightEntry, cash, unloadCharges].forEach(input => {
        if (input) {
            input.addEventListener('input', updateTotalExpense);
        }
    });

    if (addBillBtn) {
        addBillBtn.addEventListener('click', function() {
            window.open('bill-entry.html', '_blank');
        });
    }

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
                farmerName: document.getElementById('farmerName').value
            };

            const detailRows = Array.from(detailsBody.querySelectorAll('tr')).map((row, index) => {
                const inputs = row.querySelectorAll('input');
                return {
                    serialNo: index + 1,
                    variety: inputs[0].value,
                    crates: inputs[1].value,
                    juiceLine: inputs[2].value,
                    requirements: inputs[3].value
                };
            });

            const expenseData = {
                freightEntry: freightEntry ? freightEntry.value : '',
                cash: cash ? cash.value : '',
                unloadCharges: unloadCharges ? unloadCharges.value : '',
                total: totalExpense ? totalExpense.value : '',
                inchargeName: document.getElementById('inchargeName').value
            };

            console.log('Purchase Entry Saved:', { headerData, detailRows, expenseData });
            alert('Purchase entry saved successfully.');
            purchaseForm.reset();
            resetDetailRows();
            if (totalExpense) {
                totalExpense.value = '';
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
        <td><input type="text" class="form-control form-control-sm" placeholder="Enter variety"></td>
        <td><input type="number" class="form-control form-control-sm" min="1" placeholder="0"></td>
        <td><input type="text" class="form-control form-control-sm" placeholder="Enter juice/line"></td>
        <td><input type="text" class="form-control form-control-sm" placeholder="Enter requirements"></td>
        <td><button type="button" class="btn btn-outline-danger btn-sm delete-row-btn"><i class="fas fa-trash"></i></button></td>
    `;
    detailsBody.appendChild(newRow);
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
            <td><input type="text" class="form-control form-control-sm" placeholder="Enter variety"></td>
            <td><input type="number" class="form-control form-control-sm" min="1" placeholder="0"></td>
            <td><input type="text" class="form-control form-control-sm" placeholder="Enter juice/line"></td>
            <td><input type="text" class="form-control form-control-sm" placeholder="Enter requirements"></td>
            <td><button type="button" class="btn btn-outline-danger btn-sm delete-row-btn"><i class="fas fa-trash"></i></button></td>
        </tr>
    `;
}

function updateTotalExpense() {
    const freightEntry = document.getElementById('freightEntry');
    const cash = document.getElementById('cash');
    const unloadCharges = document.getElementById('unloadCharges');
    const totalExpense = document.getElementById('totalExpense');

    if (!freightEntry || !cash || !unloadCharges || !totalExpense) return;

    const freight = parseFloat(freightEntry.value) || 0;
    const cashAmount = parseFloat(cash.value) || 0;
    const unload = parseFloat(unloadCharges.value) || 0;

    totalExpense.value = (freight + cashAmount + unload).toFixed(2);
}

function initBillEntryPage() {
    const logoutBtn = document.getElementById('logoutBtn');
    const backButtons = document.querySelectorAll('#backToPurchaseBtn, #backToPurchaseBtnSecondary');
    const clearBtn = document.getElementById('clearBillBtn');
    const billForm = document.getElementById('billEntryForm');
    const addBillRowBtn = document.getElementById('addBillRowBtn');
    const billDetailsBody = document.getElementById('billDetailsBody');
    const printBillBtn = document.getElementById('printBillBtn');

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
        if (e.target.classList.contains('bill-qty') || e.target.classList.contains('bill-rate')) {
            updateBillRowAmount(e.target.closest('tr'));
            updateBillGrandTotal();
        }
    });

    if (billForm) {
        billForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const billData = {
                farmerName: document.getElementById('billFarmerName').value,
                serialNo: document.getElementById('billSerialNo').value,
                date: document.getElementById('billDate').value,
                rows: Array.from(billDetailsBody.querySelectorAll('tr')).map((row, index) => {
                    const inputs = row.querySelectorAll('input');
                    return {
                        actualRate: inputs[0].value,
                        serialNo: index + 1,
                        variety: inputs[1].value,
                        qty: inputs[2].value,
                        rate: inputs[3].value,
                        amount: inputs[4].value
                    };
                }),
                grandTotal: document.getElementById('grandTotalAmount').textContent
            };

            console.log('Bill Entry Saved:', billData);
            alert('Bill entry saved successfully.');
            billForm.reset();
            resetBillRows();
            populateBillDefaults();
        });
    }
}

function populateBillDefaults() {
    const farmerNameField = document.getElementById('farmerName');
    const arrivalNoField = document.getElementById('arrivalNo');
    const dateField = document.getElementById('date');

    const billFarmerName = document.getElementById('billFarmerName');
    const billSerialNo = document.getElementById('billSerialNo');
    const billDate = document.getElementById('billDate');

    if (billFarmerName && farmerNameField) {
        billFarmerName.value = farmerNameField.value;
    }
    if (billSerialNo && arrivalNoField) {
        billSerialNo.value = arrivalNoField.value;
    }
    if (billDate && dateField) {
        billDate.value = dateField.value;
    }
}

function addBillDetailRow() {
    const billDetailsBody = document.getElementById('billDetailsBody');
    if (!billDetailsBody) return;

    const rowCount = billDetailsBody.children.length + 1;
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td>
            <div class="input-group input-group-sm">
                <input type="number" class="form-control bill-actual-rate" min="0" step="0.01" placeholder="0">
                <span class="input-group-text">/-</span>
            </div>
        </td>
        <td>${rowCount}</td>
        <td><input type="text" class="form-control form-control-sm" placeholder="Enter variety"></td>
        <td><input type="number" class="form-control form-control-sm bill-qty" min="0" step="1" placeholder="0"></td>
        <td><input type="number" class="form-control form-control-sm bill-rate" min="0" step="0.01" placeholder="0"></td>
        <td><input type="number" class="form-control form-control-sm bill-amount" readonly placeholder="0"></td>
        <td><button type="button" class="btn btn-outline-danger btn-sm delete-bill-row-btn"><i class="fas fa-trash"></i></button></td>
    `;
    billDetailsBody.appendChild(newRow);
}

function renumberBillRows() {
    const rows = document.querySelectorAll('#billDetailsBody tr');
    rows.forEach((row, index) => {
        const serialCell = row.querySelectorAll('td')[1];
        if (serialCell) {
            serialCell.textContent = index + 1;
        }
    });
}

function updateBillRowAmount(row) {
    const qtyInput = row.querySelector('.bill-qty');
    const rateInput = row.querySelector('.bill-rate');
    const amountInput = row.querySelector('.bill-amount');

    if (!qtyInput || !rateInput || !amountInput) return;

    const qty = parseFloat(qtyInput.value) || 0;
    const rate = parseFloat(rateInput.value) || 0;
    amountInput.value = (qty * rate).toFixed(2);
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

    grandTotalElement.textContent = total.toFixed(2);
}

function printBill() {
    const billData = {
        farmerName: document.getElementById('billFarmerName').value || 'N/A',
        serialNo: document.getElementById('billSerialNo').value || 'N/A',
        date: document.getElementById('billDate').value || 'N/A',
        actualRate: document.querySelector('#billDetailsBody .bill-actual-rate')?.value || 'N/A'
    };

    const rows = Array.from(document.querySelectorAll('#billDetailsBody tr')).map((row, index) => {
        const inputs = row.querySelectorAll('input');
        return {
            serialNo: index + 1,
            variety: inputs[1].value || '',
            qty: inputs[2].value || '',
            rate: inputs[3].value || '',
            amount: inputs[4].value || ''
        };
    });

    const rowsMarkup = rows.map(row => `
        <tr>
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
                    <div><strong>S. No.:</strong> ${billData.serialNo}</div>
                    <div><strong>Date:</strong> ${billData.date}</div>
                    <div><strong>Actual Rate:</strong> ${billData.actualRate}</div>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>S. No.</th>
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
                    <input type="number" class="form-control bill-actual-rate" min="0" step="0.01" placeholder="0">
                    <span class="input-group-text">/-</span>
                </div>
            </td>
            <td>1</td>
            <td><input type="text" class="form-control form-control-sm" placeholder="Enter variety"></td>
            <td><input type="number" class="form-control form-control-sm bill-qty" min="0" step="1" placeholder="0"></td>
            <td><input type="number" class="form-control form-control-sm bill-rate" min="0" step="0.01" placeholder="0"></td>
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

function handleCardClick(card) {
    const businessType = card.getAttribute('data-business');
    const businessNames = {
        'building': 'Kohinoor Building Solutions',
        'estates': 'Kohinoor Estates & Developers',
        'mango': 'Kohinoor Mango Traders',
        'fuel': 'Kohinoor Fuel Station'
    };
    
    const businessName = businessNames[businessType] || 'Business';
    
    // Add click animation
    card.style.transform = 'scale(0.98)';
    setTimeout(() => {
        card.style.transform = '';
    }, 150);
    
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

    alert(`Opening ${cardTitle}...\n\nThis would navigate to the ${cardTitle} module.`);
}

// ================================
// Utility Functions
// ================================

// Prevent form resubmission on page refresh
if (window.history.replaceState) {
    window.history.replaceState(null, null, window.location.href);
}

function addPropertyRow() {
    const tableBody = document.querySelector("table tbody");

    const newRow = document.createElement("tr");

    newRow.innerHTML = `
        <td>
            <input type="text" placeholder="Enter Property ID">
        </td>

        <td>
            <input type="text" placeholder="Enter Property Name">
        </td>

        <td>
            <input type="text" placeholder="Enter Location">
        </td>

        <td>
            <select>
                <option value="">Select Type</option>
                <option>Residential</option>
                <option>Commercial</option>
                <option>Apartment</option>
            </select>
        </td>

        <td>
            <select>
                <option value="">Select Status</option>
                <option>Available</option>
                <option>Occupied</option>
                <option>Under Maintenance</option>
            </select>
        </td>
    `;

    tableBody.appendChild(newRow);
}
