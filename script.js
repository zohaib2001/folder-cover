const S = { text: '', fc: '#F5A623', tc: '#FFFFFF', bg: '#0d0d10', font: 'DM Sans', fw: 500 };

const FONTS = [
  { name: 'DM Sans',           label: 'DM Sans',  url: 'https://fonts.gstatic.com/s/dmsans/v15/rP2Hp2ywxg089UriOZQ.woff2' },
  { name: 'Plus Jakarta Sans', label: 'Jakarta',  url: 'https://fonts.gstatic.com/s/plusjakartasans/v8/LDIbaomQNQcsA88c7O9yZ4KMCoOg4Ko50a.woff2' },
  { name: 'Outfit',            label: 'Outfit',   url: 'https://fonts.gstatic.com/s/outfit/v11/QGYyz_MVcBeNP4NjuGObqx1XmO1I4TC1.woff2' },
  { name: 'Syne',              label: 'Syne',     url: 'https://fonts.gstatic.com/s/syne/v22/8vIS7w4qzmVxsWxjBZRjr0FKM_04uQ.woff2' },
  { name: 'Playfair Display',  label: 'Playfair', url: 'https://fonts.gstatic.com/s/playfairdisplay/v37/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKdFvUDQ.woff2' },
  { name: 'Fraunces',          label: 'Fraunces', url: 'https://fonts.gstatic.com/s/fraunces/v31/6NUu8FyLNQOQZAnv9bYEvDiIdE9Ea92uZmS5patqPsit.woff2' },
];

const WEIGHTS = [
  { label: 'Light',  w: 300 },
  { label: 'Medium', w: 500 },
  { label: 'Bold',   w: 700 },
  { label: 'Black',  w: 900 },
];

const PRESETS = {
  bg:     ['NONE', '#0d0d10','#1a1a2e','#2d3436','#ffffff','#f2f1ee','#f9f9fb'],
  folder: ['#F5A623','#E85D5D','#5B8EE8','#48BFA0','#9B6EE8','#E870B0','#6DBF6D','#E87A3A','#5BBFE8','#BF9B5B','#555568','#2C2C38'],
  text:   ['#FFFFFF','#111111','#1a1a2e','#F5F0E8','#FFF3E0','#E8F4FD','#FCE8F5','#E8FFF0'],
};

const canvas = document.getElementById('fc');
const ctx = canvas.getContext('2d');
const W = 1500, H = 600;
const fontLoaded = {};

function debounce(fn, ms) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

async function ensureFont(name) {
  if (fontLoaded[name]) return;
  const meta = FONTS.find(f => f.name === name);
  if (!meta) return;
  try {
    const ff = new FontFace(name, `url(${meta.url})`, { weight: '100 900' });
    document.fonts.add(await ff.load());
    await document.fonts.ready;
    fontLoaded[name] = true;
  } catch (e) { console.error('Font load failed', e); }
}

function darken(hex, amt) {
  const p = (s, o) => Math.max(0, parseInt(hex.slice(s, o), 16) - amt);
  return '#' + [p(1,3), p(3,5), p(5,7)].map(x => x.toString(16).padStart(2,'0')).join('');
}

function fitFontSize(txt, maxW, maxS, minS, font, fw) {
  let s = maxS;
  ctx.font = `${fw} ${s}px "${font}", sans-serif`;
  while (ctx.measureText(txt).width > maxW && s > minS) {
    s -= 2;
    ctx.font = `${fw} ${s}px "${font}", sans-serif`;
  }
  return s;
}

function draw() {
  ctx.clearRect(0, 0, W, H);
  if (S.bg !== 'transparent') { ctx.fillStyle = S.bg; ctx.fillRect(0, 0, W, H); }

  const fc = S.fc, dark = darken(fc, 42);
  const fW = 920, fH = 450, fX = (W - fW) / 2, fY = (H - fH) / 2 + 38, r = 32;
  const tW = 270, tH = 76, tR = 22, tX = fX + 52, tY = fY - tH + 10;

  ctx.beginPath();
  ctx.moveTo(tX+tR, tY); ctx.lineTo(tX+tW-tR, tY);
  ctx.quadraticCurveTo(tX+tW, tY, tX+tW, tY+tR);
  ctx.lineTo(tX+tW, tY+tH); ctx.lineTo(tX, tY+tH); ctx.lineTo(tX, tY+tR);
  ctx.quadraticCurveTo(tX, tY, tX+tR, tY);
  ctx.closePath(); ctx.fillStyle = dark; ctx.fill();

  ctx.beginPath();
  ctx.roundRect ? ctx.roundRect(fX, fY, fW, fH, r) : ctx.rect(fX, fY, fW, fH);
  ctx.fillStyle = fc; ctx.fill();

  if (S.text) {
    const fs = fitFontSize(S.text, fW - 120, 120, 28, S.font, S.fw);
    ctx.font = `${S.fw} ${fs}px "${S.font}", sans-serif`;
    ctx.fillStyle = S.tc; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(S.text, fX + fW / 2, fY + fH / 2 + 12);
  }
}

function updateBgPill() {
  document.getElementById('bgPill').textContent =
    S.bg === 'transparent' ? 'PNG · Transparent BG' : 'PNG · Solid BG';
}

function syncColor(key, hex6) {
  if (hex6 !== 'transparent' && !/^[0-9A-Fa-f]{6}$/.test(hex6)) return;
  const full = hex6 === 'transparent' ? 'transparent' : '#' + hex6.toUpperCase();
  S[key] = full;

  const map = {
    fc: { fill: 'fFill',  picker: 'fPicker',  hex: 'fHex',  presets: 'folderPresets', list: PRESETS.folder },
    tc: { fill: 'tFill',  picker: 'tPicker',  hex: 'tHex',  presets: 'textPresets',   list: PRESETS.text },
    bg: { fill: 'bgFill', picker: 'bgPicker', hex: 'bgHex', presets: 'bgPresets',     list: PRESETS.bg },
  };
  const m = map[key];
  const fillEl = document.getElementById(m.fill);

  if (hex6 === 'transparent') {
    fillEl.style.background = 'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAAXNSR0IArs4c6QAAACFJREFUGFdjZEACJv///2f4z8DAwMgABXABZkBEMALpAQCAtRELeUvGkQAAAABJRU5ErkJggg==")';
    document.getElementById(m.hex).value = 'NONE';
  } else {
    fillEl.style.background = full;
    document.getElementById(m.picker).value = full;
    document.getElementById(m.hex).value = hex6.toUpperCase();
  }

  buildPresets(m.presets, m.list, key);
  if (key === 'bg') updateBgPill();
  draw();
}

function setupColorPair(pickerId, hexId, swatchId, key) {
  const picker = document.getElementById(pickerId);
  document.getElementById(swatchId).onclick = () => picker.click();
  picker.oninput = e => syncColor(key, e.target.value.slice(1));
  document.getElementById(hexId).oninput = e => {
    const val = e.target.value.replace(/[^0-9A-Fa-f]/g, '').slice(0, 6);
    if (val.length === 6) syncColor(key, val);
  };
}

function buildPresets(id, list, key) {
  const wrap = document.getElementById(id);
  wrap.innerHTML = '';
  list.forEach(hex => {
    const el = document.createElement('div');
    if (hex === 'NONE') {
      el.className = 'preset none' + (S[key] === 'transparent' ? ' active' : '');
      el.innerHTML = '×';
      el.onclick = () => syncColor(key, 'transparent');
    } else {
      el.className = 'preset' + (S[key].toUpperCase() === hex.toUpperCase() ? ' active' : '');
      el.style.background = hex;
      el.onclick = () => syncColor(key, hex.slice(1));
    }
    wrap.appendChild(el);
  });
}

function buildFontGrid() {
  const grid = document.getElementById('fontGrid');
  grid.innerHTML = '';
  FONTS.forEach(f => {
    const btn = document.createElement('button');
    btn.className = 'font-btn' + (S.font === f.name ? ' on' : '');
    btn.innerHTML = `<span class="font-sample" style="font-family:'${f.name}'">Aa</span><span class="font-name">${f.label}</span>`;
    btn.onclick = async () => { S.font = f.name; buildFontGrid(); await ensureFont(f.name); draw(); };
    grid.appendChild(btn);
  });
}

function buildWeightGrid() {
  const grid = document.getElementById('weightGrid');
  grid.innerHTML = '';
  WEIGHTS.forEach(w => {
    const btn = document.createElement('button');
    btn.className = 'wbtn' + (S.fw === w.w ? ' on' : '');
    btn.style.fontWeight = w.w;
    btn.textContent = w.label;
    btn.onclick = () => { S.fw = w.w; buildWeightGrid(); draw(); };
    grid.appendChild(btn);
  });
}

const debouncedDraw = debounce(draw, 50);

document.getElementById('nameInp').oninput = e => {
  S.text = e.target.value;
  document.getElementById('charCount').textContent = `${S.text.length} chars`;
  debouncedDraw();
};

document.getElementById('dlBtn').onclick = () => {
  const btn = document.getElementById('dlBtn');
  const a = document.createElement('a');
  a.download = (S.text || 'folder').replace(/\s+/g, '-').toLowerCase() + '-notion-cover.png';
  a.href = canvas.toDataURL('image/png');
  a.click();
  btn.classList.add('success');
  btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 7l3.5 3.5L12 3"/></svg> Downloaded!`;
  setTimeout(() => {
    btn.classList.remove('success');
    btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M7 1.5v7m0 0L4.5 6m2.5 2.5L9.5 6M1.5 11.5h11"/></svg> Download PNG`;
  }, 2000);
};

document.getElementById('themeToggle').onclick = function () {
  const h = document.documentElement;
  const isDark = h.dataset.theme === 'dark';
  h.dataset.theme = isDark ? 'light' : 'dark';
  this.setAttribute('aria-pressed', String(!isDark));
};

// Init
setupColorPair('fPicker', 'fHex', 'fSwatchBtn', 'fc');
setupColorPair('tPicker', 'tHex', 'tSwatchBtn', 'tc');
setupColorPair('bgPicker', 'bgHex', 'bgSwatchBtn', 'bg');
buildPresets('folderPresets', PRESETS.folder, 'fc');
buildPresets('textPresets', PRESETS.text, 'tc');
buildPresets('bgPresets', PRESETS.bg, 'bg');
buildFontGrid();
buildWeightGrid();
ensureFont(S.font).then(draw);