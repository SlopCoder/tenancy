# Tenancy

A text-based interactive fiction game of slow psychological horror. Second-person present tense. Approximately one hour of play.

You inherit a house from someone you barely remember. The key fits. The rooms feel almost-familiar. As you walk through them, you keep recognizing things you shouldn't.

## Running the game

### For testers (easiest)

Open `tenancy.html` in any modern browser (Chrome, Firefox, Safari, Edge). Double-click is fine — no server required, no installation, nothing to set up. The whole game is in that one file.

Send the single file to others by email, by direct link, by hosting on any static site (GitHub Pages, Netlify, itch.io, your own server). They just open it.

### For developers (project structure)

The development version is split across files. Because browsers block local file:// imports for security, you need a tiny local server. From the project root:

    python3 -m http.server 8000

Then open `http://localhost:8000/` in the browser. Any other static server works the same way (`npx serve`, `php -S`, etc).

## Project structure

    tenancy/
    ├── index.html       Development entry point — loads modules below
    ├── tenancy.html     Single-file build for distribution
    ├── README.md        This file
    ├── css/
    │   └── main.css     All styling
    └── js/
        ├── state.js     Shared mutable game state
        ├── audio.js     Drone, stings, room ambient layers, heartbeat
        ├── items.js     Items the player can collect
        ├── ui.js        DOM hooks, notebook + inventory panels
        ├── engine.js    Render, navigate, apply effects
        ├── scenes.js    All scene data + Act I→II routing
        └── main.js      Title screen + entry point

Scripts are loaded as classic `<script>` tags (not modules) so the dev version works in any browser without a build step beyond the static server.

## Editing

Most content changes happen in two places:

- **`js/scenes.js`** — All scene text and choices. Each scene is a key in the `scenes` object with `text` and `choices` properties. `text` can be a function of state (returns an array of paragraphs) to vary by act or dominant inhabitant. `choices` is an array of `{ label, next, effects }`.

- **`js/items.js`** — All collectible items. Each has a `name` and a `desc` (which renders into the inventory panel).

Effects you can attach to a choice:

    {
      affinity: { walter: 1 },        // add to inhabitant affinity
      path: 1,                         // +1 yielding / -1 skeptical
      flag: 'heard_broadcast',         // set a story flag
      item: 'photo_w',                 // grant an item (string or array)
      silentItem: true,                // suppress the discovery sting
      note: "Text for the notebook",   // add a notebook entry
      foreign: true,                   // marks the note as not-yours (mauve)
      sting: 'foreign',                // play a sting (see below)
      act: 2,                          // jump to a specific act
    }

Available sting types: `recognition`, `mirror`, `foreign`, `discovery`, `revelation`, `paper`.

Room ambient layers fire automatically when the player enters a scene with `room: 'kitchen' | 'bathroom' | 'basement' | 'attic'`.

## Building the single-file distribution

`tenancy.html` is the all-inlined build. To regenerate it after editing the dev files, concatenate the JS into the head and inline the CSS. See `build.sh` if present, or simply work with the single file as the source of truth and split when needed.

## Credits

No external assets — all audio is synthesized at runtime via the Web Audio API. Typography: Cormorant Garamond and JetBrains Mono via Google Fonts (loaded over HTTPS).
