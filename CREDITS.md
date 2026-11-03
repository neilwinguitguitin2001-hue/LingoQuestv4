# LingoQuest — Asset & Library Credits

## 1. Original Vector Illustrations & Mascot Artwork
All illustrations and interactive diagrams in `src/components/visuals/LessonVisuals.tsx` are **100% original inline SVG artwork** created specifically for DepEd Schools Division of Davao Oriental learners:
- **Kuya Banog (Island Eagle Guide Mascot):** Original SVG character inspired by the Philippine Eagle (*Pithecophaga jefferyi*) sanctuary at Mount Hamiguitan Range Wildlife Sanctuary, San Isidro, Davao Oriental.
- **Davao Oriental Heritage Landscapes (`<HotspotScene />`):**
  - *Pujada Bay & San Victor Island (Mati City)* — Original SVG seascape with lighthouse, island silhouette, and outrigger boat.
  - *Mount Hamiguitan UNESCO Sanctuary (San Isidro)* — Original SVG mountain ridge and pygmy bonsai forest canopy.
  - *Dahican Beach & Pacific Coast (Mati City)* — Original SVG coastal waves and *pawikan* (sea turtle) shoreline.
  - *Aliwagwag Falls Eco-Park (Cateel)* — Original SVG multi-tiered rock rapids and rainforest canopy.

## 2. Open-Source Libraries & Browser APIs Used
- **Motion (`motion/react` v12):** MIT License — Used for declarative spring transitions, layout animations, and `useReducedMotion()` accessibility support.
- **Lucide React (`lucide-react`):** ISC License — Clean vector icons for playback controls, badges, and pedagogical indicators.
- **Web Speech API (`window.speechSynthesis`):** Native W3C Browser API — Used for offline-capable English (`en-PH` / `en-US`) pronunciation in the 60-Second Explainer and Vocabulary Flip Cards.
- **Web Audio API (`src/utils/soundEffects.ts`):** Native W3C Browser API — Synthesizes zero-latency chimes for clicks, correct/incorrect answers, and XP rewards without external MP3 downloads.
