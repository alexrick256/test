import { GROUPS, ALL_GROUPS, KANA, WORDS, STORIES, METHOD, TOPICS, LEVELS, LEVEL_INFO, GOALS, KANJI, KGROUPS, KANJI_MAP } from './data.js';
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
const EMPTY_DAY = () => ({ date: todayStr(), new: 0, kanji: 0, tnew: 0, input: 0, rev: 0 });
const DEFAULTS = { onboarded: false, name: '', focus: 'hira', level: 'N5', goals: ['alltag'], goalMin: 10, tracks: { script: true, lang: true },
  groupsDone: {}, srs: {}, wsrs: {}, ksrs: {}, topicsDone: {}, kanjiDone: {}, storiesRead: {}, time: {}, streak: { last: '', count: 0 },
  day: { date: '', new: 0, kanji: 0, tnew: 0, input: 0, rev: 0 }, settings: { romaji: true, sound: true, theme: 'auto', textScript: 'both' } };
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
  e.box = ok ? Math.min(5, e.box + 1) : Math.max(1, e.box - 1);
  e.due = Date.now() + INTERVALS[e.box] * DAY - (INTERVALS[e.box] ? 2 * 36e5 : 0); S[st][k] = e; save();
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
let backTo = '#/home';
function route() {
  stopStory();
  const [, p1 = 'home', p2] = location.hash.split('/');
  if (!S.onboarded && p1 !== 'onboarding') { location.hash = '#/onboarding'; return; }
  rollDay();
  const focus = ['onboarding', 'lesson', 'review', 'topic', 'wreview', 'kanji', 'kreview'].includes(p1);
  backTo = ['topic', 'wreview'].includes(p1) ? '#/read' : ['lesson', 'kanji', 'kreview'].includes(p1) ? '#/kana' : '#/home';
  document.body.classList.toggle('focus', focus);
  const tab = { lesson: 'kana', kanji: 'kana', kreview: 'kana', topic: 'read', wreview: 'read', review: 'kana' }[p1] || p1;
  document.querySelectorAll('#tabs a').forEach(a => a.classList.toggle('on', a.dataset.tab === tab));
  const R = { home: viewHome, kana: () => viewKana(), lesson: () => startLesson(p2), review: () => startReview(p2 === 'free'), topic: () => startTopic(p2), wreview: () => startWordReview(p2 === 'free'),
    kanji: () => startKanji(p2), kreview: () => startKanjiReview(p2 === 'free'),
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
function recommendedStory() {
  const ks = knownKana(), kw = knownWordSet(), unread = STORIES.filter(s => !S.storiesRead[s.id] && lvIdx(s.lvl) >= lvIdx(S.level)), pool = unread.length ? unread : STORIES.filter(s => !S.storiesRead[s.id]).length ? STORIES.filter(s => !S.storiesRead[s.id]) : STORIES;
  const r = S.tracks.lang ? s => storyWordRatio(s, kw) : s => storyRatio(s, ks);
  return [...pool].sort((a, b) => lvIdx(a.lvl) - lvIdx(b.lvl) || Math.abs(r(a) - .8) - Math.abs(r(b) - .8))[0];
}
const countKnown = sc => GROUPS[sc].filter(g => S.groupsDone[g.id]).reduce((n, g) => n + g.kana.length, 0);
const dueWords = () => Object.entries(S.wsrs).filter(([, v]) => v.due <= Date.now()).sort((a, b) => a[1].due - b[1].due).map(([w]) => ITEMS[w]).filter(Boolean);
const nextTopic = () => { const open = TOPICS.filter(t => !S.topicsDone[t.id]); return [...open].filter(t => lvIdx(t.lvl) >= lvIdx(S.level)).sort((a, b) => lvIdx(a.lvl) - lvIdx(b.lvl) || tagScore(b) - tagScore(a))[0] || open[0]; };
const nextKanjiGroup = () => { const open = KGROUPS.filter(g => !S.kanjiDone[g.id]); return open.find(g => lvIdx(g.lvl) >= lvIdx(S.level)) || open[0]; };

function lvlPct(L) {
  if (lvIdx(L) < lvIdx(S.level)) return 100;
  let tot = 0, done = 0;
  if (S.tracks.lang) {
    TOPICS.filter(t => t.lvl === L).forEach(t => { tot += t.items.length; if (S.topicsDone[t.id]) done += t.items.length; });
    STORIES.filter(x => x.lvl === L).forEach(x => { tot += 5; if (S.storiesRead[x.id]) done += 5; });
  }
  if (S.tracks.script) {
    KGROUPS.filter(g => g.lvl === L).forEach(g => { tot += g.items.length; if (S.kanjiDone[g.id]) done += g.items.length; });
    if (L === 'N5') { tot += 71; done += (countKnown('hira') + countKnown('kata')) / 2; }
  }
  return tot ? Math.round(done / tot * 100) : 0;
}
const LVC = ['var(--green)', 'var(--indigo)', 'var(--sun)', 'var(--accent)', 'var(--violet)'];
function ring(pct, { size = 64, sw = 7, color = 'var(--accent)', inner = '' } = {}) {
  const r = (size - sw) / 2, c = 2 * Math.PI * r, h = size / 2;
  return `<svg class="ring" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" aria-hidden="true"><circle cx="${h}" cy="${h}" r="${r}" fill="none" stroke="var(--line)" stroke-width="${sw}"/><circle class="rf" cx="${h}" cy="${h}" r="${r}" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-dasharray="${c.toFixed(1)}" stroke-dashoffset="${(c * (1 - Math.min(100, pct) / 100)).toFixed(1)}" transform="rotate(-90 ${h} ${h})"/>${inner}</svg>`;
}
const ringText = (t, size, fs, dy = 0) => `<text x="${size / 2}" y="${size / 2 + dy}" text-anchor="middle" dominant-baseline="central" style="font:800 ${fs}px var(--ui);fill:var(--ink)">${t}</text>`;
const fmt = sec => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;

function nextAction() {
  const T_ = S.tracks, d = S.day, g = nextGroup(), kg = nextKanjiGroup(), nt = nextTopic(), st = recommendedStory();
  const dueK = dueKana().length, dueJ = dueKanji().length, dueW = dueWords().length;
  const review = dueK ? '#/review' : dueJ ? '#/kreview' : dueW ? '#/wreview' : knownKana().size ? '#/review/free' : Object.keys(S.wsrs).length ? '#/wreview/free' : null;
  const A_ = [];
  if (T_.lang && !d.input) A_.push({ ic: '🎧', t: 'Geschichte hören', s: st.title, href: '#/read/' + st.id });
  const kana = T_.script && !d.new && g && { ic: 'あ', t: 'Neue Kana', s: `${g.script === 'hira' ? 'Hiragana' : 'Katakana'} · ${g.title}`, href: '#/lesson/' + g.id };
  const kanji = T_.script && !d.kanji && kg && { ic: '漢', t: 'Neue Kanji', s: `${kg.lvl} · Satz ${kg.n}`, href: '#/kanji/' + kg.id };
  (S.goals.includes('jlpt') ? [kanji, kana] : [kana, kanji]).forEach(x => x && A_.push(x));
  if (T_.lang && !d.tnew && nt) A_.push({ ic: '🗣️', t: 'Neues Thema', s: `${nt.emoji} ${nt.title}`, href: '#/topic/' + nt.id });
  if (d.rev < 10 && review) A_.push({ ic: '🔁', t: 'Wiederholen', s: 'sanft & ohne Druck', href: review });
  return A_[0] || { ic: '🌿', t: 'Freies Lernen', s: 'Alle Tagesaufgaben sind erledigt', href: review || '#/read' };
}

function viewHome() {
  const d = S.day, T_ = S.tracks, secs = S.time[todayStr()] || 0, goal = S.goalMin * 60, pct = Math.min(100, Math.round(secs / goal * 100));
  const hr = new Date().getHours(), greet = hr < 11 ? 'Ohayou' : hr < 18 ? 'Konnichiwa' : 'Konbanwa', yest = new Date(Date.now() - DAY).toLocaleDateString('sv');
  const week = [...Array(7)].map((_, k) => { const dt = new Date(Date.now() - (6 - k) * DAY); return { day: dt.toLocaleDateString('de', { weekday: 'narrow' }), s: S.time[dt.toLocaleDateString('sv')] || 0, today: k === 6 }; });
  const g = nextGroup(), kg = nextKanjiGroup(), nt = nextTopic(), st = recommendedStory(), na = nextAction();
  const dueAny = dueKana().length + dueKanji().length + dueWords().length;
  const rev = dueKana().length ? '#/review' : dueKanji().length ? '#/kreview' : dueWords().length ? '#/wreview' : knownKana().size ? '#/review/free' : '#/read';
  const tasks = [
    ...(T_.script ? [{ ic: 'あ', n: 'Kana', v: d.new, goal: 1, href: g ? '#/lesson/' + g.id : '#/kana' }, { ic: '漢', n: 'Kanji', v: d.kanji, goal: 1, href: kg ? '#/kanji/' + kg.id : '#/kana' }] : []),
    ...(T_.lang ? [{ ic: '🗣️', n: 'Thema', v: d.tnew, goal: 1, href: nt ? '#/topic/' + nt.id : '#/read' }, { ic: '🎧', n: 'Story', v: d.input, goal: 1, href: '#/read/' + st.id }] : []),
    { ic: '🔁', n: 'Üben', v: d.rev, goal: 10, href: rev },
  ];
  const streak = S.streak.last === todayStr() || S.streak.last === yest ? S.streak.count : 0;
  view.innerHTML = `<div class="dboard">
    <div class="head tight"><div class="hero">${mochi({ acc: 'wave' }, 56)}<div><p class="sub">${greet}${S.name ? ', ' + esc(S.name) : ''}!</p><h1>Dashboard</h1></div></div>
      <div class="row" style="gap:8px"><span class="chip sun">🔥 ${streak}</span><button class="icon-btn" data-a="go" data-to="settings" aria-label="Einstellungen">⚙️</button></div></div>
    <section class="card daily"><div class="dring">${ring(pct, { size: 112, sw: 11, inner: ringText(pct + '%', 112, 26) })}</div>
      <div class="dtxt"><span class="small muted">Tagesziel · ${S.goalMin} Min.</span>
        <b class="big">${pct >= 100 ? 'Geschafft! 🎉' : `Noch ${100 - pct} %`}</b><span class="small muted">${fmt(secs)} von ${S.goalMin}:00 Min.</span>
        <div class="week" aria-label="Lernzeit der letzten 7 Tage">${week.map(w => `<span class="wb ${w.today ? 'today' : ''}"><i style="height:${Math.max(6, Math.min(100, w.s / goal * 100))}%" class="${w.s >= goal ? 'full' : ''}"></i><small>${w.day}</small></span>`).join('')}</div></div></section>
    <h3 class="sec">JLPT-Stufen <small class="muted">dein Fortschritt</small></h3>
    <div class="lvls">${LEVELS.map((L, i) => { const p = lvlPct(L); return `<button class="lv" data-a="lvl-go" data-v="${L}" aria-label="${L}: ${p}%">${ring(p, { size: 62, sw: 7, color: LVC[i], inner: ringText(p + '%', 62, 14) })}<b>${L}</b><small class="muted">${lvIdx(L) < lvIdx(S.level) ? 'bekannt' : LEVEL_INFO[L].split(' ')[0]}</small></button>`; }).join('')}</div>
    <h3 class="sec">Heute <small class="muted">${dueAny ? dueAny + ' zur Wiederholung' : 'Aufgaben'}</small></h3>
    <div class="tasks">${tasks.map(t => { const p = Math.min(100, t.v / t.goal * 100); return `<a class="tk ${p >= 100 ? 'done' : ''}" href="${t.href}">${ring(p, { size: 54, sw: 6, color: p >= 100 ? 'var(--green)' : 'var(--accent)', inner: `<text x="27" y="27" text-anchor="middle" dominant-baseline="central" style="font:700 ${t.ic.length > 1 && /[a-z]/i.test(t.ic) ? 14 : 20}px var(--jp);fill:var(--ink)">${t.ic}</text>` })}<small>${t.n} <span class="muted">${Math.min(t.v, t.goal)}/${t.goal}</span></small></a>`; }).join('')}</div>
    <a class="btn primary block go" href="${na.href}"><span class="goic">${na.ic}</span><span class="gotx"><b>Weiterlernen: ${na.t}</b><small>${na.s}</small></span><span>▶</span></a></div>`;
}

/* ---------- Kana-Übersicht & Tafel ---------- */
let kanaScript = 'hira', kanaMode = 'lessons', kanjiLvl = null, langLvl = null;
const lvSeg = (cur, act) => `<div class="seg lv-seg">${LEVELS.map(l => `<button data-a="${act}" data-v="${l}" class="${cur === l ? 'on' : ''}">${l}</button>`).join('')}</div>`;
function viewKana() {
  kanjiLvl = kanjiLvl || S.level;
  const nxt = nextGroup(), isK = kanaScript === 'kanji', nkg = nextKanjiGroup();
  let body = '';
  if (isK) {
    const gs = KGROUPS.filter(g => g.lvl === kanjiLvl), dj = dueKanji().length;
    body = kanaMode === 'lessons'
      ? `<div class="tip"><span>💡</span><span>Kanji lernst du in Fünfer-Sätzen, immer mit einem echten Beispielwort. Du musst nichts schreiben.</span></div>
        ${dj ? `<a class="btn block sm" style="margin-top:10px" href="#/kreview">🔁 ${dj} Kanji wiederholen</a>` : ''}<div style="height:10px"></div>
        ${gs.map(g => `<button class="gcard ${S.kanjiDone[g.id] ? 'done' : ''} ${nkg && nkg.id === g.id ? 'next' : ''}" data-a="go" data-to="kanji/${g.id}"><span class="num">${S.kanjiDone[g.id] ? '✔' : g.n}</span><span class="grow"><b>Satz ${g.n}</b><br><span class="glyphs">${g.items.map(k => k.k).join(' ')}</span></span>${nkg && nkg.id === g.id ? '<span class="chip red">empfohlen</span>' : S.kanjiDone[g.id] ? '<span class="chip green">gelernt</span>' : ''}</button>`).join('')}`
      : `<div class="chart">${KANJI.filter(k => k.lvl === kanjiLvl).map(k => { const e = S.ksrs[k.k]; return `<button class="tile ${e ? 'k' + e.box : 'lock'}" data-a="kanjiinfo" data-k="${k.k}"><span class="g">${k.k}</span><span class="r">${esc(k.de.split(' / ')[0])}</span></button>`; }).join('')}</div>`;
  } else {
    const gs = GROUPS[kanaScript];
    body = kanaMode === 'lessons' ? `<div class="tip"><span>💡</span><span>${kanaScript === 'hira' ? 'Hiragana ist die Grundschrift für jedes japanische Wort.' : 'Katakana schreibt Fremdwörter wie コーヒー (Kaffee).'} Jede Gruppe ist frei wählbar.</span></div><div style="height:10px"></div>
      ${gs.map(g => `<button class="gcard ${S.groupsDone[g.id] ? 'done' : ''} ${nxt && nxt.id === g.id ? 'next' : ''}" data-a="go" data-to="lesson/${g.id}"><span class="num">${S.groupsDone[g.id] ? '✔' : g.n}</span>
        <span class="grow"><b>${g.title}</b><br><span class="glyphs">${g.kana.map(k => k.k).join(' ')}</span></span>${nxt && nxt.id === g.id ? '<span class="chip red">empfohlen</span>' : S.groupsDone[g.id] ? '<span class="chip green">gelernt</span>' : ''}</button>`).join('')}`
      : `<div class="chart">${gs.flatMap(g => g.kana).map(k => { const e = S.srs[k.k]; return `<button class="tile ${e ? 'k' + e.box : 'lock'}" data-a="kana" data-k="${k.k}"><span class="g">${k.k}</span><span class="r">${k.r}</span></button>`; }).join('')}</div>`;
  }
  view.innerHTML = `<div class="head tight"><div><h1>Schrift</h1><p class="sub">Kana &amp; Kanji – unabhängig von der Sprache</p></div></div>
    <div class="seg" role="tablist"><button data-a="kscript" data-v="hira" class="${kanaScript === 'hira' ? 'on' : ''}"><span class="jp">あ</span> Hiragana</button><button data-a="kscript" data-v="kata" class="${kanaScript === 'kata' ? 'on' : ''}"><span class="jp">ア</span> Katakana</button><button data-a="kscript" data-v="kanji" class="${isK ? 'on' : ''}"><span class="jp">漢</span> Kanji</button></div>
    ${isK ? lvSeg(kanjiLvl, 'klvl') : ''}
    <div class="seg"><button data-a="kmode" data-v="lessons" class="${kanaMode === 'lessons' ? 'on' : ''}">Lektionen</button><button data-a="kmode" data-v="chart" class="${kanaMode === 'chart' ? 'on' : ''}">Tafel</button></div>${body}`;
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
  const ts = S.settings.textScript, shown = q.item ? (ts === 'romaji' ? q.item.r : q.item.w) : '';
  const prompt = q.kind === 'kmean' ? `<div class="glyph">${q.big}</div><p class="muted small">Was bedeutet dieses Zeichen?</p>`
    : q.kind === 'kpick' ? `<div class="wordbig" style="font-family:var(--ui);font-size:1.7rem">${esc(q.big)}</div><p class="muted small">Welches Zeichen ist das?</p>`
    : q.kind === 'kword' ? `<div class="wordbig">${q.big}</div><button class="btn sm" data-a="qsay" style="margin-top:8px">🔊 Hören</button><p class="muted small" style="margin-top:8px">Was bedeutet das Wort?</p>`
    : q.kind === 'lsound' ? `<button class="btn" data-a="qsay" style="font-size:1.3rem;padding:18px 28px">🔊 Hören</button><p class="muted small" style="margin-top:10px">${canSpeak() ? 'Was bedeutet das, was du hörst?' : `Klingt wie: <b>${q.item.r}</b>`}</p>`
    : q.kind === 'lword' ? `<div class="wordbig">${shown}</div>${ts === 'both' ? `<div class="muted">${q.item.r}</div>` : ''}<button class="btn sm" data-a="qsay" style="margin-top:8px">🔊 Hören</button><p class="muted small" style="margin-top:8px">Was bedeutet das?</p>`
    : q.kind === 'sound' ? `<button class="btn" data-a="qsay" style="font-size:1.3rem;padding:18px 28px">🔊 Hören</button><p class="muted small" style="margin-top:10px">${romajiVisible ? `Klingt wie: <b>${KANA[q.kana].r}</b>` : 'Welches Zeichen hörst du?'}</p>`
    : q.kind === 'pic' ? `<div class="glyph" style="font-size:5rem">${q.pic}</div><p class="muted small">Welches Zeichen gehört zu diesem Bild?</p>`
    : q.kind === 'word' ? `<div class="wordbig">${q.big}</div><button class="btn sm" data-a="qsay">🔊 Hören</button><p class="muted small" style="margin-top:8px">Was bedeutet das Wort?</p>`
    : `<div class="glyph">${q.big}</div><p class="muted small">Wie klingt dieses Zeichen?</p>`;
  view.innerHTML = `${Q.i === 0 ? Q.topHtml : Q.topHtml.replace(/<div class="tip"[\s\S]*?<\/div>/, '')}${Q.topHtml.includes('class="ltop"') ? '' : `<div class="ltop"><button class="icon-btn" data-a="quit" aria-label="Beenden">✕</button><div class="bar"><i style="width:${Q.i / total * 100}%"></i></div></div>`}
    <div class="card"><div class="prompt">${prompt}</div>
      <div class="opts ${q.opts[0].txt ? 'col1' : ''}">${q.opts.map((o, i) => `<button class="opt ${o.txt ? 'txt' : ''}" data-a="ans" data-i="${i}">${o.html}</button>`).join('')}</div>
      <div class="fb" id="fb" aria-live="polite"></div>
      <div class="row between"><button class="btn sm ghost" data-a="hint">💡 Tipp</button><button class="btn primary" id="nxt" data-a="qnext" style="visibility:hidden">Weiter</button></div></div>`;
  Q.ans = false; if (q.kind === 'sound' || q.kind === 'lsound') setTimeout(() => speak(q.say), 250);
}
function answer(i) {
  if (Q.ans) return; Q.ans = true; const q = Q.qs[Q.i], btns = [...view.querySelectorAll('.opt')], ok = q.opts[i].ok;
  btns.forEach((b, j) => { b.disabled = true; if (q.opts[j].ok) b.classList.add(ok || j === i ? 'good' : 'soft'); else if (j !== i) b.classList.add('dim'); });
  const fb = $('#fb');
  if (ok) { Q.right++; fb.className = 'fb ok'; fb.innerHTML = `${OK_MSG[Math.random() * OK_MSG.length | 0]}<br><span class="small">${q.explain}</span>`; }
  else { fb.className = 'fb no'; fb.innerHTML = `Fast! 🌱 ${q.explain}.<br><span class="small muted">Kein Problem – das kommt gleich nochmal vorbei.</span>`; if (!q.retry) Q.qs.push({ ...q, retry: true, opts: shuffle(q.opts) }); }
  if (q.kana) Q.onResult?.(q.kana, ok);
  if (q.wkey) Q.onWResult?.(q.wkey, ok);
  if (q.kkey) Q.onKResult?.(q.kkey, ok);
  if (Q.isRev) { S.day.rev++; save(); }
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
    <a class="btn block" href="#/read/${recommendedStory().id}">🎧 Eine Geschichte lesen</a><div style="height:10px"></div><a class="btn ghost block" href="#/home">Zurück zum Dashboard</a>`;
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
const TSTAGES = [['Entdecken', 'Nimm Bedeutung über Bild und Klang auf – noch ohne Test. Verstehen kommt vor Erinnern.'], ['Hören & verstehen', 'Ordne dem Klang eine Bedeutung zu. Raten ist erlaubt, Fehler kosten nichts.'], ['Wörter erkennen', 'Jetzt siehst du die Wörter – erkennst du sie wieder?']];
const topicTop = () => `<div class="ltop"><button class="icon-btn" data-a="quit" aria-label="Beenden">✕</button><div class="bar"><i style="width:${T.stage / 3 * 100}%"></i></div><span class="chip">${T.t.emoji} ${T.t.title}</span></div>`;
const topicTip = () => `<div class="tip" style="margin-bottom:14px"><span>💡</span><span><b>${TSTAGES[T.stage][0]}.</b> ${TSTAGES[T.stage][1]}</span></div>`;
function startTopic(id) {
  const t = TOPICS.find(x => x.id === id); if (!t) { location.hash = '#/read'; return; }
  T = { t, stage: 0, i: 0, items: t.items.map(([w, r, d, e]) => ({ w, r, d, e })) }; renderTopic();
}
function renderTopic() {
  const it = T.items[T.i], ts = S.settings.textScript;
  view.innerHTML = `${topicTop()}${T.i === 0 ? topicTip() : ''}<div class="card disc"><span class="chip">${T.i + 1} / ${T.items.length}</span><div class="emo" style="font-size:5.5rem">${it.e}</div>
    <div class="wordbig jp" style="font-size:2.6rem;font-weight:700">${ts === 'romaji' ? it.r : it.w}</div>${ts === 'both' ? `<div class="romaji">${it.r}</div>` : ''}<p class="hook"><b>${esc(it.d)}</b></p>
    <button class="btn" data-a="say" data-t="${it.w}">🔊 Nochmal hören</button></div>
    <div class="dotsrow">${T.items.map((_, j) => `<i class="${j <= T.i ? 'on' : ''}"></i>`).join('')}</div>
    <button class="btn primary block" data-a="t-next">${T.i === T.items.length - 1 ? 'Zum Hören' : 'Weiter'}</button>`;
  setTimeout(() => speak(it.w), 200);
}
function topicNext() {
  if (T.stage === 0) { if (T.i < T.items.length - 1) { T.i++; return renderTopic(); } T.stage = 1; return startQuiz(shuffle(T.items.map(it => lq(it, 'lsound'))), topicNext, topicTop() + topicTip()); }
  if (T.stage === 1) { T.stage = 2; return startQuiz(shuffle(T.items.map(it => lq(it, 'lword'))), topicNext, topicTop() + topicTip()); }
  const t = T.t; S.topicsDone[t.id] = true; T.items.forEach(it => { if (!S.wsrs[it.w]) S.wsrs[it.w] = { box: 1, due: Date.now() + 18 * 36e5 }; });
  markActivity('tnew'); const nt = nextTopic(), st = recommendedStory(); T = null;
  view.innerHTML = `<div class="party card"><div class="art">${mochi({ acc: 'cheer', mood: 'cheer' }, 130)}</div><h1>Thema geschafft! 🎉</h1><p style="font-size:2.2rem">${t.emoji}</p>
    <p>Diese Wörter kommen morgen sanft zur Wiederholung zurück. Wörter, die du schon kennst, erkennst du in Geschichten sofort wieder.</p></div>
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
const KSTAGES = [['Entdecken', 'Sieh dir Zeichen und Beispielwort an. Die Bedeutung kommt über den Kontext – noch kein Test.'], ['Erkennen', 'Ordne Zeichen und Bedeutung zu. Raten ist erlaubt.'], ['Im Wort', 'Jetzt siehst du das Zeichen in einem echten Wort.']];
const kTop = () => `<div class="ltop"><button class="icon-btn" data-a="quit" aria-label="Beenden">✕</button><div class="bar"><i style="width:${J.stage / 3 * 100}%"></i></div><span class="chip">漢 ${J.g.lvl} · Satz ${J.g.n}</span></div>`;
const kTip = () => `<div class="tip"><span>💡</span><span><b>${KSTAGES[J.stage][0]}.</b> ${KSTAGES[J.stage][1]}</span></div>`;
function startKanji(id) {
  const g = KGROUPS.find(x => x.id === id); if (!g) { location.hash = '#/kana'; return; }
  kanaScript = 'kanji'; kanjiLvl = g.lvl; J = { g, stage: 0, i: 0 }; renderKanji();
}
function renderKanji() {
  const k = J.g.items[J.i];
  view.innerHTML = `${kTop()}${J.i === 0 ? kTip() : ''}<div class="card disc"><span class="chip">${J.i + 1} / ${J.g.items.length}</span><div class="glyph">${k.k}</div><h2 style="margin:.1em 0">${esc(k.de)}</h2>
    <div class="romaji" style="font-size:1.05rem">${k.r}</div><p class="hook jp"><b>${k.ex.w}</b> <span class="muted" style="font-family:var(--ui)">${k.ex.r}</span><br><span style="font-family:var(--ui)">${esc(k.ex.d)}</span></p>
    <button class="btn" data-a="say" data-t="${k.ex.w}">🔊 Beispielwort hören</button></div>
    <div class="dotsrow">${J.g.items.map((_, j) => `<i class="${j <= J.i ? 'on' : ''}"></i>`).join('')}</div>
    <button class="btn primary block pin" data-a="k-next">${J.i === J.g.items.length - 1 ? 'Zum Erkennen' : 'Weiter'}</button>`;
  setTimeout(() => speak(k.ex.w), 200);
}
function kanjiNext() {
  const it = J.g.items;
  if (J.stage === 0) { if (J.i < it.length - 1) { J.i++; return renderKanji(); } J.stage = 1; return startQuiz(shuffle([...it.map(qKMean), ...it.map(qKPick)]), kanjiNext, kTop() + kTip()); }
  if (J.stage === 1) { J.stage = 2; return startQuiz(shuffle(it.map(qKWord)), kanjiNext, kTop() + kTip()); }
  const g = J.g; S.kanjiDone[g.id] = true; g.items.forEach(k => { if (!S.ksrs[k.k]) S.ksrs[k.k] = { box: 1, due: Date.now() + 18 * 36e5 }; });
  markActivity('kanji'); const nx = nextKanjiGroup(); J = null;
  view.innerHTML = `<div class="party card"><div class="art">${mochi({ acc: 'cheer', mood: 'cheer' }, 110)}</div><h1>Kanji-Satz geschafft! 🎉</h1><p class="jp" style="font-size:2rem;font-weight:700">${g.items.map(k => k.k).join(' ')}</p>
    <p>Sie kommen morgen sanft zur Wiederholung zurück.</p></div>
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
function openKanji(ch) {
  const k = KANJI_MAP[ch], sh = $('#sheet');
  sh.innerHTML = `<div class="between row"><span class="chip">${k.lvl} · ${k.r}</span><button class="icon-btn" data-a="close" aria-label="Schließen">✕</button></div>
    <div class="disc"><div class="glyph" style="font-size:6rem">${k.k}</div><h2>${esc(k.de)}</h2><p class="hook jp"><b>${k.ex.w}</b> ${k.ex.r} – ${esc(k.ex.d)}</p><button class="btn" data-a="say" data-t="${k.ex.w}">🔊 Anhören</button> <button class="btn ghost" data-a="trace-toggle">✍️ Nachzeichnen</button><div id="tracebox"></div></div>`;
  sh.showModal(); speak(k.ex.w);
}

/* ---------- Geschichten ---------- */
let story = { token: 0, show: false };
function stopStory() { story.token++; if ('speechSynthesis' in window) speechSynthesis.cancel(); }
const WORD_TEXT = w => (S.settings.textScript === 'romaji' ? w[1] : w[0]);
function viewReadList() {
  langLvl = langLvl || S.level;
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
  const ks = knownKana(), r = Math.round(storyWordRatio(s) * 100), av = { A: '🧑', B: '👩', N: '📖' }, ts = S.settings.textScript;
  story.show = false;
  view.innerHTML = `<div class="head"><a class="icon-btn" href="#/read" aria-label="Zurück" style="display:grid;place-items:center;text-decoration:none">←</a><div class="grow"><h2 style="margin:0">${s.emoji} ${s.title}</h2><p class="sub">Du kennst ${r}% der Wörter${ks.size ? ` · ${Math.round(storyRatio(s, ks) * 100)}% der Zeichen` : ''}</p></div></div>
    <div class="row wrap" style="margin-bottom:6px"><button class="btn sm primary" data-a="story-play" id="sp">🔊 Alles anhören</button><button class="btn sm" data-a="story-de">🇩🇪 Übersetzung zeigen</button></div>
    ${s.lines.map((l, i) => `<div class="line ${l.who}" id="ln${i}"><div class="av">${av[l.who]}</div><div class="bubble"><div class="jpl">${l.words.map(w => `<button class="w" data-a="word" data-jp="${w[0]}" data-ro="${esc(w[1])}" data-de="${esc(w[2])}">${ts === 'romaji' ? esc(w[1]) : w[0]}</button>`).join('')}${ts === 'romaji' ? '' : l.end}
      <button class="icon-btn" style="width:34px;height:34px;font-size:.9rem;margin-left:4px" data-a="story-line" data-i="${i}" aria-label="Zeile anhören">🔊</button></div>
      ${ts === 'kana' ? '' : ts === 'romaji' ? '' : `<div class="ro">${l.words.map(w => esc(w[1])).join(' ')}</div>`}<div class="de" hidden>${esc(l.de)}</div></div></div>`).join('')}
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
    <div class="card"><h3>N5 bis N1</h3><p>Die Inhalte folgen den fünf JLPT-Stufen. Die Prozentwerte im Dashboard zeigen, wie viel der <b>in Mochi enthaltenen</b> Themen, Geschichten, Kanji und Kana einer Stufe du geschafft hast. Das ist eine kuratierte Auswahl und kein vollständiger Prüfungswortschatz: Für N1 braucht man über 2.000 Kanji, hier sind es die häufigsten Alltags- und Einstiegszeichen. Mehr Stoff lässt sich einfach in <code>js/data.js</code> ergänzen.</p></div><div class="card"><h3>Zwei getrennte Wege: Schrift &amp; Sprache</h3><p>Lesen und Schreiben sind eigene Fertigkeiten. Nach Krashen steht beim Spracherwerb das <b>Verstehen gesprochener und geschriebener Sprache</b> im Mittelpunkt – dafür musst du die Schrift nicht beherrschen. Deshalb kannst du in Mochi <b>die Schrift</b> (Hiragana &amp; Katakana) und <b>die Sprache</b> (Themen, Wörter, Geschichten mit Romaji, Ton und Übersetzung) <b>unabhängig voneinander</b> lernen – nur einen Weg, beide parallel oder später den anderen dazu. Wenn du beides lernst, verknüpft sich das von selbst: In Geschichten siehst du Wörter in Kana, sobald du die Zeichen kennst. Umschalten geht jederzeit unter ⚙️.</p></div><div class="card"><h3>Was Mochi zusätzlich tut</h3><p><b>Merkbilder</b> (Dual Coding nach Allan Paivio: Wort + Bild) und <b>Spaced Repetition</b> (Ebbinghaus/Leitner) stammen nicht von Krashen. Sie unterstützen das Erinnern der Schriftzeichen und sind immer in Bedeutung eingebettet: Du siehst sofort echte Wörter, nicht nur Tabellen.</p></div>
    <div class="card"><h3>Ehrliche Einordnung</h3><p>Krashens Hypothesen sind einflussreich, aber auch umstritten: Sie sind schwer exakt zu prüfen, und Forschende wie Merrill Swain betonen, dass auch eigenes Sprechen (Output) und Feedback helfen. Realistisch heißt das: Mochi bringt dich sanft in die Schrift und ins Leseverstehen. Für echte Sprachkompetenz brauchst du darüber hinaus viel <b>echten Input</b> (Kinderbücher, einfache Podcasts, Videos mit Untertiteln) und – wenn du Lust hast – Gespräche.</p></div>
    <div class="card flat"><h3>Quellen</h3><ul class="small muted"><li>S. Krashen (1982): <i>Principles and Practice in Second Language Acquisition</i></li><li>S. Krashen (1985): <i>The Input Hypothesis: Issues and Implications</i></li><li>S. Krashen &amp; T. Terrell (1983): <i>The Natural Approach</i></li><li>M. Swain (1985): Output Hypothesis · A. Paivio (1971): Dual Coding Theory</li></ul></div>
    <button class="btn block" data-a="onb-again">🎬 Einführung noch einmal ansehen</button>`;
}

/* ---------- Einstellungen ---------- */
function viewSettings() {
  const s = S.settings, sel = (v, cur, l) => `<option value="${v}" ${String(cur) === String(v) ? 'selected' : ''}>${l}</option>`;
  view.innerHTML = `<div class="head tight"><a class="icon-btn" href="#/home" aria-label="Zurück" style="display:grid;place-items:center;text-decoration:none">←</a><h1 class="grow" style="margin:0">Einstellungen</h1></div>
    <div class="card"><h3>Lernen</h3>
    <label class="set"><span>Tagesziel</span><select data-a="set" data-key="goalMin">${[5, 10, 15, 20, 30].map(m => sel(m, S.goalMin, m + ' Min.')).join('')}</select></label>
    <label class="set"><span>Mein Niveau<br><small class="muted">Startpunkt für Empfehlungen</small></span><select data-a="set" data-key="level">${LEVELS.map(l => sel(l, S.level, `${l} · ${LEVEL_INFO[l]}`)).join('')}</select></label>
    <label class="set"><span>✍️ Schrift<br><small class="muted">Kana &amp; Kanji</small></span><input type="checkbox" data-a="set" data-key="track-script" ${S.tracks.script ? 'checked' : ''}></label>
    <label class="set"><span>💬 Sprache<br><small class="muted">Themen, Wörter &amp; Geschichten</small></span><input type="checkbox" data-a="set" data-key="track-lang" ${S.tracks.lang ? 'checked' : ''}></label>
    <label class="set"><span>Text in Wörtern &amp; Geschichten</span><select data-a="set" data-key="textScript">${sel('romaji', s.textScript, 'nur Romaji')}${sel('both', s.textScript, 'Kana + Romaji')}${sel('kana', s.textScript, 'nur Kana')}</select></label>
    <p style="margin:12px 0 6px"><b>Meine Ziele</b></p><div class="goals sm">${GOALS.map(g => `<button data-a="goal-toggle" data-v="${g.id}" class="${S.goals.includes(g.id) ? 'on' : ''}"><span>${g.e}</span>${g.t}</button>`).join('')}</div></div>
    <div class="card"><label class="set"><span>Dein Name</span><input class="txt" id="nm" style="max-width:170px" maxlength="20" value="${esc(S.name)}"></label>
    <label class="set"><span>Romaji in Kana-Lektionen</span><input type="checkbox" data-a="set" data-key="romaji" ${s.romaji ? 'checked' : ''}></label>
    <label class="set"><span>Ton (japanische Stimme)<br><small class="muted">Sprachausgabe deines Geräts</small></span><input type="checkbox" data-a="set" data-key="sound" ${s.sound ? 'checked' : ''}></label>
    <label class="set"><span>Darstellung</span><select data-a="set" data-key="theme">${sel('auto', s.theme, 'Automatisch')}${sel('light', s.theme, 'Hell')}${sel('dark', s.theme, 'Dunkel')}</select></label>
    <label class="set"><span>Startschrift (Kana)</span><select data-a="set" data-key="focus">${sel('hira', S.focus, 'Hiragana')}${sel('kata', S.focus, 'Katakana')}</select></label></div>
    <div class="card"><h3>Sicherung</h3><p class="small muted">Dein Fortschritt liegt nur auf diesem Gerät. Kopiere die Sicherung, um sie auf einem anderen Gerät einzufügen.</p>
    <textarea id="bk" class="txt" rows="3" placeholder="Sicherung hier einfügen …" style="font-size:.8rem"></textarea>
    <div class="row wrap" style="margin-top:8px"><button class="btn sm" data-a="bk-export">Sicherung erstellen</button><button class="btn sm" data-a="bk-import">Einfügen &amp; laden</button></div></div>
    <button class="btn block" data-a="reset" style="color:var(--accent)">Fortschritt zurücksetzen</button><div style="height:8px"></div>`;
}

/* ---------- Aktionen (Event-Delegation) ---------- */
const A = {
  go: t => (location.hash = '#/' + t.dataset.to),
  say: t => speak(t.dataset.t), qsay: () => speak(Q.qs[Q.i].say),
  kana: t => openKana(t.dataset.k), close: () => $('#sheet').close(),
  'trace-toggle': () => { const b = $('#tracebox'); b.children.length ? (b.innerHTML = '') : initTrace(b, $('#sheet .glyph').textContent); },
  'trace-clear': () => $('#trace')._ghost(),
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
    S.settings.textScript = !o.script && !opt.kana ? 'romaji' : 'both'; S.onboarded = true; save(); location.hash = '#/home'; route();
  },
  'onb-again': () => { S.onboarded = false; location.hash = '#/onboarding'; route(); },
  ans: t => answer(+t.dataset.i), qnext, hint: () => { const q = Q?.qs[Q.i]; if (q) { const fb = $('#fb'); fb.className = 'fb no'; fb.innerHTML = '💡 ' + q.hint; } },
  quit: () => { stopStory(); Q = null; L = null; T = null; location.hash = backTo; },
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
    else if (k === 'focus' || k === 'level') S[k] = v; else if (k === 'goalMin') S.goalMin = +v; else S.settings[k] = v;
    if (k === 'level') { kanjiLvl = langLvl = null; }
    save(); applyTheme();
  },
  reset: t => { if (!t.dataset.sure) { t.dataset.sure = 1; t.textContent = 'Wirklich löschen? Nochmal tippen.'; return; } { const nm = S.name; S = structuredClone(DEFAULTS); S.name = nm; S.onboarded = true; save(); toast('Zurückgesetzt – neu starten ist auch Lernen 🌱'); location.hash = '#/home'; route(); } },
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
applyTheme(); route();
if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) navigator.serviceWorker.register('sw.js').catch(() => {});
