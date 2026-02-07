// ═══════════════════════════════════════════════════════════
// THE ENERGY THIEF - Energy Waste Hunter Game
// ═══════════════════════════════════════════════════════════

const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, "game-data.json");

function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  } catch (e) { console.error("Error reading data:", e.message); }
  return { teams: [], findings: {} };
}
function saveData(data) { fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf8"); }
if (!fs.existsSync(DATA_FILE)) { saveData({ teams: [], findings: {} }); console.log("✅ game-data.json created"); }

const HTML_PAGE = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<title>⚡ The Energy Thief</title>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Segoe UI','Helvetica Neue',system-ui,-apple-system,sans-serif;background:linear-gradient(145deg,#0b0f1a 0%,#0f172a 40%,#0c1425 100%);color:#e2e8f0;min-height:100vh;-webkit-font-smoothing:antialiased}
.app{max-width:700px;margin:0 auto;padding:20px 16px 80px}
.hero{text-align:center;margin-bottom:32px}
.hero-icon{font-size:64px;filter:drop-shadow(0 0 20px rgba(250,204,21,0.4))}
.hero-title{font-size:clamp(32px,7vw,52px);font-weight:900;line-height:1.1;background:linear-gradient(135deg,#facc15,#f59e0b,#ef4444);-webkit-background-clip:text;-webkit-text-fill-color:transparent;letter-spacing:-0.02em;margin:8px 0 4px}
.hero-sub{font-size:clamp(13px,3vw,17px);color:#64748b;letter-spacing:0.2em;text-transform:uppercase;font-weight:400;margin-bottom:16px}
.hero-divider{width:60px;height:3px;margin:0 auto 16px;background:linear-gradient(90deg,#facc15,#ef4444);border-radius:2px}
.hero-desc{font-size:15px;line-height:1.7;color:#94a3b8;max-width:520px;margin:0 auto}
.mission-box{display:flex;align-items:flex-start;gap:14px;background:rgba(250,204,21,0.06);border:1px solid rgba(250,204,21,0.25);border-radius:12px;padding:14px 18px;margin-top:20px;text-align:left}
.mission-box.danger{background:rgba(239,68,68,0.1);border-color:#ef4444}
.mission-box.success{background:rgba(34,197,94,0.1);border-color:#22c55e}
.mission-icon{font-size:26px;flex-shrink:0;margin-top:2px}
.mission-title{color:#facc15;display:block;margin-bottom:3px;font-size:13px;font-weight:700}
.mission-text{color:#cbd5e1;font-size:13px;line-height:1.6}
.rules-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px;margin-bottom:28px}
.rule-card{background:#1e293b;border-radius:12px;padding:18px 14px;text-align:center;position:relative;border:1px solid #334155}
.rule-num{position:absolute;top:7px;left:11px;font-size:10px;color:#475569;font-weight:700}
.rule-icon{font-size:26px;display:block;margin-bottom:6px}
.rule-title{font-size:13px;font-weight:700;color:#f1f5f9;margin-bottom:3px}
.rule-text{font-size:11px;color:#94a3b8;line-height:1.4}
.qr-section{text-align:center;margin:28px 0 8px}
.qr-section canvas{border-radius:12px;background:#fff;padding:12px}
.qr-label{font-size:12px;color:#64748b;margin-top:8px}
.qr-url{font-size:13px;color:#f59e0b;font-weight:600;word-break:break-all;margin-top:4px}
.btn-group{display:flex;gap:10px;justify-content:center;flex-wrap:wrap}
.btn{border:none;border-radius:12px;padding:13px 28px;font-size:15px;font-weight:700;cursor:pointer;transition:transform 0.15s,opacity 0.15s;font-family:inherit}
.btn:active{transform:scale(0.97)}.btn:disabled{opacity:0.4;cursor:default}
.btn-primary{background:linear-gradient(135deg,#f59e0b,#ef4444);color:#fff;box-shadow:0 4px 20px rgba(245,158,11,0.3)}
.btn-secondary{background:#1e293b;color:#e2e8f0;border:1px solid #475569}
.btn-danger{background:#ef4444;color:#fff}
.btn-full{width:100%}
.badge{background:#f59e0b;color:#000;border-radius:20px;padding:1px 7px;font-size:11px;font-weight:800;margin-left:6px}
.btn-back{background:none;border:none;color:#94a3b8;font-size:13px;cursor:pointer;padding:6px 0;font-weight:500;font-family:inherit}
.btn-icon{background:#1e293b;border:1px solid #334155;border-radius:10px;padding:10px 14px;font-size:16px;cursor:pointer;color:#fff;font-family:inherit}
.admin-link{position:fixed;bottom:14px;right:14px;background:#1e293b;border:1px solid #334155;border-radius:8px;padding:5px 9px;font-size:15px;cursor:pointer;opacity:0.35;color:#fff}
.form-group{margin-bottom:18px}
.label{display:block;font-size:12px;font-weight:600;color:#94a3b8;margin-bottom:7px;text-transform:uppercase;letter-spacing:0.05em}
.input{width:100%;padding:11px 14px;font-size:15px;background:#1e293b;border:1px solid #334155;border-radius:10px;color:#e2e8f0;outline:none;font-family:inherit}
.input:focus{border-color:#f59e0b}
.country-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(115px,1fr));gap:7px;max-height:300px;overflow-y:auto;padding:3px}
.country-btn{display:flex;flex-direction:column;align-items:center;gap:3px;padding:10px 6px;background:#1e293b;border:2px solid #334155;border-radius:10px;cursor:pointer;color:#e2e8f0;font-family:inherit;transition:border-color 0.15s;font-size:12px}
.country-btn.selected{border-color:#f59e0b;background:rgba(245,158,11,0.08)}
.country-flag{font-size:26px}
.device-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(95px,1fr));gap:7px}
.device-btn{display:flex;flex-direction:column;align-items:center;gap:3px;padding:9px 5px;background:#1e293b;border:2px solid #334155;border-radius:10px;cursor:pointer;color:#e2e8f0;font-family:inherit;transition:border-color 0.15s}
.device-btn.selected{border-color:#f59e0b;background:rgba(245,158,11,0.08)}
.device-icon{font-size:20px}.device-label{font-size:9px;text-align:center;line-height:1.2}.device-watts{font-size:9px;color:#f59e0b;font-weight:700}
.team-select-grid{display:flex;flex-direction:column;gap:8px;margin:16px 0}
.team-select-btn{display:flex;align-items:center;gap:14px;padding:14px 18px;background:#1e293b;border:2px solid #334155;border-radius:12px;cursor:pointer;color:#e2e8f0;font-family:inherit;transition:border-color 0.15s,background 0.15s;font-size:15px;text-align:left;width:100%}
.team-select-btn:hover{border-color:#f59e0b;background:rgba(245,158,11,0.05)}
.team-select-flag{font-size:30px}.team-select-name{font-weight:700;color:#f1f5f9}.team-select-country{font-size:12px;color:#64748b}
.team-select-stats{margin-left:auto;text-align:right;font-size:12px;color:#64748b}
.team-select-stats strong{color:#facc15;font-size:14px;display:block}
.team-banner{display:flex;align-items:center;gap:14px;padding:14px 18px;background:#1e293b;border-radius:14px;border:1px solid #334155;margin-bottom:14px}
.team-flag{font-size:34px}.team-name{font-size:20px;font-weight:800;color:#f1f5f9}.team-country{font-size:12px;color:#64748b}
.stats-row{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px}
.stat-card{background:#1e293b;border-radius:12px;padding:14px;text-align:center;border:1px solid #334155}
.stat-card.highlight{background:linear-gradient(135deg,rgba(245,158,11,0.07),rgba(239,68,68,0.07));border-color:rgba(245,158,11,0.25)}
.stat-value{display:block;font-size:26px;font-weight:900;color:#facc15}
.stat-label{font-size:10px;color:#64748b;text-transform:uppercase;letter-spacing:0.05em}
.grand-stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(125px,1fr));gap:9px;margin-bottom:6px}
.grand-stat{background:#1e293b;border-radius:12px;padding:14px 10px;text-align:center;border:1px solid #334155}
.grand-val{display:block;font-size:20px;font-weight:900;color:#facc15;margin-bottom:3px}
.grand-label{font-size:10px;color:#64748b;text-transform:uppercase}
.footnote{font-size:10px;color:#475569;text-align:center;margin:3px 0 20px;font-style:italic}
.action-row{display:flex;gap:10px;margin-bottom:18px}.action-row .btn{flex:1}
.finding-card{display:flex;align-items:center;gap:10px;background:#1e293b;border-radius:12px;padding:10px 14px;border:1px solid #334155;margin-bottom:8px}
.finding-icon{font-size:26px;flex-shrink:0}.finding-info{flex:1;min-width:0}
.finding-device{font-size:13px;color:#f1f5f9;display:block}.finding-location{font-size:11px;color:#64748b;display:block}
.finding-notes{font-size:10px;color:#475569;font-style:italic;display:block}
.finding-right{text-align:right;flex-shrink:0}
.finding-watts{font-size:15px;font-weight:800;color:#facc15;display:block}
.finding-measured{font-size:9px;color:#22c55e}.finding-estimated{font-size:9px;color:#64748b}
.finding-del{background:none;border:none;font-size:13px;cursor:pointer;opacity:0.35;padding:2px;margin-top:2px}
.overlay{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.7);backdrop-filter:blur(4px);display:flex;align-items:flex-start;justify-content:center;padding:36px 14px;z-index:1000;overflow-y:auto}
.modal{background:#0f172a;border:1px solid #334155;border-radius:16px;padding:22px;max-width:500px;width:100%}
.modal-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:18px}
.modal-title{font-size:18px;font-weight:800}
.modal-close{background:none;border:none;color:#64748b;font-size:18px;cursor:pointer;padding:3px;font-family:inherit}
.watts-row{display:flex;gap:10px;align-items:center;padding:12px 14px;background:#1e293b;border-radius:10px;border:1px solid #334155}
.watts-input{width:100px;padding:8px 10px;font-size:15px;background:#0f172a;border:1px solid #334155;border-radius:8px;color:#facc15;outline:none;font-family:inherit;font-weight:700;text-align:right}
.watts-input:focus{border-color:#f59e0b}
.watts-unit{color:#94a3b8;font-weight:600;font-size:14px}
.watts-hint{font-size:11px;color:#64748b;margin-left:auto}
.leader-card{background:#1e293b;border-radius:14px;padding:14px 18px;border:1px solid #334155;margin-bottom:10px}
.leader-top{display:flex;align-items:center;gap:10px;margin-bottom:8px}
.leader-medal{font-size:22px;font-weight:900;min-width:34px;text-align:center}
.leader-flag{font-size:26px}.leader-info{flex:1}
.leader-name{font-size:15px;font-weight:700;color:#f1f5f9;display:block}
.leader-country{font-size:11px;color:#64748b}
.leader-score{text-align:right;flex-shrink:0}
.leader-watts{font-size:16px;font-weight:900;color:#facc15;display:block}
.leader-count{font-size:10px;color:#64748b}
.bar-container{height:5px;background:#0f172a;border-radius:3px;overflow:hidden;margin-bottom:8px}
.bar-fill{height:100%;background:linear-gradient(90deg,#f59e0b,#ef4444);border-radius:3px;transition:width 0.5s ease}
.category-list{display:flex;flex-wrap:wrap;gap:5px}
.category-tag{font-size:10px;background:#0f172a;padding:2px 7px;border-radius:5px;color:#94a3b8;border:1px solid #1e293b}
.insight-box{background:linear-gradient(135deg,rgba(20,83,45,0.2),rgba(22,101,52,0.4));border:1px solid rgba(34,197,94,0.25);border-radius:14px;padding:18px 22px;margin-top:22px}
.insight-title{font-size:15px;color:#4ade80;margin-bottom:6px;font-weight:700}
.insight-text{font-size:13px;line-height:1.6;color:#bbf7d0}
.empty-state{text-align:center;padding:36px 16px}.empty-icon{font-size:44px}
.empty-text{font-size:15px;color:#64748b;margin:10px 0 3px}.empty-sub{font-size:12px;color:#475569}
.header-row{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px}
.results-title{font-size:26px;font-weight:900;text-align:center;margin:6px 0 18px}
.setup-title{font-size:26px;font-weight:800;margin:6px 0 22px;color:#f1f5f9}
.confirm-row{display:flex;gap:10px}.confirm-row .btn{flex:1}
::-webkit-scrollbar{width:6px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:#334155;border-radius:3px}
</style>
</head>
<body>
<div id="app" class="app"></div>
<script>
// Minimal QR Code generator
var QRCode=function(){function a(a){this.mode=4;this.data=a}function b(a,b){this.typeNumber=a;this.errorCorrectLevel=b;this.modules=null;this.moduleCount=0;this.dataCache=null;this.dataList=[]}a.prototype={getLength:function(){return this.data.length},write:function(a){for(var b=0;b<this.data.length;b++)a.put(this.data.charCodeAt(b),8)}};b.prototype={addData:function(b){this.dataList.push(new a(b));this.dataCache=null},isDark:function(a,b){if(0>a||this.moduleCount<=a||0>b||this.moduleCount<=b)throw Error(a+","+b);return this.modules[a][b]},getModuleCount:function(){return this.moduleCount},make:function(){this.makeImpl(!1,this.getBestMaskPattern())},makeImpl:function(a,e){this.moduleCount=4*this.typeNumber+17;this.modules=Array(this.moduleCount);for(var c=0;c<this.moduleCount;c++){this.modules[c]=Array(this.moduleCount);for(var d=0;d<this.moduleCount;d++)this.modules[c][d]=null}this.setupPositionProbePattern(0,0);this.setupPositionProbePattern(this.moduleCount-7,0);this.setupPositionProbePattern(0,this.moduleCount-7);this.setupPositionAdjustPattern();this.setupTimingPattern();this.setupTypeInfo(a,e);7<=this.typeNumber&&this.setupTypeNumber(a);null==this.dataCache&&(this.dataCache=b.createData(this.typeNumber,this.errorCorrectLevel,this.dataList));this.mapData(this.dataCache,e)},setupPositionProbePattern:function(a,b){for(var c=-1;7>=c;c++)if(!(-1>=a+c||this.moduleCount<=a+c))for(var d=-1;7>=d;d++)-1>=b+d||this.moduleCount<=b+d||(this.modules[a+c][b+d]=0<=c&&6>=c&&(0==d||6==d)||0<=d&&6>=d&&(0==c||6==c)||2<=c&&4>=c&&2<=d&&4>=d?!0:!1)},getBestMaskPattern:function(){for(var a=0,b=0,c=0;8>c;c++){this.makeImpl(!0,c);var d=f.getLostPoint(this);if(0==c||a>d)a=d,b=c}return b},setupTimingPattern:function(){for(var a=8;a<this.moduleCount-8;a++)null==this.modules[a][6]&&(this.modules[a][6]=0==a%2),null==this.modules[6][a]&&(this.modules[6][a]=0==a%2)},setupPositionAdjustPattern:function(){for(var a=f.getPatternPosition(this.typeNumber),b=0;b<a.length;b++)for(var c=0;c<a.length;c++){var d=a[b],e=a[c];if(null==this.modules[d][e])for(var g=-2;2>=g;g++)for(var h=-2;2>=h;h++)this.modules[d+g][e+h]=-2==g||2==g||-2==h||2==h||0==g&&0==h?!0:!1}},setupTypeNumber:function(a){for(var b=f.getBCHTypeNumber(this.typeNumber),c=0;18>c;c++){var d=!a&&1==(b>>c&1);this.modules[Math.floor(c/3)][c%3+this.moduleCount-8-3]=d}for(c=0;18>c;c++)d=!a&&1==(b>>c&1),this.modules[c%3+this.moduleCount-8-3][Math.floor(c/3)]=d},setupTypeInfo:function(a,b){for(var c=this.errorCorrectLevel<<3|b,d=f.getBCHTypeInfo(c),e=0;15>e;e++){var g=!a&&1==(d>>e&1);6>e?this.modules[e][8]=g:8>e?this.modules[e+1][8]=g:this.modules[this.moduleCount-15+e][8]=g}for(e=0;15>e;e++)g=!a&&1==(d>>e&1),8>e?this.modules[8][this.moduleCount-e-1]=g:9>e?this.modules[8][15-e-1+1]=g:this.modules[8][15-e-1]=g;this.modules[this.moduleCount-8][8]=!a},mapData:function(a,b){for(var c=-1,d=this.moduleCount-1,e=7,g=0,h=this.moduleCount-1;1<h;h-=2)for(6==h&&h--;;){for(var k=0;2>k;k++)if(null==this.modules[d][h-k]){var l=!1;g<a.length&&(l=1==(a[g]>>>e&1));f.getMask(b,d,h-k)&&(l=!l);this.modules[d][h-k]=l;e--;-1==e&&(g++,e=7)}d+=c;if(0>d||this.moduleCount<=d){d-=c;c=-c;break}}}};b.PAD0=236;b.PAD1=17;b.createData=function(a,c,d){for(var e=j.getRSBlocks(a,c),g=new k,h=0;h<d.length;h++){var l=d[h];g.put(l.mode,4);g.put(l.getLength(),f.getLengthInBits(l.mode,a));l.write(g)}for(h=a=0;h<e.length;h++)a+=e[h].dataCount;if(g.getLengthInBits()>8*a)throw Error("code length overflow. ("+g.getLengthInBits()+">"+8*a+")");g.getLengthInBits()+4<=8*a&&g.put(0,4);for(;0!=g.getLengthInBits()%8;)g.putBit(!1);for(;!(g.getLengthInBits()>=8*a);)g.put(b.PAD0,8),g.getLengthInBits()>=8*a||g.put(b.PAD1,8);return b.createBytes(g,e)};b.createBytes=function(a,b){for(var c=0,d=0,e=0,g=Array(b.length),h=Array(b.length),k=0;k<b.length;k++){var l=b[k].dataCount,m=b[k].totalCount-l;d=Math.max(d,l);e=Math.max(e,m);g[k]=Array(l);for(var n=0;n<g[k].length;n++)g[k][n]=255&a.buffer[n+c];c+=l;n=f.getErrorCorrectPolynomial(m);l=(new i(g[k],n.getLength()-1)).mod(n);h[k]=Array(n.getLength()-1);for(n=0;n<h[k].length;n++)m=n+l.getLength()-h[k].length,h[k][n]=0<=m?l.get(m):0}for(n=c=0;n<b.length;n++)c+=b[n].totalCount;c=Array(c);for(n=k=0;n<d;n++)for(b=0;b<g.length;b++)n<g[b].length&&(c[k++]=g[b][n]);for(n=0;n<e;n++)for(b=0;b<h.length;b++)n<h[b].length&&(c[k++]=h[b][n]);return c};var c={L:1,M:0,Q:3,H:2},f={PATTERN_POSITION_TABLE:[[],[6,18],[6,22],[6,26],[6,30],[6,34],[6,22,38],[6,24,42],[6,26,46],[6,28,50],[6,30,54],[6,32,58],[6,34,62],[6,26,46,66],[6,26,48,70],[6,26,50,74],[6,30,54,78],[6,30,56,82],[6,30,58,86],[6,34,62,90],[6,28,50,72,94],[6,26,50,74,98],[6,30,54,78,102],[6,28,54,80,106],[6,32,58,84,110],[6,30,58,86,114],[6,34,62,90,118],[6,26,50,74,98,122],[6,30,54,78,102,126],[6,26,52,78,104,130],[6,30,56,82,108,134],[6,34,60,86,112,138],[6,30,58,86,114,142],[6,34,62,90,118,146],[6,30,54,78,102,126,150],[6,24,50,76,102,128,154],[6,28,54,80,106,132,158],[6,32,58,84,110,136,162],[6,26,54,82,110,138,166],[6,30,58,86,114,142,170]],G15:1335,G18:7973,G15_MASK:21522,getBCHTypeInfo:function(a){for(var b=a<<10;0<=f.getBCHDigit(b)-f.getBCHDigit(f.G15);)b^=f.G15<<f.getBCHDigit(b)-f.getBCHDigit(f.G15);return(a<<10|b)^f.G15_MASK},getBCHTypeNumber:function(a){for(var b=a<<12;0<=f.getBCHDigit(b)-f.getBCHDigit(f.G18);)b^=f.G18<<f.getBCHDigit(b)-f.getBCHDigit(f.G18);return a<<12|b},getBCHDigit:function(a){for(var b=0;0!=a;)b++,a>>>=1;return b},getPatternPosition:function(a){return f.PATTERN_POSITION_TABLE[a-1]},getMask:function(a,b,c){switch(a){case 0:return 0==(b+c)%2;case 1:return 0==b%2;case 2:return 0==c%3;case 3:return 0==(b+c)%3;case 4:return 0==(Math.floor(b/2)+Math.floor(c/3))%2;case 5:return 0==b*c%2+b*c%3;case 6:return 0==(b*c%2+b*c%3)%2;case 7:return 0==(b*c%3+(b+c)%2)%2;default:throw Error("bad maskPattern:"+a);}},getErrorCorrectPolynomial:function(a){for(var b=new i([1],0),c=0;c<a;c++)b=b.multiply(new i([1,g.gexp(c)],0));return b},getLengthInBits:function(a,b){if(4==a)switch(!0){case 1<=b&&10>=b:return 8;case 11<=b&&26>=b:return 16;case 27<=b&&40>=b:return 16;default:throw Error("type:"+a+" error");}},getLostPoint:function(a){for(var b=a.getModuleCount(),c=0,d=0;d<b;d++)for(var e=0;e<b;e++){for(var f=0,g=a.isDark(d,e),h=-1;1>=h;h++)if(!(0>d+h||b<=d+h))for(var i=-1;1>=i;i++)0>e+i||b<=e+i||0==h&&0==i||g==a.isDark(d+h,e+i)&&f++;5<f&&(c+=3+f-5)}for(d=0;d<b-1;d++)for(e=0;e<b-1;e++)if(f=0,a.isDark(d,e)&&f++,a.isDark(d+1,e)&&f++,a.isDark(d,e+1)&&f++,a.isDark(d+1,e+1)&&f++,0==f||4==f)c+=3;for(d=0;d<b;d++)for(e=0;e<b-6;e++)a.isDark(d,e)&&!a.isDark(d,e+1)&&a.isDark(d,e+2)&&a.isDark(d,e+3)&&a.isDark(d,e+4)&&!a.isDark(d,e+5)&&a.isDark(d,e+6)&&(c+=40);for(e=0;e<b;e++)for(d=0;d<b-6;d++)a.isDark(d,e)&&!a.isDark(d+1,e)&&a.isDark(d+2,e)&&a.isDark(d+3,e)&&a.isDark(d+4,e)&&!a.isDark(d+5,e)&&a.isDark(d+6,e)&&(c+=40);for(e=f=0;e<b;e++)for(d=0;d<b;d++)a.isDark(d,e)&&f++;return c+10*(Math.abs(100*f/b/b-50)/5)};},g={glog:function(a){if(1>a)throw Error("glog("+a+")");return g.LOG_TABLE[a]},gexp:function(a){for(;0>a;)a+=255;for(;256<=a;)a-=255;return g.EXP_TABLE[a]},EXP_TABLE:Array(256),LOG_TABLE:Array(256)};for(var h=0;8>h;h++)g.EXP_TABLE[h]=1<<h;for(h=8;256>h;h++)g.EXP_TABLE[h]=g.EXP_TABLE[h-4]^g.EXP_TABLE[h-5]^g.EXP_TABLE[h-6]^g.EXP_TABLE[h-8];for(h=0;255>h;h++)g.LOG_TABLE[g.EXP_TABLE[h]]=h;var i=function(a,b){if(void 0==a.length)throw Error(a.length+"/"+b);for(var c=0;c<a.length&&0==a[c];)c++;this.num=Array(a.length-c+b);for(var d=0;d<a.length-c;d++)this.num[d]=a[d+c]};i.prototype={get:function(a){return this.num[a]},getLength:function(){return this.num.length},multiply:function(a){for(var b=Array(this.getLength()+a.getLength()-1),c=0;c<this.getLength();c++)for(var d=0;d<a.getLength();d++)b[c+d]^=g.gexp(g.glog(this.get(c))+g.glog(a.get(d)));return new i(b,0)},mod:function(a){if(0>this.getLength()-a.getLength())return this;for(var b=g.glog(this.get(0))-g.glog(a.get(0)),c=Array(this.getLength()),d=0;d<this.getLength();d++)c[d]=this.get(d);for(d=0;d<a.getLength();d++)c[d]^=g.gexp(g.glog(a.get(d))+b);return(new i(c,0)).mod(a)}};var j={RS_BLOCK_TABLE:[[1,26,19],[1,26,16],[1,26,13],[1,26,9],[1,44,34],[1,44,28],[1,44,22],[1,44,16],[1,70,55],[1,70,44],[2,35,17],[2,35,13],[1,100,80],[2,50,32],[2,50,24],[4,25,9],[1,134,108],[2,67,43],[2,33,15,2,34,16],[2,33,11,2,34,12],[2,86,68],[4,43,27],[4,43,19],[4,43,15],[2,98,78],[4,49,31],[2,32,14,4,33,15],[4,39,13,1,40,14],[2,121,97],[2,60,38,2,61,39],[4,40,18,2,41,19],[4,40,14,2,41,15],[2,146,116],[3,58,36,2,59,37],[4,36,16,4,37,17],[4,36,12,4,37,13],[2,86,68,2,87,69],[4,69,43,1,70,44],[6,43,19,2,44,20],[6,43,15,2,44,16],[4,101,81],[1,80,50,4,81,51],[4,50,22,4,51,23],[3,36,12,8,37,13],[2,116,92,2,117,93],[6,58,36,2,59,37],[4,46,20,6,47,21],[7,42,14,4,43,15],[4,133,107],[8,59,37,1,60,38],[8,44,20,4,45,21],[12,33,11,4,34,12],[3,145,115,1,146,116],[4,64,40,5,65,41],[11,36,16,5,37,17],[11,36,12,5,37,13],[5,109,87,1,110,88],[5,65,41,5,66,42],[5,54,24,7,55,25],[11,36,12],[5,122,98,1,123,99],[7,73,45,3,74,46],[15,43,19,2,44,20],[3,45,15,13,46,16],[1,135,107,5,136,108],[10,74,46,1,75,47],[1,50,22,15,51,23],[2,42,14,17,43,15],[5,150,120,1,151,121],[9,69,43,4,70,44],[17,50,22,1,51,23],[2,42,14,19,43,15],[3,141,113,4,142,114],[3,70,44,11,71,45],[17,47,21,4,48,22],[9,39,13,16,40,14],[3,135,107,5,136,108],[3,67,41,13,68,42],[15,54,24,5,55,25],[15,43,15,10,44,16],[4,144,116,4,145,117],[17,68,42],[17,50,22,6,51,23],[19,46,16,6,47,17],[2,139,111,7,140,112],[17,74,46],[7,54,24,16,55,25],[34,37,13],[4,151,121,5,152,122],[4,75,47,14,76,48],[11,54,24,14,55,25],[16,45,15,14,46,16],[6,147,117,4,148,118],[6,73,45,14,74,46],[11,54,24,16,55,25],[30,46,16,2,47,17],[8,132,106,4,133,107],[8,75,47,13,76,48],[7,54,24,22,55,25],[22,45,15,13,46,16],[10,142,114,2,143,115],[19,74,46,4,75,47],[28,50,22,6,51,23],[33,46,16,4,47,17],[8,152,122,4,153,123],[22,73,45,3,74,46],[8,53,23,26,54,24],[12,45,15,28,46,16],[3,147,117,10,148,118],[3,73,45,23,74,46],[4,54,24,31,55,25],[11,45,15,31,46,16],[7,146,116,7,147,117],[21,73,45,7,74,46],[1,53,23,37,54,24],[19,45,15,26,46,16],[5,145,115,10,146,116],[19,75,47,10,76,48],[15,54,24,25,55,25],[23,45,15,25,46,16],[13,145,115,3,146,116],[2,74,46,29,75,47],[42,54,24,1,55,25],[23,45,15,28,46,16],[17,145,115],[10,74,46,23,75,47],[10,54,24,35,55,25],[19,45,15,35,46,16],[17,145,115,1,146,116],[14,74,46,21,75,47],[29,54,24,19,55,25],[11,45,15,46,46,16],[13,145,115,6,146,116],[14,74,46,23,75,47],[44,54,24,7,55,25],[59,46,16,1,47,17],[12,151,121,7,152,122],[12,75,47,26,76,48],[39,54,24,14,55,25],[22,45,15,41,46,16],[6,151,121,14,152,122],[6,75,47,34,76,48],[46,54,24,10,55,25],[2,45,15,64,46,16],[17,152,122,4,153,123],[29,74,46,14,75,47],[49,54,24,10,55,25],[24,45,15,46,46,16],[4,152,122,18,153,123],[13,74,46,32,75,47],[48,54,24,14,55,25],[42,45,15,32,46,16],[20,147,117,4,148,118],[40,75,47,7,76,48],[43,54,24,22,55,25],[10,45,15,67,46,16],[19,148,118,6,149,119],[18,75,47,31,76,48],[34,54,24,34,55,25],[20,45,15,61,46,16]],getRSBlocks:function(a,b){var c=j.getRsBlockTable(a,b);if(void 0==c)throw Error("bad rs block @ typeNumber:"+a+"/errorCorrectLevel:"+b);for(var d=c.length/3,e=[],f=0;f<d;f++)for(var g=c[3*f],h=c[3*f+1],i=c[3*f+2],k=0;k<g;k++)e.push({totalCount:h,dataCount:i});return e},getRsBlockTable:function(a,b){switch(b){case c.L:return j.RS_BLOCK_TABLE[4*(a-1)];case c.M:return j.RS_BLOCK_TABLE[4*(a-1)+1];case c.Q:return j.RS_BLOCK_TABLE[4*(a-1)+2];case c.H:return j.RS_BLOCK_TABLE[4*(a-1)+3]}}},k=function(){this.buffer=[];this.length=0};k.prototype={get:function(a){return 1==(this.buffer[Math.floor(a/8)]>>>7-a%8&1)},put:function(a,b){for(var c=0;c<b;c++)this.putBit(1==(a>>>b-c-1&1))},getLengthInBits:function(){return this.length},putBit:function(a){0==Math.floor(this.length/8)-this.buffer.length+1&&this.buffer.push(0);a&&(this.buffer[Math.floor(this.length/8)]|=128>>>this.length%8);this.length++}};return b}();
function generateQR(t,cv,s){s=s||200;var q;for(var i=1;i<=40;i++){try{q=new QRCode(i,0);q.addData(t);q.make();break}catch(e){continue}}var x=cv.getContext('2d'),n=q.getModuleCount(),cs=s/n;cv.width=s;cv.height=s;x.fillStyle='#fff';x.fillRect(0,0,s,s);x.fillStyle='#0f172a';for(var r=0;r<n;r++)for(var c=0;c<n;c++)if(q.isDark(r,c))x.fillRect(c*cs,r*cs,cs+1,cs+1)}
</script>
<script>
const COUNTRIES=[{code:"IS",name:"Iceland",flag:"\u{1F1EE}\u{1F1F8}"},{code:"DE",name:"Germany",flag:"\u{1F1E9}\u{1F1EA}"},{code:"NL",name:"Netherlands",flag:"\u{1F1F3}\u{1F1F1}"},{code:"FI",name:"Finland",flag:"\u{1F1EB}\u{1F1EE}"},{code:"NO",name:"Norway",flag:"\u{1F1F3}\u{1F1F4}"},{code:"SE",name:"Sweden",flag:"\u{1F1F8}\u{1F1EA}"},{code:"DK",name:"Denmark",flag:"\u{1F1E9}\u{1F1F0}"},{code:"ES",name:"Spain",flag:"\u{1F1EA}\u{1F1F8}"},{code:"PT",name:"Portugal",flag:"\u{1F1F5}\u{1F1F9}"},{code:"FR",name:"France",flag:"\u{1F1EB}\u{1F1F7}"},{code:"IT",name:"Italy",flag:"\u{1F1EE}\u{1F1F9}"},{code:"PL",name:"Poland",flag:"\u{1F1F5}\u{1F1F1}"},{code:"CZ",name:"Czech Republic",flag:"\u{1F1E8}\u{1F1FF}"},{code:"AT",name:"Austria",flag:"\u{1F1E6}\u{1F1F9}"},{code:"BE",name:"Belgium",flag:"\u{1F1E7}\u{1F1EA}"},{code:"IE",name:"Ireland",flag:"\u{1F1EE}\u{1F1EA}"},{code:"GB",name:"United Kingdom",flag:"\u{1F1EC}\u{1F1E7}"},{code:"GR",name:"Greece",flag:"\u{1F1EC}\u{1F1F7}"},{code:"RO",name:"Romania",flag:"\u{1F1F7}\u{1F1F4}"},{code:"HR",name:"Croatia",flag:"\u{1F1ED}\u{1F1F7}"},{code:"SI",name:"Slovenia",flag:"\u{1F1F8}\u{1F1EE}"},{code:"SK",name:"Slovakia",flag:"\u{1F1F8}\u{1F1F0}"},{code:"LT",name:"Lithuania",flag:"\u{1F1F1}\u{1F1F9}"},{code:"LV",name:"Latvia",flag:"\u{1F1F1}\u{1F1FB}"},{code:"EE",name:"Estonia",flag:"\u{1F1EA}\u{1F1EA}"}];
const DEVICE_TYPES=[{id:"screen_standby",label:"Screen on standby",icon:"\u{1F5A5}\u{FE0F}",watts:15},{id:"projector_empty",label:"Projector on \u2013 empty room",icon:"\u{1F4FD}\u{FE0F}",watts:280},{id:"lights_empty",label:"Lights on \u2013 empty room",icon:"\u{1F4A1}",watts:120},{id:"computer_idle",label:"Computer on \u2013 nobody using",icon:"\u{1F4BB}",watts:80},{id:"printer_standby",label:"Printer on standby",icon:"\u{1F5A8}\u{FE0F}",watts:10},{id:"charger_empty",label:"Charger plugged in \u2013 nothing charging",icon:"\u{1F50C}",watts:5},{id:"coffee_on",label:"Coffee machine on \u2013 nobody using",icon:"\u2615",watts:1000},{id:"heater_open",label:"Heater on \u2013 window open",icon:"\u{1F525}",watts:1500},{id:"ventilation",label:"Ventilation in empty room",icon:"\u{1F300}",watts:200},{id:"tv_standby",label:"TV on standby",icon:"\u{1F4FA}",watts:12},{id:"water_heater",label:"Water heater \u2013 unnecessary",icon:"\u{1F6BF}",watts:2000},{id:"other",label:"Other",icon:"\u26A1",watts:50}];
const GAME_URL=window.location.origin;

async function apiGet(){return(await fetch("/api/data")).json()}
async function apiPost(d){return(await fetch("/api/data",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(d)})).json()}
function genId(){return Math.random().toString(36).substr(2,9)+Date.now().toString(36)}
function fmtW(w){return w>=1000?(w/1000).toFixed(1)+" kW":w+" W"}

let currentScreen="welcome",currentTeam=null,gameData={teams:[],findings:{}},refreshInterval=null;
const app=document.getElementById("app");

function navigate(s,t){currentScreen=s;if(t!==undefined)currentTeam=t;if(refreshInterval){clearInterval(refreshInterval);refreshInterval=null}render()}
async function refreshData(){gameData=await apiGet()}
async function render(){await refreshData();switch(currentScreen){case"welcome":renderWelcome();break;case"setup":renderSetup();break;case"rejoin":renderRejoin();break;case"hunting":renderHunting();break;case"results":renderResults();break;case"admin":renderAdmin();break}}

function renderWelcome(){
  const tc=gameData.teams.length;
  app.innerHTML='<div class="hero"><div class="hero-icon">\u26A1</div><h1 class="hero-title">THE ENERGY THIEF</h1><h2 class="hero-sub">Find the hidden energy waste</h2><div class="hero-divider"></div><p class="hero-desc">Energy is being wasted all around us every day \u2014 screens on standby, lights in empty rooms, computers nobody is using. In this game you become energy detectives and hunt down the energy thieves hiding in the school.</p><div class="mission-box"><div class="mission-icon">\u{1F50D}</div><div><strong class="mission-title">Your mission:</strong><p class="mission-text">Walk around the school with an energy meter and find devices that waste energy. Log everything you find \u2014 the team that finds the most energy waste wins!</p></div></div></div><div class="rules-grid"><div class="rule-card"><span class="rule-num">01</span><span class="rule-icon">\u{1F465}</span><div class="rule-title">Create a team</div><div class="rule-text">Pick your country and name your team</div></div><div class="rule-card"><span class="rule-num">02</span><span class="rule-icon">\u{1F50E}</span><div class="rule-title">Search</div><div class="rule-text">Walk around the school and find energy thieves</div></div><div class="rule-card"><span class="rule-num">03</span><span class="rule-icon">\u{1F4DD}</span><div class="rule-title">Log</div><div class="rule-text">Record device type, location, and measured watts</div></div><div class="rule-card"><span class="rule-num">04</span><span class="rule-icon">\u{1F3C6}</span><div class="rule-title">Win!</div><div class="rule-text">The team that finds the most energy waste wins</div></div></div><div class="btn-group"><button class="btn btn-primary" onclick="navigate(\'setup\')">\u26A1 Create team</button>'+(tc>0?'<button class="btn btn-secondary" onclick="navigate(\'rejoin\')">\u{1F465} Rejoin team<span class="badge">'+tc+'</span></button>':'')+'</div><div style="height:12px"></div><div class="btn-group"><button class="btn btn-secondary" onclick="navigate(\'results\')">\u{1F4CA} Leaderboard</button></div><div class="qr-section" id="qrSection"></div><button class="admin-link" onclick="navigate(\'admin\')">\u2699\uFE0F</button>';
  setTimeout(function(){var s=document.getElementById("qrSection");if(s&&GAME_URL.startsWith("http")){s.innerHTML='<canvas id="qrCanvas"></canvas><div class="qr-label">Scan to join the game</div><div class="qr-url">'+GAME_URL+'</div>';generateQR(GAME_URL,document.getElementById("qrCanvas"),180)}},50);
}

function renderRejoin(){
  var h='<button class="btn-back" onclick="navigate(\'welcome\')">\u2190 Back</button><h2 class="setup-title">Rejoin your team</h2><p style="color:#94a3b8;font-size:14px;margin-bottom:16px">Select your team to continue logging energy thieves:</p><div class="team-select-grid">';
  gameData.teams.forEach(function(t){var f=gameData.findings[t.id]||[];var w=f.reduce(function(s,x){return s+x.watts},0);h+='<button class="team-select-btn" onclick="rejoinTeam(\''+t.id+'\')"><span class="team-select-flag">'+t.country.flag+'</span><div><div class="team-select-name">'+t.name+'</div><div class="team-select-country">'+t.country.name+'</div></div><div class="team-select-stats"><strong>'+fmtW(w)+'</strong>'+f.length+' found</div></button>'});
  h+='</div>';app.innerHTML=h;
}
window.rejoinTeam=function(id){var t=gameData.teams.find(function(x){return x.id===id});if(t)navigate("hunting",t)};

function renderSetup(){
  var selectedCountry=null;
  app.innerHTML='<button class="btn-back" onclick="navigate(\'welcome\')">\u2190 Back</button><h2 class="setup-title">Create a team</h2><div class="form-group"><label class="label">Team name</label><input class="input" type="text" id="teamNameInput" placeholder="e.g. Volt Vikings" maxlength="30"></div><div class="form-group"><label class="label">Country</label><input class="input" type="text" id="countrySearch" placeholder="\u{1F50D} Search country..." style="margin-bottom:10px"><div class="country-grid" id="countryGrid"></div></div><button class="btn btn-primary btn-full" id="createBtn" disabled>\u26A1 Start hunting!</button>';
  var grid=document.getElementById("countryGrid"),search=document.getElementById("countrySearch"),createBtn=document.getElementById("createBtn"),nameInput=document.getElementById("teamNameInput");
  function rc(f){var list=f?COUNTRIES.filter(function(c){return c.name.toLowerCase().includes(f.toLowerCase())}):COUNTRIES;grid.innerHTML=list.map(function(c){return'<button class="country-btn" data-code="'+c.code+'" onclick="selectCountry(\''+c.code+'\')"><span class="country-flag">'+c.flag+'</span><span>'+c.name+'</span></button>'}).join("")}
  rc("");search.addEventListener("input",function(){rc(search.value)});
  window.selectCountry=function(code){selectedCountry=COUNTRIES.find(function(c){return c.code===code});grid.querySelectorAll(".country-btn").forEach(function(b){b.classList.remove("selected")});grid.querySelector('[data-code="'+code+'"]').classList.add("selected");ub()};
  function ub(){createBtn.disabled=!(nameInput.value.trim()&&selectedCountry)}nameInput.addEventListener("input",ub);
  createBtn.addEventListener("click",async function(){if(!nameInput.value.trim()||!selectedCountry)return;createBtn.disabled=true;createBtn.textContent="Creating...";var team={id:genId(),name:nameInput.value.trim(),country:selectedCountry,createdAt:new Date().toISOString()};var data=await apiGet();data.teams.push(team);data.findings[team.id]=[];await apiPost(data);navigate("hunting",team)});
}

function renderHunting(){
  var team=currentTeam,findings=gameData.findings[team.id]||[],tw=findings.reduce(function(s,f){return s+f.watts},0);
  var fl=findings.length===0?'<div class="empty-state"><div class="empty-icon">\u{1F50D}</div><p class="empty-text">No energy thieves logged yet</p><p class="empty-sub">Go explore the school and find them!</p></div>':findings.slice().reverse().map(function(f){return'<div class="finding-card"><div class="finding-icon">'+f.icon+'</div><div class="finding-info"><strong class="finding-device">'+f.deviceLabel+'</strong><span class="finding-location">\u{1F4CD} '+f.location+'</span>'+(f.notes?'<span class="finding-notes">\u{1F4AC} '+f.notes+'</span>':'')+'</div><div class="finding-right"><span class="finding-watts">'+f.watts+'W</span><span class="'+(f.measured?'finding-measured':'finding-estimated')+'">'+(f.measured?'\u{1F4D0} measured':'\u2248 estimated')+'</span><button class="finding-del" onclick="deleteFinding(\''+f.id+'\')">\u{1F5D1}\uFE0F</button></div></div>'}).join("");
  app.innerHTML='<div class="header-row"><button class="btn-back" onclick="navigate(\'welcome\')">\u2190 Home</button><button class="btn-back" onclick="navigate(\'results\')" style="border:1px solid #334155;padding:5px 10px;border-radius:8px">\u{1F4CA} Leaderboard</button></div><div class="team-banner"><span class="team-flag">'+team.country.flag+'</span><div><div class="team-name">'+team.name+'</div><div class="team-country">'+team.country.name+'</div></div></div><div class="stats-row"><div class="stat-card"><span class="stat-value">'+findings.length+'</span><span class="stat-label">Energy thieves found</span></div><div class="stat-card highlight"><span class="stat-value">'+fmtW(tw)+'</span><span class="stat-label">Total waste</span></div></div><div class="action-row"><button class="btn btn-primary" onclick="showAddForm()">+ Log energy thief</button><button class="btn-icon" onclick="render()">\u{1F504}</button></div><div id="findingsList">'+fl+'</div><div id="modalContainer"></div>';
  refreshInterval=setInterval(async function(){await refreshData()},10000);
}

window.showAddForm=function(){
  var sel=null,modal=document.getElementById("modalContainer");
  var dg=DEVICE_TYPES.map(function(d){return'<button class="device-btn" data-id="'+d.id+'" onclick="selectDevice(\''+d.id+'\')"><span class="device-icon">'+d.icon+'</span><span class="device-label">'+d.label+'</span><span class="device-watts">~'+d.watts+'W</span></button>'}).join("");
  modal.innerHTML='<div class="overlay" onclick="if(event.target===this)closeModal()"><div class="modal"><div class="modal-header"><h3 class="modal-title">Log energy thief</h3><button class="modal-close" onclick="closeModal()">\u2715</button></div><div class="form-group"><label class="label">Device type</label><div class="device-grid" id="deviceGrid">'+dg+'</div></div><div id="customFields" style="display:none"><div class="form-group"><label class="label">Device description</label><input class="input" type="text" id="customLabel" placeholder="What device is this?"></div></div><div class="form-group" id="wattsGroup" style="display:none"><label class="label">Power consumption (watts)</label><div class="watts-row"><input class="watts-input" type="number" id="wattsInput" placeholder="\u2014" min="0"><span class="watts-unit">W</span><span class="watts-hint" id="wattsHint"></span></div><div style="margin-top:6px;font-size:11px;color:#64748b">Enter the reading from your energy meter, or leave blank to use the estimate</div></div><div class="form-group"><label class="label">Location</label><input class="input" type="text" id="locationInput" placeholder="e.g. Room 204, hallway 2nd floor"></div><div class="form-group"><label class="label">Note (optional)</label><input class="input" type="text" id="notesInput" placeholder="e.g. Has been on standby all weekend"></div><button class="btn btn-primary btn-full" id="submitFinding" disabled>\u26A1 Log energy thief</button></div></div>';
  window.selectDevice=function(id){sel=DEVICE_TYPES.find(function(d){return d.id===id});document.querySelectorAll(".device-btn").forEach(function(b){b.classList.remove("selected")});document.querySelector('.device-btn[data-id="'+id+'"]').classList.add("selected");document.getElementById("customFields").style.display=id==="other"?"block":"none";document.getElementById("wattsGroup").style.display="block";document.getElementById("wattsInput").placeholder=sel.watts;document.getElementById("wattsHint").textContent="Estimate: ~"+sel.watts+"W";us()};
  function us(){var loc=document.getElementById("locationInput").value.trim();document.getElementById("submitFinding").disabled=!(sel&&loc)}
  document.getElementById("locationInput").addEventListener("input",us);
  document.getElementById("submitFinding").addEventListener("click",async function(){if(!sel)return;var loc=document.getElementById("locationInput").value.trim();if(!loc)return;var btn=document.getElementById("submitFinding");btn.disabled=true;btn.textContent="Saving...";var wv=document.getElementById("wattsInput").value,cl=document.getElementById("customLabel"),hm=wv&&Number(wv)>0;var finding={id:genId(),deviceType:sel.id,deviceLabel:sel.id==="other"&&cl&&cl.value?cl.value:sel.label,icon:sel.icon,location:loc,watts:hm?Number(wv):sel.watts,measured:hm,notes:document.getElementById("notesInput").value.trim(),timestamp:new Date().toISOString()};var data=await apiGet();if(!data.findings[currentTeam.id])data.findings[currentTeam.id]=[];data.findings[currentTeam.id].push(finding);await apiPost(data);closeModal();render()});
};
window.closeModal=function(){document.getElementById("modalContainer").innerHTML=""};
window.deleteFinding=async function(fid){var data=await apiGet();data.findings[currentTeam.id]=(data.findings[currentTeam.id]||[]).filter(function(f){return f.id!==fid});await apiPost(data);render()};

function renderResults(){
  var ts=gameData.teams.map(function(t){var f=gameData.findings[t.id]||[];return Object.assign({},t,{findings:f,totalWatts:f.reduce(function(s,x){return s+x.watts},0),count:f.length,measured:f.filter(function(x){return x.measured}).length})}).sort(function(a,b){return b.totalWatts-a.totalWatts});
  var gt=ts.reduce(function(s,t){return s+t.totalWatts},0),gc=ts.reduce(function(s,t){return s+t.count},0),akwh=(gt*8*250)/1000,mxw=ts.length>0?ts[0].totalWatts:1;
  var insight="";if(gt>0){var extra="";if(akwh>1000)extra=" That's enough to heat about "+Math.round(akwh/18000)+" homes for a year!";else if(akwh>100)extra=" That's enough to charge a phone "+Math.round(akwh/0.012)+" times!";else extra=" Keep searching \u2014 more energy thieves are hiding in the school!";insight='<div class="insight-box"><div class="insight-title">\u{1F4A1} Did you know?</div><p class="insight-text">The energy waste you found ('+fmtW(gt)+') equals about '+akwh.toFixed(0)+' kWh per year.'+extra+'</p></div>'}
  var lb=ts.length===0?'<div class="empty-state"><div class="empty-icon">\u{1F3C1}</div><p class="empty-text">No teams registered yet</p><p class="empty-sub">Waiting for teams to join!</p></div>':ts.map(function(t,i){var medal=i===0?"\u{1F947}":i===1?"\u{1F948}":i===2?"\u{1F949}":"#"+(i+1);var bw=mxw>0?(t.totalWatts/mxw)*100:0;var cats={};t.findings.forEach(function(f){if(!cats[f.deviceLabel])cats[f.deviceLabel]={count:0,watts:0,icon:f.icon};cats[f.deviceLabel].count++;cats[f.deviceLabel].watts+=f.watts});var ch=Object.entries(cats).sort(function(a,b){return b[1].watts-a[1].watts}).map(function(e){return'<span class="category-tag">'+e[1].icon+' '+e[0]+' \u00d7'+e[1].count+' ('+e[1].watts+'W)</span>'}).join("");return'<div class="leader-card"><div class="leader-top"><span class="leader-medal">'+medal+'</span><span class="leader-flag">'+t.country.flag+'</span><div class="leader-info"><strong class="leader-name">'+t.name+'</strong><span class="leader-country">'+t.country.name+' \u00b7 '+t.measured+' measured</span></div><div class="leader-score"><span class="leader-watts">'+fmtW(t.totalWatts)+'</span><span class="leader-count">'+t.count+' found</span></div></div><div class="bar-container"><div class="bar-fill" style="width:'+bw+'%"></div></div>'+(ch?'<div class="category-list">'+ch+'</div>':'')+'</div>'}).join("");
  app.innerHTML='<div class="header-row"><button class="btn-back" onclick="navigate(\''+(currentTeam?"hunting":"welcome")+'\')">\u2190 Back</button><button class="btn-icon" id="arBtn" onclick="toggleAR()">\u{1F7E2} Auto-refresh</button></div><h2 class="results-title">\u{1F4CA} Leaderboard</h2><div class="grand-stats"><div class="grand-stat"><span class="grand-val">'+ts.length+'</span><span class="grand-label">Teams</span></div><div class="grand-stat"><span class="grand-val">'+gc+'</span><span class="grand-label">Energy thieves</span></div><div class="grand-stat"><span class="grand-val">'+fmtW(gt)+'</span><span class="grand-label">Total waste</span></div><div class="grand-stat"><span class="grand-val">'+akwh.toFixed(0)+' kWh</span><span class="grand-label">Est. per year*</span></div></div><p class="footnote">* Based on 8 hrs/day, 250 working days per year</p>'+lb+insight;
  var ar=true;refreshInterval=setInterval(async function(){if(ar){await refreshData();renderResults()}},5000);
  window.toggleAR=function(){ar=!ar;var b=document.getElementById("arBtn");if(b)b.textContent=ar?"\u{1F7E2} Auto-refresh":"\u23F8 Paused"};
}

function renderAdmin(){
  app.innerHTML='<button class="btn-back" onclick="navigate(\'welcome\')">\u2190 Back</button><h2 class="setup-title">\u2699\uFE0F Admin panel</h2><div class="mission-box danger"><div class="mission-icon">\u26A0\uFE0F</div><div><strong class="mission-title" style="color:#ef4444">Clear all data</strong><p class="mission-text">This deletes all teams and findings. This cannot be undone!</p></div></div><br><div id="adminActions"><button class="btn btn-danger btn-full" onclick="confirmReset()">\u{1F5D1}\uFE0F Clear all data</button></div>';
  window.confirmReset=function(){document.getElementById("adminActions").innerHTML='<div class="confirm-row"><button class="btn btn-danger" onclick="doReset()">Yes, delete everything</button><button class="btn btn-secondary" onclick="renderAdmin()">Cancel</button></div>'};
  window.doReset=async function(){await apiPost({teams:[],findings:{}});currentTeam=null;document.getElementById("adminActions").innerHTML='<div class="mission-box success"><p style="color:#22c55e;margin:0">\u2705 All data has been cleared!</p></div>'};
}

render();
</script>
</body>
</html>`;

const server = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") { res.writeHead(200); res.end(); return; }
  if (req.method === "GET" && req.url === "/api/data") {
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify(loadData())); return;
  }
  if (req.method === "POST" && req.url === "/api/data") {
    let body = "";
    req.on("data", chunk => (body += chunk));
    req.on("end", () => {
      try { saveData(JSON.parse(body)); res.writeHead(200, { "Content-Type": "application/json" }); res.end('{"ok":true}'); }
      catch (e) { res.writeHead(400); res.end('{"error":"Invalid JSON"}'); }
    }); return;
  }
  if (req.method === "GET" && (req.url === "/" || req.url === "/index.html")) {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(HTML_PAGE); return;
  }
  res.writeHead(404); res.end("404");
});

server.listen(PORT, "0.0.0.0", () => {
  console.log("\n⚡ THE ENERGY THIEF running at http://localhost:" + PORT + "\n");
});
