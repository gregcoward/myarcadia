document.addEventListener('DOMContentLoaded', () => {
    // Demo User Database
    const USERS_DB = {
        'jane.doe@redseabank.com': {
            email: 'jane.doe@redseabank.com',
            password: 'password123',
            name: 'Jane Doe',
            avatar: 'JD',
            status: 'Premium Tier',
            checkingNum: '•••• 4829',
            checkingBalance: 24150.25,
            savingsNum: '•••• 9102',
            savingsBalance: 104300.55,
            referralCode: 'JD-8902'
        },
        'alex.smith@redseabank.com': {
            email: 'alex.smith@redseabank.com',
            password: 'admin123',
            name: 'Alex Smith',
            avatar: 'AS',
            status: 'Standard Tier',
            checkingNum: '•••• 1094',
            checkingBalance: 5400.00,
            savingsNum: '•••• 7712',
            savingsBalance: 18250.00,
            referralCode: 'AS-1094'
        }
    };

    // Elements
    const loginModal = document.getElementById('login-modal');
    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');
    const logoutBtn = document.getElementById('logout-btn');

    const navAvatar = document.getElementById('nav-avatar');
    const navUserName = document.getElementById('nav-user-name');
    const navUserStatus = document.getElementById('nav-user-status');

    const portfolioBalanceEl = document.getElementById('portfolio-balance');
    const checkingBalanceEl = document.getElementById('checking-balance');
    const checkingNumEl = document.getElementById('checking-account-num');
    const savingsBalanceEl = document.getElementById('savings-balance');
    const savingsNumEl = document.getElementById('savings-account-num');
    const referralLinkInput = document.getElementById('referral-link');
    const sourceAccountSelect = document.getElementById('source-account');

    // Auth State Initialization
    function checkAuth() {
        const sessionUserEmail = sessionStorage.getItem('redsea_auth_user');
        if (sessionUserEmail && USERS_DB[sessionUserEmail]) {
            renderUserSession(USERS_DB[sessionUserEmail]);
            loginModal.classList.add('hidden');
        } else {
            loginModal.classList.remove('hidden');
        }
    }

    // Render User Session UI
    function renderUserSession(user) {
        if (navAvatar) navAvatar.textContent = user.avatar;
        if (navUserName) navUserName.textContent = user.name;
        if (navUserStatus) navUserStatus.textContent = user.status;

        const totalPortfolio = user.checkingBalance + user.savingsBalance;
        if (portfolioBalanceEl) portfolioBalanceEl.textContent = `$${totalPortfolio.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
        if (checkingBalanceEl) checkingBalanceEl.textContent = `$${user.checkingBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
        if (checkingNumEl) checkingNumEl.textContent = user.checkingNum;
        if (savingsBalanceEl) savingsBalanceEl.textContent = `$${user.savingsBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
        if (savingsNumEl) savingsNumEl.textContent = user.savingsNum;

        if (referralLinkInput) {
            referralLinkInput.value = `https://redseabank.apps.openshift.com/invite/${user.referralCode}`;
        }

        if (sourceAccountSelect) {
            sourceAccountSelect.innerHTML = `
                <option value="checking">Checking Account (${user.checkingNum}) - $${user.checkingBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</option>
                <option value="savings">Savings Account (${user.savingsNum}) - $${user.savingsBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</option>
            `;
        }
    }

    // Handle Login Submit
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value.trim().toLowerCase();
            const password = document.getElementById('login-password').value;

            const matchedUser = USERS_DB[email];
            if (matchedUser && matchedUser.password === password) {
                sessionStorage.setItem('redsea_auth_user', matchedUser.email);
                loginError.classList.add('hidden');
                renderUserSession(matchedUser);
                loginModal.classList.add('hidden');
            } else {
                loginError.classList.remove('hidden');
            }
        });
    }

    // Quick Login Chips Autofill
    const chips = document.querySelectorAll('.chip');
    chips.forEach(chip => {
        chip.addEventListener('click', () => {
            const email = chip.getAttribute('data-email');
            const pass = chip.getAttribute('data-pass');
            document.getElementById('login-email').value = email;
            document.getElementById('login-password').value = pass;
        });
    });

    // Logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            sessionStorage.removeItem('redsea_auth_user');
            loginModal.classList.remove('hidden');
        });
    }

    // Check Auth on load
    checkAuth();

    // Navigation Tab Switching
    const navButtons = document.querySelectorAll('.nav-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');

            navButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(tab => tab.classList.remove('active'));

            button.classList.add('active');
            const targetContent = document.getElementById(targetTab);
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });

    // Money Transfer Form Handling
    const transferForm = document.getElementById('transfer-form');
    const transferAlert = document.getElementById('transfer-alert');
    const transactionsBody = document.getElementById('transactions-body');

    if (transferForm) {
        transferForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const recipient = document.getElementById('recipient-name').value;
            const amount = parseFloat(document.getElementById('transfer-amount').value).toFixed(2);
            const note = document.getElementById('transfer-note').value || 'Transfer';

            transferAlert.className = 'alert success';
            transferAlert.textContent = `Success! Transferred $${amount} to ${recipient}. Processing via /api/v1/transfer.`;
            transferAlert.classList.remove('hidden');

            if (transactionsBody) {
                const newRow = document.createElement('tr');
                const today = new Date().toISOString().split('T')[0];
                newRow.innerHTML = `
                    <td>${today}</td>
                    <td>To: ${recipient} (${note})</td>
                    <td>Transfer</td>
                    <td><code>/api/v1/transfer</code></td>
                    <td class="amount negative">-$${amount}</td>
                    <td><span class="status-pill status-completed">Completed</span></td>
                `;
                transactionsBody.insertBefore(newRow, transactionsBody.firstChild);
            }

            transferForm.reset();

            setTimeout(() => {
                transferAlert.classList.add('hidden');
            }, 5000);
        });
    }

    // Referral Form Handling
    const referralForm = document.getElementById('referral-email-form');
    const referralAlert = document.getElementById('referral-alert');

    if (referralForm) {
        referralForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('friend-email').value;

            referralAlert.className = 'alert success';
            referralAlert.textContent = `Invitation successfully dispatched to ${email} via /app3/referral!`;
            referralAlert.classList.remove('hidden');

            referralForm.reset();

            setTimeout(() => {
                referralAlert.classList.add('hidden');
            }, 5000);
        });
    }

    // Copy Referral Link
    const copyBtn = document.getElementById('copy-link-btn');

    if (copyBtn && referralLinkInput) {
        copyBtn.addEventListener('click', () => {
            referralLinkInput.select();
            navigator.clipboard.writeText(referralLinkInput.value).then(() => {
                copyBtn.textContent = 'Copied!';
                setTimeout(() => {
                    copyBtn.textContent = 'Copy';
                }, 2000);
            }).catch(() => {
                copyBtn.textContent = 'Copied!';
            });
        });
    }

    // Refresh Transactions Button
    const refreshBtn = document.getElementById('refresh-txs');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            refreshBtn.textContent = 'Refreshing...';
            setTimeout(() => {
                refreshBtn.textContent = 'Refresh';
            }, 600);
        });
    }
});
