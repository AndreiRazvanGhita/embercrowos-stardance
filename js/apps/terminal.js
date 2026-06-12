import { MASCOT_SMALL } from '../mascot.js';

const HELP_LINES = [
  'Available commands:',
  '  help     - show this help text',
  '  about    - about EMBERCROW OS',
  '  ls       - list files in the current directory',
  '  whoami   - print the current user',
  '  date     - print the current date and time',
  '  crow     - display the EMBERCROW mascot',
  '  clear    - clear the terminal',
];

const LS_LINES = ['projects/', 'logs/', 'secrets.txt', 'notes.txt'];

export function runCommand(input, { now = () => new Date(), mascot = MASCOT_SMALL } = {}) {
  const cmd = input.trim();
  switch (cmd) {
    case '':
      return { lines: [] };
    case 'help':
      return { lines: HELP_LINES };
    case 'about':
      return { lines: ['EMBERCROW OS v1.0', 'A hacker-themed web desktop.'] };
    case 'ls':
      return { lines: LS_LINES };
    case 'whoami':
      return { lines: ['embercrow'] };
    case 'date':
      return { lines: [now().toString()] };
    case 'crow':
      return { lines: mascot.split('\n') };
    case 'clear':
      return { lines: [], clear: true };
    default:
      return { lines: [`command not found: ${cmd}`] };
  }
}

export const terminalApp = {
  id: 'terminal',
  title: 'Terminal',
  icon: '>_',
  defaultSize: { width: 480, height: 320 },
  createContent(container) {
    container.classList.add('app-terminal');

    const output = document.createElement('div');
    output.className = 'terminal-output';

    const inputLine = document.createElement('div');
    inputLine.className = 'terminal-input-line';
    const prompt = document.createElement('span');
    prompt.textContent = 'embercrow:~$ ';
    const input = document.createElement('input');
    input.className = 'terminal-input';
    input.setAttribute('autocomplete', 'off');
    inputLine.append(prompt, input);

    container.append(output, inputLine);

    const printLines = (lines) => {
      for (const line of lines) {
        const lineEl = document.createElement('div');
        lineEl.textContent = line;
        output.appendChild(lineEl);
      }
      output.scrollTop = output.scrollHeight;
    };

    printLines(['EMBERCROW OS Terminal v1.0', 'Type "help" for a list of commands.', '']);

    input.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter') return;
      const value = input.value;
      const echo = document.createElement('div');
      echo.textContent = `embercrow:~$ ${value}`;
      output.appendChild(echo);

      const result = runCommand(value);
      if (result.clear) {
        output.innerHTML = '';
      } else {
        printLines(result.lines);
      }
      input.value = '';
    });

    input.focus();
  },
};
