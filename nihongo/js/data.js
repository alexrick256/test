// Daten: Kana (mit Merkbildern), Wörter, Geschichten und Methodentexte.
// Format Kana: Zeichen|Romaji|Emoji|Merkhilfe

export const toKata = s => s.replace(/[ぁ-ゖ]/g, c => String.fromCharCode(c.charCodeAt(0) + 0x60));

const HIRA_BASE = `
あ|a|🍎|Ein Apfel mit Stiel und Biss – A wie Apfel!
い|i|🐛|Zwei Würmer stehen nebeneinander: „Iiih!“
う|u|🦉|Ein Uhu mit spitzem Kopf – U wie Uhu.
え|e|🦜|E wie Exot: ein bunter Vogel im Flug.
お|o|🐙|O wie Oktopus – die Tentakel schwingen mit.
か|ka|🌵|Ein Kaktus mit Stachel – Ka wie Kaktus.
き|ki|🔑|Ein Schlüssel – englisch „key“ klingt wie „ki“.
く|ku|🐤|Der Schnabel eines Kuckucks: Ku-ku!
け|ke|🍪|Ke wie Keks – mit einer Kerbe.
こ|ko|🐍|Zwei Kobras liegen übereinander.
さ|sa|🧂|Sa wie Salz – der Streuer neigt sich.
し|shi|🎣|Ein Angelhaken: „Sch… ein Fisch!“
す|su|🍣|Su wie Sushi – ein Röllchen mit Schleife.
せ|se|🛋️|Se wie Sessel: Lehne und Sitzfläche.
そ|so|🧵|So wird genäht – ein Zickzack-Faden.
た|ta|🚕|Ta wie Taxi – mit Dachschild.
ち|chi|🌶️|Chi wie Chili – ganz schön scharf!
つ|tsu|🌊|Tsu wie Tsunami: eine große Welle.
て|te|🍵|Te wie Tee – der Dampf steigt auf.
と|to|🦶|Englisch „toe“ = Zeh – mit Splitter im Zeh.
な|na|👃|Na wie Nase – die Schleife ist das Nasenloch.
に|ni|🩹|Ni wie Knie – mit zwei Pflastern.
ぬ|nu|🍜|Nu wie Nudeln – die Nudel ringelt sich.
ね|ne|🐱|Ne-ko heißt Katze! Der Schwanz ringelt sich.
の|no|🚫|No! Das Verbotsschild ist fast ein Kreis.
は|ha|🏠|Ha wie Haus – Wand und Dach.
ひ|hi|😄|Hihi! Ein lachender Mund.
ふ|fu|🗻|Fu wie Fuji – der Berg mit Wolken.
へ|he|⛰️|Ein Hügel – He wie Hügel.
ほ|ho|🎅|Ho-ho-ho! Der Weihnachtsmann.
ま|ma|👩|Ma wie Mama – mit Schürze und Zopf.
み|mi|🎵|Mi – eine Note; sieht aus wie eine „21“.
む|mu|🐮|Muh! Die Kuh hat einen Ringelschwanz.
め|me|👁️|Me heißt Auge (目) – mit Wimper.
も|mo|🌙|Mo wie Mond – zwei Wolken ziehen vorbei.
や|ya|🐃|Ya wie Yak – Hörner und Fell.
ゆ|yu|♨️|Yu heißt heißes Wasser – wie eine Therme.
よ|yo|🧘|Yo wie Yoga – eine Figur im Lotussitz.
わ|wa|🐋|Wa wie Wal – mit großer Schwanzflosse.
を|wo|📍|Wo? Eine Pinnnadel – kommt nur als Partikel „o“ vor.
ん|n|🤔|Hmmm … das nachdenkliche N.
ら|ra|🚀|Ra wie Rakete – mit Funken.
り|ri|🍚|Ri wie Reis – zwei Körner hängen nebeneinander.
る|ru|💎|Ru wie Rubin – mit Schlaufe.
れ|re|🌧️|Re wie Regen – der Wind weht die Tropfen.
ろ|ro|🤖|Ro wie Roboter – eckig und ohne Schlaufe.
`;

const KATA_BASE = `
ア|a|⚓|A wie Anker.
イ|i|🦔|I wie Igel – stachelig.
ウ|u|🛸|U wie Ufo – mit Antenne.
エ|e|🏗️|E wie Eisenträger.
オ|o|👂|O wie Ohr – ein Ohr mit Strich.
カ|ka|💪|Ka wie Kraft – ein Muskel.
キ|ki|🗝️|Ki – „key“: ein Schlüssel mit Bart.
ク|ku|🐄|Ku wie Kuh – mit Horn.
ケ|ke|🕯️|Ke wie Kerze.
コ|ko|📦|Ko wie Koffer – eine Kiste von der Seite.
サ|sa|🥗|Sa wie Salat – drei Blätter.
シ|shi|🤫|„Sch!“ – zwei Augen und ein Finger.
ス|su|🦸|Su wie Superheld mit Umhang.
セ|se|🪢|Se wie Seil – mit Knoten.
ソ|so|🧦|So wie Socke – schräg am Strich.
タ|ta|☕|Ta wie Tasse.
チ|chi|🍟|Chi wie Chips.
ツ|tsu|🍬|Zu-cker: Bonbons fallen von oben. (Striche steil!)
テ|te|☎️|Te wie Telefon.
ト|to|⚽|To wie Tor – Pfosten mit Netz.
ナ|na|🔩|Na wie Nagel.
ニ|ni|✌️|Ni heißt zwei – zwei Striche.
ヌ|nu|🥜|Nu wie Nuss.
ネ|ne|🕸️|Ne wie Netz.
ノ|no|📝|No wie Notiz – nur ein Strich.
ハ|ha|🎩|Ha wie Hut.
ヒ|hi|👋|Hi! Die Hand winkt.
フ|fu|🦊|Fu wie Fuchs – ein Fuchsohr.
ヘ|he|🏔️|Ein Berg – genau wie das Hiragana へ.
ホ|ho|🪵|Ho wie Holz – Stamm mit Ästen.
マ|ma|🪄|Ma wie Magie – ein Zauberstab.
ミ|mi|🐈|Miau! Drei Schnurrhaare.
ム|mu|🐚|Mu wie Muschel.
メ|me|🔪|Me wie Messer – zwei gekreuzte Messer.
モ|mo|🛵|Mo wie Moped.
ヤ|ya|⛵|Ya wie Yacht.
ユ|yu|🎉|Ju-bel! Ein U mit Konfetti.
ヨ|yo|🪀|Yo wie Jo-Jo.
ワ|wa|💧|Wa wie Wasser – ein Tropfen.
ヲ|wo|🤩|Wow! (wird kaum benutzt)
ン|n|🤨|Nnn? – skeptisch, mit Augenbraue.
ラ|ra|📻|Ra wie Radio.
リ|ri|💍|Ri wie Ring – zwei Striche.
ル|ru|🐘|Ru wie Rüssel.
レ|re|🦌|Re wie Reh – ein Geweih.
ロ|ro|🖼️|Ro wie Rahmen – ein Rechteck.
`;

// stimmhafte Laute: Zeichen|Basis|Romaji
const VOICED = `
が|か|ga|゛ぎ|き|gi|゛ぐ|く|gu|゛げ|け|ge|゛ご|こ|go|゛
ざ|さ|za|゛じ|し|ji|゛ず|す|zu|゛ぜ|せ|ze|゛ぞ|そ|zo|゛
だ|た|da|゛ぢ|ち|ji|゛づ|つ|zu|゛で|て|de|゛ど|と|do|゛
ば|は|ba|゛び|ひ|bi|゛ぶ|ふ|bu|゛べ|へ|be|゛ぼ|ほ|bo|゛
ぱ|は|pa|゜ぴ|ひ|pi|゜ぷ|ふ|pu|゜ぺ|へ|pe|゜ぽ|ほ|po|゜`;

const GROUP_SPEC = [
  ['Die Vokale', 'あいうえお'], ['K-Laute', 'かきくけこ'], ['S-Laute', 'さしすせそ'],
  ['T-Laute', 'たちつてと'], ['N-Laute', 'なにぬねの'], ['H-Laute', 'はひふへほ'],
  ['M-Laute', 'まみむめも'], ['Y, W & N', 'やゆよわをん'], ['R-Laute', 'らりるれろ'],
  ['G- & Z-Laute', 'がぎぐげござじずぜぞ'], ['D- & B-Laute', 'だぢづでどばびぶべぼ'], ['P-Laute', 'ぱぴぷぺぽ'],
];

const parse = (src, script) => src.trim().split('\n').map(l => {
  const [k, r, e, h] = l.split('|');
  return { k, r, e, h, script };
});

function build(script, baseSrc) {
  const conv = script === 'kata' ? toKata : s => s;
  const map = {};
  parse(baseSrc, script).forEach(o => (map[o.k] = o));
  VOICED.trim().split(/(?<=[゛゜])/).map(s => s.trim()).filter(Boolean).forEach(chunk => {
    const [k, base, r, mark] = chunk.split('|');
    const bk = conv(base), kk = conv(k), b = map[bk];
    const note = mark === '゛' ? 'Zwei Striche machen den Laut weich' : 'Ein Kringel macht aus h ein p';
    const extra = (k === 'ぢ' || k === 'づ') ? ' (selten – klingt wie ' + (k === 'ぢ' ? 'じ' : 'ず') + ')' : '';
    map[kk] = { k: kk, r, e: b.e, h: `${bk} + ${mark} = ${kk}. ${note}: ${b.r} → ${r}.${extra}`, script, base: bk };
  });
  return GROUP_SPEC.map(([title, chars], i) => ({
    id: (script === 'hira' ? 'h' : 'k') + (i + 1), script, n: i + 1, title,
    kana: [...conv(chars)].map(c => map[c]),
  }));
}

export const GROUPS = { hira: build('hira', HIRA_BASE), kata: build('kata', KATA_BASE) };
export const ALL_GROUPS = [...GROUPS.hira, ...GROUPS.kata];
export const KANA = {};
ALL_GROUPS.forEach(g => g.kana.forEach(k => { k.gid = g.id; KANA[k.k] = k; }));

// Wörter: Wort|Romaji|Deutsch|Emoji
const HIRA_WORDS = `
あい|ai|Liebe|❤️
いえ|ie|Haus|🏠
うえ|ue|oben|⬆️
あお|ao|blau|🟦
いい|ii|gut|👍
かお|kao|Gesicht|🙂
いけ|ike|Teich|🏞️
あき|aki|Herbst|🍂
こえ|koe|Stimme|🗣️
いく|iku|gehen|🚶
えき|eki|Bahnhof|🚉
あかい|akai|rot|🔴
おおきい|ookii|groß|🦣
おいしい|oishii|lecker|😋
あつい|atsui|heiß|🥵
さむい|samui|kalt|🥶
さけ|sake|Sake|🍶
すし|sushi|Sushi|🍣
せかい|sekai|Welt|🌍
いす|isu|Stuhl|🪑
あし|ashi|Bein|🦵
かさ|kasa|Regenschirm|☂️
たこ|tako|Krake|🐙
つき|tsuki|Mond|🌙
て|te|Hand|✋
いち|ichi|eins|1️⃣
たけ|take|Bambus|🎋
ねこ|neko|Katze|🐱
いぬ|inu|Hund|🐶
なつ|natsu|Sommer|☀️
にく|niku|Fleisch|🥩
はな|hana|Blume|🌷
ひと|hito|Mensch|🧑
ふね|fune|Schiff|🚢
ほし|hoshi|Stern|⭐
へや|heya|Zimmer|🛋️
はし|hashi|Stäbchen|🥢
め|me|Auge|👁️
もも|momo|Pfirsich|🍑
やま|yama|Berg|⛰️
ゆき|yuki|Schnee|❄️
ふゆ|fuyu|Winter|⛄
くるま|kuruma|Auto|🚗
ろく|roku|sechs|6️⃣
わたし|watashi|ich|🙋
ほん|hon|Buch|📖
さくら|sakura|Kirschblüte|🌸
とり|tori|Vogel|🐦
さかな|sakana|Fisch|🐟
ゆめ|yume|Traum|💭
おとこ|otoko|Mann|👨
おんな|onna|Frau|👩
みせ|mise|Laden|🏪
うみ|umi|Meer|🌊
そら|sora|Himmel|🌤️
かみ|kami|Papier|📄
あめ|ame|Regen|🌧️
よる|yoru|Nacht|🌃
まち|machi|Stadt|🏙️
おはよう|ohayou|Guten Morgen|🌅
こんにちは|konnichiwa|Hallo|👋
さようなら|sayounara|Tschüss|🖐️
おやすみ|oyasumi|Gute Nacht|😴
ありがとう|arigatou|Danke|🙏
ごはん|gohan|Reis / Essen|🍚
たまご|tamago|Ei|🥚
かぜ|kaze|Wind|💨
こども|kodomo|Kind|🧒
みどり|midori|grün|🟢
みず|mizu|Wasser|💧
いただきます|itadakimasu|Guten Appetit|🍽️
でんわ|denwa|Telefon|📞
くつ|kutsu|Schuh|👟
ぎんこう|ginkou|Bank|🏦
ばら|bara|Rose|🌹
かばん|kaban|Tasche|👜
ぶどう|budou|Traube|🍇
てがみ|tegami|Brief|✉️
ともだち|tomodachi|Freund|🧑‍🤝‍🧑
ぞう|zou|Elefant|🐘
はなび|hanabi|Feuerwerk|🎆
えんぴつ|enpitsu|Bleistift|✏️
かぎ|kagi|Schlüssel|🗝️
やさい|yasai|Gemüse|🥦
`;

const KATA_WORDS = `
アイス|aisu|Eis|🍦
コーヒー|kōhī|Kaffee|☕
ケーキ|kēki|Kuchen|🍰
タクシー|takushī|Taxi|🚕
ホテル|hoteru|Hotel|🏨
パン|pan|Brot|🍞
カメラ|kamera|Kamera|📷
ラーメン|rāmen|Ramen|🍜
サラダ|sarada|Salat|🥗
ピアノ|piano|Klavier|🎹
ミルク|miruku|Milch|🥛
ナイフ|naifu|Messer|🔪
スープ|sūpu|Suppe|🍲
メロン|meron|Melone|🍈
レモン|remon|Zitrone|🍋
トマト|tomato|Tomate|🍅
バナナ|banana|Banane|🍌
ギター|gitā|Gitarre|🎸
ビール|bīru|Bier|🍺
ラジオ|rajio|Radio|📻
テニス|tenisu|Tennis|🎾
ノート|nōto|Heft|📓
ドア|doa|Tür|🚪
バス|basu|Bus|🚌
ペン|pen|Stift|🖊️
ネクタイ|nekutai|Krawatte|👔
ワイン|wain|Wein|🍷
アメリカ|amerika|Amerika|🇺🇸
カレー|karē|Curry|🍛
ゲーム|gēmu|Spiel|🎮
マスク|masuku|Maske|😷
キウイ|kiui|Kiwi|🥝
ヨガ|yoga|Yoga|🧘
テレビ|terebi|Fernseher|📺
オレンジ|orenji|Orange|🍊
ソーダ|sōda|Limonade|🥤
ユーロ|yūro|Euro|💶
アニメ|anime|Anime|🎞️
スキー|sukī|Ski|⛷️
ポスト|posuto|Briefkasten|📮
`;

const words = (src, script) => src.trim().split('\n').map(l => {
  const [w, r, d, e] = l.split('|');
  return { w, r, d, e, script, chars: [...w].filter(c => KANA[c]) };
});
export const WORDS = [...words(HIRA_WORDS, 'hira'), ...words(KATA_WORDS, 'kata')];

// Geschichten: Zeilen mit Wörtern [Japanisch, Romaji, Bedeutung]
export const STORIES = [
  { id: 's1', title: 'Hallo, ich bin Sakura', emoji: '👋', scene: 'Zwei Menschen lernen sich kennen.',
    lines: [
      { who: 'A', end: '。', de: 'Hallo!', words: [['こんにちは', 'konnichiwa', 'Hallo']] },
      { who: 'B', end: '。', de: 'Hallo! Ich bin Sakura.', words: [['こんにちは', 'konnichiwa', 'Hallo'], ['わたし', 'watashi', 'ich'], ['は', 'wa', '(Themen-Partikel)'], ['さくら', 'Sakura', 'Sakura'], ['です', 'desu', 'bin / ist']] },
      { who: 'A', end: '。', de: 'Ich bin Yuuki.', words: [['わたし', 'watashi', 'ich'], ['は', 'wa', '(Themen-Partikel)'], ['ゆうき', 'Yuuki', 'Yuuki'], ['です', 'desu', 'bin / ist']] },
      { who: 'B', end: '！', de: 'Freut mich (beim ersten Treffen)!', words: [['はじめまして', 'hajimemashite', 'Freut mich, dich kennenzulernen']] },
      { who: 'A', end: '。', de: 'Auf gute Zusammenarbeit! (Freut mich ebenfalls.)', words: [['よろしく', 'yoroshiku', 'bitte wohlwollend'], ['おねがいします', 'onegaishimasu', 'ich bitte darum']] },
    ] },
  { id: 's2', title: 'Zeit zum Essen', emoji: '🍚', scene: 'Zwei Freunde haben Hunger.',
    lines: [
      { who: 'A', end: '。', de: 'Ich habe Hunger.', words: [['おなか', 'onaka', 'Bauch'], ['が', 'ga', '(Subjekt-Partikel)'], ['すきました', 'sukimashita', 'ist leer geworden']] },
      { who: 'B', end: '。', de: 'Dann esse ich Reis.', words: [['ごはん', 'gohan', 'Reis / Essen'], ['を', 'o', '(Objekt-Partikel)'], ['たべます', 'tabemasu', 'ich esse']] },
      { who: 'A', end: '！', de: 'Guten Appetit!', words: [['いただきます', 'itadakimasu', 'Guten Appetit']] },
      { who: 'B', end: '。', de: 'Lecker, nicht wahr?', words: [['おいしい', 'oishii', 'lecker'], ['です', 'desu', 'ist'], ['ね', 'ne', 'nicht wahr?']] },
      { who: 'A', end: '！', de: 'Danke für das Essen!', words: [['ごちそうさま', 'gochisousama', 'Danke für das Essen']] },
    ] },
  { id: 's3', title: 'Die weiße Katze', emoji: '🐱', scene: 'Eine kleine Geschichte ohne Druck.',
    lines: [
      { who: 'N', end: '。', de: 'Da ist eine Katze.', words: [['ねこ', 'neko', 'Katze'], ['が', 'ga', '(Subjekt-Partikel)'], ['います', 'imasu', 'es gibt (Lebewesen)']] },
      { who: 'N', end: '。', de: 'Die Katze ist weiß.', words: [['ねこ', 'neko', 'Katze'], ['は', 'wa', '(Themen-Partikel)'], ['しろい', 'shiroi', 'weiß'], ['です', 'desu', 'ist']] },
      { who: 'N', end: '。', de: 'Die Katze mag Fisch.', words: [['ねこ', 'neko', 'Katze'], ['は', 'wa', '(Themen-Partikel)'], ['さかな', 'sakana', 'Fisch'], ['が', 'ga', '(Subjekt-Partikel)'], ['すき', 'suki', 'mögen'], ['です', 'desu', 'ist']] },
      { who: 'N', end: '。', de: 'Ich gebe ihr Fisch.', words: [['さかな', 'sakana', 'Fisch'], ['を', 'o', '(Objekt-Partikel)'], ['あげます', 'agemasu', 'ich gebe']] },
      { who: 'N', end: '。', de: 'Die Katze ist froh.', words: [['ねこ', 'neko', 'Katze'], ['は', 'wa', '(Themen-Partikel)'], ['うれしい', 'ureshii', 'froh'], ['です', 'desu', 'ist']] },
    ] },
  { id: 's4', title: 'Ein Regentag', emoji: '☔', scene: 'Morgen wird es nass – aber gemütlich.',
    lines: [
      { who: 'N', end: '。', de: 'Morgen ist es regnerisch.', words: [['あした', 'ashita', 'morgen'], ['は', 'wa', '(Themen-Partikel)'], ['あめ', 'ame', 'Regen'], ['です', 'desu', 'ist']] },
      { who: 'N', end: '。', de: 'Ich benutze einen Regenschirm.', words: [['かさ', 'kasa', 'Regenschirm'], ['を', 'o', '(Objekt-Partikel)'], ['つかいます', 'tsukaimasu', 'ich benutze']] },
      { who: 'N', end: '。', de: 'Ich mag das Geräusch des Regens.', words: [['あめ', 'ame', 'Regen'], ['の', 'no', '(von)'], ['おと', 'oto', 'Geräusch'], ['が', 'ga', '(Subjekt-Partikel)'], ['すき', 'suki', 'mögen'], ['です', 'desu', 'ist']] },
      { who: 'N', end: '。', de: 'Ich trinke Wasser.', words: [['みず', 'mizu', 'Wasser'], ['を', 'o', '(Objekt-Partikel)'], ['のみます', 'nomimasu', 'ich trinke']] },
      { who: 'N', end: '。', de: 'Ein schöner Tag.', words: [['いい', 'ii', 'gut / schön'], ['いちにち', 'ichinichi', 'ein Tag'], ['です', 'desu', 'ist']] },
    ] },
  { id: 's5', title: 'Mein Zimmer', emoji: '🛋️', scene: 'Ein Blick durchs Fenster.',
    lines: [
      { who: 'N', end: '。', de: 'In meinem Zimmer gibt es einen Schreibtisch.', words: [['わたし', 'watashi', 'ich'], ['の', 'no', '(von)'], ['へや', 'heya', 'Zimmer'], ['に', 'ni', 'in'], ['つくえ', 'tsukue', 'Schreibtisch'], ['が', 'ga', '(Subjekt-Partikel)'], ['あります', 'arimasu', 'es gibt (Dinge)']] },
      { who: 'N', end: '。', de: 'Auf dem Schreibtisch liegt ein Buch.', words: [['つくえ', 'tsukue', 'Schreibtisch'], ['の', 'no', '(von)'], ['うえ', 'ue', 'oben / auf'], ['に', 'ni', 'auf'], ['ほん', 'hon', 'Buch'], ['が', 'ga', '(Subjekt-Partikel)'], ['あります', 'arimasu', 'es gibt']] },
      { who: 'N', end: '。', de: 'Draußen vor dem Fenster sieht man einen Berg.', words: [['まど', 'mado', 'Fenster'], ['の', 'no', '(von)'], ['そと', 'soto', 'draußen'], ['に', 'ni', 'in'], ['やま', 'yama', 'Berg'], ['が', 'ga', '(Subjekt-Partikel)'], ['みえます', 'miemasu', 'ist zu sehen']] },
      { who: 'N', end: '。', de: 'Ich mag dieses Zimmer.', words: [['わたし', 'watashi', 'ich'], ['は', 'wa', '(Themen-Partikel)'], ['この', 'kono', 'dieses'], ['へや', 'heya', 'Zimmer'], ['が', 'ga', '(Subjekt-Partikel)'], ['すき', 'suki', 'mögen'], ['です', 'desu', 'ist']] },
    ] },
];

export const METHOD = [
  { ic: '🌱', t: 'Erwerben statt pauken', h: 'Acquisition–Learning-Hypothese',
    k: 'Nach Stephen Krashen erwerben wir Sprachen unbewusst – so wie Kinder ihre Muttersprache –, indem wir Bedeutung verstehen. Bewusst gelernte Regeln spielen eine kleinere Rolle.',
    a: 'Du lernst Zeichen über Bilder, Klang und echte Wörter. Es gibt keine Grammatiktabellen: Muster entdeckst du in kleinen Geschichten.' },
  { ic: '🪜', t: 'Verständlicher Input: i + 1', h: 'Input-Hypothese',
    k: 'Wir machen Fortschritte, wenn wir Input verstehen, der ein kleines Stück über unserem aktuellen Stand (i) liegt: i + 1. Verstanden wird über Kontext, Bilder und Vorwissen.',
    a: 'Wörter und Geschichten werden nach deinen bekannten Zeichen ausgewählt. „Passt zu dir“ zeigt, wie viel du schon lesen kannst. Neue Gruppen bauen auf Bekanntem auf, Emojis und Übersetzungen machen das „+1“ verständlich.' },
  { ic: '🛡️', t: 'Der affektive Filter', h: 'Affective-Filter-Hypothese',
    k: 'Angst, Druck und Langeweile wirken wie ein Filter, der Input blockiert. Entspannte, motivierte Lernende lassen mehr Input „durch“.',
    a: 'Keine Timer, keine Leben, kein Punktabzug. Ein Fehler wird zu „Fast!“. Kurze Sessions (5–10 Minuten), spielerische Bilder, und Pausen sind ausdrücklich erlaubt.' },
  { ic: '🔎', t: 'Der Monitor', h: 'Monitor-Hypothese',
    k: 'Bewusstes Regelwissen dient nur als „Monitor“, der unsere Äußerungen prüft – wenn Zeit und Ruhe da sind. Zu viel Monitoring bremst den Sprachfluss.',
    a: 'Du wirst nicht ständig korrigiert. Tipps (💡) sind freiwillig, das Nachzeichnen ist optional, und es gibt keine Noten.' },
  { ic: '🧭', t: 'Natürliche Reihenfolge', h: 'Natural-Order-Hypothese',
    k: 'Sprachstrukturen werden in einer vorhersagbaren Reihenfolge erworben – nicht unbedingt in der des Lehrbuchs.',
    a: 'Die Zeichen kommen von leicht nach schwer: erst die Vokale, dann die Konsonantenreihen, zuletzt Sonderformen. Sobald Wörter lesbar sind, tauchen sie sofort auf. Wiederholungen richten sich nach deinem Tempo.' },
  { ic: '🎧', t: 'Erst zuhören, dann sprechen', h: 'Stille Phase (Silent Period)',
    k: 'Lernende sollen nicht zum Sprechen gezwungen werden. Sie sprechen, wenn sie bereit sind – nach ausreichend Input.',
    a: 'Jede Lektion beginnt mit Schauen und Hören. Sprechen und Schreiben bleiben freiwillig.' },
];

// Sprach-Themen (unabhängig von der Schrift lernbar): [Japanisch, Romaji, Deutsch, Emoji]
export const TOPICS = [
  { id: 't1', title: 'Begrüßen & Danken', emoji: '👋', items: [['こんにちは', 'konnichiwa', 'Hallo', '👋'], ['おはよう', 'ohayou', 'Guten Morgen', '🌅'], ['こんばんは', 'konbanwa', 'Guten Abend', '🌆'], ['さようなら', 'sayounara', 'Tschüss', '🖐️'], ['ありがとう', 'arigatou', 'Danke', '🙏'], ['すみません', 'sumimasen', 'Entschuldigung', '🙇'], ['はい', 'hai', 'Ja', '✅'], ['いいえ', 'iie', 'Nein', '❌']] },
  { id: 't2', title: 'Sich vorstellen', emoji: '🙋', items: [['わたし', 'watashi', 'ich', '🙋'], ['なまえ', 'namae', 'Name', '🏷️'], ['はじめまして', 'hajimemashite', 'Freut mich (Erstes Treffen)', '🤝'], ['よろしく', 'yoroshiku', 'Auf gute Zusammenarbeit', '😊'], ['です', 'desu', 'bin / ist', '🟰'], ['にほん', 'Nihon', 'Japan', '🇯🇵'], ['ドイツ', 'Doitsu', 'Deutschland', '🇩🇪'], ['ともだち', 'tomodachi', 'Freund / Freundin', '🧑‍🤝‍🧑']] },
  { id: 't3', title: 'Essen & Trinken', emoji: '🍚', items: [['ごはん', 'gohan', 'Reis / Essen', '🍚'], ['みず', 'mizu', 'Wasser', '💧'], ['おちゃ', 'ocha', 'Tee', '🍵'], ['さかな', 'sakana', 'Fisch', '🐟'], ['にく', 'niku', 'Fleisch', '🥩'], ['やさい', 'yasai', 'Gemüse', '🥦'], ['おいしい', 'oishii', 'lecker', '😋'], ['いただきます', 'itadakimasu', 'Guten Appetit', '🍽️']] },
  { id: 't4', title: 'Zahlen 1–8', emoji: '🔢', items: [['いち', 'ichi', 'eins', '1️⃣'], ['に', 'ni', 'zwei', '2️⃣'], ['さん', 'san', 'drei', '3️⃣'], ['よん', 'yon', 'vier', '4️⃣'], ['ご', 'go', 'fünf', '5️⃣'], ['ろく', 'roku', 'sechs', '6️⃣'], ['なな', 'nana', 'sieben', '7️⃣'], ['はち', 'hachi', 'acht', '8️⃣']] },
  { id: 't5', title: 'Tiere', emoji: '🐾', items: [['ねこ', 'neko', 'Katze', '🐱'], ['いぬ', 'inu', 'Hund', '🐶'], ['とり', 'tori', 'Vogel', '🐦'], ['うま', 'uma', 'Pferd', '🐴'], ['うさぎ', 'usagi', 'Hase', '🐰'], ['さる', 'saru', 'Affe', '🐵'], ['ぞう', 'zou', 'Elefant', '🐘'], ['さかな', 'sakana', 'Fisch', '🐟']] },
  { id: 't6', title: 'Unterwegs & Zuhause', emoji: '🚉', items: [['いえ', 'ie', 'Haus', '🏠'], ['がっこう', 'gakkou', 'Schule', '🏫'], ['えき', 'eki', 'Bahnhof', '🚉'], ['みせ', 'mise', 'Laden', '🏪'], ['くるま', 'kuruma', 'Auto', '🚗'], ['でんしゃ', 'densha', 'Zug', '🚆'], ['ほん', 'hon', 'Buch', '📖'], ['かさ', 'kasa', 'Regenschirm', '☂️']] },
  { id: 't7', title: 'Natur & Wetter', emoji: '🌤️', items: [['あめ', 'ame', 'Regen', '🌧️'], ['ゆき', 'yuki', 'Schnee', '❄️'], ['かぜ', 'kaze', 'Wind', '💨'], ['やま', 'yama', 'Berg', '⛰️'], ['うみ', 'umi', 'Meer', '🌊'], ['そら', 'sora', 'Himmel', '🌤️'], ['つき', 'tsuki', 'Mond', '🌙'], ['はな', 'hana', 'Blume', '🌷']] },
];
