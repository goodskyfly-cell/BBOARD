// --- 全域變數設定 ---
const canvas = document.getElementById('courtCanvas');
const ctx = canvas.getContext('2d');
const scale = 30; 

const imgNames = ["01.png", "05.png", "06.png", "07.png", "08.png", "09.png", "10.png", "12.png", "13.png", "15.png", "23.png", "89.png"];
const imgUrls = imgNames.map(name => `https://raw.githubusercontent.com/goodskyfly-cell/newboard/main/${name}`);

let items = [];
let dragTarget = null;
let images = [];

// --- 初始化：載入圖片並設定初始位置 ---
async function init() {
    const promises = imgUrls.map(url => {
        return new Promise(res => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.src = url;
            img.onload = () => res(img);
        });
    });
    images = await Promise.all(promises);
    
    resetItems(); // 設定初始位置
    render();
}

// 重置物件位置（用於重新錄製或清空畫面）
function resetItems() {
    items = [];
    images.forEach((img, i) => {
        items.push({ x: 55 + i * 72, y: 545, r: 24, img: img, type: 'player' });
    });
    items.push({ x: 450, y: 250, r: 15, type: 'ball' });
}

// --- 繪圖邏輯 ---
function drawCourtLines() {
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2.5;
    const courtW = 28 * scale, courtH = 15 * scale;
    const offsetX = (canvas.width - courtW) / 2, offsetY = 50; 
    ctx.strokeRect(offsetX, offsetY, courtW, courtH);
    ctx.beginPath();
    ctx.moveTo(canvas.width/2, offsetY); ctx.lineTo(canvas.width/2, offsetY + courtH); ctx.stroke();
    ctx.beginPath(); ctx.arc(canvas.width/2, offsetY + courtH/2, 1.8 * scale, 0, Math.PI*2); ctx.stroke();

    [true, false].forEach(isLeft => {
        const side = isLeft ? 1 : -1, baseLineX = isLeft ? offsetX : offsetX + courtW;
        const centerY = offsetY + courtH/2, hoopX = baseLineX + side * 1.575 * scale;
        const r3 = 6.75 * scale, intersectY = (courtH/2) - 0.9 * scale, angle = Math.asin(intersectY / r3);
        ctx.beginPath();
        ctx.moveTo(baseLineX, centerY - intersectY); ctx.lineTo(baseLineX + side * 1.575 * scale, centerY - intersectY);
        ctx.arc(hoopX, centerY, r3, isLeft ? -angle : Math.PI + angle, isLeft ? angle : Math.PI - angle, !isLeft);
        ctx.lineTo(baseLineX, centerY + intersectY); ctx.stroke();
        ctx.strokeRect(isLeft ? baseLineX : baseLineX - 5.8 * scale, centerY - 4.9 * scale / 2, 5.8 * scale, 4.9 * scale);
        ctx.beginPath(); ctx.arc(baseLineX + side * 5.8 * scale, centerY, 1.8 * scale, 0, Math.PI*2); ctx.stroke();
        ctx.beginPath(); ctx.arc(hoopX, centerY, 7, 0, Math.PI*2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(baseLineX + side * 1.2 * scale, centerY - 25); ctx.lineTo(baseLineX + side * 1.2 * scale, centerY + 25); ctx.stroke();
    });
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawCourtLines();
    items.forEach(p => {
        ctx.save();
        if(p.type === 'ball') {
            ctx.translate(p.x, p.y);
            let grad = ctx.createRadialGradient(-p.r*0.3, -p.r*0.3, p.r*0.1, 0, 0, p.r);
            grad.addColorStop(0, '#f97316'); grad.addColorStop(1, '#7c2d12');
            ctx.fillStyle = grad; ctx.beginPath(); ctx.arc(0, 0, p.r, 0, Math.PI*2); ctx.fill();
            ctx.strokeStyle = "rgba(0,0,0,0.6)"; ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.moveTo(0, -p.r); ctx.lineTo(0, p.r); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(-p.r, 0); ctx.lineTo(p.r, 0); ctx.stroke();
        } else {
            ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
            ctx.shadowBlur = 10; ctx.shadowColor = "black"; ctx.fillStyle = "white"; ctx.fill();
            ctx.strokeStyle = "white"; ctx.lineWidth = 2; ctx.stroke();
            ctx.clip(); 
            if(p.img) ctx.drawImage(p.img, p.x - p.r, p.y - p.r, p.r * 2, p.r * 2);
        }
        ctx.restore();
    });
}

// --- 語音功能邏輯 ---
const micBtn = document.getElementById('mic-btn');
const clearBtn = document.getElementById('clear-btn');
const transcriptDiv = document.getElementById('transcript');
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (SpeechRecognition) {
    const recognition = new SpeechRecognition();
    recognition.lang = 'zh-TW';
    recognition.interimResults = true;
    recognition.continuous = true;
    let isMicRecording = false;

    micBtn.onclick = () => {
        if (!isMicRecording) {
            recognition.start(); micBtn.innerText = "🛑 停止紀錄"; micBtn.classList.add('recording'); isMicRecording = true;
        } else {
            recognition.stop(); micBtn.innerText = "🎤 開始語音記錄"; micBtn.classList.remove('recording'); isMicRecording = false;
        }
    };

    recognition.onresult = (e) => {
        let text = "";
        for (let i = e.resultIndex; i < e.results.length; i++) { text += e.results[i][0].transcript; }
        transcriptDiv.innerText = text;
    };

    clearBtn.onclick = () => { transcriptDiv.innerText = "等待語音輸入..."; };
}

// --- 互動拖曳邏輯 ---
function getPos(e) {
    const r = canvas.getBoundingClientRect();
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: cx - r.left, y: cy - r.top };
}

canvas.addEventListener('mousedown', e => {
    const p = getPos(e);
    for(let i = items.length - 1; i >= 0; i--) {
        if(Math.hypot(items[i].x - p.x, items[i].y - p.y) < items[i].r) { dragTarget = items[i]; break; }
    }
});

window.addEventListener('mousemove', e => {
    if(!dragTarget) return;
    const p = getPos(e); dragTarget.x = p.x; dragTarget.y = p.y; render();
});

window.addEventListener('mouseup', () => dragTarget = null);

canvas.addEventListener('touchstart', e => {
    const p = getPos(e);
    for(let i = items.length - 1; i >= 0; i--) {
        if(Math.hypot(items[i].x - p.x, items[i].y - p.y) < items[i].r) { dragTarget = items[i]; break; }
    }
    if(dragTarget) e.preventDefault();
}, {passive: false});

window.addEventListener('touchmove', e => {
    if(!dragTarget) return;
    const p = getPos(e); dragTarget.x = p.x; dragTarget.y = p.y; render(); e.preventDefault();
}, {passive: false});

window.addEventListener('touchend', () => dragTarget = null);

// --- 重置按鈕邏輯（連動 animation.js 使用） ---
document.getElementById('reset-btn').onclick = () => {
    resetItems();
    render();
};

// 執行初始化
init();
