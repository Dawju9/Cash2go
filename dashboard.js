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

const prizePool = [
    { value: 0, chance: 0.5 },
    { value: 5, chance: 0.2 },
    { value: 10, chance: 0.15 },
    { value: 50, chance: 0.1 },
    { value: 100, chance: 0.05 },
];

function pickPrize() {
    const rand = Math.random();
    let acc = 0;
    for (const prize of prizePool) {
        acc += prize.chance;
        if (rand < acc) return prize.value;
    }
    return 0;
}

document.querySelectorAll('.tile').forEach(tile => {
    const ctx = tile.getContext('2d');
    ctx.fillStyle = "#9ca3af";
    ctx.fillRect(0, 0, tile.width, tile.height);

    const prize = pickPrize();
    tile.dataset.prize = prize;

    let drawing = false;
    const previousPoints = [];

    function getPointerPosition(event) {
        const rect = tile.getBoundingClientRect();
        let x, y;
        if (event.touches) {
            x = event.touches[0].clientX - rect.left;
            y = event.touches[0].clientY - rect.top;
        } else {
            x = event.clientX - rect.left;
            y = event.clientY - rect.top;
        }
        return { x, y };
    }

    function drawLine(start, end) {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
    }

    function startDrawing(event) {
        event.preventDefault();
        drawing = true;
        previousPoints.length = 0;
        previousPoints.push(getPointerPosition(event));
    }

    function continueDrawing(event) {
        event.preventDefault();
        if (!drawing) return;
        const currentPoint = getPointerPosition(event);
        for (let i = 0; i < previousPoints.length; i++) {
            drawLine(previousPoints[i], currentPoint);
        }
        previousPoints.push(currentPoint);
        checkScratchCompletion();
    }

    function stopDrawing(event) {
        event.preventDefault();
        drawing = false;
        checkScratchCompletion();
    }

    function checkScratchCompletion() {
        const imageData = ctx.getImageData(0, 0, tile.width, tile.height);
        let transparentPixels = 0;
        for (let i = 3; i < imageData.data.length; i += 4) {
            if (imageData.data[i] === 0) {
                transparentPixels++;
            }
        }
        const scratchedPercentage = (transparentPixels / (tile.width * tile.height)) * 100;
        if (scratchedPercentage > 60) {
            revealPrize();
        }
    }

    function revealPrize() {
        tile.removeEventListener('mousedown', startDrawing);
        tile.removeEventListener('touchstart', startDrawing);
        tile.removeEventListener('mousemove', continueDrawing);
        tile.removeEventListener('touchmove', continueDrawing);
        tile.removeEventListener('mouseup', stopDrawing);
        tile.removeEventListener('touchend', stopDrawing);
        tile.removeEventListener('mouseleave', stopDrawing);

        ctx.clearRect(0, 0, tile.width, tile.height);
        ctx.globalCompositeOperation = 'source-over';

        if (prize > 0) {
            tile.style.backgroundColor = '#10b981';
            ctx.fillStyle = 'white';
        } else {
            tile.style.backgroundColor = '#6b7280';
            ctx.fillStyle = '#d1d5db';
        }

        ctx.font = '12px Montserrat';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${prize} PLN`, tile.width/2, tile.height/2);

        updateAccountAndRewards(prize);
    }

    function updateAccountAndRewards(prize) {
        const scratchedCountElement = document.getElementById('scratched-count');
        const totalWinningsElement = document.getElementById('total-winnings');

        let scratchedCount = parseInt(scratchedCountElement.textContent, 10);
        scratchedCountElement.textContent = scratchedCount + 1;

        if (prize > 0) {
            let totalWinnings = parseInt(totalWinningsElement.textContent, 10);
            totalWinningsElement.textContent = `${totalWinnings + prize} PLN`;
        }
    }

    tile.addEventListener('mousedown', startDrawing);
    tile.addEventListener('touchstart', startDrawing, { passive: false });
    tile.addEventListener('mousemove', continueDrawing);
    tile.addEventListener('touchmove', continueDrawing, { passive: false });
    tile.addEventListener('mouseup', stopDrawing);
    tile.addEventListener('touchend', stopDrawing);
    tile.addEventListener('mouseleave', stopDrawing);
});

