import type { Module } from '../../types/lingoquest.ts';
import { createComprehensiveModule } from './curriculumBuilder.ts';
import { G10_Q1_SPECS, G10_Q2_SPECS } from './grade10Part1.ts';
import { G10_Q3_SPECS, G10_Q4_SPECS } from './grade10Part2.ts';

export const ALL_GRADE_10_MODULES: Module[] = [
  // Quarter 1: Pujada Island (8 Modules)
  ...G10_Q1_SPECS.map(createComprehensiveModule),
  // Quarter 2: Dahican Island (8 Modules)
  ...G10_Q2_SPECS.map(createComprehensiveModule),
  // Quarter 3: Hamiguitan Island (5 Modules)
  ...G10_Q3_SPECS.map(createComprehensiveModule),
  // Quarter 4: Aliwagwag Island (3 Modules)
  ...G10_Q4_SPECS.map(createComprehensiveModule),
];
