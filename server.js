// ═══════════════════════════════════════════════════════════
// ORKUÞJÓFURINN - Energy Thief Hunter Server
// ═══════════════════════════════════════════════════════════
// 
// UPPSETNING:
// 1. Settu upp Node.js (https://nodejs.org) ef þú hefur ekki
// 2. Settu þessa skrá (server.js) í möppu á tölvunni
// 3. Opnaðu terminal/skipanalínu og farðu í möppuna
// 4. Keyrðu: node server.js
// 5. Opnaðu vafra á: http://localhost:3000
//
// AÐRIR Á NETINU:
// Nemendur opna http://<IP-tala-tölvunnar>:3000 í vafra
// Til að finna IP: ipconfig (Windows) eða ifconfig (Mac/Linux)
//
// ═══════════════════════════════════════════════════════════

const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, "game-data.json");

// Initialize data file if not exists
function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
    }
  } catch (e) {
    console.error("Villa við að lesa gögn:", e.message);
  }
  return { teams: [], findings: {} };
}

function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
}

// Ensure data file exists
if (!fs.existsSync(DATA_FILE)) {
  saveData({ teams: [], findings: {} });
  console.log("✅ game-data.json búin til");
}

// ─── HTML / Frontend ────────────────────────────────────────

const HTML_PAGE = `<!DOCTYPE html>
<html lang="is">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<title>⚡ Orkuþjófurinn - Energy Thief Hunter</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Segoe UI', 'Helvetica Neue', system-ui, -apple-system, sans-serif;
    background: linear-gradient(145deg, #0b0f1a 0%, #0f172a 40%, #0c1425 100%);
    color: #e2e8f0;
    min-height: 100vh;
    -webkit-font-smoothing: antialiased;
  }
  
  .app { max-width: 700px; margin: 0 auto; padding: 20px 16px 80px; }
  
  /* ── HERO ── */
  .hero { text-align: center; margin-bottom: 36px; }
  .hero-icon { font-size: 64px; filter: drop-shadow(0 0 20px rgba(250,204,21,0.4)); }
  .hero-title {
    font-size: clamp(32px, 7vw, 52px); font-weight: 900; line-height: 1.1;
    background: linear-gradient(135deg, #facc15, #f59e0b, #ef4444);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    letter-spacing: -0.02em; margin: 8px 0 4px;
  }
  .hero-sub {
    font-size: clamp(13px, 3vw, 17px); color: #64748b; letter-spacing: 0.2em;
    text-transform: uppercase; font-weight: 400; margin-bottom: 16px;
  }
  .hero-divider {
    width: 60px; height: 3px; margin: 0 auto 16px;
    background: linear-gradient(90deg, #facc15, #ef4444); border-radius: 2px;
  }
  .hero-desc { font-size: 15px; line-height: 1.7; color: #94a3b8; max-width: 520px; margin: 0 auto; }
  
  /* ── MISSION BOX ── */
  .mission-box {
    display: flex; align-items: flex-start; gap: 14px;
    background: rgba(250,204,21,0.06); border: 1px solid rgba(250,204,21,0.25);
    border-radius: 12px; padding: 14px 18px; margin-top: 20px; text-align: left;
  }
  .mission-box.danger { background: rgba(239,68,68,0.1); border-color: #ef4444; }
  .mission-box.success { background: rgba(34,197,94,0.1); border-color: #22c55e; }
  .mission-icon { font-size: 26px; flex-shrink: 0; margin-top: 2px; }
  .mission-title { color: #facc15; display: block; margin-bottom: 3px; font-size: 13px; font-weight: 700; }
  .mission-text { color: #cbd5e1; font-size: 13px; line-height: 1.6; }
  
  /* ── RULES GRID ── */
  .rules-grid {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 10px; margin-bottom: 28px;
  }
  .rule-card {
    background: #1e293b; border-radius: 12px; padding: 18px 14px;
    text-align: center; position: relative; border: 1px solid #334155;
  }
  .rule-num {
    position: absolute; top: 7px; left: 11px;
    font-size: 10px; color: #475569; font-weight: 700;
  }
  .rule-icon { font-size: 26px; display: block; margin-bottom: 6px; }
  .rule-title { font-size: 13px; font-weight: 700; color: #f1f5f9; margin-bottom: 3px; }
  .rule-text { font-size: 11px; color: #94a3b8; line-height: 1.4; }
  
  /* ── BUTTONS ── */
  .btn-group { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }
  .btn {
    border: none; border-radius: 12px; padding: 13px 28px; font-size: 15px;
    font-weight: 700; cursor: pointer; transition: transform 0.15s, opacity 0.15s;
    font-family: inherit;
  }
  .btn:active { transform: scale(0.97); }
  .btn:disabled { opacity: 0.4; cursor: default; }
  .btn-primary {
    background: linear-gradient(135deg, #f59e0b, #ef4444); color: #fff;
    box-shadow: 0 4px 20px rgba(245,158,11,0.3);
  }
  .btn-secondary {
    background: #1e293b; color: #e2e8f0; border: 1px solid #475569;
  }
  .btn-danger { background: #ef4444; color: #fff; }
  .btn-full { width: 100%; }
  .badge {
    background: #f59e0b; color: #000; border-radius: 20px;
    padding: 1px 7px; font-size: 11px; font-weight: 800; margin-left: 6px;
  }
  .btn-back {
    background: none; border: none; color: #94a3b8; font-size: 13px;
    cursor: pointer; padding: 6px 0; font-weight: 500; font-family: inherit;
  }
  .btn-icon {
    background: #1e293b; border: 1px solid #334155; border-radius: 10px;
    padding: 10px 14px; font-size: 16px; cursor: pointer; color: #fff; font-family: inherit;
  }
  .admin-link {
    position: fixed; bottom: 14px; right: 14px;
    background: #1e293b; border: 1px solid #334155; border-radius: 8px;
    padding: 5px 9px; font-size: 15px; cursor: pointer; opacity: 0.35; color: #fff;
  }
  
  /* ── FORMS ── */
  .form-group { margin-bottom: 18px; }
  .label {
    display: block; font-size: 12px; font-weight: 600; color: #94a3b8;
    margin-bottom: 7px; text-transform: uppercase; letter-spacing: 0.05em;
  }
  .input {
    width: 100%; padding: 11px 14px; font-size: 15px;
    background: #1e293b; border: 1px solid #334155; border-radius: 10px;
    color: #e2e8f0; outline: none; font-family: inherit;
  }
  .input:focus { border-color: #f59e0b; }
  
  /* ── GRIDS ── */
  .country-grid {
    display: grid; grid-template-columns: repeat(auto-fill, minmax(115px, 1fr));
    gap: 7px; max-height: 300px; overflow-y: auto; padding: 3px;
  }
  .country-btn {
    display: flex; flex-direction: column; align-items: center; gap: 3px;
    padding: 10px 6px; background: #1e293b; border: 2px solid #334155;
    border-radius: 10px; cursor: pointer; color: #e2e8f0; font-family: inherit;
    transition: border-color 0.15s; font-size: 12px;
  }
  .country-btn.selected { border-color: #f59e0b; background: rgba(245,158,11,0.08); }
  .country-flag { font-size: 26px; }
  
  .device-grid {
    display: grid; grid-template-columns: repeat(auto-fill, minmax(95px, 1fr)); gap: 7px;
  }
  .device-btn {
    display: flex; flex-direction: column; align-items: center; gap: 3px;
    padding: 9px 5px; background: #1e293b; border: 2px solid #334155;
    border-radius: 10px; cursor: pointer; color: #e2e8f0; font-family: inherit;
    transition: border-color 0.15s;
  }
  .device-btn.selected { border-color: #f59e0b; background: rgba(245,158,11,0.08); }
  .device-icon { font-size: 20px; }
  .device-label { font-size: 9px; text-align: center; line-height: 1.2; }
  .device-watts { font-size: 9px; color: #f59e0b; font-weight: 700; }
  
  /* ── TEAM BANNER ── */
  .team-banner {
    display: flex; align-items: center; gap: 14px;
    padding: 14px 18px; background: #1e293b; border-radius: 14px;
    border: 1px solid #334155; margin-bottom: 14px;
  }
  .team-flag { font-size: 34px; }
  .team-name { font-size: 20px; font-weight: 800; color: #f1f5f9; }
  .team-country { font-size: 12px; color: #64748b; }
  
  /* ── STATS ── */
  .stats-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 14px; }
  .stat-card {
    background: #1e293b; border-radius: 12px; padding: 14px;
    text-align: center; border: 1px solid #334155;
  }
  .stat-card.highlight {
    background: linear-gradient(135deg, rgba(245,158,11,0.07), rgba(239,68,68,0.07));
    border-color: rgba(245,158,11,0.25);
  }
  .stat-value { display: block; font-size: 26px; font-weight: 900; color: #facc15; }
  .stat-label { font-size: 10px; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }
  
  .grand-stats {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(125px, 1fr));
    gap: 9px; margin-bottom: 6px;
  }
  .grand-stat {
    background: #1e293b; border-radius: 12px; padding: 14px 10px;
    text-align: center; border: 1px solid #334155;
  }
  .grand-val { display: block; font-size: 20px; font-weight: 900; color: #facc15; margin-bottom: 3px; }
  .grand-label { font-size: 10px; color: #64748b; text-transform: uppercase; }
  .footnote { font-size: 10px; color: #475569; text-align: center; margin: 3px 0 20px; font-style: italic; }
  
  /* ── ACTION ROW ── */
  .action-row { display: flex; gap: 10px; margin-bottom: 18px; }
  .action-row .btn { flex: 1; }
  
  /* ── FINDINGS LIST ── */
  .finding-card {
    display: flex; align-items: center; gap: 10px;
    background: #1e293b; border-radius: 12px; padding: 10px 14px;
    border: 1px solid #334155; margin-bottom: 8px;
  }
  .finding-icon { font-size: 26px; flex-shrink: 0; }
  .finding-info { flex: 1; min-width: 0; }
  .finding-device { font-size: 13px; color: #f1f5f9; display: block; }
  .finding-location { font-size: 11px; color: #64748b; display: block; }
  .finding-notes { font-size: 10px; color: #475569; font-style: italic; display: block; }
  .finding-right { text-align: right; flex-shrink: 0; }
  .finding-watts { font-size: 15px; font-weight: 800; color: #facc15; display: block; }
  .finding-del {
    background: none; border: none; font-size: 13px; cursor: pointer;
    opacity: 0.35; padding: 2px; margin-top: 2px;
  }
  
  /* ── OVERLAY / MODAL ── */
  .overlay {
    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.7); backdrop-filter: blur(4px);
    display: flex; align-items: flex-start; justify-content: center;
    padding: 36px 14px; z-index: 1000; overflow-y: auto;
  }
  .modal {
    background: #0f172a; border: 1px solid #334155; border-radius: 16px;
    padding: 22px; max-width: 500px; width: 100%;
  }
  .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; }
  .modal-title { font-size: 18px; font-weight: 800; }
  .modal-close {
    background: none; border: none; color: #64748b; font-size: 18px;
    cursor: pointer; padding: 3px; font-family: inherit;
  }
  
  /* ── LEADERBOARD ── */
  .leader-card {
    background: #1e293b; border-radius: 14px; padding: 14px 18px;
    border: 1px solid #334155; margin-bottom: 10px;
  }
  .leader-top { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
  .leader-medal { font-size: 22px; font-weight: 900; min-width: 34px; text-align: center; }
  .leader-flag { font-size: 26px; }
  .leader-info { flex: 1; }
  .leader-name { font-size: 15px; font-weight: 700; color: #f1f5f9; display: block; }
  .leader-country { font-size: 11px; color: #64748b; }
  .leader-score { text-align: right; flex-shrink: 0; }
  .leader-watts { font-size: 16px; font-weight: 900; color: #facc15; display: block; }
  .leader-count { font-size: 10px; color: #64748b; }
  .bar-container {
    height: 5px; background: #0f172a; border-radius: 3px;
    overflow: hidden; margin-bottom: 8px;
  }
  .bar-fill {
    height: 100%; background: linear-gradient(90deg, #f59e0b, #ef4444);
    border-radius: 3px; transition: width 0.5s ease;
  }
  .category-list { display: flex; flex-wrap: wrap; gap: 5px; }
  .category-tag {
    font-size: 10px; background: #0f172a; padding: 2px 7px;
    border-radius: 5px; color: #94a3b8; border: 1px solid #1e293b;
  }
  
  /* ── INSIGHT BOX ── */
  .insight-box {
    background: linear-gradient(135deg, rgba(20,83,45,0.2), rgba(22,101,52,0.4));
    border: 1px solid rgba(34,197,94,0.25); border-radius: 14px;
    padding: 18px 22px; margin-top: 22px;
  }
  .insight-title { font-size: 15px; color: #4ade80; margin-bottom: 6px; font-weight: 700; }
  .insight-text { font-size: 13px; line-height: 1.6; color: #bbf7d0; }
  
  /* ── MISC ── */
  .empty-state { text-align: center; padding: 36px 16px; }
  .empty-icon { font-size: 44px; }
  .empty-text { font-size: 15px; color: #64748b; margin: 10px 0 3px; }
  .empty-sub { font-size: 12px; color: #475569; }
  .header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
  .results-title { font-size: 26px; font-weight: 900; text-align: center; margin: 6px 0 18px; }
  .setup-title { font-size: 26px; font-weight: 800; margin: 6px 0 22px; color: #f1f5f9; }
  .confirm-row { display: flex; gap: 10px; }
  .confirm-row .btn { flex: 1; }
  .success-msg { color: #22c55e; }

  /* ── SCROLLBAR ── */
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }
</style>
</head>
<body>

<div id="app" class="app"></div>

<script>
// ═══════════════════════════════════════════════════════════
// DATA & CONFIG
// ═══════════════════════════════════════════════════════════

const COUNTRIES = [
  { code: "IS", name: "Ísland", flag: "🇮🇸" },
  { code: "DE", name: "Þýskaland", flag: "🇩🇪" },
  { code: "NL", name: "Holland", flag: "🇳🇱" },
  { code: "FI", name: "Finnland", flag: "🇫🇮" },
  { code: "NO", name: "Noregur", flag: "🇳🇴" },
  { code: "SE", name: "Svíþjóð", flag: "🇸🇪" },
  { code: "DK", name: "Danmörk", flag: "🇩🇰" },
  { code: "ES", name: "Spánn", flag: "🇪🇸" },
  { code: "PT", name: "Portúgal", flag: "🇵🇹" },
  { code: "FR", name: "Frakkland", flag: "🇫🇷" },
  { code: "IT", name: "Ítalía", flag: "🇮🇹" },
  { code: "PL", name: "Pólland", flag: "🇵🇱" },
  { code: "CZ", name: "Tékkland", flag: "🇨🇿" },
  { code: "AT", name: "Austurríki", flag: "🇦🇹" },
  { code: "BE", name: "Belgía", flag: "🇧🇪" },
  { code: "IE", name: "Írland", flag: "🇮🇪" },
  { code: "GB", name: "Bretland", flag: "🇬🇧" },
  { code: "GR", name: "Grikkland", flag: "🇬🇷" },
  { code: "RO", name: "Rúmenía", flag: "🇷🇴" },
  { code: "HR", name: "Króatía", flag: "🇭🇷" },
  { code: "SI", name: "Slóvenía", flag: "🇸🇮" },
  { code: "SK", name: "Slóvakía", flag: "🇸🇰" },
  { code: "LT", name: "Litáen", flag: "🇱🇹" },
  { code: "LV", name: "Lettland", flag: "🇱🇻" },
  { code: "EE", name: "Eistland", flag: "🇪🇪" },
];

const DEVICE_TYPES = [
  { id: "screen_standby", label: "Skjár á standby", icon: "🖥️", watts: 15 },
  { id: "projector_empty", label: "Skjávarpi í gangi – enginn í stofu", icon: "📽️", watts: 280 },
  { id: "lights_empty", label: "Ljós í tómri stofu", icon: "💡", watts: 120 },
  { id: "computer_idle", label: "Tölva í gangi – enginn notar", icon: "💻", watts: 80 },
  { id: "printer_standby", label: "Prentari á standby", icon: "🖨️", watts: 10 },
  { id: "charger_empty", label: "Hleðslutæki í sambandi – ekkert hlaðið", icon: "🔌", watts: 5 },
  { id: "coffee_on", label: "Kaffivél kveikt – enginn notar", icon: "☕", watts: 1000 },
  { id: "heater_open", label: "Ofn á – gluggi opinn", icon: "🔥", watts: 1500 },
  { id: "ventilation", label: "Loftræsting í tómri stofu", icon: "🌀", watts: 200 },
  { id: "tv_standby", label: "Sjónvarp á standby", icon: "📺", watts: 12 },
  { id: "water_heater", label: "Vatnshitari – óþarfi", icon: "🚿", watts: 2000 },
  { id: "other", label: "Annað", icon: "⚡", watts: 50 },
];

// ═══════════════════════════════════════════════════════════
// API HELPERS
// ═══════════════════════════════════════════════════════════

async function apiGet() {
  const r = await fetch("/api/data");
  return r.json();
}

async function apiPost(data) {
  const r = await fetch("/api/data", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return r.json();
}

function genId() {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

function formatWatts(w) {
  return w >= 1000 ? (w / 1000).toFixed(1) + " kW" : w + " W";
}

// ═══════════════════════════════════════════════════════════
// SIMPLE SPA ROUTER
// ═══════════════════════════════════════════════════════════

let currentScreen = "welcome";
let currentTeam = null;
let gameData = { teams: [], findings: {} };
let refreshInterval = null;

const app = document.getElementById("app");

function navigate(screen, team) {
  currentScreen = screen;
  if (team !== undefined) currentTeam = team;
  if (refreshInterval) { clearInterval(refreshInterval); refreshInterval = null; }
  render();
}

async function refreshData() {
  gameData = await apiGet();
}

// ═══════════════════════════════════════════════════════════
// RENDER FUNCTIONS
// ═══════════════════════════════════════════════════════════

async function render() {
  await refreshData();
  
  switch (currentScreen) {
    case "welcome": renderWelcome(); break;
    case "setup": renderSetup(); break;
    case "hunting": renderHunting(); break;
    case "results": renderResults(); break;
    case "admin": renderAdmin(); break;
  }
}

function renderWelcome() {
  const tc = gameData.teams.length;
  app.innerHTML = \`
    <div class="hero">
      <div class="hero-icon">⚡</div>
      <h1 class="hero-title">ORKUÞJÓFURINN</h1>
      <h2 class="hero-sub">THE ENERGY THIEF</h2>
      <div class="hero-divider"></div>
      <p class="hero-desc">
        Orka fer til spillis í kringum okkur á hverjum degi — skjáir á standby, 
        ljós í tómum stofum, tölvur sem enginn notar. Í þessum leik verðið þið 
        orkurannsóknarar og leitið að orkuþjófum sem leynast um skólann.
      </p>
      <div class="mission-box">
        <div class="mission-icon">🔍</div>
        <div>
          <strong class="mission-title">Verkefnið:</strong>
          <p class="mission-text">
            Farið um skólann með orkumæli og finnið tæki sem sóa orku. 
            Skráið allt sem þið finnið — liðið sem finnur mestu orkusóunina vinnur!
          </p>
        </div>
      </div>
    </div>
    
    <div class="rules-grid">
      <div class="rule-card">
        <span class="rule-num">01</span>
        <span class="rule-icon">👥</span>
        <div class="rule-title">Búðu til lið</div>
        <div class="rule-text">Veldu land og gefðu liðinu nafn</div>
      </div>
      <div class="rule-card">
        <span class="rule-num">02</span>
        <span class="rule-icon">🔎</span>
        <div class="rule-title">Leitaðu</div>
        <div class="rule-text">Farðu um skólann og finndu orkuþjófa</div>
      </div>
      <div class="rule-card">
        <span class="rule-num">03</span>
        <span class="rule-icon">📝</span>
        <div class="rule-title">Skráðu</div>
        <div class="rule-text">Skráðu tegund tækis, staðsetningu og orkunotkun</div>
      </div>
      <div class="rule-card">
        <span class="rule-num">04</span>
        <span class="rule-icon">🏆</span>
        <div class="rule-title">Vindu!</div>
        <div class="rule-text">Liðið sem finnur mestu orkusóunina vinnur</div>
      </div>
    </div>
    
    <div class="btn-group">
      <button class="btn btn-primary" onclick="navigate('setup')">⚡ Búa til lið</button>
      <button class="btn btn-secondary" onclick="navigate('results')">
        📊 Stigatafla \${tc > 0 ? '<span class="badge">' + tc + '</span>' : ''}
      </button>
    </div>
    <button class="admin-link" onclick="navigate('admin')">⚙️</button>
  \`;
}

function renderSetup() {
  let selectedCountry = null;
  
  app.innerHTML = \`
    <button class="btn-back" onclick="navigate('welcome')">← Til baka</button>
    <h2 class="setup-title">Búa til lið</h2>
    <div class="form-group">
      <label class="label">Liðsheiti</label>
      <input class="input" type="text" id="teamNameInput" placeholder="t.d. Volt Vikings" maxlength="30">
    </div>
    <div class="form-group">
      <label class="label">Veldu land</label>
      <input class="input" type="text" id="countrySearch" placeholder="🔍 Leita að landi..." style="margin-bottom:10px">
      <div class="country-grid" id="countryGrid"></div>
    </div>
    <button class="btn btn-primary btn-full" id="createBtn" disabled>⚡ Hefja leit!</button>
  \`;
  
  const grid = document.getElementById("countryGrid");
  const search = document.getElementById("countrySearch");
  const createBtn = document.getElementById("createBtn");
  const nameInput = document.getElementById("teamNameInput");
  
  function renderCountries(filter) {
    const filtered = filter 
      ? COUNTRIES.filter(c => c.name.toLowerCase().includes(filter.toLowerCase()))
      : COUNTRIES;
    grid.innerHTML = filtered.map(c => \`
      <button class="country-btn" data-code="\${c.code}" onclick="selectCountry('\${c.code}')">
        <span class="country-flag">\${c.flag}</span>
        <span>\${c.name}</span>
      </button>
    \`).join("");
  }
  
  renderCountries("");
  search.addEventListener("input", () => renderCountries(search.value));
  
  window.selectCountry = function(code) {
    selectedCountry = COUNTRIES.find(c => c.code === code);
    grid.querySelectorAll(".country-btn").forEach(b => b.classList.remove("selected"));
    grid.querySelector('[data-code="' + code + '"]').classList.add("selected");
    updateBtn();
  };
  
  function updateBtn() {
    createBtn.disabled = !(nameInput.value.trim() && selectedCountry);
  }
  nameInput.addEventListener("input", updateBtn);
  
  createBtn.addEventListener("click", async () => {
    if (!nameInput.value.trim() || !selectedCountry) return;
    createBtn.disabled = true;
    createBtn.textContent = "Bý til...";
    
    const team = {
      id: genId(),
      name: nameInput.value.trim(),
      country: selectedCountry,
      createdAt: new Date().toISOString(),
    };
    
    const data = await apiGet();
    data.teams.push(team);
    data.findings[team.id] = [];
    await apiPost(data);
    navigate("hunting", team);
  });
}

function renderHunting() {
  const team = currentTeam;
  const findings = gameData.findings[team.id] || [];
  const totalWatts = findings.reduce((s, f) => s + f.watts, 0);
  
  app.innerHTML = \`
    <div class="header-row">
      <button class="btn-back" onclick="navigate('welcome')">← Heim</button>
      <button class="btn-back" onclick="navigate('results')" style="border:1px solid #334155;padding:5px 10px;border-radius:8px">📊 Stigatafla</button>
    </div>
    
    <div class="team-banner">
      <span class="team-flag">\${team.country.flag}</span>
      <div>
        <div class="team-name">\${team.name}</div>
        <div class="team-country">\${team.country.name}</div>
      </div>
    </div>
    
    <div class="stats-row">
      <div class="stat-card">
        <span class="stat-value">\${findings.length}</span>
        <span class="stat-label">Orkuþjófar fundnir</span>
      </div>
      <div class="stat-card highlight">
        <span class="stat-value">\${formatWatts(totalWatts)}</span>
        <span class="stat-label">Heildarsóun</span>
      </div>
    </div>
    
    <div class="action-row">
      <button class="btn btn-primary" onclick="showAddForm()">+ Skrá orkuþjóf</button>
      <button class="btn-icon" onclick="render()">🔄</button>
    </div>
    
    <div id="findingsList">
      \${findings.length === 0 ? \`
        <div class="empty-state">
          <div class="empty-icon">🔍</div>
          <p class="empty-text">Engir orkuþjófar skráðir ennþá</p>
          <p class="empty-sub">Farðu um skólann og finndu þá!</p>
        </div>
      \` : [...findings].reverse().map(f => \`
        <div class="finding-card">
          <div class="finding-icon">\${f.icon}</div>
          <div class="finding-info">
            <strong class="finding-device">\${f.deviceLabel}</strong>
            <span class="finding-location">📍 \${f.location}</span>
            \${f.notes ? '<span class="finding-notes">💬 ' + f.notes + '</span>' : ''}
          </div>
          <div class="finding-right">
            <span class="finding-watts">\${f.watts}W</span>
            <button class="finding-del" onclick="deleteFinding('\${f.id}')">🗑️</button>
          </div>
        </div>
      \`).join("")}
    </div>
    <div id="modalContainer"></div>
  \`;
  
  // Auto-refresh every 10s
  refreshInterval = setInterval(async () => {
    await refreshData();
    // Only update stats, don't re-render full page to avoid disruption
  }, 10000);
}

window.showAddForm = function() {
  let selectedDevice = null;
  
  const modal = document.getElementById("modalContainer");
  modal.innerHTML = \`
    <div class="overlay" onclick="if(event.target===this)closeModal()">
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">Skrá orkuþjóf</h3>
          <button class="modal-close" onclick="closeModal()">✕</button>
        </div>
        
        <div class="form-group">
          <label class="label">Tegund tækis</label>
          <div class="device-grid" id="deviceGrid">
            \${DEVICE_TYPES.map(d => \`
              <button class="device-btn" data-id="\${d.id}" onclick="selectDevice('\${d.id}')">
                <span class="device-icon">\${d.icon}</span>
                <span class="device-label">\${d.label}</span>
                <span class="device-watts">\${d.watts}W</span>
              </button>
            \`).join("")}
          </div>
        </div>
        
        <div id="customFields" style="display:none">
          <div class="form-group">
            <label class="label">Lýsing á tæki</label>
            <input class="input" type="text" id="customLabel" placeholder="Hvaða tæki er þetta?">
          </div>
          <div class="form-group">
            <label class="label">Áætluð orkunotkun (W)</label>
            <input class="input" type="number" id="customWatts" placeholder="t.d. 100">
          </div>
        </div>
        
        <div class="form-group">
          <label class="label">Staðsetning</label>
          <input class="input" type="text" id="locationInput" placeholder="t.d. Stofa 204, gangur 2. hæð">
        </div>
        
        <div class="form-group">
          <label class="label">Athugasemd (valfrjálst)</label>
          <input class="input" type="text" id="notesInput" placeholder="t.d. Hefur verið á standby alla helgina">
        </div>
        
        <button class="btn btn-primary btn-full" id="submitFinding" disabled>⚡ Skrá orkuþjóf</button>
      </div>
    </div>
  \`;
  
  window.selectDevice = function(id) {
    selectedDevice = DEVICE_TYPES.find(d => d.id === id);
    document.querySelectorAll(".device-btn").forEach(b => b.classList.remove("selected"));
    document.querySelector('.device-btn[data-id="' + id + '"]').classList.add("selected");
    document.getElementById("customFields").style.display = id === "other" ? "block" : "none";
    updateSubmitBtn();
  };
  
  function updateSubmitBtn() {
    const loc = document.getElementById("locationInput").value.trim();
    document.getElementById("submitFinding").disabled = !(selectedDevice && loc);
  }
  document.getElementById("locationInput").addEventListener("input", updateSubmitBtn);
  
  document.getElementById("submitFinding").addEventListener("click", async () => {
    if (!selectedDevice) return;
    const loc = document.getElementById("locationInput").value.trim();
    if (!loc) return;
    
    const btn = document.getElementById("submitFinding");
    btn.disabled = true;
    btn.textContent = "Vista...";
    
    const finding = {
      id: genId(),
      deviceType: selectedDevice.id,
      deviceLabel: selectedDevice.id === "other" && document.getElementById("customLabel").value
        ? document.getElementById("customLabel").value
        : selectedDevice.label,
      icon: selectedDevice.icon,
      location: loc,
      watts: selectedDevice.id === "other" && document.getElementById("customWatts").value
        ? Number(document.getElementById("customWatts").value)
        : selectedDevice.watts,
      notes: document.getElementById("notesInput").value.trim(),
      timestamp: new Date().toISOString(),
    };
    
    const data = await apiGet();
    if (!data.findings[currentTeam.id]) data.findings[currentTeam.id] = [];
    data.findings[currentTeam.id].push(finding);
    await apiPost(data);
    closeModal();
    render();
  });
};

window.closeModal = function() {
  const c = document.getElementById("modalContainer");
  if (c) c.innerHTML = "";
};

window.deleteFinding = async function(findingId) {
  const data = await apiGet();
  data.findings[currentTeam.id] = (data.findings[currentTeam.id] || []).filter(f => f.id !== findingId);
  await apiPost(data);
  render();
};

function renderResults() {
  const teamStats = gameData.teams.map(t => {
    const f = gameData.findings[t.id] || [];
    return { ...t, findings: f, totalWatts: f.reduce((s, x) => s + x.watts, 0), count: f.length };
  }).sort((a, b) => b.totalWatts - a.totalWatts);
  
  const grandTotal = teamStats.reduce((s, t) => s + t.totalWatts, 0);
  const grandCount = teamStats.reduce((s, t) => s + t.count, 0);
  const annualKWh = (grandTotal * 8 * 250) / 1000;
  const maxWatts = teamStats[0]?.totalWatts || 1;
  
  let insightHtml = "";
  if (grandTotal > 0) {
    let extra = "";
    if (annualKWh > 1000) extra = " Það er nóg til að hita um " + Math.round(annualKWh / 18000) + " heimili í eitt ár!";
    else if (annualKWh > 100) extra = " Það er nóg til að hlaða símann þinn í " + Math.round(annualKWh / 0.012) + " skipti!";
    else extra = " Haldið áfram að leita — fleiri orkuþjófar leynast í skólanum!";
    
    insightHtml = \`
      <div class="insight-box">
        <div class="insight-title">💡 Vissir þú?</div>
        <p class="insight-text">
          Orkusóunin sem þið funduð (\${formatWatts(grandTotal)}) jafngildir um \${annualKWh.toFixed(0)} kWh á ári.\${extra}
        </p>
      </div>
    \`;
  }
  
  app.innerHTML = \`
    <div class="header-row">
      <button class="btn-back" onclick="navigate('\${currentTeam ? 'hunting' : 'welcome'}')">← Til baka</button>
      <button class="btn-icon" id="autoRefreshBtn" onclick="toggleAutoRefresh()">🟢 Sjálfvirk</button>
    </div>
    
    <h2 class="results-title">📊 Stigatafla</h2>
    
    <div class="grand-stats">
      <div class="grand-stat">
        <span class="grand-val">\${teamStats.length}</span>
        <span class="grand-label">Lið</span>
      </div>
      <div class="grand-stat">
        <span class="grand-val">\${grandCount}</span>
        <span class="grand-label">Orkuþjófar</span>
      </div>
      <div class="grand-stat">
        <span class="grand-val">\${formatWatts(grandTotal)}</span>
        <span class="grand-label">Heildarsóun</span>
      </div>
      <div class="grand-stat">
        <span class="grand-val">\${annualKWh.toFixed(0)} kWh</span>
        <span class="grand-label">Áætlað á ári*</span>
      </div>
    </div>
    <p class="footnote">* Miðað við 8 klst/dag, 250 virka daga á ári</p>
    
    \${teamStats.length === 0 ? \`
      <div class="empty-state">
        <div class="empty-icon">🏁</div>
        <p class="empty-text">Engin lið skráð ennþá</p>
        <p class="empty-sub">Bíddu eftir að lið skrái sig!</p>
      </div>
    \` : teamStats.map((t, i) => {
      const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "#" + (i + 1);
      const barWidth = maxWatts > 0 ? (t.totalWatts / maxWatts) * 100 : 0;
      
      const categories = {};
      t.findings.forEach(f => {
        if (!categories[f.deviceLabel]) categories[f.deviceLabel] = { count: 0, watts: 0, icon: f.icon };
        categories[f.deviceLabel].count++;
        categories[f.deviceLabel].watts += f.watts;
      });
      
      const catHtml = Object.entries(categories)
        .sort((a, b) => b[1].watts - a[1].watts)
        .map(([label, data]) => \`<span class="category-tag">\${data.icon} \${label} ×\${data.count} (\${data.watts}W)</span>\`)
        .join("");
      
      return \`
        <div class="leader-card">
          <div class="leader-top">
            <span class="leader-medal">\${medal}</span>
            <span class="leader-flag">\${t.country.flag}</span>
            <div class="leader-info">
              <strong class="leader-name">\${t.name}</strong>
              <span class="leader-country">\${t.country.name}</span>
            </div>
            <div class="leader-score">
              <span class="leader-watts">\${formatWatts(t.totalWatts)}</span>
              <span class="leader-count">\${t.count} þjófar</span>
            </div>
          </div>
          <div class="bar-container"><div class="bar-fill" style="width:\${barWidth}%"></div></div>
          \${catHtml ? '<div class="category-list">' + catHtml + '</div>' : ''}
        </div>
      \`;
    }).join("")}
    
    \${insightHtml}
  \`;
  
  // Auto-refresh results every 5s
  let autoRefresh = true;
  refreshInterval = setInterval(async () => {
    if (autoRefresh) {
      await refreshData();
      renderResults();
    }
  }, 5000);
  
  window.toggleAutoRefresh = function() {
    autoRefresh = !autoRefresh;
    const btn = document.getElementById("autoRefreshBtn");
    if (btn) btn.textContent = autoRefresh ? "🟢 Sjálfvirk" : "⏸ Stöðvuð";
  };
}

function renderAdmin() {
  app.innerHTML = \`
    <button class="btn-back" onclick="navigate('welcome')">← Til baka</button>
    <h2 class="setup-title">⚙️ Stjórnborð</h2>
    
    <div class="mission-box danger">
      <div class="mission-icon">⚠️</div>
      <div>
        <strong class="mission-title" style="color:#ef4444">Hreinsa öll gögn</strong>
        <p class="mission-text">Þetta eyðir öllum liðum og skráningum. Þetta er ekki hægt að afturkalla!</p>
      </div>
    </div>
    <br>
    <div id="adminActions">
      <button class="btn btn-danger btn-full" onclick="confirmReset()">🗑️ Hreinsa öll gögn</button>
    </div>
  \`;
  
  window.confirmReset = function() {
    document.getElementById("adminActions").innerHTML = \`
      <div class="confirm-row">
        <button class="btn btn-danger" onclick="doReset()">Já, eyða öllu</button>
        <button class="btn btn-secondary" onclick="renderAdmin()">Hætta við</button>
      </div>
    \`;
  };
  
  window.doReset = async function() {
    await apiPost({ teams: [], findings: {} });
    currentTeam = null;
    document.getElementById("adminActions").innerHTML = \`
      <div class="mission-box success">
        <p class="success-msg" style="margin:0">✅ Öll gögn hafa verið hreinsuð!</p>
      </div>
    \`;
  };
}

// ═══════════════════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════════════════

render();

</script>
</body>
</html>`;

// ─── HTTP SERVER ────────────────────────────────────────────

const server = http.createServer((req, res) => {
  // CORS headers for flexibility
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }

  // API: GET data
  if (req.method === "GET" && req.url === "/api/data") {
    const data = loadData();
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify(data));
    return;
  }

  // API: POST data
  if (req.method === "POST" && req.url === "/api/data") {
    let body = "";
    req.on("data", chunk => (body += chunk));
    req.on("end", () => {
      try {
        const data = JSON.parse(body);
        saveData(data);
        res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify({ ok: true }));
      } catch (e) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid JSON" }));
      }
    });
    return;
  }

  // Serve HTML page
  if (req.method === "GET" && (req.url === "/" || req.url === "/index.html")) {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(HTML_PAGE);
    return;
  }

  // 404
  res.writeHead(404, { "Content-Type": "text/plain" });
  res.end("404 Not Found");
});

server.listen(PORT, "0.0.0.0", () => {
  console.log("");
  console.log("═══════════════════════════════════════════════════════");
  console.log("  ⚡ ORKUÞJÓFURINN - Energy Thief Hunter");
  console.log("═══════════════════════════════════════════════════════");
  console.log("");
  console.log("  Leikurinn keyrir á:");
  console.log("  → http://localhost:" + PORT);
  console.log("");
  console.log("  Til að aðrir á netinu geti tengst:");
  console.log("  → Finndu IP-tölu tölvunnar (ipconfig / ifconfig)");
  console.log("  → Nemendur opna: http://<IP-TALA>:" + PORT);
  console.log("");
  console.log("  Gögn vistuð í: " + DATA_FILE);
  console.log("  Til að stöðva: Ctrl+C");
  console.log("═══════════════════════════════════════════════════════");
  console.log("");
});
