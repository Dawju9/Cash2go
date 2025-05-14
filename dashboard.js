
document.addEventListener('DOMContentLoaded', () => {
    // Initialize balance and transaction state
    let balance = 0;
    const balanceDisplay = document.getElementById('balance');
    const sendMoneyBtn = document.getElementById('sendMoney');
    const requestMoneyBtn = document.getElementById('requestMoney');

    // Initialize scratch card
    const scratchCardContainer = document.createElement('div');
    scratchCardContainer.className = 'scratch-card-container';
    document.querySelector('#home').appendChild(scratchCardContainer);

    const scratchCard = new ScratchCard(scratchCardContainer, {
        rewards: [0, 0, 0, 5, 10, 20, 50, 100, 500],
        requiredScratched: 6
    });

    // Update balance display
    const updateBalance = (amount) => {
        balance += amount;
        balanceDisplay.textContent = `$${balance.toFixed(2)}`;
    };

    // Handle scratch card completion
    scratchCardContainer.addEventListener('scratchcard:complete', (e) => {
        updateBalance(e.detail.totalWinnings);
        setTimeout(() => {
            scratchCard.reset();
        }, 2000);
    });

    // Send money handler
    sendMoneyBtn.addEventListener('click', () => {
        const amount = parseFloat(prompt('Enter amount to send:'));
        if (amount && amount <= balance) {
            updateBalance(-amount);
        } else {
            alert('Invalid amount or insufficient funds');
        }
    });

    // Request money handler
    requestMoneyBtn.addEventListener('click', () => {
        const amount = parseFloat(prompt('Enter amount to request:'));
        if (amount) {
            alert(`Money request for $${amount.toFixed(2)} has been sent`);
        }
    });
});
