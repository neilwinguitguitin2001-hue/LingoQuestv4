# LingoQuest — Interactive Visual Layer & Motion Architecture Guide

## 1. Codebase Audit & Module Inventory
LingoQuest is a React 19 + TypeScript + Tailwind CSS v4 + Motion (`motion/react`) gamified English learning application aligned with DepEd Region XI (Schools Division of Davao Oriental) Most Essential Learning Competencies (MELCs).

### Existing Curriculum Structure (64 Modules across Grades 7–10)
Each grade level spans 4 Quarters mapped to 4 Davao Oriental Heritage Islands:
1. **Quarter 1:** Pujada Bay & San Victor Island (Foundational Grammar & Vocabulary)
2. **Quarter 2:** Mount Hamiguitan Sanctuary (Comprehension & Structural Analysis)
3. **Quarter 3:** Dahican Beach & Pacific Coast (Critical Reading & Media Literacy)
4. **Quarter 4:** Aliwagwag Falls Eco-Park (Academic Composition & Synthesis)

| Grade Level | Modules | Key Topics Covered |
| :--- | :--- | :--- |
| **Grade 7** | 16 Modules (`g7-q1-m1` to `g7-q4-m16`) | **Analogy (Reference Module `g7-q1-m1`)**, Documentary Genres, Active & Passive Voice, Past & Past Perfect Tenses, Direct & Reported Speech, Phrases/Clauses/Sentences, Reading Strategies, Linear & Non-Linear Texts, Multimedia, Oral Narratives, Academic Writing, Fact vs. Opinion, Panel Discussions |
| **Grade 8** | 16 Modules (`g8-q1-m1` to `g8-q4-m16`) | Context Clues, Conventions in Citing Sources, Modal Verbs/Nouns/Adverbs, Transition Signals, Expressing Emotional Reactions, Visual-Verbal Relationships, Opinion-Marking Signals, Multimodal Texts, Author Bias, Propaganda Techniques, Cohesive Devices, Parallel Structures |
| **Grade 9** | 16 Modules (`g9-q1-m1` to `g9-q4-m16`) | Conditionals (Zero, First, Second, Third), Communicative Styles, Making Connections (Text-to-Self/World), Social Issues in Literature, VUCA World, Bias & Prejudice, Relevance & Truthfulness of Ideas, Judging Validity of Evidence |
| **Grade 10** | 16 Modules (`g10-q1-m1` to `g10-q4-m16`) | Information from News/Speeches, Textual Aids, Plot/Setting/Characterization, Sources of Information, Analytical Listening, Evaluating Spoken Texts, Argumentative Essays, Opinion/Assertion, Claims of Fact/Policy/Value, Multimodal Campaigns, Literary Criticism, Research Terminology |

---

## 2. Tab-by-Tab Visual Plan Table

Every single module (all 64+ modules) automatically receives a full 7-tab interactive visual layer driven by `src/data/moduleVisualConfigs.ts` and rendered via `src/components/visuals/LessonVisuals.tsx`:

| Lesson Tab | Visual Component(s) | Interaction Pattern | XP Reward (Once per Module) |
| :--- | :--- | :--- | :--- |
| **1. Concepts & Rules** | `<ModuleExplainer />`<br>`<RuleVisualIllustration />`<br>`<InteractiveDiagram />`<br>`<DragDropMatch />` | • **60-Second Animated Explainer:** Multi-slide SVG + Motion storyboard with captions, optional Web Speech narration (`en-PH`), Play/Pause/Prev/Next/Skip/Replay, and Data Saver poster mode.<br>• **Rule Cards:** Sequential motion entry with visual `A → B` relationship badges and Filipino/Bisaya quick hints.<br>• **Interactive Concept Bridge:** Tap missing node to complete `A : B :: C : D` relationship.<br>• **Mini Sorting Game:** Classify word pairs into relationship buckets. | **+10 XP** (`explainer`)<br>**+15 XP** (`diagram`)<br>**+20 XP** (`minigame`) |
| **2. Guided Analysis** | `<AnimatedStepper />`<br>`<MascotReaction />` | • **Word-Highlighting Sentence Walkthrough:** Step-by-step playback (`Play`/`Pause`/`Back`/`Next`) that highlights signal tokens directly inside the model sentence and displays Kuya Banog's mascot tip. | **+10 XP** (`stepper`) |
| **3. Pitfalls & Tips** | `<PitfallComparisonCards />` | • **Before/After Comparison Cards:** Animated shake on the Red "Common Mistake" card and emerald glow on the "Verified Fix" card.<br>• **Spot-the-Mistake Mini-Quiz:** Embedded 2-option verification per pitfall. | **+10 XP** (`pitfalls`) |
| **4. Davao Oriental Context** | `<HotspotScene />` | • **Illustrated Local Heritage SVG Scene:** Custom vector artwork of Mount Hamiguitan, Pujada Bay, Dahican Beach, or Aliwagwag Falls with pulsing numbered hotspot pins that reveal local example sentences. | **+15 XP** (`hotspots`) |
| **5. Vocabulary Bank** | `<FlipCard />` | • **3D Flip Cards & Web Speech Audio:** Tap to flip between definition (with Filipino/Bisaya hint) and Davao Oriental context sentence; tap **Speak** to trigger Web Speech API with animated sound-wave bars. | **+10 XP** (`vocabFlip`) |
| **6. Self-Check** | `<SelfCheckVisualChallenge />` | • **Lightning Self-Check Challenge:** 3-question rapid readiness check with SVG countdown timer ring, streak counter, mascot reactions, and animated score reveal above the mastery rubric. | **+15 XP** (`selfCheck`) |
| **7. Study Cheatsheet** | `<AnimatedCheatsheetInfographic />` | • **Step-by-Step Visual Infographic:** Unfolds section-by-section with a **Print / Save PDF** action alongside the copyable text summary. | **+10 XP** (`cheatsheet`) |

---

## 3. How to Add or Customize Module Visuals & Tune XP Values

### A. Tuning XP Values
Open `src/data/moduleVisualConfigs.ts` and edit `VISUAL_XP_REWARDS`:
```ts
export const VISUAL_XP_REWARDS = {
  explainer: 10,
  diagram: 15,
  minigame: 20,
  stepper: 10,
  pitfalls: 10,
  hotspots: 15,
  vocabFlip: 10,
  selfCheck: 15,
  cheatsheet: 10,
} as const;
```
XP is awarded **only once per activity per module** and persisted in `StudentAccount.progressByModule[moduleId].visualInteractionsCompleted` (synced to both `localStorage` and Firebase Firestore).

### B. Customizing a Specific Module's Visual Config
In `src/data/moduleVisualConfigs.ts`:
- `ANALOGY_REFERENCE_VISUAL_CONFIG` provides a hand-crafted reference configuration for Module 1 (`Analogy` / `g7-q1-m1`).
- `getModuleVisualConfig(module: Module)` inspects any module's `lesson`, `questions`, and `quarter` to synthesize a complete 7-tab `ModuleVisualConfig` automatically—including modules created dynamically by Administrators in the Admin Console.
- To add a bespoke override for any module ID, check `module.id` inside `getModuleVisualConfig(module)` and return your custom `ModuleVisualConfig` object.

### C. Badges Unlocked by Visual Interactions
Defined in `src/data/seedData.ts` (`BADGE_DEFINITIONS`) and evaluated in `src/App.tsx` (`handleAwardVisualXP`):
- **`visual_learner` ("Visual Learner" · +75 Bonus XP):** Unlocked after completing 3 interactive visual activities across any modules.
- **`explainer_explorer` ("Explainer Explorer" · +100 Bonus XP):** Unlocked after finishing 3 animated 60-second lesson explainers.

---

## 4. Accessibility, Mobile & Low-Bandwidth Support
- **Data Saver Mode (`⚡ Data Saver: ON/OFF`):** Available in the top header of every lesson. Persisted in `localStorage` (`lingoquest_data_saver`). When enabled, explainers display a lightweight static poster until the student explicitly taps **Load & Play Visual**.
- **Reduced Motion:** Respects `prefers-reduced-motion: reduce` via `useReducedMotion()` from `motion/react`.
- **Keyboard & Screen Reader Support:** All interactive cards, hotspots, and stepper controls are native `<button>` elements with `aria-label` attributes and visible focus rings.
- **Fault Isolation:** Every visual widget is wrapped in `<VisualErrorBoundary>` so lesson text and quizzes remain 100% accessible even if an animation fails to render.
