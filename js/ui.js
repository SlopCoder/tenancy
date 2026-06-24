/* ============================================================
   ui.js
   DOM hooks, notebook + inventory UI, the find-flash pulse.
   ============================================================ */

// DOM element references
const root = document.getElementById('root');
const notebookToggle = document.getElementById('notebookToggle');
const notebookPanel = document.getElementById('notebookPanel');
const notebookEntriesEl = document.getElementById('notebookEntries');
const notebookCloseBtn = document.getElementById('notebookClose');
const audioToggle = document.getElementById('audioToggle');
const invToggle = document.getElementById('invToggle');
const invPanel = document.getElementById('invPanel');
const invItemsEl = document.getElementById('invItems');
const invCloseBtn = document.getElementById('invClose');
const invCountEl = document.getElementById('invCount');

// Toggle button event listeners
notebookToggle.addEventListener('click', openNotebook);
notebookCloseBtn.addEventListener('click', closeNotebook);
audioToggle.addEventListener('click', toggleAudio);
invToggle.addEventListener('click', openInventory);
invCloseBtn.addEventListener('click', closeInventory);

/* -- Notebook -------------------------------------------- */

function openNotebook() {
  notebookPanel.classList.add('open');
  notebookPanel.setAttribute('aria-hidden', 'false');
  state.notebookSeen = state.notebook.length;
  notebookToggle.classList.remove('has-new');
  sting('paper');
}
function closeNotebook() {
  notebookPanel.classList.remove('open');
  notebookPanel.setAttribute('aria-hidden', 'true');
}

function addNote(body, foreign = false) {
  const time = formatTime(state.visited);
  state.notebook.push({ time, body, foreign });
  renderNotebook();
  if (state.notebook.length > state.notebookSeen) {
    notebookToggle.classList.add('has-new');
  }
  pulseToggle(notebookToggle);
}

function pulseToggle(el) {
  if (!el || el.style.display === 'none') return;
  el.classList.remove('flash');
  // Force reflow so the animation restarts even on rapid re-trigger
  void el.offsetWidth;
  el.classList.add('flash');
  setTimeout(() => el.classList.remove('flash'), 2500);
}

function formatTime(visited) {
  // Use total visit count as a soft timestamp
  const total = Object.values(visited).reduce((a,b)=>a+b, 0);
  if (total < 5) return 'late afternoon';
  if (total < 10) return 'evening';
  if (total < 16) return 'night';
  if (total < 22) return 'late night';
  return 'before dawn';
}

function renderNotebook() {
  if (state.notebook.length === 0) {
    notebookEntriesEl.innerHTML = '<p class="notebook-empty">Nothing yet.</p>';
    return;
  }
  notebookEntriesEl.innerHTML = state.notebook.map((e, i) => {
    const isNew = i >= state.notebookSeen;
    const cls = [
      'notebook-entry',
      e.foreign ? 'foreign' : '',
      isNew ? 'is-new' : '',
    ].filter(Boolean).join(' ');
    return `
      <div class="${cls}">
        <span class="entry-time">${e.time}</span>
        <div class="entry-body">${e.body}</div>
      </div>
    `;
  }).join('');
}

/* -- Inventory ------------------------------------------- */

function addItem(id) {
  if (state.inventory.includes(id)) return;
  state.inventory.push(id);
  renderInventory();
  invToggle.style.display = '';
  invToggle.classList.add('has-new');
  pulseToggle(invToggle);
}

function hasItem(id) { return state.inventory.includes(id); }

function hasAllPhotos() {
  return hasItem('photo_w') && hasItem('photo_m') && hasItem('photo_l') && hasItem('photo_d');
}

function openInventory() {
  invPanel.classList.add('open');
  invPanel.setAttribute('aria-hidden', 'false');
  state.invSeen = state.inventory.length;
  invToggle.classList.remove('has-new');
  sting('paper');
}
function closeInventory() {
  invPanel.classList.remove('open');
  invPanel.setAttribute('aria-hidden', 'true');
}

function renderInventory() {
  invCountEl.textContent = state.inventory.length;
  if (state.inventory.length === 0) {
    invItemsEl.innerHTML = '<p class="inv-empty">Nothing yet.</p>';
    return;
  }
  invItemsEl.innerHTML = state.inventory.map((id, i) => {
    const it = items[id];
    if (!it) return '';
    const isNew = i >= state.invSeen;
    return `
      <div class="inv-item ${isNew ? 'is-new' : ''}">
        <span class="inv-item-name">${it.name}</span>
        <div class="inv-item-desc">${it.desc}</div>
      </div>
    `;
  }).join('');
}

/* -- Keyboard + outside-click closing -------------------- */

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (notebookPanel.classList.contains('open')) closeNotebook();
    if (invPanel.classList.contains('open')) closeInventory();
  }
});

document.addEventListener('click', (e) => {
  // The audio toggle is a small corner control — clicking it shouldn't dismiss an open panel.
  if (audioToggle.contains(e.target)) return;
  // Notebook: close if click is outside the panel and not on its toggle
  if (notebookPanel.classList.contains('open') &&
      !notebookPanel.contains(e.target) &&
      !notebookToggle.contains(e.target)) {
    closeNotebook();
  }
  if (invPanel.classList.contains('open') &&
      !invPanel.contains(e.target) &&
      !invToggle.contains(e.target)) {
    closeInventory();
  }
});
