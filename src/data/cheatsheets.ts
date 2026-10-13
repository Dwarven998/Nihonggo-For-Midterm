export interface CheatSheetSection {
  id: string;
  title: string;
  japaneseTitle: string;
  sourceLabel: string;
  highYieldPoints: string[];
  tables?: {
    header: string[];
    rows: string[][];
  };
  examTraps: string[];
}

export const CHEATSHEETS: CheatSheetSection[] = [
  {
    id: 'cs-diacritics',
    title: 'Hiragana Diacritics (Dakuten & Handakuten)',
    japaneseTitle: '濁音・半濁音の総復習',
    sourceLabel: 'Lesson 1.2 PDF',
    highYieldPoints: [
      'Dakuten (ten-ten ゛): Two diagonal strokes in top-right corner. Adds voice (vibration).',
      'Handakuten (maru ゜): Tiny circle in top-right corner. Converts H-sounds to P-sounds.',
      'Row shifts: K → G (がぎぐげご), S → Z (ざじずぜぞ), T → D (だぢづでど), H → B (ばびぶべぼ) with dakuten.',
      'H-row + maru: H → P (ぱぴぷぺぽ) with handakuten.',
      'Rare characters: ぢ (dji) and づ (dzu) are almost never used in modern Japanese. Common exceptions: はなぢ (hanaji - nosebleed = hana + chi) and つづく (tsudzuku - to continue). Standard "ji" and "zu" use じ and ず (e.g. すずき suzuki).',
    ],
    tables: {
      header: ['Base', 'Dakuten (゛)', 'Reading', 'Handakuten (゜)', 'Reading'],
      rows: [
        ['か (ka)', 'が (ga)', 'Voiced k', '—', '—'],
        ['し (shi)', 'じ (ji)', 'Voiced sh', '—', '—'],
        ['ち (chi)', 'ぢ (dji/ji)', 'Rarely used', '—', '—'],
        ['つ (tsu)', 'づ (dzu/zu)', 'Rarely used', '—', '—'],
        ['は (ha)', 'ば (ba)', 'Voiced h', 'ぱ (pa)', 'Plosive p'],
      ],
    },
    examTraps: [
      'Do not confuse じ (ji from sa-row) with ぢ (dji from ta-row). Standard words use じ (じしょ, ぎんこう).',
      'Do not confuse づ (dzu) with ず (zu). Words like すずき use ず, while つづく uses づ.',
      'Remember ten-ten and maru marks go strictly in the TOP-RIGHT corner, not bottom or left.',
    ],
  },
  {
    id: 'cs-digraphs-n',
    title: 'Hiragana Digraphs, Sokuon & ん Pronunciation',
    japaneseTitle: '拗音・促音・「ん」の3つの発音',
    sourceLabel: 'Lesson 1.3, 1.4 & 1.5 PDFs',
    highYieldPoints: [
      'Digraphs (Yoon): -i syllables + small ゃ, ゅ, ょ. The 2nd character is written visibly smaller.',
      'One syllable vs Two syllables: きゃ (kya - 1 mora) vs きや (ki-ya - 2 moras).',
      'Special romaji: しゃ/しゅ/しょ = sha/shu/sho (not shya). ちゃ/ちゅ/ちょ = cha/chu/cho (not chya). じゃ/じゅ/じょ = ja/ju/jo.',
      'Sokuon (Long consonants): chiisai tsu (っ) is written smaller, creates a stop before the next consonant (e.g. がっこう gakkou, きっぷ kippu).',
      'Character ん has THREE distinct pronunciations:',
      '1. [m]: Before m, p, b (sanmai → sammai, senpai → sempai, shinbun → shimbun, tenpura → tempura).',
      '2. [ng]: Before k, g, w (ginkou → gingkou, hangaku → hanggaku, denwa → dengwa).',
      '3. [n]: Standard nasal sound elsewhere.',
    ],
    tables: {
      header: ['Sound Target', 'Following Consonants', 'Phonetic Sound', 'Exam Examples'],
      rows: [
        ['Character ん rule 1', 'm, p, b', 'm sound', 'sanmai (sammai), senpai (sempai), tenpura'],
        ['Character ん rule 2', 'k, g, w', 'ng sound', 'ginkou (gingkou), denwa (dengwa), hangaku'],
        ['Character ん rule 3', 'all others', 'n sound', 'nihon, onna, sensei'],
      ],
    },
    examTraps: [
      'きっぷ (kippu = ticket) vs きって (kitte = postage stamps) — very common test question!',
      'In denwa (telephone), ん is followed by "w", so it is pronounced "dengwa", NOT "den-wa" or "demwa".',
      'In shinbun (newspaper), the first ん is followed by "b", so it is pronounced "shimbun".',
    ],
  },
  {
    id: 'cs-greetings',
    title: 'Basic Greetings & Common Expressions',
    japaneseTitle: '基本の挨拶マトリックス',
    sourceLabel: 'Lesson 2 PDF',
    highYieldPoints: [
      'Time: Ohayou gozaimasu (morning), Konnichiwa (afternoon), Konbanwa (evening).',
      'Thanks & Apologies: (Doumo) Arigatou gozaimasu → Dou itashimashite. Sumimasen (Excuse me / I\'m sorry).',
      'Meal pair: Itadakimasu (before food with hands in front of chest) → Gochisousama deshita (after feast).',
      'First meeting pair: Hajimemashite (How do you do?) → (Douzo) yoroshiku onegaishimasu (Please be nice to me).',
      'Leaving workplace pair: (Osaki ni) shitsurei shimasu (Leaving ahead) → Otsukaresama deshita (Thank you for hard work).',
      'Home pair 1: Ittekimasu (I\'m leaving) → Itterasshai (Please go).',
      'Home pair 2: Tadaima (I\'m home) → Okaeri nasai (Welcome back).',
      'Please distinction: Onegaishimasu (to request something) vs Douzo (to offer or accept an offer).',
    ],
    tables: {
      header: ['Situation', 'Trigger Expression', 'Expected Response', 'English Meaning'],
      rows: [
        ['Leaving home', 'Ittekimasu', 'Itterasshai', "I'm leaving → Please go"],
        ['Returning home', 'Tadaima', 'Okaeri nasai', "I'm home → Welcome back"],
        ['Leaving office ahead', 'Osaki ni shitsurei shimasu', 'Otsukaresama (deshita)', 'Excuse me for leaving ahead → Good work'],
        ['Thanks received', 'Arigatou gozaimasu', 'Dou itashimashite', "Thank you → You're welcome"],
        ['Meeting friend', 'Ogenki desu ka', 'Genki desu. Okagesama de.', 'How are you? → Fine, thankfully.'],
      ],
    },
    examTraps: [
      'Never confuse Ittekimasu (person leaving) with Itterasshai (person staying).',
      'Never confuse Tadaima (person returning) with Okaeri nasai (person welcoming them).',
      'Do not say Sayounara to coworkers leaving work; say "Otsukaresama deshita".',
    ],
  },
  {
    id: 'cs-numbers',
    title: 'Numbers & Large Numerals',
    japaneseTitle: '数字の音変化と4桁グルーピング',
    sourceLabel: 'Lesson 3 PDF',
    highYieldPoints: [
      'Digits: 0 zero/rei, 1 ichi, 2 ni, 3 san, 4 yon (yo/shi), 5 go, 6 roku, 7 nana (shichi), 8 hachi, 9 kyuu (ku), 10 juu.',
      'Irregular Hundreds: 300 = sanbyaku (b), 600 = roppyaku (pp), 800 = happyaku (pp). Others regular (100 hyaku, 200 nihyaku, 400 yonhyaku, 500 gohyaku, 700 nanahyaku, 900 kyuuhyaku).',
      'Irregular Thousands: 3,000 = sanzen (zen), 8,000 = hassen (double s). 1,000 is sen (issen inside man compounds).',
      'Large numeral units: man (10,000 / 10^4), oku (100,000,000 / 10^8), chou (1,000,000,000,000 / 10^12).',
      'Grouping rule: Partition digits by FOUR from the right!',
      'Example: 51,181 → 5 | 1181 → go man issen hyaku hachijuu ichi.',
      'Example: 428,820 → 42 | 8820 → yonjuu ni man hassen happyaku nijuu.',
      'Example: 7,295,030 → 729 | 5030 → nanahyaku nijuu kyuu man gosen sanjuu.',
    ],
    tables: {
      header: ['Number', 'Romaji', 'Type', 'Key Memorization Note'],
      rows: [
        ['300', 'sanbyaku', 'Hundred', 'b sound (byaku), NOT sanhyaku'],
        ['600', 'roppyaku', 'Hundred', 'double p sound, NOT rokuhyaku'],
        ['800', 'happyaku', 'Hundred', 'double p sound, NOT hachihyaku'],
        ['3,000', 'sanzen', 'Thousand', 'z sound (zen), NOT sansen'],
        ['8,000', 'hassen', 'Thousand', 'double s sound, NOT hachisen'],
        ['10,000', 'ichi man', 'Large unit', 'Starts 4-digit counting base (万)'],
      ],
    },
    examTraps: [
      'In Western numbers we group by 3 (1,000s), but Japanese counts in 4s (man = 10,000). Always slice from the right in blocks of 4!',
      'Remember that 1,000 inside the man group is "issen" (e.g. 51,181 = go man issen...), not plain sen.',
    ],
  },
  {
    id: 'cs-grammar-sentences',
    title: 'Basic Sentence Patterns & Verb Forms',
    japaneseTitle: '基本文型と活用表',
    sourceLabel: 'Lesson 4 & Irodori Can Do 5/6 PDFs',
    highYieldPoints: [
      'Pattern: Topic wa statement desu (Topic is Statement).',
      'Copula 4-Box Matrix: desu (present affirmative) | ja arimasen (present negative, formal: dewa arimasen) | deshita (past affirmative) | ja arimasen deshita (past negative).',
      'Particle wa (written は, read wa) marks the sentence topic.',
      '~masu Verb Matrix (wakarimasu): wakarimasu (understand) | wakarimasen (don\'t understand) | wakarimashita (understood) | wakarimasen deshita (did not understand).',
      'Differences: kyoushi (profession) vs sensei (honorific address); kaishain (company employee) vs shain (employee of [company]).',
      'Languages use country + ~go: Nihongo (Japanese), Eigo (English), Chuugokugo (Chinese), Indoneshiago (Indonesian).',
    ],
    tables: {
      header: ['Tense / Polarity', 'Copula Form (Noun / Na-adj)', 'Verb Form (wakarimasu)', 'English Translation'],
      rows: [
        ['Present Affirmative', 'desu', 'wakarimasu', 'is / am / are / understand'],
        ['Present Negative', 'ja arimasen (dewa arimasen)', 'wakarimasen', 'is not / don’t understand'],
        ['Past Affirmative', 'deshita', 'wakarimashita', 'was / were / understood'],
        ['Past Negative', 'ja arimasen deshita', 'wakarimasen deshita', 'was not / did not understand'],
      ],
    },
    examTraps: [
      'Never say "Watashi wa sensei desu" when introducing your own job; use "Watashi wa kyoushi desu". Sensei is reserved for addressing others.',
      'Do not confuse ja arimasen (present) with ja arimasen deshita (past).',
    ],
  },
  {
    id: 'cs-particles',
    title: 'Simple Sentences: Particles (wa, mo, no, ka)',
    japaneseTitle: '助詞の役割と疑問詞ルール',
    sourceLabel: 'Lesson 6 PDF',
    highYieldPoints: [
      'wa (は): Topic marker. What the sentence is about.',
      'mo (も): Replaces wa to mean "too" or "also". (Never write "wa mo"). Topic mo statement desu.',
      'no (の): Indicates possession or relationship ("of", "\'s", country origin e.g. Nihon no tabemono, and phone number dashes).',
      'ka (か): Sentence-ending question particle. Word order stays unchanged! Ends with a period (.) in formal Japanese.',
      'Alternative questions: "A desu ka, B desu ka" (e.g. Bo-rupen desu ka, enpitsu desu ka).',
      'Wh-Interrogatives: Nani (What) → drops "i" with desu ka: "Nan desu ka." Itsu (When), Doko (Where), Dare (Who).',
      'Interrogatives + ka = indefinite pronouns: Nanika (something), Itsuka (sometime/someday), Dokoka (somewhere), Dareka (someone).',
    ],
    tables: {
      header: ['Particle / Word', 'Core Meaning', 'Example Sentence', 'Translation'],
      rows: [
        ['wa (は)', 'Topic marker', 'Suzuki san wa enjinia desu.', 'Mr. Suzuki is an engineer.'],
        ['mo (も)', 'Also / too (replaces wa)', 'Inoue san mo enjinia desu.', 'Mr. Inoue is also an engineer.'],
        ['no (の)', 'Possession / "of" / "\'s"', 'CIT no sensei / Akira san no tomodachi', 'Teacher of CIT / Akira’s friend'],
        ['ka (か)', 'Question particle', 'Kanojo wa gakusei desu ka.', 'Is she a student?'],
        ['Nan desu ka', 'What is it? (polite)', 'Nan desu ka.', 'What is it? (dropped "i")'],
        ['Dareka', 'Someone', 'Dareka desu ka.', 'Is it someone?'],
      ],
    },
    examTraps: [
      'In telephone numbers, the hyphen/dash is spoken as "no" (e.g. 272-1416 = ni nana ni no ichi yon ichi roku).',
      'Nani becomes Nan before desu ka ("Nan desu ka", NOT "Nani desu ka").',
      'Particle mo REPLACES wa. Saying "Inoue san wa mo" is grammatically incorrect.',
    ],
  },
  {
    id: 'cs-culture',
    title: 'Japanese Culture & JapanesePod101 Video Review',
    japaneseTitle: '日本の文化とエチケット (True or False)',
    sourceLabel: 'The Japanese Culture PDF & JapanesePod101 Video',
    highYieldPoints: [
      'Ojigi (Bowing): Bow from waist. Deeper bow = more respect. Light head nod for casual friends. Hugging/kissing is NOT standard greeting. Handshakes rare.',
      'Name Honorifics: ~san is universal (men/women, older/younger, married/unmarried). Japanese people called by family name + ~san. Forenames reserved for family/intimate friends. Foreigners can use either name + ~san.',
      '~kun (younger/same age males casual), ~chan (kids/close friends), ~sama (highly polite, shop staff addressing customers).',
      'Meishi koukan (Business cards): Very delicate ritual. Hand over and receive with two hands, read carefully, keep on table respectfully.',
      'Zairyuu kaado (Residence Card): Mandatory ID for foreigners living in Japan 3+ months. Must carry at ALL times.',
      'Oshiburi & Ohiya: Oshiburi is wet hand towel (warm/chilled). Tap water is safe everywhere and served free, known as ohiya.',
      'Train etiquette: Say "Sumimasen. Orimasu" when getting off. Do not wear backpacks on back in crowds. Keep headphones from leaking sound. Women-only cars during rush hours.',
      'Home etiquette: Say "Ojama shimasu" when entering. Turn shoes around facing outward at genkan. Bring a small gift (temiyage/omiyage).',
      'Chopstick taboos: Awasebashi (passing food chopstick to chopstick = funeral bone ceremony). Tatebashi (sticking upright in rice = funeral offering). Yosebashi (dragging bowls with chopsticks).',
      'Bathroom: Furoba (bath) and toire (toilet) are separated. Wash/rinse completely in araiba BEFORE soaking in yubune.',
      'Workplace: Leaving early = "Osaki ni shitsurei shimasu". Reply = "Otsukaresama (deshita)". Junior (kouhai) speaks politely to senior (senpai).',
      'Seating: Kamiza (上座) is seat of honor, furthest from door. In taxi: behind driver. In elevator: inner back corner. Shimoza (下座) is near entrance/controls.',
    ],
    tables: {
      header: ['Cultural Rule', 'Proper Practice', 'Forbidden / Taboo', 'Context'],
      rows: [
        ['Chopsticks', 'Place on rest (hashioki)', 'Tatebashi (upright in rice) / Awasebashi (passing)', 'Funeral associations'],
        ['Bathing', 'Wash clean in araiba first', 'Soaping body inside yubune tub', 'Water is shared for soaking'],
        ['Leaving work', 'Osaki ni shitsurei shimasu', 'Leaving quietly without saying anything', 'Colleagues say Otsukaresama'],
        ['Business Cards', 'Receive with two hands, read it', 'Shoving into back pocket or writing on it', 'Card represents the person'],
        ['Seating hierarchy', 'Kamiza: furthest from entrance', 'Junior sitting in Kamiza', 'Taxi: behind driver is Kamiza'],
      ],
    },
    examTraps: [
      'ALL Culture exam questions are strictly TRUE or FALSE! Never look for multiple-choice answers in this section.',
      'Putting palms together is said before eating (Itadakimasu), NOT when greeting people on the street.',
      'In a taxi, Kamiza is BEHIND THE DRIVER, not the front passenger seat (front seat is Shimoza to handle payments).',
    ],
  },
];
