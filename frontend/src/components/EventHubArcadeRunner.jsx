import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Ticket, Sparkles, Volume2, VolumeX, Flame, Trophy, RotateCcw, Heart } from 'lucide-react';
import { ArcadeJoystickSticker, AirborneBoosterSticker, SpringJumpSticker } from './CustomStickers';

/**
 * EventHub High-Level 2D Arcade Runner (World 1-1 Box Office)
 * Complete revamp featuring:
 * 1. Proportional, expressive cartoon mascot runner with sneakers, hoodie, and cap
 * 2. Uneven passes placement across 3 vertical heights and organic clusters
 * 3. Rival "Scalper Bot" antagonist hovering on a drone who deploys diverse obstacles
 * 4. 5 diverse obstacle types (Velvet Stanchion, Subwoofer, Cinema Film Reel, Laser Tripwire, Turnstile)
 * 5. Bespoke SpringJumpSticker asset (zero emojis)
 * 6. Score & passes reset to 0 per run with persistent HI-SCORE and BEST PASSES
 * 7. 3-Hearts life system with clean game over and instant replay loop
 */
export default function EventHubArcadeRunner() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  // Run statistics (reset every new run)
  const [score, setScore] = useState(0);
  const [passesCollected, setPassesCollected] = useState(0);
  const [lives, setLives] = useState(3);
  const [isGameOver, setIsGameOver] = useState(false);

  // Persistent Records
  const [highScore, setHighScore] = useState(() => {
    try {
      return parseInt(localStorage.getItem('eventhub_arcade_hi_score') || '0', 10);
    } catch {
      return 0;
    }
  });
  const [highPasses, setHighPasses] = useState(() => {
    try {
      return parseInt(localStorage.getItem('eventhub_arcade_high_passes') || '0', 10);
    } catch {
      return 0;
    }
  });

  // Gameplay state
  const [isAirborne, setIsAirborne] = useState(false);
  const [canDoubleJump, setCanDoubleJump] = useState(false);
  const [isSpringBoosted, setIsSpringBoosted] = useState(false);
  const [comboCount, setComboCount] = useState(0);
  const [isFeverMode, setIsFeverMode] = useState(false);
  const [muted, setMuted] = useState(true);

  // Update high score whenever current run exceeds it
  const updateHighScore = useCallback((newScore, newPasses) => {
    setHighScore((prev) => {
      if (newScore > prev) {
        try {
          localStorage.setItem('eventhub_arcade_hi_score', newScore.toString());
        } catch {
          // localStorage failsafe
        }
        return newScore;
      }
      return prev;
    });

    setHighPasses((prev) => {
      if (newPasses > prev) {
        try {
          localStorage.setItem('eventhub_arcade_high_passes', newPasses.toString());
        } catch {
          // localStorage failsafe
        }
        return newPasses;
      }
      return prev;
    });
  }, []);

  // Web Audio 8-bit sound generator
  const playArcadeTone = useCallback((type) => {
    if (muted) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      if (type === 'jump') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'square';
        osc.frequency.setValueAtTime(170, now);
        osc.frequency.exponentialRampToValueAtTime(620, now + 0.13);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);
        osc.start(now);
        osc.stop(now + 0.13);
      } else if (type === 'double-jump') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(980, now + 0.17);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.17);
        osc.start(now);
        osc.stop(now + 0.17);
      } else if (type === 'ticket') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(987.77, now);
        osc.frequency.setValueAtTime(1318.51, now + 0.07);
        gain.gain.setValueAtTime(0.09, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        osc.start(now);
        osc.stop(now + 0.22);
      } else if (type === 'hit') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.linearRampToValueAtTime(80, now + 0.22);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        osc.start(now);
        osc.stop(now + 0.22);
      } else if (type === 'spring') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.exponentialRampToValueAtTime(850, now + 0.24);
        gain.gain.setValueAtTime(0.09, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
        osc.start(now);
        osc.stop(now + 0.24);
      }
    } catch {
      // AudioContext gestures
    }
  }, [muted]);

  // Jump trigger hookable across keyboard and clicks
  const triggerJumpRef = useRef(null);
  const restartGameRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let dpr = window.devicePixelRatio || 1;
    let cssWidth = canvas.offsetWidth;
    let cssHeight = canvas.offsetHeight;

    const setupDPI = () => {
      dpr = window.devicePixelRatio || 1;
      cssWidth = canvas.offsetWidth;
      cssHeight = canvas.offsetHeight;
      canvas.width = Math.round(cssWidth * dpr);
      canvas.height = Math.round(cssHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    setupDPI();

    const handleResize = () => {
      setupDPI();
    };
    window.addEventListener('resize', handleResize);

    // ─── GAME STATE CONSTANTS ───
    const groundHeight = 44;
    const groundY = cssHeight - groundHeight;

    // Redesigned Charismatic Mascot Character
    const player = {
      x: 76,
      y: groundY - 54,
      w: 38,
      h: 54,
      vy: 0,
      jumpForce: -11.6,
      doubleJumpForce: -10.0,
      gravity: 0.58,
      grounded: true,
      jumpsRemaining: 2,
      runFrame: 0,
      eyeBlinkTimer: 0,
      invulnerableTimer: 0,
      isDizzy: false
    };

    // Antagonist "Scalper Bot" Drone Character who drops obstacles
    const scalperBot = {
      x: cssWidth - 85,
      baseY: groundY - 95,
      y: groundY - 95,
      floatPhase: 0,
      dropTimer: 3.2,
      dropAnim: 0,
      speechBubble: null
    };

    // Parallax background items
    const stars = Array.from({ length: 36 }, () => ({
      x: Math.random() * cssWidth,
      y: Math.random() * (cssHeight - 80),
      size: Math.random() > 0.5 ? 2.5 : 1.5,
      color: ['#FFE142', '#FF4081', '#05FFA1', '#00E5FF', '#FFFFFF'][Math.floor(Math.random() * 5)],
      speed: 0.2 + Math.random() * 0.35,
      phase: Math.random() * Math.PI * 2
    }));

    // City Festival Skyline
    const cityBuildings = [
      { x: 0, w: 110, h: 90, type: 'dome', name: 'IMAX DOME' },
      { x: 130, w: 85, h: 120, type: 'tower', name: 'BOX TOWER' },
      { x: 235, w: 135, h: 80, type: 'arena', name: 'ARENA ONE' },
      { x: 390, w: 95, h: 130, type: 'tower', name: 'VIP LOUNGE' },
      { x: 505, w: 150, h: 95, type: 'dome', name: 'MAIN STAGE' },
      { x: 675, w: 105, h: 110, type: 'tower', name: 'CONCERT LAB' },
      { x: 800, w: 140, h: 85, type: 'arena', name: 'CINEMA 4D' }
    ];

    // Animated concert crowd waving glowsticks
    const crowdMembers = Array.from({ length: 24 }, (_, i) => ({
      x: i * (cssWidth / 20),
      baseY: groundY + 4,
      bounceSpeed: 0.06 + Math.random() * 0.04,
      phase: Math.random() * Math.PI * 2,
      glowstickColor: ['#05FFA1', '#FF4081', '#FFE142', '#00E5FF'][i % 4]
    }));

    // ─── UNEVEN PASSES PLACEMENT (VARIED HEIGHTS & DISTANCES) ───
    // Passes scattered across 3 distinct vertical heights and irregular clusters
    let tickets = [
      // Cluster 1: Ground skimming ticket
      { x: cssWidth * 0.38, y: groundY - 26, collected: false, sparkleAngle: 0, tier: 'low' },
      // Cluster 2: Mid-air jump ticket
      { x: cssWidth * 0.52, y: groundY - 62, collected: false, sparkleAngle: 1.2, tier: 'mid' },
      // Cluster 3: High VIP double-jump ticket
      { x: cssWidth * 0.68, y: groundY - 105, collected: false, sparkleAngle: 2.4, tier: 'high' },
      // Cluster 4: Arch of 2 tickets over an obstacle
      { x: cssWidth * 0.95, y: groundY - 48, collected: false, sparkleAngle: 0.5, tier: 'mid' },
      { x: cssWidth * 1.02, y: groundY - 82, collected: false, sparkleAngle: 1.7, tier: 'high' },
      // Cluster 5: Solitary ground speed pass
      { x: cssWidth * 1.25, y: groundY - 26, collected: false, sparkleAngle: 3.1, tier: 'low' },
      // Cluster 6: High stratosphere pass
      { x: cssWidth * 1.45, y: groundY - 115, collected: false, sparkleAngle: 0.9, tier: 'high' }
    ];

    // Interactive Platform Blocks
    let mysteryBlocks = [
      { x: cssWidth * 0.64, y: groundY - 82, w: 32, h: 32, hit: false, bumpOffset: 0 },
      { x: cssWidth * 1.35, y: groundY - 86, w: 32, h: 32, hit: false, bumpOffset: 0 }
    ];

    // ─── 5 EXPANDED OBSTACLE TYPES ───
    // (Stanchion, Subwoofer, Film Reel, Laser Tripwire, Metro Turnstile)
    let obstacles = [
      { x: cssWidth * 0.46, y: groundY - 32, w: 26, h: 32, type: 'stanchion' },
      { x: cssWidth * 0.78, y: groundY - 26, w: 28, h: 26, type: 'subwoofer', pulse: 0 },
      { x: cssWidth * 1.12, y: groundY - 30, w: 30, h: 30, type: 'filmreel', angle: 0 },
      { x: cssWidth * 1.52, y: groundY - 28, w: 32, h: 28, type: 'lasertripwire', beamPhase: 0 },
      { x: cssWidth * 1.88, y: groundY - 34, w: 26, h: 34, type: 'turnstile', angle: 0 }
    ];

    let springPads = [
      { x: cssWidth * 0.88, y: groundY - 10, w: 34, h: 10, compress: 0 }
    ];

    let particles = [];
    let floatingPopups = [];

    // Ambient Lighting & Parallax
    let searchlightAngle1 = -0.3;
    let searchlightAngle2 = 0.4;
    let scrollX = 0;
    const baseSpeed = 2.6;
    let feverTimeLeft = 0;
    let comboStreak = 0;
    let comboResetTimer = 0;

    let currentScore = 0;
    let currentPasses = 0;
    let currentLives = 3;
    let gameOver = false;

    // ─── RESTART GAME LOGIC ───
    const restartGame = () => {
      currentScore = 0;
      currentPasses = 0;
      currentLives = 3;
      gameOver = false;
      comboStreak = 0;
      feverTimeLeft = 0;
      setScore(0);
      setPassesCollected(0);
      setLives(3);
      setIsGameOver(false);
      setComboCount(0);
      setIsFeverMode(false);

      player.x = 76;
      player.y = groundY - 54;
      player.vy = 0;
      player.grounded = true;
      player.jumpsRemaining = 2;
      player.invulnerableTimer = 0;
      player.isDizzy = false;

      // Reset tickets with varied uneven heights
      tickets.forEach((t, i) => {
        t.x = cssWidth * (0.35 + i * 0.22);
        t.collected = false;
      });

      obstacles.forEach((obs, i) => {
        obs.x = cssWidth * (0.5 + i * 0.35);
        obs.hurdled = false;
      });
    };
    restartGameRef.current = restartGame;

    // ─── JUMP & DOUBLE JUMP MECHANIC ───
    const jump = () => {
      if (gameOver) {
        restartGame();
        return;
      }

      if (player.grounded) {
        // First jump from ground
        player.vy = player.jumpForce;
        player.grounded = false;
        player.jumpsRemaining = 1;
        setIsAirborne(true);
        setCanDoubleJump(true);
        playArcadeTone('jump');

        // Takeoff dust puffs
        for (let i = 0; i < 6; i++) {
          particles.push({
            x: player.x + player.w * 0.5,
            y: groundY - 2,
            vx: (Math.random() - 0.5) * 4 - 1.2,
            vy: -Math.random() * 2.5 - 0.5,
            size: 3 + Math.random() * 3,
            color: '#FFE142',
            life: 1
          });
        }
      } else if (player.jumpsRemaining > 0) {
        // Second jump (Air Boost) in mid-air
        player.vy = player.doubleJumpForce;
        player.jumpsRemaining = 0;
        setCanDoubleJump(false);
        playArcadeTone('double-jump');

        // Ring of thruster sparks
        for (let i = 0; i < 12; i++) {
          const angle = (i / 12) * Math.PI * 2;
          particles.push({
            x: player.x + player.w * 0.5,
            y: player.y + player.h,
            vx: Math.cos(angle) * 3.5,
            vy: Math.sin(angle) * 2 + 1.5,
            size: 3.5,
            color: ['#05FFA1', '#00E5FF', '#FF4081'][i % 3],
            life: 1
          });
        }

        floatingPopups.push({
          text: 'AIR BOOST!',
          x: player.x - 8,
          y: player.y - 12,
          vy: -1.2,
          color: '#00E5FF',
          scale: 1.1,
          opacity: 1
        });
      }
    };
    triggerJumpRef.current = jump;

    // ─── SIMULATION & RENDER LOOP ───
    let lastTime = performance.now();

    const loop = (currentTime) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      const currentSpeed = gameOver ? 0 : (feverTimeLeft > 0 ? baseSpeed * 1.3 : baseSpeed);
      scrollX += currentSpeed;

      // Scalper Bot Animation & Obstacle Spawning
      scalperBot.floatPhase += dt * 2.5;
      scalperBot.y = scalperBot.baseY + Math.sin(scalperBot.floatPhase) * 6;

      if (!gameOver) {
        scalperBot.dropTimer -= dt;
        if (scalperBot.dropTimer <= 0) {
          scalperBot.dropTimer = 4.5 + Math.random() * 2;
          scalperBot.dropAnim = 1;
          scalperBot.speechBubble = '! INCOMING !';

          // Spawn a fresh obstacle dropped by the bot
          const types = ['stanchion', 'subwoofer', 'filmreel', 'lasertripwire', 'turnstile'];
          const newType = types[Math.floor(Math.random() * types.length)];
          obstacles.push({
            x: scalperBot.x - 10,
            y: scalperBot.y + 15,
            targetY: groundY - (newType === 'turnstile' ? 34 : newType === 'stanchion' ? 32 : 28),
            w: 28,
            h: 30,
            type: newType,
            falling: true,
            vy: 2
          });
        }
      }

      if (scalperBot.dropAnim > 0) {
        scalperBot.dropAnim -= dt * 2;
      }

      // Combo Timer Countdown
      if (comboResetTimer > 0) {
        comboResetTimer -= dt;
        if (comboResetTimer <= 0) {
          comboStreak = 0;
          setComboCount(0);
        }
      }

      // Fever Mode Countdown
      if (feverTimeLeft > 0) {
        feverTimeLeft -= dt;
        if (feverTimeLeft <= 0) {
          setIsFeverMode(false);
        }
      }

      // Invulnerability Timer after hitting obstacle
      if (player.invulnerableTimer > 0) {
        player.invulnerableTimer -= dt;
        if (player.invulnerableTimer <= 0) {
          player.isDizzy = false;
        }
      }

      // 1. Draw Deep Midnight Festival Sky
      const skyGrad = ctx.createLinearGradient(0, 0, 0, groundY);
      skyGrad.addColorStop(0, '#0C081A');
      skyGrad.addColorStop(0.55, '#18102E');
      skyGrad.addColorStop(1, '#2B1748');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, cssWidth, cssHeight);

      // 2. Parallax Stars
      stars.forEach((star) => {
        star.x -= currentSpeed * 0.12 * star.speed;
        if (star.x < -10) star.x = cssWidth + 10;
        star.phase += 0.04;
        const alpha = 0.4 + Math.sin(star.phase) * 0.45;

        ctx.save();
        ctx.fillStyle = star.color;
        ctx.globalAlpha = Math.max(0.1, alpha);
        ctx.fillRect(star.x - star.size * 0.5, star.y - star.size * 0.5, star.size, star.size);
        ctx.restore();
      });

      // 3. Parallax City & Festival Venue Skyline
      ctx.save();
      const skyLineScroll = (scrollX * 0.22) % (cssWidth + 300);
      cityBuildings.forEach((b) => {
        const drawX = ((b.x - skyLineScroll) % (cssWidth + 400) + cssWidth + 400) % (cssWidth + 400) - 100;
        const bY = groundY - b.h;

        ctx.fillStyle = '#161026';
        ctx.strokeStyle = '#2E1F52';
        ctx.lineWidth = 2;

        if (b.type === 'dome') {
          ctx.beginPath();
          ctx.arc(drawX + b.w * 0.5, groundY, b.w * 0.5, Math.PI, 0);
          ctx.fill();
          ctx.stroke();
        } else if (b.type === 'tower') {
          ctx.fillRect(drawX, bY, b.w, b.h);
          ctx.strokeRect(drawX, bY, b.w, b.h);

          // Lit Windows Grid
          ctx.fillStyle = 'rgba(255, 225, 66, 0.32)';
          for (let wy = bY + 12; wy < groundY - 14; wy += 14) {
            for (let wx = drawX + 10; wx < drawX + b.w - 10; wx += 16) {
              if ((wx + wy) % 5 !== 0) ctx.fillRect(wx, wy, 8, 6);
            }
          }
        } else {
          ctx.fillRect(drawX, bY, b.w, b.h);
          ctx.strokeRect(drawX, bY, b.w, b.h);
          ctx.fillStyle = 'rgba(5, 255, 161, 0.85)';
          ctx.font = '900 9px monospace';
          ctx.fillText(b.name, drawX + 14, bY + 16);
        }
      });
      ctx.restore();

      // 4. Sweeping Concert Searchlights
      searchlightAngle1 += 0.016;
      searchlightAngle2 += 0.021;

      const drawSearchlight = (originX, angle, color) => {
        ctx.save();
        ctx.beginPath();
        const beamAngle = Math.sin(angle) * 0.42 - 0.15;
        const topWidth = 55;
        const beamLength = cssHeight * 1.35;
        const endX = originX + Math.sin(beamAngle) * beamLength;

        ctx.moveTo(originX - 10, groundY);
        ctx.lineTo(endX - topWidth, 0);
        ctx.lineTo(endX + topWidth, 0);
        ctx.lineTo(originX + 10, groundY);
        ctx.closePath();

        const grad = ctx.createLinearGradient(originX, groundY, endX, 0);
        grad.addColorStop(0, color);
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = grad;
        ctx.globalCompositeOperation = 'screen';
        ctx.fill();
        ctx.restore();
      };

      if (feverTimeLeft > 0) {
        drawSearchlight(cssWidth * 0.22, searchlightAngle1 * 1.8, 'rgba(255, 64, 129, 0.45)');
        drawSearchlight(cssWidth * 0.52, searchlightAngle2 * 1.8, 'rgba(0, 229, 255, 0.45)');
        drawSearchlight(cssWidth * 0.82, -searchlightAngle1 * 1.8, 'rgba(255, 225, 66, 0.45)');
      } else {
        drawSearchlight(cssWidth * 0.25, searchlightAngle1, 'rgba(0, 229, 255, 0.22)');
        drawSearchlight(cssWidth * 0.75, searchlightAngle2, 'rgba(255, 64, 129, 0.2)');
      }

      // 5. Crowd Silhouette with Glowsticks
      ctx.save();
      crowdMembers.forEach((m) => {
        m.phase += m.bounceSpeed;
        const crowdBob = Math.sin(m.phase) * 5;
        const cx = (m.x - scrollX * 0.55) % cssWidth;
        const actualX = cx < 0 ? cx + cssWidth : cx;

        ctx.fillStyle = '#120D1F';
        ctx.beginPath();
        ctx.arc(actualX, m.baseY + crowdBob - 14, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(actualX - 6, m.baseY + crowdBob - 9, 12, 14);

        ctx.strokeStyle = m.glowstickColor;
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(actualX + 4, m.baseY + crowdBob - 6);
        ctx.lineTo(actualX + 10, m.baseY + crowdBob - 22);
        ctx.stroke();
      });
      ctx.restore();

      // 6. Foreground Platform Stage Runway Deck
      ctx.save();
      ctx.fillStyle = feverTimeLeft > 0 ? '#FFE142' : '#05FFA1';
      ctx.shadowColor = feverTimeLeft > 0 ? '#FFE142' : '#05FFA1';
      ctx.shadowBlur = 8;
      ctx.fillRect(0, groundY - 2, cssWidth, 4);
      ctx.shadowBlur = 0;

      // Stage Deck Surface (Checkerboard Pattern)
      const tileSize = 22;
      const tileOffset = scrollX % tileSize;
      for (let tx = -tileSize; tx < cssWidth + tileSize; tx += tileSize) {
        const isAlt = Math.floor((tx + scrollX) / tileSize) % 2 === 0;
        ctx.fillStyle = isAlt ? '#1E1635' : '#140E24';
        ctx.fillRect(tx - tileOffset, groundY + 2, tileSize, 16);
      }

      // Stage Truss Foundation
      ctx.fillStyle = '#0F0B1A';
      ctx.fillRect(0, groundY + 18, cssWidth, groundHeight - 18);
      ctx.strokeStyle = '#271D42';
      ctx.lineWidth = 2;
      ctx.strokeRect(0, groundY + 18, cssWidth, groundHeight - 18);

      for (let gx = 16 - (scrollX % 36); gx < cssWidth + 36; gx += 36) {
        ctx.fillStyle = '#080510';
        ctx.beginPath();
        ctx.arc(gx, groundY + 29, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#36285C';
        ctx.stroke();

        ctx.fillStyle = '#FFE142';
        ctx.fillRect(gx - 10, groundY + 20, 2, 2);
        ctx.fillRect(gx + 8, groundY + 20, 2, 2);
      }
      ctx.restore();

      // 7. Update & Draw Collectible Golden Admission Tickets (UNEVEN HEIGHTS)
      tickets.forEach((t) => {
        if (!gameOver) {
          t.x -= currentSpeed;
          t.sparkleAngle += 0.05;
        }
        const bob = Math.sin(t.sparkleAngle) * 5;

        // Recirculate ticket with UNEVEN height & distance
        if (t.x < -40) {
          t.x = cssWidth + 30 + Math.random() * 140;
          // Assign uneven height tiers (low, mid, high)
          const heights = [groundY - 26, groundY - 58, groundY - 102, groundY - 116];
          t.y = heights[Math.floor(Math.random() * heights.length)];
          t.collected = false;
        }

        if (!t.collected) {
          // Magnet in Fever Mode
          if (feverTimeLeft > 0 && !gameOver) {
            const dx = (player.x + player.w * 0.5) - t.x;
            const dy = (player.y + player.h * 0.5) - (t.y + bob);
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 140) {
              t.x += (dx / dist) * 4.5;
              t.y += (dy / dist) * 4.5;
            }
          }

          const tx = t.x;
          const ty = t.y + bob;
          const tw = 26;
          const th = 16;

          // Hit Detection with Player
          if (
            !gameOver &&
            player.x + player.w > tx &&
            player.x < tx + tw &&
            player.y + player.h > ty &&
            player.y < ty + th
          ) {
            t.collected = true;
            comboStreak += 1;
            comboResetTimer = 2.8;
            setComboCount(comboStreak);

            const multiplier = Math.min(comboStreak, 5);
            const ptsGained = 100 * multiplier * (feverTimeLeft > 0 ? 2 : 1);
            currentScore += ptsGained;
            currentPasses += 1;
            setScore(currentScore);
            setPassesCollected(currentPasses);
            updateHighScore(currentScore, currentPasses);
            playArcadeTone('ticket');

            // Sparkle Burst
            for (let i = 0; i < 7; i++) {
              particles.push({
                x: tx + tw * 0.5,
                y: ty + th * 0.5,
                vx: (Math.random() - 0.5) * 5,
                vy: (Math.random() - 0.5) * 5 - 1.5,
                size: 3 + Math.random() * 2,
                color: ['#FFE142', '#FF4081', '#05FFA1'][i % 3],
                life: 1
              });
            }

            floatingPopups.push({
              text: `+${ptsGained}${multiplier > 1 ? ` (x${multiplier})` : ''}`,
              x: tx - 4,
              y: ty - 10,
              vy: -1.4,
              color: multiplier >= 3 ? '#FF4081' : '#FFE142',
              scale: 1 + multiplier * 0.1,
              opacity: 1
            });

            if (comboStreak === 5 && feverTimeLeft <= 0) {
              feverTimeLeft = 5.0;
              setIsFeverMode(true);
              floatingPopups.push({
                text: 'VIP FRENZY (2X PTS)',
                x: player.x - 14,
                y: player.y - 28,
                vy: -1.6,
                color: '#FF4081',
                scale: 1.25,
                opacity: 1
              });
            }
          } else {
            // Draw Bespoke Golden Ticket
            ctx.save();
            ctx.translate(tx, ty);

            // Shadow
            ctx.fillStyle = '#1E1B2E';
            ctx.beginPath();
            ctx.roundRect(2.5, 2.5, tw, th, 3);
            ctx.fill();

            // White Die-Cut Rim
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.roundRect(-1.5, -1.5, tw + 3, th + 3, 3.5);
            ctx.fill();

            // Golden Body
            const ticketGrad = ctx.createLinearGradient(0, 0, tw, th);
            ticketGrad.addColorStop(0, '#FFF176');
            ticketGrad.addColorStop(0.5, '#FFE142');
            ticketGrad.addColorStop(1, '#FFB300');
            ctx.fillStyle = ticketGrad;
            ctx.strokeStyle = '#1E1B2E';
            ctx.lineWidth = 1.8;
            ctx.beginPath();
            ctx.roundRect(0, 0, tw, th, 2.5);
            ctx.fill();
            ctx.stroke();

            // Perforation Line
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 1.4;
            ctx.setLineDash([2, 2]);
            ctx.beginPath();
            ctx.moveTo(8, 2);
            ctx.lineTo(8, th - 2);
            ctx.stroke();
            ctx.setLineDash([]);

            // Circular Notch Punches
            ctx.fillStyle = '#0C081A';
            ctx.beginPath();
            ctx.arc(0, th * 0.5, 2.5, -Math.PI * 0.5, Math.PI * 0.5);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(tw, th * 0.5, 2.5, Math.PI * 0.5, -Math.PI * 0.5);
            ctx.fill();

            // Center Star
            ctx.fillStyle = '#FF4081';
            ctx.beginPath();
            ctx.arc(17, th * 0.5, 2.5, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
          }
        }
      });

      // 8. Update & Draw `?` Mystery Blocks
      mysteryBlocks.forEach((b) => {
        if (!gameOver) {
          b.x -= currentSpeed;
          if (b.bumpOffset > 0) b.bumpOffset = Math.max(0, b.bumpOffset - 1.2);
          if (b.x < -50) {
            b.x = cssWidth + 60 + Math.random() * 100;
            b.hit = false;
            b.bumpOffset = 0;
          }
        }

        const bx = b.x;
        const by = b.y - b.bumpOffset;

        // Player Head Bump from Underneath
        if (
          !gameOver &&
          !b.hit &&
          player.vy < 0 &&
          player.x + player.w > bx + 4 &&
          player.x < bx + b.w - 4 &&
          player.y < by + b.h &&
          player.y > by + b.h - 16
        ) {
          b.hit = true;
          b.bumpOffset = 10;
          player.vy = 2;
          playArcadeTone('ticket');

          currentScore += 500;
          currentPasses += 5;
          setScore(currentScore);
          setPassesCollected(currentPasses);
          updateHighScore(currentScore, currentPasses);

          for (let i = 0; i < 12; i++) {
            particles.push({
              x: bx + b.w * 0.5,
              y: by,
              vx: (Math.random() - 0.5) * 6,
              vy: -Math.random() * 5 - 2,
              size: 4,
              color: ['#FFE142', '#FF4081', '#05FFA1', '#00E5FF'][i % 4],
              life: 1
            });
          }

          floatingPopups.push({
            text: '★ VIP GOLD PASS! +500 ★',
            x: bx - 24,
            y: by - 16,
            vy: -1.5,
            color: '#FFE142',
            scale: 1.25,
            opacity: 1
          });
        }

        // Draw 3D Mystery Box
        ctx.save();
        ctx.translate(bx, by);
        ctx.fillStyle = '#1E1B2E';
        ctx.fillRect(4, 4, b.w, b.h);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(-2, -2, b.w + 4, b.h + 4);

        if (b.hit) {
          ctx.fillStyle = '#785A3C';
          ctx.fillRect(0, 0, b.w, b.h);
          ctx.strokeStyle = '#1E1B2E';
          ctx.lineWidth = 3;
          ctx.strokeRect(0, 0, b.w, b.h);
        } else {
          ctx.fillStyle = '#FFE142';
          ctx.fillRect(0, 0, b.w, b.h);
          ctx.strokeStyle = '#1E1B2E';
          ctx.lineWidth = 3.2;
          ctx.strokeRect(0, 0, b.w, b.h);

          ctx.fillStyle = '#1E1B2E';
          ctx.font = '900 20px "Fredoka", sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('?', b.w * 0.5, b.h * 0.5);
        }
        ctx.restore();
      });

      // 9. Update & Draw Spring Booster Pads
      springPads.forEach((sp) => {
        if (!gameOver) {
          sp.x -= currentSpeed;
          if (sp.compress > 0) sp.compress = Math.max(0, sp.compress - 0.1);
          if (sp.x < -50) sp.x = cssWidth + 120 + Math.random() * 160;
        }

        if (
          !gameOver &&
          player.vy >= 0 &&
          player.x + player.w > sp.x &&
          player.x < sp.x + sp.w &&
          player.y + player.h >= sp.y &&
          player.y + player.h <= sp.y + 12
        ) {
          sp.compress = 6;
          player.vy = -14.5;
          player.grounded = false;
          player.jumpsRemaining = 1;
          setIsAirborne(true);
          setCanDoubleJump(true);
          setIsSpringBoosted(true);
          setTimeout(() => setIsSpringBoosted(false), 1200);
          playArcadeTone('spring');

          floatingPopups.push({
            text: 'SUPER SPRING JUMP!',
            x: sp.x - 14,
            y: sp.y - 20,
            vy: -1.6,
            color: '#05FFA1',
            scale: 1.2,
            opacity: 1
          });

          for (let i = 0; i < 8; i++) {
            particles.push({
              x: sp.x + sp.w * 0.5,
              y: sp.y,
              vx: (Math.random() - 0.5) * 5,
              vy: -Math.random() * 4,
              size: 3.5,
              color: '#05FFA1',
              life: 0.9
            });
          }
        }

        // Draw Springboard
        ctx.save();
        ctx.translate(sp.x, sp.y + sp.compress);
        ctx.fillStyle = '#1E1B2E';
        ctx.fillRect(0, 6, sp.w, 4);
        ctx.fillStyle = '#FFE142';
        ctx.strokeStyle = '#1E1B2E';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.roundRect(0, 0, sp.w, 6, 3);
        ctx.fill();
        ctx.stroke();

        ctx.strokeStyle = '#05FFA1';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(8, 6);
        ctx.lineTo(14, 2);
        ctx.lineTo(20, 6);
        ctx.lineTo(26, 2);
        ctx.stroke();
        ctx.restore();
      });

      // 10. Update & Draw the 5 Expanded Obstacles
      for (let oi = obstacles.length - 1; oi >= 0; oi--) {
        const obs = obstacles[oi];
        if (!gameOver) {
          obs.x -= currentSpeed;

          // Falling obstacle dropped by Scalper Bot
          if (obs.falling) {
            obs.y += obs.vy;
            obs.vy += 0.4;
            if (obs.y >= obs.targetY) {
              obs.y = obs.targetY;
              obs.falling = false;
            }
          }

          if (obs.type === 'subwoofer') {
            obs.pulse = Math.sin(scrollX * 0.12) * 2;
          } else if (obs.type === 'filmreel' || obs.type === 'turnstile') {
            obs.angle = (obs.angle || 0) + 0.04;
          } else if (obs.type === 'lasertripwire') {
            obs.beamPhase = (obs.beamPhase || 0) + 0.08;
          }

          if (obs.x < -60) {
            if (obstacles.length > 5) {
              obstacles.splice(oi, 1);
              continue;
            } else {
              obs.x = cssWidth + 60 + Math.random() * 140;
              obs.hurdled = false;
            }
          }
        }

        // Near-Miss Hurdle Bonus
        if (
          !gameOver &&
          !obs.hurdled &&
          player.x > obs.x + obs.w &&
          player.x < obs.x + obs.w + 24 &&
          player.y + player.h < obs.y
        ) {
          obs.hurdled = true;
          currentScore += 150;
          setScore(currentScore);
          updateHighScore(currentScore, currentPasses);
          floatingPopups.push({
            text: 'PERFECT CLEAR! +150',
            x: obs.x - 10,
            y: obs.y - 18,
            vy: -1.2,
            color: '#05FFA1',
            scale: 1.1,
            opacity: 1
          });
        }

        // Collision Check with Player (Hits Obstacle)
        if (
          !gameOver &&
          player.invulnerableTimer <= 0 &&
          player.x + player.w - 6 > obs.x + 4 &&
          player.x + 6 < obs.x + obs.w - 4 &&
          player.y + player.h > obs.y + 4 &&
          player.y < obs.y + obs.h
        ) {
          // Player hit!
          player.invulnerableTimer = 1.6;
          player.isDizzy = true;
          player.vy = -6; // stumble hop
          comboStreak = 0;
          setComboCount(0);
          playArcadeTone('hit');

          currentLives -= 1;
          setLives(currentLives);

          // Popups & particles
          floatingPopups.push({
            text: currentLives <= 0 ? 'GAME OVER!' : 'OUCH! -1 LIFE',
            x: player.x - 8,
            y: player.y - 20,
            vy: -1.6,
            color: '#FF4081',
            scale: 1.3,
            opacity: 1
          });

          for (let i = 0; i < 10; i++) {
            particles.push({
              x: player.x + player.w * 0.5,
              y: player.y + player.h * 0.5,
              vx: (Math.random() - 0.5) * 6,
              vy: -Math.random() * 4,
              size: 3.5,
              color: '#FF4081',
              life: 1
            });
          }

          if (currentLives <= 0) {
            gameOver = true;
            setIsGameOver(true);
            updateHighScore(currentScore, currentPasses);
          }
        }

        // Draw Specific Obstacle
        ctx.save();
        ctx.translate(obs.x, obs.y);

        if (obs.type === 'stanchion') {
          // 1. VIP Brass Stanchion with Velvet Rope
          ctx.fillStyle = '#1E1B2E';
          ctx.beginPath();
          ctx.ellipse(obs.w * 0.5 + 2, obs.h + 2, 10, 3, 0, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#FFE142';
          ctx.strokeStyle = '#1E1B2E';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.ellipse(obs.w * 0.5, obs.h - 2, 9, 3, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#FFB300';
          ctx.fillRect(obs.w * 0.5 - 2.5, 4, 5, obs.h - 6);
          ctx.strokeRect(obs.w * 0.5 - 2.5, 4, 5, obs.h - 6);

          ctx.fillStyle = '#FFE142';
          ctx.beginPath();
          ctx.arc(obs.w * 0.5, 4, 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          ctx.strokeStyle = '#FF4081';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(obs.w * 0.5, 6);
          ctx.quadraticCurveTo(obs.w * 0.5 - 14, 18, obs.w * 0.5 - 28, 10);
          ctx.stroke();
        } else if (obs.type === 'subwoofer') {
          // 2. Festival Subwoofer Monitor
          ctx.fillStyle = '#1E1B2E';
          ctx.fillRect(3, 3, obs.w, obs.h);
          ctx.fillStyle = '#261D3B';
          ctx.strokeStyle = '#1E1B2E';
          ctx.lineWidth = 2.8;
          ctx.fillRect(0, 0, obs.w, obs.h);
          ctx.strokeRect(0, 0, obs.w, obs.h);

          ctx.fillStyle = '#00E5FF';
          ctx.fillRect(0, 0, 4, 4);
          ctx.fillRect(obs.w - 4, 0, 4, 4);
          ctx.fillRect(0, obs.h - 4, 4, 4);
          ctx.fillRect(obs.w - 4, obs.h - 4, 4, 4);

          const coneRadius = 7 + (obs.pulse || 0) * 0.6;
          ctx.fillStyle = '#120D1D';
          ctx.beginPath();
          ctx.arc(obs.w * 0.5, obs.h * 0.5, coneRadius, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#FF4081';
          ctx.lineWidth = 2;
          ctx.stroke();
        } else if (obs.type === 'filmreel') {
          // 3. Cinema 35mm Golden Film Reel Canister
          ctx.fillStyle = '#1E1B2E';
          ctx.beginPath();
          ctx.ellipse(obs.w * 0.5 + 2, obs.h + 2, 12, 4, 0, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#FFE142';
          ctx.strokeStyle = '#1E1B2E';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(obs.w * 0.5, obs.h * 0.5, 12, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Film Reel Spoke Holes
          ctx.fillStyle = '#1E1B2E';
          for (let sp = 0; sp < 4; sp++) {
            const sang = (obs.angle || 0) + (sp * Math.PI) / 2;
            ctx.beginPath();
            ctx.arc(obs.w * 0.5 + Math.cos(sang) * 6, obs.h * 0.5 + Math.sin(sang) * 6, 2.5, 0, Math.PI * 2);
            ctx.fill();
          }

          // Trailing Film Ribbon
          ctx.strokeStyle = '#37474F';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(obs.w * 0.5 - 10, obs.h - 4);
          ctx.lineTo(obs.w * 0.5 - 24, obs.h - 2);
          ctx.stroke();
        } else if (obs.type === 'lasertripwire') {
          // 4. Neon Laser Tripwire Hazard
          ctx.fillStyle = '#1E1B2E';
          ctx.fillRect(0, 0, 6, obs.h);
          ctx.fillRect(obs.w - 6, 0, 6, obs.h);

          ctx.fillStyle = '#00E5FF';
          ctx.fillRect(0, 0, 6, obs.h);
          ctx.fillRect(obs.w - 6, 0, 6, obs.h);
          ctx.strokeStyle = '#1E1B2E';
          ctx.lineWidth = 2;
          ctx.strokeRect(0, 0, 6, obs.h);
          ctx.strokeRect(obs.w - 6, 0, 6, obs.h);

          // Crackling Laser Beam
          const beamGlow = 0.6 + Math.sin(obs.beamPhase || 0) * 0.4;
          ctx.strokeStyle = `rgba(255, 64, 129, ${beamGlow})`;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(6, obs.h * 0.5);
          ctx.lineTo(obs.w - 6, obs.h * 0.5);
          ctx.stroke();

          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 1.2;
          ctx.stroke();
        } else {
          // 5. Metro Ticket Turnstile Gate
          ctx.fillStyle = '#1E1B2E';
          ctx.fillRect(obs.w * 0.5 - 4, 6, 8, obs.h - 6);
          ctx.fillStyle = '#78909C';
          ctx.strokeStyle = '#1E1B2E';
          ctx.lineWidth = 2.4;
          ctx.fillRect(obs.w * 0.5 - 4, 6, 8, obs.h - 6);
          ctx.strokeRect(obs.w * 0.5 - 4, 6, 8, obs.h - 6);

          // Revolving Brass Tripod Arm
          const tang = obs.angle || 0;
          ctx.strokeStyle = '#FFE142';
          ctx.lineWidth = 3.5;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(obs.w * 0.5, 12);
          ctx.lineTo(obs.w * 0.5 + Math.cos(tang) * 14, 12 + Math.sin(tang) * 14);
          ctx.stroke();
        }

        ctx.restore();
      }

      // 11. DRAW THE ANTAGONIST "SCALPER BOT" WHO CREATES OBSTACLES
      ctx.save();
      const sbX = scalperBot.x;
      const sbY = scalperBot.y;

      // Drone Shadow on Ground
      ctx.fillStyle = 'rgba(30, 27, 46, 0.4)';
      ctx.beginPath();
      ctx.ellipse(sbX + 16, groundY - 2, 18, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Drone Jet Thrusters
      ctx.fillStyle = '#00E5FF';
      ctx.beginPath();
      ctx.arc(sbX + 6, sbY + 30, 3 + Math.random() * 2, 0, Math.PI * 2);
      ctx.arc(sbX + 26, sbY + 30, 3 + Math.random() * 2, 0, Math.PI * 2);
      ctx.fill();

      // Drone Chassis
      ctx.fillStyle = '#1E1B2E';
      ctx.fillRect(sbX + 2, sbY + 12, 28, 18);
      ctx.fillStyle = '#FF4081';
      ctx.strokeStyle = '#1E1B2E';
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.roundRect(sbX, sbY + 10, 32, 18, 6);
      ctx.fill();
      ctx.stroke();

      // Visor Eye (Glowing Neon Cyan with mischievous glint)
      ctx.fillStyle = '#120D1D';
      ctx.fillRect(sbX + 6, sbY + 14, 20, 8);
      ctx.fillStyle = '#00E5FF';
      ctx.fillRect(sbX + 8, sbY + 16, 7, 4);
      ctx.fillRect(sbX + 17, sbY + 16, 7, 4);

      // Spinning Drone Rotor Blades on Top
      const rotorW = Math.sin(scalperBot.floatPhase * 6) * 18;
      ctx.strokeStyle = '#FFE142';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(sbX + 16 - rotorW, sbY + 6);
      ctx.lineTo(sbX + 16 + rotorW, sbY + 6);
      ctx.stroke();

      // Dropping Robotic Claw
      if (scalperBot.dropAnim > 0) {
        ctx.strokeStyle = '#FFE142';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(sbX + 16, sbY + 28);
        ctx.lineTo(sbX + 16, sbY + 38);
        ctx.stroke();

        ctx.fillStyle = '#FFE142';
        ctx.beginPath();
        ctx.arc(sbX + 16, sbY + 38, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // Warning Speech Bubble ("! INCOMING !")
      if (scalperBot.speechBubble && scalperBot.dropAnim > 0) {
        ctx.fillStyle = '#FFE142';
        ctx.strokeStyle = '#1E1B2E';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.roundRect(sbX - 35, sbY - 14, 58, 14, 4);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#1E1B2E';
        ctx.font = '900 8px monospace';
        ctx.fillText('! DROP !', sbX - 26, sbY - 4);
      }
      ctx.restore();

      // 12. Physics & Kinematics for Player Mascot
      if (!gameOver) {
        player.vy += player.gravity;
        player.y += player.vy;

        if (player.y >= groundY - player.h) {
          player.y = groundY - player.h;
          player.vy = 0;
          if (!player.grounded) {
            player.grounded = true;
            player.jumpsRemaining = 2;
            setIsAirborne(false);
            setCanDoubleJump(false);
          }
        }

        player.runFrame = (player.runFrame + 0.28) % 6;
        player.eyeBlinkTimer += dt;
        if (player.eyeBlinkTimer > 3.5) player.eyeBlinkTimer = 0;
      }

      // 13. DRAW THE REDESIGNED CHARISMATIC "TICKET RUNNER" MASCOT
      ctx.save();
      const px = player.x;
      const py = player.y;

      // Invulnerability flashing when hit
      if (player.invulnerableTimer > 0 && Math.floor(player.invulnerableTimer * 10) % 2 === 0) {
        ctx.globalAlpha = 0.45;
      }

      // Ground Shadow
      const heightAboveGround = (groundY - player.h) - py;
      const shadowScale = Math.max(0.3, 1 - heightAboveGround / 140);
      ctx.fillStyle = 'rgba(30, 27, 46, 0.45)';
      ctx.beginPath();
      ctx.ellipse(
        px + player.w * 0.5 + 3,
        groundY - 1,
        (player.w * 0.5) * shadowScale,
        4 * shadowScale,
        0, 0, Math.PI * 2
      );
      ctx.fill();

      // Stumble Dizzy Stars
      if (player.isDizzy) {
        const starTime = performance.now() * 0.005;
        for (let st = 0; st < 3; st++) {
          const sang = starTime + (st * Math.PI * 2) / 3;
          ctx.fillStyle = '#FFE142';
          ctx.fillRect(px + 14 + Math.cos(sang) * 12, py - 4 + Math.sin(sang) * 4, 3, 3);
        }
      }

      // 13. DRAW THE HIGH-DEFINITION "TICKET RUNNER" HERO (ANIMATED WITH ARMS, SNEAKERS & CAP)
      const legPhase = player.runFrame;
      const isAir = !player.grounded;

      let backArmAngle = -Math.sin(legPhase) * 0.85;
      let frontArmAngle = Math.sin(legPhase) * 0.85;

      // ── LEGS KINEMATICS (HIP -> KNEE -> ANKLE) ──
      const hipFrontX = px + 22;
      const hipBackX = px + 15;
      const hipY = py + 38;

      let backKneeX, backKneeY, backAnkleX, backAnkleY, backFootAngle;
      let frontKneeX, frontKneeY, frontAnkleX, frontAnkleY, frontFootAngle;

      if (isAir) {
        // Dynamic Athletic Jump Pose (Tucked Knees)
        backArmAngle = -0.9;
        frontArmAngle = 0.85;

        // Front Leg: Bent forward, knee lifted high toward chest
        frontKneeX = hipFrontX + 8;
        frontKneeY = hipY + 3;
        frontAnkleX = hipFrontX + 4;
        frontAnkleY = hipY + 11;
        frontFootAngle = 0.25;

        // Back Leg: Tucked rearward, heel kicking up
        backKneeX = hipBackX - 6;
        backKneeY = hipY + 5;
        backAnkleX = hipBackX - 8;
        backAnkleY = hipY + 12;
        backFootAngle = -0.32;
      } else {
        // Fluid 6-Phase Running Stride with Knee Flexion
        const sinF = Math.sin(legPhase);
        const cosF = Math.cos(legPhase);

        // Front Leg: Drives forward on heel strike, folds on push
        frontKneeX = hipFrontX + sinF * 7;
        frontKneeY = hipY + 6 - Math.max(0, cosF) * 4.5;
        frontAnkleX = hipFrontX + sinF * 11;
        frontAnkleY = py + player.h - 4;
        frontFootAngle = sinF * 0.35;

        // Back Leg: Opposite phase kick
        backKneeX = hipBackX - sinF * 7;
        backKneeY = hipY + 6 - Math.max(0, -cosF) * 4.5;
        backAnkleX = hipBackX - sinF * 11;
        backAnkleY = py + player.h - 4;
        backFootAngle = -sinF * 0.35;
      }

      // ── HELPER: Sculpted Chunky High-Top Streetwear Sneaker ──
      const drawSculptedSneaker = (footX, footY, angle, isFront) => {
        ctx.save();
        ctx.translate(footX, footY);
        ctx.rotate(angle);

        // 3D Offset Shadow
        ctx.fillStyle = '#1E1B2E';
        ctx.beginPath();
        ctx.ellipse(8, 7, 10, 3.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // White Die-Cut Sticker Outline
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.roundRect(-2, -3.5, 20, 14, 4.5);
        ctx.fill();

        // Sneaker Upper Canvas (Sun Yellow with 2.2px Black Border)
        ctx.fillStyle = isFront ? '#FFE142' : '#F59E0B';
        ctx.strokeStyle = '#1E1B2E';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(0, 0); // ankle collar
        ctx.lineTo(5, -2); // tongue
        ctx.lineTo(9, 1); // throat
        ctx.quadraticCurveTo(16, 2, 16, 6); // curved toe
        ctx.lineTo(0, 6);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Bubble-Pink Heel Counter Overlay
        ctx.fillStyle = '#FF4081';
        ctx.strokeStyle = '#1E1B2E';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(4, 0.5);
        ctx.lineTo(3, 6);
        ctx.lineTo(0, 6);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Black Rubber Toe Bumper Cap
        ctx.fillStyle = '#1E1B2E';
        ctx.beginPath();
        ctx.arc(13.5, 4.5, 2.8, -Math.PI * 0.4, Math.PI * 0.5);
        ctx.fill();

        // Chunky White Rubber Midsole with Tread
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#1E1B2E';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(-1, 5, 18, 4, 2);
        ctx.fill();
        ctx.stroke();

        // Cyan Air-Cushion Bubble Window in Heel
        ctx.fillStyle = '#00E5FF';
        ctx.fillRect(1, 6, 4.5, 2);

        // Side Star Patch
        ctx.fillStyle = '#FF4081';
        ctx.beginPath();
        ctx.arc(7.5, 3, 1.6, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      };

      // ── HELPER: Contoured Cartoon Leg with Knee Joint, Cuff & Sock ──
      const drawContouredLeg = (hX, hY, kX, kY, aX, aY, footAngle, isFront) => {
        ctx.save();
        const pantsFill = isFront ? '#22193E' : '#16102A';
        const stripeColor = isFront ? '#00E5FF' : '#0097A7';

        // 1. Thigh Volume (Upper Leg with Outline)
        ctx.strokeStyle = '#1E1B2E';
        ctx.lineWidth = 11;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(hX, hY);
        ctx.lineTo(kX, kY);
        ctx.stroke();

        ctx.strokeStyle = pantsFill;
        ctx.lineWidth = 7.5;
        ctx.beginPath();
        ctx.moveTo(hX, hY);
        ctx.lineTo(kX, kY);
        ctx.stroke();

        // 2. Calf Volume (Lower Leg with Outline)
        ctx.strokeStyle = '#1E1B2E';
        ctx.lineWidth = 9.5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(kX, kY);
        ctx.lineTo(aX, aY);
        ctx.stroke();

        ctx.strokeStyle = pantsFill;
        ctx.lineWidth = 6.2;
        ctx.beginPath();
        ctx.moveTo(kX, kY);
        ctx.lineTo(aX, aY);
        ctx.stroke();

        // 3. Neon Cyan Racing Stripe along outer seam
        ctx.strokeStyle = stripeColor;
        ctx.lineWidth = 1.8;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(hX + 2, hY);
        ctx.lineTo(kX + 2, kY);
        ctx.lineTo(aX + 1.5, aY);
        ctx.stroke();

        // 4. Elastic Ribbed Ankle Cuff (Sun Yellow)
        ctx.fillStyle = '#FFE142';
        ctx.strokeStyle = '#1E1B2E';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(aX, aY - 1, 5, 2.2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // 5. White Retro Crew Sock with Dual Athletic Stripes
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#1E1B2E';
        ctx.lineWidth = 1.4;
        ctx.fillRect(aX - 3.5, aY, 7, 4);
        ctx.strokeRect(aX - 3.5, aY, 7, 4);
        // Pink & Yellow Stripes on Sock
        ctx.fillStyle = '#FF4081';
        ctx.fillRect(aX - 3, aY + 1, 6, 1);
        ctx.fillStyle = '#FFE142';
        ctx.fillRect(aX - 3, aY + 2.3, 6, 1);

        // 6. Draw the Sculpted Sneaker at the ankle
        drawSculptedSneaker(aX - 2, aY + 3, footAngle, isFront);

        ctx.restore();
      };

      // ── LAYER 1: BACK ARM & HAND ──
      ctx.save();
      const backShoulderX = px + 12;
      const backShoulderY = py + 26;
      ctx.translate(backShoulderX, backShoulderY);
      ctx.rotate(backArmAngle);

      // Back Sleeve (Mint Pop)
      ctx.fillStyle = '#05FFA1';
      ctx.strokeStyle = '#1E1B2E';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.roundRect(-4, 0, 8, 14, 3);
      ctx.fill();
      ctx.stroke();

      // Wristband & Hand
      ctx.fillStyle = '#FFE142';
      ctx.fillRect(-3, 11, 6, 2.5);
      ctx.fillStyle = '#FFD8B5';
      ctx.beginPath();
      ctx.arc(0, 16, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // ── LAYER 2: BACK CONTOURED LEG & SNEAKER ──
      drawContouredLeg(hipBackX, hipY, backKneeX, backKneeY, backAnkleX, backAnkleY, backFootAngle, false);

      // ── LAYER 3: TORSO & FESTIVAL VARSITY BOMBER JACKET ──
      ctx.save();
      // 3D Shadow
      ctx.fillStyle = '#1E1B2E';
      ctx.beginPath();
      ctx.roundRect(px + 8, py + 22, 24, 20, 5);
      ctx.fill();

      // White Die-Cut Sticker Outline
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.roundRect(px + 5, py + 19, 26, 22, 6);
      ctx.fill();

      // Jacket Main Body (Bubble Pink to Magenta Gradient)
      const jacketGrad = ctx.createLinearGradient(px, py + 20, px, py + 40);
      jacketGrad.addColorStop(0, '#FF4081');
      jacketGrad.addColorStop(1, '#D81B60');
      ctx.fillStyle = jacketGrad;
      ctx.strokeStyle = '#1E1B2E';
      ctx.lineWidth = 2.8;
      ctx.beginPath();
      ctx.roundRect(px + 6, py + 20, 24, 20, 5);
      ctx.fill();
      ctx.stroke();

      // Striped Waist Ribbing Hem
      ctx.fillStyle = '#FFE142';
      ctx.fillRect(px + 7, py + 37, 22, 3);
      ctx.fillStyle = '#1E1B2E';
      ctx.fillRect(px + 12, py + 37, 3, 3);
      ctx.fillRect(px + 18, py + 37, 3, 3);

      // Cyan Ribbed Collar
      ctx.fillStyle = '#00E5FF';
      ctx.fillRect(px + 12, py + 20, 12, 3.5);

      // Mint Zipper Strip & Golden Star Pull
      ctx.strokeStyle = '#05FFA1';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(px + 18, py + 23);
      ctx.lineTo(px + 18, py + 36);
      ctx.stroke();

      ctx.fillStyle = '#FFE142';
      ctx.fillRect(px + 16.5, py + 24, 3, 3);

      // EventHub "EH" Star Badge on Chest
      ctx.fillStyle = '#FFE142';
      ctx.beginPath();
      ctx.arc(px + 23, py + 26, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#1E1B2E';
      ctx.font = '900 4.5px sans-serif';
      ctx.fillText('EH', px + 21, py + 27.5);

      // Swinging VIP Pass Lanyard
      const lanyardTilt = player.vy * 0.08 - (player.grounded ? Math.sin(legPhase) * 0.15 : 0.25);
      ctx.save();
      ctx.translate(px + 18, py + 24);
      ctx.rotate(lanyardTilt);
      // Gold Cord
      ctx.strokeStyle = '#FFE142';
      ctx.lineWidth = 1.4;
      ctx.strokeRect(-2.5, 0, 5, 4);
      // Holographic VIP Card
      ctx.fillStyle = '#05FFA1';
      ctx.strokeStyle = '#1E1B2E';
      ctx.lineWidth = 1.2;
      ctx.fillRect(-4, 4, 8, 11);
      ctx.strokeRect(-4, 4, 8, 11);
      ctx.fillStyle = '#FF4081';
      ctx.fillRect(-3, 5, 6, 2.5);
      ctx.restore();
      ctx.restore();

      // ── LAYER 4: FRONT CONTOURED LEG & SNEAKER ──
      drawContouredLeg(hipFrontX, hipY, frontKneeX, frontKneeY, frontAnkleX, frontAnkleY, frontFootAngle, true);

      // ── LAYER 5: FRONT ARM & HAND (SWINGING/POINTING) ──
      ctx.save();
      const frontShoulderX = px + 22;
      const frontShoulderY = py + 26;
      ctx.translate(frontShoulderX, frontShoulderY);
      ctx.rotate(frontArmAngle);

      // Front Sleeve (Mint Pop)
      ctx.fillStyle = '#05FFA1';
      ctx.strokeStyle = '#1E1B2E';
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.roundRect(-4, 0, 9, 15, 3.5);
      ctx.fill();
      ctx.stroke();

      // Yellow Festival Wristband
      ctx.fillStyle = '#FFE142';
      ctx.fillRect(-3.5, 11.5, 8, 3);
      ctx.strokeStyle = '#1E1B2E';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(-3.5, 11.5, 8, 3);

      // Cartoon Fist / Pointing Hand
      ctx.fillStyle = '#FFD8B5';
      ctx.strokeStyle = '#1E1B2E';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0.5, 17, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // ── LAYER 6: EXPRESSIVE HEAD, SPIKY HAIR & BACKWARDS CAP ──
      ctx.save();
      const headX = px + 18;
      const headY = py + 12;

      // Spiky Anime Hair Tufts Behind Neck
      ctx.fillStyle = '#1A237E';
      ctx.strokeStyle = '#1E1B2E';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(headX - 10, headY + 4);
      ctx.lineTo(headX - 16, headY + 8);
      ctx.lineTo(headX - 8, headY + 9);
      ctx.fill();
      ctx.stroke();

      // Peach Cartoon Head Base
      ctx.fillStyle = '#FFD8B5';
      ctx.strokeStyle = '#1E1B2E';
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.arc(headX, headY, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Stylized Large Anime Eyes
      const eyeX = headX + 4;
      const eyeY = headY - 1;
      const isBlinking = player.eyeBlinkTimer > 3.35;

      if (isBlinking) {
        // Blinking Curved Eye Stroke
        ctx.strokeStyle = '#1E1B2E';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(eyeX, eyeY + 1, 3.8, 0, Math.PI);
        ctx.stroke();
      } else {
        // Large Eye Socket
        ctx.fillStyle = '#1E1B2E';
        ctx.beginPath();
        ctx.ellipse(eyeX, eyeY, 4.2, 5.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Gradient Cyan/Mint Iris
        const irisGrad = ctx.createLinearGradient(eyeX, eyeY - 4, eyeX, eyeY + 4);
        irisGrad.addColorStop(0, '#00E5FF');
        irisGrad.addColorStop(1, '#05FFA1');
        ctx.fillStyle = irisGrad;
        ctx.beginPath();
        ctx.arc(eyeX, eyeY + 0.8, 2.8, 0, Math.PI * 2);
        ctx.fill();

        // Inner Black Pupil
        ctx.fillStyle = '#120D1D';
        ctx.beginPath();
        ctx.arc(eyeX, eyeY + 1, 1.6, 0, Math.PI * 2);
        ctx.fill();

        // Dual White Specular Gleams
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(eyeX + 1.2, eyeY - 1.5, 1.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(eyeX - 1, eyeY + 1.8, 0.9, 0, Math.PI * 2);
        ctx.fill();

        // Expressive Top Eyebrow
        ctx.strokeStyle = '#1E1B2E';
        ctx.lineWidth = 2;
        ctx.beginPath();
        if (isAir) {
          ctx.arc(eyeX, eyeY - 6, 4, Math.PI * 1.1, Math.PI * 1.9); // Raised happy brow
        } else {
          ctx.moveTo(eyeX - 3, eyeY - 5);
          ctx.lineTo(eyeX + 3.5, eyeY - 6.5); // Confident focused brow
        }
        ctx.stroke();
      }

      // Rosy Anime Cheek Blush Stickers
      ctx.fillStyle = '#FF4081';
      ctx.beginPath();
      ctx.ellipse(headX + 2, headY + 5.5, 3.2, 2, 0, 0, Math.PI * 2);
      ctx.fill();

      // Dynamic Mouth (Shouting smile in air, determined grin on ground)
      if (isAir) {
        ctx.fillStyle = '#FF4081';
        ctx.strokeStyle = '#1E1B2E';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(headX + 5, headY + 5, 3.2, 0, Math.PI);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(headX + 3, headY + 5, 4, 1.2); // white teeth
      } else {
        ctx.strokeStyle = '#1E1B2E';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(headX + 3, headY + 6);
        ctx.quadraticCurveTo(headX + 6, headY + 8, headX + 8, headY + 5.5);
        ctx.stroke();
      }

      // Spiky Front Hair Tuft
      ctx.fillStyle = '#1A237E';
      ctx.strokeStyle = '#1E1B2E';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(headX - 4, headY - 8);
      ctx.lineTo(headX - 2, headY - 3);
      ctx.lineTo(headX + 2, headY - 8);
      ctx.fill();
      ctx.stroke();

      // Backwards Festival Snapback Cap (Bubble Pink Crown)
      ctx.fillStyle = '#FF4081';
      ctx.strokeStyle = '#1E1B2E';
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.arc(headX, headY - 3, 12.5, Math.PI * 0.9, Math.PI * 2.1);
      ctx.fill();
      ctx.stroke();

      // Golden Stitched Ticket Emblem on Front of Cap
      ctx.fillStyle = '#FFE142';
      ctx.strokeStyle = '#1E1B2E';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.roundRect(headX - 1, headY - 11, 6, 4, 1);
      ctx.fill();
      ctx.stroke();

      // Yellow Visor Turned Backwards
      ctx.fillStyle = '#FFE142';
      ctx.strokeStyle = '#1E1B2E';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.roundRect(headX - 18, headY - 5.5, 10, 4.5, 2);
      ctx.fill();
      ctx.stroke();

      // Cyan Top Button on Cap
      ctx.fillStyle = '#00E5FF';
      ctx.beginPath();
      ctx.arc(headX, headY - 14.5, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      ctx.restore();

      // 14. Update & Draw Particle Systems
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.028;

        if (p.life <= 0) {
          particles.splice(i, 1);
        } else {
          ctx.save();
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.life;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      // 15. Update & Draw Floating Popups (ZERO EMOJIS)
      for (let i = floatingPopups.length - 1; i >= 0; i--) {
        const pop = floatingPopups[i];
        pop.y += pop.vy;
        pop.opacity -= 0.022;

        if (pop.opacity <= 0) {
          floatingPopups.splice(i, 1);
        } else {
          ctx.save();
          ctx.globalAlpha = pop.opacity;
          ctx.font = `900 ${Math.round(13 * pop.scale)}px "Fredoka", sans-serif`;
          ctx.fillStyle = '#1E1B2E';
          ctx.fillText(pop.text, pop.x + 1.5, pop.y + 1.5);
          ctx.fillStyle = pop.color;
          ctx.fillText(pop.text, pop.x, pop.y);
          ctx.restore();
        }
      }

      // 16. Game Over Overlay (with Instant Replay Prompt)
      if (gameOver) {
        ctx.save();
        ctx.fillStyle = 'rgba(12, 8, 26, 0.82)';
        ctx.fillRect(0, 0, cssWidth, cssHeight);

        ctx.fillStyle = '#FFE142';
        ctx.font = '900 24px "Fredoka", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('RUN COMPLETE!', cssWidth * 0.5, cssHeight * 0.42);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = '700 13px "Fredoka", sans-serif';
        ctx.fillText(
          `FINAL SCORE: ${currentScore.toLocaleString()}  |  PASSES: ${currentPasses}`,
          cssWidth * 0.5,
          cssHeight * 0.55
        );

        ctx.fillStyle = '#05FFA1';
        ctx.font = '900 12px "Fredoka", sans-serif';
        ctx.fillText('CLICK ANYWHERE OR PRESS SPACE TO PLAY AGAIN ↺', cssWidth * 0.5, cssHeight * 0.7);
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    // Keyboard Space & Arrow Up Jump Bindings
    const handleKeyDown = (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        const active = document.activeElement;
        const isInput = active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA');
        if (!isInput) {
          e.preventDefault();
          if (gameOver) {
            restartGame();
          } else {
            jump();
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      cancelAnimationFrame(animationFrameId);
    };
  }, [playArcadeTone, updateHighScore]);

  const handleBoxClick = () => {
    if (isGameOver) {
      if (restartGameRef.current) restartGameRef.current();
    } else if (triggerJumpRef.current) {
      triggerJumpRef.current();
    }
  };

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-8 py-6 sm:py-8 select-none">
      <div 
        ref={containerRef}
        onClick={handleBoxClick}
        className="w-full h-52 sm:h-60 md:h-64 rounded-blob border-[3.5px] border-toy-black shadow-toy-lg relative overflow-hidden cursor-pointer group bg-[#0C081A] transition-transform duration-200 active:scale-[0.995]"
        title="EventHub World 1-1 Arcade: Click anywhere or press Spacebar to jump! Tap again in air to Double-Jump!"
      >
        {/* 60FPS Game Canvas */}
        <canvas 
          ref={canvasRef} 
          className="w-full h-full block" 
        />

        {/* ─── RETRO ARCADE HUD OVERLAY (RESPONSIVE FLEX BAR) ─── */}
        <div className="absolute top-2 sm:top-3.5 inset-x-2 sm:inset-x-5 flex items-center justify-between gap-1 z-10 pointer-events-none">
          {/* Left HUD: Current Passes & Lives */}
          <div className="flex items-center gap-1 sm:gap-1.5 min-w-0 pointer-events-auto">
            <div className="inline-flex items-center gap-1 px-1.5 xs:px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-sun-yellow border-2 border-toy-black shadow-[1.5px_1.5px_0px_#1E1B2E] shrink-0">
              <Ticket className="w-2.5 xs:w-3 sm:w-3.5 h-2.5 xs:h-3 sm:h-3.5 text-toy-black" />
              <span className="font-display font-black text-[9px] xs:text-[10px] sm:text-xs text-toy-black uppercase tracking-wider">
                <span className="hidden xs:inline">PASSES: </span>{passesCollected}
              </span>
            </div>

            {/* Highest Passes Ever Badge */}
            <div className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-lilac-wash text-toy-black border-2 border-toy-black shadow-[2px_2px_0px_#1E1B2E]">
              <Trophy className="w-3 h-3 text-toy-black" />
              <span className="font-display font-black text-[11px] uppercase tracking-wider">
                BEST: {highPasses}
              </span>
            </div>

            {/* Lives Counter (3 Hearts) */}
            <div className="inline-flex items-center gap-0.5 px-1.5 xs:px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-white border-2 border-toy-black shadow-[1.5px_1.5px_0px_#1E1B2E] shrink-0">
              {[1, 2, 3].map((heartIndex) => (
                <Heart 
                  key={heartIndex} 
                  className={`w-2.5 xs:w-3 sm:w-3.5 h-2.5 xs:h-3 sm:h-3.5 transition-colors ${
                    heartIndex <= lives 
                      ? 'text-bubble-pink fill-bubble-pink' 
                      : 'text-toy-black/30'
                  }`} 
                />
              ))}
            </div>

            {/* Combo Multiplier Badge */}
            {comboCount >= 2 && !isGameOver && (
              <div className="hidden xs:inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-bubble-pink text-white border-2 border-toy-black shadow-[1.5px_1.5px_0px_#1E1B2E] animate-bounce shrink-0">
                <Flame className="w-2.5 sm:w-3.5 h-2.5 sm:h-3.5 text-sun-yellow fill-sun-yellow" />
                <span className="font-display font-black text-[9px] sm:text-[11px] uppercase tracking-wider">
                  x{comboCount}!
                </span>
              </div>
            )}

            {isFeverMode && !isGameOver && (
              <div className="hidden md:inline-flex items-center gap-1 px-3 py-1 rounded-full bg-mint-pop text-toy-black border-2 border-toy-black shadow-[2px_2px_0px_#1E1B2E] animate-pulse">
                <Sparkles className="w-3.5 h-3.5 text-toy-black" />
                <span className="font-display font-black text-[11px] uppercase tracking-wider">
                  VIP FRENZY (2X PTS)
                </span>
              </div>
            )}
          </div>

          {/* Right HUD: Current Score & Audio Toggle */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0 pointer-events-auto">
            {/* Current Run Score */}
            <div className="inline-flex items-center gap-1 px-1.5 xs:px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-white border-2 border-toy-black shadow-[1.5px_1.5px_0px_#1E1B2E] pointer-events-none">
              <Sparkles className="w-2.5 xs:w-3 sm:w-3.5 h-2.5 xs:h-3 sm:h-3.5 text-bubble-pink" />
              <span className="font-display font-black text-[9px] xs:text-[10px] sm:text-xs text-toy-black uppercase tracking-wider">
                <span className="hidden xs:inline">SCORE: </span>{score.toLocaleString()}
              </span>
            </div>

            {/* All-Time Highest Score Badge */}
            <div className="hidden sm:inline-flex items-center gap-1 px-3 py-1 rounded-full bg-sun-yellow border-2 border-toy-black shadow-[2px_2px_0px_#1E1B2E] pointer-events-none">
              <Trophy className="w-3.5 h-3.5 text-toy-black" />
              <span className="font-display font-black text-xs text-toy-black uppercase tracking-wider">
                HI-SCORE: {highScore.toLocaleString()}
              </span>
            </div>

            {/* Sound Toggle Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setMuted(!muted);
              }}
              className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 rounded-full bg-lilac-wash border-2 border-toy-black shadow-[1.5px_1.5px_0px_#1E1B2E] flex items-center justify-center hover:bg-sun-yellow transition-colors cursor-pointer shrink-0"
              title={muted ? 'Unmute 8-bit sound fx' : 'Mute sound fx'}
            >
              {muted ? <VolumeX size={11} className="text-toy-black" /> : <Volume2 size={11} className="text-toy-black" />}
            </button>
          </div>
        </div>

        {/* Bottom-Right: Interactive Jump & Airborne Status (Using Bespoke Vector Stickers) */}
        <div className="absolute bottom-2 sm:bottom-3 right-3 sm:right-6 pointer-events-none">
          {isGameOver ? (
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full font-display font-black text-[11px] sm:text-xs uppercase tracking-wider border-2 border-toy-black shadow-[2px_2px_0px_#1E1B2E] bg-sun-yellow text-toy-black animate-pulse">
              <RotateCcw size={14} />
              <span>PLAY AGAIN ↺</span>
            </div>
          ) : (
            <div className={`inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full font-display font-black text-[10px] sm:text-xs uppercase tracking-wider border-2 border-toy-black shadow-[2px_2px_0px_#1E1B2E] transition-all text-toy-black ${
              isSpringBoosted
                ? 'bg-sun-yellow scale-105 animate-bounce'
                : isAirborne 
                  ? (canDoubleJump ? 'bg-sun-yellow scale-105 animate-pulse' : 'bg-sky-azure scale-105') 
                  : 'bg-mint-pop group-hover:scale-105 group-hover:bg-[#05FFA1]'
            }`}>
              {isSpringBoosted ? (
                <>
                  <SpringJumpSticker size={16} />
                  <span>SUPER SPRING JUMP!</span>
                </>
              ) : isAirborne ? (
                <>
                  <AirborneBoosterSticker size={16} />
                  <span>{canDoubleJump ? 'TAP TO DOUBLE JUMP' : 'MAX HEIGHT!'}</span>
                </>
              ) : (
                <>
                  <ArcadeJoystickSticker size={16} />
                  <span className="hidden sm:inline">CLICK OR SPACE TO JUMP!</span>
                  <span className="sm:hidden">TAP TO JUMP!</span>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}