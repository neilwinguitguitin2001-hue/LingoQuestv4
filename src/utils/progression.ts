import { Module, StudentAccount } from '../types/lingoquest';

/**
 * Checks whether a student has finished both the interactive lesson and the quizzes for a module.
 */
export function isModuleFullyCompleted(mod: Module, student: StudentAccount): boolean {
  if (student.completedModules?.includes(mod.id)) {
    return true;
  }
  const prog = student.progressByModule?.[mod.id];
  if (!prog) return false;

  const lessonDone = Boolean(prog.lessonCompleted);
  const quizDone = Boolean(
    prog.isBridgeRestored ||
    (typeof prog.bestScorePercent === 'number' && prog.bestScorePercent >= 75)
  );

  return lessonDone && quizDone;
}

/**
 * Determines if a specific module is unlocked for the student.
 * Rule:
 * 1. Strictly restricted to the student's enrolled grade level.
 * 2. The student starts ONLY on module 1 of quarter 1 (moduleNumber === 1).
 * 3. Every subsequent module is locked until the student has finished the whole lesson AND quizzes of the preceding module.
 */
export function isStudentModuleUnlocked(
  mod: Module,
  student: StudentAccount,
  allModules: Module[]
): boolean {
  // Faculty preview bypass
  if (
    student.id === 'preview-student' ||
    (student.role as string) === 'teacher' ||
    (student.role as string) === 'admin'
  ) {
    return true;
  }

  // Strictly provide only what year level a student is assigned or enrolled to
  if (mod.gradeLevel !== student.gradeLevel) {
    return false;
  }

  // Sort all modules of this student's grade level sequentially
  const gradeModules = allModules
    .filter((m) => m.gradeLevel === student.gradeLevel)
    .sort((a, b) => a.moduleNumber - b.moduleNumber);

  // Student MUST start on the very first module of Quarter 1
  if (mod.moduleNumber === 1 || (mod.quarter === 1 && mod.quarterModuleIndex === 1)) {
    return true;
  }

  // Find the preceding module
  const prevModule = gradeModules.find((m) => m.moduleNumber === mod.moduleNumber - 1);
  if (!prevModule) {
    return true;
  }

  // Unlocks if and only if the student finished the whole module lesson and quizzes
  return isModuleFullyCompleted(prevModule, student);
}
