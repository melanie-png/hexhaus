/* ═══════════════════════════════════════════
   HEXHAUS — script.js  v2 (performance + UX)
   ═══════════════════════════════════════════ */

// ─── STATE ───────────────────────────────────
const state = {
  inventory: [],
  pan: 0,
  isDragging: false,
  dragStartX: 0,
  panAtDrag: 0,
  velocity: 0,
  lastX: 0,
  lastT: 0,
  rafId: null,           // momentum rAF
  panRafId: null,        // FIX 3: throttle touchmove to rAF
  pendingX: null,
  hintDone: false,
};

const ROOM_WIDTH = 3200;
const COLLECT_LIMIT = 5;
const DRAG_THRESHOLD = 6; // px — below this a touch is a tap, not a drag
let dragMoved = 0;        // track how far we've moved since touchstart

// ─── ITEM DEFINITIONS ────────────────────────
const ITEMS = {
  cloak: {
    name: 'The Black Cloak',
    icon: '🧥',
    collectible: true,
    desc: 'Heavy wool, charcoal-black. A silver clasp shaped like a moth. It smells of woodsmoke and something older.',
  },
  staff: {
    name: 'Gnarled Staff',
    icon: '🪄',
    collectible: true,
    desc: 'Twisted hawthorn wood, taller than you. Three runes carved near the tip. One is still warm to the touch.',
  },
  key: {
    name: 'Iron Key',
    icon: '🗝️',
    collectible: true,
    desc: 'Heavy, old iron. The bow is shaped like a crescent moon. It opens something important.',
  },
  letter: {
    name: 'Sealed Letter',
    icon: '📜',
    collectible: true,
    desc: 'Black wax seal, pressed with a hexagon. The paper is warm. It hums faintly when held close.',
  },
  rosemary: {
    name: 'Dried Rosemary',
    icon: '🌿',
    collectible: true,
    desc: 'Tied with red thread. Hung above a doorway, rosemary keeps what shouldn\'t enter from entering. Or so the old books say.',
  },
  portrait: {
    name: 'Family Portrait',
    icon: '🖼️',
    collectible: false,
    desc: 'Six figures in Victorian dress. Five look straight ahead. The sixth is looking at something behind you. The paint is still wet.',
  },
  mirror: {
    name: 'Foxed Mirror',
    icon: '🪞',
    collectible: false,
    desc: 'Silver backing eaten away by decades. Your reflection appears a half-second after you move. Something else is in the room with you.',
  },
  clock: {
    name: 'Grandfather Clock',
    icon: '🕰️',
    collectible: false,
    desc: 'Stopped at 3:17. No key in the winding hole. The pendulum moves anyway.',
  },
  books: {
    name: 'Pile of Old Books',
    icon: '📚',
    collectible: false,
    desc: 'Titles in three languages. One is in no language at all — but you can read it anyway. You close it quickly.',
  },
  candelabra: {
    name: 'Iron Candelabra',
    icon: '🕯️',
    collectible: false,
    desc: 'Seven arms, six lit. The seventh candle is cold and has never been burned, but there is wax on the floor beneath it.',
  },
  broom: {
    name: "Witch's Broom",
    icon: '🧹',
    collectible: false,
    desc: "Birch handle, bundled heather. It's upright with nothing holding it. You nudge it. It doesn't fall.",
  },
  cobweb: {
    name: 'Ancient Cobweb',
    icon: '🕸️',
    collectible: false,
    desc: 'The spider that made this was not small. It was not a spider.',
  },
};

// ─── UTIL ─────────────────────────────────────
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

function toast(msg, duration = 2400) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), duration);
}

function updateInventoryUI() {
  const slots = document.querySelectorAll('.inv-slot');
  slots.forEach((slot, i) => {
    const item = state.inventory[i];
    slot.innerHTML = item
      ? `${ITEMS[item].icon}<span class="inv-label">${ITEMS[item].name.split(' ')[0]}</span>`
      : '';
    slot.classList.toggle('filled', !!item);
  });
}

// ─── EXAMINE MODAL ────────────────────────────
let examineTarget = null;

function openExamine(itemKey) {
  examineTarget = itemKey;
  const item = ITEMS[itemKey];
  const modal = document.getElementById('examine-modal');
  document.getElementById('ex-icon').textContent = item.icon;
  document.getElementById('ex-name').textContent = item.name;
  document.getElementById('ex-desc').textContent = item.desc;

  const collectBtn = document.getElementById('ex-collect');
  const alreadyHave = state.inventory.includes(itemKey);
  if (item.collectible && !alreadyHave) {
    collectBtn.style.display = 'inline-block';
    collectBtn.textContent = 'Take it';
    collectBtn.disabled = false;
  } else if (alreadyHave) {
    collectBtn.style.display = 'inline-block';
    collectBtn.textContent = 'In your bag';
    collectBtn.disabled = true;
  } else {
    collectBtn.style.display = 'none';
    collectBtn.disabled = false;
  }
  modal.classList.add('open');
}

function closeExamine() {
  document.getElementById('examine-modal').classList.remove('open');
  examineTarget = null;
  document.getElementById('ex-collect').disabled = false;
}

function collectItem() {
  if (!examineTarget) return;
  const key = examineTarget;
  if (state.inventory.includes(key)) return;
  if (state.inventory.length >= COLLECT_LIMIT) { toast('Your bag is full'); return; }
  state.inventory.push(key);
  const el = document.querySelector(`[data-item="${key}"]`);
  if (el) el.classList.add('collected');
  updateInventoryUI();
  toast(`✦ ${ITEMS[key].name} taken`);
  closeExamine();
}

// ─── PAN MECHANICS ───────────────────────────
function getMaxPan() {
  return Math.max(0, ROOM_WIDTH - window.innerWidth);
}

// FIX 3: Write transform only inside rAF
function applyPan(x) {
  state.pan = clamp(x, 0, getMaxPan());
  document.getElementById('room-canvas').style.transform = `translateX(${-state.pan}px)`;
}

function momentumLoop() {
  if (Math.abs(state.velocity) < 0.4) { state.velocity = 0; return; }
  state.velocity *= 0.91;
  applyPan(state.pan + state.velocity);
  state.rafId = requestAnimationFrame(momentumLoop);
}

// FIX 3: throttle move updates to animation frames
function scheduleMove() {
  if (state.panRafId) return;
  state.panRafId = requestAnimationFrame(() => {
    state.panRafId = null;
    if (state.pendingX === null) return;
    const clientX = state.pendingX;
    const now = performance.now();
    const dt = now - state.lastT || 1;
    const dx = clientX - state.lastX;
    state.velocity = (dx / dt) * 16;
    state.lastX = clientX;
    state.lastT = now;
    applyPan(state.panAtDrag - (clientX - state.dragStartX));
    state.pendingX = null;
  });
}

function startDrag(clientX) {
  cancelAnimationFrame(state.rafId);
  cancelAnimationFrame(state.panRafId);
  state.panRafId = null;
  state.isDragging = true;
  state.dragStartX = clientX;
  state.panAtDrag = state.pan;
  state.lastX = clientX;
  state.lastT = performance.now();
  state.velocity = 0;
  dragMoved = 0;
  document.getElementById('room-canvas').classList.add('grabbing');
  if (!state.hintDone) {
    document.getElementById('drag-hint').style.display = 'none';
    state.hintDone = true;
  }
}

function moveDrag(clientX) {
  if (!state.isDragging) return;
  dragMoved += Math.abs(clientX - (state.lastX || clientX));
  state.pendingX = clientX;
  scheduleMove();
}

function endDrag() {
  state.isDragging = false;
  state.pendingX = null;
  document.getElementById('room-canvas').classList.remove('grabbing');
  momentumLoop();
}

// ─── EVENT BINDING ────────────────────────────
function bindEvents() {
  const canvas = document.getElementById('room-canvas');

  // ── Mouse ──
  canvas.addEventListener('mousedown', e => { e.preventDefault(); startDrag(e.clientX); });
  window.addEventListener('mousemove', e => { if (state.isDragging) moveDrag(e.clientX); });
  window.addEventListener('mouseup', () => { if (state.isDragging) endDrag(); });

  // ── Touch — FIX 5: passive listeners so scroll never fights pan ──
  canvas.addEventListener('touchstart', e => {
    startDrag(e.touches[0].clientX);
  }, { passive: true });

  // FIX 5: passive touchmove — we never call preventDefault anyway
  window.addEventListener('touchmove', e => {
    if (state.isDragging) moveDrag(e.touches[0].clientX);
  }, { passive: true });

  window.addEventListener('touchend', () => {
    if (state.isDragging) endDrag();
  }, { passive: true });

  // ── Object taps — FIX 6: use pointerup for crisp response ──
  canvas.addEventListener('pointerup', e => {
    // Only fire if this was a tap (not a drag)
    if (dragMoved > DRAG_THRESHOLD) return;
    if (Math.abs(state.velocity) > 2) return;
    const obj = e.target.closest('[data-item]');
    if (obj) openExamine(obj.dataset.item);
  });

  // ── Modal ──
  document.getElementById('ex-collect').addEventListener('click', collectItem);
  document.getElementById('ex-close').addEventListener('click', closeExamine);
  document.getElementById('examine-modal').addEventListener('pointerdown', e => {
    if (e.target === e.currentTarget) closeExamine();
  });

  // ── FIX 1: Google Fonts load non-blocking — handled in HTML with display=swap ──
  // ── Title screen ──
  document.getElementById('enter-btn').addEventListener('click', () => {
    document.getElementById('title-screen').classList.remove('active');
    document.getElementById('game-screen').classList.add('active');
    applyPan(0);
  });

  // ── Keyboard shortcut: Escape closes modal ──
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeExamine();
  });
}

// ─── INIT ─────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  bindEvents();
  updateInventoryUI();
});
