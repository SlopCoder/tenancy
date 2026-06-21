/* ============================================================
   TITLE SCREEN
   ============================================================ */

function renderTitle() {
  root.innerHTML = `
    <div class="title-screen">
      <h1>Tenancy</h1>
      <button class="begin" id="beginBtn">Begin</button>
    </div>
  `;
  document.getElementById('beginBtn').addEventListener('click', () => {
    initAudio();
    if (audio.enabled) startDrone(1);
    audioToggle.style.display = '';
    go('opening');
  });
}

renderTitle();
