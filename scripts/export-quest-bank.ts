import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import targets from '../src/data/curriculum/quizLearningTargets.json' with { type: 'json' };
import { compileModuleQuestions, type ModuleTargets } from '../src/data/curriculum/tieredQuestions';

const output = resolve(process.argv[2] || '/private/tmp/lingoquest-quest-seed');
mkdirSync(output, { recursive: true });
const quote = (value: string) => `'${value.replaceAll("'", "''")}'`;
let total = 0;
for (const module of targets as ModuleTargets[]) {
  const questions = compileModuleQuestions(module);
  const rows = questions.map((question) => {
    if (!question.source?.quote.includes(question.source.answerQuote)) {
      throw new Error(`${question.id}: answer is not in the cited PDF excerpt`);
    }
    return `(${quote(question.id)},${quote(module.moduleId)},${quote(question.type)},${quote(question.difficulty)},${quote(module.fileId)},${quote(module.pdfSha256)},${question.source.page},${quote(JSON.stringify(question))}::jsonb)`;
  });
  writeFileSync(resolve(output, `${module.moduleId}.sql`),
    `insert into public.quest_question_bank(id,module_id,game_mode,difficulty,pdf_file_id,pdf_sha256,pdf_page,payload) values\n${rows.join(',\n')}\non conflict (id) do update set payload=excluded.payload;\n`);
  total += questions.length;
}
console.log(`Prepared ${total} source-linked questions for ${targets.length} modules.`);
