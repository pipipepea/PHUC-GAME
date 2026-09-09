function drawEntityRaw(ctx, x, y, w, h, angle, vy, colorStr, isFriend = false, currentEmoji = "😎") {
    ctx.save(); 
    ctx.translate(x, y); 
    ctx.rotate(angle); 

    // Hiệu ứng phát sáng tổng thể
    ctx.shadowBlur = 25;
    ctx.shadowColor = colorStr;

    // 1. Thân giáp chính vát góc hiện đại
    ctx.fillStyle = '#1f2833';
    ctx.strokeStyle = colorStr;
    ctx.lineWidth = 2;
    
    ctx.beginPath();
    ctx.moveTo(-w/2 + 6, -h/2);
    ctx.lineTo(w/2 - 6, -h/2);
    ctx.lineTo(w/2, h/2 - 6);
    ctx.lineTo(w/2 - 6, h/2);
    ctx.lineTo(-w/2 + 6, h/2);
    ctx.lineTo(-w/2, h/2 - 6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 2. Lò phản ứng năng lượng trước ngực
    let corePulse = (Math.sin(Date.now() / 200) + 1) / 2;
    ctx.shadowBlur = 10 * corePulse;
    ctx.shadowColor = '#ff007f';
    ctx.fillStyle = '#ff007f';
    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // 3. Đường viền bo mạch chiến thuật trên thân
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#45a29e';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-10, -12); ctx.lineTo(10, -12);
    ctx.moveTo(-12, -2); ctx.lineTo(12, -2);
    ctx.stroke();

    // 4. Tay & Giáp vai so le (Alternating Cyber Arms)
    let timeVal = Date.now() / 150;
    let leftArmY = isFriend ? Math.sin(timeVal) * 6 : Math.min(10, Math.max(-10, -vy * 1.2)) + Math.sin(timeVal) * 4;
    let rightArmY = isFriend ? Math.sin(timeVal + Math.PI) * 6 : Math.min(10, Math.max(-10, -vy * 1.2)) + Math.sin(timeVal + Math.PI) * 4;

    ctx.shadowBlur = 15;
    ctx.shadowColor = '#ff007f';
    
    // Tay trái
    ctx.fillStyle = '#ff007f';
    ctx.fillRect(-w/2 - 10, leftArmY - 6, 8, 14);
    ctx.fillStyle = colorStr;
    ctx.fillRect(-w/2 - 8, leftArmY + 8, 4, 6);

    // Tay phải
    ctx.fillStyle = '#ff007f';
    ctx.fillRect(w/2 + 2, rightArmY - 6, 8, 14);
    ctx.fillStyle = colorStr;
    ctx.fillRect(w/2 + 4, rightArmY + 8, 4, 6);

    // 5. Vòng cổ / Khung đỡ cổ công nghệ
    ctx.shadowBlur = 12;
    ctx.shadowColor = colorStr;
    ctx.fillStyle = colorStr;
    ctx.fillRect(-8, -h/2 - 6, 16, 6);

    // 6. Đầu Emoji phía trên
    ctx.save();
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#ffff00';
    ctx.font = "20px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(currentEmoji || "😎", 0, -h/2 - 18);
    ctx.restore();

    ctx.restore();
}
function getPlayerColor(stage) { 
    if (stage <= 0) return '#66fcf1'; 
    if (stage === 1) return '#00ff00'; 
    if (stage === 2) return '#fee440'; 
    return `hsl(${Date.now() % 360}, 100%, 50%)`; 
}

function drawEntity(entity, isOpponent = false) {
    if (entity.isDead) {
        ctx.font = "30px Arial"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.shadowBlur = 15; ctx.shadowColor = '#fff'; ctx.fillText("💀", entity.x + 15, entity.y + 15); ctx.shadowBlur = 0; 
        let floatOffset = Math.sin(Date.now() / 150) * 5; ctx.font = "bold 14px 'Orbitron', Courier New"; ctx.fillStyle = "#ff9f1c"; ctx.fillText("ê cứu tui", entity.x + 15, entity.y - 15 + floatOffset);
        return;
    }
    let colorMain = isOpponent ? '#ff9f1c' : getPlayerColor(entity.colorStage);
    let emojiToDraw = isOpponent ? (entity.currentEmoji || "🤖") : (entity.currentEmoji || "😎");
    
    drawEntityRaw(ctx, entity.x + 15, entity.y + (entity.h || 30) / 2, 30, entity.h || 30, entity.angle, entity.vy, colorMain, false, emojiToDraw);
    if (entity.berserkTimer > 0) { ctx.save(); ctx.font = "16px Arial"; ctx.textAlign = "center"; ctx.fillText("⚔️", entity.x + 15, entity.y - 15); ctx.restore(); }
}

function drawRadar() {
    if (opponentData && !opponentData.isDead) {
        let oppScreenX = oppRender.x + 15; let oppScreenY = oppRender.y + 15;
        if (oppScreenY < 0 || oppScreenY > canvas.height) {
            ctx.save(); ctx.fillStyle = '#ff9f1c'; ctx.shadowBlur = 15; ctx.shadowColor = '#ff9f1c'; ctx.beginPath();
            let nameDisplay = opponentData.name || "ĐỒNG ĐỘI";
            if (oppScreenY < 0) { ctx.moveTo(oppScreenX, 20); ctx.lineTo(oppScreenX - 12, 40); ctx.lineTo(oppScreenX + 12, 40); ctx.fill(); ctx.font = "bold 12px 'Orbitron', Courier New"; ctx.textAlign = "center"; ctx.fillText(nameDisplay, oppScreenX, 55); } 
            else { ctx.moveTo(oppScreenX, canvas.height - 20); ctx.lineTo(oppScreenX - 12, canvas.height - 40); ctx.lineTo(oppScreenX + 12, canvas.height - 40); ctx.fill(); ctx.font = "bold 12px 'Orbitron', Courier New"; ctx.textAlign = "center"; ctx.fillText(nameDisplay, oppScreenX, canvas.height - 55); }
            ctx.restore();
        }
    }
}

function drawTrailFor(points, colorStage, berserkTimer, isOpponent = false) {
    if (!points || points.length < 2) return;
    ctx.save();
    let baseColor = isOpponent ? '#ff9f1c' : getPlayerColor(colorStage);
    let finalColor = berserkTimer > 0 && Math.floor(Date.now() / 100) % 2 === 0 ? '#e74c3c' : baseColor;

    for (let i = 0; i < points.length - 1; i++) {
        let p1 = points[i], p2 = points[i + 1], progress = i / points.length; 
        let wave = Math.sin(Date.now() / 100 + i * 0.4) * (2 * (1 - progress));
        ctx.beginPath(); ctx.moveTo(p1.x + wave, p1.y); ctx.lineTo(p2.x + wave, p2.y);
        ctx.lineWidth = Math.max(0.5, (1 - progress) * 7); ctx.strokeStyle = finalColor;
        ctx.globalAlpha = Math.max(0.03, 1 - progress); ctx.shadowBlur = 15 * (1 - progress);
        ctx.shadowColor = finalColor; ctx.lineCap = 'round'; ctx.stroke();
    }
    ctx.restore();
}

function draw() {
    ctx.fillStyle = '#0b0c10'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (slowTime > 0) { ctx.fillStyle = "rgba(0, 200, 255, 0.08)"; ctx.fillRect(0, 0, canvas.width, canvas.height); }
    if (micTimeRemaining > 0) { ctx.fillStyle = "rgba(255, 0, 85, 0.1)"; ctx.fillRect(0, 0, canvas.width, canvas.height); } 

    if (!player.isDead) drawTrailFor(trailPoints, player.colorStage, player.berserkTimer, false);
    if (opponentData && !opponentData.isDead && opponentData.trail) {
        let adjustedOppTrail = opponentData.trail.map(pt => ({ x: pt.x, y: pt.y + cameraOffset }));
        drawTrailFor(adjustedOppTrail, opponentData.colorStage, opponentData.berserkTimer, true);
    }

    for (let p of platforms) {
        if(p.y > canvas.height + 50 || p.y < -50 || p.broken) continue; 
        if (!p.visited) { ctx.fillStyle = p.dx !== 0 ? '#f72585' : '#45a29e'; ctx.shadowBlur = 15; ctx.shadowColor = ctx.fillStyle; } else { ctx.fillStyle = '#1f2833'; ctx.shadowBlur = 0; }
         
        ctx.globalAlpha = p.dx === 0 ? (p.hp / 6) * 0.5 + 0.5 : (p.hp / 3) * 0.5 + 0.5; ctx.fillRect(p.x, p.y, p.w, p.h); ctx.globalAlpha = 1.0;
        let bounce = Math.sin(Date.now() / 200) * 5; ctx.font = "bold 10px 'Orbitron', Courier New"; ctx.fillStyle = "#0b0c10"; ctx.fillText(p.hp, p.x + p.w / 2, p.y + 10);
         
        ctx.font = "24px Arial";
        if (p.hasMic) { ctx.shadowBlur = 15; ctx.shadowColor = '#ff0055'; ctx.fillText("🎤", p.x + p.w / 2, p.y - 15 + bounce); }
        else if (p.hasRocket) { ctx.shadowBlur = 15; ctx.shadowColor = '#ff5500'; ctx.fillText("🚀", p.x + p.w / 2, p.y - 15 + bounce); }
        else if (p.hasSword) { ctx.shadowBlur = 15; ctx.shadowColor = '#e74c3c'; ctx.fillText("⚔️", p.x + p.w / 2, p.y - 15 + bounce); }
        else if (p.hasRevive) { ctx.shadowBlur = 15; ctx.shadowColor = '#f72585'; ctx.fillText("💖", p.x + p.w / 2, p.y - 15 + bounce); }
        else if (p.hasSnow) { ctx.shadowBlur = 15; ctx.shadowColor = '#00f0ff'; ctx.fillText("❄️", p.x + p.w / 2, p.y - 15 + bounce); }
        else if (p.hasWeb) { ctx.shadowBlur = 15; ctx.shadowColor = '#fff'; ctx.fillText("🕸️", p.x + p.w / 2, p.y - 15 + bounce); }
        else if (p.hasShrink) { ctx.save(); ctx.translate(p.x + p.w / 2, p.y - 15); ctx.rotate(Date.now() / 150); ctx.fillStyle = '#00f0ff'; ctx.shadowBlur = 15; ctx.shadowColor = '#00f0ff'; ctx.fillRect(-8, -8, 16, 16); ctx.restore(); }
        ctx.shadowBlur = 0;
    }

    if (player.webTarget) { ctx.beginPath(); ctx.moveTo(player.x + 15, player.y + 15); ctx.lineTo(player.webTarget.x + player.webTarget.w/2, player.webTarget.y + player.webTarget.h/2); ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 3; ctx.shadowBlur = 15; ctx.shadowColor = "#ffffff"; ctx.stroke(); ctx.shadowBlur = 0; }

    if (opponentData && opponentData.isDead) drawEntity(oppRender, true);
    if (player.isDead) drawEntity(player, false);
    if (opponentData && !opponentData.isDead) drawEntity(oppRender, true);
    if (!player.isDead) drawEntity(player, false);

    particles.forEach(pt => { ctx.globalAlpha = pt.life; ctx.fillStyle = pt.color; ctx.shadowBlur = 15; ctx.shadowColor = pt.color; ctx.beginPath(); ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2); ctx.fill(); });
    ctx.globalAlpha = 1.0; ctx.shadowBlur = 0; drawRadar(); 
}
// --- KHỞI TẠO ĐỐI TƯỢNG SẢNH CHỜ (LOBBY OBJECTS) ---
let lobbyPlayer = {
    x: 100,
    y: 100,
    w: 30,
    h: 60,
    vy: 0,
    gravity: 0.6,
    jumpPower: 10,
    angle: 0,
    dir: 1,
    baseY: 200
};

let lobbyFriend = {
    x: 0,
    y: 0,
    w: 30,
    h: 60,
    angle: 0
};

function lobbyLoop() {
    if (!isLobby) return;
    ctx.fillStyle = 'rgba(11, 12, 16, 0.4)'; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);
     
    // Khai báo giá trị mặc định phòng khi profileBox chưa sẵn sàng
    let leftCornerX = 50; 
    let leftSideY = lobbyPlayer.baseY || 100;
    let leftSideAngle = 0;

    const profileBox = document.getElementById('profile-box');
    if (profileBox) { 
        const rect = profileBox.getBoundingClientRect(); 
         
        // 1. Tọa độ nhân vật màu cam ở góc phải
        lobbyFriend.x = rect.right - 28; 
        lobbyFriend.y = rect.top - 20; 

        // --- TÍNH TOÁN TỌA ĐỘ ĐỐI XỨNG HOÀN HẢO CHO GÓC TRÁI ---
        let offsetRight = rect.right - lobbyFriend.x; 
        leftCornerX = rect.left + offsetRight; 
        let leftCornerY = rect.top - 20;
        // -------------------------------------------------------
         
        lobbyPlayer.baseY = rect.top - 20; 
         
        let leftBound = rect.left + 20;
        let rightBound = rect.left + rect.width / 2;
         
        if (lobbyPlayer.x > rightBound) lobbyPlayer.dir = -1;
        if (lobbyPlayer.x < leftBound) lobbyPlayer.dir = 1;

        leftSideY = lobbyPlayer.baseY + Math.sin((Date.now() + 500) / 200) * 6;
        leftSideAngle = Math.sin(Date.now() / 400) * 0.05;
    }

    lobbyPlayer.vy += lobbyPlayer.gravity; 
    lobbyPlayer.y += lobbyPlayer.vy; 
    lobbyPlayer.x += 1.2 * lobbyPlayer.dir; 
    lobbyPlayer.angle += 0.05 * lobbyPlayer.dir;
     
    if (lobbyPlayer.y > lobbyPlayer.baseY) { 
        lobbyPlayer.y = lobbyPlayer.baseY; 
        lobbyPlayer.vy = -lobbyPlayer.jumpPower; 
        lobbyPlayer.angle = 0; 
    }
     
    lobbyFriend.angle = Math.sin(Date.now() / 300) * 0.1;

    // --- VẼ CÁC NHÂN VẬT Ở SẢNH CHỜ ---
    // 1. Nhân vật nhảy múa chính giữa
    drawEntityRaw(ctx, lobbyPlayer.x, lobbyPlayer.y, lobbyPlayer.w, lobbyPlayer.h, lobbyPlayer.angle, lobbyPlayer.vy, '#66fcf1', false, "😎");
    
    // 2. Nhân vật góc phải (Đồng đội - màu cam)
    drawEntityRaw(ctx, lobbyFriend.x, lobbyFriend.y, lobbyFriend.h ? lobbyFriend.w : 30, lobbyFriend.h || 30, lobbyFriend.angle, 0, '#ff9f1c', true, "🤖");

    // 3. Nhân vật góc trái
    drawEntityRaw(ctx, leftCornerX, leftSideY, 30, 60, leftSideAngle, 0, '#00f0ff', true, "🤩");
     
    lobbyAnimId = requestAnimationFrame(lobbyLoop);
}
