import TurndownService from 'turndown';
import { marked } from 'marked';

const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  hr: '---',
  bulletListMarker: '-',
});

// Configure table support in turndown if tables exist
turndownService.addRule('tableCell', {
  filter: ['th', 'td'],
  replacement: function (content, node) {
    return ' ' + content.trim().replace(/\n/g, ' ') + ' |';
  },
});

turndownService.addRule('tableRow', {
  filter: 'tr',
  replacement: function (content, node) {
    let output = '|' + content + '\n';
    const parent = node.parentNode;
    // Check if it's the header row to insert separator
    if (parent && (parent.nodeName === 'THEAD' || node === parent.firstElementChild)) {
      const cells = node.querySelectorAll('th, td');
      let separator = '|';
      for (let i = 0; i < cells.length; i++) {
        separator += ' --- |';
      }
      output += separator + '\n';
    }
    return output;
  },
});

turndownService.addRule('table', {
  filter: 'table',
  replacement: function (content) {
    return '\n\n' + content.trim() + '\n\n';
  },
});

// Suporte a Task Lists (Checklists) no Turndown
turndownService.addRule('taskItem', {
  filter: function (node) {
    return (
      node.nodeName === 'LI' &&
      (node.getAttribute('data-type') === 'taskItem' || node.classList.contains('task-list-item'))
    );
  },
  replacement: function (content, node) {
    const isChecked =
      node.getAttribute('data-checked') === 'true' ||
      (node.querySelector('input[type="checkbox"]') as HTMLInputElement)?.checked;
    const cleanContent = content.trim().replace(/^\[[ xX]\]\s*/, '');
    return (isChecked ? '- [x] ' : '- [ ] ') + cleanContent + '\n';
  },
});

/**
 * Converte HTML gerado pelo editor para Markdown (.md)
 */
export function htmlToMarkdown(html: string): string {
  if (!html) return '';
  return turndownService.turndown(html);
}

/**
 * Converte Markdown para HTML para renderização no Tiptap
 */
export function markdownToHtml(markdown: string): string {
  if (!markdown) return '';
  return marked.parse(markdown) as string;
}

/**
 * Dispara o download de um arquivo .md no navegador
 */
export function downloadMarkdownFile(filename: string, content: string) {
  const safeName = (filename || 'instrucao')
    .replace(/[^\w\sáàâãéèêíïóôõöúçñÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ-]/gi, '')
    .trim()
    .replace(/\s+/g, '_');
  
  const finalFilename = safeName.endsWith('.md') ? safeName : `${safeName}.md`;
  
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = finalFilename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
