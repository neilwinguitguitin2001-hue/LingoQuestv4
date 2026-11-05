import fs from 'node:fs';
import {compileModuleQuestions,type ModuleTargets} from '../src/data/curriculum/tieredQuestions';
const targets=JSON.parse(fs.readFileSync('src/data/curriculum/quizLearningTargets.json','utf8')) as ModuleTargets[];
for(const module of targets){const path=`public/assets/curriculum/content/${module.moduleId}.json`;const data=JSON.parse(fs.readFileSync(path,'utf8'));data.games=compileModuleQuestions(module);fs.writeFileSync(path,JSON.stringify(data)+'\n');}
console.log(`Compiled ${targets.length*75} questions for ${targets.length} modules`);
