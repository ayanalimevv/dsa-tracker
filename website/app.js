import {topics, groups, sources} from './curriculum.js';
import {STORAGE_KEY, initialState, validateState, topicProgress, nextStage, nextQuestion} from './model.js';
import {cloud} from './cloud.js';

const problems = await fetch('./problems.json').then(response => {
  if (!response.ok) throw new Error('Problem data could not load.');
  return response.json();
});
const problemMap = new Map(problems.map(problem => [problem.slug, problem]));
const app = document.querySelector('#app');
const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const compactName = name => name.replace('1-D Dynamic Programming','1-D DP').replace('2-D Dynamic Programming','2-D DP');

let storageAvailable = true;
let state;
try {
  const saved = localStorage.getItem(STORAGE_KEY);
  state = saved ? validateState(JSON.parse(saved), topics, problems) : initialState();
} catch {
  state = initialState();
  storageAvailable = false;
}
let problemReturn = '#roadmap';
let notesTopic = 'all';
let notesView = 'all';
let notesQuery = '';
let cloudReady = false;
let syncTimer;
let syncQueue = Promise.resolve();
try { if (localStorage.getItem('margin-sidebar-collapsed') === '1') document.body.classList.add('sidebar-collapsed'); } catch { /* Keep the sidebar open. */ }

function toast(message) {
  const element = document.querySelector('#toast');
  element.textContent = message;
  element.classList.add('visible');
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => element.classList.remove('visible'), 3000);
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    storageAvailable = true;
  } catch {
    storageAvailable = false;
    toast('Storage unavailable. Export a backup to keep your progress.');
  }
}

function save() {
  state.updatedAt = new Date().toISOString();
  persist();
  if (cloudReady) {
    clearTimeout(syncTimer);
    syncTimer = setTimeout(() => {
      const snapshot = structuredClone(state);
      syncQueue = syncQueue.catch(() => {}).then(() => cloud.saveProgress(snapshot));
      syncQueue.catch(() => toast('Saved on this device. Cloud sync will retry next time.'));
    }, 750);
  }
}

function hasProgress(candidate) {
  return Object.keys(candidate.stages).length > 0 || Object.keys(candidate.problems).length > 0 || Object.values(candidate.notes).some(Boolean) || Object.values(candidate.problemNotes || {}).some(Boolean);
}

function route() {
  const [page,id,rawIndex] = location.hash.slice(1).split('/');
  const topic = topics.find(item => item.id === id) || topics[0];
  const index = Math.min(Math.max(Number(rawIndex) || 0,0),topic.steps.length-1);
  if (['topic','stage','stage-practice','topic-problems'].includes(page)) return {page,topic,index};
  if (page === 'problem') return {page,problem:problemMap.get(id) || problems[0]};
  return {page:['roadmap','review','notes','settings'].includes(page) ? page : 'overview'};
}

function statusLabel(status) {
  return ({new:'Not started', learning:'Learning', practiced:'Practiced', confident:'Confident', independent:'Independent', revisit:'Revisit'})[status] || 'Not started';
}

function stageForProblem(slug) {
  for (const topic of topics) {
    const index = topic.steps.findIndex(step => step.examples.includes(slug));
    if (index >= 0) return {topic,index};
  }
  return {topic:topics[0],index:0};
}

function sidebar(view) {
  const revisitCount = problems.filter(problem => state.problems[problem.slug] === 'revisit').length;
  const practicedCount = problems.filter(problem => ['practiced','independent'].includes(state.problems[problem.slug])).length;
  const topicOpen = ['topic','stage','stage-practice','topic-problems'].includes(view.page);
  const activeTopic = view.topic?.id;
  return `<aside class="sidebar" aria-label="Sidebar">
    <div class="sidebar-head"><a class="brand" href="#overview"><span class="brand-mark">m</span><span class="brand-word">margin</span></a><button class="sidebar-close" data-action="sidebar" aria-label="Collapse sidebar" title="Collapse sidebar">‹</button></div>
    <nav class="primary-nav" aria-label="Main navigation">
      <a href="#overview" class="${view.page === 'overview' ? 'active' : ''}" title="Home"><span class="nav-icon">⌂</span><span class="nav-text">Home</span></a>
      <a href="#roadmap" class="${view.page === 'roadmap' ? 'active' : ''}" title="Roadmap"><span class="nav-icon">▦</span><span class="nav-text">Roadmap</span></a>
      <a href="#notes" class="${view.page === 'notes' ? 'active' : ''}" title="Question notes"><span class="nav-icon">▤</span><span class="nav-text">Notes</span></a>
      <a href="#review" class="${view.page === 'review' ? 'active' : ''}" title="Revisit"><span class="nav-icon">↺</span><span class="nav-text">Revisit</span>${revisitCount ? `<span class="nav-count">${revisitCount}</span>` : ''}</a>
    </nav>
    <details class="sidebar-topics" ${topicOpen ? 'open' : ''}><summary>Topics <span>${topics.length}</span></summary><nav aria-label="Topic pages">${topics.map(topic => `<a href="#topic/${topic.id}" class="${activeTopic === topic.id ? 'active' : ''}"><span class="topic-icon">${topic.icon}</span>${escapeHtml(compactName(topic.name))}</a>`).join('')}</nav></details>
    <div class="sidebar-progress"><span>${practicedCount} / ${problems.length} questions</span><div class="progress-track"><div style="width:${Math.round(practicedCount/problems.length*100)}%"></div></div></div>
    <div class="sidebar-bottom"><a href="#settings" class="${view.page === 'settings' ? 'active' : ''}" title="Settings"><span class="nav-icon">⚙</span><span class="nav-text">Settings</span></a></div>
  </aside>`;
}

function breadcrumb(view) {
  const label = view.topic ? view.topic.name : view.page === 'overview' ? 'Home' : view.page === 'roadmap' ? 'Roadmap' : view.page === 'notes' ? 'Notes' : view.page === 'review' ? 'Revisit' : view.page === 'settings' ? 'Settings' : view.page === 'problem' ? 'Problem' : 'Home';
  return `<header class="topbar"><button class="sidebar-toggle" data-action="sidebar" aria-label="Toggle sidebar" title="Toggle sidebar" aria-expanded="${document.body.classList.contains('menu-open') || !document.body.classList.contains('sidebar-collapsed')}">☰</button><span class="breadcrumb">${escapeHtml(label)}</span></header>`;
}

function overview() {
  const next = nextQuestion(topics,problems,state);
  const practiced = problems.filter(problem => ['practiced','independent'].includes(state.problems[problem.slug])).length;
  return `<div class="page home-page"><div class="eyebrow">YOUR STUDY SPACE</div><h1>${next ? next.kind === 'revisit' ? 'Ready for another try.' : 'Your next question.' : 'All questions done.'}</h1><p class="page-intro">${practiced} of ${problems.length} problems practiced</p>
    ${next ? `<section class="focus-card"><span class="focus-icon">${next.topic.icon}</span><div class="focus-copy"><div class="eyebrow">${next.kind === 'revisit' ? 'REVISIT' : 'UP NEXT'} · ${escapeHtml(next.topic.name)}</div><h2>${escapeHtml(next.problem.title)}</h2><p>${escapeHtml(next.topic.steps[next.stepIndex].name)} · ${escapeHtml(next.problem.difficulty)}</p></div><a class="primary-button" href="#problem/${next.problem.slug}">Open question →</a></section>` : `<a class="quiet-link" href="#review">Review your questions →</a>`}
    <a class="quiet-link" href="#roadmap">See the full roadmap <span>→</span></a>
  </div>`;
}

function roadmap() {
  return `<div class="page narrow-page"><div class="eyebrow">ALL TOPICS</div><h1>Roadmap.</h1><p class="page-intro">Open any topic to see its learning steps.</p><div class="roadmap-list">${groups.map(groupName => `<section><h2 class="list-heading">${escapeHtml(groupName)}</h2>${topics.filter(topic => topic.group === groupName).map(topic => {
    const progress = topicProgress(topic,state);
    return `<a class="list-row" href="#topic/${topic.id}"><span class="row-icon">${topic.icon}</span><span class="row-main"><strong>${escapeHtml(topic.name)}</strong><small>${progress.done === progress.total ? 'Complete' : `Next: ${escapeHtml(topic.steps[nextStage(topic,state)].name)}`}</small></span><span class="row-progress">${progress.done}/${progress.total}</span><span class="row-arrow">›</span></a>`;
  }).join('')}</section>`).join('')}</div></div>`;
}

function topicPage(topic) {
  const progress = topicProgress(topic,state);
  const next = nextStage(topic,state);
  const count = problems.filter(problem => problem.topic === topic.name).length;
  return `<div class="page narrow-page"><a class="back-link" href="#roadmap">← Roadmap</a><div class="eyebrow">${escapeHtml(topic.group.toUpperCase())}</div><h1>${escapeHtml(topic.name)}.</h1><p class="page-intro">${escapeHtml(topic.summary)}</p><div class="progress-line">${progress.done} of ${progress.total} steps confident</div>
    <div class="step-list">${topic.steps.map((step,index) => {
      const status = state.stages[`${topic.id}:${index}`] || 'new';
      return `<a href="#stage/${topic.id}/${index}" class="step-row ${index === next && progress.done < progress.total ? 'suggested' : ''}"><span class="step-index">${status === 'confident' ? '✓' : String(index+1).padStart(2,'0')}</span><span><strong>${escapeHtml(step.name)}</strong>${index === next && progress.done < progress.total ? '<small>Learn next</small>' : ''}</span><span class="row-arrow">›</span></a>`;
    }).join('')}</div><a class="quiet-link" href="#topic-problems/${topic.id}">All ${count} practice problems <span>→</span></a></div>`;
}

function stagePage(topic,index) {
  const step = topic.steps[index];
  const key = `${topic.id}:${index}`;
  const status = state.stages[key] || 'new';
  const count = step.examples.filter(slug => problemMap.has(slug)).length;
  const nextLink = index+1 < topic.steps.length ? `#stage/${topic.id}/${index+1}` : `#topic/${topics[(topics.indexOf(topic)+1)%topics.length].id}`;
  return `<div class="page narrow-page"><a class="back-link" href="#topic/${topic.id}">← ${escapeHtml(topic.name)}</a><div class="eyebrow">STEP ${String(index+1).padStart(2,'0')} OF ${String(topic.steps.length).padStart(2,'0')}</div><h1>${escapeHtml(step.name)}.</h1><p class="lesson-lead">${escapeHtml(step.description)}</p>
    <div class="cue-card"><span class="eyebrow">WHEN TO USE IT</span><p>${escapeHtml(step.cue)}</p></div>
    <a class="primary-button practice-button" href="#stage-practice/${topic.id}/${index}">Practice ${count} problem${count === 1 ? '' : 's'} →</a>
    <div class="status-control"><label for="stage-status">My confidence</label><select id="stage-status" data-key="${key}">${['new','learning','practiced','confident'].map(value => `<option value="${value}" ${status === value ? 'selected' : ''}>${statusLabel(value)}</option>`).join('')}</select></div>
    <details class="extra-details"><summary>Complexity and my notes</summary><p>${escapeHtml(step.complexity)}</p><label for="stage-notes">My note</label><textarea id="stage-notes" data-key="${key}" placeholder="What should I remember?">${escapeHtml(state.notes[key] || '')}</textarea><small id="note-saved">Saved on this device</small></details>
    <a class="quiet-link" href="${nextLink}">${index+1 < topic.steps.length ? 'Next step' : 'Next topic'} <span>→</span></a>
  </div>`;
}

function problemLink(problem) {
  const status = state.problems[problem.slug] || 'new';
  return `<a class="list-row" href="#problem/${problem.slug}"><span class="problem-dot ${status}">${status === 'independent' ? '✓' : status === 'revisit' ? '↺' : ''}</span><span class="row-main"><strong>${escapeHtml(problem.title)}</strong><small>${escapeHtml(problem.difficulty)}${state.problemNotes?.[problem.slug] ? ' · Note saved' : ''}</small></span><span class="row-arrow">›</span></a>`;
}

function stagePracticePage(topic,index) {
  const step = topic.steps[index];
  const list = step.examples.map(slug => problemMap.get(slug)).filter(Boolean);
  return `<div class="page narrow-page"><a class="back-link" href="#stage/${topic.id}/${index}">← ${escapeHtml(step.name)}</a><div class="eyebrow">PRACTICE</div><h1>${escapeHtml(step.name)}.</h1><p class="page-intro">Try each problem, then save the trick you learned.</p><div class="simple-list">${list.map(problemLink).join('')}</div></div>`;
}

function topicProblemsPage(topic) {
  const list = problems.filter(problem => problem.topic === topic.name);
  return `<div class="page narrow-page"><a class="back-link" href="#topic/${topic.id}">← ${escapeHtml(topic.name)}</a><div class="eyebrow">ALL PRACTICE</div><h1>${escapeHtml(topic.name)}.</h1><p class="page-intro">${list.length} NeetCode 150 problems</p><div class="simple-list">${list.map(problemLink).join('')}</div></div>`;
}

function problemPage(problem) {
  const status = state.problems[problem.slug] || 'new';
  const origin = stageForProblem(problem.slug);
  const back = problemReturn.startsWith('#problem/') ? `#stage-practice/${origin.topic.id}/${origin.index}` : problemReturn;
  return `<div class="page narrow-page"><a class="back-link" href="${back}">← Back</a><div class="eyebrow">${escapeHtml(problem.topic.toUpperCase())} · ${escapeHtml(problem.difficulty.toUpperCase())}</div><h1>${escapeHtml(problem.title)}.</h1>
    <div class="problem-actions"><a class="primary-button" href="https://leetcode.com/problems/${encodeURIComponent(problem.slug)}/" target="_blank" rel="noopener">Solve problem ↗</a><a class="secondary-button" href="https://www.youtube.com/watch?v=${encodeURIComponent(problem.video)}" target="_blank" rel="noopener">Video ↗</a></div>
    <div class="status-control"><label for="problem-status">My result</label><select id="problem-status" data-problem="${escapeHtml(problem.slug)}">${['new','practiced','independent','revisit'].map(value => `<option value="${value}" ${status === value ? 'selected' : ''}>${statusLabel(value)}</option>`).join('')}</select></div>
    <div class="problem-note"><label for="problem-notes">Trick to remember</label><p>A short note for your next attempt.</p><textarea id="problem-notes" data-slug="${escapeHtml(problem.slug)}" maxlength="3000" placeholder="What was the key idea?">${escapeHtml(state.problemNotes?.[problem.slug] || '')}</textarea><small id="problem-note-saved">Saved on this device</small></div><a class="quiet-link" href="#notes">View all question notes <span>→</span></a>
  </div>`;
}

function notesPage() {
  const savedCount = problems.filter(problem => state.problemNotes?.[problem.slug]?.trim()).length;
  const visible = problems.filter(problem =>
    (notesTopic === 'all' || problem.topic === notesTopic) &&
    (notesView === 'all' || Boolean(state.problemNotes?.[problem.slug]?.trim())) &&
    `${problem.title} ${problem.topic} ${state.problemNotes?.[problem.slug] || ''}`.toLowerCase().includes(notesQuery.toLowerCase())
  );
  return `<div class="page notes-page"><div class="eyebrow">YOUR QUESTION LIBRARY</div><h1>Notes & tricks.</h1><p class="page-intro">${savedCount} notes saved across ${problems.length} questions.</p>
    <div class="sheet-toolbar"><label>Topic<select id="notes-topic"><option value="all">All topics</option>${topics.map(topic => `<option value="${escapeHtml(topic.name)}" ${notesTopic === topic.name ? 'selected' : ''}>${escapeHtml(topic.name)}</option>`).join('')}</select></label><label>Show<select id="notes-view"><option value="all" ${notesView === 'all' ? 'selected' : ''}>All questions</option><option value="saved" ${notesView === 'saved' ? 'selected' : ''}>With notes</option></select></label><label class="sheet-search-label">Find<input id="notes-search" type="search" placeholder="Question or trick" value="${escapeHtml(notesQuery)}"></label></div>
    <div class="notes-table-wrap"><table class="notes-table"><thead><tr><th scope="col">#</th><th scope="col">Question</th><th scope="col">Topic</th><th scope="col">Result</th><th scope="col">Trick to remember</th></tr></thead><tbody>${visible.map(problem => {
      const status = state.problems[problem.slug] || 'new';
      return `<tr><td>${problems.indexOf(problem)+1}</td><td><a href="#problem/${problem.slug}">${escapeHtml(problem.title)}</a></td><td>${escapeHtml(compactName(problem.topic))}</td><td><select data-problem="${escapeHtml(problem.slug)}" aria-label="Result for ${escapeHtml(problem.title)}">${['new','practiced','independent','revisit'].map(value => `<option value="${value}" ${status === value ? 'selected' : ''}>${statusLabel(value)}</option>`).join('')}</select></td><td><textarea data-note-input="${escapeHtml(problem.slug)}" aria-label="Trick for ${escapeHtml(problem.title)}" maxlength="3000" rows="1" placeholder="Add a trick…">${escapeHtml(state.problemNotes?.[problem.slug] || '')}</textarea></td></tr>`;
    }).join('')}</tbody></table>${visible.length ? '' : '<div class="sheet-empty">No questions match these filters.</div>'}</div><div class="sheet-foot">${visible.length} questions shown <span id="sheet-save">Changes save automatically</span></div>
  </div>`;
}

function review() {
  const list = problems.filter(problem => state.problems[problem.slug] === 'revisit');
  return `<div class="page narrow-page"><div class="eyebrow">RETRY LATER</div><h1>Revisit.</h1><p class="page-intro">${list.length ? `${list.length} problem${list.length === 1 ? '' : 's'} ready for another attempt.` : 'Nothing to revisit yet.'}</p>${list.length ? `<div class="simple-list">${list.map(problemLink).join('')}</div>` : '<a class="quiet-link" href="#roadmap">Explore the roadmap →</a>'}</div>`;
}

function settingsPage() {
  return `<div class="page narrow-page"><div class="eyebrow">PREFERENCES</div><h1>Settings.</h1><div class="settings-list"><button data-action="theme"><span>Appearance<small>${state.theme === 'dark' ? 'Dark' : 'Light'}</small></span><span>›</span></button><button data-action="estimate"><span>Time estimate<small>Plan your pace</small></span><span>›</span></button><button data-action="backup"><span>Backup & sources<small>Export or import progress</small></span><span>›</span></button><button data-action="account"><span>Cloud account<small>${cloud.user ? escapeHtml(cloud.user.email || 'Connected') : 'Optional sync'}</small></span><span>›</span></button></div></div>`;
}

function render() {
  const view = route();
  document.documentElement.dataset.theme = state.theme;
  document.title = `${view.topic?.name || view.problem?.title || view.page} — Margin`;
  const page = view.page === 'overview' ? overview() : view.page === 'roadmap' ? roadmap() : view.page === 'topic' ? topicPage(view.topic) : view.page === 'stage' ? stagePage(view.topic,view.index) : view.page === 'stage-practice' ? stagePracticePage(view.topic,view.index) : view.page === 'topic-problems' ? topicProblemsPage(view.topic) : view.page === 'problem' ? problemPage(view.problem) : view.page === 'notes' ? notesPage() : view.page === 'review' ? review() : settingsPage();
  app.innerHTML = sidebar(view) + `<main>${breadcrumb(view)}${page}</main>`;
  document.querySelector('#stage-notes')?.addEventListener('input', event => {
    state.notes[event.target.dataset.key] = event.target.value;
    save();
    document.querySelector('#note-saved').textContent = storageAvailable ? 'Saved' : 'Export to keep this note';
  });
  document.querySelector('#problem-notes')?.addEventListener('input', event => {
    state.problemNotes[event.target.dataset.slug] = event.target.value;
    save();
    document.querySelector('#problem-note-saved').textContent = storageAvailable ? 'Saved' : 'Export to keep this note';
  });
  document.querySelectorAll('[data-note-input]').forEach(input => input.addEventListener('input', event => {
    state.problemNotes[event.target.dataset.noteInput] = event.target.value;
    save();
    const savedCount = problems.filter(problem => state.problemNotes?.[problem.slug]?.trim()).length;
    document.querySelector('.notes-page .page-intro').textContent = `${savedCount} notes saved across ${problems.length} questions.`;
    document.querySelector('#sheet-save').textContent = storageAvailable ? 'Saved' : 'Export to keep these notes';
  }));
  document.querySelector('#notes-search')?.addEventListener('input', event => {
    notesQuery = event.target.value;
    const position = event.target.selectionStart;
    render();
    const input = document.querySelector('#notes-search');
    input.focus();
    try { input.setSelectionRange(position,position); } catch { /* Search inputs may not support selection. */ }
  });
}

function dialogShell(className, content) {
  const dialog = document.createElement('dialog');
  dialog.className = `backup-dialog ${className}`;
  dialog.innerHTML = `<button class="dialog-close" aria-label="Close dialog">×</button>${content}`;
  document.body.append(dialog);
  dialog.showModal();
  dialog.querySelector('.dialog-close').onclick = () => dialog.close();
  dialog.addEventListener('close', () => dialog.remove());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const box = dialog.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
  });
  return dialog;
}

function openBackup() {
  const dialog = dialogShell('backup-modal', `<div class="eyebrow">YOUR WORKSPACE</div><h2>Keep your progress.</h2><p>Export a copy or bring one back to this device.</p><div class="backup-actions"><button id="export" class="primary-button">Export backup ↓</button><label class="secondary-button">Import backup ↑<input id="import" type="file" accept="application/json,.json" hidden></label></div><div class="import-status" role="status"></div><div class="source-links"><label>REFERENCES</label>${sources.map(source => `<a href="${source.url}" target="_blank" rel="noopener">${escapeHtml(source.title)} ↗</a>`).join('')}<p>Topic stages are a curated path based on these references.</p></div>`);
  dialog.querySelector('#export').onclick = () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(state,null,2)],{type:'application/json'}));
    const link = document.createElement('a');
    link.href = url;
    link.download = `margin-backup-${new Date().toISOString().slice(0,10)}.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url),5000);
    toast('Backup exported');
  };
  dialog.querySelector('#import').onchange = async event => {
    const file = event.target.files[0];
    if (!file) return;
    const status = dialog.querySelector('.import-status');
    try {
      if (file.size > 2000000) throw new Error('Backup is too large.');
      const candidate = validateState(JSON.parse(await file.text()),topics,problems);
      status.textContent = 'Valid backup. Import replaces progress on this device. ';
      const button = document.createElement('button');
      button.className = 'secondary-button';
      button.textContent = 'Import this backup';
      status.append(button);
      button.onclick = () => {state = candidate; save(); dialog.close(); render(); toast('Backup imported');};
    } catch { status.textContent = 'Could not read this backup. Choose a valid Margin JSON file.'; }
  };
}

function openEstimate() {
  const dialog = dialogShell('estimate-modal', `<div class="eyebrow">PLAN YOUR PACE</div><h2>Time to finish.</h2><p>How many hours can you study each day?</p><label class="daily-hours-label" for="daily-hours">Hours per day</label><input id="daily-hours" type="number" min="0.25" max="24" step="0.25" value="2" inputmode="decimal"><div class="estimate-result" aria-live="polite"></div><p class="estimate-note">Estimate uses 1 hour per learning step and 45 minutes per problem. Review and harder problems may take longer.</p>`);
  const update = () => {
    const stagesLeft = topics.reduce((count,topic) => count + (topic.steps.length - topicProgress(topic,state).done),0);
    const problemsLeft = problems.filter(problem => !['practiced','independent'].includes(state.problems[problem.slug])).length;
    const dailyHours = Number(dialog.querySelector('#daily-hours').value);
    const totalHours = stagesLeft + problemsLeft * 0.75;
    if (!Number.isFinite(dailyHours) || dailyHours <= 0) {
      dialog.querySelector('.estimate-result').textContent = 'Enter your daily study hours.';
      return;
    }
    const days = Math.ceil(totalHours/dailyHours);
    dialog.querySelector('.estimate-result').innerHTML = `<strong>${days} <span>study day${days === 1 ? '' : 's'}</span></strong><p>About ${Math.ceil(days/7)} week${days <= 7 ? '' : 's'} if you study every day · ${Math.round(totalHours)} hours left</p>`;
  };
  dialog.querySelector('#daily-hours').addEventListener('input',update);
  update();
}

async function finishCloudConnection(dialog) {
  const status = dialog.querySelector('.account-status');
  status.textContent = 'Checking saved progress…';
  try {
    const remote = await cloud.loadProgress();
    if (!remote) {
      await cloud.saveProgress(state);
      cloudReady = true;
      localStorage.setItem('margin-cloud-user-v1',cloud.user.id);
      dialog.close(); render(); toast('Cloud sync is on');
      return;
    }
    const candidate = validateState(remote.payload,topics,problems);
    const sameUser = localStorage.getItem('margin-cloud-user-v1') === cloud.user.id;
    if (!hasProgress(state) || (sameUser && Date.parse(candidate.updatedAt || 0) >= Date.parse(state.updatedAt || 0))) {
      state = candidate;
      persist();
      cloudReady = true;
      localStorage.setItem('margin-cloud-user-v1',cloud.user.id);
      dialog.close(); render(); toast('Cloud progress loaded');
      return;
    }
    if (sameUser && Date.parse(state.updatedAt || 0) > Date.parse(candidate.updatedAt || 0)) {
      await cloud.saveProgress(state);
      cloudReady = true;
      dialog.close(); render(); toast('Recent progress synced');
      return;
    }
    status.innerHTML = 'Choose which progress to keep. <div class="backup-actions"><button class="primary-button" data-choice="cloud">Use cloud copy</button><button class="secondary-button" data-choice="local">Upload this device</button></div>';
    status.querySelector('[data-choice="cloud"]').onclick = () => {
      state = candidate; persist(); cloudReady = true;
      localStorage.setItem('margin-cloud-user-v1',cloud.user.id);
      dialog.close(); render(); toast('Cloud progress loaded');
    };
    status.querySelector('[data-choice="local"]').onclick = async () => {
      try {
        status.textContent = 'Uploading…';
        await cloud.saveProgress(state);
        cloudReady = true;
        localStorage.setItem('margin-cloud-user-v1',cloud.user.id);
        dialog.close(); render(); toast('Progress uploaded');
      } catch (error) { status.textContent = error.message; }
    };
  } catch (error) { status.textContent = error.message; }
}

function openAccount() {
  const dialog = dialogShell('account-modal', `<div class="eyebrow">CLOUD PROGRESS</div><h2>${cloud.user ? 'Your account.' : 'Take it with you.'}</h2><p>${cloud.configured ? cloud.user ? `Signed in as ${escapeHtml(cloud.user.email || 'your account')}.` : 'Sign in to keep progress across devices.' : 'Cloud sync will be available after this site is connected to a Supabase project.'}</p>${cloud.configured && !cloud.user ? `<form id="account-form"><label>Email<input name="email" type="email" autocomplete="email" required></label><label>Password<input name="password" type="password" autocomplete="current-password" minlength="6" required></label><div class="backup-actions"><button class="primary-button" type="submit" name="mode" value="signin">Sign in</button><button class="secondary-button" type="submit" name="mode" value="signup">Create account</button></div></form>` : cloud.user ? `<div class="backup-actions"><button id="sync-now" class="primary-button">Sync now</button><button id="sign-out" class="secondary-button">Sign out</button></div>` : ''}<div class="account-status" role="status"></div>`);
  const form = dialog.querySelector('#account-form');
  if (form) form.addEventListener('submit', async event => {
    event.preventDefault();
    const button = event.submitter;
    const status = dialog.querySelector('.account-status');
    const email = form.elements.email.value.trim();
    const password = form.elements.password.value;
    button.disabled = true;
    status.textContent = button.value === 'signup' ? 'Creating account…' : 'Signing in…';
    try {
      if (button.value === 'signup') {
        const signedIn = await cloud.signUp(email,password);
        if (!signedIn) { status.textContent = 'Check your email to confirm your account, then sign in.'; return; }
      } else await cloud.signIn(email,password);
      await finishCloudConnection(dialog);
    } catch (error) { status.textContent = error.message; }
    finally { button.disabled = false; }
  });
  dialog.querySelector('#sync-now')?.addEventListener('click', async () => {
    const status = dialog.querySelector('.account-status');
    status.textContent = 'Syncing…';
    try { await cloud.saveProgress(state); cloudReady = true; status.textContent = 'Progress synced.'; render(); }
    catch (error) { status.textContent = error.message; }
  });
  dialog.querySelector('#sign-out')?.addEventListener('click', async () => {
    await cloud.signOut();
    cloudReady = false;
    dialog.close(); render(); toast('Signed out');
  });
}

app.addEventListener('click', event => {
  const problemLink = event.target.closest('a[href^="#problem/"]');
  if (problemLink) problemReturn = location.hash || '#roadmap';
  const button = event.target.closest('button');
  if (!button) return;
  switch (button.dataset.action) {
    case 'theme': state.theme = state.theme === 'dark' ? 'light' : 'dark'; save(); render(); break;
    case 'sidebar': toggleSidebar(); break;
    case 'backup': openBackup(); break;
    case 'estimate': openEstimate(); break;
    case 'account': openAccount(); break;
  }
});

app.addEventListener('change', event => {
  if (event.target.id === 'notes-topic') { notesTopic = event.target.value; render(); return; }
  if (event.target.id === 'notes-view') { notesView = event.target.value; render(); return; }
  if (event.target.dataset.problem) {
    const table = document.querySelector('.notes-table-wrap');
    const scrollTop = table?.scrollTop;
    const scrollLeft = table?.scrollLeft;
    state.problems[event.target.dataset.problem] = event.target.value;
    save(); render();
    if (scrollTop !== undefined) { document.querySelector('.notes-table-wrap').scrollTop = scrollTop; document.querySelector('.notes-table-wrap').scrollLeft = scrollLeft; }
    toast('Progress saved');
  }
  if (event.target.id === 'stage-status') {
    state.stages[event.target.dataset.key] = event.target.value;
    save(); render(); toast(event.target.value === 'confident' ? 'Stage complete' : 'Progress saved');
  }
});

function toggleSidebar() {
  if (window.matchMedia('(max-width: 700px)').matches) document.body.classList.toggle('menu-open');
  else {
    document.body.classList.toggle('sidebar-collapsed');
    try { localStorage.setItem('margin-sidebar-collapsed',document.body.classList.contains('sidebar-collapsed') ? '1' : '0'); } catch { /* Preference lasts for this tab. */ }
  }
  render();
}

window.addEventListener('hashchange', () => {
  document.body.classList.remove('menu-open');
  render(); window.scrollTo(0,0);
});
window.addEventListener('keydown', event => {
  if ((event.ctrlKey || event.metaKey) && event.key === '\\') { event.preventDefault(); toggleSidebar(); }
  if (event.key === 'Escape') document.body.classList.remove('menu-open');
});
document.addEventListener('click', event => {
  if (event.target === document.body) document.body.classList.remove('menu-open');
});

cloud.consumeRedirect();
render();
if (cloud.configured) {
  cloud.restore().then(restored => {
    if (!restored) return;
    const dialog = dialogShell('account-modal', '<div class="eyebrow">CLOUD PROGRESS</div><h2>Restoring progress.</h2><div class="account-status" role="status"></div>');
    finishCloudConnection(dialog);
  });
}
