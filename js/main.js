function resizeCanvas() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

function spawnExplosion(x, y, color) { for(let i = 0; i < 25 && particles.length < MAX_PARTICLES; i++) particles.push({ x: x, y: y, vx: (Math.random() - 0.5) * 20, vy: (Math.random() - 0.5) * 20, life: 1.0, color: color }); }
function spawnExhaust(x, y) { particles.push({ x: x + (Math.random() * 20 - 10), y: y, vx: (Math.random() - 0.5) * 2, vy: Math.random() * 5 + 2, life: 0.8, color: '#ffffff' }); }

function LCG(seed) { return function() { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; } }

// Cập nhật hàm showToast mới: Thêm viền Neon và bóng đổ
function showToast(text, color) {
    const toast = document.getElementById('toast-msg');
    toast.innerText = text; 
    toast.style.color = color; 
    toast.style.textShadow = `0 0 8px ${color}`;
    toast.style.border = `2px solid ${color}`;
    toast.style.boxShadow = `0 0 15px ${color}, inset 0 0 10px ${color}`;
    toast.style.opacity = '1'; 
    toast.style.transform = 'translateX(-50%) translateY(0) scale(1)';
    
    // Xóa bộ đếm cũ nếu có thông báo mới đè lên
    if (window.toastTimeout) clearTimeout(window.toastTimeout);
    window.toastTimeout = setTimeout(() => { 
        toast.style.opacity = '0'; 
        toast.style.transform = 'translateX(-50%) translateY(-20px) scale(0.9)'; 
    }, 2000);
}

// Hàm kích hoạt hiệu ứng phát sáng UI
function triggerUIEffect(elementId) {
    const el = document.getElementById(elementId);
    if (el) {
        el.classList.remove('stat-pulse');
        void el.offsetWidth; // Ép trình duyệt reset lại animation ngay lập tức
        el.classList.add('stat-pulse');
    }
}

function saveProfile() {
    let n = document.getElementById('player-name-input').value.trim();
    myName = n ? n : 'Người Chơi'; localStorage.setItem('neonJumperName', myName);
    document.getElementById('my-ingame-name').innerText = myName;
}

function checkEvol() {
    let expectedLevel = Math.floor(score / 20);
    let maxH = 90; let theoreticalH = 30 + expectedLevel * 15; let oldStage = player.colorStage; 
    if (theoreticalH <= maxH) { player.h = theoreticalH; player.colorStage = 0; } 
    else { player.h = maxH; player.colorStage = Math.floor((theoreticalH - maxH) / 15); }
    if (player.colorStage > oldStage && player.colorStage > 0) {
        let newColor = getPlayerColor(player.colorStage); showToast("✨ TA BIẾN HÌNH ĐÂY! ✨", newColor); spawnExplosion(player.x + 15, player.y + player.h / 2, newColor); 
    }
    player.jumpPower = baseJump - (expectedLevel * 0.35); if(player.jumpPower < MIN_JUMP) player.jumpPower = MIN_JUMP;
    document.getElementById('score').innerText = score;
}

function startCountdown(seed, solo = false) {
    isLobby = false; cancelAnimationFrame(lobbyAnimId);
    document.getElementById('mp-lobby').style.display = 'none'; document.getElementById('game-over').style.display = 'none';
    document.getElementById('ui-layer').style.display = 'none'; document.getElementById('top-right-controls').style.display = 'none';
    const cdScreen = document.getElementById('countdown-screen'); const cdText = document.getElementById('countdown-text');
    cdScreen.style.display = 'flex'; let count = 3; cdText.innerText = count;
    
    let timer = setInterval(() => {
        count--;
        if (count > 0) cdText.innerText = count;
        else if (count === 0) cdText.innerText = "GO!";
        else { clearInterval(timer); cdScreen.style.display = 'none'; startGame(seed, solo); }
    }, 800);
}

function startGame(seed, solo = false) {
    isSoloMode = solo; document.getElementById('ui-layer').style.display = 'block'; document.getElementById('top-right-controls').style.display = 'flex';
    if (isSoloMode || !conn || !conn.open) { document.getElementById('opp-score-container').style.display = 'none'; document.getElementById('heart-display').style.display = 'block'; document.getElementById('rocket-counter').style.display = 'block'; document.getElementById('sword-counter').style.display = 'none'; } 
    else { document.getElementById('opp-score-container').style.display = 'block'; document.getElementById('heart-display').style.display = 'none'; document.getElementById('rocket-counter').style.display = 'block'; document.getElementById('sword-counter').style.display = 'block'; }
    initGame(seed);
}

function initGame(seed) {
    score = 0; isGameOver = false; cameraOffset = 0; particles = []; trailPoints = []; slowTime = 0; micTimeRemaining = 0; opponentData = null; 
    oppRender = { x: -100, y: -100, squash: 1, angle: 0, isDead: false, vy: 0, h: 30, colorStage: 0, berserkTimer: 0, trail: [] }; 
    player = { x: canvas.width / 2 - 15, y: canvas.height / 2, targetX: canvas.width / 2 - 15, w: 30, h: 30, vy: 0, jumpPower: baseJump, colorStage: 0, squash: 1.0, angle: 0, flipAngle: 0, flipDir: 1, isDead: false, webTarget: null, micCount: 0, hearts: 1, heartAccumulator: 0, rocketCount: 0, rocketFlying: false, rocketStepsLeft: 0, berserkTimer: 0 };
    
    document.getElementById('mic-counter').innerText = `🎤: 0/3`; document.getElementById('heart-count').innerText = player.hearts; document.getElementById('rocket-count').innerText = player.rocketCount; document.getElementById('sword-status').innerText = "TẮT";
    platforms = [{ x: canvas.width/2 - PLATFORM_W/2, y: canvas.height - 100, w: PLATFORM_W, h: PLATFORM_H, visited: true, dx: 0, hp: 6, hasRevive: false, hasShrink: false, hasSnow: false, hasWeb: false, hasMic: false, hasRocket: false, hasSword: false, broken: false }];
    
    let rng = LCG(seed); let currentY = canvas.height - 100; let simJump = baseJump; let simScore = 0;
    for(let i = 0; i < 2000; i++) {
        let maxSafeGap = ((simJump * simJump) / (2 * gravity)) * 0.9; let minGap = Math.min(60, maxSafeGap * 0.6); currentY -= (rng() * (maxSafeGap - minGap) + minGap);
        let isMoving = rng() < 0.35 && i > 2; let speed = isMoving ? (rng() > 0.5 ? 2.5 : -2.5) : 0; let hp = isMoving ? 3 : 6; 
        let hasHeart = (rng() < 0.08) && i > 10; let hasShrink = (rng() < 0.08) && !hasHeart && i > 5; let hasSnow = (rng() < 0.05) && !hasHeart && !hasShrink && i > 15; let hasWeb = (rng() < 0.05) && !hasHeart && !hasShrink && !hasSnow && i > 20; let hasMic = (rng() < 0.12) && !hasHeart && !hasShrink && !hasSnow && !hasWeb; let hasRocket = (rng() < 0.08) && !hasHeart && !hasShrink && !hasSnow && !hasWeb && !hasMic && i > 5; let hasSword = (rng() < 0.03) && !hasHeart && !hasShrink && !hasSnow && !hasWeb && !hasMic && !hasRocket && i > 25; 
        let previous = platforms[platforms.length - 1]; let maxHorizontal = Math.max(45, Math.min(canvas.width - PLATFORM_W, simJump * 7)); let minX = Math.max(0, previous.x - maxHorizontal); let maxX = Math.min(canvas.width - PLATFORM_W, previous.x + previous.w + maxHorizontal); let p1X = minX + rng() * Math.max(1, maxX - minX);
        platforms.push({ x: p1X, y: currentY, w: PLATFORM_W, h: PLATFORM_H, hp: hp, broken: false, visited: false, dx: speed, hasRevive: hasHeart, hasShrink: hasShrink, hasSnow: hasSnow, hasWeb: hasWeb, hasMic: hasMic, hasRocket: hasRocket, hasSword: hasSword });
        if (rng() < 0.7) { let p2X = (p1X + canvas.width / 2) % (canvas.width - PLATFORM_W); let p2Y = currentY + (rng() * 40 - 20); platforms.push({ x: p2X, y: p2Y, w: PLATFORM_W, h: PLATFORM_H, hp: 6, broken: false, visited: false, dx: 0, hasRevive: false, hasShrink: false, hasSnow: false, hasWeb: false, hasMic: false, hasRocket: false, hasSword: false }); }
        simScore++; if(Math.floor(simScore / 20) > Math.floor((simScore-1)/20)) { simJump -= 0.35; if(simJump < MIN_JUMP) simJump = MIN_JUMP; }
    }
    document.getElementById('score').innerText = score; 

    // Reset logic Delta Time
    lastFrameTime = performance.now(); accumulator = 0;
    cancelAnimationFrame(gameLoopId); 
    gameLoopId = requestAnimationFrame(loop); 
}

function loop(currentTime) {
    if (isGameOver) return;
    if (!currentTime) currentTime = performance.now();
    let frameTime = currentTime - lastFrameTime; lastFrameTime = currentTime;
    if (frameTime > 250) frameTime = 250; 
    accumulator += frameTime;
    
    while (accumulator >= FIXED_DT) { updatePhysics(); accumulator -= FIXED_DT; }
    if (isSoloMode || !conn || !conn.open) { if (player.isDead) { gameOver(); return; } } 
    else { if (player.isDead && opponentData && opponentData.isDead) { gameOver(); return; } }
    
    draw(); gameLoopId = requestAnimationFrame(loop);
}

function gameOver() {
    isGameOver = true; let finalScore = score;
    if (score > myHighScore) { myHighScore = score; localStorage.setItem('neonJumperHighScore', myHighScore); document.getElementById('lobby-highscore').innerText = myHighScore; submitScore(myName, myHighScore); }
    if (opponentData && opponentData.score > score) finalScore = opponentData.score;
    document.getElementById('final-score').innerText = finalScore; document.getElementById('go-highscore').innerText = myHighScore;
    document.getElementById('pc-encouragement').style.display = window.innerWidth >= 768 ? 'block' : 'none';
    document.getElementById('game-over').style.display = 'flex';
}

// UI & Inputs Events
document.getElementById('player-name-input').value = myName;
document.getElementById('lobby-highscore').innerText = myHighScore;

// --- XỬ LÝ KHUNG NHẬP TÊN LẦN ĐẦU ---
const namePromptModal = document.getElementById('name-prompt-modal');
const firstNameInput = document.getElementById('first-name-input');
const saveNameBtn = document.getElementById('save-name-btn');

if (!myName || myName === '') {
    namePromptModal.style.display = 'flex';
}

saveNameBtn.onclick = () => {
    let n = firstNameInput.value.trim();
    if (n) {
        myName = n;
        localStorage.setItem('neonJumperName', myName);
        document.getElementById('player-name-input').value = myName;
        document.getElementById('my-ingame-name').innerText = myName;
        namePromptModal.style.display = 'none';
        showToast("✅ Đã lưu hồ sơ!", "#2ecc71");
    } else {
        showToast("⚠️ Vui lòng nhập tên!", "#ff9f1c");
    }
};
// ------------------------------------

document.getElementById('show-lb-btn').onclick = () => { document.getElementById('leaderboard-modal').style.display = 'block'; fetchLeaderboard(); };
document.getElementById('close-lb-btn').onclick = () => { document.getElementById('leaderboard-modal').style.display = 'none'; };
document.getElementById('home-btn').onclick = () => { window.location.reload(); };
document.getElementById('copy-btn').onclick = () => { navigator.clipboard.writeText(myPeerId); showToast("✅ Đã sao chép mã phòng!", "#2ecc71"); };
document.getElementById('refresh-btn').onclick = () => {
    document.getElementById('my-id-display').innerText = "ĐANG TẠO..."; peer.destroy();
    setTimeout(() => { myPeerId = generateId(); peer = new Peer(myPeerId); initPeerEvents(peer); showToast("🔄 Đã lấy mã mới!", "#66fcf1"); }, 500);
};
document.getElementById('connect-btn').onclick = async () => {
    saveProfile(); let targetId = document.getElementById('peer-id-input').value.toUpperCase().trim();
    if(targetId) { await requestMic(); document.getElementById('connect-btn').innerText = "Đang kết nối..."; conn = peer.connect(targetId); setupConnection(); conn.on('open', () => { document.getElementById('connect-btn').innerText = "Đã tìm thấy!"; conn.send({ type: 'ready' }); }); }
};
document.getElementById('solo-btn').onclick = async () => { saveProfile(); await requestMic(); startCountdown(Math.random(), true); };
document.getElementById('restart-btn').addEventListener('click', () => { let seed = Math.floor(Math.random() * 99999); if (conn && conn.open) { conn.send({ type: 'start', seed: seed }); startCountdown(seed, false); } else { startCountdown(seed, true); } });

const gyroBtn = document.getElementById('gyro-btn');
function handleOrientation(e) { let gamma = e.gamma; if (gamma > 45) gamma = 45; if (gamma < -45) gamma = -45; gyroGamma = gamma; }
function enableGyro() { useGyro = true; gyroBtn.classList.add('gyro-active'); window.addEventListener('deviceorientation', handleOrientation); showToast("📱 Bật cảm biến lắc: ĐIỂM GẤP ĐÔI! ⚡", "#2ecc71"); }
gyroBtn.onclick = () => {
    if (useGyro) { useGyro = false; gyroBtn.classList.remove('gyro-active'); window.removeEventListener('deviceorientation', handleOrientation); player.targetX = player.x; showToast("📱 Đã tắt cảm biến lắc", "#66fcf1"); } 
    else { if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') { DeviceOrientationEvent.requestPermission().then(state => { if (state === 'granted') enableGyro(); }).catch(console.error); } else { enableGyro(); } }
};
function handleMovement(xClient) { if(!isGameOver && !useGyro && !player.isDead) player.targetX = xClient - player.w / 2; }
canvas.addEventListener('touchmove', (e) => { e.preventDefault(); handleMovement(e.touches[0].clientX); }, {passive: false});
canvas.addEventListener('touchstart', (e) => { e.preventDefault(); handleMovement(e.touches[0].clientX); }, {passive: false});
canvas.addEventListener('mousemove', (e) => handleMovement(e.clientX));

lobbyLoop();
