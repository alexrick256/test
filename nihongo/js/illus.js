// Handgezeichnete SVG-Illustrationen rund um das Maskottchen „Mochi“.

export function mochiG({ acc = '', mood = 'happy' } = {}) {
  const eyes = mood === 'sleep'
    ? '<path class="s" d="M38 72q8 6 16 0M66 72q8 6 16 0"/>'
    : '<circle class="f" cx="46" cy="70" r="4.5"/><circle class="f" cx="74" cy="70" r="4.5"/>';
  const mouth = mood === 'cheer'
    ? '<path class="f" d="M51 79q9 14 18 0z"/>'
    : '<path class="s" d="M53 79q7 8 14 0"/>';
  const extra = {
    wave: '<path class="s" d="M96 78q14-2 14-22"/><circle class="body" cx="110" cy="52" r="6"/>',
    phones: '<path class="s thick" d="M26 72C22 38 44 20 60 20s38 18 34 52"/><rect class="acc" x="18" y="62" width="14" height="24" rx="7"/><rect class="acc" x="88" y="62" width="14" height="24" rx="7"/>',
    leaf: '<path class="leaf" d="M60 25q-6-16 12-18 4 14-12 18z"/>',
    cheer: '<path class="s" d="M24 78q-14-4-14-24M96 78q14-4 14-24"/>',
  }[acc] || '';
  return `<g class="mochi"><ellipse class="shadow" cx="60" cy="108" rx="34" ry="6"/>
  <path class="body" d="M22 90C18 50 36 24 60 24s42 26 38 66c-1 12-18 16-38 16S23 102 22 90Z"/>
  ${eyes}${mouth}<circle class="cheek" cx="36" cy="80" r="6"/><circle class="cheek" cx="84" cy="80" r="6"/>${extra}</g>`;
}

const svg = (label, inner, vb = '0 0 320 220') =>
  `<svg viewBox="${vb}" class="scene" role="img" aria-label="${label}">${inner}</svg>`;
const at = (x, y, s, inner) => `<g transform="translate(${x} ${y}) scale(${s})">${inner}</g>`;
const bubble = (x, y, t) => `<g class="bub"><rect x="${x}" y="${y}" width="46" height="40" rx="14"/><path d="M${x + 14} ${y + 38}l-4 10 14-10z"/><text x="${x + 23}" y="${y + 29}" text-anchor="middle" class="jp-t">${t}</text></g>`;

export function mochi(opts, size = 96) {
  return `<svg viewBox="0 0 120 120" width="${size}" height="${size}" class="scene mochi-s" aria-hidden="true">${mochiG(opts)}</svg>`;
}

const petals = [[40, 40], [260, 30], [285, 120], [30, 150], [210, 25]].map(([x, y], i) =>
  `<ellipse class="petal" cx="${x}" cy="${y}" rx="7" ry="4" transform="rotate(${i * 35} ${x} ${y})"/>`).join('');

export const SCENES = {
  welcome: svg('Mochi winkt vor der aufgehenden Sonne',
    `<circle class="sun" cx="225" cy="95" r="58"/>${petals}
     <text x="38" y="52" class="jp-t big">ようこそ</text>
     ${at(80, 60, 1.25, mochiG({ acc: 'wave' }))}`),
  acquire: svg('Ein Spross wächst, während Sprechblasen mit Kana schweben',
    `${bubble(28, 24, 'は')}${bubble(88, 8, 'こ')}${bubble(60, 66, 'ん')}
     <rect class="pot" x="200" y="150" width="70" height="46" rx="10"/><path class="s2" d="M235 150v-50"/>
     <path class="leaf" d="M235 120q-34-6-38-38 34 0 38 38z"/><path class="leaf" d="M235 104q32-4 36-34-32 0-36 34z"/>
     ${at(80, 100, .85, mochiG({ acc: 'leaf' }))}`),
  step: svg('Eine Treppe: du stehst bei i und die nächste Stufe ist plus eins',
    `<rect class="st1" x="30" y="150" width="80" height="46" rx="8"/><rect class="st2" x="110" y="116" width="80" height="80" rx="8"/><rect class="st3" x="190" y="82" width="80" height="114" rx="8"/>
     <text x="150" y="168" text-anchor="middle" class="jp-t wht">i</text><text x="230" y="150" text-anchor="middle" class="jp-t wht">+1</text>
     <path class="s2" d="M235 82V38"/><path class="flag" d="M235 38h34l-8 10 8 10h-34z"/>
     ${at(105, 38, .72, mochiG({ acc: 'cheer' }))}`),
  filter: svg('Ein offenes Torii-Tor: entspannt lernen',
    `<circle class="sun soft" cx="160" cy="90" r="80"/>
     <rect class="torii" x="96" y="70" width="14" height="120"/><rect class="torii" x="210" y="70" width="14" height="120"/>
     <path class="torii" d="M80 58q80 22 160 0l-6 20q-74 16-148 0z"/><rect class="torii" x="100" y="94" width="120" height="10"/>
     ${at(100, 82, .9, mochiG({ acc: 'leaf' }))}
     <text x="235" y="48" font-size="26">💗</text><text x="52" y="100" font-size="24">🍵</text>`),
  listen: svg('Mochi hört mit Kopfhörern zu',
    `<path class="wave" d="M60 90q-14 20 0 40M42 80q-26 30 0 60"/><path class="wave" d="M260 90q14 20 0 40M278 80q26 30 0 60"/>
     <text x="52" y="50" font-size="26">♪</text><text x="240" y="44" font-size="30">♫</text>
     ${at(100, 50, 1.2, mochiG({ acc: 'phones' }))}`),
  path: svg('Drei Trittsteine: Hören, Neues entdecken, Wiederholen',
    `<path class="dash" d="M40 160C90 60 150 60 160 110S250 170 285 70"/>
     <g class="stone"><circle cx="46" cy="156" r="30"/><text x="46" y="167" text-anchor="middle" font-size="30">🎧</text></g>
     <g class="stone b"><circle cx="160" cy="98" r="30"/><text x="160" y="109" text-anchor="middle" font-size="30">🌱</text></g>
     <g class="stone c"><circle cx="272" cy="78" r="30"/><text x="272" y="89" text-anchor="middle" font-size="30">🔁</text></g>
     <text x="46" y="206" text-anchor="middle" class="lbl">Hören</text><text x="160" y="146" text-anchor="middle" class="lbl">Neues</text><text x="272" y="126" text-anchor="middle" class="lbl">Wiederholen</text>`),
};
