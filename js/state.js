/* ============================================================
   state.js
   Shared mutable game state. Loaded first.
   ============================================================ */

const state = {
  scene: 'title',
  act: 1,
  visited: {},          // roomName -> visit count
  affinity: { walter: 0, marta: 0, lena: 0, daniel: 0 },
  path: 0,              // negative = skeptical, positive = yielding
  notebook: [],         // { time, body, foreign? }
  inventory: [],        // array of item ids
  flags: {},
  notebookSeen: 0,
  invSeen: 0,
  currentRoom: null,    // tracks ambient layer
};
