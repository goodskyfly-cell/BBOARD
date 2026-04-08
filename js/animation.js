// 動態錄製邏輯
let isRecording = false;
let animationFrames = []; // 存儲所有影格
let recordTimer;

const recordBtn = document.getElementById('record-btn');
const playBtn = document.getElementById('play-btn');

// 錄製當前畫面上所有物件的座標
function captureFrame() {
    const frame = items.map(item => ({ x: item.x, y: item.y, type: item.type }));
    animationFrames.push(frame);
}

recordBtn.onclick = () => {
    if (!isRecording) {
        animationFrames = []; // 清空舊錄製
        isRecording = true;
        recordBtn.innerText = "⏹️ 停止錄製";
        // 每秒錄製 30 幀 (30fps)
        recordTimer = setInterval(captureFrame, 33);
    } else {
        isRecording = false;
        recordBtn.innerText = "🔴 開始錄製動畫";
        clearInterval(recordTimer);
        alert("動畫錄製完成，總計 " + animationFrames.length + " 影格");
    }
};

playBtn.onclick = () => {
    if (animationFrames.length === 0) return alert("尚無錄製動畫");
    let currentFrame = 0;
    const playTimer = setInterval(() => {
        if (currentFrame >= animationFrames.length) {
            clearInterval(playTimer);
            return;
        }
        const frameData = animationFrames[currentFrame];
        // 更新物件位置
        items.forEach((item, index) => {
            item.x = frameData[index].x;
            item.y = frameData[index].y;
        });
        render();
        currentFrame++;
    }, 33);
};
