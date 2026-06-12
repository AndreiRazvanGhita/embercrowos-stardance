# Living Mascot Presence — Design Spec

## Overview

This is the "wow factor" feature for EMBERCROW OS: the desktop's background
mascot watermark isn't a static silhouette — it's alive. The EMBERCROW's
ember eye subtly tracks the cursor, blinks at random, and reacts when the
user goes idle, while its glow responds to how many windows are open. It's
a purely ambient/atmospheric layer on top of the existing desktop — no new
app, no gameplay, nothing that blocks or interrupts other work.

This spec extends `docs/superpowers/specs/2026-06-12-embercrow-os-design.md`
and implements (and elaborates on) the "Desktop background" watermark
described there.

## Visual Structure

The desktop renders `MASCOT_LARGE` centered behind the desktop icons/windows
as a low-opacity (~5-8%, off-white `--fg`), static, non-interactive
(`pointer-events: none`) watermark — per the existing design spec.

The twist: the mascot's ember eye marker (the `o` character in
`MASCOT_LARGE`) is rendered as its own `<span class="embercrow-eye">`
element rather than being part of the same opaque text run. Since it's
inline inside the same monospace `<pre>` as the rest of the mascot, it sits
in exactly the correct position with no manual pixel offsets — but it can
now be independently styled (full ember-orange opacity + glow) and animated
(transform, box-shadow) while the rest of the mascot stays a faint
silhouette.

Splitting the mascot string into "everything before the eye marker" / "eye
marker" / "everything after" is a pure, testable string operation.

## Behaviors

### Eye-tracking (parallax)
On `mousemove`, the eye's `transform: translate(x, y)` shifts slightly
toward the cursor. The offset is proportional to the cursor's position
relative to the viewport center, clamped to a small maximum (e.g. ±8px), so
the motion reads as a subtle "it's looking at you" effect rather than the
eye visibly relocating.

### Blinking
At random intervals (~4-9 seconds), the eye plays a quick blink animation:
`scaleY(1)` → `scaleY(0.1)` → `scaleY(1)` over ~150ms. The next blink delay
is re-randomized after each blink.

### Idle awareness
Any `mousemove`, `keydown`, or `click` resets an idle timer. After ~30
seconds without input:
- The eye's glow dims and it holds a narrowed `scaleY` (a sustained
  "watching" squint) instead of blinking normally.
- One line from a small pool of cryptic ambient messages (e.g. "...still
  there?", "signal idle.", "the embercrow waits.") fades in near the eye,
  holds briefly, and fades out.

Any input immediately clears the idle state and resumes normal
blink/tracking behavior.

### Reactive glow (system "vitals" touch)
The eye's glow intensity and pulse speed scale with the number of currently
open windows (read from `WindowManager.windows.length`):
- 0 windows open → baseline glow/pulse.
- Each additional open window increases glow intensity, up to a capped
  maximum (so it never becomes distracting).

This is purely visual feedback — it has no effect on window behavior and no
window reacts to it.

## Module Structure

### `js/presence.js` (pure logic, unit tested)

- `splitMascotAtEye(mascotArt, marker = 'o')` → `{ before, eye, after }`
  — splits the mascot string at the **first** occurrence of the eye marker
  so it can be rendered as three text/element pieces. Throws or returns
  `null` `eye` if the marker isn't found (shouldn't happen given
  `MASCOT_LARGE` always contains `o`, but keep the function honest).

- `calculateEyeOffset(cursorX, cursorY, viewportW, viewportH, maxOffset)` →
  `{ x, y }` — returns a translation offset proportional to the cursor's
  position relative to viewport center, clamped to `[-maxOffset, maxOffset]`
  on each axis.

- `getGlowIntensity(openWindowCount, { base = 0.4, step = 0.12, max = 1.0 } = {})`
  → number — `Math.min(max, base + openWindowCount * step)`.

- `isIdle(lastActivityMs, nowMs, idleThresholdMs)` → boolean —
  `nowMs - lastActivityMs >= idleThresholdMs`.

- `pickIdleMessage(messages, randomFn = Math.random)` → string — picks one
  entry from `messages` using `randomFn()`.

- `getNextBlinkDelay(randomFn = Math.random, minMs = 4000, maxMs = 9000)` →
  number — `minMs + randomFn() * (maxMs - minMs)`.

### DOM wiring (in `js/main.js` or a small `initPresence` export)

After boot completes, `main.js`:
1. Renders the mascot watermark into the desktop using
   `splitMascotAtEye(MASCOT_LARGE)` — `before` and `after` as plain text
   nodes, `eye` wrapped in `<span class="embercrow-eye">`.
2. Calls `initPresence(mascotContainer, eyeEl, wm)`, which:
   - Attaches `mousemove` → `calculateEyeOffset` → updates the eye's
     `transform`.
   - Attaches `mousemove`/`keydown`/`click` → resets `lastActivityMs`.
   - Runs a `setInterval` (e.g. every 1s) that checks `isIdle(...)`; on
     entering/leaving idle, toggles an `idle` class on the eye and shows/
     hides an ambient message element using `pickIdleMessage`.
   - Schedules blinks recursively via `setTimeout(blink, getNextBlinkDelay())`,
     skipping the blink animation while idle (squint takes over instead).
   - Recomputes `getGlowIntensity(wm.windows.length)` whenever a window
     opens/closes/minimizes (hook into the existing `openApp`/`closeWindow`/
     `minimizeWindow` flow in `main.js`) and writes it to a CSS custom
     property (e.g. `--presence-intensity`) consumed by the eye's
     `box-shadow`/glow styles.

### CSS additions (`style.css`)

- `.embercrow-eye` — ember-orange color, glow via `box-shadow` driven by
  `--presence-intensity`, `transition` for smooth tracking offsets.
- `@keyframes embercrow-blink` — the scaleY blink animation.
- `.embercrow-eye.idle` — narrowed/dimmed squint state.
- `.embercrow-ambient-message` — small fading text near the eye for idle
  messages.

## Testing

Unit tests (`tests/presence.test.js`) cover the five pure functions in
`js/presence.js`:
- `splitMascotAtEye` splits correctly and preserves total content
  (`before + eye + after` round-trips to the original string).
- `calculateEyeOffset` clamps correctly at viewport edges and returns
  `{x: 0, y: 0}` when the cursor is at the viewport center.
- `getGlowIntensity` scales linearly and caps at `max`.
- `isIdle` returns `false` just under the threshold and `true` at/over it.
- `pickIdleMessage` and `getNextBlinkDelay` return values from/within the
  expected set/range for boundary `randomFn` values (0 and just-under-1).

DOM/animation/timing behavior (tracking smoothness, blink visuals, idle
message fade, glow pulse) is verified manually in the browser, consistent
with how `boot.js` and window dragging are verified elsewhere in the
project.

## Out of Scope

- No gameplay or interactivity tied to the eye beyond ambient feedback.
- No eye movement beyond the small parallax offset (it does not "follow"
  the cursor across the screen).
- No sound/audio reactions.
- No changes to window manager behavior — `wm.windows.length` is read-only
  from the presence module's perspective.
