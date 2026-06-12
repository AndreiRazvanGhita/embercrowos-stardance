export const fileTree = {
  name: 'embercrow',
  type: 'folder',
  children: [
    {
      name: 'projects',
      type: 'folder',
      children: [
        {
          name: 'embercrow-os.txt',
          type: 'file',
          content: 'status: in progress\nnext: polish the boot sequence',
        },
      ],
    },
    {
      name: 'logs',
      type: 'folder',
      children: [
        {
          name: 'boot.log',
          type: 'file',
          content: '[ OK ] kernel loaded\n[ OK ] shell ready',
        },
      ],
    },
    { name: 'secrets.txt', type: 'file', content: 'there are no secrets. only static.' },
    { name: 'notes.txt', type: 'file', content: 'see the Notes app for your real notes' },
  ],
};

export function findNode(tree, path) {
  if (path.length === 0) return tree;
  if (tree.type !== 'folder') return null;
  const [head, ...rest] = path;
  const child = tree.children.find((c) => c.name === head);
  if (!child) return null;
  return findNode(child, rest);
}

export const filesApp = {
  id: 'files',
  title: 'File Explorer',
  icon: '[/]',
  defaultSize: { width: 480, height: 340 },
  createContent(container) {
    container.classList.add('app-files');

    const tree = document.createElement('div');
    tree.className = 'files-tree';

    const view = document.createElement('pre');
    view.className = 'files-view';
    view.textContent = 'Select a file to view its contents.';

    container.append(tree, view);

    const renderNode = (node, depth, parentEl) => {
      const item = document.createElement('div');
      item.className = 'files-item';
      item.style.paddingLeft = `${depth * 16}px`;

      if (node.type === 'folder') {
        item.textContent = `[+] ${node.name}/`;
        const childWrap = document.createElement('div');
        childWrap.style.display = 'none';

        item.addEventListener('click', () => {
          const isOpen = childWrap.style.display !== 'none';
          childWrap.style.display = isOpen ? 'none' : 'block';
          item.textContent = `${isOpen ? '[+]' : '[-]'} ${node.name}/`;
        });

        parentEl.append(item, childWrap);
        for (const child of node.children) {
          renderNode(child, depth + 1, childWrap);
        }
      } else {
        item.textContent = `    ${node.name}`;
        item.addEventListener('click', () => {
          view.textContent = node.content;
        });
        parentEl.append(item);
      }
    };

    for (const child of fileTree.children) {
      renderNode(child, 0, tree);
    }
  },
};
