export const STORAGE_KEY = 'margin-dsa-v1';
export const stageStates = ['new','learning','practiced','confident'];
export const problemStates = ['new','practiced','independent','revisit'];
export function initialState() {
 return {version:1,stages:{},problems:{},notes:{},problemNotes:{},theme:'light',lastTopic:'arrays',updatedAt:null};
}
export function validateState(input, topics, problems) {
 if (!input || input.version !== 1 || !input.stages || !input.problems || !input.notes) throw new Error('Choose a Margin backup file.');
 const keys = new Set(topics.flatMap(t=>t.steps.map((_,i)=>`${t.id}:${i}`)));
 const slugs = new Set(problems.map(p=>p.slug));
 const result = {version:1,stages:{},problems:{},notes:{},problemNotes:{},theme:input.theme === 'dark'?'dark':'light',lastTopic:topics.some(t=>t.id===input.lastTopic)?input.lastTopic:'arrays',updatedAt:typeof input.updatedAt === 'string'?input.updatedAt:null};
 for (const [k,v] of Object.entries(input.stages)) if(keys.has(k) && stageStates.includes(v)) result.stages[k]=v;
 for (const [k,v] of Object.entries(input.problems)) if(slugs.has(k) && problemStates.includes(v)) result.problems[k]=v;
 for (const [k,v] of Object.entries(input.notes)) if(keys.has(k) && typeof v === 'string') result.notes[k]=v.slice(0,30000);
 if (input.problemNotes && typeof input.problemNotes === 'object' && !Array.isArray(input.problemNotes)) {
  for (const [k,v] of Object.entries(input.problemNotes)) if(slugs.has(k) && typeof v === 'string') result.problemNotes[k]=v.slice(0,3000);
 }
 return result;
}
export function topicProgress(topic,state) {
 const done = topic.steps.filter((_,i)=>state.stages[`${topic.id}:${i}`]==='confident').length;
 return {done,total:topic.steps.length,percent:Math.round(done/topic.steps.length*100)};
}
export function nextStage(topic,state) {
 const i = topic.steps.findIndex((_,i)=>state.stages[`${topic.id}:${i}`]!=='confident'); return i < 0 ? topic.steps.length-1 : i;
}

export function nextQuestion(topics, problems, state) {
 const bySlug = new Map(problems.map(problem => [problem.slug, problem]));
 const seen = new Set();
 const path = [];
 for (const topic of topics) for (const [stepIndex,step] of topic.steps.entries()) {
  for (const slug of step.examples) {
   if (seen.has(slug) || !bySlug.has(slug)) continue;
   seen.add(slug);
   path.push({problem:bySlug.get(slug),topic,stepIndex});
  }
 }
 for (const problem of problems) if (!seen.has(problem.slug)) path.push({problem,topic:topics.find(topic => topic.name===problem.topic)||topics[0],stepIndex:0});
 const status = item => state.problems[item.problem.slug] || 'new';
 let furthest = -1;
 path.forEach((item,index) => { if (status(item) !== 'new') furthest = index; });
 const next = path.slice(furthest+1).find(item => status(item)==='new') || path.find(item => status(item)==='new');
 if (next) return {...next,kind:'new'};
 const revisit = path.find(item => status(item)==='revisit');
 return revisit ? {...revisit,kind:'revisit'} : null;
}
