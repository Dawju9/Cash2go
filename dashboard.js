const dashboardContainer = document.getElementById("dashboard-container");
const statsContainer = document.getElementById("stats-container");
const qrScannerContainer = document.getElementById("qr-scanner-container");
const actionsContainer = document.getElementById("actions");

const totalScratchersElement = document.getElementById("total-scratchers");
const scratchedCountElement = document.getElementById("scratched-count");
const totalWinningsElement = document.getElementById("total-winnings");
const pendingPayoutsElement = document.getElementById("pending-payouts");

const generateReportButton = document.getElementById("generate-report");
const refreshStatsButton = document.getElementById("refresh-stats");

let totalScratchers = 0;
let scratchedCount = 0;
let totalWinnings = 0;
let pendingPayouts = 0;

function updateDashboardStats() {
    totalScratchersElement.textContent = totalScratchers;
    scratchedCountElement.textContent = scratchedCount;
    totalWinningsElement.textContent = `${totalWinnings} PLN`;
    pendingPayoutsElement.textContent = `${pendingPayouts} PLN`;
}

generateReportButton.addEventListener('click', () => {
    const report = {
        totalScratchers,
        scratchedCount,
        totalWinnings,
        pendingPayouts,
        timestamp: new Date().toISOString()
    };
    console.log('Generated Report:', report);
    // Here you would typically send this to a server or generate a PDF
});

refreshStatsButton.addEventListener('click', () => {
    // Simulate fetching updated stats from server
    totalScratchers += Math.floor(Math.random() * 10);
    updateDashboardStats();
});

// Initialize sales chart
const salesChart = new Chart(
    document.getElementById('sales-chart').getContext('2d'),
    {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Scratchers Sold',
                data: [65, 59, 80, 81, 56, 55],
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            }]
        }
    }
);

// Initialize winnings chart
const winningsChart = new Chart(
    document.getElementById('winnings-chart').getContext('2d'),
    {
        type: 'bar',
        data: {
            labels: ['5 PLN', '10 PLN', '50 PLN', '100 PLN'],
            datasets: [{
                label: 'Prize Distribution',
                data: [30, 20, 10, 5],
                backgroundColor: [
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)'
                ],
                borderColor: [
                    'rgb(75, 192, 192)',
                    'rgb(54, 162, 235)',
                    'rgb(153, 102, 255)',
                    'rgb(255, 159, 64)'
                ],
                borderWidth: 1
            }]
        }
    }
);

// Initialize QR scanner
const html5QrcodeScanner = new Html5QrcodeScanner(
    "qr-reader", { fps: 10, qrbox: 250 }
);

html5QrcodeScanner.render((decodedText) => {
    document.getElementById('scratcher-result').innerHTML = 
        `Scanned Scratcher ID: ${decodedText}`;
});

// Initial stats update
updateDashboardStats();
