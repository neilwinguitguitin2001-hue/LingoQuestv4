# LingoQuest Instructional Voice Style Guide & Architecture

## 1. Narrator Persona: "Ate Rosa" & "Kuya James" (Ate/Kuya Lingo)

LingoQuest uses a warm, encouraging Filipino tutor persona designed for Grade 7–10 public school learners in the **DepEd Schools Division of Davao Oriental**.

| Persona | Role | Primary Neural Voice | Gemini 3.8 Voice | Speaking Style |
| :--- | :--- | :--- | :--- | :--- |
| **Ate Rosa (Candidate A — Default)** | Primary Lesson Tutor ("Ate Lingo") | `en-PH-RosaNeural` (Azure AI Speech) | `Kore` (`gemini-3.8-flash-lite-tts`) | Warm, friendly, patient older sister; ~92–96% rate on definitions; crisp pauses before answers |
| **Ate Lingo Storyteller (Candidate B)** | Upbeat Quest & Cultural Guide | `en-PH-RosaNeural` (`cheerful` style) | `Zephyr` (`gemini-3.8-flash-lite-tts`) | Energetic, story-driven guide for Davao Oriental hotspots and rapid self-checks |
| **Kuya James (Candidate C / Voice #2)** | Co-Tutor & Contrast Voice ("Kuya Lingo") | `en-PH-JamesNeural` (Azure AI Speech) | `Puck` (`gemini-3.8-flash-lite-tts`) | Calm, steady older brother; reads Pitfall vs. Correction contrasts and step-by-step recaps |

---

## 2. Spoken-Style Scriptwriting Rules (`displayText` vs. `spokenText`)

Every narration segment in `src/data/spokenScripts.ts` separates **`displayText`** (clean on-screen text) from **`spokenText`** (written specifically for the ear):

1. **Short Sentences (8–16 words):** One clear idea per sentence. Never read dense textbook paragraphs aloud verbatim.
2. **Conversational Contractions:** Use `"let's"`, `"you'll"`, `"it's"`, `"don't"`, `"that's"`, `"here's"`.
3. **Direct Tutor Address:** Start or transition with natural cues: *"Okay, let's look at this together,"* *"Notice the pattern?"*, *"Here's the trick:"*.
4. **Rhetorical Questions & Reveal Pauses:** Ask a question, insert `...` (which compiles to `<break time="800ms"/>`), and then reveal the answer:
   - *Example:* `"What do tranquil and calm mean? ... Both describe water that's peaceful and still!"*
5. **Spelled-Out Symbols & Abbreviations:**
   - `:` → `"is to"`
   - `::` → `"as"`
   - `A : B :: C : D` → `"A is to B, as C is to D"`
   - `EN7V-IV-c-23.1` → `"English Grade 7, Quarter 4 competency"`
6. **Optional Taglish / Bisaya Warmth Toggle:** Students can toggle light local touches (`"Maayong adlaw!"`, `"Sige, let's check!"`, `"Ayos!"`, `"Timan-i"`) on or off directly in `<VoicePlayer />`.

---

## 3. SSML & Prosody Planner (`src/utils/ssmlBuilder.ts`)

`buildSegmentSSML()` programmatically generates W3C/Azure SSML with:
- **Clause & Idea Pauses:**
  - `<break time="300ms"/>` after commas and semicolons
  - `<break time="550ms"/>` between sentences
  - `<break time="650ms"/>` after rhetorical questions (`?`)
  - `<break time="800ms"/>` on `...` before key reveals
- **Semantic Emphasis:** Wraps segment `keyTerms` (`antonym`, `synonym`, `cause and effect`, `Mount Hamiguitan`, etc.) in `<emphasis level="moderate">`.
- **Role-Based Rate & Pitch:**
  - `definition` / `vocab_card`: `rate="90%-92%"` for crystal-clear comprehension
  - `example` / `cultural_story`: `rate="95%-98%"` for natural storytelling flow
  - `praise`: `rate="102%" pitch="+4%"` for upbeat encouragement
- **Davao Oriental Pronunciation Dictionary (`src/data/pronunciationDictionary.ts`):**
  - Injects IPA `<phoneme alphabet="ipa">` tags for SSML engines and phonetic respellings for Gemini TTS / Web Speech fallback:
    - `Hamiguitan` → `"Hah-mee-gee-tahn"` (`hɑːmiˈɡiːtɑːn`)
    - `Aliwagwag` → `"Ah-lee-wahg-wahg"` (`ɑːliˈwɑːɡwɑːɡ`)
    - `Dahican` → `"Dah-hee-kahn"` (`dɑːˈhiːkɑːn`)
    - `Pujada` → `"Poo-hah-dah"` (`puːˈhɑːdɑː`)
    - `Mati` → `"Mah-tee"` (`ˈmɑːti`)
    - `Baganga` → `"Bah-gahng-gah"` (`bɑːˈɡɑːŋɡɑː`)
    - `Cateel` → `"Kah-teh-el"` (`kɑːtɛˈɛl`)
    - `Mandaya` → `"Mahn-dah-yah"` (`mɑːnˈdɑːjɑː`)
    - `Dagmay` → `"Dahg-my"` (`dɑːɡˈmaɪ`)

---

## 4. Pre-Generation CLI & Content-Hash Caching

Audio segments and word-timestamp JSON files are cached by deterministic SHA-256 hash (`personaId + prosodyRole + spokenText`) in `/public/audio/cache/`.

### Commands
```bash
# Pre-generate the Reference Analogy Module (all 7 tabs) + 3-Voice A/B/C comparison samples
npm run generate-voice

# Pre-generate a specific module by ID
npx tsx scripts/generate-voice.ts --module=g7-q1-m2

# Pre-generate all modules across Grades 7–10
npx tsx scripts/generate-voice.ts --all
```

### Environment Variables (Server-Side Only in `.env`)
- `GEMINI_API_KEY`: Uses `gemini-3.8-flash-lite-tts` neural audio generation (active out of the box in AI Studio).
- `AZURE_SPEECH_KEY` & `AZURE_SPEECH_REGION`: Optional; when provided, uses `en-PH-RosaNeural` and `en-PH-JamesNeural` with full SSML.
