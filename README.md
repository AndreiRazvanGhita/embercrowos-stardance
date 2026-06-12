# EMBERCROW OS

A hacker-themed web desktop you can run in your browser, complete with
draggable windows, a taskbar, a handful of built-in apps, and a living
mascot that watches you work.

## Quick start

```bash
python -m http.server 8000
```

Then open http://localhost:8000/ in a browser. No build step, no
dependencies — it's plain HTML/CSS/JS.

## Features

- **Draggable, resizable-feeling window manager** - open, move, focus,
  minimize, and close windows like a real desktop
- **Five built-in apps** - Terminal, File Explorer, About, Notes, and a
  synth-driven Music Player
- **Glitch-reveal boot sequence** - a retro boot/login intro that can be
  skipped with any key or click
- **Living mascot** - a glowing ember-eye watermark that tracks your
  cursor, blinks at random, and glows brighter the more windows you open
- **Idle presence** - leave the desktop alone for ~30 seconds and the
  mascot's eye narrows while a cryptic message appears beside it
- **Persistent Notes app** - text saved to `localStorage` between sessions
- **Theme switcher** - cycle the desktop between Ember, Phosphor, and Cyber
  color themes with the `[*]` taskbar button

## Running locally

Requirements:

- Any modern browser
- Python 3 (for the dev server) or any static file server
- [Node.js](https://nodejs.org/) 20+ (only needed to run the test suite)

```bash
python -m http.server 8000
```

Then open http://localhost:8000/ in a browser.

### Running tests

```bash
npm test
```

## How it works

The window manager, mascot, and presence logic are written as plain,
DOM-free modules (`js/windowManager.js`, `js/mascot.js`, `js/presence.js`)
that take inputs like cursor position, window count, and timestamps and
return pure data — offsets, glow intensity, idle state. The rendering
layer (`js/main.js` and the app modules) just reads that data and updates
the DOM. This split keeps the "interesting" logic (window clamping and
cascading, the mascot's cursor-tracking eye, idle-message timing) fully
unit-testable with Node's built-in test runner, without needing a browser
or DOM shims in CI.

## Apps

- **Terminal** (`>_`) - type `help` for a list of commands
- **File Explorer** (`[/]`) - browse a fake filesystem
- **About** (`(i)`) - system info and uptime
- **Notes** (`[=]`) - a text editor that saves to localStorage
- **Music** (`(>)`) - a synth arpeggio player with a visualizer

## Controls

- Drag a window by its title bar
- `[_]` minimizes to the taskbar, `[x]` closes
- Click a window or its taskbar entry to focus it
- Press any key or click during boot to skip the intro

## Credits

Built for the Stardance hackathon with heavy use of
[Claude Code](https://claude.com/claude-code) for design, implementation,
and testing.
