import targets from './quizLearningTargets.json';
import {compileModuleQuestions,type ModuleTargets} from './tieredQuestions';
export const QUIZ_CATALOGUE=Object.fromEntries((targets as ModuleTargets[]).map(m=>[m.moduleId,{fileId:m.fileId,sha256:m.pdfSha256,questions:compileModuleQuestions(m)}]));
