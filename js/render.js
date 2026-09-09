function drawEntityRaw(ctx, x, y, w, h, angle, vy, colorStr, isFriend = false, currentEmoji = "😎") {
    ctx.save(); ctx.translate(x, y); ctx.rotate(angle); 
    
    // 1. Thân chính nhân vật
    ctx.fillStyle = colorStr; ctx.shadowBlur = 20; ctx.shadowColor = colorStr; ctx.fillRect(-w / 2, -h / 2, w, h);
    
    // 2. Ô kính visor màu đen
    ctx.fillStyle = '#0b0c10'; ctx.shadowBlur = 0; ctx.fillRect(-w / 2 + 6, -h / 2 + 6, w - 12, 6);
    
    // 3. Giáp vai / tay hai bên
    let hOffset = isFriend ? Math.sin(Date.now() / 150) * 8 - 5 : -vy * 1.5;
    if (!isFriend) { if (hOffset < -18) hOffset = -18; if (hOffset > 10) hOffset = 10; }
    ctx.fillStyle = '#45a29e'; ctx.fillRect(-w / 2 - 12, hOffset - 6, 8, 12); ctx.fillRect(w / 2 + 4, hOffset - 6, 8, 12);

    // 4. Khối cổ nối liền thân với đầu (Tùy chỉnh)
    ctx.fillStyle = colorStr;
    ctx.fillRect(-10, -h / 2 + (-4), 20, 16);

    // 5. Khuôn mặt Emoji
    ctx.save();
    ctx.font = "30px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowBlur = 0; 
    let emojiY = -h / 2 + (4); 
    ctx.fillText(currentEmoji || "😎", 0, emojiY);
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

function lobbyLoop() {
    if (!isLobby) return;
    ctx.fillStyle = 'rgba(11, 12, 16, 0.4)'; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);
     
    const profileBox = document.getElementById('profile-box');
    if (profileBox) { 
        const rect = profileBox.getBoundingClientRect(); 
         
        lobbyFriend.x = rect.right - 28; 
        lobbyFriend.y = rect.top - 20; 
         
        lobbyPlayer.baseY = rect.top - 20; 
         
        let leftBound = rect.left + 20;
        let rightBound = rect.left + rect.width / 2;
         
        if (lobbyPlayer.x > rightBound) lobbyPlayer.dir = -1;
        if (lobbyPlayer.x < leftBound) lobbyPlayer.dir = 1;
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
     
    drawEntityRaw(ctx, lobbyPlayer.x, lobbyPlayer.y, lobbyPlayer.w, lobbyPlayer.h, lobbyPlayer.angle, lobbyPlayer.vy, '#66fcf1', false, "😎");
    drawEntityRaw(ctx, lobbyFriend.x, lobbyFriend.y, lobbyFriend.h ? lobbyFriend.w : 30, lobbyFriend.h || 30, lobbyFriend.angle, 0, '#ff9f1c', true, "🤖");
     
    lobbyAnimId = requestAnimationFrame(lobbyLoop);
}
