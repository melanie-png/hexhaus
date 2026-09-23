# Hexhaus

A static Babylon.js exploration game hosted on GitHub Pages. No Netlify or build server is required.

## Architecture

- `index.html`, `style.css`: document, loading UI, HUD, and visual style.
- `core.js`: game state, item definitions, Babylon engine, camera/touch controls, direct raycast interaction, model loading, transitions, modal and inventory helpers.
- `rooms/*.js`: one self-contained room-construction function per room. New rooms belong in a new file here.
- `registry.js`: room IDs, builders and centered spawn positions. Load it after the room scripts in `index.html`.
- `models/`, `textures/`: local static assets. Imported Quaternius GLBs have a 100x authoring node, so `loadModel` normalizes scene scale by 0.01.
- `preview/`: isolated GitHub Pages test area, not loaded by the main game; diagnostic scripts run only when their respective query flag is supplied.

Classic scripts load sequentially. They intentionally share game state and helper bindings; keep the room scripts after `core.js` and before `registry.js`. Room transitions dispose the prior Babylon scene and rebuild the requested one while keeping inventory. No proximity highlighting or pointer lock is used.

Run `node --test tests/foundation.test.mjs` in the local workspace before changes. Test a staging preview and only then update the main `index.html` references.
