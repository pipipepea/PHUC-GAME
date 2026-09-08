peer = new Peer(myPeerId);
initPeerEvents(peer);

function initPeerEvents(p) {
    p.on('open', (id) => { document.getElementById('my-id-display').innerText = id; });
    p.on('error', (err) => { if(err.type === 'unavailable-id') { alert("Lỗi mạng, hãy thử lấy mã mới!"); } });
    p.on('connection', (connection) => { conn = connection; setupConnection(); });
}

function setupConnection() {
    conn.on('data', (data) => {
        if (data.type === 'ready') { 
            let seed = Math.floor(Math.random() * 99999); 
            conn.send({ type: 'start', seed: seed }); 
            startCountdown(seed, false); 
        } 
        else if (data.type === 'start') { startCountdown(data.seed, false); }
        else if (data.type === 'update') { 
            opponentData = data.player; 
            document.getElementById('opp-name').innerText = opponentData.name || 'Đồng đội'; 
            document.getElementById('opp-score').innerText = opponentData.score; 
        }
        else if (data.type === 'revive') { 
            player.isDead = false; player.vy = -baseJump * 1.5; 
            if (opponentData) { player.x = opponentData.x; player.y = opponentData.worldY; }
            score = Math.max(0, score - 20); document.getElementById('score').innerText = score;
            showToast("💖 ĐÃ ĐƯỢC CỨU SỐNG TẠI CHỖ (-20 ĐIỂM)! 💖", "#ff9f1c"); 
        }
        else if (data.type === 'slow') { slowTime = 300; }
        else if (data.type === 'kill') {
            if (!player.isDead) {
                player.isDead = true; player.h = 30; player.colorStage = 0; player.jumpPower = baseJump;
                spawnExplosion(player.x + 15, player.y + 15, '#e74c3c');
                showToast("⚔️ BẠN ĐÃ CHẠM PHẢI DẢI ĐUÔI CUỒNG SÁT! ⚔️", "#e74c3c");
            }
        }
    });
    conn.on('close', () => { alert("Đồng đội đã ngắt kết nối!"); window.location.reload(); });
}

async function requestMic() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser(); microphone = audioContext.createMediaStreamSource(stream);
        microphone.connect(analyser); analyser.fftSize = 256; dataArray = new Uint8Array(analyser.frequencyBinCount);
        micPermissionGranted = true;
    } catch (err) { micPermissionGranted = false; }
}

function submitScore(name, score) {
    if (!GOOGLE_SHEET_URL || score <= 0) return;
    let safeName = encodeURIComponent(name);
    let token = btoa(`${Math.floor(score)}_PT_SECRET_2026`);
    let fetchUrl = `${GOOGLE_SHEET_URL}?action=add&name=${safeName}&score=${score}&token=${token}`;
    fetch(fetchUrl, { mode: 'no-cors' }).catch(err => console.log(err));
}

function fetchLeaderboard() {
    const lbContent = document.getElementById('lb-content');
    if (!GOOGLE_SHEET_URL) { lbContent.innerHTML = `<div class="lb-loading" style="color:#f72585;">Chưa cấu hình Link!</div>`; return; }
    lbContent.innerHTML = `<div class="lb-loading">Đang đọc dữ liệu từ Sheets...</div>`;
    fetch(`${GOOGLE_SHEET_URL}?action=get`)
        .then(response => response.json())
        .then(entries => {
            lbContent.innerHTML = '';
            if (!entries || entries.length === 0) { lbContent.innerHTML = `<div class="lb-loading">Bảng xếp hạng trống!</div>`; return; }
            entries.forEach((entry, index) => {
                let row = document.createElement('div'); row.className = 'lb-entry';
                let rank = document.createElement('div'); rank.className = 'lb-rank'; rank.textContent = `#${index + 1}`;
                let name = document.createElement('div'); name.className = 'lb-name'; name.textContent = String(entry.name || 'Người Chơi').slice(0, 12);
                let points = document.createElement('div'); points.className = 'lb-score'; points.textContent = String(Math.max(0, Number(entry.score) || 0));
                row.append(rank, name, points); lbContent.appendChild(row);
            });
        }).catch(() => { lbContent.innerHTML = `<div class="lb-loading" style="color:#f72585;">Lỗi kết nối máy chủ Google!</div>`; });
}
