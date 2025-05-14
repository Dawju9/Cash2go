
// Dashboard.js - Cash2go Scratchers Management Dashboard

// Import required libraries
import QRScanner from 'html5-qrcode';
import Chart from 'chart.js';

class Dashboard {
    /**
     * Initializes the dashboard.
     *
     * @constructor
     * @private
     */
    constructor() {
        this.stats = {
            totalScratchers: 0,
            scratchedCount: 0,
            totalWinnings: 0,
            pendingPayouts: 0
        };
        this.init();
    }

    init() {
        this.initializeQRScanner();
        this.loadDashboardStats();
        this.setupEventListeners();
        this.renderCharts();
    }

    initializeQRScanner() {
        this.qrScanner = new QRScanner("qr-reader", {
            fps: 10,
            qrbox: 250,
            showScanTime: true,
            scanType: 'scanned-code'
        });
        
        this.qrScanner.start(
            (decodedText) => this.handleQRScan(decodedText),
            (error) => console.error(error)
        );
    }

    async loadDashboardStats() {
        try {
            const response = await fetch('/api/dashboard/stats');
            this.stats = await response.json();
            this.updateDashboardUI();
        } catch (error) {
            console.error('Failed to load dashboard stats:', error);
        }
    }

    handleQRScan(scratcherCode) {
        fetch('/api/scratchers/verify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ code: scratcherCode })
        })
        .then(response => response.json())
        .then(data => this.displayScratcherResult(data))
        .catch(error => console.error('Error verifying scratcher:', error));
    }

    displayScratcherResult(result) {
        const resultContainer = document.getElementById('scratcher-result');
        resultContainer.innerHTML = `
            <div class="result-card ${result.isWinner ? 'winner' : 'no-win'}">
                <h3>Scratcher Result</h3>
                <p>Code: ${result.code}</p>
                <p>Status: ${result.status}</p>
                ${result.isWinner ? `<p>Prize Amount: ${result.prizeAmount} PLN</p>` : ''}
            </div>
        `;
    }

    renderCharts() {
        // Sales Chart
        new Chart(document.getElementById('sales-chart'), {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Monthly Sales',
                    data: [65, 59, 80, 81, 56, 55],
                    borderColor: '#4CAF50'
                }]
            },
            options: {
                title: {
                    display: true,
                    text: 'Monthly Sales'
                },
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                }
            }
        });

        // Winnings Distribution Chart
        new Chart(document.getElementById('winnings-chart'), {
            type: 'pie',
            data: {
                labels: ['Small Prizes', 'Medium Prizes', 'Large Prizes'],
                datasets: [{
                    data: [70, 25, 5],
                    backgroundColor: ['#FFC107', '#2196F3', '#F44336']
                }]
            },
            options: {
                title: {
                    display: true,
                    text: 'Winnings Distribution'
                }
            }
        });
    }

    updateDashboardUI() {
        document.getElementById('total-scratchers').textContent = this.stats.totalScratchers;
        document.getElementById('scratched-count').textContent = this.stats.scratchedCount;
        document.getElementById('total-winnings').textContent = `${this.stats.totalWinnings} PLN`;
        document.getElementById('pending-payouts').textContent = `${this.stats.pendingPayouts} PLN`;
    }

    setupEventListeners() {
        document.getElementById('generate-report').addEventListener('click', () => this.generateReport());
        document.getElementById('refresh-stats').addEventListener('click', () => this.loadDashboardStats());
    }

    async generateReport() {
        try {
            const response = await fetch('/api/reports/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            const report = await response.blob();
            const url = window.URL.createObjectURL(report);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'scratchers-report.pdf';
            a.click();
        } catch (error) {
            console.error('Failed to generate report:', error);
        }
    }
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    const dashboard = new Dashboard();
});

export default Dashboard;
