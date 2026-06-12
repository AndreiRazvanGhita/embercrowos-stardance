const STORAGE_KEY = 'embercrow-notes';

export function createNotesStore(storage) {
  return {
    load() {
      return storage.getItem(STORAGE_KEY) ?? '';
    },
    save(text) {
      storage.setItem(STORAGE_KEY, text);
    },
  };
}

export const notesApp = {
  id: 'notes',
  title: 'Notes',
  icon: '[=]',
  defaultSize: { width: 400, height: 300 },
  createContent(container) {
    container.classList.add('app-notes');

    const store = createNotesStore(window.localStorage);
    const textarea = document.createElement('textarea');
    textarea.className = 'notes-textarea';
    textarea.value = store.load();
    textarea.placeholder = 'Write something...';

    textarea.addEventListener('input', () => {
      store.save(textarea.value);
    });

    container.appendChild(textarea);
  },
};
