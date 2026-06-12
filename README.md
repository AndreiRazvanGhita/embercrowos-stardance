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
