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
const BASE_TOPICS = [
  { id: 't1', title: 'Begrüßen & Danken', emoji: '👋', items: [['こんにちは', 'konnichiwa', 'Hallo', '👋'], ['おはよう', 'ohayou', 'Guten Morgen', '🌅'], ['こんばんは', 'konbanwa', 'Guten Abend', '🌆'], ['さようなら', 'sayounara', 'Tschüss', '🖐️'], ['ありがとう', 'arigatou', 'Danke', '🙏'], ['すみません', 'sumimasen', 'Entschuldigung', '🙇'], ['はい', 'hai', 'Ja', '✅'], ['いいえ', 'iie', 'Nein', '❌']] },
  { id: 't2', title: 'Sich vorstellen', emoji: '🙋', items: [['わたし', 'watashi', 'ich', '🙋'], ['なまえ', 'namae', 'Name', '🏷️'], ['はじめまして', 'hajimemashite', 'Freut mich (Erstes Treffen)', '🤝'], ['よろしく', 'yoroshiku', 'Auf gute Zusammenarbeit', '😊'], ['です', 'desu', 'bin / ist', '🟰'], ['にほん', 'Nihon', 'Japan', '🇯🇵'], ['ドイツ', 'Doitsu', 'Deutschland', '🇩🇪'], ['ともだち', 'tomodachi', 'Freund / Freundin', '🧑‍🤝‍🧑']] },
  { id: 't3', title: 'Essen & Trinken', emoji: '🍚', items: [['ごはん', 'gohan', 'Reis / Essen', '🍚'], ['みず', 'mizu', 'Wasser', '💧'], ['おちゃ', 'ocha', 'Tee', '🍵'], ['さかな', 'sakana', 'Fisch', '🐟'], ['にく', 'niku', 'Fleisch', '🥩'], ['やさい', 'yasai', 'Gemüse', '🥦'], ['おいしい', 'oishii', 'lecker', '😋'], ['いただきます', 'itadakimasu', 'Guten Appetit', '🍽️']] },
  { id: 't4', title: 'Zahlen 1–8', emoji: '🔢', items: [['いち', 'ichi', 'eins', '1️⃣'], ['に', 'ni', 'zwei', '2️⃣'], ['さん', 'san', 'drei', '3️⃣'], ['よん', 'yon', 'vier', '4️⃣'], ['ご', 'go', 'fünf', '5️⃣'], ['ろく', 'roku', 'sechs', '6️⃣'], ['なな', 'nana', 'sieben', '7️⃣'], ['はち', 'hachi', 'acht', '8️⃣']] },
  { id: 't5', title: 'Tiere', emoji: '🐾', items: [['ねこ', 'neko', 'Katze', '🐱'], ['いぬ', 'inu', 'Hund', '🐶'], ['とり', 'tori', 'Vogel', '🐦'], ['うま', 'uma', 'Pferd', '🐴'], ['うさぎ', 'usagi', 'Hase', '🐰'], ['さる', 'saru', 'Affe', '🐵'], ['ぞう', 'zou', 'Elefant', '🐘'], ['さかな', 'sakana', 'Fisch', '🐟']] },
  { id: 't6', title: 'Unterwegs & Zuhause', emoji: '🚉', items: [['いえ', 'ie', 'Haus', '🏠'], ['がっこう', 'gakkou', 'Schule', '🏫'], ['えき', 'eki', 'Bahnhof', '🚉'], ['みせ', 'mise', 'Laden', '🏪'], ['くるま', 'kuruma', 'Auto', '🚗'], ['でんしゃ', 'densha', 'Zug', '🚆'], ['ほん', 'hon', 'Buch', '📖'], ['かさ', 'kasa', 'Regenschirm', '☂️']] },
  { id: 't7', title: 'Natur & Wetter', emoji: '🌤️', items: [['あめ', 'ame', 'Regen', '🌧️'], ['ゆき', 'yuki', 'Schnee', '❄️'], ['かぜ', 'kaze', 'Wind', '💨'], ['やま', 'yama', 'Berg', '⛰️'], ['うみ', 'umi', 'Meer', '🌊'], ['そら', 'sora', 'Himmel', '🌤️'], ['つき', 'tsuki', 'Mond', '🌙'], ['はな', 'hana', 'Blume', '🌷']] },
];

/* ---------- Niveaus N5–N1, Themen, Geschichten, Kanji ---------- */
export const LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'];
export const LEVEL_INFO = { N5: 'Einstieg', N4: 'Grundlagen', N3: 'Mittelstufe', N2: 'Obere Mittelstufe', N1: 'Fortgeschritten' };
export const GOALS = [
  { id: 'alltag', t: 'Alltag', e: '🏡' }, { id: 'reisen', t: 'Reisen', e: '✈️' }, { id: 'anime', t: 'Anime & Manga', e: '🎌' },
  { id: 'arbeit', t: 'Arbeit & Business', e: '💼' }, { id: 'kultur', t: 'Kultur & Literatur', e: '🎎' }, { id: 'jlpt', t: 'JLPT-Prüfung', e: '🎓' },
];
const META = { t1: ['N5', 'alltag'], t2: ['N5', 'alltag'], t3: ['N5', 'alltag'], t4: ['N5', 'alltag'], t5: ['N5', 'alltag'], t6: ['N5', 'reisen'], t7: ['N5', 'alltag'] };
const items = src => src.trim().split('\n').map(l => l.split('|'));
const MORE_TOPICS = [
  ['t8', 'N5', 'reisen', 'Reisen: Grundlagen', '🧳', 'きっぷ|kippu|Fahrkarte|🎫\nくうこう|kuukou|Flughafen|✈️\nトイレ|toire|Toilette|🚻\nみぎ|migi|rechts|➡️\nひだり|hidari|links|⬅️\nいくら|ikura|Wie viel kostet das?|💴\nちず|chizu|Landkarte|🗺️\nたすけて|tasukete|Hilfe!|🆘'],
  ['t9', 'N5', 'anime', 'Anime-Ausrufe', '🎌', 'すごい|sugoi|Wahnsinn / krass|🤩\nかわいい|kawaii|süß|🥰\nがんばって|ganbatte|Gib dein Bestes!|💪\nだいじょうぶ|daijoubu|Alles in Ordnung|👌\nほんとう|hontou|wirklich|🧐\nまって|matte|Warte!|✋\nやった|yatta|Geschafft!|🎉\nせんぱい|senpai|Älterer Kollege / Senior|🎓'],
  ['t10', 'N5', 'alltag', 'Einkaufen', '🛒', 'これ|kore|dies hier|👉\nそれ|sore|das (bei dir)|🫴\nください|kudasai|bitte geben|🙏\nたかい|takai|teuer / hoch|💸\nやすい|yasui|billig|🏷️\nおかね|okane|Geld|💰\nえん|en|Yen|💴\nかいます|kaimasu|kaufen|🛍️'],
  ['t11', 'N5', 'alltag', 'Zeit & Tage', '📅', 'きょう|kyou|heute|📅\nあした|ashita|morgen|🌅\nきのう|kinou|gestern|⏪\nいま|ima|jetzt|⏰\nまいにち|mainichi|jeden Tag|🔁\nあさ|asa|Morgen|🌄\nひる|hiru|Mittag|☀️\nよる|yoru|Nacht|🌙'],
  ['t12', 'N4', 'alltag', 'Tagesablauf', '⏰', 'べんきょう|benkyou|Lernen|📚\nしごと|shigoto|Arbeit|💼\nかいもの|kaimono|Einkaufen|🛍️\nりょうり|ryouri|Kochen|🍳\nせんたく|sentaku|Wäsche waschen|🧺\nそうじ|souji|Putzen|🧹\nねる|neru|schlafen|🛌\nおきる|okiru|aufstehen|⏰'],
  ['t13', 'N4', 'reisen', 'Unterwegs in Japan', '🚇', 'よやく|yoyaku|Reservierung|📝\nりょこう|ryokou|Reise|🧳\nちかてつ|chikatetsu|U-Bahn|🚇\nのりかえ|norikae|Umsteigen|🔄\nおみやげ|omiyage|Souvenir|🎁\nみち|michi|Weg / Straße|🛣️\nまよう|mayou|sich verlaufen|😵\nちゅうもん|chuumon|Bestellung|🍽️'],
  ['t14', 'N4', 'alltag', 'Gefühle & Meinung', '💭', 'かなしい|kanashii|traurig|😢\nたのしい|tanoshii|unterhaltsam / schön|😄\nこわい|kowai|gruselig|😨\nひさしぶり|hisashiburi|Lange nicht gesehen|🤗\nしんぱい|shinpai|Sorge|😟\nおもう|omou|denken / meinen|💭\nすき|suki|mögen|❤️\nきらい|kirai|nicht mögen|💔'],
  ['t15', 'N4', 'anime', 'Fantasy & Abenteuer', '⚔️', 'ひみつ|himitsu|Geheimnis|🤫\nまほう|mahou|Magie|🪄\nゆうしゃ|yuusha|Held|⚔️\nまおう|maou|Dämonenkönig|👹\nちから|chikara|Kraft|💥\nゆめ|yume|Traum|💭\nやくそく|yakusoku|Versprechen|🤙\nぜったい|zettai|auf jeden Fall|💯'],
  ['t16', 'N3', 'arbeit', 'Im Büro', '🏢', '会社|kaisha|Firma|🏢\n会議|kaigi|Besprechung|🗣️\n仕事|shigoto|Arbeit|💼\n残業|zangyou|Überstunden|🌙\n給料|kyuuryou|Gehalt|💵\n出張|shucchou|Dienstreise|🧳\n締め切り|shimekiri|Frist|⏳\n上司|joushi|Vorgesetzte/r|👔'],
  ['t17', 'N3', 'kultur', 'Gesellschaft & Nachrichten', '📰', '経済|keizai|Wirtschaft|📈\n政治|seiji|Politik|🏛️\n環境|kankyou|Umwelt|🌍\n文化|bunka|Kultur|🎎\n社会|shakai|Gesellschaft|👥\n事故|jiko|Unfall|🚧\n地震|jishin|Erdbeben|🌋\n天気予報|tenki yohou|Wetterbericht|🌦️'],
  ['t18', 'N3', 'reisen', 'Sehenswürdigkeiten', '⛩️', '観光|kankou|Sightseeing|📸\n神社|jinja|Schrein|⛩️\nお寺|otera|Tempel|🛕\n温泉|onsen|heiße Quelle|♨️\n祭り|matsuri|Fest|🎆\n宿泊|shukuhaku|Übernachtung|🏨\n案内|annai|Führung / Auskunft|ℹ️\n伝統|dentou|Tradition|🏯'],
  ['t19', 'N2', 'arbeit', 'Business-Japanisch', '🤝', '取引|torihiki|Geschäft|🤝\n契約|keiyaku|Vertrag|📄\n担当|tantou|zuständig|🎯\n検討|kentou|Prüfung / Erwägung|🔍\n報告|houkoku|Bericht|📋\n相談|soudan|Beratung|💬\n提案|teian|Vorschlag|💡\n責任|sekinin|Verantwortung|⚖️'],
  ['t20', 'N2', 'kultur', 'Meinung & Gesellschaft', '🗣️', '意見|iken|Meinung|🗣️\n影響|eikyou|Einfluss|🌊\n課題|kadai|Aufgabe / Problem|🧩\n状況|joukyou|Lage|📊\n傾向|keikou|Tendenz|📈\n関係|kankei|Beziehung|🔗\n批判|hihan|Kritik|🧐\n結果|kekka|Ergebnis|🏁'],
  ['t21', 'N2', 'anime', 'Held & Schicksal', '🌟', '運命|unmei|Schicksal|🌠\n覚悟|kakugo|Entschlossenheit|🔥\n秘密|himitsu|Geheimnis|🤐\n戦い|tatakai|Kampf|⚔️\n勇気|yuuki|Mut|🦁\n絆|kizuna|Band / Verbundenheit|🪢\n犠牲|gisei|Opfer|🕯️\n希望|kibou|Hoffnung|🌈'],
  ['t22', 'N1', 'kultur', 'Abstraktes Denken', '🧠', '概念|gainen|Konzept|🧠\n抽象|chuushou|abstrakt|🌫️\n矛盾|mujun|Widerspruch|♾️\n妥協|dakyou|Kompromiss|🤝\n趣旨|shushi|Sinn / Zweck|🎯\n把握|haaku|erfassen|🔭\n顕著|kencho|auffällig|📌\n脆弱|zeijaku|zerbrechlich|🥚'],
  ['t23', 'N1', 'arbeit', 'Politik & Recht', '⚖️', '憲法|kenpou|Verfassung|📜\n裁判|saiban|Prozess|⚖️\n規制|kisei|Regulierung|🚦\n施策|shisaku|Maßnahme|🛠️\n審議|shingi|Beratung (Gremium)|🏛️\n条約|jouyaku|Staatsvertrag|🖋️\n摩擦|masatsu|Reibung|🔥\n懸念|kenen|Bedenken|😟'],
  ['t24', 'N1', 'kultur', 'Redewendungen (四字熟語)', '🈴', '一期一会|ichigo ichie|einmalige Begegnung|🍵\n以心伝心|ishin denshin|Verständigung ohne Worte|💞\n七転八起|nanakorobi yaoki|Hinfallen und Aufstehen|🔁\n十人十色|juunin toiro|Jeder ist anders|🎨\n臨機応変|rinki ouhen|flexibel reagieren|🌀\n自業自得|jigou jitoku|selbst schuld|🪞\n温故知新|onko chishin|Aus Altem Neues lernen|📚\n初志貫徹|shoshi kantetsu|Vorsatz durchziehen|🏹'],
];
export const TOPICS = [
  ...BASE_TOPICS.map(t => ({ ...t, lvl: META[t.id][0], tag: META[t.id][1] })),
  ...MORE_TOPICS.map(([id, lvl, tag, title, emoji, src]) => ({ id, lvl, tag, title, emoji, items: items(src) })),
];

const WD = (jp, ro, de) => [jp, ro, de];
STORIES.forEach(s => (s.lvl = 'N5'));
STORIES.push(
  { id: 's6', lvl: 'N4', title: 'Reise nach Kyoto', emoji: '🚅', scene: 'Eine Reise wird geplant.', lines: [
    { who: 'N', end: '。', de: 'Nächste Woche reise ich nach Kyoto.', words: [WD('来週', 'raishuu', 'nächste Woche'), WD('京都', 'Kyouto', 'Kyoto'), WD('へ', 'e', '(nach)'), WD('旅行', 'ryokou', 'Reise'), WD('に', 'ni', '(zum Zweck)'), WD('行きます', 'ikimasu', 'gehen')] },
    { who: 'N', end: '。', de: 'Das Hotel habe ich schon reserviert.', words: [WD('ホテル', 'hoteru', 'Hotel'), WD('は', 'wa', '(Themen-Partikel)'), WD('もう', 'mou', 'schon'), WD('予約', 'yoyaku', 'Reservierung'), WD('しました', 'shimashita', 'habe gemacht')] },
    { who: 'N', end: '。', de: 'Mit dem Zug dauert es zwei Stunden.', words: [WD('電車', 'densha', 'Zug'), WD('で', 'de', '(mit)'), WD('二時間', 'nijikan', 'zwei Stunden'), WD('かかります', 'kakarimasu', 'dauert')] },
    { who: 'N', end: '。', de: 'Ich möchte Tempel und Schreine sehen.', words: [WD('お寺', 'otera', 'Tempel'), WD('と', 'to', '(und)'), WD('神社', 'jinja', 'Schrein'), WD('を', 'o', '(Objekt-Partikel)'), WD('見たい', 'mitai', 'sehen wollen'), WD('です', 'desu', 'ist')] },
    { who: 'N', end: '！', de: 'Ich freue mich!', words: [WD('楽しみ', 'tanoshimi', 'Vorfreude'), WD('です', 'desu', 'ist')] },
  ] },
  { id: 's7', lvl: 'N3', title: 'Im Büro', emoji: '🏢', scene: 'Ein kurzes Gespräch mit dem Chef.', lines: [
    { who: 'A', end: '。', de: 'Entschuldigung.', words: [WD('すみません', 'sumimasen', 'Entschuldigung')] },
    { who: 'A', end: '？', de: 'Ab wann ist die Besprechung?', words: [WD('会議', 'kaigi', 'Besprechung'), WD('は', 'wa', '(Themen-Partikel)'), WD('何時', 'nanji', 'wie spät'), WD('から', 'kara', '(ab)'), WD('ですか', 'desu ka', 'ist es?')] },
    { who: 'B', end: '。', de: 'Ab drei Uhr.', words: [WD('三時', 'sanji', 'drei Uhr'), WD('から', 'kara', '(ab)'), WD('です', 'desu', 'ist')] },
    { who: 'B', end: '。', de: 'Bitte bereiten Sie die Unterlagen vor.', words: [WD('資料', 'shiryou', 'Unterlagen'), WD('を', 'o', '(Objekt-Partikel)'), WD('準備', 'junbi', 'Vorbereitung'), WD('しておいて', 'shite oite', 'vorab tun'), WD('ください', 'kudasai', 'bitte')] },
    { who: 'A', end: '？', de: 'Verstanden. Wann ist die Frist?', words: [WD('わかりました', 'wakarimashita', 'verstanden'), WD('締め切り', 'shimekiri', 'Frist'), WD('は', 'wa', '(Themen-Partikel)'), WD('いつ', 'itsu', 'wann'), WD('ですか', 'desu ka', 'ist es?')] },
    { who: 'B', end: '。', de: 'Bis Freitag, bitte.', words: [WD('金曜日', 'kinyoubi', 'Freitag'), WD('まで', 'made', '(bis)'), WD('に', 'ni', '(spätestens)'), WD('お願いします', 'onegaishimasu', 'bitte')] },
  ] },
  { id: 's8', lvl: 'N2', title: 'Eine schwere Entscheidung', emoji: '🤔', scene: 'Soll er den neuen Job annehmen?', lines: [
    { who: 'N', end: '。', de: 'Er schwankt noch, ob er die neue Arbeit übernehmen soll.', words: [WD('彼', 'kare', 'er'), WD('は', 'wa', '(Themen-Partikel)'), WD('新しい', 'atarashii', 'neu'), WD('仕事', 'shigoto', 'Arbeit'), WD('を', 'o', '(Objekt-Partikel)'), WD('引き受ける', 'hikiukeru', 'übernehmen'), WD('かどうか', 'ka dou ka', 'ob oder nicht'), WD('まだ', 'mada', 'noch'), WD('迷っている', 'mayotte iru', 'schwankt')] },
    { who: 'N', end: '。', de: 'Das Gehalt steigt, aber auch die Verantwortung wird größer.', words: [WD('給料', 'kyuuryou', 'Gehalt'), WD('は', 'wa', '(Themen-Partikel)'), WD('上がる', 'agaru', 'steigen'), WD('が', 'ga', 'aber'), WD('責任', 'sekinin', 'Verantwortung'), WD('も', 'mo', 'auch'), WD('重くなる', 'omoku naru', 'wird schwerer')] },
    { who: 'N', end: '。', de: 'Nach Rücksprache mit der Familie beschloss er, es zu wagen.', words: [WD('家族', 'kazoku', 'Familie'), WD('に', 'ni', '(bei)'), WD('相談', 'soudan', 'Beratung'), WD('した', 'shita', 'tat'), WD('結果', 'kekka', 'Ergebnis'), WD('挑戦', 'chousen', 'Herausforderung'), WD('して', 'shite', 'tun'), WD('みる', 'miru', 'ausprobieren'), WD('ことにした', 'koto ni shita', 'beschloss')] },
    { who: 'N', end: '。', de: 'Wenn man zögert, bleibt nur, Mut zu fassen und einen Schritt zu gehen.', words: [WD('迷った', 'mayotta', 'gezögert'), WD('とき', 'toki', 'wenn'), WD('は', 'wa', '(Themen-Partikel)'), WD('勇気', 'yuuki', 'Mut'), WD('を', 'o', '(Objekt-Partikel)'), WD('出して', 'dashite', 'aufbringen'), WD('一歩', 'ippo', 'ein Schritt'), WD('進む', 'susumu', 'vorangehen'), WD('しかない', 'shika nai', 'bleibt nur')] },
  ] },
  { id: 's9', lvl: 'N1', title: 'Gedanken zur Sprache', emoji: '🧠', scene: 'Ein kurzer Essay.', lines: [
    { who: 'N', end: '。', de: 'Sprache ist nicht bloß ein Mittel der Übermittlung, sie formt das Denken selbst.', words: [WD('言語', 'gengo', 'Sprache'), WD('は', 'wa', '(Themen-Partikel)'), WD('単なる', 'tannaru', 'bloß'), WD('伝達', 'dentatsu', 'Übermittlung'), WD('の', 'no', '(von)'), WD('手段', 'shudan', 'Mittel'), WD('ではなく', 'de wa naku', 'nicht … sondern'), WD('思考', 'shikou', 'Denken'), WD('そのもの', 'sono mono', 'selbst'), WD('を', 'o', '(Objekt-Partikel)'), WD('形作る', 'katachizukuru', 'formen')] },
    { who: 'N', end: '。', de: 'Eine neue Sprache zu erlernen erweitert auch die Sicht auf die Welt.', words: [WD('新たな', 'arata na', 'neu'), WD('言語', 'gengo', 'Sprache'), WD('を', 'o', '(Objekt-Partikel)'), WD('習得', 'shuutoku', 'Aneignung'), WD('する', 'suru', 'tun'), WD('こと', 'koto', '(Nominalisierung)'), WD('は', 'wa', '(Themen-Partikel)'), WD('世界', 'sekai', 'Welt'), WD('の', 'no', '(von)'), WD('見方', 'mikata', 'Sichtweise'), WD('を', 'o', '(Objekt-Partikel)'), WD('広げる', 'hirogeru', 'erweitern'), WD('営み', 'itonami', 'Tätigkeit'), WD('でもある', 'de mo aru', 'ist auch')] },
    { who: 'N', end: '。', de: 'Wesentlich ist, ohne Hast und mit Freude dranzubleiben.', words: [WD('焦らず', 'aserazu', 'ohne Hast'), WD('楽しみながら', 'tanoshimi nagara', 'mit Freude'), WD('続ける', 'tsuzukeru', 'fortsetzen'), WD('こと', 'koto', '(Nominalisierung)'), WD('こそ', 'koso', 'gerade'), WD('が', 'ga', '(Subjekt-Partikel)'), WD('肝要', 'kanyou', 'wesentlich'), WD('だ', 'da', 'ist')] },
  ] },
);

// Kanji: Zeichen|Lesung|Bedeutung|Beispielwort|Romaji|Beispiel-Bedeutung
const KANJI_SRC = {
  N5: `一|ichi · hito(tsu)|eins|一人|hitori|eine Person
二|ni · futa(tsu)|zwei|二月|nigatsu|Februar
三|san · mit(tsu)|drei|三時|sanji|drei Uhr
四|shi/yon · yot(tsu)|vier|四月|shigatsu|April
五|go · itsu(tsu)|fünf|五日|itsuka|der Fünfte
六|roku · mut(tsu)|sechs|六月|rokugatsu|Juni
七|shichi/nana|sieben|七時|shichiji|sieben Uhr
八|hachi · yat(tsu)|acht|八百屋|yaoya|Gemüsehändler
九|kyuu/ku · kokono(tsu)|neun|九月|kugatsu|September
十|juu · too|zehn|十分|juppun|zehn Minuten
百|hyaku|hundert|三百円|sanbyaku en|300 Yen
千|sen · chi|tausend|千円|sen en|1000 Yen
万|man|zehntausend|一万円|ichiman en|10.000 Yen
円|en|Yen / Kreis|百円|hyaku en|100 Yen
日|nichi · hi|Tag / Sonne|日曜日|nichiyoubi|Sonntag
月|getsu · tsuki|Mond / Monat|月曜日|getsuyoubi|Montag
火|ka · hi|Feuer|火曜日|kayoubi|Dienstag
水|sui · mizu|Wasser|水曜日|suiyoubi|Mittwoch
木|moku · ki|Baum / Holz|木曜日|mokuyoubi|Donnerstag
金|kin · kane|Gold / Geld|金曜日|kinyoubi|Freitag
土|do · tsuchi|Erde|土曜日|doyoubi|Samstag
年|nen · toshi|Jahr|今年|kotoshi|dieses Jahr
今|kon · ima|jetzt|今日|kyou|heute
時|ji · toki|Zeit / Uhr|時間|jikan|Zeit
分|fun/bun · wa(karu)|Minute / verstehen|分かる|wakaru|verstehen
半|han|halb|半分|hanbun|Hälfte
人|jin/nin · hito|Mensch|日本人|nihonjin|Japaner/in
男|dan · otoko|Mann|男の子|otoko no ko|Junge
女|jo · onna|Frau|女の子|onna no ko|Mädchen
子|shi · ko|Kind|子ども|kodomo|Kind
父|fu · chichi|Vater|お父さん|otousan|Vater (höflich)
母|bo · haha|Mutter|お母さん|okaasan|Mutter (höflich)
友|yuu · tomo|Freund|友達|tomodachi|Freund/in
先|sen · saki|vorher / voraus|先生|sensei|Lehrer/in
生|sei · i(kiru)|Leben / geboren|学生|gakusei|Student/in
学|gaku · mana(bu)|lernen|大学|daigaku|Universität
校|kou|Schule|学校|gakkou|Schule
大|dai · oo(kii)|groß|大きい|ookii|groß
小|shou · chii(sai)|klein|小さい|chiisai|klein
中|chuu · naka|Mitte / in|中国|chuugoku|China
上|jou · ue|oben|上手|jouzu|geschickt
下|ka · shita|unten|下手|heta|ungeschickt
左|sa · hidari|links|左手|hidarite|linke Hand
右|u · migi|rechts|右側|migigawa|rechte Seite
山|san · yama|Berg|富士山|fujisan|Berg Fuji
川|sen · kawa|Fluss|小川|ogawa|Bach
田|den · ta|Reisfeld|田んぼ|tanbo|Reisfeld
雨|u · ame|Regen|大雨|ooame|Starkregen
天|ten · ama|Himmel|天気|tenki|Wetter
気|ki|Geist / Luft|元気|genki|gesund / munter
空|kuu · sora|Himmel / leer|空港|kuukou|Flughafen
花|ka · hana|Blume|花火|hanabi|Feuerwerk
犬|ken · inu|Hund|子犬|koinu|Welpe
食|shoku · ta(beru)|essen|食べ物|tabemono|Essen
飲|in · no(mu)|trinken|飲み物|nomimono|Getränk
見|ken · mi(ru)|sehen|見る|miru|sehen
聞|bun · ki(ku)|hören / fragen|新聞|shinbun|Zeitung
話|wa · hana(su)|sprechen|電話|denwa|Telefon
読|doku · yo(mu)|lesen|読む|yomu|lesen
書|sho · ka(ku)|schreiben|書く|kaku|schreiben
行|kou · i(ku)|gehen|行く|iku|gehen
来|rai · ku(ru)|kommen|来年|rainen|nächstes Jahr
出|shutsu · de(ru)|hinausgehen|出口|deguchi|Ausgang
入|nyuu · hai(ru)|eintreten|入口|iriguchi|Eingang
立|ritsu · ta(tsu)|stehen|立つ|tatsu|aufstehen
休|kyuu · yasu(mu)|ausruhen|休み|yasumi|Pause / Urlaub
買|bai · ka(u)|kaufen|買い物|kaimono|Einkaufen
高|kou · taka(i)|hoch / teuer|高い|takai|hoch / teuer
安|an · yasu(i)|billig / ruhig|安い|yasui|billig
新|shin · atara(shii)|neu|新しい|atarashii|neu
古|ko · furu(i)|alt (Dinge)|古い|furui|alt
長|chou · naga(i)|lang|長い|nagai|lang
白|haku · shiro(i)|weiß|白い|shiroi|weiß
北|hoku · kita|Norden|北海道|hokkaidou|Hokkaido
南|nan · minami|Süden|南口|minamiguchi|Südausgang
東|tou · higashi|Osten|東京|toukyou|Tokio
西|sei · nishi|Westen|西口|nishiguchi|Westausgang
外|gai · soto|außen|外国|gaikoku|Ausland
国|koku · kuni|Land|外国人|gaikokujin|Ausländer/in
車|sha · kuruma|Auto|電車|densha|Zug
電|den|Elektrizität|電気|denki|Strom / Licht
名|mei · na|Name|名前|namae|Name
本|hon · moto|Buch / Ursprung|日本|nihon|Japan
何|nan · nani|was|何時|nanji|wie spät
毎|mai|jeder|毎日|mainichi|jeden Tag
後|go · ato|nach / hinten|午後|gogo|Nachmittag
前|zen · mae|vor / vorher|午前|gozen|Vormittag
間|kan · aida|Zwischenraum|時間|jikan|Zeit
午|go|Mittag|午前|gozen|Vormittag
語|go · kata(ru)|Sprache|日本語|nihongo|Japanisch
目|moku · me|Auge|目薬|megusuri|Augentropfen
耳|ji · mimi|Ohr|耳鼻科|jibika|HNO-Abteilung
口|kou · kuchi|Mund|出口|deguchi|Ausgang
手|shu · te|Hand|握手|akushu|Handschlag
足|soku · ashi|Fuß / Bein|足音|ashioto|Schritte
力|ryoku · chikara|Kraft|電力|denryoku|Strom (Energie)
会|kai · a(u)|treffen|会社|kaisha|Firma
道|dou · michi|Weg|歩道|hodou|Gehweg`,
  N4: `魚|gyo · sakana|Fisch|焼き魚|yakizakana|gegrillter Fisch
肉|niku|Fleisch|牛肉|gyuuniku|Rindfleisch
茶|cha|Tee|お茶|ocha|Tee
飯|han · meshi|Reis / Mahlzeit|ご飯|gohan|Reis / Essen
店|ten · mise|Laden|店員|tenin|Verkäufer/in
町|chou · machi|Stadt / Viertel|下町|shitamachi|Altstadtviertel
市|shi · ichi|Stadt / Markt|市場|ichiba|Markt
村|son · mura|Dorf|村人|murabito|Dorfbewohner
海|kai · umi|Meer|海外|kaigai|Übersee
駅|eki|Bahnhof|駅前|ekimae|Bahnhofsvorplatz
自|ji · mizuka(ra)|selbst|自分|jibun|selbst
動|dou · ugo(ku)|sich bewegen|動物|doubutsu|Tier
物|butsu · mono|Ding|荷物|nimotsu|Gepäck
事|ji · koto|Sache|食事|shokuji|Mahlzeit
思|shi · omo(u)|denken|思う|omou|denken
知|chi · shi(ru)|wissen|知る|shiru|wissen
考|kou · kanga(eru)|nachdenken|考える|kangaeru|nachdenken
教|kyou · oshi(eru)|lehren|教室|kyoushitsu|Klassenzimmer
習|shuu · nara(u)|üben / lernen|習う|narau|lernen
勉|ben|Fleiß|勉強|benkyou|Lernen
強|kyou · tsuyo(i)|stark|強い|tsuyoi|stark
働|dou · hatara(ku)|arbeiten|働く|hataraku|arbeiten
歩|ho · aru(ku)|zu Fuß gehen|歩く|aruku|zu Fuß gehen
走|sou · hashi(ru)|rennen|走る|hashiru|rennen
泳|ei · oyo(gu)|schwimmen|泳ぐ|oyogu|schwimmen
歌|ka · uta|singen / Lied|歌手|kashu|Sänger/in
言|gen · i(u)|sagen|言う|iu|sagen
作|saku · tsuku(ru)|machen|作る|tsukuru|machen
使|shi · tsuka(u)|benutzen|使う|tsukau|benutzen
持|ji · mo(tsu)|halten / haben|持つ|motsu|halten
待|tai · ma(tsu)|warten|待つ|matsu|warten
開|kai · a(keru)|öffnen|開ける|akeru|öffnen
閉|hei · shi(meru)|schließen|閉める|shimeru|schließen
始|shi · haji(maru)|anfangen|始まる|hajimaru|anfangen
終|shuu · o(waru)|enden|終わる|owaru|enden
朝|chou · asa|Morgen|朝ご飯|asagohan|Frühstück
昼|chuu · hiru|Mittag|昼ご飯|hirugohan|Mittagessen
夜|ya · yoru|Nacht|今夜|konya|heute Nacht
夏|ka · natsu|Sommer|夏休み|natsuyasumi|Sommerferien
冬|tou · fuyu|Winter|冬休み|fuyuyasumi|Winterferien
春|shun · haru|Frühling|春休み|haruyasumi|Frühlingsferien
秋|shuu · aki|Herbst|秋風|akikaze|Herbstwind
赤|seki · aka(i)|rot|赤い|akai|rot
青|sei · ao(i)|blau / grün|青い|aoi|blau
黒|koku · kuro(i)|schwarz|黒い|kuroi|schwarz
色|shoku · iro|Farbe|茶色|chairo|Braun
重|juu · omo(i)|schwer|重い|omoi|schwer
軽|kei · karu(i)|leicht|軽い|karui|leicht
明|mei · aka(rui)|hell|明るい|akarui|hell
暗|an · kura(i)|dunkel|暗い|kurai|dunkel`,
  N3: `社|sha|Gesellschaft / Firma|社会|shakai|Gesellschaft
員|in|Mitglied|会社員|kaishain|Angestellte/r
議|gi|Beratung|会議|kaigi|Besprechung
験|ken|Prüfung|試験|shiken|Prüfung
試|shi · tame(su)|versuchen|試合|shiai|Wettkampf
選|sen · era(bu)|wählen|選ぶ|erabu|wählen
決|ketsu · ki(meru)|entscheiden|決める|kimeru|entscheiden
変|hen · ka(waru)|sich ändern|変わる|kawaru|sich ändern
続|zoku · tsuzu(ku)|andauern|続く|tsuzuku|andauern
伝|den · tsuta(eru)|mitteilen|伝える|tsutaeru|mitteilen
送|sou · oku(ru)|senden|送る|okuru|senden
届|todo(ku)|ankommen|届く|todoku|ankommen
借|shaku · ka(riru)|leihen|借りる|kariru|ausleihen
貸|tai · ka(su)|verleihen|貸す|kasu|verleihen
返|hen · kae(su)|zurückgeben|返す|kaesu|zurückgeben
忘|bou · wasu(reru)|vergessen|忘れる|wasureru|vergessen
覚|kaku · obo(eru)|sich merken|覚える|oboeru|sich merken
調|chou · shira(beru)|untersuchen|調べる|shiraberu|nachschlagen
相|sou · ai|gegenseitig|相談|soudan|Beratung
談|dan|Gespräch|談話|danwa|Gespräch
親|shin · oya|Eltern / vertraut|親切|shinsetsu|freundlich
切|setsu · ki(ru)|schneiden|大切|taisetsu|wichtig
便|ben · bin|bequem / Post|便利|benri|praktisch
利|ri|Nutzen|利用|riyou|Nutzung
旅|ryo · tabi|Reise|旅行|ryokou|Reise
館|kan|Gebäude|図書館|toshokan|Bibliothek
泊|haku · to(maru)|übernachten|泊まる|tomaru|übernachten
予|yo|im Voraus|予約|yoyaku|Reservierung
約|yaku|Versprechen|約束|yakusoku|Versprechen
束|soku · taba|Bündel|花束|hanataba|Blumenstrauß
運|un · hako(bu)|befördern / Glück|運動|undou|Sport / Bewegung
経|kei · he(ru)|vergehen / Verlauf|経験|keiken|Erfahrung`,
  N2: `影|ei · kage|Schatten|影響|eikyou|Einfluss
響|kyou · hibi(ku)|hallen|響く|hibiku|widerhallen
政|sei|Politik|政治|seiji|Politik
治|ji · nao(ru)|regieren / heilen|治る|naoru|gesund werden
済|sai · su(mu)|erledigt|経済|keizai|Wirtschaft
環|kan|Ring / Umgebung|環境|kankyou|Umwelt
境|kyou · sakai|Grenze|国境|kokkyou|Landesgrenze
状|jou|Zustand|状況|joukyou|Lage
況|kyou|Lage|景況|keikyou|Konjunktur
関|kan · seki|Beziehung|関係|kankei|Beziehung
係|kei · kakari|zuständig|係|kakari|Zuständige/r
責|seki · se(meru)|Verantwortung|責任|sekinin|Verantwortung
任|nin · maka(seru)|Aufgabe|任せる|makaseru|anvertrauen
提|tei|vorlegen|提案|teian|Vorschlag
案|an|Plan|案内|annai|Führung / Auskunft
検|ken|prüfen|検討|kentou|Erwägung
討|tou|diskutieren|討論|touron|Debatte
批|hi|kritisieren|批判|hihan|Kritik
判|han · ban|urteilen|判断|handan|Urteil
断|dan · kotowa(ru)|ablehnen|断る|kotowaru|ablehnen
傾|kei · katamu(ku)|sich neigen|傾向|keikou|Tendenz
向|kou · mu(ku)|zugewandt|向かう|mukau|sich begeben
結|ketsu · musu(bu)|verbinden|結果|kekka|Ergebnis
果|ka · ha(te)|Frucht / Ergebnis|果物|kudamono|Obst
勇|yuu · isa(mashii)|mutig|勇気|yuuki|Mut
希|ki|Hoffnung|希望|kibou|Hoffnung
望|bou · nozo(mu)|wünschen|望む|nozomu|wünschen
命|mei · inochi|Leben / Schicksal|運命|unmei|Schicksal
戦|sen · tataka(u)|kämpfen|戦争|sensou|Krieg`,
  N1: `概|gai|Überblick|概念|gainen|Konzept
念|nen|Gedanke|残念|zannen|schade
抽|chuu|herausziehen|抽象|chuushou|abstrakt
象|shou · zou|Gestalt / Elefant|印象|inshou|Eindruck
矛|mu · hoko|Lanze|矛盾|mujun|Widerspruch
盾|jun · tate|Schild|後ろ盾|ushirodate|Rückhalt
妥|da|angemessen|妥協|dakyou|Kompromiss
協|kyou|zusammenarbeiten|協力|kyouryoku|Zusammenarbeit
把|ha|greifen|把握|haaku|erfassen
握|aku · nigi(ru)|greifen|握手|akushu|Handschlag
顕|ken|offenbar|顕著|kencho|auffällig
著|cho · arawa(su)|verfassen / auffällig|著者|chosha|Autor/in
脆|zei · moro(i)|zerbrechlich|脆い|moroi|zerbrechlich
弱|jaku · yowa(i)|schwach|脆弱|zeijaku|fragil
憲|ken|Verfassung|憲法|kenpou|Verfassung
法|hou|Gesetz|法律|houritsu|Gesetz
裁|sai · sabaku|richten|裁判|saiban|Prozess
規|ki|Regel|規則|kisoku|Regel
制|sei|System / kontrollieren|制度|seido|System
施|shi · hodoko(su)|durchführen|施設|shisetsu|Einrichtung
審|shin|prüfen|審査|shinsa|Prüfung
摩|ma|reiben|摩擦|masatsu|Reibung
懸|ken · ka(keru)|aufhängen|懸念|kenen|Bedenken
絆|han · kizuna|Band / Bindung|絆|kizuna|Band`,
};
export const KANJI = [];
export const KGROUPS = [];
LEVELS.forEach(lv => {
  const list = KANJI_SRC[lv].split('\n').map(l => {
    const [k, r, de, w, wr, wd] = l.split('|');
    return { k, r, de, lvl: lv, ex: { w, r: wr, d: wd } };
  });
  list.forEach(k => KANJI.push(k));
  for (let i = 0; i < list.length; i += 5) {
    const n = i / 5 + 1; const items = list.slice(i, i + 5);
    KGROUPS.push({ id: `j${lv}-${n}`, lvl: lv, n, items });
  }
});
export const KANJI_MAP = Object.fromEntries(KANJI.map(k => [k.k, k]));
