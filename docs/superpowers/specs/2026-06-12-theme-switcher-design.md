# Theme Switcher — Design

## Summary

Add a taskbar control that cycles the desktop through three color themes
(Ember, Phosphor, Cyber) by swapping CSS custom properties. Fits the
existing "pure logic + thin DOM glue" architecture used by the window
manager and living mascot.

## Architecture

- **`js/themes.js`** (new, pure module, no DOM):
  - `THEMES`: an ordered array of theme definitions, each
    `{ name, accent }` (see Themes section below). `name` is a short
    identifier (`'ember'`, `'phosphor'`, `'cyber'`) used as the
    `data-theme` attribute value and matched against CSS.
  - `getNextTheme(currentName, themes = THEMES)`: pure function that
    returns the theme object following `currentName` in the array,
    wrapping to the first entry after the last. If `currentName` is not
    found (e.g. `undefined`/initial state), returns `themes[0]`.

- **`js/main.js`** (existing, thin glue):
  - Tracks current theme name in a local variable, initialized to
    `THEMES[0].name` (`'ember'`).
  - On taskbar theme-button click: compute `getNextTheme(currentThemeName)`,
    update the local variable, and set
    `document.body.dataset.theme = nextTheme.name`.
  - No initial `data-theme` attribute is set on load — the default CSS
    (`:root`) values represent Ember, so the desktop starts in Ember
    without needing JS to apply it.

- **`index.html`**: add a theme-toggle button element inside `#taskbar`,
  near `#taskbar-clock`.

- **`style.css`**: add `body[data-theme="phosphor"]` and
  `body[data-theme="cyber"]` blocks that override `--accent` (and
  `--bg`/`--fg` only if needed for contrast — see Themes section).

## Themes

All three themes keep the existing dark background and light foreground
text for readability; only the accent color (and anything derived from
it, like the mascot's glow) changes.

| Theme    | `--bg`    | `--fg`    | `--accent` |
|----------|-----------|-----------|------------|
| Ember (default) | `#0a0a0a` | `#e0e0e0` | `#ff5c2b` |
| Phosphor | `#0a0a0a` | `#e0e0e0` | `#33ff66` |
| Cyber    | `#0a0a0a` | `#e0e0e0` | `#33ccff` |

Because every accent-colored element in `style.css` (borders, highlights,
terminal cursor, the living mascot's eye glow at line 430, etc.) already
reads from `var(--accent)`, switching themes automatically re-colors all
of these — no per-component changes needed.

## Taskbar Control

A small bracket-style button consistent with the existing app icon
convention (`>_`, `[/]`, `(i)`, `[=]`, `(>)`). Use `[*]` as the icon, with
a `title` attribute ("Switch theme") for discoverability. Placed between
`#taskbar-apps` and `#taskbar-clock`. Clicking it cycles
Ember → Phosphor → Cyber → Ember.

## Behavior Notes

- Theme resets to Ember on every page reload (no persistence). The theme
  button only appears/works once the desktop is shown — boot and login
  always play in Ember, since `data-theme` starts unset on every load.

## Testing

- `tests/themes.test.js`: unit tests for `getNextTheme`
  - cycles ember → phosphor → cyber → ember (wraparound)
  - returns `THEMES[0]` when given an unrecognized/undefined current name
  - works with a custom `themes` array (for isolation from the real list)

## Out of Scope

- Persisting theme choice across reloads (explicitly deferred).
- More than 3 themes.
- Per-app theme overrides.
