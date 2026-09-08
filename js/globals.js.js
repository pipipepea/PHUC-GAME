// URL Google Apps Script chính thức
const GOOGLE_SHEET_URL = "https://script.google.com/macros/s/AKfycbxZrYN0690PqOrQddeOEsjoR9xvT-RAm__pKJ_sznSlKWKyoeyR9-yrnx4ivAxgS6BDSw/exec";

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const basePlatformW = 95;
let PLATFORM_W = window.innerWidth >= 768 ? basePlatformW * 1.68 : basePlatformW * 0.6;

let lobbyAnimId;
let isLobby = true;
let lobbyPlayer = { x: canvas.width / 2 - 40, y: canvas.height * 0.22, baseY: canvas.height * 0.22, w: 30, h: 30, angle: 0, vy: -7, jumpPower: 7, gravity: 0.2, dir: 1 };
let lobbyFriend = { w: 30, h: 30, angle: 0 };

let myName = localStorage.getItem('neonJumperName') || '';
let myHighScore = parseInt(localStorage.getItem('neonJumperHighScore')) || 0;
const generateId = () => Math.random().toString(36).substring(2, 8).toUpperCase();
let myPeerId = generateId();
let peer, conn = null, opponentData = null;
let oppRender = { x: -100, y: -100, squash: 1, angle: 0, isDead: false, vy: 0, h: 30, colorStage: 0, berserkTimer: 0, trail: [] };

let audioContext, analyser, microphone, dataArray, micPermissionGranted = false;

const gravity = 0.3;
const baseJump = 11;
const PLATFORM_H = 12;
const MIN_JUMP = 7.5;
let player, platforms, score, isGameOver, gameLoopId, useGyro = false, gyroGamma = 0, cameraOffset = 0;
let slowTime = 0, particles = [], trailPoints = [], micTimeRemaining = 0;

// Variables cho Delta Time và Networking
let lastFrameTime = performance.now();
let accumulator = 0;
let networkTimer = 0;
const FIXED_DT = 1000 / 60;
const MAX_PARTICLES = 180;
let isSoloMode = false;