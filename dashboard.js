  // Dashboard.js - Cash2go Scratchers Management Dashboard

  // Import required libraries
  import QRScanner from 'html5-qrcode';
  import Chart from 'chart.js';

  class Dashboard {
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
          this.initializeScratchCards();
      }

      initializeScratchCards() {
          const tiles = document.querySelectorAll('.tile');
          tiles.forEach(tile => this.setupScratchTile(tile));
      }

      setupScratchTile(tile) {
          const ctx = tile.getContext('2d');
          const prize = this.pickPrize();
          let isScratched = false;
          let scratchProgress = 0;

          // Initial tile setup
          ctx.fillStyle = "#9ca3af";
          ctx.fillRect(0, 0, tile.width, tile.height);
          tile.dataset.prize = prize;

          const scratch = (e) => {
              if (isScratched) return;
            
              const rect = tile.getBoundingClientRect();
              const x = (e.clientX || e.touches[0].clientX) - rect.left;
              const y = (e.clientY || e.touches[0].clientY) - rect.top;

              ctx.globalCompositeOperation = 'destination-out';
              ctx.beginPath();
              ctx.arc(x, y, 10, 0, Math.PI * 2);
              ctx.fill();

              scratchProgress += 1;
            
              if (scratchProgress > 20) {
                  this.revealTile(tile, ctx, prize);
                  isScratched = true;
              }
          };

          tile.addEventListener('mousemove', (e) => {
              if (e.buttons === 1) scratch(e);
          });
        
          tile.addEventListener('touchmove', (e) => {
              e.preventDefault();
              scratch(e);
          });
      }

      pickPrize() {
          const prizePool = [
              { value: 0, chance: 0.5 },
              { value: 5, chance: 0.2 },
              { value: 10, chance: 0.15 },
              { value: 50, chance: 0.1 },
              { value: 100, chance: 0.05 }
          ];

          const rand = Math.random();
          let acc = 0;
        
          for (const prize of prizePool) {
              acc += prize.chance;
              if (rand < acc) return prize.value;
          }
          return 0;
      }

      revealTile(tile, ctx, prize) {
          ctx.globalCompositeOperation = 'source-over';
          ctx.clearRect(0, 0, tile.width, tile.height);
        
          tile.style.backgroundColor = prize > 0 ? '#10b981' : '#6b7280';
          ctx.fillStyle = prize > 0 ? 'white' : '#d1d5db';
        
          ctx.font = '12px Montserrat';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(`${prize} PLN`, tile.width/2, tile.height/2);

          this.updateStats(prize);
      }

      updateStats(prize) {
          this.stats.scratchedCount++;
          if (prize > 0) {
              this.stats.totalWinnings += prize;
          }
          this.updateDashboardUI();
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
                  responsive: true,
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
                  responsive: true,
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

  // Initialize dashboard when DOM is loaded
  document.addEventListener('DOMContentLoaded', () => {
      const dashboard = new Dashboard();
  });

  export default Dashboard;