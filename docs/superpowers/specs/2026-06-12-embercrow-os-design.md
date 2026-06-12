# EMBERCROW OS — Design Spec

## Overview

EMBERCROW OS is a web-based desktop OS built for the Stardance "WebOS 1" mission.
It's a hacker-themed, strictly black & white desktop with a single ember
orange/red accent color, blending a modern minimal aesthetic with retro
terminal touches (monospace fonts, CRT scanlines, blinking cursors). The
mascot is a large bird-of-prey silhouette ("the Embercrow") with a glowing
ember eye, introduced during a boot/login sequence.

Built with plain HTML/CSS/JS — no frameworks, no build tools.

## Project Structure

```
stardance-webos/
├── index.html          # shell: boot screen + desktop + taskbar containers
├── style.css           # theme, desktop layout, window chrome, boot animation
├── js/
│   ├── boot.js          # plays boot/login sequence, then reveals desktop
│   ├── windowManager.js # generic: create/drag/focus/close/minimize windows
│   ├── apps.js          # app registry (config for each app's title/icon/content)
│   └── apps/
│       ├── terminal.js  # terminal command parsing + output
│       ├── files.js     # fake file explorer tree
│       ├── about.js     # profile/system-info readout
│       ├── music.js     # audio player + visualizer
│       └── notes.js     # text editor (localStorage save)
└── assets/              # icons, fonts, audio files, etc.
```

`index.html` loads scripts via plain `<script src="...">` tags in dependency
order (windowManager.js, then apps/*.js, then apps.js, then boot.js).
`windowManager.js` is generic and knows nothing about specific apps — it
renders whatever content an app's builder function returns into a draggable
window frame. Each app module self-registers with `apps.js`. This lets each
app be built and demoed independently (useful for devlog checkpoints).

## Visual Theme

**Colors**
- Background: near-black `#0a0a0a`
- Primary text/borders: off-white `#e0e0e0`
- Accent (single color, used sparingly): ember orange/red `#ff5c2b` —
  used for the mascot's eye, blinking cursors, focused-window glow/outline,
  and small UI highlights (e.g. `[ OK ]` tags in boot log)

**Typography**
- Monospace throughout (e.g. "JetBrains Mono" / "Fira Code" via Google
  Fonts, with system monospace fallback)
- A secondary display font ("Orbitron" via Google Fonts) is used only for
  the "EMBERCROW OS" boot splash title — angular, geometric, sci-fi feel,
  rendered large with ember-colored glow/flicker. All other text (windows,
  taskbar, terminal, boot log) stays monospace.

**Window chrome**
- Sharp 1px borders, no rounded corners, no traditional drop shadows
- Focused window gets an ember-colored glow/outline; unfocused windows are
  plain off-white borders
- Title bars: flat, dark, with text-style `[_]` (minimize) and `[x]` (close)
  controls

**Retro touches layered on the modern base**
- Subtle low-opacity CRT scanline overlay across the whole screen
- Blinking cursor block (`█`) in Terminal and as a loading indicator
- Text glow/flicker animation on boot sequence text and focused window titles

**Desktop background**
- Plain black, with the full EMBERCROW mascot silhouette (`MASCOT_LARGE`)
  rendered centered behind the desktop icons/windows at low opacity
  (~5-8%, off-white `--fg` color), static, non-interactive
  (`pointer-events: none`) — a subtle watermark rather than a distracting
  graphic

## Identity — EMBERCROW OS

The mascot is a large bird-of-prey silhouette rendered in a dot-density /
ASCII style (filled block shapes against a noise-textured background), with
a single glowing ember-orange eye. It appears during the boot sequence and
as a small icon in the taskbar / About app.

## Window Manager Behavior

- **Dragging**: click-and-hold title bar to move; window position is
  clamped so it can't be dragged fully off-screen
- **Focus**: clicking a window (or its taskbar entry) raises its z-index
  and applies the ember glow outline; unfocused windows stay plain
  black/white
- **Controls**: `[_]` minimizes to the taskbar, `[x]` closes the window
- **Taskbar**: fixed bottom bar — EMBERCROW branding + small mascot icon on
  the left, open/minimized app entries in the middle, live clock on the
  right
- **Opening apps**: double-clicking a desktop icon spawns a new window
  instance for that app, cascaded slightly from the previous one so
  multiple windows don't perfectly overlap
- **Resizing**: out of scope for v1 — each app window has a fixed default
  size

## Boot/Login Sequence (new feature beyond the guide)

A full-screen black overlay (`#boot-screen`) plays before the desktop is
shown:

1. **Scrolling boot log** — fake system messages typed line-by-line with a
   short delay (e.g. `Initializing kernel modules...`,
   `Mounting //embercrow/root...`, `Establishing secure shell...`), with
   ember-colored `[ OK ]` / `[WARN]` tags
2. **Splash reveal** — the boot log fades out and the overlay enters a
   "splash" mode: the full EMBERCROW ASCII mascot (`MASCOT_LARGE`) and an
   "EMBERCROW OS" title (Orbitron display font, ember glow) animate into a
   centered, full-screen layout via a glitch/scanline effect — CSS
   keyframes drive jitter on position/opacity/clip-path plus a scanline
   sweep, with a few randomized extra jitter-class toggles from JS for
   irregularity. The mascot's ember eye flickers. Holds briefly once
   settled.
3. **Login prompt** — a cosmetic `login:` / `access granted` exchange
   fades in over/below the splash, types itself out automatically — no
   real authentication, no password
4. **Transition** — overlay fades out / collapses with a CRT-style
   scanline effect, revealing the desktop

The sequence is skippable (any key/click) so repeat visits aren't annoying.
Implemented in `boot.js`, runs on `DOMContentLoaded`, hides itself when
done or skipped.

## Apps

1. **Terminal** — type commands, get hacker-flavored output. Supported
   commands: `help`, `about`, `ls`, `whoami`, `date`, `clear`, plus an
   Easter egg (`crow` prints the ASCII mascot). Unknown commands print
   `command not found: <cmd>`.
2. **File Explorer** — static fake folder/file tree (e.g.
   `/home/embercrow/` with `projects`, `logs`, `secrets.txt`); clicking a
   file shows fake contents in a text view. No real filesystem access.
3. **About/Profile** — `neofetch`-style readout: small ASCII mascot plus
   info about the project/author (name, OS version, "uptime", links).
4. **Music Player** — retro player UI (play/pause, track name, progress
   bar) with a Web Audio API-driven bar/waveform visualizer; one or two
   royalty-free tracks.
5. **Notes** — `<textarea>`-based text editor; content auto-saves to
   `localStorage` and persists across reloads.

Each app is a self-contained module in `js/apps/`, registering a title,
icon (small ASCII/text glyph), default window size, and a content-builder
function with `apps.js`.

## Mission Requirements Mapping

1. Multiple draggable windows → Window Manager + 5 apps
2. Looks like your own, not the guide → EMBERCROW OS identity, theme,
   mascot, boot sequence
3. 3+ devlogs → suggested checkpoints: (1) window manager + desktop shell
   working, (2) Terminal/Files/About/Music/Notes apps added, (3) boot
   sequence + theme polish
4. New feature beyond the guide → boot/login sequence
5. No password → boot "login" is purely cosmetic, auto-completes, no real
   auth

## Out of Scope (v1)

- Window resizing
- Real file system / multi-user accounts
- Server-side anything (fully static site)
