const saveBtn = document.getElementById('save-btn');
const tacticList = document.getElementById('tactic-list');

saveBtn.onclick = () => {
    const name = prompt("請輸入戰術名稱：");
    if (!name) return;

    const tacticData = {
        name: name,
        time: new Date().toLocaleString(),
        frames: animationFrames // 存入剛剛錄製的動畫
    };

    let savedTactics = JSON.parse(localStorage.getItem('basketball_tactics') || '[]');
    savedTactics.push(tacticData);
    localStorage.setItem('basketball_tactics', JSON.stringify(savedTactics));
    loadTacticList();
};

function loadTacticList() {
    tacticList.innerHTML = "";
    let savedTactics = JSON.parse(localStorage.getItem('basketball_tactics') || '[]');
    savedTactics.forEach((tactic, index) => {
        const div = document.createElement('div');
        div.className = 'tactic-item';
        div.innerText = `${tactic.name} (${tactic.time})`;
        div.onclick = () => {
            animationFrames = tactic.frames;
            alert("已載入戰術：" + tactic.name + "，請點擊播放。");
        };
        tacticList.appendChild(div);
    });
}

// 初始載入
loadTacticList();
