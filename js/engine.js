/* ============================================================
   engine.js
   Core engine: applying effects, picking variants, rendering
   scenes, navigating between them.
   ============================================================ */

/* -- Helpers -------------------------------------------------- */

function pickRoomVariant(room) {
  const count = state.visited[room] || 0;
  return count;
}

function visit(room) {
  state.visited[room] = (state.visited[room] || 0) + 1;
}

function applyEffects(effects) {
  if (!effects) return;
  if (effects.affinity) {
    for (const [k, v] of Object.entries(effects.affinity)) {
      state.affinity[k] = (state.affinity[k] || 0) + v;
    }
  }
  if (typeof effects.path === 'number') state.path += effects.path;
  if (effects.flag) state.flags[effects.flag] = true;
  if (effects.act) state.act = effects.act;
  if (effects.note) addNote(effects.note, effects.foreign || false);
  if (effects.item) {
    const itemList = Array.isArray(effects.item) ? effects.item : [effects.item];
    const beforeCount = state.inventory.length;
    itemList.forEach(addItem);
    if (state.inventory.length > beforeCount && !effects.silentItem) sting('discovery');
  }
  if (effects.sting) sting(effects.sting);
}

function dominantInhabitant() {
  const entries = Object.entries(state.affinity);
  entries.sort((a, b) => b[1] - a[1]);
  if (entries[0][1] === 0) return null;
  return entries[0][0];
}

/* -- Renderer ------------------------------------------------- */

function render(sceneObj) {
  const text = (typeof sceneObj.text === 'function') ? sceneObj.text(state) : sceneObj.text;
  const choices = (typeof sceneObj.choices === 'function') ? sceneObj.choices(state) : sceneObj.choices;
  const label = (typeof sceneObj.label === 'function') ? sceneObj.label(state) : sceneObj.label;

  const labelHTML = label
    ? `<div class="room-label"><span class="act">Act ${roman(state.act)}</span>${label}</div>`
    : '';

  const proseHTML = text.map(p => `<p>${p}</p>`).join('');

  const choicesHTML = (choices || []).map((c, i) => `
    <button class="choice" data-i="${i}">${c.label}</button>
  `).join('');

  const wrapClass = sceneObj.ending ? 'stage ending' : 'stage';
  const endingTail = sceneObj.ending
    ? `<button class="restart" id="restartBtn">Begin again</button>`
    : '';

  root.innerHTML = `
    <div class="${wrapClass}">
      ${labelHTML}
      <div class="prose">${proseHTML}</div>
      ${sceneObj.ending ? '' : `<div class="choices">${choicesHTML}</div>`}
      ${endingTail}
    </div>
  `;

  if (sceneObj.ending) {
    document.getElementById('restartBtn').addEventListener('click', () => {
      resetGame();
    });
    return;
  }

  root.querySelectorAll('.choice').forEach(btn => {
    btn.addEventListener('click', () => {
      const i = parseInt(btn.dataset.i, 10);
      const choice = choices[i];
      applyEffects(choice.effects);
      go(choice.next);
    });
  });

  // Show notebook toggle once it has anything (or once Act II starts)
  if (state.notebook.length > 0 || state.act >= 2) {
    notebookToggle.style.display = '';
  }

  // Track current room (for ambient handling)
  if (sceneObj.room) state.currentRoom = sceneObj.room;

  // Audio: transition drone when act changes, fade out for endings,
  // and update room ambient layer when room changes.
  if (audio.started && audio.enabled) {
    if (sceneObj.ending) {
      fadeOutDrone(7);
    } else {
      if (audio.droneAct !== state.act) {
        transitionDrone(state.act);
      }
      if (sceneObj.room) {
        startAmbient(roomToAmbient(sceneObj.room));
      }
    }
  }
}

function roman(n) { return ['I','II','III','IV','V'][n-1] || n; }

function go(sceneName) {
  if (typeof sceneName === 'function') sceneName = sceneName(state);
  const next = scenes[sceneName];
  if (!next) {
    console.error('Missing scene:', sceneName);
    return;
  }
  if (next.room) visit(next.room);
  render(next);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function resetGame() {
  state.scene = 'title';
  state.act = 1;
  state.visited = {};
  state.affinity = { walter: 0, marta: 0, lena: 0, daniel: 0 };
  state.path = 0;
  state.notebook = [];
  state.inventory = [];
  state.flags = {};
  state.notebookSeen = 0;
  state.invSeen = 0;
  state.currentRoom = null;
  notebookToggle.classList.remove('has-new');
  notebookToggle.style.display = 'none';
  invToggle.classList.remove('has-new');
  invToggle.style.display = 'none';
  invCountEl.textContent = '0';
  audioToggle.style.display = 'none';
  stopDrone();
  stopAmbient(0.4);
  stopHeartbeat();
  audio.droneAct = 0;
  closeNotebook();
  closeInventory();
  renderNotebook();
  renderInventory();
  renderTitle();
}
