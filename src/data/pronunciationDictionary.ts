// ============================================================================
// LingoQuest Davao Oriental & DepEd English Pronunciation Dictionary
// Ensures authentic pronunciation of Davao Oriental heritage places, local
// cultural terms, and tricky academic English vocabulary across Neural TTS
// (SSML <phoneme> & spoken respelling) and Web Speech API fallbacks.
// ============================================================================

export interface PronunciationEntry {
  term: string;
  /** Case-insensitive regex pattern strings to match in spokenText */
  matchPatterns: string[];
  /** Human-readable syllable guide shown in Vocabulary Bank & QA Studio */
  syllables: string;
  /** Phonetic respelling used by Neural TTS & browser speechSynthesis */
  spokenRespelling: string;
  /** IPA transcription for SSML-capable engines (Azure / Google Cloud Neural2) */
  ipa: string;
  /** Category for filtering in the Voice QA tool */
  category: 'davao_place' | 'cultural_term' | 'academic_vocab';
  /** Brief cultural or linguistic note */
  note: string;
}

export const PRONUNCIATION_DICTIONARY: PronunciationEntry[] = [
  // --------------------------------------------------------------------------
  // 1. Davao Oriental Municipalities, Landmarks & Islands
  // --------------------------------------------------------------------------
  {
    term: 'Hamiguitan',
    matchPatterns: ['Hamiguitan', 'Mt\\. Hamiguitan', 'Mount Hamiguitan'],
    syllables: 'Ha-mi-gui-tan',
    spokenRespelling: 'Hah-mee-gee-tahn',
    ipa: 'hɑːmiˈɡiːtɑːn',
    category: 'davao_place',
    note: 'UNESCO World Heritage mountain range in San Isidro, Davao Oriental (hard "g" as in "get", not "gw").',
  },
  {
    term: 'Aliwagwag',
    matchPatterns: ['Aliwagwag'],
    syllables: 'A-li-wag-wag',
    spokenRespelling: 'Ah-lee-wahg-wahg',
    ipa: 'ɑːliˈwɑːɡwɑːɡ',
    category: 'davao_place',
    note: 'Iconic multi-tiered waterfalls in Cateel, Davao Oriental.',
  },
  {
    term: 'Dahican',
    matchPatterns: ['Dahican'],
    syllables: 'Da-hi-can',
    spokenRespelling: 'Dah-hee-kahn',
    ipa: 'dɑːˈhiːkɑːn',
    category: 'davao_place',
    note: 'Famous crescent-shaped surf and pawikan sanctuary beach in Mati City.',
  },
  {
    term: 'Pujada',
    matchPatterns: ['Pujada'],
    syllables: 'Pu-ja-da',
    spokenRespelling: 'Poo-hah-dah',
    ipa: 'puːˈhɑːdɑː',
    category: 'davao_place',
    note: 'Protected bay and island in Mati City; Spanish-derived "j" is pronounced as "h".',
  },
  {
    term: 'Mati',
    matchPatterns: ['\\bMati\\b'],
    syllables: 'Ma-ti',
    spokenRespelling: 'Mah-tee',
    ipa: 'ˈmɑːti',
    category: 'davao_place',
    note: 'Capital city of Davao Oriental.',
  },
  {
    term: 'Baganga',
    matchPatterns: ['Baganga'],
    syllables: 'Ba-gan-ga',
    spokenRespelling: 'Bah-gahng-gah',
    ipa: 'bɑːˈɡɑːŋɡɑː',
    category: 'davao_place',
    note: 'Coastal municipality home to San Victor Island and curtain waterfalls.',
  },
  {
    term: 'Cateel',
    matchPatterns: ['Cateel'],
    syllables: 'Ca-te-el',
    spokenRespelling: 'Kah-teh-el',
    ipa: 'kɑːtɛˈɛl',
    category: 'davao_place',
    note: 'Northern Davao Oriental town home to Aliwagwag Falls (three syllables: Ka-te-el).',
  },
  {
    term: 'Caraga',
    matchPatterns: ['Caraga'],
    syllables: 'Ca-ra-ga',
    spokenRespelling: 'Kah-rah-gah',
    ipa: 'kɑːˈrɑːɡɑː',
    category: 'davao_place',
    note: 'Historic eastern municipality of Davao Oriental known for Pusan Point sunrise.',
  },
  {
    term: 'Banaybanay',
    matchPatterns: ['Banaybanay'],
    syllables: 'Ba-nay-ba-nay',
    spokenRespelling: 'Bah-naie-bah-naie',
    ipa: 'bɑːˌnaɪbɑːˈnaɪ',
    category: 'davao_place',
    note: 'Rice granary municipality of Davao Oriental along the Davao Gulf.',
  },
  {
    term: 'Tarragona',
    matchPatterns: ['Tarragona'],
    syllables: 'Tar-ra-go-na',
    spokenRespelling: 'Tah-rah-goh-nah',
    ipa: 'tɑːrɑːˈɡoʊnɑː',
    category: 'davao_place',
    note: 'Highland and coastal municipality south of Manay.',
  },
  {
    term: 'Waniban',
    matchPatterns: ['Waniban'],
    syllables: 'Wa-ni-ban',
    spokenRespelling: 'Wah-nee-bahn',
    ipa: 'wɑːˈniːbɑːn',
    category: 'davao_place',
    note: 'White-sand island in Pujada Bay, Mati City.',
  },
  {
    term: 'Subangan',
    matchPatterns: ['Subangan'],
    syllables: 'Su-ba-ngan',
    spokenRespelling: 'Soo-bahng-ahn',
    ipa: 'suːˈbɑːŋɑːn',
    category: 'davao_place',
    note: 'Davao Oriental Provincial Museum ("Subangan" means East / where the sun rises).',
  },

  // --------------------------------------------------------------------------
  // 2. Indigenous & Cultural Terms (Mandaya / Bisaya / Filipino)
  // --------------------------------------------------------------------------
  {
    term: 'Mandaya',
    matchPatterns: ['Mandaya'],
    syllables: 'Man-da-ya',
    spokenRespelling: 'Mahn-dah-yah',
    ipa: 'mɑːnˈdɑːjɑː',
    category: 'cultural_term',
    note: 'Indigenous people of Davao Oriental ("First People Upstream").',
  },
  {
    term: 'Dagmay',
    matchPatterns: ['Dagmay'],
    syllables: 'Dag-may',
    spokenRespelling: 'Dahg-my',
    ipa: 'dɑːɡˈmaɪ',
    category: 'cultural_term',
    note: 'Traditional sacred handwoven abaca cloth of the Mandaya people.',
  },
  {
    term: 'Pawikan',
    matchPatterns: ['\\bpawikan\\b', '\\bPawikan\\b'],
    syllables: 'Pa-wi-kan',
    spokenRespelling: 'Pah-wee-kahn',
    ipa: 'pɑːˈwiːkɑːn',
    category: 'cultural_term',
    note: 'Endangered sea turtle protected along Dahican Beach and Pujada Bay.',
  },
  {
    term: 'Kadayawan',
    matchPatterns: ['Kadayawan'],
    syllables: 'Ka-da-ya-wan',
    spokenRespelling: 'Kah-dah-yah-wahn',
    ipa: 'kɑːdɑːˈjɑːwɑːn',
    category: 'cultural_term',
    note: 'Thanksgiving celebration of life, nature, and harvest in the Davao Region.',
  },
  {
    term: 'Sambuokan',
    matchPatterns: ['Sambuokan'],
    syllables: 'Sam-bu-o-kan',
    spokenRespelling: 'Sahm-boo-oh-kahn',
    ipa: 'sɑːmbuːˈoʊkɑːn',
    category: 'cultural_term',
    note: 'Annual unity festival in Mati City celebrating Mandaya and coastal heritage.',
  },

  // --------------------------------------------------------------------------
  // 3. Key Academic & Literary English Terms (Grade 7–10 DepEd MELC)
  // --------------------------------------------------------------------------
  {
    term: 'Analogy',
    matchPatterns: ['\\banalogy\\b', '\\bAnalogy\\b'],
    syllables: 'a-nal-o-gy',
    spokenRespelling: 'uh-nal-uh-jee',
    ipa: 'əˈnælədʒi',
    category: 'academic_vocab',
    note: 'Core Grade 7 Quarter 1 concept: comparing two pairs of words with matching relationships.',
  },
  {
    term: 'Antonym',
    matchPatterns: ['\\bantonym\\b', '\\bAntonym\\b'],
    syllables: 'an-to-nym',
    spokenRespelling: 'an-tuh-nim',
    ipa: 'ˈæntənɪm',
    category: 'academic_vocab',
    note: 'Word with the opposite meaning.',
  },
  {
    term: 'Synonym',
    matchPatterns: ['\\bsynonym\\b', '\\bSynonym\\b'],
    syllables: 'syn-o-nym',
    spokenRespelling: 'sin-uh-nim',
    ipa: 'ˈsɪnənɪm',
    category: 'academic_vocab',
    note: 'Word with the same or nearly identical meaning.',
  },
  {
    term: 'Tranquil',
    matchPatterns: ['\\btranquil\\b', '\\bTranquil\\b'],
    syllables: 'tran-quil',
    spokenRespelling: 'trang-kwil',
    ipa: 'ˈtræŋkwɪl',
    category: 'academic_vocab',
    note: 'Calm, serene, and peaceful.',
  },
  {
    term: 'Turbulent',
    matchPatterns: ['\\bturbulent\\b', '\\bTurbulent\\b'],
    syllables: 'tur-bu-lent',
    spokenRespelling: 'ter-byuh-lent',
    ipa: 'ˈtɜːrbjələnt',
    category: 'academic_vocab',
    note: 'Rough, stormy, or unsteady.',
  },
  {
    term: 'Hyperbole',
    matchPatterns: ['\\bhyperbole\\b', '\\bHyperbole\\b'],
    syllables: 'hy-per-bo-le',
    spokenRespelling: 'hy-per-buh-lee',
    ipa: 'haɪˈpɜːrbəli',
    category: 'academic_vocab',
    note: 'Four syllables; ends in "-lee", not silent "e".',
  },
  {
    term: 'Onomatopoeia',
    matchPatterns: ['\\bonomatopoeia\\b', '\\bOnomatopoeia\\b'],
    syllables: 'on-o-mat-o-poe-ia',
    spokenRespelling: 'ah-nuh-mah-tuh-pee-uh',
    ipa: 'ˌɒnəmætəˈpiːə',
    category: 'academic_vocab',
    note: 'Words that imitate natural sounds (buzz, splash, roar).',
  },
  {
    term: 'Synecdoche',
    matchPatterns: ['\\bsynecdoche\\b', '\\bSynecdoche\\b'],
    syllables: 'syn-ec-do-che',
    spokenRespelling: 'si-nek-duh-kee',
    ipa: 'sɪˈnɛkdəki',
    category: 'academic_vocab',
    note: 'Figure of speech where a part represents the whole.',
  },
];

/**
 * Replaces Davao Oriental proper nouns and tricky terms with phonetic respellings
 * when sending plain text to TTS engines or browser speechSynthesis that lack custom IPA lexicons.
 */
export function applySpokenPronunciationOverrides(text: string): string {
  let result = text;
  // Special handling for "Mt. Hamiguitan" -> "Mount Hah-mee-gee-tahn"
  result = result.replace(/\bMt\.\s*Hamiguitan\b/gi, 'Mount Hah-mee-gee-tahn');
  result = result.replace(/\bMount\s+Hamiguitan\b/gi, 'Mount Hah-mee-gee-tahn');

  for (const entry of PRONUNCIATION_DICTIONARY) {
    if (entry.category === 'davao_place' || entry.category === 'cultural_term' || entry.term === 'Hyperbole' || entry.term === 'Synecdoche' || entry.term === 'Onomatopoeia') {
      const regex = new RegExp(`\\b${entry.term}\\b`, 'gi');
      result = result.replace(regex, entry.spokenRespelling);
    }
  }
  return result;
}

/**
 * Looks up a pronunciation entry by term (case-insensitive)
 */
export function findPronunciationEntry(term: string): PronunciationEntry | undefined {
  const clean = term.trim().toLowerCase();
  return PRONUNCIATION_DICTIONARY.find(
    (e) => e.term.toLowerCase() === clean || clean.includes(e.term.toLowerCase())
  );
}
