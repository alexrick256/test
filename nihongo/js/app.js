import { GROUPS, ALL_GROUPS, KANA, WORDS, STORIES, METHOD } from './data.js';
import { SCENES, mochi } from './illus.js';

/* ---------- Helfer ---------- */
const $ = (s, el = document) => el.querySelector(s);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const shuffle = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
const pick = (a, n) => shuffle(a).slice(0, n);
const todayStr = () => new Date().toLocaleDateString('sv');
const DAY = 864e5, INTERVALS = [0, 1, 2, 4, 8, 16]; // Tage pro Leitner-Box
const view = $('#view');

/* ---------- Zustand ---------- */
const KEY = 'mochi-nihongo-v1';
const DEFAULTS = { onboarded: false, name: '', focus: 'hira', groupsDone: {}, srs: {}, streak: { last: '', count: 0 },
  day: { date: '', input: false, new: false, review: false }, storiesRead: {}, settings: { romaji: true, sound: true, theme: 'auto' } };
let S;
try { S = { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) || '{}') }; S.settings = { ...DEFAULTS.settings, ...S.settings }; } catch { S = structuredClone(DEFAULTS); }
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch { /* privater Modus */ } };
function rollDay() { if (S.day.date !== todayStr()) S.day = { date: todayStr(), input: false, new: false, review: false }; }
function markActivity(step) {
  rollDay(); if (step) S.day[step] = true;
  if (S.streak.last !== todayStr()) {
    const y = new Date(Date.now() - DAY).toLocaleDateString('sv');
    S.streak = { last: todayStr(), count: S.streak.last === y ? S.streak.count + 1 : 1 };
  }
  save();
}
const applyTheme = () => { const t = S.settings.theme; if (t === 'auto') document.documentElement.removeAttribute('data-theme'); else document.documentElement.dataset.theme = t; };
const knownKana = () => { const s = new Set(); ALL_GROUPS.forEach(g => S.groupsDone[g.id] && g.kana.forEach(k => s.add(k.k))); return s; };
const knownWords = (ks = knownKana()) => WORDS.filter(w => w.chars.length && w.chars.every(c => ks.has(c)));
const nextGroup = () => { const order = S.focus === 'hira' ? ['hira', 'kata'] : ['kata', 'hira']; for (const sc of order) { const g = GROUPS[sc].find(g => !S.groupsDone[g.id]); if (g) return g; } return null; };
const dueKana = () => Object.entries(S.srs).filter(([, v]) => v.due <= Date.now()).sort((a, b) => a[1].due - b[1].due).map(([k]) => KANA[k]).filter(Boolean);
function rate(k, ok) {
  const e = S.srs[k] || { box: 1 };
  e.box = ok ? Math.min(5, e.box + 1) : Math.max(1, e.box - 1);
  e.due = Date.now() + INTERVALS[e.box] * DAY - (INTERVALS[e.box] ? 2 * 36e5 : 0); S.srs[k] = e; save();
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

/* ---------- Router ---------- */
const TABS = ['home', 'kana', 'read', 'method'];
function route() {
  stopStory();
  const [, p1 = 'home', p2] = location.hash.split('/');
  if (!S.onboarded && p1 !== 'onboarding') { location.hash = '#/onboarding'; return; }
  rollDay();
  const focus = ['onboarding', 'lesson', 'review'].includes(p1);
  document.body.classList.toggle('focus', focus);
  document.querySelectorAll('#tabs a').forEach(a => a.classList.toggle('on', a.dataset.tab === p1 || (p1 === 'lesson' && a.dataset.tab === 'kana')));
  const R = { home: viewHome, kana: () => viewKana(), lesson: () => startLesson(p2), review: () => startReview(p2 === 'free'),
    read: () => (p2 ? viewStory(p2) : viewReadList()), method: viewMethod, settings: viewSettings, onboarding: () => viewOnboarding(0) };
  (R[p1] || viewHome)(); view.scrollTo?.(0, 0); window.scrollTo(0, 0);
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
function viewOnboarding(i) {
  onbStep = i;
  const last = i === ONB.length;
  if (!last) {
    const o = ONB[i];
    view.innerHTML = `<div class="onb"><div><div class="row between"><span class="chip">${i + 1} / ${ONB.length}</span><button class="btn ghost sm" data-a="onb-skip">Überspringen</button></div>
      <div class="art">${SCENES[o.s]}</div><h1>${o.t}</h1><p>${o.p}</p></div>
      <div><div class="dots">${ONB.map((_, j) => `<i class="${j === i ? 'on' : ''}"></i>`).join('')}</div>
      <button class="btn primary block" data-a="onb-next">${i === ONB.length - 1 ? 'Weiter' : 'Verstanden'}</button></div></div>`;
  } else {
    view.innerHTML = `<div class="onb"><div><div class="art" style="text-align:center">${mochi({ acc: 'cheer', mood: 'cheer' }, 120)}</div>
      <h1>Fast geschafft!</h1><p>Mit welcher Schrift möchtest du starten? Beide kannst du jederzeit lernen.</p>
      <div class="choice" id="focus"><button data-a="onb-focus" data-v="hira" class="on"><span class="jp">あ</span>Hiragana<br><small class="muted">rund &amp; weich – Empfehlung</small></button><button data-a="onb-focus" data-v="kata"><span class="jp">ア</span>Katakana<br><small class="muted">eckig – für Fremdwörter</small></button></div>
      <p style="margin-top:18px"><label for="nm"><b>Wie darf Mochi dich nennen?</b> <span class="muted">(optional)</span></label></p><input id="nm" class="txt" maxlength="20" placeholder="Dein Name" autocomplete="given-name"></div>
      <button class="btn primary block" data-a="onb-done">Los geht’s! 🍡</button></div>`;
  }
}

/* ---------- Heute ---------- */
function recommendedStory() {
  const ks = knownKana(), unread = STORIES.filter(s => !S.storiesRead[s.id]), pool = unread.length ? unread : STORIES;
  return [...pool].sort((a, b) => Math.abs(storyRatio(a, ks) - .9) - Math.abs(storyRatio(b, ks) - .9))[0];
}
function storyRatio(st, ks) {
  const chars = st.lines.flatMap(l => l.words.flatMap(w => [...w[0]])).filter(c => KANA[c]);
  return chars.length ? chars.filter(c => ks.has(c)).length / chars.length : 1;
}
const countKnown = sc => GROUPS[sc].filter(g => S.groupsDone[g.id]).reduce((n, g) => n + g.kana.length, 0);
function viewHome() {
  const g = nextGroup(), due = dueKana().length, st = recommendedStory(), d = S.day;
  const greet = new Date().getHours() < 11 ? 'Ohayou' : new Date().getHours() < 18 ? 'Konnichiwa' : 'Konbanwa';
  const done = [d.input, d.new, d.review].filter(Boolean).length;
  view.innerHTML = `
    <div class="head"><div class="hero">${mochi({ acc: 'wave' }, 84)}<div><p class="sub">${greet}${S.name ? ', ' + esc(S.name) : ''}!</p><h1>Dein Tag</h1></div></div>
      <button class="icon-btn" data-a="go" data-to="settings" aria-label="Einstellungen">⚙️</button></div>
    <div class="stats"><div class="stat"><b>🔥 ${S.streak.last === todayStr() || S.streak.last === new Date(Date.now() - DAY).toLocaleDateString('sv') ? S.streak.count : 0}</b><span class="small muted">Tage dabei</span></div>
      <div class="stat"><b>${knownKana().size}</b><span class="small muted">Kana gelernt</span></div><div class="stat"><b>${knownWords().length}</b><span class="small muted">Wörter lesbar</span></div></div>
    <div class="card flat"><div class="row between"><b>${done === 3 ? 'Alles geschafft – toll! 🎉' : `${done} von 3 Schritten`}</b><span class="chip green">ca. 10 Min.</span></div><div class="bar" style="margin-top:10px"><i style="width:${done / 3 * 100}%"></i></div>
      <p class="small muted" style="margin:.7em 0 0">Kein Druck: Auch ein Schritt ist ein guter Tag. Eine Pause ist völlig okay. 🍵</p></div>
    <a class="step ${d.input ? 'done' : ''}" href="#/read/${st.id}"><span class="ic">🎧</span><span><b>1 · Hören &amp; Lesen</b><span class="small muted">„${st.title}“ – verständlicher Input mit Übersetzung</span></span><span class="tick">✔</span></a>
    ${g ? `<a class="step new ${d.new ? 'done' : ''}" href="#/lesson/${g.id}"><span class="ic">🌱</span><span><b>2 · Neues entdecken (i + 1)</b><span class="small muted">${g.script === 'hira' ? 'Hiragana' : 'Katakana'} · ${g.title}: <span class="jp">${g.kana.map(k => k.k).join(' ')}</span></span></span><span class="tick">✔</span></a>`
      : '<div class="step new done"><span class="ic">🏆</span><span><b>Alle Zeichen entdeckt!</b><span class="small muted">Jetzt hilft viel Lesen und Hören.</span></span></div>'}
    <a class="step rev ${d.review ? 'done' : ''}" href="${due ? '#/review' : knownKana().size ? '#/review/free' : '#/kana'}"><span class="ic">🔁</span><span><b>3 · Sanft wiederholen</b><span class="small muted">${due ? `${due} Zeichen warten auf dich` : knownKana().size ? 'Nichts fällig 🌿 – freies Üben ist möglich' : 'Sobald du Zeichen kennst, erscheinen sie hier'}</span></span><span class="tick">✔</span></a>
    <div class="card flat" style="margin-top:18px"><h3>Fortschritt</h3>
      ${['hira', 'kata'].map(sc => `<div class="row between small"><span>${sc === 'hira' ? 'Hiragana' : 'Katakana'}</span><span class="muted">${countKnown(sc)} / 71</span></div><div class="bar" style="margin:4px 0 10px"><i style="width:${countKnown(sc) / 71 * 100}%"></i></div>`).join('')}</div>
    <a class="btn block" href="#/method">🌱 Warum funktioniert das? – Die Methode</a>`;
}

/* ---------- Kana-Übersicht & Tafel ---------- */
let kanaScript = 'hira', kanaMode = 'lessons';
function viewKana() {
  const gs = GROUPS[kanaScript], nxt = nextGroup();
  view.innerHTML = `<div class="head"><div><h1>Kana</h1><p class="sub">Spielend zu den japanischen Silbenschriften</p></div></div>
    <div class="seg" role="tablist"><button data-a="kscript" data-v="hira" class="${kanaScript === 'hira' ? 'on' : ''}"><span class="jp">あ</span> Hiragana</button><button data-a="kscript" data-v="kata" class="${kanaScript === 'kata' ? 'on' : ''}"><span class="jp">ア</span> Katakana</button></div>
    <div class="seg"><button data-a="kmode" data-v="lessons" class="${kanaMode === 'lessons' ? 'on' : ''}">Lektionen</button><button data-a="kmode" data-v="chart" class="${kanaMode === 'chart' ? 'on' : ''}">Tafel</button></div>
    ${kanaMode === 'lessons' ? `<div class="tip"><span>💡</span><span>${kanaScript === 'hira' ? 'Hiragana ist die Grundschrift für jedes japanische Wort.' : 'Katakana schreibt Fremdwörter wie コーヒー (Kaffee) oder ケーキ (Kuchen).'} Du kannst jede Gruppe frei wählen – empfohlen ist die markierte.</span></div><div style="height:12px"></div>
      ${gs.map(g => `<button class="gcard ${S.groupsDone[g.id] ? 'done' : ''} ${nxt && nxt.id === g.id ? 'next' : ''}" data-a="go" data-to="lesson/${g.id}"><span class="num">${S.groupsDone[g.id] ? '✔' : g.n}</span>
        <span class="grow"><b>${g.title}</b><br><span class="glyphs">${g.kana.map(k => k.k).join(' ')}</span></span>${nxt && nxt.id === g.id ? '<span class="chip red">empfohlen</span>' : S.groupsDone[g.id] ? '<span class="chip green">gelernt</span>' : ''}</button>`).join('')}`
    : `<div class="legend"><span class="chip">grau = noch neu</span><span class="chip sun">gelb = frisch</span><span class="chip green">grün = sitzt</span><span class="chip">blau = fest</span></div>
      <div class="chart">${gs.flatMap(g => g.kana).map(k => { const e = S.srs[k.k]; return `<button class="tile ${e ? 'k' + e.box : 'lock'}" data-a="kana" data-k="${k.k}"><span class="g">${k.k}</span><span class="r">${k.r}</span></button>`; }).join('')}</div>`}`;
}

/* Detail-Sheet mit optionalem Nachzeichnen */
function openKana(ch) {
  const k = KANA[ch], sh = $('#sheet');
  sh.innerHTML = `<div class="between row"><span class="chip">${k.script === 'hira' ? 'Hiragana' : 'Katakana'} · ${k.r}</span><button class="icon-btn" data-a="close" aria-label="Schließen">✕</button></div>
    <div class="disc"><div class="glyph" style="font-size:6rem">${k.k}</div><div class="emo" style="font-size:2.6rem">${k.e}</div><p class="hook">${esc(k.h)}</p>
    <button class="btn" data-a="say" data-t="${k.k}">🔊 Anhören</button> <button class="btn ghost" data-a="trace-toggle">✍️ Nachzeichnen (freiwillig)</button><div id="tracebox"></div></div>`;
  sh.showModal(); speak(k.k);
}
function initTrace(box, ch) {
  box.innerHTML = '<canvas id="trace" width="560" height="560" aria-label="Zeichenfläche"></canvas><div class="row" style="justify-content:center"><button class="btn sm" data-a="trace-clear">Neu</button></div>';
  const c = $('#trace'), x = c.getContext('2d');
  const ink = () => getComputedStyle(document.documentElement).getPropertyValue('--ink');
  const ghost = () => { x.clearRect(0, 0, 560, 560); x.font = '400 440px "Zen Maru Gothic","Noto Sans JP",sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.globalAlpha = .13; x.fillStyle = ink(); x.fillText(ch, 280, 300); x.globalAlpha = 1; };
  ghost(); c._ghost = ghost; let down = false;
  const pos = e => { const r = c.getBoundingClientRect(); return [(e.clientX - r.left) * 560 / r.width, (e.clientY - r.top) * 560 / r.height]; };
  c.onpointerdown = e => { down = true; c.setPointerCapture(e.pointerId); const [px, py] = pos(e); x.beginPath(); x.moveTo(px, py); x.lineWidth = 18; x.lineCap = x.lineJoin = 'round'; x.strokeStyle = '#E8533F'; };
  c.onpointermove = e => { if (!down) return; const [px, py] = pos(e); x.lineTo(px, py); x.stroke(); };
  c.onpointerup = c.onpointercancel = () => { down = false; };
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
function startQuiz(qs, onDone, topHtml = '') { Q = { qs, i: 0, right: 0, onDone, topHtml, ans: false, hint: false }; renderQuiz(); }
function renderQuiz() {
  const q = Q.qs[Q.i], total = Q.qs.length;
  const romajiVisible = q.kind === 'sound' && !canSpeak();
  const prompt = q.kind === 'sound' ? `<button class="btn" data-a="qsay" style="font-size:1.3rem;padding:18px 28px">🔊 Hören</button><p class="muted small" style="margin-top:10px">${romajiVisible ? `Klingt wie: <b>${KANA[q.kana].r}</b>` : 'Welches Zeichen hörst du?'}</p>`
    : q.kind === 'pic' ? `<div class="glyph" style="font-size:5rem">${q.pic}</div><p class="muted small">Welches Zeichen gehört zu diesem Bild?</p>`
    : q.kind === 'word' ? `<div class="wordbig">${q.big}</div><button class="btn sm" data-a="qsay">🔊 Hören</button><p class="muted small" style="margin-top:8px">Was bedeutet das Wort?</p>`
    : `<div class="glyph">${q.big}</div><p class="muted small">Wie klingt dieses Zeichen?</p>`;
  view.innerHTML = `${Q.topHtml}<div class="ltop"><button class="icon-btn" data-a="quit" aria-label="Beenden">✕</button><div class="bar"><i style="width:${Q.i / total * 100}%"></i></div></div>
    <div class="card"><div class="prompt">${prompt}</div>
      <div class="opts ${q.opts[0].txt ? 'col1' : ''}">${q.opts.map((o, i) => `<button class="opt ${o.txt ? 'txt' : ''}" data-a="ans" data-i="${i}">${o.html}</button>`).join('')}</div>
      <div class="fb" id="fb" aria-live="polite"></div>
      <div class="row between"><button class="btn sm ghost" data-a="hint">💡 Tipp</button><button class="btn primary" id="nxt" data-a="qnext" style="visibility:hidden">Weiter</button></div></div>`;
  Q.ans = false; if (q.kind === 'sound') setTimeout(() => speak(q.say), 250);
}
function answer(i) {
  if (Q.ans) return; Q.ans = true; const q = Q.qs[Q.i], btns = [...view.querySelectorAll('.opt')], ok = q.opts[i].ok;
  btns.forEach((b, j) => { b.disabled = true; if (q.opts[j].ok) b.classList.add(ok || j === i ? 'good' : 'soft'); else if (j !== i) b.classList.add('dim'); });
  const fb = $('#fb');
  if (ok) { Q.right++; fb.className = 'fb ok'; fb.innerHTML = `${OK_MSG[Math.random() * OK_MSG.length | 0]}<br><span class="small">${q.explain}</span>`; }
  else { fb.className = 'fb no'; fb.innerHTML = `Fast! 🌱 ${q.explain}.<br><span class="small muted">Kein Problem – das kommt gleich nochmal vorbei.</span>`; if (!q.retry) Q.qs.push({ ...q, retry: true, opts: shuffle(q.opts) }); }
  if (q.kana) Q.onResult?.(q.kana, ok);
  speak(q.say);
  const n = $('#nxt'); n.style.visibility = 'visible'; n.focus();
}
function qnext() { Q.i++; if (Q.i >= Q.qs.length) { const f = Q.onDone; Q = null; f(); } else renderQuiz(); }

/* ---------- Lektion: Entdecken → Zuordnen → Hören → Lesen ---------- */
const STAGES = [['Entdecken', 'Schauen und Hören – noch ohne Test. Erst verstehen, dann erinnern (Input zuerst).'], ['Zuordnen', 'Verknüpfe Zeichen und Bild. Bilder + Klang bleiben besonders gut hängen.'], ['Hören', 'Welches Zeichen hörst du? Fehler sind okay – du bekommst einfach einen Hinweis.'], ['Wörter lesen', 'Jetzt liest du echte Wörter – mit den Zeichen, die du gerade kennengelernt hast.']];
let L = null;
function startLesson(gid) {
  const g = ALL_GROUPS.find(x => x.id === gid); if (!g) { location.hash = '#/kana'; return; }
  L = { g, stage: 0, i: 0, sel: null, matched: new Set() }; renderLesson();
}
const lessonTop = () => `<div class="ltop"><button class="icon-btn" data-a="quit" aria-label="Beenden">✕</button><div class="bar"><i style="width:${L.stage / 4 * 100}%"></i></div><span class="chip">${L.g.script === 'hira' ? 'あ' : 'ア'} ${L.g.title}</span></div>`;
const stageTip = () => `<div class="tip" style="margin-bottom:14px"><span>💡</span><span><b>${STAGES[L.stage][0]}.</b> ${STAGES[L.stage][1]}</span></div>`;
function renderLesson() {
  if (L.stage === 0) {
    const k = L.g.kana[L.i];
    view.innerHTML = `${lessonTop()}${L.i === 0 ? stageTip() : ''}<div class="card disc"><span class="chip">${L.i + 1} / ${L.g.kana.length}</span><div class="glyph">${k.k}</div><div class="emo" key="${k.k}">${k.e}</div><p class="hook">${esc(k.h)}</p>
      <div class="romaji">${S.settings.romaji || !canSpeak() ? k.r : '🔊'}</div><div class="row" style="justify-content:center"><button class="btn" data-a="say" data-t="${k.k}">🔊 Nochmal hören</button><button class="btn ghost" data-a="kana" data-k="${k.k}">✍️ Nachzeichnen</button></div></div>
      <div class="dotsrow">${L.g.kana.map((_, j) => `<i class="${j <= L.i ? 'on' : ''}"></i>`).join('')}</div>
      <button class="btn primary block" data-a="disc-next">${L.i === L.g.kana.length - 1 ? 'Zum Zuordnen' : 'Weiter'}</button>`;
    setTimeout(() => speak(k.k), 200);
  } else if (L.stage === 1) {
    if (!L.cols) L.cols = [shuffle(L.g.kana), shuffle(L.g.kana)];
    const done = L.matched.size === L.g.kana.length;
    view.innerHTML = `${lessonTop()}${stageTip()}<div class="card"><div class="pairs">${[0, 1].map(side => `<div class="stack" style="display:grid;gap:10px">${L.cols[side].map(k => `<button class="tile ${L.matched.has(k.k) ? 'ok' : ''} ${L.sel && L.sel.side === side && L.sel.k === k.k ? 'sel' : ''}" data-a="pair" data-side="${side}" data-k="${k.k}" ${side ? `aria-label="Bild zu ${k.r}"` : ''}><span class="g">${side ? k.e : k.k}</span></button>`).join('')}</div>`).join('')}</div></div>
      ${done ? '<button class="btn primary block" data-a="stage-next">Weiter zum Hören</button>' : '<p class="muted small" style="text-align:center">Tippe ein Zeichen und dann das passende Bild.</p>'}`;
  }
}
function pair(side, k) {
  if (L.matched.has(k)) return;
  if (!L.sel) { L.sel = { side, k }; renderLesson(); return; }
  if (L.sel.side === side) { L.sel = { side, k }; renderLesson(); return; }
  if (L.sel.k === k) { L.matched.add(k); L.sel = null; renderLesson(); speak(k); }
  else { const bad = [...view.querySelectorAll('.tile')].filter(t => t.dataset.k === k || t.dataset.k === L.sel.k); bad.forEach(t => t.classList.add('shake')); L.sel = null; setTimeout(renderLesson, 380); }
}
function stageNext() {
  L.stage++; L.i = 0;
  if (L.stage === 1) return renderLesson();
  if (L.stage === 2) {
    const ks = L.g.kana, qs = shuffle([...ks.map(k => qSound(k, ks)), ...ks.map(k => qPic(k, ks)), ...ks.map(k => qRead(k, ks))]).slice(0, Math.max(8, ks.length * 2));
    return startQuiz(qs, stageNext, lessonTop() + stageTip());
  }
  if (L.stage === 3) {
    const ks = new Set([...knownKana(), ...L.g.kana.map(k => k.k)]), ws = knownWords(ks), mine = ws.filter(w => w.chars.some(c => L.g.kana.some(k => k.k === c)));
    if (mine.length < 2) return finishLesson();
    return startQuiz(pick(mine, 6).map(w => qWord(w, ws.length >= 3 ? ws : WORDS)), finishLesson, lessonTop() + stageTip());
  }
}
function finishLesson() {
  const g = L.g, first = !S.groupsDone[g.id]; S.groupsDone[g.id] = true;
  g.kana.forEach(k => { if (!S.srs[k.k]) S.srs[k.k] = { box: 1, due: Date.now() + 18 * 36e5 }; });
  markActivity('new'); const nxt = nextGroup(), ws = knownWords();
  document.body.classList.add('focus');
  view.innerHTML = `<div class="party card"><div class="art">${mochi({ acc: 'cheer', mood: 'cheer' }, 130)}</div><h1>${first ? 'Gruppe geschafft! 🎉' : 'Schön wiederholt! 🌸'}</h1>
    <p class="jp" style="font-size:2rem;font-weight:700">${g.kana.map(k => k.k).join(' ')}</p>
    <p>Du kannst jetzt <b>${ws.length}</b> Wörter lesen. Die Zeichen kommen morgen sanft zur Wiederholung zurück – ganz ohne Stress.</p></div>
    ${nxt && nxt.id !== g.id ? `<a class="btn primary block" href="#/lesson/${nxt.id}">Weiter: ${nxt.title}</a><div style="height:10px"></div>` : ''}
    <a class="btn block" href="#/read/${recommendedStory().id}">🎧 Eine Geschichte lesen</a><div style="height:10px"></div><a class="btn ghost block" href="#/home">Zurück zu Heute</a>`;
  L = null;
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
    markActivity('review'); view.innerHTML = `<div class="party card">${mochi({ acc: 'cheer', mood: 'cheer' }, 120)}<h1>Wiederholung fertig! 🌸</h1><p>Je öfter du ein Zeichen mühelos erkennst, desto länger darf es ruhen.</p></div><a class="btn primary block" href="#/home">Zurück zu Heute</a>`;
  }, `<div class="tip" style="margin-bottom:14px"><span>🔁</span><span>Sanfte Wiederholung: Zeichen, die sitzen, kommen seltener. Hinweise sind immer frei.</span></div>`);
  Q.onResult = (k, ok) => rate(k, ok);
}

/* ---------- Geschichten ---------- */
let story = { token: 0, show: false };
function stopStory() { story.token++; if ('speechSynthesis' in window) speechSynthesis.cancel(); }
function viewReadList() {
  const ks = knownKana();
  view.innerHTML = `<div class="head"><div><h1>Lesen &amp; Hören</h1><p class="sub">Kleine Geschichten – verständlicher Input</p></div></div>
    <div class="tip"><span>🪜</span><span>Tippe auf Wörter für die Bedeutung. Wähle Geschichten, bei denen „Passt zu dir“ hoch ist – dann ist es genau ein kleiner Schritt (i + 1). Du musst nicht alles verstehen!</span></div><div style="height:14px"></div>
    ${STORIES.map(s => { const r = Math.round(storyRatio(s, ks) * 100); return `<a class="scard" href="#/read/${s.id}"><span class="em">${s.emoji}</span><span class="grow"><b>${s.title}</b><br><span class="small muted">${s.scene}</span></span><span class="col" style="text-align:right">${S.storiesRead[s.id] ? '<span class="chip green">gelesen ✔</span><br>' : ''}<span class="chip ${r >= 80 ? 'green' : r >= 40 ? 'sun' : ''}">Passt zu dir: ${r}%</span></span></a>`; }).join('')}`;
}
function viewStory(id) {
  const s = STORIES.find(x => x.id === id); if (!s) { location.hash = '#/read'; return; }
  const ks = knownKana(), r = Math.round(storyRatio(s, ks) * 100), av = { A: '🧑', B: '👩', N: '📖' };
  story.show = false;
  view.innerHTML = `<div class="head"><a class="icon-btn" href="#/read" aria-label="Zurück" style="display:grid;place-items:center;text-decoration:none">←</a><div class="grow"><h2 style="margin:0">${s.emoji} ${s.title}</h2><p class="sub">Du erkennst ${r}% der Zeichen</p></div></div>
    <div class="row wrap" style="margin-bottom:6px"><button class="btn sm primary" data-a="story-play" id="sp">🔊 Alles anhören</button><button class="btn sm" data-a="story-de">🇩🇪 Übersetzung zeigen</button></div>
    ${s.lines.map((l, i) => `<div class="line ${l.who}" id="ln${i}"><div class="av">${av[l.who]}</div><div class="bubble"><div class="jpl">${l.words.map(w => `<button class="w" data-a="word" data-jp="${w[0]}" data-ro="${esc(w[1])}" data-de="${esc(w[2])}">${w[0]}</button>`).join('')}${l.end}
      <button class="icon-btn" style="width:34px;height:34px;font-size:.9rem;margin-left:4px" data-a="story-line" data-i="${i}" aria-label="Zeile anhören">🔊</button></div>
      ${S.settings.romaji ? `<div class="ro">${l.words.map(w => esc(w[1])).join(' ')}</div>` : ''}<div class="de" hidden>${esc(l.de)}</div></div></div>`).join('')}
    <div class="gloss" id="gloss">👆 Tippe auf ein Wort</div>
    <div style="height:14px"></div><button class="btn primary block" data-a="story-done" data-id="${s.id}">Fertig – das hat Spaß gemacht ✔</button>`;
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

/* ---------- Methode ---------- */
function viewMethod() {
  view.innerHTML = `<div class="head"><div><h1>Die Methode</h1><p class="sub">Warum du hier ohne Pauken lernst</p></div></div>
    <div class="card" style="padding:8px 14px 14px">${SCENES.acquire}<p>Mochi basiert auf der <b>Natural-Approach-Idee von Stephen Krashen</b> (Linguist, University of Southern California). Seine Theorie besteht aus fünf Hypothesen – dazu kommt die stille Phase. Tippe auf eine Karte, um zu sehen, <b>was Krashen sagt</b> und <b>wie die App es umsetzt</b>.</p></div>
    ${METHOD.map(m => `<details class="m"><summary><span class="ic">${m.ic}</span><span>${m.t}<br><small class="muted" style="font-weight:600">${m.h}</small></span></summary><div class="m-body"><div class="k"><b class="l">Krashen</b>${m.k}</div><div class="a"><b class="l">In Mochi</b>${m.a}</div></div></details>`).join('')}
    <div class="card" style="margin-top:18px"><h3>So läuft ein typischer Tag</h3><ol class="steps"><li><b>🎧 Hören &amp; Lesen (2–4 Min.)</b> – eine kurze Geschichte mit Bild-Kontext, Wort-Tipps und Übersetzung.</li><li><b>🌱 Neues entdecken (4–6 Min.)</b> – eine Gruppe Zeichen: Entdecken → Zuordnen → Hören → Wörter lesen.</li><li><b>🔁 Sanft wiederholen (2–3 Min.)</b> – Zeichen kehren in wachsenden Abständen zurück (1, 2, 4, 8, 16 Tage).</li></ol></div>
    <div class="card"><h3>Was Mochi zusätzlich tut</h3><p><b>Merkbilder</b> (Dual Coding nach Allan Paivio: Wort + Bild) und <b>Spaced Repetition</b> (Ebbinghaus/Leitner) stammen nicht von Krashen. Sie unterstützen das Erinnern der Schriftzeichen und sind immer in Bedeutung eingebettet: Du siehst sofort echte Wörter, nicht nur Tabellen.</p></div>
    <div class="card"><h3>Ehrliche Einordnung</h3><p>Krashens Hypothesen sind einflussreich, aber auch umstritten: Sie sind schwer exakt zu prüfen, und Forschende wie Merrill Swain betonen, dass auch eigenes Sprechen (Output) und Feedback helfen. Realistisch heißt das: Mochi bringt dich sanft in die Schrift und ins Leseverstehen. Für echte Sprachkompetenz brauchst du darüber hinaus viel <b>echten Input</b> (Kinderbücher, einfache Podcasts, Videos mit Untertiteln) und – wenn du Lust hast – Gespräche.</p></div>
    <div class="card flat"><h3>Quellen</h3><ul class="small muted"><li>S. Krashen (1982): <i>Principles and Practice in Second Language Acquisition</i></li><li>S. Krashen (1985): <i>The Input Hypothesis: Issues and Implications</i></li><li>S. Krashen &amp; T. Terrell (1983): <i>The Natural Approach</i></li><li>M. Swain (1985): Output Hypothesis · A. Paivio (1971): Dual Coding Theory</li></ul></div>
    <button class="btn block" data-a="onb-again">🎬 Einführung noch einmal ansehen</button>`;
}

/* ---------- Einstellungen ---------- */
function viewSettings() {
  const s = S.settings;
  view.innerHTML = `<div class="head"><a class="icon-btn" href="#/home" aria-label="Zurück" style="display:grid;place-items:center;text-decoration:none">←</a><h1 class="grow" style="margin:0">Einstellungen</h1></div>
    <div class="card"><label class="set"><span>Dein Name</span><input class="txt" id="nm" style="max-width:180px" maxlength="20" value="${esc(S.name)}"></label>
    <label class="set"><span>Romaji anzeigen<br><small class="muted">Lateinische Umschrift als Stütze</small></span><input type="checkbox" data-a="set" data-key="romaji" ${s.romaji ? 'checked' : ''}></label>
    <label class="set"><span>Ton (japanische Stimme)<br><small class="muted">nutzt die Sprachausgabe deines Geräts</small></span><input type="checkbox" data-a="set" data-key="sound" ${s.sound ? 'checked' : ''}></label>
    <label class="set"><span>Darstellung</span><select data-a="set" data-key="theme"><option value="auto" ${s.theme === 'auto' ? 'selected' : ''}>Automatisch</option><option value="light" ${s.theme === 'light' ? 'selected' : ''}>Hell</option><option value="dark" ${s.theme === 'dark' ? 'selected' : ''}>Dunkel</option></select></label>
    <label class="set"><span>Startschrift</span><select data-a="set" data-key="focus"><option value="hira" ${S.focus === 'hira' ? 'selected' : ''}>Hiragana</option><option value="kata" ${S.focus === 'kata' ? 'selected' : ''}>Katakana</option></select></label></div>
    <p class="small muted">Alle Daten bleiben nur auf diesem Gerät (localStorage).</p>
    <button class="btn block" data-a="reset" style="color:var(--accent)">Fortschritt zurücksetzen</button>`;
}

/* ---------- Aktionen (Event-Delegation) ---------- */
const A = {
  go: t => (location.hash = '#/' + t.dataset.to),
  say: t => speak(t.dataset.t), qsay: () => speak(Q.qs[Q.i].say),
  kana: t => openKana(t.dataset.k), close: () => $('#sheet').close(),
  'trace-toggle': () => { const b = $('#tracebox'); b.children.length ? (b.innerHTML = '') : initTrace(b, $('#sheet .glyph').textContent); },
  'trace-clear': () => $('#trace')._ghost(),
  kscript: t => { kanaScript = t.dataset.v; viewKana(); }, kmode: t => { kanaMode = t.dataset.v; viewKana(); },
  'onb-next': () => viewOnboarding(onbStep + 1), 'onb-skip': () => viewOnboarding(ONB.length),
  'onb-focus': t => { S.focus = t.dataset.v; document.querySelectorAll('#focus button').forEach(b => b.classList.toggle('on', b === t)); },
  'onb-done': () => { S.name = ($('#nm').value || '').trim(); S.onboarded = true; save(); location.hash = '#/home'; if (location.hash === '#/home') route(); },
  'onb-again': () => { S.onboarded = false; location.hash = '#/onboarding'; route(); },
  ans: t => answer(+t.dataset.i), qnext, hint: () => { const q = Q?.qs[Q.i]; if (q) { const fb = $('#fb'); fb.className = 'fb no'; fb.innerHTML = '💡 ' + q.hint; } },
  quit: () => { stopStory(); const to = L ? '#/kana' : '#/home'; Q = null; L = null; location.hash = to; },
  'disc-next': () => { if (L.i < L.g.kana.length - 1) { L.i++; renderLesson(); } else stageNext(); },
  pair: t => pair(+t.dataset.side, t.dataset.k), 'stage-next': stageNext,
  word: t => { document.querySelectorAll('.w.on').forEach(e => e.classList.remove('on')); t.classList.add('on'); $('#gloss').innerHTML = `<span class="jp" style="font-size:1.2rem">${t.dataset.jp}</span> · ${t.dataset.ro} · <b>${t.dataset.de}</b>`; speak(t.dataset.jp); },
  'story-line': t => { const s = STORIES.find(x => x.id === location.hash.split('/')[2]); stopStory(); speak(lineText(s.lines[+t.dataset.i]), .72); },
  'story-play': t => { const id = location.hash.split('/')[2]; if (t.textContent.includes('Stopp')) { stopStory(); t.textContent = '🔊 Alles anhören'; document.querySelectorAll('.line').forEach(e => e.classList.remove('playing')); } else playStory(id); },
  'story-de': t => { story.show = !story.show; document.querySelectorAll('.bubble .de').forEach(e => (e.hidden = !story.show)); t.textContent = story.show ? '🇩🇪 Übersetzung verbergen' : '🇩🇪 Übersetzung zeigen'; },
  'story-done': t => { S.storiesRead[t.dataset.id] = true; markActivity('input'); toast('Schön! Wieder ein Stück verstanden 🌸'); location.hash = '#/home'; },
  set: t => { const k = t.dataset.key; if (k === 'focus') S.focus = t.value; else S.settings[k] = t.type === 'checkbox' ? t.checked : t.value; save(); applyTheme(); },
  reset: () => { if (confirm('Wirklich allen Fortschritt löschen?')) { const nm = S.name; S = structuredClone(DEFAULTS); S.name = nm; S.onboarded = true; save(); toast('Zurückgesetzt – neu starten ist auch Lernen 🌱'); location.hash = '#/home'; route(); } },
};
document.addEventListener('click', e => { const t = e.target.closest('[data-a]'); if (!t || t.tagName === 'SELECT' || t.type === 'checkbox') return; A[t.dataset.a]?.(t, e); });
document.addEventListener('change', e => { const t = e.target.closest('[data-a="set"]'); if (t) A.set(t); });
document.addEventListener('input', e => { if (e.target.id === 'nm' && location.hash === '#/settings') { S.name = e.target.value.trim(); save(); } });
$('#sheet').addEventListener('click', e => { if (e.target.id === 'sheet') e.target.close(); });
$('#sheet').addEventListener('close', () => { if ('speechSynthesis' in window) speechSynthesis.cancel(); });

/* ---------- Start ---------- */
applyTheme(); route();
if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) navigator.serviceWorker.register('sw.js').catch(() => {});
