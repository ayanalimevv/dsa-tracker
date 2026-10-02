export const STORAGE_KEY = 'margin-dsa-v1';
export const stageStates = ['new','learning','practiced','confident'];
export const problemStates = ['new','practiced','independent','revisit'];
export function initialState() {
 return {version:1,stages:{},problems:{},notes:{},problemNotes:{},attempts:{},preferences:{minutes:30,level:'beginner',topic:'all',onboarded:false},theme:'light',lastTopic:'arrays',updatedAt:null};
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
 result.attempts = {};
 for (const [slug, entries] of Object.entries(input.attempts || {})) {
  if (!slugs.has(slug) || !Array.isArray(entries)) continue;
  result.attempts[slug] = entries.filter(entry => entry && ['independent','practiced','revisit'].includes(entry.result) && Number.isFinite(Date.parse(entry.at))).map(entry => ({result:entry.result,at:entry.at}));
 }
 const preferences = input.preferences || {};
 result.preferences = {minutes:[15,30,60].includes(preferences.minutes)?preferences.minutes:30,level:preferences.level==='experienced'?'experienced':'beginner',topic:preferences.topic==='all'||topics.some(t=>t.id===preferences.topic)?preferences.topic:'all',onboarded:preferences.onboarded===true};
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
 const due = path.filter(item => reviewDue(item.problem.slug,state)).sort((a,b)=>reviewDate(a.problem.slug,state)-reviewDate(b.problem.slug,state));
 if (due.length) return {...due[0],kind:'revisit',reason:'Due for a fresh attempt. Recall the approach before opening your note.'};
 const preferred = path.filter(item => state.preferences?.topic==='all' || !state.preferences?.topic || item.topic.id===state.preferences.topic);
 const next = preferred.find(item => !state.problems[item.problem.slug] || state.problems[item.problem.slug]==='new');
 return next ? {...next,kind:'new',reason:'The next unattempted question in your selected learning path.'} : null;
}

const DAY = 86400000;
export function reviewDate(slug,state) {
 const history = state.attempts?.[slug] || [];
 if (!history.length) return state.problems[slug] && state.problems[slug]!=='new'?0:Infinity;
 const last = history.at(-1);
 let streak = 0;
 let countedAt = Infinity;
 for (let i=history.length-1;i>=0 && history[i].result==='independent';i--) {
  const at = Date.parse(history[i].at);
  if (countedAt-at>=DAY) { streak++; countedAt=at; }
 }
 const days = last.result==='independent'?[1,3,7,14][Math.min(streak-1,3)]:1;
 return Date.parse(last.at)+days*DAY;
}
export function reviewDue(slug,state,now=Date.now()) { return reviewDate(slug,state)<=now; }
export function recordAttempt(state,slug,result,now=new Date()) {
 if (!['independent','practiced','revisit'].includes(result)) throw new Error('Choose an attempt result.');
 state.attempts ||= {};
 (state.attempts[slug] ||= []).push({result,at:now.toISOString()});
 state.problems[slug]=result;
}
export function progressSummary(problems,state) {
 const attempted = problems.filter(p => (state.attempts?.[p.slug]?.length || 0)>0 || (state.problems[p.slug] && state.problems[p.slug]!=='new')).length;
 const independent = problems.filter(p => state.problems[p.slug]==='independent').length;
 const reviewed = problems.filter(p => {
  const history = state.attempts?.[p.slug] || [];
  return history.some((a,i)=>i>0 && a.result==='independent' && Date.parse(a.at)-Date.parse(history[0].at)>=DAY);
 }).length;
 return {attempted,independent,reviewed};
}
