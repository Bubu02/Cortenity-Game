/* ====================================================
   Cortenity Gaming — Neon Dots & Boxes
   js/game.js
   ==================================================== */

(function () {
  'use strict';

  /* ---- Constants ---- */
  const PLAYER_A = 'A';
  const PLAYER_B = 'B';

  const COLORS = {
    A: { main: '#06b6d4', glow: 'rgba(6,182,212,0.6)', fill: 'rgba(6,182,212,0.12)', text: '#06b6d4' },
    B: { main: '#ec4899', glow: 'rgba(236,72,153,0.6)', fill: 'rgba(236,72,153,0.12)', text: '#ec4899' }
  };

  /* ---- State ---- */
  const state = {
    gridSize: 4,
    mode: null,
    difficulty: 'medium',
    currentPlayer: PLAYER_A,
    gameActive: false,
    gameStarted: false,
    lines: {},        // lineKey -> owner (PLAYER_A | PLAYER_B)
    boxes: {},        // "row-col" -> owner
    scores: { A: 0, B: 0 },
    logEntries: [],
    pendingTimeout: null,
    hoveredLine: null
  };

  /* ---- Canvas ---- */
  let canvas, ctx;
  let canvasSize = 540;
  const PADDING = 40;

  /* ---- DOM Refs ---- */
  const $ = (id) => document.getElementById(id);

  const el = {
    canvas:          $('dab-canvas'),
    container:       $('dab-board-container'),
    turnLabel:       $('turn-label'),
    gridLabel:       $('grid-label'),
    boxesLeftLabel:  $('boxes-left-label'),
    statusMessage:   $('status-message'),
    modeLabel:       $('game-mode-label'),
    newGameBtn:      $('new-game-btn'),
    gameShell:       $('game-shell'),
    modeSelector:    $('mode-selector'),
    modeFeedback:    $('mode-feedback'),
    playNowBtn:      $('play-now-btn'),
    openModeBtn:     $('open-mode-selector'),
    startBotBtn:     $('start-bot-match'),
    startLocalBtn:   $('start-local-match'),
    resetMatchBtn:   $('reset-match-btn'),
    matchLog:        $('match-log'),
    scoreA:          $('score-a'),
    scoreB:          $('score-b')
  };

  /* ---- Init ---- */
  canvas = el.canvas;
  ctx = canvas.getContext('2d');

  initMarketingEffects();
  bindEvents();
  resizeCanvas();
  renderBoard();
  renderSidebar();

  window.addEventListener('resize', () => {
    resizeCanvas();
    renderBoard();
  });

  /* ================= MARKETING EFFECTS ================= */
  function initMarketingEffects() {
    const counterEls = document.querySelectorAll('[data-counter]');
    if (counterEls.length && 'IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const target = parseInt(entry.target.dataset.counter, 10);
            animateCounter(entry.target, target, 1600);
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.5 });
      counterEls.forEach((item) => io.observe(item));
    }

    document.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener('click', function (e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });

    const orb1 = document.querySelector('.hero-orb-1');
    const orb2 = document.querySelector('.hero-orb-2');
    document.addEventListener('mousemove', (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 30;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;
      if (orb1) orb1.style.transform = `translate(${x}px, ${y}px)`;
      if (orb2) orb2.style.transform = `translate(${-x}px, ${-y}px)`;
    });

    animatePreviewBoard();
  }

  function animateCounter(elem, target, duration) {
    const increment = target / (duration / 16);
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      elem.textContent = Math.floor(current).toLocaleString();
    }, 16);
  }

  function animatePreviewBoard() {
    const linesGroup = document.getElementById('preview-lines');
    const boxesGroup = document.getElementById('preview-boxes');
    if (!linesGroup || !boxesGroup) return;

    const sequence = [
      [30, 30, 100, 30, 'A'],
      [100, 30, 170, 30, 'B'],
      [30, 30, 30, 100, 'A'],
      [100, 30, 100, 100, 'B'],
      [30, 100, 100, 100, 'A'],
      [170, 30, 170, 100, 'A'],
      [100, 100, 170, 100, 'A'],
      [30, 100, 30, 170, 'B'],
      [30, 170, 100, 170, 'B'],
    ];

    const boxCompletions = [
      { afterStep: 4, x: 32, y: 32, w: 66, h: 66, player: 'A' },
      { afterStep: 6, x: 102, y: 32, w: 66, h: 66, player: 'A' },
    ];

    let step = 0;

    function playStep() {
      if (step >= sequence.length) {
        setTimeout(() => {
          linesGroup.innerHTML = '';
          boxesGroup.innerHTML = '';
          step = 0;
          setTimeout(playStep, 1200);
        }, 2500);
        return;
      }

      const [x1, y1, x2, y2, player] = sequence[step];
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', x1);
      line.setAttribute('y1', y1);
      line.setAttribute('x2', x2);
      line.setAttribute('y2', y2);
      line.setAttribute('class', player === 'A' ? 'preview-line-a' : 'preview-line-b');
      linesGroup.appendChild(line);

      const currentStep = step;
      boxCompletions.forEach((bc) => {
        if (bc.afterStep === currentStep) {
          const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
          rect.setAttribute('x', bc.x);
          rect.setAttribute('y', bc.y);
          rect.setAttribute('width', bc.w);
          rect.setAttribute('height', bc.h);
          rect.setAttribute('rx', '6');
          rect.setAttribute('fill', bc.player === 'A' ? 'rgba(6,182,212,0.15)' : 'rgba(236,72,153,0.15)');
          rect.style.animation = 'lineAppear 0.4s ease forwards';
          boxesGroup.appendChild(rect);

          const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          text.setAttribute('x', bc.x + bc.w / 2);
          text.setAttribute('y', bc.y + bc.h / 2 + 8);
          text.setAttribute('fill', bc.player === 'A' ? '#06b6d4' : '#ec4899');
          text.setAttribute('font-size', '22');
          text.setAttribute('font-weight', '900');
          text.setAttribute('text-anchor', 'middle');
          text.setAttribute('font-family', 'Inter, sans-serif');
          text.textContent = bc.player;
          text.style.animation = 'lineAppear 0.4s ease forwards';
          boxesGroup.appendChild(text);
        }
      });

      step++;
      setTimeout(playStep, 700);
    }

    setTimeout(playStep, 1500);
  }

  /* ================= EVENT BINDING ================= */
  function bindEvents() {
    el.playNowBtn?.addEventListener('click', openModeSelector);
    el.openModeBtn?.addEventListener('click', openModeSelector);

    el.startBotBtn?.addEventListener('click', () => startMatch('bot'));
    el.startLocalBtn?.addEventListener('click', () => startMatch('local'));

    el.resetMatchBtn?.addEventListener('click', () => {
      if (state.mode) {
        startMatch(state.mode);
      } else {
        openModeSelector();
      }
    });

    el.newGameBtn?.addEventListener('click', () => {
      if (state.mode) {
        startNewRound();
      }
    });

    document.querySelectorAll('.difficulty-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.difficulty = btn.dataset.difficulty;
        document.querySelectorAll('.difficulty-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        addLog(`Difficulty changed to ${state.difficulty}.`);
        renderSidebar();
      });
    });

    document.querySelectorAll('.grid-size-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.gridSize = parseInt(btn.dataset.size, 10);
        document.querySelectorAll('.grid-size-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    canvas.addEventListener('mousemove', handleCanvasMouseMove);
    canvas.addEventListener('mouseleave', handleCanvasMouseLeave);
    canvas.addEventListener('click', handleCanvasClick);
    canvas.addEventListener('touchstart', handleCanvasTouch, { passive: false });
  }

  /* ================= CANVAS SIZING ================= */
  function resizeCanvas() {
    const container = el.container;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    canvasSize = Math.min(rect.width, rect.height, 540);
    if (canvasSize <= 0) canvasSize = 400;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvasSize * dpr;
    canvas.height = canvasSize * dpr;
    canvas.style.width = canvasSize + 'px';
    canvas.style.height = canvasSize + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  /* ================= GRID CALCULATIONS ================= */
  function getCellSize() {
    return (canvasSize - PADDING * 2) / (state.gridSize - 1);
  }

  function getDotPos(row, col) {
    const cellSize = getCellSize();
    return {
      x: PADDING + col * cellSize,
      y: PADDING + row * cellSize
    };
  }

  function lineKey(type, row, col) {
    return `${type}-${row}-${col}`;
  }

  function hasLine(key) {
    return key in state.lines;
  }

  function findClosestLine(px, py) {
    const cellSize = getCellSize();
    const threshold = cellSize * 0.35;
    let bestDist = Infinity;
    let bestLine = null;

    for (let r = 0; r < state.gridSize; r++) {
      for (let c = 0; c < state.gridSize - 1; c++) {
        const p1 = getDotPos(r, c);
        const p2 = getDotPos(r, c + 1);
        const mx = (p1.x + p2.x) / 2;
        const my = (p1.y + p2.y) / 2;
        const dist = Math.sqrt((px - mx) ** 2 + (py - my) ** 2);
        if (dist < threshold && dist < bestDist) {
          bestDist = dist;
          bestLine = lineKey('h', r, c);
        }
      }
    }

    for (let r = 0; r < state.gridSize - 1; r++) {
      for (let c = 0; c < state.gridSize; c++) {
        const p1 = getDotPos(r, c);
        const p2 = getDotPos(r + 1, c);
        const mx = (p1.x + p2.x) / 2;
        const my = (p1.y + p2.y) / 2;
        const dist = Math.sqrt((px - mx) ** 2 + (py - my) ** 2);
        if (dist < threshold && dist < bestDist) {
          bestDist = dist;
          bestLine = lineKey('v', r, c);
        }
      }
    }

    return bestLine;
  }

  /* ================= CANVAS EVENT HANDLERS ================= */
  function getCanvasPos(e) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (canvasSize / rect.width),
      y: (e.clientY - rect.top) * (canvasSize / rect.height)
    };
  }

  function handleCanvasMouseMove(e) {
    if (!state.gameActive) {
      state.hoveredLine = null;
      renderBoard();
      return;
    }
    const pos = getCanvasPos(e);
    const line = findClosestLine(pos.x, pos.y);
    if (line && !hasLine(line)) {
      state.hoveredLine = line;
    } else {
      state.hoveredLine = null;
    }
    renderBoard();
  }

  function handleCanvasMouseLeave() {
    state.hoveredLine = null;
    renderBoard();
  }

  function handleCanvasClick(e) {
    if (!state.gameActive) return;
    if (state.mode === 'bot' && state.currentPlayer === PLAYER_B) return;

    const pos = getCanvasPos(e);
    const line = findClosestLine(pos.x, pos.y);
    if (line && !hasLine(line)) {
      placeLine(line);
    }
  }

  function handleCanvasTouch(e) {
    if (!state.gameActive) return;
    if (state.mode === 'bot' && state.currentPlayer === PLAYER_B) return;
    e.preventDefault();

    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const pos = {
      x: (touch.clientX - rect.left) * (canvasSize / rect.width),
      y: (touch.clientY - rect.top) * (canvasSize / rect.height)
    };
    const line = findClosestLine(pos.x, pos.y);
    if (line && !hasLine(line)) {
      placeLine(line);
    }
  }

  /* ================= MODE SELECTOR ================= */
  function openModeSelector(e) {
    if (e) e.preventDefault();
    document.getElementById('arena')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    el.modeSelector.classList.add('visible');
    el.modeFeedback.textContent = state.mode
      ? 'Start a fresh match or switch modes.'
      : 'Pick a mode to start playing.';
    if (!state.gameStarted) {
      el.gameShell.classList.add('is-locked');
    }
  }

  function closeModeSelector() {
    el.modeSelector.classList.remove('visible');
    if (state.gameStarted) {
      el.gameShell.classList.remove('is-locked');
    }
  }

  /* ================= MATCH FLOW ================= */
  function startMatch(mode) {
    clearPending();
    state.mode = mode;
    state.scores = { A: 0, B: 0 };
    state.logEntries = [];
    state.gameStarted = true;

    el.modeLabel.textContent = mode === 'bot' ? 'vs Bot' : 'Local 2P';

    addLog(`${mode === 'bot' ? 'Bot match' : 'Local match'} started on ${state.gridSize}×${state.gridSize} grid. Good luck!`);
    closeModeSelector();
    startNewRound();
  }

  function startNewRound() {
    clearPending();
    state.lines = {};
    state.boxes = {};
    state.currentPlayer = PLAYER_A;
    state.gameActive = true;
    state.hoveredLine = null;

    setStatus(state.mode === 'bot'
      ? 'Your turn. Draw a line between two adjacent dots.'
      : 'Player A\'s turn. Click between two dots to draw a line.');

    resizeCanvas();
    renderBoard();
    renderSidebar();
  }

  /* ================= GAME LOGIC ================= */
  function placeLine(key) {
    if (hasLine(key)) return;

    const player = state.currentPlayer;
    state.lines[key] = player;

    const completedBoxes = checkNewBoxes(key, player);

    if (completedBoxes > 0) {
      state.scores[player] += completedBoxes;
      const label = getPlayerLabel(player);
      addLog(`${label} completed ${completedBoxes} box${completedBoxes > 1 ? 'es' : ''}! Extra turn.`);
      setStatus(`${label} completed ${completedBoxes} box${completedBoxes > 1 ? 'es' : ''}! Go again!`);
    } else {
      state.currentPlayer = state.currentPlayer === PLAYER_A ? PLAYER_B : PLAYER_A;
      const label = getPlayerLabel(state.currentPlayer);
      setStatus(`${label}'s turn.`);
    }

    const totalBoxes = (state.gridSize - 1) * (state.gridSize - 1);
    if (Object.keys(state.boxes).length === totalBoxes) {
      endGame();
    }

    renderBoard();
    renderSidebar();

    if (state.mode === 'bot' && state.currentPlayer === PLAYER_B && state.gameActive) {
      setStatus('Bot is thinking...');
      state.pendingTimeout = setTimeout(() => {
        if (!state.gameActive) return;
        botTurn();
      }, 400 + Math.random() * 500);
    }
  }

  function checkNewBoxes(key, player) {
    const parts = key.split('-');
    const type = parts[0];
    const row = parseInt(parts[1], 10);
    const col = parseInt(parts[2], 10);

    let completed = 0;

    if (type === 'h') {
      if (row > 0) {
        const boxKey = `${row - 1}-${col}`;
        if (!(boxKey in state.boxes) && isBoxComplete(row - 1, col)) {
          state.boxes[boxKey] = player;
          completed++;
        }
      }
      if (row < state.gridSize - 1) {
        const boxKey = `${row}-${col}`;
        if (!(boxKey in state.boxes) && isBoxComplete(row, col)) {
          state.boxes[boxKey] = player;
          completed++;
        }
      }
    } else {
      if (col > 0) {
        const boxKey = `${row}-${col - 1}`;
        if (!(boxKey in state.boxes) && isBoxComplete(row, col - 1)) {
          state.boxes[boxKey] = player;
          completed++;
        }
      }
      if (col < state.gridSize - 1) {
        const boxKey = `${row}-${col}`;
        if (!(boxKey in state.boxes) && isBoxComplete(row, col)) {
          state.boxes[boxKey] = player;
          completed++;
        }
      }
    }

    return completed;
  }

  function isBoxComplete(row, col) {
    return (
      hasLine(lineKey('h', row, col)) &&
      hasLine(lineKey('h', row + 1, col)) &&
      hasLine(lineKey('v', row, col)) &&
      hasLine(lineKey('v', row, col + 1))
    );
  }

  function countSidesOfBox(row, col) {
    let count = 0;
    if (hasLine(lineKey('h', row, col))) count++;
    if (hasLine(lineKey('h', row + 1, col))) count++;
    if (hasLine(lineKey('v', row, col))) count++;
    if (hasLine(lineKey('v', row, col + 1))) count++;
    return count;
  }

  function endGame() {
    state.gameActive = false;
    const aScore = state.scores.A;
    const bScore = state.scores.B;

    if (aScore > bScore) {
      const label = getPlayerLabel(PLAYER_A);
      addLog(`${label} wins with ${aScore} boxes! 🎉`);
      setStatus(`${label} wins the round with ${aScore} boxes!`);
    } else if (bScore > aScore) {
      const label = getPlayerLabel(PLAYER_B);
      addLog(`${label} wins with ${bScore} boxes! 🎉`);
      setStatus(`${label} wins the round with ${bScore} boxes!`);
    } else {
      addLog("It's a draw!");
      setStatus("It's a draw! Both players tied.");
    }
  }

  /* ================= BOT AI ================= */
  function botTurn() {
    if (!state.gameActive || state.currentPlayer !== PLAYER_B) return;

    const move = getBotMove();
    if (move) {
      placeLine(move);
    }
  }

  function getBotMove() {
    switch (state.difficulty) {
      case 'easy':   return getBotMoveEasy();
      case 'medium': return getBotMoveMedium();
      case 'hard':   return getBotMoveHard();
      default:       return getBotMoveMedium();
    }
  }

  function getAllAvailableLines() {
    const lines = [];
    for (let r = 0; r < state.gridSize; r++) {
      for (let c = 0; c < state.gridSize - 1; c++) {
        const key = lineKey('h', r, c);
        if (!hasLine(key)) lines.push(key);
      }
    }
    for (let r = 0; r < state.gridSize - 1; r++) {
      for (let c = 0; c < state.gridSize; c++) {
        const key = lineKey('v', r, c);
        if (!hasLine(key)) lines.push(key);
      }
    }
    return lines;
  }

  function getBotMoveEasy() {
    const available = getAllAvailableLines();
    return available[Math.floor(Math.random() * available.length)];
  }

  function getBotMoveMedium() {
    if (Math.random() < 0.5) {
      return getBotMoveHard();
    }
    return getBotMoveEasy();
  }

  function getBotMoveHard() {
    const available = getAllAvailableLines();
    if (available.length === 0) return null;

    // 1. Greedily complete any boxes
    for (const line of available) {
      if (simulateCompletions(line) > 0) return line;
    }

    // 2. Avoid creating 3-sided boxes for opponent
    const safe = available.filter((line) => !wouldGiveOpponentBox(line));
    if (safe.length > 0) {
      return safe[Math.floor(Math.random() * safe.length)];
    }

    // 3. Pick least-damage move
    let bestMove = available[0];
    let bestDamage = Infinity;
    for (const line of available) {
      const damage = countOpponentGains(line);
      if (damage < bestDamage) {
        bestDamage = damage;
        bestMove = line;
      }
    }
    return bestMove;
  }

  function simulateCompletions(key) {
    const parts = key.split('-');
    const type = parts[0];
    const row = parseInt(parts[1], 10);
    const col = parseInt(parts[2], 10);

    let completed = 0;
    state.lines[key] = '_temp';

    if (type === 'h') {
      if (row > 0 && !(`${row - 1}-${col}` in state.boxes) && isBoxComplete(row - 1, col)) completed++;
      if (row < state.gridSize - 1 && !(`${row}-${col}` in state.boxes) && isBoxComplete(row, col)) completed++;
    } else {
      if (col > 0 && !(`${row}-${col - 1}` in state.boxes) && isBoxComplete(row, col - 1)) completed++;
      if (col < state.gridSize - 1 && !(`${row}-${col}` in state.boxes) && isBoxComplete(row, col)) completed++;
    }

    delete state.lines[key];
    return completed;
  }

  function wouldGiveOpponentBox(key) {
    const parts = key.split('-');
    const type = parts[0];
    const row = parseInt(parts[1], 10);
    const col = parseInt(parts[2], 10);

    state.lines[key] = '_temp';
    let dangerous = false;

    if (type === 'h') {
      if (row > 0 && !(`${row - 1}-${col}` in state.boxes) && countSidesOfBox(row - 1, col) === 3) dangerous = true;
      if (row < state.gridSize - 1 && !(`${row}-${col}` in state.boxes) && countSidesOfBox(row, col) === 3) dangerous = true;
    } else {
      if (col > 0 && !(`${row}-${col - 1}` in state.boxes) && countSidesOfBox(row, col - 1) === 3) dangerous = true;
      if (col < state.gridSize - 1 && !(`${row}-${col}` in state.boxes) && countSidesOfBox(row, col) === 3) dangerous = true;
    }

    delete state.lines[key];
    return dangerous;
  }

  function countOpponentGains(key) {
    state.lines[key] = '_temp';
    let count = 0;
    for (let r = 0; r < state.gridSize - 1; r++) {
      for (let c = 0; c < state.gridSize - 1; c++) {
        if (!(`${r}-${c}` in state.boxes) && countSidesOfBox(r, c) === 3) {
          count++;
        }
      }
    }
    delete state.lines[key];
    return count;
  }

  /* ================= RENDERING ================= */
  function renderBoard() {
    if (!ctx) return;

    ctx.clearRect(0, 0, canvasSize, canvasSize);
    const cellSize = getCellSize();
    const dotRadius = Math.max(5, cellSize * 0.07);

    // 1. Draw box fills
    for (const [key, owner] of Object.entries(state.boxes)) {
      const [row, col] = key.split('-').map(Number);
      const p = getDotPos(row, col);
      const color = COLORS[owner];

      ctx.fillStyle = color.fill;
      ctx.beginPath();
      roundRect(ctx, p.x + 2, p.y + 2, cellSize - 4, cellSize - 4, 6);
      ctx.fill();

      ctx.fillStyle = color.text;
      ctx.font = `900 ${Math.max(14, cellSize * 0.35)}px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = color.glow;
      ctx.shadowBlur = 12;
      ctx.fillText(owner, p.x + cellSize / 2, p.y + cellSize / 2);
      ctx.shadowBlur = 0;
    }

    // 2. Draw guide lines (faint dashed for available lines)
    ctx.save();
    ctx.setLineDash([2, 4]);
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;

    for (let r = 0; r < state.gridSize; r++) {
      for (let c = 0; c < state.gridSize - 1; c++) {
        const key = lineKey('h', r, c);
        if (!hasLine(key) && state.hoveredLine !== key) {
          const p1 = getDotPos(r, c);
          const p2 = getDotPos(r, c + 1);
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }
    }
    for (let r = 0; r < state.gridSize - 1; r++) {
      for (let c = 0; c < state.gridSize; c++) {
        const key = lineKey('v', r, c);
        if (!hasLine(key) && state.hoveredLine !== key) {
          const p1 = getDotPos(r, c);
          const p2 = getDotPos(r + 1, c);
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }
    }
    ctx.restore();

    // 3. Draw placed lines
    for (const [key, owner] of Object.entries(state.lines)) {
      if (owner === '_temp') continue;
      drawLineOnCanvas(key, owner, 1.0, false);
    }

    // 4. Draw hover line
    if (state.hoveredLine && !hasLine(state.hoveredLine)) {
      drawLineOnCanvas(state.hoveredLine, state.currentPlayer, 0.4, true);
    }

    // 5. Draw dots (on top)
    for (let r = 0; r < state.gridSize; r++) {
      for (let c = 0; c < state.gridSize; c++) {
        const pos = getDotPos(r, c);

        ctx.shadowColor = 'rgba(6,182,212,0.8)';
        ctx.shadowBlur = 10;

        ctx.beginPath();
        ctx.arc(pos.x, pos.y, dotRadius, 0, Math.PI * 2);
        ctx.fillStyle = '#06b6d4';
        ctx.fill();

        ctx.shadowBlur = 0;
      }
    }
  }

  function drawLineOnCanvas(key, owner, alpha, isHover) {
    const parts = key.split('-');
    const type = parts[0];
    const row = parseInt(parts[1], 10);
    const col = parseInt(parts[2], 10);

    let p1, p2;
    if (type === 'h') {
      p1 = getDotPos(row, col);
      p2 = getDotPos(row, col + 1);
    } else {
      p1 = getDotPos(row, col);
      p2 = getDotPos(row + 1, col);
    }

    const color = COLORS[owner] || COLORS[PLAYER_A];

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = color.main;
    ctx.lineWidth = Math.max(3, getCellSize() * 0.04);
    ctx.lineCap = 'round';
    ctx.setLineDash([]);

    if (!isHover) {
      ctx.shadowColor = color.glow;
      ctx.shadowBlur = 8;
    }

    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
    ctx.restore();
  }

  // Helper: roundRect polyfill
  function roundRect(ctx, x, y, w, h, r) {
    if (ctx.roundRect) {
      ctx.roundRect(x, y, w, h, r);
    } else {
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
    }
  }

  function renderSidebar() {
    if (el.turnLabel) {
      if (!state.gameActive && Object.keys(state.boxes).length > 0) {
        if (state.scores.A > state.scores.B) {
          el.turnLabel.textContent = `${getPlayerLabel(PLAYER_A)} Won`;
        } else if (state.scores.B > state.scores.A) {
          el.turnLabel.textContent = `${getPlayerLabel(PLAYER_B)} Won`;
        } else {
          el.turnLabel.textContent = 'Draw';
        }
      } else if (state.gameActive) {
        el.turnLabel.innerHTML = '';
        const indicator = document.createElement('span');
        indicator.className = 'turn-indicator';
        const mark = document.createElement('span');
        mark.className = `turn-mark ${state.currentPlayer === 'A' ? 'a-turn' : 'b-turn'}`;
        mark.textContent = state.currentPlayer;
        const text = document.createElement('span');
        text.textContent = ` ${getPlayerLabel(state.currentPlayer)}`;
        indicator.appendChild(mark);
        indicator.appendChild(text);
        el.turnLabel.appendChild(indicator);
      } else {
        el.turnLabel.textContent = 'Waiting';
      }
    }

    if (el.gridLabel) {
      el.gridLabel.textContent = state.gameStarted
        ? `${state.gridSize}×${state.gridSize} (${(state.gridSize - 1) * (state.gridSize - 1)} boxes)`
        : '-';
    }

    if (el.boxesLeftLabel) {
      if (state.gameStarted) {
        const total = (state.gridSize - 1) * (state.gridSize - 1);
        const claimed = Object.keys(state.boxes).length;
        el.boxesLeftLabel.textContent = `${total - claimed} / ${total}`;
      } else {
        el.boxesLeftLabel.textContent = '-';
      }
    }

    if (el.scoreA) el.scoreA.textContent = state.scores.A;
    if (el.scoreB) el.scoreB.textContent = state.scores.B;

    if (el.matchLog) {
      el.matchLog.innerHTML = '';
      const entries = state.logEntries.length
        ? state.logEntries
        : ['Match events will appear here after you start a game.'];
      entries.forEach((entry) => {
        const node = document.createElement('div');
        node.className = 'log-entry';
        node.textContent = entry;
        el.matchLog.appendChild(node);
      });
    }
  }

  /* ================= HELPERS ================= */
  function getPlayerLabel(player) {
    if (state.mode === 'bot') {
      return player === 'A' ? 'You (A)' : 'Bot (B)';
    }
    return `Player ${player}`;
  }

  function addLog(message) {
    state.logEntries.unshift(message);
    state.logEntries = state.logEntries.slice(0, 20);
  }

  function setStatus(message) {
    if (el.statusMessage) el.statusMessage.textContent = message;
  }

  function clearPending() {
    if (state.pendingTimeout) {
      clearTimeout(state.pendingTimeout);
      state.pendingTimeout = null;
    }
  }
})();
