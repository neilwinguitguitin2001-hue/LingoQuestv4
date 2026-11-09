import type { AdminAccount, AuditLogEntry, BadgeDefinition, Module, StudentAccount, TeacherAccount } from '../types/lingoquest.ts';
import { PDF_MODULES } from './curriculum/pdfCurriculum';

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    id: 'first_lesson',
    name: 'Scroll Seeker',
    description: 'Completed your first interactive English lesson module.',
    category: 'lesson',
    iconType: 'scroll',
    pointsBonus: 50,
  },
  {
    id: 'first_quiz_pass',
    name: 'Quiz Voyager',
    description: 'Passed your first gamified module quiz with 75% or higher.',
    category: 'quiz',
    iconType: 'compass',
    pointsBonus: 100,
  },
  {
    id: 'bridge_builder_1',
    name: 'Bridge Restorer',
    description: 'Restored your first broken island bridge to unlock the next module.',
    category: 'bridge',
    iconType: 'bridge',
    pointsBonus: 120,
  },
  {
    id: 'quarter_champion',
    name: 'Pujada Bay Guardian',
    description: 'Restored all 4 module bridges across an entire Quarter Island.',
    category: 'bridge',
    iconType: 'crown',
    pointsBonus: 300,
  },
  {
    id: 'hard_mode_ace',
    name: 'Storm Conqueror',
    description: 'Passed a module quiz on Hard difficulty (20s per question).',
    category: 'quiz',
    iconType: 'lightning',
    pointsBonus: 200,
  },
  {
    id: 'perfect_score',
    name: 'Flawless Scholar',
    description: 'Achieved a perfect 100% score on any module quiz.',
    category: 'quiz',
    iconType: 'star',
    pointsBonus: 150,
  },
  {
    id: 'points_1000',
    name: 'Rising Star of Mati',
    description: 'Accumulated 1,000+ total points in LingoQuest.',
    category: 'milestone',
    iconType: 'trophy',
    pointsBonus: 100,
  },
  {
    id: 'points_2500',
    name: 'Davao Oriental Laureate',
    description: 'Accumulated 2,500+ total points across islands and quests.',
    category: 'milestone',
    iconType: 'shield',
    pointsBonus: 250,
  },
  {
    id: 'ai_writer',
    name: 'Scribe of Hamiguitan',
    description: 'Completed a written-response activity with AI Grammar & Writing Feedback.',
    category: 'writing',
    iconType: 'feather',
    pointsBonus: 100,
  },
  {
    id: 'poly_grade_explorer',
    name: 'Archipelago Explorer',
    description: 'Used Personalization mode to practice a module from another grade level.',
    category: 'milestone',
    iconType: 'globe',
    pointsBonus: 125,
  },
  {
    id: 'visual_learner',
    name: 'Visual Learner',
    description: 'Completed interactive visual diagrams, flip cards, or mini-games inside a module lesson.',
    category: 'lesson',
    iconType: 'star',
    pointsBonus: 75,
  },
  {
    id: 'explainer_explorer',
    name: 'Explainer Explorer',
    description: 'Watched a 60-second animated lesson explainer and explored Davao Oriental cultural hotspots.',
    category: 'lesson',
    iconType: 'compass',
    pointsBonus: 100,
  },
];

export const ALL_MODULES: Module[] = PDF_MODULES;

export const INITIAL_TEACHERS: TeacherAccount[] = [];

export const INITIAL_STUDENTS: StudentAccount[] = [];

export const INITIAL_ADMINS: AdminAccount[] = [];

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [];


