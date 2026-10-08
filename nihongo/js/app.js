import { GROUPS, ALL_GROUPS, KANA, WORDS, STORIES, METHOD, TOPICS, LEVELS, LEVEL_INFO, GOALS, KANJI, KGROUPS, KANJI_MAP } from './data.js';
import { SCENES, mochi } from './illus.js';
import { STROKES } from './strokes.js';

/* ---------- Helfer ---------- */
const $ = (s, el = document) => el.querySelector(s);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const shuffle = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
const pick = (a, n) => shuffle(a).slice(0, n);
const todayStr = () => new Date().toLocaleDateString('sv');
const DAY = 864e5, INTERVALS = [0, 1, 3, 7, 14, 30, 60, 120]; // Tage je Box (1–7): nach dem Lernen +18 h, dann wachsende Abstände
const view = $('#view');

/* ---------- Zustand ---------- */
const KEY = 'mochi-nihongo-v1';
const EMPTY_DAY = () => ({ date: todayStr(), new: 0, kanji: 0, tnew: 0, input: 0, rev: 0, write: 0, pts: {}, seen: {} });
const DEFAULTS = { onboarded: false, name: '', focus: 'hira', level: 'N5', goals: ['alltag'], goalMin: 10, tracks: { script: true, lang: true },
  groupsDone: {}, srs: {}, wsrs: {}, ksrs: {}, topicsDone: {}, kanjiDone: {}, storiesRead: {}, time: {}, trace: {}, scriptTest: {}, seenLevel: 'N5', lsrs: {}, hist: {}, weekDays: 5, streak: { last: '', count: 0 },
  day: { date: '', new: 0, kanji: 0, tnew: 0, input: 0, rev: 0 }, settings: { romaji: true, sound: true, speak: true, theme: 'auto', textScript: 'both' } };
let S;
try { S = { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) || '{}') }; S.settings = { ...DEFAULTS.settings, ...S.settings }; S.tracks = { ...DEFAULTS.tracks, ...S.tracks }; S.day = { ...EMPTY_DAY(), ...S.day }; } catch { S = structuredClone(DEFAULTS); }
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch { /* privater Modus */ } };
function rollDay() { if (S.day.date !== todayStr() || typeof S.day.new === 'boolean') S.day = EMPTY_DAY(); }
function bumpStreak() {
  if (S.streak.last === todayStr()) return;
  const y = new Date(Date.now() - DAY).toLocaleDateString('sv');
  S.streak = { last: todayStr(), count: S.streak.last === y ? S.streak.count + 1 : 1 };
}
function markActivity(step) { rollDay(); if (step) S.day[step] = (+S.day[step] || 0) + 1; bumpStreak(); save(); }
const applyTheme = () => { const t = S.settings.theme; if (t === 'auto') document.documentElement.removeAttribute('data-theme'); else document.documentElement.dataset.theme = t; };
const knownKana = () => { const s = new Set(); ALL_GROUPS.forEach(g => S.groupsDone[g.id] && g.kana.forEach(k => s.add(k.k))); return s; };
const knownWords = (ks = knownKana()) => WORDS.filter(w => w.chars.length && w.chars.every(c => ks.has(c)));
const nextGroup = () => { const order = S.focus === 'hira' ? ['hira', 'kata'] : ['kata', 'hira']; for (const sc of order) { const g = GROUPS[sc].find(g => !S.groupsDone[g.id]); if (g) return g; } return null; };
const dueKanji = () => Object.entries(S.ksrs).filter(([, v]) => v.due <= Date.now()).sort((a, b) => a[1].due - b[1].due).map(([k]) => KANJI_MAP[k]).filter(Boolean);
const dueKana = () => Object.entries(S.srs).filter(([, v]) => v.due <= Date.now()).sort((a, b) => a[1].due - b[1].due).map(([k]) => KANA[k]).filter(Boolean);
function rate(k, ok, st = 'srs') {
  const e = S[st][k] || { box: 1 };
  if (ok) { e.box = Math.min(7, e.box + 1); e.due = Date.now() + INTERVALS[e.box] * DAY - 2 * 36e5; }
  else { e.box = Math.max(1, e.box - 2); e.due = Date.now() + 10 * 60 * 1000; } // Fehler: bald nochmal (Relearn)
  S[st][k] = e; save();
}
const toast = (m) => { const t = $('#toast'); t.textContent = m; t.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('on'), 2400); };

/* ---------- Sprachausgabe ---------- */
let jaVoice = null, voicesReady = false;
const refreshVoices = () => { const v = window.speechSynthesis?.getVoices?.() || []; jaVoice = v.find(x => /^ja/i.test(x.lang)) || null; voicesReady = v.length > 0; };
if ('speechSynthesis' in window) { refreshVoices(); speechSynthesis.addEventListener?.('voiceschanged', refreshVoices); }
const canSpeak = () => S.settings.sound && 'speechSynthesis' in window && !!jaVoice;
let warned = false;
function speak(text, rate = .8) {
  return new Promise(res => {
    if (!S.settings.sound || !('speechSynthesis' in window)) return res();
    if (!jaVoice) { if (!warned && voicesReady) { warned = true; toast('Kein japanischer Ton auf diesem Gerät gefunden – Romaji hilft dir.'); } return res(); }
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text); u.lang = 'ja-JP'; u.voice = jaVoice; u.rate = rate;
    const t = setTimeout(res, 6000); u.onend = u.onerror = () => { clearTimeout(t); res(); };
    speechSynthesis.speak(u);
  });
}

/* ---------- Noten & Spracherkennung ---------- */
const PASS = 67; // Note 3 oder besser
const noteOf = p => (p >= 92 ? 1 : p >= 81 ? 2 : p >= 67 ? 3 : p >= 50 ? 4 : p >= 30 ? 5 : 6);
const NOTE_TXT = ['', 'sehr gut', 'gut', 'befriedigend', 'ausreichend', 'mangelhaft', 'ungenügend'];
const gradeHtml = p => `Note <b>${noteOf(p)}</b> · ${NOTE_TXT[noteOf(p)]} · ${Math.round(p)} %`;

const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
const canListen = () => !!SR && S.settings.speak !== false;
function listen(ctl) {
  return new Promise((resolve, reject) => {
    const r = new SR(); let done = false;
    r.lang = 'ja-JP'; r.interimResults = false; r.maxAlternatives = 5; r.continuous = false;
    const fin = (fn, v) => { if (!done) { done = true; fn(v); } };
    r.onresult = e => fin(resolve, Array.from(e.results[0]).map(a => a.transcript));
    r.onerror = e => fin(reject, e.error || 'error');
    r.onnomatch = () => fin(reject, 'no-speech');
    r.onend = () => fin(reject, 'no-speech');
    if (ctl) ctl.stop = () => { try { r.stop(); } catch { /* bereits beendet */ } };
    try { r.start(); } catch (e) { fin(reject, 'error'); }
  });
}
const RM = {};
{
  const V = 'aiueo', base = { '': 'あいうえお', k: 'かきくけこ', s: 'さしすせそ', t: 'たちつてと', n: 'なにぬねの', h: 'はひふへほ', m: 'まみむめも', r: 'らりるれろ', g: 'がぎぐげご', z: 'ざじずぜぞ', d: 'だぢづでど', b: 'ばびぶべぼ', p: 'ぱぴぷぺぽ' };
  Object.entries(base).forEach(([c, row]) => [...row].forEach((k, i) => (RM[c + V[i]] = k)));
  Object.assign(RM, { ya: 'や', yu: 'ゆ', yo: 'よ', wa: 'わ', wo: 'を', n: 'ん', shi: 'し', chi: 'ち', tsu: 'つ', fu: 'ふ', ji: 'じ', sha: 'しゃ', shu: 'しゅ', sho: 'しょ', cha: 'ちゃ', chu: 'ちゅ', cho: 'ちょ', ja: 'じゃ', ju: 'じゅ', jo: 'じょ' });
  Object.entries({ k: 'き', g: 'ぎ', n: 'に', h: 'ひ', b: 'び', p: 'ぴ', m: 'み', r: 'り' }).forEach(([c, k]) => { RM[c + 'ya'] = k + 'ゃ'; RM[c + 'yu'] = k + 'ゅ'; RM[c + 'yo'] = k + 'ょ'; });
}
function romajiToKana(s) {
  s = String(s).toLowerCase().replace(/[^a-z' ]/g, ''); let out = '', i = 0;
  while (i < s.length) {
    const c = s[i];
    if (c === ' ' || c === "'") { i++; continue; }
    if (s[i + 1] === c && !'aiueon'.includes(c)) { out += 'っ'; i++; continue; }
    let hit = false;
    for (const n of [3, 2, 1]) { const sub = s.substr(i, n); if (RM[sub]) { out += RM[sub]; i += n; hit = true; break; } }
    if (!hit) i++;
  }
  return out;
}
const normKana = t => String(t).replace(/[ァ-ヶ]/g, c => String.fromCharCode(c.charCodeAt(0) - 0x60)).replace(/[\s、。！？!?,.・「」『』ー〜~]/g, '')
  .replace(/([おこそとのほもよろをごぞどぼぽ])[うお]/g, '$1').replace(/([あかさたなはまやらわがざだばぱ])あ/g, '$1').replace(/([いきしちにひみりぎじびぴ])い/g, '$1')
  .replace(/([うくすつぬふむゆるぐずづぶぷ])う/g, '$1').replace(/([えけせてねへめれげぜでべぺ])[いえ]/g, '$1');
function lev(a, b) {
  const m = a.length, n = b.length; if (!m || !n) return Math.max(m, n);
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) { const cur = [i]; for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); prev = cur; }
  return prev[n];
}
const sim = (a, b) => (a || b ? 1 - lev(a, b) / Math.max(a.length, b.length) : 0);
function speechScore(target, alts) { // 0–100: Erkennungstext gegen Zielwort (Schreibweise und Lesung)
  const tw = normKana(target.w), tr = target.r ? normKana(romajiToKana(target.r)) : '';
  let best = 0;
  for (const raw of alts) { const a = normKana(raw); best = Math.max(best, sim(a, tw), tr ? sim(a, tr) : 0); }
  return Math.round(best * 100);
}

/* ---------- Schreiben: Strichfolge, Nachzeichnen, Benotung ---------- */
const SVGNS = 'http://www.w3.org/2000/svg';
let measureSvg;
function sampleStroke(d, n = 32) {
  if (!measureSvg) { measureSvg = document.createElementNS(SVGNS, 'svg'); measureSvg.setAttribute('width', 0); measureSvg.setAttribute('height', 0); measureSvg.style.cssText = 'position:absolute;left:-9999px;top:0'; document.body.appendChild(measureSvg); }
  const p = document.createElementNS(SVGNS, 'path'); p.setAttribute('d', d); measureSvg.appendChild(p);
  const len = p.getTotalLength(), pts = [...Array(n)].map((_, i) => { const q = p.getPointAtLength(len * i / (n - 1)); return { x: q.x, y: q.y }; });
  measureSvg.removeChild(p); return pts;
}
const REF = {};
const refOf = ch => (REF[ch] ||= (STROKES[ch] || []).map((d, i) => ({ d, pts: sampleStroke(d), i })));
function resample(pts, n = 32) {
  const d = [0]; let L = 0;
  for (let i = 1; i < pts.length; i++) { L += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y); d.push(L); }
  if (!L) return Array(n).fill(pts[0]);
  const out = []; let j = 0;
  for (let k = 0; k < n; k++) { const t = L * k / (n - 1); while (j < d.length - 2 && d[j + 1] < t) j++; const f = (t - d[j]) / ((d[j + 1] - d[j]) || 1); out.push({ x: pts[j].x + (pts[j + 1].x - pts[j].x) * f, y: pts[j].y + (pts[j + 1].y - pts[j].y) * f }); }
  return out;
}
const mdist = (a, b) => a.reduce((s, p, i) => s + Math.hypot(p.x - b[i].x, p.y - b[i].y), 0) / a.length;
const fscore = d => Math.max(0, Math.min(1, 1 - (d - 6) / 20)); // ≤ 6 Einheiten = voll, ≥ 26 = 0 (Raster 109×109)
function gradeWriting(ch, strokes) {
  const ref = refOf(ch), user = strokes.map(s => resample(s)), per = [];
  const n = Math.min(ref.length, user.length);
  for (let i = 0; i < n; i++) {
    const fwd = mdist(user[i], ref[i].pts), rev = mdist(user[i], [...ref[i].pts].reverse()), f = fscore(fwd), r = fscore(rev);
    const wrongDir = r > f + .25; per.push({ score: wrongDir ? r * .4 : f, wrongDir });
  }
  const pct = ref.length ? Math.round(100 * per.reduce((s, p) => s + p.score, 0) / Math.max(ref.length, user.length)) : 0;
  return { pct, per, nRef: ref.length, nUser: user.length };
}
const writtenOK = c => (S.trace[c] || 0) >= PASS;

let W = null;
const wArrow = (pts) => { const i = Math.round(pts.length * .6), a = pts[i - 1], b = pts[i], deg = Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI; return `<path class="warrow" d="M-3.4 -2.6L3.4 0L-3.4 2.6Z" transform="translate(${b.x.toFixed(1)} ${b.y.toFixed(1)}) rotate(${deg.toFixed(0)})"/>`; };
function wNumber(r) { const a = r.pts[0], b = r.pts[3], l = Math.hypot(b.x - a.x, b.y - a.y) || 1, x = a.x - (b.x - a.x) / l * 5.5, y = a.y - (b.y - a.y) / l * 5.5, cx = Math.max(5, Math.min(104, x)), cy = Math.max(5, Math.min(104, y)); return `<g class="wnum"><circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="4.2"/><text x="${cx.toFixed(1)}" y="${(cy + .3).toFixed(1)}">${r.i + 1}</text></g>`; }
function wDrawGuide() {
  const ref = refOf(W.ch), g = $('#wg'), nn = $('#wn'); if (!g) return;
  const guide = W.mode !== 'blind';
  g.innerHTML = guide ? ref.map(r => `<path d="${r.d}" class="wgp"/>`).join('') : '';
  nn.innerHTML = guide ? ref.map(r => wArrow(r.pts) + wNumber(r)).join('') : '';
  $('#wa').innerHTML = '';
}
function wPlay() {
  const ref = refOf(W.ch), a = $('#wa'); a.innerHTML = ref.map(r => `<path d="${r.d}" class="wap" pathLength="1"/>`).join('');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  [...a.children].forEach((p, i) => { p.style.strokeDasharray = 1; p.style.strokeDashoffset = reduce ? 0 : 1; if (!reduce) p.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: 650, delay: i * 800, fill: 'forwards', easing: 'ease-in-out' }); });
}
function wSetMode(m) {
  W.mode = m; W.strokes = []; W.graded = false; $('#wu').innerHTML = ''; wDrawGuide();
  document.querySelectorAll('.wmodes button').forEach(b => b.classList.toggle('on', b.dataset.v === m));
  const show = m === 'show'; $('#wsvg').classList.toggle('locked', show);
  const cb = document.querySelector('[data-a=w-clear]'); if (cb) cb.textContent = 'Neu';
  document.querySelectorAll('.wbtns .wdraw').forEach(b => (b.hidden = show));
  $('#wfb').innerHTML = show ? 'Schau dir die Reihenfolge an: Zahlen zeigen den Start, Pfeile die Richtung.' : m === 'trace' ? 'Fahre die Striche der Reihe nach nach – dann „Prüfen“.' : 'Schreibe das Zeichen aus dem Kopf – dann „Prüfen“.';
  if (show) wPlay();
}
function mountWriter(box, ch, { mode = 'show', modes = true, onGraded } = {}) {
  W = { ch, mode, strokes: [], onGraded, graded: false, cur: null };
  box.innerHTML = `<div class="writer">${modes ? `<div class="wmodes">${[['show', 'Reihenfolge'], ['trace', 'Nachzeichnen'], ['blind', 'Aus dem Kopf']].map(([v, l]) => `<button data-a="w-mode" data-v="${v}">${l}</button>`).join('')}</div>` : ''}
    <svg id="wsvg" class="wsvg" viewBox="0 0 109 109" role="img" aria-label="Schreibfläche"><g class="wgrid"><rect x=".5" y=".5" width="108" height="108"/><path d="M54.5 0V109M0 54.5H109"/></g><g id="wg"></g><g id="wn"></g><g id="wa"></g><g id="wu"></g></svg>
    <div class="wfb" id="wfb" aria-live="polite"></div>
    <div class="row wbtns" style="justify-content:center"><button class="btn sm" data-a="w-play">▶ Abspielen</button><button class="btn sm wdraw" data-a="w-undo">↶ Zurück</button><button class="btn sm wdraw" data-a="w-clear">Neu</button><button class="btn sm primary wdraw" data-a="w-check">Prüfen</button></div></div>`;
  const svg = $('#wsvg'), pt = e => { const r = svg.getBoundingClientRect(); return { x: (e.clientX - r.left) / r.width * 109, y: (e.clientY - r.top) / r.height * 109 }; };
  svg.onpointerdown = e => { if (W.mode === 'show' || W.graded) return; e.preventDefault(); svg.setPointerCapture(e.pointerId); const p = document.createElementNS(SVGNS, 'polyline'); p.setAttribute('class', 'wup'); $('#wu').appendChild(p); W.cur = { pts: [pt(e)], el: p }; };
  svg.onpointermove = e => { if (!W.cur) return; W.cur.pts.push(pt(e)); W.cur.el.setAttribute('points', W.cur.pts.map(q => q.x.toFixed(1) + ',' + q.y.toFixed(1)).join(' ')); };
  svg.onpointerup = svg.onpointercancel = () => {
    if (!W.cur) return; const c = W.cur; W.cur = null;
    const len = c.pts.reduce((s, p, i) => s + (i ? Math.hypot(p.x - c.pts[i - 1].x, p.y - c.pts[i - 1].y) : 0), 0);
    if (len < 2.5) { c.el.remove(); return; } W.strokes.push(c.pts);
  };
  wSetMode(mode);
}
function wCheck() {
  if (W.graded) return; if (!W.strokes.length) return toast('Zeichne zuerst das Zeichen 🙂');
  const g = gradeWriting(W.ch, W.strokes); W.graded = true;
  S.trace[W.ch] = Math.max(S.trace[W.ch] || 0, g.pct); markActivity(); if (g.pct >= PASS) { S.day.write = (S.day.write || 0) + 1; addPoint('schreiben', 'w:' + W.ch, W.ch); }
  const ref = refOf(W.ch); $('#wg').innerHTML = ref.map(r => `<path d="${r.d}" class="wgp"/>`).join(''); $('#wn').innerHTML = ref.map(r => wArrow(r.pts) + wNumber(r)).join('');
  [...$('#wu').children].forEach((el, i) => { const s = g.per[i]; el.setAttribute('class', 'wup ' + (!s ? 'bad' : s.score >= .7 ? 'good' : s.score >= .4 ? 'mid' : 'bad')); });
  const notes = []; if (g.nUser !== g.nRef) notes.push(`Du hast ${g.nUser} statt ${g.nRef} Striche gezeichnet.`);
  g.per.forEach((s, i) => { if (s.wrongDir) notes.push(`Strich ${i + 1}: Richtung umgekehrt.`); });
  $('#wfb').innerHTML = `<b>${gradeHtml(g.pct)}</b>${g.pct >= PASS ? ' ✔' : ''}<br><span class="small">${notes.join(' ') || (g.pct >= PASS ? 'Sauber geschrieben!' : 'Achte auf Form und Länge der Striche.')}</span>`;
  document.querySelectorAll('.wbtns .wdraw').forEach(b => { if (b.dataset.a !== 'w-clear') b.hidden = true; }); document.querySelector('[data-a=w-clear]').textContent = 'Nochmal';
  W.onGraded?.(g);
}
function openWriter(ch) {
  const sh = $('#sheet'), k = KANA[ch], kj = KANJI_MAP[ch];
  sh.innerHTML = `<div class="between row"><span class="chip">${k ? (k.script === 'hira' ? 'Hiragana' : 'Katakana') + ' · ' + k.r : 'Kanji · ' + esc(kj.de)}</span><button class="icon-btn" data-a="close" aria-label="Schließen">✕</button></div><div id="wbox"></div>
    <p class="small muted" style="text-align:center;margin:6px 0 0">Bestes Ergebnis: ${S.trace[ch] != null ? gradeHtml(S.trace[ch]) : 'noch nicht geschrieben'}</p>`;
  if (!sh.open) sh.showModal(); mountWriter($('#wbox'), ch, { mode: 'show' });
}
// Vollbild-Schreibübung (Folge von Zeichen)
let WS = null;
function startWrite(chars, { mode = 'trace', title = 'Schreiben', onDone } = {}) {
  if (!chars.length) { toast('Noch keine Zeichen zum Schreiben.'); location.hash = backTo; return; }
  WS = { chars, i: 0, scores: [], mode, onDone, title }; renderWriteStep();
}
function renderWriteStep() {
  const ch = WS.chars[WS.i], k = KANA[ch], kj = KANJI_MAP[ch], last = WS.i === WS.chars.length - 1;
  view.innerHTML = `<div class="ltop"><button class="icon-btn" data-a="quit" aria-label="Beenden">✕</button><div class="bar"><i style="width:${WS.i / WS.chars.length * 100}%"></i></div><span class="chip">✍️ ${WS.i + 1}/${WS.chars.length}</span></div>
    <div class="card" style="text-align:center"><div class="row" style="justify-content:center;gap:10px"><span style="font-size:2rem">${k ? k.e : '漢'}</span><b style="font-size:1.2rem">${k ? k.r : esc(kj.de)}</b>${WS.mode === 'blind' ? '<span class="chip">aus dem Kopf</span>' : ''}</div>
      <div id="wbox"></div></div><button class="btn primary block pin" id="wnext" data-a="w-next" style="visibility:hidden">${last ? 'Ergebnis' : 'Weiter'}</button>`;
  mountWriter($('#wbox'), ch, { mode: WS.mode, modes: false, onGraded: g => { WS.scores[WS.i] = Math.max(WS.scores[WS.i] || 0, g.pct); $('#wnext').style.visibility = 'visible'; } });
}
function writeNext() {
  if (WS.i < WS.chars.length - 1) { WS.i++; return renderWriteStep(); }
  const avg = WS.scores.reduce((a, b) => a + b, 0) / WS.chars.length, w = WS; WS = null;
  w.onDone ? w.onDone({ pct: avg, scores: w.scores, chars: w.chars }) : (location.hash = backTo);
}

/* ---------- Router ---------- */
let backTo = '#/home';
function route() {
  stopStory();
  const [, p1 = 'home', p2] = location.hash.split('/');
  if (!S.onboarded && p1 !== 'onboarding') { location.hash = '#/onboarding'; return; }
  rollDay();
  const focus = ['onboarding', 'lesson', 'review', 'topic', 'wreview', 'kanji', 'kreview', 'stest', 'write', 'skill'].includes(p1);
  backTo = ['topic', 'wreview'].includes(p1) ? '#/read' : ['lesson', 'kanji', 'kreview', 'stest', 'write'].includes(p1) ? '#/kana' : '#/home';
  document.body.classList.toggle('focus', focus);
  const tab = { lesson: 'kana', kanji: 'kana', kreview: 'kana', topic: 'read', wreview: 'read', review: 'kana', stest: 'kana', write: 'kana', skill: 'home' }[p1] || p1;
  document.querySelectorAll('#tabs a').forEach(a => a.classList.toggle('on', a.dataset.tab === tab));
  const R = { home: viewHome, kana: () => viewKana(), lesson: () => startLesson(p2), review: () => startReview(p2 === 'free'), topic: () => startTopic(p2), wreview: () => startWordReview(p2 === 'free'),
    kanji: () => startKanji(p2), kreview: () => startKanjiReview(p2 === 'free'), stest: () => scriptTest(p2 || 'hira'), write: () => writePractice(p2 || 'hira'), skill: () => startSkill(p2),
    read: () => (p2 ? viewStory(p2) : viewReadList()), method: viewMethod, settings: viewSettings, onboarding: () => viewOnboarding(0) };
  (R[p1] || viewHome)(); view.scrollTo?.(0, 0);
}
addEventListener('hashchange', route);

/* ---------- Onboarding ---------- */
const ONB = [
  { s: 'welcome', t: 'Willkommen bei Mochi! 🍡', p: 'Ich bin Mochi und begleite dich beim Japanischlernen. Hier gibt es keine Prüfungen und keinen Druck – nur Entdecken, Hören, Lesen und Spaß.' },
  { s: 'acquire', t: 'Sprache wächst – sie wird nicht gepaukt', p: 'Der Linguist <b>Stephen Krashen</b> hat gezeigt: Wir <b>erwerben</b> eine Sprache, indem wir sie <b>verstehen</b> – genau wie Kinder. Deshalb lernst du hier über Bilder, Klang und echte Wörter statt über Regeltabellen.' },
  { s: 'step', t: 'Immer eine Stufe weiter: i + 1', p: 'Alles, was du siehst, ist <b>fast</b> verständlich: Das, was du schon kennst (<b>i</b>), plus <b>eine kleine neue Stufe</b>. Zu leicht langweilt, zu schwer stresst – Mochi sucht den Punkt dazwischen.' },
  { s: 'filter', t: 'Entspannt lernen öffnet das Tor', p: 'Angst und Druck wirken wie ein <b>Filter</b>, der Neues blockiert. Darum gibt es hier keine Timer, keine Leben und keine roten Fehler. Ein Fehler heißt einfach: „Fast!“' },
  { s: 'listen', t: 'Erst zuhören, dann ausprobieren', p: 'Du musst nichts sprechen oder schreiben, bevor du dich bereit fühlst. Jede Lektion beginnt mit Schauen und Hören. Dein Gehirn macht den Rest – ganz nebenbei.' },
  { s: 'path', t: 'So sieht dein Tag aus', p: 'Jeden Tag gibt es <b>drei kleine Schritte</b> (zusammen etwa 10 Minuten): 🎧 eine kurze Geschichte hören &amp; lesen, 🌱 eine neue Zeichengruppe entdecken, 🔁 sanft wiederholen, was fällig ist.' },
];
let onbStep = 0;
const onbData = { script: true, lang: true, focus: 'hira', goals: ['alltag'], lvl: 'new', goalMin: 10, name: '' };
const LVL_OPTS = [
  { id: 'new', t: 'Ganz neu', d: 'Ich fange bei Null an', level: 'N5', kana: false },
  { id: 'kana', t: 'Ich kann Kana', d: 'Hiragana & Katakana sitzen', level: 'N5', kana: true },
  { id: 'n4', t: 'Grundkenntnisse', d: 'etwa N4 – einfache Sätze', level: 'N4', kana: true },
  { id: 'n3', t: 'Mittelstufe', d: 'etwa N3 – Alltag & Texte', level: 'N3', kana: true },
  { id: 'n2', t: 'Fortgeschritten', d: 'etwa N2 und höher', level: 'N2', kana: true },
];
function viewOnboarding(i) {
  onbStep = i; const n = ONB.length, D = onbData, nav = (label, back = true) => `<div class="row" style="gap:10px">${back ? '<button class="btn" data-a="onb-back">←</button>' : ''}<button class="btn primary grow" data-a="${label[1]}">${label[0]}</button></div>`;
  if (i < n) {
    const o = ONB[i];
    view.innerHTML = `<div class="onb"><div><div class="row between"><span class="chip">${i + 1} / ${n}</span><button class="btn ghost sm" data-a="onb-skip">Überspringen</button></div>
      <div class="art">${SCENES[o.s]}</div><h1>${o.t}</h1><p>${o.p}</p></div>
      <div><div class="dots">${ONB.map((_, j) => `<i class="${j === i ? 'on' : ''}"></i>`).join('')}</div>${nav([i === n - 1 ? 'Weiter' : 'Verstanden', 'onb-next'], i > 0)}</div></div>`;
  } else if (i === n) {
    view.innerHTML = `<div class="onb"><div><div class="art" style="text-align:center">${mochi({ acc: 'cheer', mood: 'cheer' }, 90)}</div>
      <h1>Dein Lernweg</h1><p>Schrift und Sprache lernst du <b>getrennt</b> – einzeln oder zusammen.</p>
      <div class="choice"><button data-a="ob-track" data-v="script" class="${D.script ? 'on' : ''}"><span class="jp">あ漢</span>Schrift<br><small class="muted">Kana &amp; Kanji</small></button><button data-a="ob-track" data-v="lang" class="${D.lang ? 'on' : ''}"><span class="jp">💬</span>Sprache<br><small class="muted">Wörter, Sätze, Geschichten</small></button></div>
      ${D.script ? `<p style="margin:14px 0 8px"><b>Erste Schrift:</b></p><div class="choice"><button data-a="ob-focus" data-v="hira" class="${D.focus === 'hira' ? 'on' : ''}"><span class="jp">あ</span>Hiragana</button><button data-a="ob-focus" data-v="kata" class="${D.focus === 'kata' ? 'on' : ''}"><span class="jp">ア</span>Katakana</button></div>` : ''}</div>
      <div>${nav(['Weiter', 'onb-next'])}</div></div>`;
  } else if (i === n + 1) {
    view.innerHTML = `<div class="onb"><div><h1>Wofür lernst du Japanisch?</h1><p>Mochi wählt Themen passend zu deinen Zielen. Mehrfachauswahl ist möglich.</p>
      <div class="goals">${GOALS.map(g => `<button data-a="ob-goal" data-v="${g.id}" class="${D.goals.includes(g.id) ? 'on' : ''}"><span>${g.e}</span>${g.t}</button>`).join('')}</div></div>
      <div>${nav(['Weiter', 'onb-next'])}</div></div>`;
  } else {
    view.innerHTML = `<div class="onb"><div><h1>Wo stehst du?</h1>
      <div class="lvls-opt">${LVL_OPTS.map(o => `<button data-a="ob-lvl" data-v="${o.id}" class="${D.lvl === o.id ? 'on' : ''}"><b>${o.t}</b><small class="muted">${o.d}</small></button>`).join('')}</div>
      <p style="margin:12px 0 6px"><b>Tagesziel:</b></p><div class="choice c4">${[5, 10, 15, 20].map(m => `<button data-a="ob-min" data-v="${m}" class="${D.goalMin === m ? 'on' : ''}">${m} Min.</button>`).join('')}</div>
      <input id="nm" class="txt" style="margin-top:12px" maxlength="20" placeholder="Dein Name (optional)" autocomplete="given-name" value="${esc(D.name)}"></div>
      <div>${nav(['Los geht’s! 🍡', 'onb-done'])}</div></div>`;
  }
}

/* ---------- Dashboard ---------- */
const isFn = w => w[2].startsWith('(');
const knownWordSet = () => new Set(Object.keys(S.wsrs));
function storyRatio(st, ks) { // Anteil bekannter Kana
  const chars = st.lines.flatMap(l => l.words.flatMap(w => [...w[0]])).filter(c => KANA[c]);
  return chars.length ? chars.filter(c => ks.has(c)).length / chars.length : 1;
}
function storyWordRatio(st, kw = knownWordSet()) { // Anteil bekannter Wörter (Funktionswörter zählen als bekannt)
  const ws = st.lines.flatMap(l => l.words);
  return ws.length ? ws.filter(w => isFn(w) || kw.has(w[0])).length / ws.length : 1;
}
const lvIdx = l => LEVELS.indexOf(l);
const tagScore = t => (S.goals.includes(t.tag) ? 1 : 0);
const countKnown = sc => GROUPS[sc].filter(g => S.groupsDone[g.id]).reduce((n, g) => n + g.kana.length, 0);
const dueWords = () => Object.entries(S.wsrs).filter(([, v]) => v.due <= Date.now()).sort((a, b) => a[1].due - b[1].due).map(([w]) => ITEMS[w]).filter(Boolean);

// Fortschritt zählt nur für bestandene Tests (Themen, Kanji-Sätze, Kana-Gruppen, Geschichten)
function lvlParts(L) {
  const P = [];
  if (S.tracks.lang) {
    const ts = TOPICS.filter(t => t.lvl === L), ss = STORIES.filter(x => x.lvl === L);
    P.push({ k: 'Themen', d: ts.filter(t => S.topicsDone[t.id]).length, t: ts.length, w: 8 }, { k: 'Geschichten', d: ss.filter(x => S.storiesRead[x.id]).length, t: ss.length, w: 5 });
  }
  if (S.tracks.script) {
    const gs = KGROUPS.filter(g => g.lvl === L);
    P.push({ k: 'Kanji', d: gs.filter(g => S.kanjiDone[g.id]).length, t: gs.length, w: 5 });
    if (L === 'N5') P.push({ k: 'Kana', d: ALL_GROUPS.filter(g => S.groupsDone[g.id]).length, t: ALL_GROUPS.length, w: 3 });
  }
  return P.filter(p => p.t);
}
function lvlPct(L) {
  if (lvIdx(L) < lvIdx(S.level)) return 100;
  const P = lvlParts(L), tot = P.reduce((a, p) => a + p.t * p.w, 0), done = P.reduce((a, p) => a + p.d * p.w, 0);
  return !tot || done >= tot ? 100 : Math.min(99, Math.round(done / tot * 100));
}
function curLevel() { for (const L of LEVELS.slice(lvIdx(S.level))) if (lvlPct(L) < 100) return L; return 'N1'; }
const allDone = () => curLevel() === 'N1' && lvlPct('N1') === 100;
const unlocked = L => lvIdx(L) <= lvIdx(curLevel());
function levelNote() {
  const key = allDone() ? 'DONE' : curLevel(), rank = k => (k === 'DONE' ? 5 : lvIdx(k)); if (rank(key) <= rank(S.seenLevel || 'N5')) return '';
  const prev = LEVELS[rank(key) - 1]; S.seenLevel = key; save();
  return `<div class="levelup">${key === 'DONE' ? '🏆 Alle Stufen geschafft – 頑張りました!' : `🎉 ${prev} geschafft! ${key} ist freigeschaltet`}</div>`;
}
function recommendedStory() {
  const cl = curLevel(), ks = knownKana(), kw = knownWordSet(), r = S.tracks.lang ? s => storyWordRatio(s, kw) : s => storyRatio(s, ks);
  const open = STORIES.filter(s => !S.storiesRead[s.id] && unlocked(s.lvl)), cur = open.filter(s => s.lvl === cl), pool = cur.length ? cur : open.length ? open : STORIES.filter(s => s.lvl === cl);
  return [...pool].sort((a, b) => Math.abs(r(a) - .8) - Math.abs(r(b) - .8))[0] || STORIES[0];
}
const nextTopic = () => TOPICS.filter(t => !S.topicsDone[t.id] && t.lvl === curLevel()).sort((a, b) => tagScore(b) - tagScore(a))[0];
const nextKanjiGroup = () => KGROUPS.find(g => !S.kanjiDone[g.id] && g.lvl === curLevel());

const LVC = ['var(--green)', 'var(--indigo)', 'var(--sun)', 'var(--accent)', 'var(--violet)'];
function ring(pct, { size = 64, sw = 7, color = 'var(--accent)', inner = '' } = {}) {
  const r = (size - sw) / 2, c = 2 * Math.PI * r, h = size / 2;
  return `<svg class="ring" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" aria-hidden="true"><circle cx="${h}" cy="${h}" r="${r}" fill="none" stroke="var(--line)" stroke-width="${sw}"/><circle class="rf" cx="${h}" cy="${h}" r="${r}" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-dasharray="${c.toFixed(1)}" stroke-dashoffset="${(c * (1 - Math.min(100, pct) / 100)).toFixed(1)}" transform="rotate(-90 ${h} ${h})"/>${inner}</svg>`;
}
const ringText = (t, size, fs, dy = 0) => `<text x="${size / 2}" y="${size / 2 + dy}" text-anchor="middle" dominant-baseline="central" style="font:800 ${fs}px var(--ui);fill:var(--ink)">${t}</text>`;
const fmt = sec => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;

function nextAction() {
  const T_ = S.tracks, d = S.day, g = nextGroup(), kg = nextKanjiGroup(), nt = nextTopic(), st = recommendedStory(), newOK = backlogCount() <= 25, A_ = [];
  if (newOK && T_.lang && !d.input && st) A_.push({ ic: '🎧', t: 'Geschichte hören', s: st.title, href: '#/read/' + st.id });
  if (newOK && T_.lang && !d.tnew && nt) A_.push({ ic: '🗣️', t: 'Neues Thema', s: `${nt.emoji} ${nt.title}`, href: '#/topic/' + nt.id });
  if (newOK && T_.script && !(d.new + d.kanji)) {
    const kana = g && { ic: 'あ', t: 'Neue Kana', s: `${g.script === 'hira' ? 'Hiragana' : 'Katakana'} · ${g.title}`, href: '#/lesson/' + g.id }, kanji = kg && { ic: '漢', t: 'Neue Kanji', s: `${kg.lvl} · Satz ${kg.n}`, href: '#/kanji/' + kg.id };
    const first = (S.goals.includes('jlpt') ? [kanji, kana] : [kana, kanji]).find(Boolean); if (first) A_.push(first);
  }
  const weak = activeSkills().filter(k => skillFrac(k) < 1).sort((a, b) => skillFrac(a) - skillFrac(b))[0];
  if (weak) A_.push({ ic: SKILLS[weak].ic, t: SKILLS[weak].n + ' üben', s: `${S.day.pts[weak] || 0}/${skillTargets()[weak]} Punkte heute`, href: '#/skill/' + weak });
  return A_[0] || { ic: '🌿', t: 'Freies Lernen', s: 'Tagesziel erreicht – weiter, wie du magst', href: '#/read' };
}

function viewHome() {
  const T_ = S.tracks, secs = S.time[todayStr()] || 0, dp = dailyPct(), tg = skillTargets(), wd = weekDates(), wGoal = S.weekDays || 5, wDone = wd.filter(x => S.hist[x]).length, wp = Math.min(100, Math.round(wDone / wGoal * 100));
  const hr = new Date().getHours(), greet = hr < 11 ? 'Ohayou' : hr < 18 ? 'Konnichiwa' : 'Konbanwa', yest = new Date(Date.now() - DAY).toLocaleDateString('sv'), d = S.day;
  const cl = curLevel(), lp = lvlPct(cl), done = allDone(), li = lvIdx(cl), na = nextAction(), backlog = backlogCount();
  const streak = S.streak.last === todayStr() || S.streak.last === yest ? S.streak.count : 0, mic = canListen();
  const sk = ['hoeren', 'lesen', 'sprechen', ...(T_.script ? ['schreiben'] : [])].map(k => {
    const f = skillFrac(k), p = d.pts[k] || 0, off = k === 'sprechen' && !mic;
    const r = ring(off ? 0 : f * 100, { size: 50, sw: 6, color: f >= 1 ? 'var(--green)' : 'var(--accent)', inner: `<text x="25" y="25" text-anchor="middle" dominant-baseline="central" style="font:700 19px var(--jp);fill:var(--ink)">${SKILLS[k].ic}</text>` });
    return off ? `<span class="sk off" title="Spracherkennung nicht verfügbar">${r}<small>${SKILLS[k].n} <span class="muted">–</span></small></span>` : `<a class="sk ${f >= 1 ? 'done' : ''}" href="#/skill/${k}">${r}<small>${SKILLS[k].n} <span class="muted">${Math.min(p, tg[k])}/${tg[k]}</span></small></a>`;
  }).join('');
  const neu = [...(T_.lang ? [['Thema', d.tnew, 1], ['Geschichte', d.input, 1]] : []), ...(T_.script ? [['Zeichen', d.new + d.kanji, 1]] : [])];
  view.innerHTML = `<div class="dboard">
    <div class="head tight"><div class="hero">${mochi({ acc: 'wave' }, 52)}<div><p class="sub">${greet}${S.name ? ', ' + esc(S.name) : ''}!</p><h1>Dashboard</h1></div></div>
      <div class="row" style="gap:8px"><span class="chip sun">🔥 ${streak}</span><button class="icon-btn" data-a="go" data-to="settings" aria-label="Einstellungen">⚙️</button></div></div>
    <div class="rings3">
      <section class="rcard"><span class="small muted">${done ? 'Geschafft' : 'Stufe'}</span>${ring(lp, { size: 84, sw: 9, color: LVC[li], inner: ringText(done ? '🏆' : lp + '%', 84, done ? 28 : 19, done ? 0 : -5) + (done ? '' : `<text x="42" y="55" text-anchor="middle" style="font:800 11px var(--ui);fill:var(--muted)">${cl}</text>`) })}<b>${done ? 'N5–N1' : LEVEL_INFO[cl]}</b><small class="muted">${done ? 'alles bestanden' : li < 4 ? 'danach ' + LEVELS[li + 1] : 'letzte Stufe'}</small></section>
      <section class="rcard"><span class="small muted">Täglich</span>${ring(dp, { size: 84, sw: 9, inner: ringText(dp + '%', 84, 20) })}<b>${dp >= 100 ? 'Geschafft 🎉' : 'Noch ' + (100 - dp) + ' %'}</b><small class="muted">${fmt(secs)} Min. aktiv</small></section>
      <section class="rcard"><span class="small muted">Woche</span>${ring(wp, { size: 84, sw: 9, color: 'var(--violet)', inner: ringText(wp + '%', 84, 20) })}<b>${wDone} von ${wGoal} Tagen</b><span class="wdots" aria-label="Tage dieser Woche">${wd.map(x => `<i class="${S.hist[x] ? 'on' : ''} ${x === todayStr() ? 'today' : ''}"></i>`).join('')}</span></section></div>
    <h3 class="sec">Heute üben <small class="muted">Punkte nur für richtige Antworten</small></h3>
    <div class="skills">${sk}</div>
    <div class="parts">${neu.map(([n, v, g]) => `<span class="chip ${v >= g ? 'green' : ''}">Neu · ${n} ${Math.min(v, g)}/${g}</span>`).join('')}${backlog ? `<span class="chip ${backlog > 25 ? 'red' : 'sun'}">${backlog} fällig</span>` : ''}</div>
    ${backlog > 25 ? '<p class="small muted" style="text-align:center;margin:6px 0 0">Viel Wiederholung offen – Neues pausiert, bis es weniger ist.</p>' : ''}
    <a class="btn primary block go" href="${na.href}"><span class="goic">${na.ic}</span><span class="gotx"><b>Weiterlernen: ${na.t}</b><small>${na.s}</small></span><span>▶</span></a></div>`;
}

/* ---------- Kana-Übersicht & Tafel ---------- */
let kanaScript = 'hira', kanaMode = 'lessons', kanjiLvl = null, langLvl = null;
const lvSeg = (cur, act) => `<div class="seg lv-seg">${LEVELS.map(l => { const lock = !unlocked(l); return `<button data-a="${lock ? 'lvlock' : act}" data-v="${l}" class="${cur === l ? 'on' : ''} ${lock ? 'lock' : ''}">${l}${lock ? ' 🔒' : ''}</button>`; }).join('')}</div>`;
function scriptStats(sc) {
  if (sc === 'kanji') { const ks = KANJI.filter(k => k.lvl === kanjiLvl); return { name: 'Kanji ' + kanjiLvl, learned: ks.filter(k => S.ksrs[k.k]).length, total: ks.length, written: ks.filter(k => writtenOK(k.k)).length, test: S.scriptTest.kanji || 0, known: Object.keys(S.ksrs).length }; }
  const all = GROUPS[sc].flatMap(g => g.kana), kn = knownKana();
  return { name: sc === 'hira' ? 'Hiragana' : 'Katakana', learned: all.filter(k => kn.has(k.k)).length, total: all.length, written: all.filter(k => writtenOK(k.k)).length, test: S.scriptTest[sc] || 0, known: [...kn].filter(c => KANA[c].script === sc).length };
}
function progressCard(sc) {
  const st = scriptStats(sc), pL = st.total ? st.learned / st.total * 100 : 0, pW = st.total ? st.written / st.total * 100 : 0;
  const blk = (label, p, txt, col) => `<div class="pr">${ring(p, { size: 62, sw: 7, color: col, inner: ringText(txt, 62, txt.length > 3 ? 13 : 15) })}<small>${label}</small></div>`;
  return `<div class="card pcard"><div class="prow">${blk(`Gelernt ${st.learned}/${st.total}`, pL, Math.round(pL) + '%', 'var(--green)')}${blk(`Geschrieben ${st.written}/${st.total}`, pW, Math.round(pW) + '%', 'var(--indigo)')}${blk('Bester Test', st.test, st.test ? 'Note ' + noteOf(st.test) : '–', 'var(--sun)')}</div>
    <div class="row" style="gap:8px;justify-content:center"><button class="btn sm" data-a="stest" data-v="${sc}">📝 Test</button><button class="btn sm" data-a="wprac" data-v="${sc}">✍️ Schreiben üben</button></div></div>`;
}
function viewKana() {
  kanjiLvl = kanjiLvl || curLevel(); const nxt = nextGroup(), isK = kanaScript === 'kanji', nkg = nextKanjiGroup();
  let body = '';
  if (isK) {
    const gs = KGROUPS.filter(g => g.lvl === kanjiLvl), dj = dueKanji().length;
    body = kanaMode === 'lessons'
      ? `${dj ? `<a class="btn block sm" style="margin-bottom:10px" href="#/kreview">🔁 ${dj} Kanji wiederholen</a>` : ''}
        ${gs.map(g => `<button class="gcard ${S.kanjiDone[g.id] ? 'done' : ''} ${nkg && nkg.id === g.id ? 'next' : ''}" data-a="go" data-to="kanji/${g.id}"><span class="num">${S.kanjiDone[g.id] ? '✔' : g.n}</span><span class="grow"><b>Satz ${g.n}</b><br><span class="glyphs">${g.items.map(k => k.k).join(' ')}</span></span>${nkg && nkg.id === g.id ? '<span class="chip red">empfohlen</span>' : S.kanjiDone[g.id] ? '<span class="chip green">gelernt</span>' : ''}</button>`).join('')}`
      : `<div class="chart">${KANJI.filter(k => k.lvl === kanjiLvl).map(k => { const e = S.ksrs[k.k]; return `<button class="tile ${e ? 'k' + Math.min(5, e.box) : 'lock'}" data-a="kanjiinfo" data-k="${k.k}"><span class="g">${k.k}</span><span class="r">${esc(k.de.split(' / ')[0])}</span></button>`; }).join('')}</div>`;
  } else {
    const gs = GROUPS[kanaScript];
    body = kanaMode === 'lessons' ? gs.map(g => `<button class="gcard ${S.groupsDone[g.id] ? 'done' : ''} ${nxt && nxt.id === g.id ? 'next' : ''}" data-a="go" data-to="lesson/${g.id}"><span class="num">${S.groupsDone[g.id] ? '✔' : g.n}</span>
        <span class="grow"><b>${g.title}</b><br><span class="glyphs">${g.kana.map(k => k.k).join(' ')}</span></span>${nxt && nxt.id === g.id ? '<span class="chip red">empfohlen</span>' : S.groupsDone[g.id] ? '<span class="chip green">gelernt</span>' : ''}</button>`).join('')
      : `<div class="chart">${gs.flatMap(g => g.kana).map(k => { const e = S.srs[k.k]; return `<button class="tile ${e ? 'k' + Math.min(5, e.box) : 'lock'}" data-a="kana" data-k="${k.k}"><span class="g">${k.k}</span><span class="r">${k.r}</span></button>`; }).join('')}</div>`;
  }
  view.innerHTML = `<div class="head tight"><div><h1>Schrift</h1><p class="sub">Kana &amp; Kanji – unabhängig von der Sprache</p></div></div>
    <div class="seg" role="tablist"><button data-a="kscript" data-v="hira" class="${kanaScript === 'hira' ? 'on' : ''}"><span class="jp">あ</span> Hiragana</button><button data-a="kscript" data-v="kata" class="${kanaScript === 'kata' ? 'on' : ''}"><span class="jp">ア</span> Katakana</button><button data-a="kscript" data-v="kanji" class="${isK ? 'on' : ''}"><span class="jp">漢</span> Kanji</button></div>
    ${isK ? lvSeg(kanjiLvl, 'klvl') : ''}${progressCard(kanaScript)}
    <div class="seg"><button data-a="kmode" data-v="lessons" class="${kanaMode === 'lessons' ? 'on' : ''}">Lektionen</button><button data-a="kmode" data-v="chart" class="${kanaMode === 'chart' ? 'on' : ''}">Tafel</button></div>${body}`;
}

/* Detail-Sheets */
function openKana(ch) {
  const k = KANA[ch], sh = $('#sheet');
  sh.innerHTML = `<div class="between row"><span class="chip">${k.script === 'hira' ? 'Hiragana' : 'Katakana'} · ${k.r}</span><button class="icon-btn" data-a="close" aria-label="Schließen">✕</button></div>
    <div class="disc"><div class="glyph" style="font-size:6rem">${k.k}</div><div class="emo" style="font-size:2.6rem">${k.e}</div><p class="hook">${esc(k.h)}</p>
    <button class="btn" data-a="say" data-t="${k.k}">🔊 Anhören</button> <button class="btn primary" data-a="writer" data-k="${k.k}">✍️ Schreiben</button>${S.trace[ch] != null ? `<p class="small muted" style="margin-top:8px">Bestes Schreiben: ${gradeHtml(S.trace[ch])}</p>` : ''}</div>`;
  sh.showModal(); speak(k.k);
}
function openKanji(ch) {
  const k = KANJI_MAP[ch], sh = $('#sheet');
  sh.innerHTML = `<div class="between row"><span class="chip">${k.lvl} · ${k.r}</span><button class="icon-btn" data-a="close" aria-label="Schließen">✕</button></div>
    <div class="disc"><div class="glyph" style="font-size:6rem">${k.k}</div><h2>${esc(k.de)}</h2><p class="hook jp"><b>${k.ex.w}</b> ${k.ex.r} – ${esc(k.ex.d)}</p><button class="btn" data-a="say" data-t="${k.ex.w}">🔊 Anhören</button> <button class="btn primary" data-a="writer" data-k="${k.k}">✍️ Schreiben</button>${S.trace[ch] != null ? `<p class="small muted" style="margin-top:8px">Bestes Schreiben: ${gradeHtml(S.trace[ch])}</p>` : ''}</div>`;
  sh.showModal(); speak(k.ex.w);
}

/* Tests & Schreibübungen auf der Schrift-Seite */
function scriptTest(sc) {
  const st = scriptStats(sc); if (st.known < 5) return toast('Lerne zuerst mindestens 5 Zeichen 🙂');
  let core, sp = [];
  if (sc === 'kanji') { const sel = pick(Object.keys(S.ksrs).map(k => KANJI_MAP[k]).filter(Boolean), 12); core = sel.map((k, i) => [qKMean, qKPick, qKWord][i % 3](k)); sp = canListen() ? pick(sel, 2).map(k => qSpeak({ w: k.ex.w, r: k.ex.r, d: k.ex.d })) : []; }
  else { const sel = pick([...knownKana()].map(c => KANA[c]).filter(k => k.script === sc), 12); core = sel.map((k, i) => [qSound, qRead, qPic][i % 3](k)); sp = canListen() ? pick(knownWords().filter(w => w.script === sc), 2).map(w => qSpeak({ w: w.w, r: w.r, d: w.d })) : []; }
  runTest({ core, speak: sp, pass: () => writePractice(sc, 'blind'), passLabel: '✍️ Schreibtest (3 Zeichen)', redo: () => scriptTest(sc),
    onRes: res => { S.scriptTest[sc] = Math.max(S.scriptTest[sc] || 0, res.pct); markActivity(); } });
}
function writePractice(sc, mode = 'trace') {
  const pool = sc === 'kanji' ? Object.keys(S.ksrs) : [...knownKana()].filter(c => KANA[c].script === sc);
  if (!pool.length) { toast('Lerne zuerst ein paar Zeichen 🙂'); location.hash = '#/kana'; return; }
  const chars = [...pool].sort((a, b) => (S.trace[a] ?? -1) - (S.trace[b] ?? -1) || Math.random() - .5).slice(0, mode === 'blind' ? 3 : 5);
  writeChars(chars, mode);
}
function writeChars(chars, mode = 'trace') {
  document.body.classList.add('focus');
  startWrite(chars, { mode, onDone: res => showResult({ pct: res.pct, n: 0, right: 0, rn: 0, sn: 0 }, { note: 'Schreibübung', pass: () => (location.hash = backTo), passLabel: 'Fertig', redo: () => writeChars(chars, mode), redoLabel: 'Nochmal schreiben' }) });
}

/* ---------- Quiz-Engine (ohne Zeitdruck, ohne Strafen) ---------- */
let Q = null;
const OK_MSG = ['Genau! ✨', 'Sehr schön!', 'Stimmt! 🌸', 'Super gemacht!', 'Das sitzt! 👏'];
function distract(k, n, extra = []) {
  const pool = [...new Set([...knownKana(), ...extra.map(x => x.k)])].map(c => KANA[c]).filter(x => x.script === k.script && x.k !== k.k);
  const more = ALL_GROUPS.filter(g => g.script === k.script).flatMap(g => g.kana).filter(x => x.k !== k.k);
  const out = []; for (const c of [...shuffle(pool), ...shuffle(more)]) { if (out.length >= n) break; if (c.r !== k.r && !out.some(o => o.r === c.r)) out.push(c); } return out;
}
const qSound = (k, extra) => ({ kind: 'sound', say: k.k, kana: k.k, hint: `${k.e} ${k.h}`, opts: shuffle([k, ...distract(k, 3, extra)]).map(o => ({ html: o.k, ok: o.k === k.k })), explain: `Das war <b>${k.k}</b> (${k.r})` });
const qRead = (k, extra) => ({ kind: 'read', big: k.k, kana: k.k, hint: `${k.e} ${k.h}`, say: k.k, opts: shuffle([k, ...distract(k, 3, extra)]).map(o => ({ html: o.r, ok: o.r === k.r })), explain: `<b>${k.k}</b> klingt wie „${k.r}“` });
const qPic = (k, extra) => ({ kind: 'pic', pic: k.e, kana: k.k, hint: k.h, say: k.k, opts: shuffle([k, ...distract(k, 3, extra)]).map(o => ({ html: o.k, ok: o.k === k.k })), explain: `${k.e} gehört zu <b>${k.k}</b> (${k.r})` });
function qWord(w, pool) {
  const others = shuffle(pool.filter(x => x.w !== w.w && x.d !== w.d)).slice(0, 2);
  return { kind: 'word', big: w.w, say: w.w, hint: `Lies Zeichen für Zeichen: ${[...w.w].map(c => KANA[c] ? KANA[c].r : '').join(' · ')}`, word: w,
    opts: shuffle([w, ...others]).map(o => ({ html: `<span class="oe">${o.e}</span><span>${esc(o.d)}</span>`, ok: o.w === w.w, txt: true })), explain: `<b>${w.w}</b> (${w.r}) = ${w.e} ${esc(w.d)}` };
}
function startQuiz(qs, onDone, topHtml = '', opt = {}) { Q = { qs, i: 0, right: 0, onDone, topHtml, ans: false, graded: !!opt.graded, n: 0, pts: 0, rn: 0, rpts: 0, sn: 0, spts: 0 }; renderQuiz(); }
const TIP_RE = /<div class="tip"[\s\S]*?<\/div>/;
const qTopHtml = () => (Q.i === 0 ? Q.topHtml : Q.topHtml.replace(TIP_RE, '')) + (Q.topHtml.includes('class="ltop"') ? '' : `<div class="ltop"><button class="icon-btn" data-a="quit" aria-label="Beenden">✕</button><div class="bar"><i style="width:${Q.i / Q.qs.length * 100}%"></i></div></div>`);
function promptHtml(q) {
  const ts = S.settings.textScript, big = (t, extra = '') => `<div class="wordbig">${t}</div>${extra}`;
  const hear = `<button class="btn sm" data-a="qsay" style="margin-top:8px">🔊 Hören</button>`;
  const hearBig = `<button class="btn" data-a="qsay" style="font-size:1.3rem;padding:18px 28px">🔊 Hören</button>`;
  const shown = q.item ? (ts === 'romaji' ? q.item.r : q.item.w) : '';
  switch (q.kind) {
    case 'sound': return `${hearBig}<p class="muted small" style="margin-top:10px">${canSpeak() ? 'Welches Zeichen hörst du?' : `Klingt wie: <b>${KANA[q.kana].r}</b>`}</p>`;
    case 'pic': return `<div class="glyph" style="font-size:clamp(3rem,10vh,4.5rem)">${q.pic}</div><p class="muted small">Welches Zeichen gehört zu diesem Bild?</p>`;
    case 'word': return `${big(q.big)}${hear}<p class="muted small" style="margin-top:8px">Was bedeutet das Wort?</p>`;
    case 'lsound': return `${hearBig}<p class="muted small" style="margin-top:10px">${canSpeak() ? 'Was bedeutet das, was du hörst?' : `Klingt wie: <b>${q.item.r}</b>`}</p>`;
    case 'lword': return `${big(shown, ts === 'both' ? `<div class="muted">${q.item.r}</div>` : '')}${hear}<p class="muted small" style="margin-top:8px">Was bedeutet das?</p>`;
    case 'kmean': return `<div class="glyph">${q.big}</div><p class="muted small">Was bedeutet dieses Zeichen?</p>`;
    case 'kpick': return `<div class="wordbig" style="font-family:var(--ui);font-size:1.7rem">${esc(q.big)}</div><p class="muted small">Welches Zeichen ist das?</p>`;
    case 'kword': return `${big(q.big)}${hear}<p class="muted small" style="margin-top:8px">Was bedeutet das Wort?</p>`;
    case 'sline': return `<div class="wordbig" style="font-size:1.45rem;line-height:1.5">${ts === 'romaji' ? esc(q.romaji) : q.big}</div>${ts === 'both' ? `<div class="muted small">${esc(q.romaji)}</div>` : ''}${hear}<p class="muted small" style="margin-top:8px">Was bedeutet der Satz?</p>`;
    case 'shear': return `${hearBig}<p class="muted small" style="margin-top:10px">Was bedeutet der Satz, den du hörst?</p>`;
    case 'sword': return `${big(ts === 'romaji' ? q.ro : q.big, ts === 'both' ? `<div class="muted">${esc(q.ro)}</div>` : '')}${hear}<p class="muted small" style="margin-top:8px">Was bedeutet das Wort?</p>`;
    default: return `<div class="glyph">${q.big}</div><p class="muted small">Wie klingt dieses Zeichen?</p>`;
  }
}
function renderQuiz() {
  const q = Q.qs[Q.i];
  if (q.kind === 'speak') return renderSpeak(q);
  view.innerHTML = `${qTopHtml()}<div class="card"><div class="prompt">${promptHtml(q)}</div>
      <div class="opts ${q.opts[0].txt ? 'col1' : ''}">${q.opts.map((o, i) => `<button class="opt ${o.txt ? 'txt' : ''}" data-a="ans" data-i="${i}">${o.html}</button>`).join('')}</div>
      <div class="fb" id="fb" aria-live="polite"></div>
      <div class="row between"><button class="btn sm ghost" data-a="hint">💡 Tipp</button><button class="btn primary" id="nxt" data-a="qnext" style="visibility:hidden">Weiter</button></div></div>`;
  Q.ans = false; if (q.kind === 'sound' || q.kind === 'lsound') setTimeout(() => speak(q.say), 250);
}
const qSpeak = target => ({ kind: 'speak', target, say: target.w, noscore: true });
function renderSpeak(q) {
  const ts = S.settings.textScript, t = q.target, shown = ts === 'romaji' ? t.r : t.w;
  view.innerHTML = `${qTopHtml()}<div class="card"><div class="prompt"><span class="chip">🎤 Aussprache · freiwillig</span><div class="wordbig" style="margin-top:8px">${esc(shown)}</div>${ts === 'both' ? `<div class="muted">${esc(t.r)}</div>` : ''}<p class="muted small">${t.d ? esc(t.d) : ''}</p>
    <div class="row" style="justify-content:center;gap:10px"><button class="btn" data-a="qsay">🔊 Vorsprechen</button><button class="btn primary" id="mic" data-a="sp-rec">🎤 Aufnehmen</button></div></div>
    <div class="fb" id="fb" aria-live="polite">Sprich das Wort nach. Deine Aussprache wird erkannt und benotet – das zählt nicht fürs Bestehen.</div>
    <div class="row between"><button class="btn sm ghost" data-a="sp-skip">Überspringen</button><button class="btn primary" id="nxt" data-a="qnext" style="visibility:hidden">Weiter</button></div></div>`;
  Q.ans = false; Q.listening = false;
}
async function recordSpeech() {
  if (!Q || Q.ans || Q.listening) return; const q = Q.qs[Q.i], mic = $('#mic'), fb = $('#fb'); Q.listening = true; Q.ctl = {};
  mic.textContent = '🎙️ Ich höre zu …'; mic.classList.add('rec'); fb.className = 'fb'; fb.textContent = 'Sprich jetzt …';
  try {
    const alts = await listen(Q.ctl), pct = speechScore(q.target, alts); if (!Q) return;
    Q.ans = true; Q.sn++; Q.spts += pct / 100; if (pct >= PASS) addPoint('sprechen', 'sp:' + q.target.w, q.target.w); fb.className = 'fb ' + (pct >= PASS ? 'ok' : 'no');
    fb.innerHTML = `Erkannt: <b>${esc(alts[0])}</b><br>Aussprache: ${gradeHtml(pct)}`; mic.textContent = '🎤 Aufgenommen'; mic.disabled = true; $('#nxt').style.visibility = 'visible';
  } catch (e) {
    if (!Q) return; mic.textContent = '🎤 Nochmal'; fb.className = 'fb no';
    fb.textContent = /not-allowed|service/.test(e) ? 'Das Mikrofon ist nicht erlaubt. Erlaube es in den Browser-Einstellungen oder überspringe die Aufgabe.' : e === 'network' ? 'Die Spracherkennung ist gerade nicht erreichbar. Du kannst überspringen.' : 'Ich habe nichts verstanden – tippe nochmal auf 🎤.';
  } finally { if (Q) { Q.listening = false; mic.classList.remove('rec'); } }
}
function answer(i) {
  if (Q.ans) return; Q.ans = true; const q = Q.qs[Q.i], btns = [...view.querySelectorAll('.opt')], ok = q.opts[i].ok;
  btns.forEach((b, j) => { b.disabled = true; if (q.opts[j].ok) b.classList.add(ok || j === i ? 'good' : 'soft'); else if (j !== i) b.classList.add('dim'); });
  const fb = $('#fb');
  if (ok) { Q.right++; fb.className = 'fb ok'; fb.innerHTML = `${OK_MSG[Math.random() * OK_MSG.length | 0]}<br><span class="small">${q.explain}</span>`; }
  else { fb.className = 'fb no'; fb.innerHTML = `Fast! 🌱 ${q.explain}.<br><span class="small muted">Kein Problem – das kommt gleich nochmal vorbei.</span>`; if (!q.retry) Q.qs.splice(Math.min(Q.qs.length, Q.i + 3), 0, { ...q, retry: true, opts: shuffle(q.opts) }); }
  if (!q.retry) {
    if (Q.graded) { if (q.review) { Q.rn++; if (ok) Q.rpts++; } else { Q.n++; if (ok) Q.pts++; } }
    if (q.kana) Q.onResult?.(q.kana, ok); if (q.wkey) Q.onWResult?.(q.wkey, ok); if (q.kkey) Q.onKResult?.(q.kkey, ok); if (q.lkey) Q.onLResult?.(q.lkey, ok);
    if (ok) { const sk = HEAR.includes(q.kind) ? 'hoeren' : READ.includes(q.kind) ? 'lesen' : null, item = q.kana || q.wkey || q.kkey || q.lkey || q.say; if (sk) addPoint(sk, q.kind + ':' + item, item); }
    if (Q.isRev) { S.day.rev++; save(); }
  }
  speak(q.say);
  const n = $('#nxt'); n.style.visibility = 'visible'; n.focus();
}
function quizResult() { return { pct: Q.n ? Q.pts / Q.n * 100 : 100, n: Q.n, right: Q.pts, rn: Q.rn, rright: Q.rpts, sn: Q.sn, spct: Q.sn ? Q.spts / Q.sn * 100 : 0 }; }
function qnext() { Q.i++; if (Q.i >= Q.qs.length) { const f = Q.onDone, res = quizResult(); Q = null; f(res); } else renderQuiz(); }

/* ---------- Tests: erst lernen, dann abfragen, dazu Wiederholungen ---------- */
const pickReview = (items, store, key, n) => { const due = items.filter(x => store[key(x)] && store[key(x)].due <= Date.now()); return [...shuffle(due), ...shuffle(items.filter(x => !due.includes(x)))].slice(0, n); };
let RES = null;
function runTest({ core, review = [], speak: sp = [], top = '', pass, redo, relearn, passLabel, onRes }) {
  startQuiz([...shuffle([...core, ...review.map(q => ({ ...q, review: true }))]), ...sp], res => { onRes?.(res); showResult(res, { pass, redo, relearn, passLabel }); }, top, { graded: true });
  Q.onResult = (k, ok) => { if (S.srs[k]) rate(k, ok); };
  Q.onWResult = (w, ok) => { if (S.wsrs[w]) rate(w, ok, 'wsrs'); };
  Q.onKResult = (k, ok) => { if (S.ksrs[k]) rate(k, ok, 'ksrs'); };
  Q.onLResult = (k, ok) => { if (S.lsrs[k]) rate(k, ok, 'lsrs'); };
}
function showResult(res, o) {
  const pass = res.pct >= PASS; RES = { o, res }; document.body.classList.add('focus');
  const lines = [res.n ? `Neu gelernt: ${Math.round(res.right)} von ${res.n} richtig` : '', res.rn ? `Wiederholung: ${Math.round(res.rright)} von ${res.rn} richtig` : '', res.sn ? `Aussprache: ${gradeHtml(res.spct)}` : '', o.note || ''].filter(Boolean);
  view.innerHTML = `<div class="party card"><div class="art">${ring(res.pct, { size: 112, sw: 11, color: pass ? 'var(--green)' : 'var(--sun)', inner: ringText('Note ' + noteOf(res.pct), 112, 22) })}</div>
    <h2>${pass ? 'Bestanden! 🎉' : 'Noch nicht ganz 🌱'}</h2><p>${gradeHtml(res.pct)}</p><p class="small muted">${lines.join('<br>')}</p>
    ${pass ? '' : `<p class="small">Zum Bestehen brauchst du mindestens Note 3 (${PASS} %). Dein Fortschritt zählt erst nach bestandenem Test.</p>`}</div>
    ${pass ? `<button class="btn primary block" data-a="res-pass">${o.passLabel || 'Weiter'}</button>` : `<button class="btn primary block" data-a="res-redo">${o.redoLabel || 'Test wiederholen'}</button>${o.relearn ? '<div style="height:10px"></div><button class="btn block" data-a="res-relearn">Nochmal lernen</button>' : ''}`}
    <div style="height:10px"></div><a class="btn ghost block" href="#/home">Später</a>`;
}

/* ---------- Lektion: Entdecken → Zuordnen → Test ---------- */
const STAGES = [['Entdecken', 'Schauen und Hören – noch ohne Test. Erst verstehen, dann erinnern (Input zuerst).'], ['Zuordnen', 'Verknüpfe Zeichen und Bild. Bilder + Klang bleiben besonders gut hängen.'], ['Test', 'Jetzt zeigst du, was hängen geblieben ist – dazu ein paar Wiederholungen von früher.']];
let L = null;
function startLesson(gid) {
  const g = ALL_GROUPS.find(x => x.id === gid); if (!g) { location.hash = '#/kana'; return; }
  L = { g, stage: 0, i: 0, sel: null, matched: new Set() }; renderLesson();
}
const lessonTop = () => `<div class="ltop"><button class="icon-btn" data-a="quit" aria-label="Beenden">✕</button><div class="bar"><i style="width:${L.stage / 3 * 100}%"></i></div><span class="chip">${L.g.script === 'hira' ? 'あ' : 'ア'} ${L.g.title}</span></div>`;
const stageTip = () => `<div class="tip"><span>💡</span><span><b>${STAGES[L.stage][0]}.</b> ${STAGES[L.stage][1]}</span></div>`;
function renderLesson() {
  if (L.stage === 0) {
    const k = L.g.kana[L.i];
    view.innerHTML = `${lessonTop()}${L.i === 0 ? stageTip() : ''}<div class="card disc"><span class="chip">${L.i + 1} / ${L.g.kana.length}</span><div class="glyph">${k.k}</div><div class="emo" key="${k.k}">${k.e}</div><p class="hook">${esc(k.h)}</p>
      <div class="romaji">${S.settings.romaji || !canSpeak() ? k.r : '🔊'}</div><div class="row" style="justify-content:center"><button class="btn" data-a="say" data-t="${k.k}">🔊 Hören</button><button class="btn" data-a="writer" data-k="${k.k}">✍️ Schreiben</button></div></div>
      <div class="dotsrow">${L.g.kana.map((_, j) => `<i class="${j <= L.i ? 'on' : ''}"></i>`).join('')}</div>
      <button class="btn primary block pin" data-a="disc-next">${L.i === L.g.kana.length - 1 ? 'Zum Zuordnen' : 'Weiter'}</button>`;
    setTimeout(() => speak(k.k), 200);
  } else if (L.stage === 1) {
    if (!L.cols) L.cols = [shuffle(L.g.kana), shuffle(L.g.kana)];
    const done = L.matched.size === L.g.kana.length;
    view.innerHTML = `${lessonTop()}${stageTip()}<div class="card"><div class="pairs">${[0, 1].map(side => `<div class="stack" style="display:grid;gap:10px">${L.cols[side].map(k => `<button class="tile ${L.matched.has(k.k) ? 'ok' : ''} ${L.sel && L.sel.side === side && L.sel.k === k.k ? 'sel' : ''}" data-a="pair" data-side="${side}" data-k="${k.k}" ${side ? `aria-label="Bild zu ${k.r}"` : ''}><span class="g">${side ? k.e : k.k}</span></button>`).join('')}</div>`).join('')}</div></div>
      ${done ? '<button class="btn primary block pin" data-a="stage-next">Weiter zum Test</button>' : '<p class="muted small" style="text-align:center">Tippe ein Zeichen und dann das passende Bild.</p>'}`;
  }
}
function pair(side, k) {
  if (L.matched.has(k)) return;
  if (!L.sel) { L.sel = { side, k }; renderLesson(); return; }
  if (L.sel.side === side) { L.sel = { side, k }; renderLesson(); return; }
  if (L.sel.k === k) { L.matched.add(k); L.sel = null; renderLesson(); speak(k); }
  else { const bad = [...view.querySelectorAll('.tile')].filter(t => t.dataset.k === k || t.dataset.k === L.sel.k); bad.forEach(t => t.classList.add('shake')); L.sel = null; setTimeout(renderLesson, 380); }
}
function stageNext() { L.stage++; L.i = 0; if (L.stage === 1) return renderLesson(); kanaTest(); }
function kanaTest() {
  L.stage = 2; const ks = L.g.kana, kn = new Set([...knownKana(), ...ks.map(k => k.k)]), ws = knownWords(kn);
  const mine = ws.filter(w => w.chars.some(c => ks.some(k => k.k === c))), pool = ws.length >= 3 ? ws : WORDS;
  const core = [...ks.map(k => qSound(k, ks)), ...ks.map((k, i) => (i % 2 ? qRead(k, ks) : qPic(k, ks))), ...pick(mine, 3).map(w => qWord(w, pool))];
  const rev = pickReview([...knownKana()].map(c => KANA[c]).filter(k => !ks.includes(k)), S.srs, k => k.k, 4).map((k, i) => (i % 2 ? qRead(k) : qSound(k)));
  const sp = canListen() ? pick(mine, 2).map(w => qSpeak({ w: w.w, r: w.r, d: w.d })) : [];
  runTest({ core, review: rev, speak: sp, top: lessonTop() + stageTip(), pass: finishLesson, redo: kanaTest, relearn: () => { L.stage = 0; L.i = 0; L.cols = null; L.matched = new Set(); renderLesson(); } });
}
function finishLesson() {
  const g = L.g, first = !S.groupsDone[g.id]; S.groupsDone[g.id] = true;
  g.kana.forEach(k => { if (!S.srs[k.k]) S.srs[k.k] = { box: 1, due: Date.now() + 18 * 36e5 }; });
  markActivity('new'); const nxt = nextGroup(), ws = knownWords(), note = levelNote(), chars = g.kana.map(k => k.k);
  document.body.classList.add('focus');
  view.innerHTML = `<div class="party card"><div class="art">${mochi({ acc: 'cheer', mood: 'cheer' }, 110)}</div>${note}<h1>${first ? 'Gruppe gelernt! 🎉' : 'Schön wiederholt! 🌸'}</h1>
    <p class="jp" style="font-size:2rem;font-weight:700">${g.kana.map(k => k.k).join(' ')}</p>
    <p>Du kannst jetzt <b>${ws.length}</b> Wörter lesen. Die Zeichen kommen sanft zur Wiederholung zurück.</p></div>
    <button class="btn block" data-a="write-chars" data-c="${chars.join('')}">✍️ Jetzt schreiben üben</button><div style="height:10px"></div>
    ${nxt && nxt.id !== g.id ? `<a class="btn primary block" href="#/lesson/${nxt.id}">Weiter: ${nxt.title}</a><div style="height:10px"></div>` : ''}
    <a class="btn ghost block" href="#/home">Zurück zum Dashboard</a>`;
  L = null;
}

/* ---------- Fertigkeiten: Hören, Lesen, Sprechen, Schreiben ---------- */
const SKILLS = { hoeren: { n: 'Hören', ic: '🎧' }, lesen: { n: 'Lesen', ic: '📖' }, sprechen: { n: 'Sprechen', ic: '🎤' }, schreiben: { n: 'Schreiben', ic: '✍️' } };
const HEAR = ['sound', 'lsound', 'shear'], READ = ['read', 'pic', 'word', 'lword', 'kmean', 'kpick', 'kword', 'sline', 'sword'];
const LINES = {}; STORIES.forEach(s => s.lines.forEach((l, i) => { l.key = `${s.id}:${i}`; LINES[l.key] = l; }));
function skillTargets() { const f = S.goalMin / 10; return { hoeren: Math.max(4, Math.round(10 * f)), lesen: Math.max(4, Math.round(10 * f)), sprechen: Math.max(2, Math.round(3 * f)), schreiben: Math.max(2, Math.round(4 * f)) }; }
const activeSkills = () => ['hoeren', 'lesen', ...(canListen() ? ['sprechen'] : []), ...(S.tracks.script ? ['schreiben'] : [])];
const skillFrac = k => Math.min(1, (S.day.pts[k] || 0) / skillTargets()[k]);
const dailyPct = () => { const a = activeSkills(); return Math.round(a.reduce((s, k) => s + skillFrac(k), 0) / a.length * 100); };
// Punkte gibt es nur für richtige Leistungen: pro Aufgabenart und Inhalt höchstens einmal am Tag
function addPoint(skill, kindKey, itemKey) {
  rollDay(); const id = skill + '|' + kindKey; if (S.day.seen[id]) return;
  S.day.seen[id] = 1; S.day.seen[skill + '|item|' + itemKey] = 1; S.day.pts[skill] = (S.day.pts[skill] || 0) + 1; bumpStreak();
  if (!S.hist[todayStr()] && dailyPct() >= 100) { S.hist[todayStr()] = 1; toast('Tagesziel geschafft! 🎉'); }
  save();
}
function weekDates() { const d = new Date(), dow = (d.getDay() + 6) % 7; return [...Array(7)].map((_, i) => new Date(d.getFullYear(), d.getMonth(), d.getDate() - dow + i).toLocaleDateString('sv')); }
const dueLines = () => Object.entries(S.lsrs).filter(([, v]) => v.due <= Date.now()).map(([k]) => LINES[k]).filter(Boolean);
const backlogCount = () => dueKana().length + dueKanji().length + dueWords().length + dueLines().length;

function skillCands(sk) {
  const out = [], now = Date.now(), add = (t, o, key, store) => out.push({ t, o, key, due: store[key] ? store[key].due : now + DAY * .5, seen: !!S.day.seen[sk + '|item|' + key] });
  [...knownKana()].forEach(c => add('kana', KANA[c], c, S.srs));
  const words = new Map(); Object.keys(S.wsrs).forEach(w => ITEMS[w] && words.set(w, ITEMS[w])); knownWords().forEach(w => !words.has(w.w) && words.set(w.w, w));
  words.forEach((o, w) => add('word', o, w, S.wsrs));
  Object.keys(S.ksrs).forEach(k => KANJI_MAP[k] && add('kanji', KANJI_MAP[k], k, S.ksrs));
  Object.keys(S.lsrs).forEach(k => LINES[k] && add('line', LINES[k], k, S.lsrs));
  return out;
}
function pickMixed(c, n) {
  const g = {}; c.forEach(x => (g[x.t] ||= []).push(x));
  Object.values(g).forEach(a => a.sort((a, b) => a.seen - b.seen || a.due - b.due || Math.random() - .5));
  const keys = Object.keys(g), out = []; let i = 0;
  while (out.length < n && keys.some(k => g[k].length)) { const k = keys[i++ % keys.length]; if (g[k].length) out.push(g[k].shift()); }
  return out;
}
const kanjiHear = k => ({ ...lq({ w: k.ex.w, r: k.ex.r, d: k.ex.d, e: '📝' }, 'lsound'), wkey: undefined, kkey: k.k });
const qLineAudio = (line, all) => ({ ...qLine(line, all), kind: 'shear' });
const lineTarget = l => ({ w: lineText(l), r: l.words.map(w => w[1]).join(' '), d: l.de });
function emptySkill(msg) { document.body.classList.add('focus'); view.innerHTML = `<div class="party card">${mochi({ mood: 'sleep' }, 100)}<h2>Noch zu wenig Stoff</h2><p>${msg}</p></div><a class="btn primary block" href="#/home">Zurück zum Dashboard</a>`; }
function startSkill(sk) {
  if (!SKILLS[sk]) { location.hash = '#/home'; return; }
  const need = Math.max(0, skillTargets()[sk] - (S.day.pts[sk] || 0));
  if (sk === 'schreiben') return writeDaily(need);
  if (sk === 'sprechen') {
    if (!canListen()) return emptySkill('Sprechen braucht die Spracherkennung deines Browsers (Chrome, Edge oder Safari über HTTPS) und ein erlaubtes Mikrofon. Hier ist sie nicht verfügbar, deshalb zählt Sprechen heute nicht.');
    const c = skillCands(sk).filter(x => x.t !== 'kana' && (x.t !== 'line' || lineText(x.o).length <= 14)); if (c.length < 3) return emptySkill('Lerne zuerst ein Thema, damit du Wörter zum Nachsprechen hast.');
    const qs = pickMixed(c, Math.min(8, Math.max(3, need + 2))).map(x => qSpeak(x.t === 'word' ? { w: x.o.w, r: x.o.r, d: x.o.d } : x.t === 'kanji' ? { w: x.o.ex.w, r: x.o.ex.r, d: x.o.ex.d } : lineTarget(x.o)));
    Q = null; startQuiz(qs, () => skillDone(sk), '<div class="tip"><span>🎤</span><span>Sprich die Wörter nach. Punkte gibt es ab Note 3, eine Aufgabe kannst du jederzeit überspringen.</span></div>'); return;
  }
  const c = skillCands(sk); if (c.length < 3) return emptySkill('Lerne zuerst eine Kana-Gruppe oder ein Thema – dann hast du Stoff zum Üben.');
  const all = Object.values(LINES), picks = pickMixed(c, Math.min(12, Math.max(6, need + 4)));
  const qs = picks.map((x, i) => (sk === 'hoeren'
    ? (x.t === 'kana' ? qSound(x.o) : x.t === 'word' ? lq(x.o, 'lsound') : x.t === 'kanji' ? kanjiHear(x.o) : qLineAudio(x.o, all))
    : (x.t === 'kana' ? (i % 2 ? qRead(x.o) : qPic(x.o)) : x.t === 'word' ? lq(x.o, 'lword') : x.t === 'kanji' ? [qKMean, qKPick, qKWord][i % 3](x.o) : qLine(x.o, all))));
  Q = null; startQuiz(qs, () => skillDone(sk), `<div class="tip"><span>${SKILLS[sk].ic}</span><span>${sk === 'hoeren' ? 'Nur hören, nichts lesen: Zuerst kommt das, was bald wieder fällig ist.' : 'Lesen ohne Ton: Zuerst kommt das, was bald wieder fällig ist.'} Punkte gibt es für richtige Antworten beim ersten Versuch.</span></div>`);
  Q.onResult = (k, ok) => { if (S.srs[k]) rate(k, ok); }; Q.onWResult = (w, ok) => { if (S.wsrs[w]) rate(w, ok, 'wsrs'); }; Q.onKResult = (k, ok) => { if (S.ksrs[k]) rate(k, ok, 'ksrs'); }; Q.onLResult = (k, ok) => { if (S.lsrs[k]) rate(k, ok, 'lsrs'); };
}
function writeDaily(need) {
  const pool = [...knownKana(), ...Object.keys(S.ksrs)]; if (!pool.length) return emptySkill('Lerne zuerst ein paar Zeichen, dann kannst du sie schreiben.');
  const chars = [...pool].sort((a, b) => (S.day.seen['schreiben|item|' + a] ? 1 : 0) - (S.day.seen['schreiben|item|' + b] ? 1 : 0) || (S.trace[a] ?? -1) - (S.trace[b] ?? -1) || Math.random() - .5).slice(0, Math.min(6, Math.max(3, need + 1)));
  writeChars(chars, 'trace');
}
function skillDone(sk) {
  const t = skillTargets()[sk], p = S.day.pts[sk] || 0; document.body.classList.add('focus'); markActivity();
  view.innerHTML = `<div class="party card"><div class="art">${ring(Math.min(100, p / t * 100), { size: 104, sw: 10, color: 'var(--green)', inner: ringText(Math.min(p, t) + '/' + t, 104, 22) })}</div>
    <h2>${SKILLS[sk].ic} ${SKILLS[sk].n} ${p >= t ? 'geschafft! 🎉' : '– gut gemacht'}</h2><p>${p >= t ? 'Das Tagesziel für diese Fertigkeit ist erreicht.' : `Noch ${t - p} Punkte bis zum Tagesziel. Punkte gibt es nur für richtige Leistungen, nicht fürs Antippen.`}</p></div>
    <button class="btn primary block" data-a="skill-again" data-v="${sk}">Noch eine Runde</button><div style="height:10px"></div><a class="btn ghost block" href="#/home">Zurück zum Dashboard</a>`;
}

/* ---------- Wiederholung (Leitner) ---------- */
function startReview(free) {
  const ks = knownKana();
  if (!ks.size) { view.innerHTML = `<div class="card party">${mochi({}, 110)}<h2>Noch nichts zu wiederholen</h2><p>Entdecke zuerst eine Gruppe – dann tauchen die Zeichen hier auf.</p><a class="btn primary" href="#/kana">Zu den Kana</a></div>`; return; }
  let items = dueKana(); if (free || !items.length) { if (!free) { view.innerHTML = `<div class="card party">${mochi({ mood: 'sleep' }, 110)}<h2>Alles frisch! 🌿</h2><p>Nichts ist fällig. Wie wäre es mit einer Geschichte – oder du übst einfach freiwillig weiter.</p><a class="btn primary" href="#/read/${recommendedStory().id}">🎧 Geschichte lesen</a> <a class="btn" href="#/review/free">Freies Üben</a> <a class="btn ghost" href="#/home">Zurück</a></div>`; return; } items = pick([...ks].map(c => KANA[c]), 10); }
  items = items.slice(0, 8);
  const qs = items.map((k, i) => (i % 2 ? qRead(k) : qSound(k)));
  const ws = knownWords(ks); if (ws.length >= 3) qs.push(...pick(ws, 2).map(w => qWord(w, ws)));
  Q = null; startQuiz(shuffle(qs), () => {
    markActivity('review'); view.innerHTML = `<div class="party card">${mochi({ acc: 'cheer', mood: 'cheer' }, 120)}<h1>Wiederholung fertig! 🌸</h1><p>Je öfter du ein Zeichen mühelos erkennst, desto länger darf es ruhen.</p></div><a class="btn primary block" href="#/home">Zurück zum Dashboard</a>`;
  }, `<div class="tip" style="margin-bottom:14px"><span>🔁</span><span>Sanfte Wiederholung: Zeichen, die sitzen, kommen seltener. Hinweise sind immer frei.</span></div>`);
  Q.onResult = (k, ok) => rate(k, ok); Q.isRev = true;
}

/* ---------- Sprach-Themen (unabhängig von der Schrift) ---------- */
const ITEMS = {}; TOPICS.forEach(t => t.items.forEach(([w, r, d, e]) => (ITEMS[w] = { w, r, d, e })));
let T = null;
const lq = (it, kind) => {
  const pool = Object.values(ITEMS), others = shuffle(pool.filter(x => x.d !== it.d)).slice(0, 2);
  return { kind, say: it.w, wkey: it.w, item: it, hint: `${it.r}${S.settings.textScript === 'romaji' ? '' : ' · ' + it.w}`,
    opts: shuffle([it, ...others]).map(o => ({ html: `<span class="oe">${o.e}</span><span>${esc(o.d)}</span>`, ok: o.w === it.w, txt: true })), explain: `${it.e} <b>${it.r}</b> = ${esc(it.d)}` };
};
const TSTAGES = [['Entdecken', 'Nimm Bedeutung über Bild und Klang auf – noch ohne Test. Verstehen kommt vor Erinnern.'], ['Üben', 'Ordne dem Klang eine Bedeutung zu. Raten ist erlaubt, Fehler kosten nichts.'], ['Test', 'Jetzt die Abfrage – dazu ein paar Wörter von früher.']];
const topicTop = () => `<div class="ltop"><button class="icon-btn" data-a="quit" aria-label="Beenden">✕</button><div class="bar"><i style="width:${T.stage / 3 * 100}%"></i></div><span class="chip">${T.t.emoji} ${T.t.title}</span></div>`;
const topicTip = () => `<div class="tip"><span>💡</span><span><b>${TSTAGES[T.stage][0]}.</b> ${TSTAGES[T.stage][1]}</span></div>`;
function startTopic(id) {
  const t = TOPICS.find(x => x.id === id); if (!t) { location.hash = '#/read'; return; }
  if (!unlocked(t.lvl)) { toast(`Schließe zuerst ${curLevel()} ab 🔒`); location.hash = '#/home'; return; }
  T = { t, stage: 0, i: 0, items: t.items.map(([w, r, d, e]) => ({ w, r, d, e })) }; renderTopic();
}
function renderTopic() {
  const it = T.items[T.i], ts = S.settings.textScript;
  view.innerHTML = `${topicTop()}${T.i === 0 ? topicTip() : ''}<div class="card disc"><span class="chip">${T.i + 1} / ${T.items.length}</span><div class="emo" style="font-size:clamp(3rem,10vh,5rem)">${it.e}</div>
    <div class="wordbig jp" style="font-size:2.4rem;font-weight:700">${ts === 'romaji' ? it.r : it.w}</div>${ts === 'both' ? `<div class="romaji">${it.r}</div>` : ''}<p class="hook"><b>${esc(it.d)}</b></p>
    <button class="btn" data-a="say" data-t="${it.w}">🔊 Nochmal hören</button></div>
    <div class="dotsrow">${T.items.map((_, j) => `<i class="${j <= T.i ? 'on' : ''}"></i>`).join('')}</div>
    <button class="btn primary block pin" data-a="t-next">${T.i === T.items.length - 1 ? 'Zum Üben' : 'Weiter'}</button>`;
  setTimeout(() => speak(it.w), 200);
}
function topicNext() {
  if (T.stage === 0) { if (T.i < T.items.length - 1) { T.i++; return renderTopic(); } T.stage = 1; return startQuiz(shuffle(T.items.map(it => lq(it, 'lsound'))), topicNext, topicTop() + topicTip()); }
  T.stage = 2; topicTest();
}
function topicTest() {
  T.stage = 2; const items = T.items;
  const core = items.map((it, i) => lq(it, i % 2 ? 'lword' : 'lsound'));
  const rev = pickReview(Object.keys(S.wsrs).map(w => ITEMS[w]).filter(x => x && !items.some(i => i.w === x.w)), S.wsrs, x => x.w, 3).map((it, i) => lq(it, i % 2 ? 'lsound' : 'lword'));
  const sp = canListen() ? pick(items, 2).map(it => qSpeak(it)) : [];
  runTest({ core, review: rev, speak: sp, top: topicTop() + topicTip(), pass: topicFinish, redo: topicTest, relearn: () => { T.stage = 0; T.i = 0; renderTopic(); } });
}
function topicFinish() {
  const t = T.t; S.topicsDone[t.id] = true; T.items.forEach(it => { if (!S.wsrs[it.w]) S.wsrs[it.w] = { box: 1, due: Date.now() + 18 * 36e5 }; });
  markActivity('tnew'); const nt = nextTopic(), st = recommendedStory(), note = levelNote(); T = null; document.body.classList.add('focus');
  view.innerHTML = `<div class="party card"><div class="art">${mochi({ acc: 'cheer', mood: 'cheer' }, 110)}</div>${note}<h1>Thema gelernt! 🎉</h1><p style="font-size:2.2rem;margin:0">${t.emoji}</p>
    <p>Diese Wörter kommen sanft zur Wiederholung zurück. In Geschichten erkennst du sie wieder.</p></div>
    ${nt ? `<a class="btn primary block" href="#/topic/${nt.id}">Weiter: ${nt.emoji} ${nt.title}</a><div style="height:10px"></div>` : ''}
    <a class="btn block" href="#/read/${st.id}">🎧 Eine Geschichte hören</a><div style="height:10px"></div><a class="btn ghost block" href="#/home">Zurück zum Dashboard</a>`;
}

function startWordReview(free) {
  const all = Object.keys(S.wsrs).map(w => ITEMS[w]).filter(Boolean);
  if (!all.length) { view.innerHTML = `<div class="card party">${mochi({}, 110)}<h2>Noch nichts zu wiederholen</h2><p>Lerne zuerst ein Thema – dann tauchen die Wörter hier auf.</p><a class="btn primary" href="#/read">Zu den Themen</a></div>`; return; }
  let items = dueWords();
  if (!items.length) { if (!free) { view.innerHTML = `<div class="card party">${mochi({ mood: 'sleep' }, 110)}<h2>Alles frisch! 🌿</h2><p>Nichts ist fällig. Wie wäre es mit einer Geschichte?</p><a class="btn primary" href="#/read/${recommendedStory().id}">🎧 Geschichte hören</a> <a class="btn" href="#/wreview/free">Freies Üben</a> <a class="btn ghost" href="#/home">Zurück</a></div>`; return; } items = pick(all, 8); }
  items = items.slice(0, 8); Q = null;
  startQuiz(shuffle(items.map((it, i) => lq(it, i % 2 ? 'lword' : 'lsound'))), () => {
    markActivity('trev'); view.innerHTML = `<div class="party card">${mochi({ acc: 'cheer', mood: 'cheer' }, 120)}<h1>Wiederholung fertig! 🌸</h1><p>Je müheloser du ein Wort verstehst, desto länger darf es ruhen.</p></div><a class="btn primary block" href="#/home">Zurück zum Dashboard</a>`;
  }, `<div class="tip" style="margin-bottom:14px"><span>🔁</span><span>Sanfte Wiederholung: Wörter, die sitzen, kommen seltener. Hinweise sind immer frei.</span></div>`);
  Q.onWResult = (w, ok) => rate(w, ok, 'wsrs'); Q.isRev = true;
}

/* ---------- Kanji (Schrift, unabhängig von der Sprache) ---------- */
let J = null;
const kPool = kj => { const same = KANJI.filter(x => x.k !== kj.k && x.lvl === kj.lvl); return shuffle((same.length > 6 ? same : KANJI).filter(x => x.k !== kj.k && x.de !== kj.de)); };
const exLine = kj => `${kj.ex.w} (${kj.ex.r}) = ${esc(kj.ex.d)}`;
const qKMean = kj => ({ kind: 'kmean', big: kj.k, say: kj.ex.w, kkey: kj.k, hint: `${kj.r} · ${exLine(kj)}`, opts: shuffle([kj, ...kPool(kj).slice(0, 3)]).map(o => ({ html: `<span>${esc(o.de)}</span>`, ok: o.k === kj.k, txt: true })), explain: `<b>${kj.k}</b> = ${esc(kj.de)} (${kj.r})` });
const qKPick = kj => ({ kind: 'kpick', big: kj.de, say: kj.ex.w, kkey: kj.k, hint: `Lesung: ${kj.r} · ${exLine(kj)}`, opts: shuffle([kj, ...kPool(kj).slice(0, 3)]).map(o => ({ html: o.k, ok: o.k === kj.k })), explain: `${esc(kj.de)} = <b>${kj.k}</b> (${kj.r})` });
const qKWord = kj => { const others = kPool(kj).filter(x => x.ex.d !== kj.ex.d).slice(0, 2);
  return { kind: 'kword', big: kj.ex.w, say: kj.ex.w, kkey: kj.k, hint: `${kj.ex.r} – enthält ${kj.k} (${esc(kj.de)})`, opts: shuffle([kj, ...others]).map(o => ({ html: `<span>${esc(o.ex.d)}</span>`, ok: o.k === kj.k, txt: true })), explain: `<b>${kj.ex.w}</b> (${kj.ex.r}) = ${esc(kj.ex.d)}` }; };
const KSTAGES = [['Entdecken', 'Sieh dir Zeichen und Beispielwort an. Die Bedeutung kommt über den Kontext – noch kein Test.'], ['Üben', 'Ordne Zeichen und Bedeutung zu. Raten ist erlaubt.'], ['Test', 'Jetzt die Abfrage – dazu ein paar Kanji von früher.']];
const kTop = () => `<div class="ltop"><button class="icon-btn" data-a="quit" aria-label="Beenden">✕</button><div class="bar"><i style="width:${J.stage / 3 * 100}%"></i></div><span class="chip">漢 ${J.g.lvl} · Satz ${J.g.n}</span></div>`;
const kTip = () => `<div class="tip"><span>💡</span><span><b>${KSTAGES[J.stage][0]}.</b> ${KSTAGES[J.stage][1]}</span></div>`;
function startKanji(id) {
  const g = KGROUPS.find(x => x.id === id); if (!g) { location.hash = '#/kana'; return; }
  if (!unlocked(g.lvl)) { toast(`Schließe zuerst ${curLevel()} ab 🔒`); location.hash = '#/home'; return; }
  kanaScript = 'kanji'; kanjiLvl = g.lvl; J = { g, stage: 0, i: 0 }; renderKanji();
}
function renderKanji() {
  const k = J.g.items[J.i];
  view.innerHTML = `${kTop()}${J.i === 0 ? kTip() : ''}<div class="card disc"><span class="chip">${J.i + 1} / ${J.g.items.length}</span><div class="glyph">${k.k}</div><h2 style="margin:.1em 0">${esc(k.de)}</h2>
    <div class="romaji" style="font-size:1.05rem">${k.r}</div><p class="hook jp"><b>${k.ex.w}</b> <span class="muted" style="font-family:var(--ui)">${k.ex.r}</span><br><span style="font-family:var(--ui)">${esc(k.ex.d)}</span></p>
    <div class="row" style="justify-content:center"><button class="btn" data-a="say" data-t="${k.ex.w}">🔊 Hören</button><button class="btn" data-a="writer" data-k="${k.k}">✍️ Schreiben</button></div></div>
    <div class="dotsrow">${J.g.items.map((_, j) => `<i class="${j <= J.i ? 'on' : ''}"></i>`).join('')}</div>
    <button class="btn primary block pin" data-a="k-next">${J.i === J.g.items.length - 1 ? 'Zum Üben' : 'Weiter'}</button>`;
  setTimeout(() => speak(k.ex.w), 200);
}
function kanjiNext() {
  const it = J.g.items;
  if (J.stage === 0) { if (J.i < it.length - 1) { J.i++; return renderKanji(); } J.stage = 1; return startQuiz(shuffle([...it.map(qKMean), ...it.map(qKPick)]), kanjiNext, kTop() + kTip()); }
  kanjiTest();
}
function kanjiTest() {
  J.stage = 2; const it = J.g.items, known = Object.keys(S.ksrs).map(k => KANJI_MAP[k]).filter(k => k && !it.includes(k));
  const core = [...it.map(qKWord), ...it.map(qKMean)];
  const rev = pickReview(known, S.ksrs, k => k.k, 3).map((k, i) => (i % 2 ? qKPick(k) : qKWord(k)));
  const sp = canListen() ? pick(it, 2).map(k => qSpeak({ w: k.ex.w, r: k.ex.r, d: k.ex.d })) : [];
  runTest({ core, review: rev, speak: sp, top: kTop() + kTip(), pass: kanjiFinish, redo: kanjiTest, relearn: () => { J.stage = 0; J.i = 0; renderKanji(); } });
}
function kanjiFinish() {
  const g = J.g; S.kanjiDone[g.id] = true; g.items.forEach(k => { if (!S.ksrs[k.k]) S.ksrs[k.k] = { box: 1, due: Date.now() + 18 * 36e5 }; });
  markActivity('kanji'); const nx = nextKanjiGroup(), note = levelNote(), chars = g.items.map(k => k.k).join(''); J = null; document.body.classList.add('focus');
  view.innerHTML = `<div class="party card"><div class="art">${mochi({ acc: 'cheer', mood: 'cheer' }, 100)}</div>${note}<h1>Kanji-Satz gelernt! 🎉</h1><p class="jp" style="font-size:2rem;font-weight:700">${g.items.map(k => k.k).join(' ')}</p>
    <p>Sie kommen sanft zur Wiederholung zurück.</p></div>
    <button class="btn block" data-a="write-chars" data-c="${chars}">✍️ Jetzt schreiben üben</button><div style="height:10px"></div>
    ${nx ? `<a class="btn primary block" href="#/kanji/${nx.id}">Weiter: ${nx.lvl} · Satz ${nx.n}</a><div style="height:10px"></div>` : ''}<a class="btn ghost block" href="#/home">Zurück zum Dashboard</a>`;
}

function startKanjiReview(free) {
  const all = Object.keys(S.ksrs).map(k => KANJI_MAP[k]).filter(Boolean);
  if (!all.length) { view.innerHTML = `<div class="card party">${mochi({}, 100)}<h2>Noch keine Kanji</h2><p>Lerne zuerst einen Satz – dann erscheinen sie hier.</p><a class="btn primary" href="#/kana">Zu den Kanji</a></div>`; return; }
  let items = dueKanji();
  if (!items.length) { if (!free) { view.innerHTML = `<div class="card party">${mochi({ mood: 'sleep' }, 100)}<h2>Alles frisch! 🌿</h2><p>Nichts ist fällig.</p><a class="btn" href="#/kreview/free">Freies Üben</a> <a class="btn ghost" href="#/home">Zurück</a></div>`; return; } items = pick(all, 8); }
  Q = null; startQuiz(shuffle(items.slice(0, 8).map((k, i) => (i % 3 === 0 ? qKPick(k) : i % 3 === 1 ? qKMean(k) : qKWord(k)))), () => {
    markActivity(); view.innerHTML = `<div class="party card">${mochi({ acc: 'cheer', mood: 'cheer' }, 110)}<h1>Wiederholung fertig! 🌸</h1></div><a class="btn primary block" href="#/home">Zurück zum Dashboard</a>`;
  }, `<div class="tip"><span>🔁</span><span>Sanfte Wiederholung: Was sitzt, kommt seltener.</span></div>`);
  Q.onKResult = (k, ok) => rate(k, ok, 'ksrs'); Q.isRev = true;
}
/* ---------- Geschichten ---------- */
let story = { token: 0, show: false };
function stopStory() { story.token++; if ('speechSynthesis' in window) speechSynthesis.cancel(); }
const WORD_TEXT = w => (S.settings.textScript === 'romaji' ? w[1] : w[0]);
function viewReadList() {
  langLvl = langLvl || curLevel();
  const ks = knownKana(), kw = knownWordSet(), dw = dueWords().length;
  const tps = TOPICS.filter(t => t.lvl === langLvl).sort((a, b) => tagScore(b) - tagScore(a)), sts = STORIES.filter(x => x.lvl === langLvl);
  view.innerHTML = `<div class="head tight"><div><h1>Sprache</h1><p class="sub">Verstehen, hören, lesen – ohne Schriftzwang</p></div></div>
    ${lvSeg(langLvl, 'llvl')}
    ${dw ? `<a class="btn block sm" style="margin-bottom:10px" href="#/wreview">🔁 ${dw} Wörter wiederholen</a>` : ''}
    <h3 class="sec">🗣️ Themen <small class="muted">${LEVEL_INFO[langLvl]}</small></h3>
    <div class="topics">${tps.map(t => `<a class="tcard ${S.topicsDone[t.id] ? 'done' : ''}" href="#/topic/${t.id}"><span class="em">${t.emoji}</span><b>${t.title}</b><span class="small muted">${S.topicsDone[t.id] ? '✔ gelernt' : t.items.length + ' Wörter'}</span>${S.goals.includes(t.tag) && !S.topicsDone[t.id] ? '<span class="chip red" style="align-self:flex-start;margin-top:4px">Für dich</span>' : ''}</a>`).join('')}</div>
    <h3 class="sec">📖 Geschichten</h3>
    ${sts.map(s => { const wr = Math.round(storyWordRatio(s, kw) * 100), kr = Math.round(storyRatio(s, ks) * 100); return `<a class="scard" href="#/read/${s.id}"><span class="em">${s.emoji}</span><span class="grow"><b>${s.title}</b><br><span class="small muted">${s.scene}</span></span><span class="col" style="text-align:right">${S.storiesRead[s.id] ? '<span class="chip green">gelesen ✔</span><br>' : ''}<span class="chip ${wr >= 80 ? 'green' : wr >= 40 ? 'sun' : ''}">Wörter: ${wr}%</span>${S.tracks.script && ks.size ? `<br><span class="chip" style="margin-top:4px">Zeichen: ${kr}%</span>` : ''}</span></a>`; }).join('') || '<p class="muted">Für diese Stufe folgen weitere Geschichten.</p>'}`;
}
function viewStory(id) {
  const s = STORIES.find(x => x.id === id); if (!s) { location.hash = '#/read'; return; }
  if (!unlocked(s.lvl)) { toast(`Schließe zuerst ${curLevel()} ab 🔒`); location.hash = '#/home'; return; }
  const ks = knownKana(), r = Math.round(storyWordRatio(s) * 100), av = { A: '🧑', B: '👩', N: '📖' }, ts = S.settings.textScript;
  story.show = false;
  view.innerHTML = `<div class="head"><a class="icon-btn" href="#/read" aria-label="Zurück" style="display:grid;place-items:center;text-decoration:none">←</a><div class="grow"><h2 style="margin:0">${s.emoji} ${s.title}</h2><p class="sub">Du kennst ${r}% der Wörter${ks.size ? ` · ${Math.round(storyRatio(s, ks) * 100)}% der Zeichen` : ''}</p></div></div>
    <div class="row wrap" style="margin-bottom:6px"><button class="btn sm primary" data-a="story-play" id="sp">🔊 Alles anhören</button><button class="btn sm" data-a="story-de">🇩🇪 Übersetzung zeigen</button></div>
    ${s.lines.map((l, i) => `<div class="line ${l.who}" id="ln${i}"><div class="av">${av[l.who]}</div><div class="bubble"><div class="jpl">${l.words.map(w => `<button class="w" data-a="word" data-jp="${w[0]}" data-ro="${esc(w[1])}" data-de="${esc(w[2])}">${ts === 'romaji' ? esc(w[1]) : w[0]}</button>`).join('')}${ts === 'romaji' ? '' : l.end}
      <button class="icon-btn" style="width:34px;height:34px;font-size:.9rem;margin-left:4px" data-a="story-line" data-i="${i}" aria-label="Zeile anhören">🔊</button></div>
      ${ts === 'kana' ? '' : ts === 'romaji' ? '' : `<div class="ro">${l.words.map(w => esc(w[1])).join(' ')}</div>`}<div class="de" hidden>${esc(l.de)}</div></div></div>`).join('')}
    <div class="gloss" id="gloss">👆 Tippe auf ein Wort</div>
    <div style="height:14px"></div><button class="btn primary block pin" data-a="story-test" data-id="${s.id}">Verstanden? Zum Test 📝</button>`;
}
const lineText = l => l.words.map(w => w[0]).join('') + l.end;
async function playStory(id) {
  const s = STORIES.find(x => x.id === id), t = ++story.token, btn = $('#sp');
  if (!S.settings.sound) return toast('Ton ist in den Einstellungen aus.');
  if (btn) btn.textContent = '⏹ Stopp';
  for (let i = 0; i < s.lines.length; i++) {
    if (story.token !== t) return;
    document.querySelectorAll('.line').forEach(e => e.classList.remove('playing')); const el = $('#ln' + i); el?.classList.add('playing'); el?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    await speak(lineText(s.lines[i]), .72); await new Promise(r => setTimeout(r, 450));
  }
  document.querySelectorAll('.line').forEach(e => e.classList.remove('playing')); if (btn) btn.textContent = '🔊 Alles anhören';
}

const qLine = (line, all) => { const others = shuffle(all.filter(l => l.de !== line.de)).slice(0, 2);
  return { kind: 'sline', lkey: line.key, big: lineText(line), romaji: line.words.map(w => w[1]).join(' '), say: lineText(line), hint: line.words.map(w => `${w[0]} = ${w[2]}`).join(' · '),
    opts: shuffle([line, ...others]).map(o => ({ html: `<span>${esc(o.de)}</span>`, ok: o === line, txt: true })), explain: esc(line.de) }; };
const qSWord = (w, pool) => { const others = shuffle(pool.filter(x => x[2] !== w[2])).slice(0, 2);
  return { kind: 'sword', big: w[0], ro: w[1], say: w[0], hint: `${w[1]}`, opts: shuffle([w, ...others]).map(o => ({ html: `<span>${esc(o[2])}</span>`, ok: o === w, txt: true })), explain: `<b>${w[0]}</b> (${w[1]}) = ${esc(w[2])}` }; };
function storyTest(id) {
  const s = STORIES.find(x => x.id === id), allLines = STORIES.flatMap(x => x.lines), allWords = [...new Map(STORIES.flatMap(x => x.lines.flatMap(l => l.words)).filter(w => !isFn(w)).map(w => [w[2], w])).values()];
  const mine = [...new Map(s.lines.flatMap(l => l.words).filter(w => !isFn(w)).map(w => [w[0], w])).values()];
  const core = [...pick(s.lines, Math.min(3, s.lines.length)).map(l => qLine(l, allLines)), ...pick(mine, Math.min(3, mine.length)).map(w => qSWord(w, allWords))];
  const rev = pickReview(Object.keys(S.wsrs).map(w => ITEMS[w]).filter(Boolean), S.wsrs, x => x.w, 2).map((it, i) => lq(it, i % 2 ? 'lsound' : 'lword'));
  const short = [...s.lines].sort((a, b) => lineText(a).length - lineText(b).length)[0];
  const sp = canListen() ? [qSpeak({ w: lineText(short), r: short.words.map(w => w[1]).join(' '), d: short.de })] : [];
  runTest({ core, review: rev, speak: sp, pass: () => storyFinish(id), redo: () => storyTest(id), relearn: () => viewStory(id) });
}
function storyFinish(id) {
  S.storiesRead[id] = true; STORIES.find(x => x.id === id).lines.forEach(l => { if (!S.lsrs[l.key]) S.lsrs[l.key] = { box: 1, due: Date.now() + 18 * 36e5 }; }); markActivity('input'); const st = recommendedStory(), nt = nextTopic(), note = levelNote(); document.body.classList.add('focus');
  view.innerHTML = `<div class="party card"><div class="art">${mochi({ acc: 'cheer', mood: 'cheer' }, 110)}</div>${note}<h1>Geschichte verstanden! 🎉</h1><p>Wieder ein Stück Japanisch ohne Büffeln erworben.</p></div>
    ${nt ? `<a class="btn primary block" href="#/topic/${nt.id}">Weiter: ${nt.emoji} ${nt.title}</a><div style="height:10px"></div>` : ''}
    <a class="btn block" href="#/read/${st.id}">🎧 Nächste Geschichte</a><div style="height:10px"></div><a class="btn ghost block" href="#/home">Zurück zum Dashboard</a>`;
}

/* ---------- Methode ---------- */
function viewMethod() {
  view.innerHTML = `<div class="head"><div><h1>Die Methode</h1><p class="sub">Warum du hier ohne Pauken lernst</p></div></div>
    <div class="card" style="padding:8px 14px 14px">${SCENES.acquire}<p>Mochi basiert auf der <b>Natural-Approach-Idee von Stephen Krashen</b> (Linguist, University of Southern California). Seine Theorie besteht aus fünf Hypothesen – dazu kommt die stille Phase. Tippe auf eine Karte, um zu sehen, <b>was Krashen sagt</b> und <b>wie die App es umsetzt</b>.</p></div>
    ${METHOD.map(m => `<details class="m"><summary><span class="ic">${m.ic}</span><span>${m.t}<br><small class="muted" style="font-weight:600">${m.h}</small></span></summary><div class="m-body"><div class="k"><b class="l">Krashen</b>${m.k}</div><div class="a"><b class="l">In Mochi</b>${m.a}</div></div></details>`).join('')}
    <div class="card" style="margin-top:18px"><h3>So läuft ein Tag</h3><p>Der <b>Tagesring</b> besteht aus vier Fertigkeiten: 🎧 Hören, 📖 Lesen, 🎤 Sprechen und ✍️ Schreiben. Du kannst sie getrennt voneinander üben. Jede Fertigkeit gibt Punkte <b>nur für richtige Leistungen</b> (richtige Antwort beim ersten Versuch, Aussprache oder Schrift ab Note 3). Dasselbe Wort zählt pro Aufgabenart nur einmal am Tag, Antippen allein füllt also keinen Ring. Der <b>Wochenring</b> zählt die Tage, an denen du den Tagesring geschlossen hast (Standard: 5 von 7).</p></div>
    <div class="card"><h3>Wie viel Neues, wann Wiederholung?</h3><ul class="small"><li><b>Neues pro Tag:</b> ein Thema (8 Wörter), ein Zeichensatz (5–10 Zeichen) und eine Geschichte (ca. 5 Sätze). Für eine feste Zahl gibt es keinen Konsens in der Forschung; Quellen nennen etwa 10–20 neue Wörter pro Tag. Entscheidend ist, dass die Wiederholungen nicht überhandnehmen. Sind mehr als 25 Einträge fällig, pausiert Mochi Neues.</li><li><b>Abstände:</b> nach dem Lernen und dem Test kommt die erste Wiederholung nach etwa 18 Stunden, dann nach 3, 7, 14, 30, 60 und 120 Tagen. Ein Fehler holt den Eintrag schon nach 10 Minuten zurück. Zu kurze Abstände schaden mehr als etwas zu lange (Cepeda et al. 2008).</li><li><b>Abfragen statt Nachlesen:</b> Sich selbst abzufragen festigt Vokabeln deutlich besser als erneutes Lesen (Karpicke &amp; Roediger 2008).</li><li><b>Sätze:</b> Jede bestandene Geschichte kommt mit ihren Sätzen in dieselbe Wiederholung und taucht in Hören und Lesen wieder auf.</li></ul></div>
    <div class="card"><h3>Erst lernen, dann Test</h3><p>Neues siehst und hörst du zuerst ohne Druck. Danach folgt eine Abfrage mit Note (1 bis 6). Dazu kommen immer ein paar Wiederholungen von früher, damit das Gelernte hängen bleibt. Erst ab <b>Note 3</b> zählt der Fortschritt, und erst wenn eine Stufe komplett bestanden ist, wird die nächste freigeschaltet (N5 → N1). Schreiben und Aussprache werden separat benotet und blockieren nichts.</p></div><div class="card"><h3>N5 bis N1</h3><p>Die Inhalte folgen den fünf JLPT-Stufen. Die Prozentwerte im Dashboard zeigen, wie viel der <b>in Mochi enthaltenen</b> Themen, Geschichten, Kanji und Kana einer Stufe du geschafft hast. Das ist eine kuratierte Auswahl und kein vollständiger Prüfungswortschatz: Für N1 braucht man über 2.000 Kanji, hier sind es die häufigsten Alltags- und Einstiegszeichen. Mehr Stoff lässt sich einfach in <code>js/data.js</code> ergänzen.</p></div><div class="card"><h3>Zwei getrennte Wege: Schrift &amp; Sprache</h3><p>Lesen und Schreiben sind eigene Fertigkeiten. Nach Krashen steht beim Spracherwerb das <b>Verstehen gesprochener und geschriebener Sprache</b> im Mittelpunkt – dafür musst du die Schrift nicht beherrschen. Deshalb kannst du in Mochi <b>die Schrift</b> (Hiragana &amp; Katakana) und <b>die Sprache</b> (Themen, Wörter, Geschichten mit Romaji, Ton und Übersetzung) <b>unabhängig voneinander</b> lernen – nur einen Weg, beide parallel oder später den anderen dazu. Wenn du beides lernst, verknüpft sich das von selbst: In Geschichten siehst du Wörter in Kana, sobald du die Zeichen kennst. Umschalten geht jederzeit unter ⚙️.</p></div><div class="card"><h3>Was Mochi zusätzlich tut</h3><p><b>Merkbilder</b> (Dual Coding nach Allan Paivio: Wort + Bild) und <b>Spaced Repetition</b> (Ebbinghaus/Leitner) stammen nicht von Krashen. Sie unterstützen das Erinnern der Schriftzeichen und sind immer in Bedeutung eingebettet: Du siehst sofort echte Wörter, nicht nur Tabellen.</p></div>
    <div class="card"><h3>Ehrliche Einordnung</h3><p>Krashens Hypothesen sind einflussreich, aber auch umstritten: Sie sind schwer exakt zu prüfen, und Forschende wie Merrill Swain betonen, dass auch eigenes Sprechen (Output) und Feedback helfen. Realistisch heißt das: Mochi bringt dich sanft in die Schrift und ins Leseverstehen. Für echte Sprachkompetenz brauchst du darüber hinaus viel <b>echten Input</b> (Kinderbücher, einfache Podcasts, Videos mit Untertiteln) und – wenn du Lust hast – Gespräche.</p></div>
    <div class="card flat"><h3>Quellen</h3><ul class="small muted"><li>S. Krashen (1982): <i>Principles and Practice in Second Language Acquisition</i></li><li>S. Krashen (1985): <i>The Input Hypothesis: Issues and Implications</i></li><li>S. Krashen &amp; T. Terrell (1983): <i>The Natural Approach</i></li><li>N. Cepeda et al. (2008): <i>Spacing effects in learning</i>, Psychological Science · J. Karpicke &amp; H. Roediger (2008): <i>The critical importance of retrieval for learning</i>, Science · P. Pimsleur (1967): <i>A memory schedule</i></li><li>M. Swain (1985): Output Hypothesis · A. Paivio (1971): Dual Coding Theory</li><li>Strichdaten: <a href="https://kanjivg.tagaini.net" target="_blank" rel="noopener">KanjiVG</a> © Ulrich Apel, Lizenz CC BY-SA 3.0</li></ul></div>
    <button class="btn block" data-a="onb-again">🎬 Einführung noch einmal ansehen</button>`;
}

/* ---------- Einstellungen ---------- */
function viewSettings() {
  const s = S.settings, sel = (v, cur, l) => `<option value="${v}" ${String(cur) === String(v) ? 'selected' : ''}>${l}</option>`;
  view.innerHTML = `<div class="head tight"><a class="icon-btn" href="#/home" aria-label="Zurück" style="display:grid;place-items:center;text-decoration:none">←</a><h1 class="grow" style="margin:0">Einstellungen</h1></div>
    <div class="card"><h3>Lernen</h3>
    <label class="set"><span>Tagesumfang<br><small class="muted">Aufgaben für etwa so viele Minuten</small></span><select data-a="set" data-key="goalMin">${[5, 10, 15, 20, 30].map(m => sel(m, S.goalMin, m + ' Min.')).join('')}</select></label>
    <label class="set"><span>Wochenziel<br><small class="muted">Tage mit geschlossenem Tagesring</small></span><select data-a="set" data-key="weekDays">${[3, 4, 5, 6, 7].map(n => sel(n, S.weekDays || 5, n + ' Tage')).join('')}</select></label>
    <label class="set"><span>Mein Niveau<br><small class="muted">Startpunkt für Empfehlungen</small></span><select data-a="set" data-key="level">${LEVELS.map(l => sel(l, S.level, `${l} · ${LEVEL_INFO[l]}`)).join('')}</select></label>
    <label class="set"><span>✍️ Schrift<br><small class="muted">Kana &amp; Kanji</small></span><input type="checkbox" data-a="set" data-key="track-script" ${S.tracks.script ? 'checked' : ''}></label>
    <label class="set"><span>💬 Sprache<br><small class="muted">Themen, Wörter &amp; Geschichten</small></span><input type="checkbox" data-a="set" data-key="track-lang" ${S.tracks.lang ? 'checked' : ''}></label>
    <label class="set"><span>Text in Wörtern &amp; Geschichten</span><select data-a="set" data-key="textScript">${sel('romaji', s.textScript, 'nur Romaji')}${sel('both', s.textScript, 'Kana + Romaji')}${sel('kana', s.textScript, 'nur Kana')}</select></label>
    <p style="margin:12px 0 6px"><b>Meine Ziele</b></p><div class="goals sm">${GOALS.map(g => `<button data-a="goal-toggle" data-v="${g.id}" class="${S.goals.includes(g.id) ? 'on' : ''}"><span>${g.e}</span>${g.t}</button>`).join('')}</div></div>
    <div class="card"><label class="set"><span>Dein Name</span><input class="txt" id="nm" style="max-width:170px" maxlength="20" value="${esc(S.name)}"></label>
    <label class="set"><span>Sprechaufgaben in Tests<br><small class="muted">Mikrofon &amp; Spracherkennung</small></span><input type="checkbox" data-a="set" data-key="speak" ${s.speak !== false ? 'checked' : ''}></label>
    <label class="set"><span>Romaji in Kana-Lektionen</span><input type="checkbox" data-a="set" data-key="romaji" ${s.romaji ? 'checked' : ''}></label>
    <label class="set"><span>Ton (japanische Stimme)<br><small class="muted">Sprachausgabe deines Geräts</small></span><input type="checkbox" data-a="set" data-key="sound" ${s.sound ? 'checked' : ''}></label>
    <label class="set"><span>Darstellung</span><select data-a="set" data-key="theme">${sel('auto', s.theme, 'Automatisch')}${sel('light', s.theme, 'Hell')}${sel('dark', s.theme, 'Dunkel')}</select></label>
    <label class="set"><span>Startschrift (Kana)</span><select data-a="set" data-key="focus">${sel('hira', S.focus, 'Hiragana')}${sel('kata', S.focus, 'Katakana')}</select></label></div>
    <div class="card"><h3>Sicherung</h3><p class="small muted">Dein Fortschritt liegt nur auf diesem Gerät. Kopiere die Sicherung, um sie auf einem anderen Gerät einzufügen.</p>
    <textarea id="bk" class="txt" rows="3" placeholder="Sicherung hier einfügen …" style="font-size:.8rem"></textarea>
    <div class="row wrap" style="margin-top:8px"><button class="btn sm" data-a="bk-export">Sicherung erstellen</button><button class="btn sm" data-a="bk-import">Einfügen &amp; laden</button></div></div>
    <button class="btn block" data-a="reset" style="color:var(--accent)">Fortschritt zurücksetzen &amp; neu starten</button><div style="height:8px"></div>`;
}

/* ---------- Aktionen (Event-Delegation) ---------- */
const A = {
  go: t => (location.hash = '#/' + t.dataset.to),
  say: t => speak(t.dataset.t), qsay: () => speak(Q.qs[Q.i].say),
  kana: t => openKana(t.dataset.k), close: () => $('#sheet').close(),
  writer: t => openWriter(t.dataset.k), 'w-mode': t => wSetMode(t.dataset.v), 'w-play': () => wPlay(),
  'w-undo': () => { if (W.graded) return; W.strokes.pop(); $('#wu').lastElementChild?.remove(); },
  'w-clear': () => wSetMode(W.mode), 'w-check': wCheck, 'w-next': writeNext,
  'write-chars': t => writeChars([...t.dataset.c]),
  'res-pass': () => RES.o.pass(RES.res), 'res-redo': () => RES.o.redo(), 'res-relearn': () => RES.o.relearn(),
  'skill-again': t => startSkill(t.dataset.v), 'sp-rec': recordSpeech, 'sp-skip': () => { Q.ctl?.stop?.(); Q.ans = true; qnext(); },
  stest: t => scriptTest(t.dataset.v), wprac: t => writePractice(t.dataset.v), 'story-test': t => storyTest(t.dataset.id),
  lvlock: () => toast(`Schließe zuerst ${curLevel()} ab 🔒`),
  kscript: t => { kanaScript = t.dataset.v; viewKana(); }, kmode: t => { kanaMode = t.dataset.v; viewKana(); },
  'onb-next': () => viewOnboarding(onbStep + 1), 'onb-back': () => viewOnboarding(Math.max(0, onbStep - 1)), 'onb-skip': () => viewOnboarding(ONB.length),
  'ob-track': t => { const k = t.dataset.v, o = onbData; if (o[k] && !(k === 'script' ? o.lang : o.script)) return toast('Mindestens ein Weg bleibt aktiv 🙂'); o[k] = !o[k]; viewOnboarding(onbStep); },
  'ob-focus': t => { onbData.focus = t.dataset.v; viewOnboarding(onbStep); },
  'ob-goal': t => { const g = onbData.goals, v = t.dataset.v; g.includes(v) ? g.splice(g.indexOf(v), 1) : g.push(v); viewOnboarding(onbStep); },
  'ob-lvl': t => { onbData.lvl = t.dataset.v; viewOnboarding(onbStep); }, 'ob-min': t => { onbData.goalMin = +t.dataset.v; viewOnboarding(onbStep); },
  'lvl-go': t => { langLvl = t.dataset.v; kanjiLvl = t.dataset.v; location.hash = S.tracks.lang ? '#/read' : '#/kana'; },
  klvl: t => { kanjiLvl = t.dataset.v; viewKana(); }, llvl: t => { langLvl = t.dataset.v; viewReadList(); },
  'k-next': kanjiNext, kanjiinfo: t => openKanji(t.dataset.k),
  'goal-toggle': t => { const v = t.dataset.v; S.goals.includes(v) ? (S.goals.length > 1 && S.goals.splice(S.goals.indexOf(v), 1)) : S.goals.push(v); save(); viewSettings(); },
  'bk-export': () => { const j = JSON.stringify(S), b = $('#bk'); b.value = j; b.select(); try { navigator.clipboard.writeText(j).then(() => toast('Kopiert ✔'), () => toast('Text markiert – bitte manuell kopieren')); } catch { toast('Text markiert – bitte manuell kopieren'); } },
  'bk-import': () => { try { const o = JSON.parse($('#bk').value); if (!o || typeof o !== 'object' || !('onboarded' in o)) throw 0; S = { ...DEFAULTS, ...o }; S.settings = { ...DEFAULTS.settings, ...S.settings }; S.tracks = { ...DEFAULTS.tracks, ...S.tracks }; S.day = { ...EMPTY_DAY(), ...S.day }; save(); applyTheme(); toast('Sicherung geladen ✔'); location.hash = '#/home'; route(); } catch { toast('Das sieht nicht nach einer Sicherung aus.'); } },
  't-next': topicNext,
  'onb-done': () => {
    const o = onbData, opt = LVL_OPTS.find(x => x.id === o.lvl);
    S.name = o.name.trim(); S.tracks = { script: o.script, lang: o.lang }; S.focus = o.focus; S.goals = o.goals.length ? [...o.goals] : ['alltag']; S.goalMin = o.goalMin; S.level = opt.level;
    if (opt.kana) ALL_GROUPS.forEach(g => (S.groupsDone[g.id] = true));
    S.settings.textScript = !o.script && !opt.kana ? 'romaji' : 'both'; S.seenLevel = S.level; S.onboarded = true; save(); location.hash = '#/home'; route();
  },
  'onb-again': () => { S.onboarded = false; location.hash = '#/onboarding'; route(); },
  ans: t => answer(+t.dataset.i), qnext, hint: () => { const q = Q?.qs[Q.i]; if (q) { const fb = $('#fb'); fb.className = 'fb no'; fb.innerHTML = '💡 ' + q.hint; } },
  quit: () => { stopStory(); Q?.ctl?.stop?.(); Q = null; L = null; T = null; J = null; WS = null; location.hash = backTo; },
  'disc-next': () => { if (L.i < L.g.kana.length - 1) { L.i++; renderLesson(); } else stageNext(); },
  pair: t => pair(+t.dataset.side, t.dataset.k), 'stage-next': stageNext,
  word: t => { document.querySelectorAll('.w.on').forEach(e => e.classList.remove('on')); t.classList.add('on'); $('#gloss').innerHTML = `<span class="jp" style="font-size:1.2rem">${t.dataset.jp}</span> · ${t.dataset.ro} · <b>${t.dataset.de}</b>`; speak(t.dataset.jp); },
  'story-line': t => { const s = STORIES.find(x => x.id === location.hash.split('/')[2]); stopStory(); speak(lineText(s.lines[+t.dataset.i]), .72); },
  'story-play': t => { const id = location.hash.split('/')[2]; if (t.textContent.includes('Stopp')) { stopStory(); t.textContent = '🔊 Alles anhören'; document.querySelectorAll('.line').forEach(e => e.classList.remove('playing')); } else playStory(id); },
  'story-de': t => { story.show = !story.show; document.querySelectorAll('.bubble .de').forEach(e => (e.hidden = !story.show)); t.textContent = story.show ? '🇩🇪 Übersetzung verbergen' : '🇩🇪 Übersetzung zeigen'; },
  'story-done': t => { S.storiesRead[t.dataset.id] = true; markActivity('input'); toast('Schön! Wieder ein Stück verstanden 🌸'); location.hash = '#/home'; },
  set: t => {
    const k = t.dataset.key, v = t.type === 'checkbox' ? t.checked : t.value;
    if (k.startsWith('track-')) { S.tracks[k.slice(6)] = v; if (!S.tracks.script && !S.tracks.lang) { S.tracks[k === 'track-script' ? 'lang' : 'script'] = true; toast('Mindestens ein Weg bleibt aktiv 🙂'); save(); return viewSettings(); } }
    else if (k === 'focus' || k === 'level') S[k] = v; else if (k === 'goalMin') S.goalMin = +v; else if (k === 'weekDays') S.weekDays = +v; else S.settings[k] = v;
    if (k === 'level') { kanjiLvl = langLvl = null; }
    save(); applyTheme();
  },
  reset: t => { if (!t.dataset.sure) { t.dataset.sure = 1; t.textContent = 'Wirklich löschen? Nochmal tippen.'; return; } { const nm = S.name; Object.assign(onbData, { script: true, lang: true, focus: 'hira', goals: ['alltag'], lvl: 'new', goalMin: 10, name: nm }); S = structuredClone(DEFAULTS); S.name = nm; save(); applyTheme(); toast('Zurückgesetzt – neu starten ist auch Lernen 🌱'); location.hash = '#/onboarding'; route(); } },
};
document.addEventListener('click', e => { const t = e.target.closest('[data-a]'); if (!t || t.tagName === 'SELECT' || t.type === 'checkbox') return; A[t.dataset.a]?.(t, e); });
document.addEventListener('change', e => { const t = e.target.closest('[data-a="set"]'); if (t) A.set(t); });
document.addEventListener('input', e => { if (e.target.id !== 'nm') return; if (location.hash === '#/settings') { S.name = e.target.value.trim(); save(); } else onbData.name = e.target.value; });
$('#sheet').addEventListener('click', e => { if (e.target.id === 'sheet') e.target.close(); });
$('#sheet').addEventListener('close', () => { if ('speechSynthesis' in window) speechSynthesis.cancel(); });

/* ---------- Lernzeit (nur aktive Zeit im Vordergrund) ---------- */
let lastTouch = Date.now(), ticks = 0;
['pointerdown', 'keydown', 'touchstart', 'scroll'].forEach(ev => addEventListener(ev, () => { lastTouch = Date.now(); }, { passive: true, capture: true }));
setInterval(() => {
  if (!S.onboarded || document.visibilityState !== 'visible' || Date.now() - lastTouch > 45000) return;
  const k = todayStr(); S.time[k] = (S.time[k] || 0) + 1; ticks++;
  if (S.time[k] === 60) { bumpStreak(); save(); }
  if (ticks % 10 === 0) { const keys = Object.keys(S.time).sort(); while (keys.length > 60) delete S.time[keys.shift()]; save(); }
  if (ticks % 15 === 0 && (location.hash === '#/home' || location.hash === '')) viewHome();
}, 1000);
addEventListener('pagehide', save);

/* ---------- Start ---------- */
if (location.search.includes('debug')) window.__mochi = { Q: () => Q, S: () => S, WS: () => WS, refOf, curLevel, lvlPct };
applyTheme(); route();
if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) navigator.serviceWorker.register('sw.js').catch(() => {});
