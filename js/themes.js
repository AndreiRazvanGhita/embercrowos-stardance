export const THEMES = [
  { name: 'ember', accent: '#ff5c2b' },
  { name: 'phosphor', accent: '#33ff66' },
  { name: 'cyber', accent: '#33ccff' },
];

export function getNextTheme(currentName, themes = THEMES) {
  const index = themes.findIndex((theme) => theme.name === currentName);
  if (index === -1) {
    return themes[0];
  }
  return themes[(index + 1) % themes.length];
}
