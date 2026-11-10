import discussions from './lessonDiscussions.json';

type DiscussionId = keyof typeof discussions;
export type LessonDiscussion = (typeof discussions)[DiscussionId];

export const discussionHeadings = [
  'See it in action',
  'Learn the rule',
  'Walk through an example',
  'Notice a common mistake',
  'Remember the key idea',
] as const;

export function getLessonDiscussion(moduleId: string): LessonDiscussion | undefined {
  return Object.hasOwn(discussions, moduleId) ? discussions[moduleId as DiscussionId] : undefined;
}
