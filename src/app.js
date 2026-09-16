document.addEventListener('DOMContentLoaded', () => {
    // Navigation Tab Switching
    const navButtons = document.querySelectorAll('.nav-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');

            // Deactivate all
            navButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(tab => tab.classList.remove('active'));

            // Activate target
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

            // Show success alert
            transferAlert.className = 'alert success';
            transferAlert.textContent = `Success! Transferred $${amount} to ${recipient}. Processing via /api/v1/transfer.`;
            transferAlert.classList.remove('hidden');

            // Prepend transaction row to table
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

            // Reset form
            transferForm.reset();

            // Hide alert after 5 seconds
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
    const referralInput = document.getElementById('referral-link');

    if (copyBtn && referralInput) {
        copyBtn.addEventListener('click', () => {
            referralInput.select();
            navigator.clipboard.writeText(referralInput.value).then(() => {
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
