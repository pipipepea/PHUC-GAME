// Danh sách các emoji khuôn mặt biểu cảm ngẫu nhiên
const FACE_EMOJIS = ["😀", "😎", "🤩", "🤪", "🥶", "😡", "🧐", "🤠", "😈", "🥳", "🤖", "👽"];

function updatePhysics() {
    if (slowTime > 0) slowTime--; 
    if (micTimeRemaining > 0) micTimeRemaining--;

    if (player.berserkTimer > 0) {
        player.berserkTimer--;
        let secondsLeft = Math.ceil(player.berserkTimer / 60);
        document.getElementById('sword-status').innerText = `${secondsLeft}s`;
        if (player.berserkTimer === 0) {
            document.getElementById('sword-status').innerText = "TẮT";
            showToast("⚔️ HẾT THỜI GIAN CUỒNG SÁT! ⚔️", "#66fcf1");
        }
    }

    if (micTimeRemaining > 0 && micPermissionGranted && !player.isDead) {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0; for(let i = 0; i < dataArray.length; i++) sum += dataArray[i];
        let average = sum / dataArray.length;
        if (average > 60) { player.vy -= 1.2; if (player.vy < -player.jumpPower * 1.5) player.vy = -player.jumpPower * 1.5; spawnExhaust(player.x + 15, player.y + player.h); }
    }

    if (opponentData) {
        let targetOppScreenY = opponentData.worldY + cameraOffset;
        oppRender.x += (opponentData.x - oppRender.x) * 0.85; 
        oppRender.y += (targetOppScreenY - oppRender.y) * 0.85;
        oppRender.squash += (opponentData.squash - oppRender.squash) * 0.5; 
        oppRender.angle += (opponentData.angle - oppRender.angle) * 0.5;
        oppRender.vy = opponentData.vy; oppRender.isDead = opponentData.isDead; oppRender.h = opponentData.h; 
        oppRender.colorStage = opponentData.colorStage; oppRender.berserkTimer = opponentData.berserkTimer; 
        oppRender.currentEmoji = opponentData.currentEmoji || "🤖"; // Đồng bộ khuôn mặt đồng đội
        oppRender.trail = opponentData.trail || [];
    }

    if (!player.isDead && opponentData && opponentData.berserkTimer > 0 && opponentData.trail && opponentData.trail.length > 0) {
        for (let pt of opponentData.trail) {
            let screenPtY = pt.y + cameraOffset;
            if (Math.hypot((player.x + 15) - pt.x, (player.y + 15) - screenPtY) < 22) {
                if (conn && conn.open) conn.send({ type: 'kill' }); break;
            }
        }
    }

    if (!player.isDead) {
        if (player.rocketFlying) {
            player.vy = -14; player.y += player.vy; spawnExhaust(player.x + 15, player.y + player.h); player.rocketStepsLeft--;
            if (player.rocketStepsLeft <= 0) { player.rocketFlying = false; player.vy = -player.jumpPower; }
        } else if (player.webTarget) {
            let tx = player.webTarget.x + player.webTarget.w/2 - 15; let ty = player.webTarget.y - player.h;
            player.x += (tx - player.x) * 0.2; player.y += (ty - player.y) * 0.2; player.vy = 0; 
            if (Math.abs(player.y - ty) < 15) { player.webTarget.visited = true; player.webTarget = null; player.vy = -player.jumpPower * 1.5; }
        } else {
            if (useGyro) player.targetX = player.x + ((gyroGamma / 45) * 15);
            player.x += (player.targetX - player.x) * (useGyro ? 0.22 : 0.18);
            if (player.x > canvas.width) player.x = -player.w; if (player.x + player.w < 0) player.x = canvas.width;
            player.vy += gravity; player.y += player.vy; player.squash += (1.0 - player.squash) * 0.15;
            if (player.flipAngle > 0) { let spinSpeed = 0.08; player.angle += spinSpeed * player.flipDir; player.flipAngle -= spinSpeed; if (player.flipAngle <= 0) { player.angle = 0; player.flipAngle = 0; } }

            if (player.y > canvas.height) {
                if (isSoloMode || !conn || !conn.open) {
                    if (player.hearts > 1) { player.hearts--; document.getElementById('heart-count').innerText = player.hearts; player.y = canvas.height - 150; player.vy = -player.jumpPower * 1.5; spawnExplosion(player.x + 15, canvas.height - 20, '#f72585'); showToast(`💔 CÒN ${player.hearts} MẠNG 💔`, "#f72585"); } 
                    else { player.hearts = 0; document.getElementById('heart-count').innerText = 0; player.isDead = true; player.h = 30; player.colorStage = 0; player.jumpPower = baseJump; player.micCount = 0; document.getElementById('mic-counter').innerText = `🎤: 0/3`; spawnExplosion(player.x + 15, canvas.height - 20, '#f72585'); }
                } else { player.isDead = true; player.h = 30; player.colorStage = 0; player.jumpPower = baseJump; player.micCount = 0; document.getElementById('mic-counter').innerText = `🎤: 0/3`; spawnExplosion(player.x + 15, canvas.height - 20, '#f72585'); }
            }
        }
    } else {
        if (opponentData && !opponentData.isDead) { player.x = oppRender.x; player.y = oppRender.y; }
    }

    if (!player.isDead) { trailPoints.unshift({ x: player.x + 15, y: player.y + 15 }); while (trailPoints.length > 30) trailPoints.pop(); } 
    else if (trailPoints.length > 0) trailPoints.pop();

    for (let i = particles.length - 1; i >= 0; i--) { let pt = particles[i]; pt.x += pt.vx; pt.y += pt.vy; pt.life -= 0.04; if (pt.life <= 0) particles.splice(i, 1); }

    networkTimer++;
    if (conn && conn.open && networkTimer >= 4) {
        networkTimer = 0;
        conn.send({ 
            type: 'update', 
            player: { 
                name: myName, 
                x: player.x, 
                worldY: player.y - cameraOffset, 
                vy: player.vy, 
                squash: player.squash, 
                angle: player.angle, 
                isDead: player.isDead, 
                score: score, 
                h: player.h, 
                colorStage: player.colorStage, 
                berserkTimer: player.berserkTimer,
                currentEmoji: player.currentEmoji, // Gửi emoji khuôn mặt qua mạng
                trail: trailPoints.map(pt => ({ x: pt.x, y: pt.y - cameraOffset })) 
            } 
        }); 
    }

    for (let i = 0; i < platforms.length; i++) {
        let p = platforms[i]; if (p.broken) continue; 
        if (p.dx !== 0) { let currentDx = (slowTime > 0) ? p.dx * 0.2 : p.dx; p.x += currentDx; if (p.x < 0) { p.x = 0; p.dx *= -1; } if (p.x + p.w > canvas.width) { p.x = canvas.width - p.w; p.dx *= -1; } }

        if (!player.isDead && player.vy > 0 && !player.webTarget && !player.rocketFlying) {
            if (player.y + player.h >= p.y && player.y + player.h - player.vy <= p.y + p.h) {
                if (player.x + player.w > p.x - 5 && player.x < p.x + p.w + 5) {
                    p.hp--; if (p.hp <= 0) { p.broken = true; spawnExplosion(p.x + p.w/2, p.y, p.dx !== 0 ? '#f72585' : '#45a29e'); }
                    
                    // --- XỬ LÝ KHI NHẶT BẤT KỲ ITEM NÀO: ĐỔI EMOJI NGẪU NHIÊN ---
                    let hasInteracted = false;
                    let newFace = FACE_EMOJIS[Math.floor(Math.random() * FACE_EMOJIS.length)];

                    if (p.hasMic) { 
                        p.hasMic = false; player.micCount++; hasInteracted = true;
                        document.getElementById('mic-counter').innerText = `🎤: ${player.micCount}/3`; 
                        triggerUIEffect('mic-counter');
                        if (player.micCount >= 3) { player.micCount = 0; document.getElementById('mic-counter').innerText = `🎤: 0/3`; micTimeRemaining = 120; showToast("🎤 THỔI MẠNH ĐỂ BAY! 🎤", "#ff0055"); } 
                        else { showToast("🎤 NHẬT MIC", "#ff0055"); }
                    }
                    if (p.hasRocket) {
                        p.hasRocket = false; player.rocketCount++; hasInteracted = true;
                        document.getElementById('rocket-count').innerText = player.rocketCount; 
                        spawnExplosion(p.x + p.w / 2, p.y - 15, '#ff5500');
                        triggerUIEffect('rocket-counter');
                        if (player.rocketCount >= 6) { player.rocketCount = 0; document.getElementById('rocket-count').innerText = 0; player.rocketFlying = true; player.rocketStepsLeft = 60; showToast("🚀 TÊN LỬA KHỞI ĐỘNG! 🚀", "#ff5500"); } 
                        else { showToast(`🚀 THU TÊN LỬA (${player.rocketCount}/6)`, "#ff5500"); }
                    }
                    if (p.hasSword) { 
                        p.hasSword = false; player.berserkTimer = 300; hasInteracted = true;
                        spawnExplosion(p.x + p.w / 2, p.y - 15, '#e74c3c'); 
                        triggerUIEffect('sword-counter');
                        showToast("⚔️ CHẾ ĐỘ CUỒNG SÁT! ⚔️", "#e74c3c"); 
                    }
                    if (p.hasRevive) { 
                        p.hasRevive = false; hasInteracted = true;
                        triggerUIEffect('heart-display');
                        if (isSoloMode || !conn || !conn.open) {
                            if (player.hearts < 4) { player.heartAccumulator++; if (player.heartAccumulator >= 2) { player.heartAccumulator = 0; player.hearts++; document.getElementById('heart-count').innerText = player.hearts; showToast(`💖 +1 MẠNG!`, "#f72585"); } else { showToast(`💖 MẢNH TIM (1/2)`, "#f72585"); } spawnExplosion(p.x + p.w / 2, p.y - 15, '#f72585'); }
                        } else { if (opponentData && opponentData.isDead) { conn.send({ type: 'revive' }); showToast("💖 ĐÃ CỨU ĐỒNG ĐỘI!", "#ff9f1c"); } else { showToast("💖 NHẶT ĐƯỢC TIM!", "#f72585"); } spawnExplosion(p.x + p.w / 2, p.y - 15, '#f72585'); }
                    }
                    if (p.hasShrink) { 
                        p.hasShrink = false; hasInteracted = true;
                        spawnExplosion(p.x + p.w / 2, p.y - 15, '#00f0ff'); player.h = Math.max(15, player.h - 5); player.jumpPower += 1.5; 
                        showToast("⚡ THU NHỎ & TĂNG NHẢY!", "#00f0ff"); 
                    }
                    if (p.hasSnow) { 
                        p.hasSnow = false; slowTime = 300; hasInteracted = true;
                        showToast("❄️ ĐÓNG BĂNG!", "#80d0ff"); 
                        if(conn && conn.open) conn.send({type: 'slow'}); 
                    }
                    if (p.hasWeb) { 
                        p.hasWeb = false; hasInteracted = true;
                        let targetIdx = Math.min(i + 8, platforms.length - 1); player.webTarget = platforms[targetIdx]; 
                        showToast("🕸️ NGƯỜI NHỆN!", "#fff"); 
                        for(let j = i; j <= targetIdx; j++) { if(!platforms[j].visited) { platforms[j].visited = true; score += (useGyro ? 2 : 1); } } checkEvol(); 
                    }

                    // Nếu có tương tác nhặt item, cập nhật khuôn mặt ngẫu nhiên
                    if (hasInteracted) {
                        player.currentEmoji = newFace;
                    }
                    // -------------------------------------------------------------

                    if(!player.webTarget && !player.rocketFlying) {
                        player.vy = -player.jumpPower; player.squash = 0.4; player.flipAngle = Math.PI * 2; player.angle = 0; player.flipDir = (useGyro) ? ((gyroGamma > 0) ? 1 : -1) : ((player.targetX > player.x) ? 1 : -1);
                        if (!p.visited) { p.visited = true; score += (useGyro ? 2 : 1); checkEvol(); }
                    }
                }
            }
        }
    }

    let focusY = player.isDead && opponentData && !opponentData.isDead ? oppRender.y : player.y; 
    const cameraThreshold = canvas.height / 2;
    if (focusY < cameraThreshold) { let camDiff = cameraThreshold - focusY; cameraOffset += camDiff; platforms.forEach(p => p.y += camDiff); player.y += camDiff; oppRender.y += camDiff; if(player.webTarget) player.webTarget.y += camDiff; }
}
