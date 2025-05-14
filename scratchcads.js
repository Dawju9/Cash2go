// scratchcard.css
.scratch-card { 
    position: relative;
    width: 320px;
    height: 160px;        
    background-color: #ccc;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    overflow: hidden;
}

.tiles {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    grid-template-rows: repeat(6, 1fr);     
    grid-gap: 2px;  
    background-color: #fff;
    padding: 4px;
}

.tile {
    width: 100%;
    height: 100%;
    cursor: pointer;
    background-color: #e0e0e0;
    border-radius: 4px;
    transition: background-color 0.2s ease;
}

.tile:hover {
    background-color: #d0d0d0;
}

.tile.scratched {
    background-color: transparent;
}

.reward {
    position: absolute;
    font-size: 14px;
    font-weight: bold;
    color: #333;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s ease;
}

.reward.revealed {
    opacity: 1;
}// scratchcard.js
class ScratchCard {
    constructor(container, options = {}) {
        this.container = container;
        this.options = {
            width: options.width || 320,
            height: options.height || 160,
            gridSize: options.gridSize || 12,
            rewards: options.rewards || [0, 0, 0, 5, 10, 20, 50, 100, 500],
            requiredScratched: options.requiredScratched || 6
        };

        this.state = {
            scratchedTiles: 0,
            totalWinnings: 0,
            isGameComplete: false,
            isScratching: false,
            lastX: 0,
            lastY: 0
        };

        this.init();
    }

    init() {
        this.createScratchCard();
        this.setupCursor();
        this.setupEventListeners();
        this.shuffledRewards = this.shuffleArray([...this.options.rewards]);
    }

    createScratchCard() {
        this.scratchCard = document.createElement('div');
        this.scratchCard.className = 'scratch-card';
        
        this.tilesContainer = document.createElement('div');
        this.tilesContainer.className = 'tiles';
        
        this.tiles = Array(this.options.gridSize).fill().map(() => {
            const canvas = document.createElement('canvas');
            canvas.className = 'tile';
            canvas.width = 40;
            canvas.height = 40;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#ccc';
            ctx.fillRect(0, 0, 40, 40);
            return canvas;
        });

        this.tiles.forEach(tile => this.tilesContainer.appendChild(tile));
        this.scratchCard.appendChild(this.tilesContainer);
        this.container.appendChild(this.scratchCard);
    }

    setupCursor() {
        this.cursor = document.createElement('div');
        this.cursor.id = 'scratch-cursor';
        this.scratchCard.appendChild(this.cursor);
    }

    setupEventListeners() {
        document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        document.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        document.addEventListener('mouseup', () => this.handleMouseUp());

        this.tiles.forEach((tile, index) => {
            const ctx = tile.getContext('2d');
            let isScratched = false;

            const scratchHandler = (e) => {
                if (!isScratched && this.state.isScratching) {
                    const scratchedPixels = this.handleScratch(e, tile, ctx, index);
                    if (scratchedPixels > 50) {
                        isScratched = true;
                        this.state.scratchedTiles++;
                        this.revealReward(index, ctx);
                        
                        if (this.state.scratchedTiles === this.options.requiredScratched) {
                            this.state.isGameComplete = true;
                            this.updateStats();
                        }
                    }
                }
            };

            tile.addEventListener('mousemove', (e) => {
                if (this.state.isScratching) scratchHandler(e);
            });

            tile.addEventListener('mousedown', (e) => {
                if (!isScratched) scratchHandler(e);
            });

            tile.addEventListener('touchmove', (e) => {
                e.preventDefault();
                scratchHandler(e);
            });
        });
    }

    handleMouseMove(e) {
        this.state.lastX = e.clientX;
        this.state.lastY = e.clientY;
        if (this.state.isScratching) {
            this.cursor.style.display = 'block';
            this.cursor.style.left = this.state.lastX + 'px';
            this.cursor.style.top = this.state.lastY + 'px';
        }
    }

    handleMouseDown(e) {
        this.state.isScratching = true;
        this.state.lastX = e.clientX;
        this.state.lastY = e.clientY;
        this.cursor.style.display = 'block';
        this.cursor.style.left = this.state.lastX + 'px';
        this.cursor.style.top = this.state.lastY + 'px';
    }

    handleMouseUp() {
        this.state.isScratching = false;
        this.cursor.style.display = 'none';
    }

    handleScratch(e, tile, ctx, index) {
        if (this.state.isGameComplete) return;
        const rect = tile.getBoundingClientRect();
        const x = (e.clientX || e.touches?.[0]?.clientX || this.state.lastX) - rect.left;
        const y = (e.clientY || e.touches?.[0]?.clientY || this.state.lastY) - rect.top;

        if (x < 0 || x > tile.width || y < 0 || y > tile.height) return 0;

        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fill();

        this.createScratchParticles(ctx, x, y);
        return this.getScrathedPercentage(ctx);
    }

    createScratchParticles(ctx, x, y) {
        for (let i = 0; i < 5; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * 5;
            const particleX = x + Math.cos(angle) * radius;
            const particleY = y + Math.sin(angle) * radius;
            
            ctx.beginPath();
            ctx.arc(particleX, particleY, 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    getScrathedPercentage(ctx) {
        const imageData = ctx.getImageData(0, 0, 40, 40);
        const pixels = imageData.data;
        let transparentPixels = 0;
        
        for (let i = 3; i < pixels.length; i += 4) {
            if (pixels[i] === 0) transparentPixels++;
        }
        
        return (transparentPixels / (40 * 40)) * 100;
    }

    revealReward(index, ctx) {
        ctx.globalCompositeOperation = 'source-over';
        ctx.clearRect(0, 0, 40, 40);
        ctx.fillStyle = '#4CAF50';
        ctx.fillRect(0, 0, 40, 40);
        ctx.fillStyle = 'white';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.shuffledRewards[index] + ' PLN', 20, 20);
        
        if (this.state.scratchedTiles <= this.options.requiredScratched) {
            this.state.totalWinnings += this.shuffledRewards[index];
        }
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    updateStats() {
        const event = new CustomEvent('scratchcard:complete', {
            detail: {
                totalWinnings: this.state.totalWinnings,
                scratchedTiles: this.state.scratchedTiles
            }
        });
        this.container.dispatchEvent(event);
    }

    reset() {
        this.container.innerHTML = '';
        this.state = {
            scratchedTiles: 0,
            totalWinnings: 0,
            isGameComplete: false,
            isScratching: false,
            lastX: 0,
            lastY: 0
        };
        this.init();
    }
}

// Usage:
// const container = document.querySelector('.scratch-card-container');
// const scratchCard = new ScratchCard(container, {
//     rewards: [0, 0, 0, 5, 10, 20, 50, 100, 500],
//     requiredScratched: 6
// });
// container.addEventListener('scratchcard:complete', (e) => {
//     console.log('Game completed!', e.detail);
// });
