import samples from './lessonPilot.json';

export type LessonPilotId = keyof typeof samples;
export type LessonPilot = (typeof samples)[LessonPilotId];

export const lessonPilotHeadings = [
  'See it in action',
  'Learn the rule',
  'Walk through an example',
  'Notice a common mistake',
  'Remember the key idea',
] as const;

export function getLessonPilot(moduleId: string): LessonPilot | undefined {
  return Object.hasOwn(samples, moduleId) ? samples[moduleId as LessonPilotId] : undefined;
}
