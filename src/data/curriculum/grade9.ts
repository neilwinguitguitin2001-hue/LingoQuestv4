import type { Module } from '../../types/lingoquest.ts';
import { createComprehensiveModule } from './curriculumBuilder.ts';
import { G9_Q1_SPECS, G9_Q2_SPECS } from './grade9Part1.ts';
import { G9_Q3_SPECS, G9_Q4_SPECS } from './grade9Part2.ts';

export const ALL_GRADE_9_MODULES: Module[] = [
  // Quarter 1: Pujada Island (8 Modules)
  ...G9_Q1_SPECS.map(createComprehensiveModule),
  // Quarter 2: Dahican Island (2 Modules)
  ...G9_Q2_SPECS.map(createComprehensiveModule),
  // Quarter 3: Hamiguitan Island (7 Modules)
  ...G9_Q3_SPECS.map(createComprehensiveModule),
  // Quarter 4: Aliwagwag Island (13 Modules)
  ...G9_Q4_SPECS.map(createComprehensiveModule),
];
