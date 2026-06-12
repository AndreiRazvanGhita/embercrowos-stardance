# EMBERCROW OS

A hacker-themed, black & white web desktop with an ember-orange accent,
built with plain HTML/CSS/JS (no frameworks, no build step).

## Running locally

```bash
python -m http.server 8000
```

Then open http://localhost:8000/ in a browser.

## Running tests

```bash
npm test
```

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

## Ambient Features

- **Living mascot** - the desktop watermark's ember eye tracks your cursor,
  blinks at random, and glows brighter the more windows you have open
- **Idle presence** - leave the desktop untouched for ~30 seconds and the
  eye narrows while a cryptic message appears beside it; any input clears it
