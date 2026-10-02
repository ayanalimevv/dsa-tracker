import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,validateState,nextQuestion,recordAttempt,reviewDate,reviewDue,progressSummary} from './model.js';

const topics = [{id:'arrays',name:'Arrays',steps:[{examples:['first','second']}]},{id:'graphs',name:'Graphs',steps:[{examples:['advanced']}]}];
const problems = [{slug:'first',topic:'Arrays'},{slug:'second',topic:'Arrays'},{slug:'advanced',topic:'Graphs'}];
const day = 86400000;
const date = new Date('2026-01-01T12:00:00Z');

test('an advanced attempt does not skip early gaps',()=>{
 const state = initialState();
 recordAttempt(state,'advanced','independent',new Date());
 assert.equal(nextQuestion(topics,problems,state).problem.slug,'first');
});
test('due reviews take priority even outside the preferred topic',()=>{
 const state = initialState();
 state.preferences.topic='graphs';
 recordAttempt(state,'first','practiced',date);
 const next = nextQuestion(topics,problems,state);
 assert.equal(next.problem.slug,'first');
 assert.equal(next.kind,'revisit');
});
test('successful attempts space reviews at 1, 3, 7 and 14 days; help resets the interval',()=>{
 const state = initialState();
 let now = date.getTime();
 for (const interval of [1,3,7,14,14]) {
  recordAttempt(state,'first','independent',new Date(now));
  assert.equal(reviewDate('first',state),now+interval*day);
  now += interval*day;
 }
 recordAttempt(state,'first','practiced',new Date(now));
 assert.equal(reviewDate('first',state),now+day);
 assert.equal(reviewDue('first',state,now),false);
 assert.equal(reviewDue('first',state,now+day),true);
});
test('revisit retains attempted count and reviews require a later independent attempt',()=>{
 const state = initialState();
 recordAttempt(state,'first','independent',date);
 assert.deepEqual(progressSummary(problems,state),{attempted:1,independent:1,reviewed:0});
 recordAttempt(state,'first','revisit',new Date(date.getTime()+day));
 assert.deepEqual(progressSummary(problems,state),{attempted:1,independent:0,reviewed:0});
 recordAttempt(state,'first','independent',new Date(date.getTime()+2*day));
 assert.deepEqual(progressSummary(problems,state),{attempted:1,independent:1,reviewed:1});
});
test('old backups preserve notes and progress while receiving safe defaults',()=>{
 const old = {version:1,stages:{'arrays:0':'learning'},problems:{first:'independent'},notes:{'arrays:0':'Invariant'},problemNotes:{first:'Use a map'}};
 const state = validateState(old,topics,problems);
 assert.equal(state.problemNotes.first,'Use a map');
 assert.equal(state.notes['arrays:0'],'Invariant');
 assert.equal(state.preferences.minutes,30);
 assert.deepEqual(state.attempts,{});
 assert.equal(reviewDue('first',state),true);
});
test('same-day repeats do not expand intervals or count as delayed reviews',()=>{
 const state = initialState();
 recordAttempt(state,'first','independent',date);
 const later = new Date(date.getTime()+60000);
 recordAttempt(state,'first','independent',later);
 assert.equal(reviewDate('first',state),later.getTime()+day);
 assert.equal(progressSummary(problems,state).reviewed,0);
});
test('unknown slugs, invalid results and timestamps are rejected during import',()=>{
 const state = initialState();
 state.attempts = {first:[{at:date.toISOString(),result:'independent'},{at:'bad',result:'practiced'},{at:date.toISOString(),result:'mastered'}],unknown:[{at:date.toISOString(),result:'independent'}]};
 state.preferences={minutes:-1,topic:'missing',level:'invalid'};
 const restored=validateState(state,topics,problems);
 assert.equal(restored.attempts.first.length,1);
 assert.equal(restored.attempts.unknown,undefined);
 assert.equal(restored.preferences.minutes,30);
 assert.equal(restored.preferences.topic,'all');
});
test('topic selection chooses its first unattempted problem when no review is due',()=>{
 const state=initialState();
 state.preferences.topic='graphs';
 assert.equal(nextQuestion(topics,problems,state).problem.slug,'advanced');
 state.problems.advanced='independent';
 state.attempts.advanced=[{result:'independent',at:new Date().toISOString()}];
 assert.equal(nextQuestion(topics,problems,state),null);
});
