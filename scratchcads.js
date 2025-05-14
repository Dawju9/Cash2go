  // Initialize balance
  let balance = 0.00;

  // Update balance display
  function updateBalance() {
      const balanceElement = document.getElementById('balance');
      balanceElement.textContent = `${balance.toFixed(2)} PLN`;
  }

  // Send money function
  function sendMoney() {
      const amount = parseFloat(prompt('Enter amount to send:'));
      if (isNaN(amount) || amount <= 0) {
          alert('Please enter a valid amount');
          return;
      }
      if (amount > balance) {
          alert('Insufficient funds');
          return;
      }
      balance -= amount;
      updateBalance();
      alert(`Successfully sent ${amount.toFixed(2)} PLN`);
  }

  // Request money function
  function requestMoney() {
      const amount = parseFloat(prompt('Enter amount to request:'));
      if (isNaN(amount) || amount <= 0) {
          alert('Please enter a valid amount');
          return;
      }
      balance += amount;
      updateBalance();
      alert(`Successfully received ${amount.toFixed(2)} PLN`);
  }

  // Event listeners
  document.addEventListener('DOMContentLoaded', () => {
      updateBalance();
      document.getElementById('sendMoney').addEventListener('click', sendMoney);
      document.getElementById('requestMoney').addEventListener('click', requestMoney);
  });
