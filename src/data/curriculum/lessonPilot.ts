import samples from './lessonPilot.json';

export type LessonPilotId = keyof typeof samples;
export type LessonPilot = (typeof samples)[LessonPilotId];

export function getLessonPilot(moduleId: string): LessonPilot | undefined {
  return Object.hasOwn(samples, moduleId) ? samples[moduleId as LessonPilotId] : undefined;
}
