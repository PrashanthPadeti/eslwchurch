/**
 * Renders the pastor's weekly message from Sanity's Portable Text format into
 * HTML that matches the site's typography.
 *
 * Portable Text is stored as structured blocks rather than an HTML string,
 * which means the pastor cannot accidentally paste markup that breaks the page
 * layout, and the same content could later be reused elsewhere — a printed
 * bulletin, an email — without unpicking HTML.
 *
 * Every element below takes its colours from the design tokens rather than
 * hardcoding them, so messages render correctly on the cream page.
 */

import { toHTML, type PortableTextOptions } from '@portabletext/to-html';

export type PortableTextBlock = Record<string, unknown>;

const options: PortableTextOptions = {
  components: {
    block: {
      normal: ({ children }) =>
        `<p class="mt-5 leading-[1.75] text-ink">${children}</p>`,
      h2: ({ children }) =>
        `<h2 class="mt-10 font-[family-name:var(--font-display)] text-2xl font-semibold text-blue-900">${children}</h2>`,
      h3: ({ children }) =>
        `<h3 class="mt-8 font-[family-name:var(--font-display)] text-xl font-semibold text-blue-900">${children}</h3>`,
      blockquote: ({ children }) =>
        `<blockquote class="my-8 border-l-3 border-gold-500 pl-5 font-[family-name:var(--font-display)] text-lg italic leading-relaxed text-blue-700 sm:pl-6">${children}</blockquote>`,
    },
    list: {
      bullet: ({ children }) =>
        `<ul class="mt-5 list-disc space-y-2 pl-6 text-ink">${children}</ul>`,
      number: ({ children }) =>
        `<ol class="mt-5 list-decimal space-y-2 pl-6 text-ink">${children}</ol>`,
    },
    listItem: {
      bullet: ({ children }) => `<li class="leading-relaxed">${children}</li>`,
      number: ({ children }) => `<li class="leading-relaxed">${children}</li>`,
    },
    marks: {
      strong: ({ children }) =>
        `<strong class="font-semibold text-blue-900">${children}</strong>`,
      em: ({ children }) => `<em class="italic">${children}</em>`,
      link: ({ children, value }) => {
        const href = String((value as { href?: string })?.href ?? '');
        // Anything off-site opens in a new tab and cannot reach back via
        // window.opener.
        const external = /^https?:\/\//i.test(href);
        const attrs = external
          ? ' target="_blank" rel="noopener noreferrer"'
          : '';
        return `<a href="${escapeAttr(href)}"${attrs} class="font-medium text-blue-700 underline underline-offset-4 hover:text-blue-500">${children}</a>`;
      },
    },
  },
  onMissingComponent: false,
};

function escapeAttr(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function renderMessageBody(blocks: PortableTextBlock[] | null | undefined): string {
  if (!blocks?.length) return '';
  try {
    return toHTML(blocks as never, options);
  } catch (err) {
    console.warn('[portabletext] could not render message body:', err);
    return '';
  }
}

/** Plain text, for meta descriptions and previews. */
export function messageExcerpt(
  blocks: PortableTextBlock[] | null | undefined,
  maxChars = 180,
): string {
  if (!blocks?.length) return '';
  const text = blocks
    .filter((b) => (b as { _type?: string })._type === 'block')
    .flatMap((b) => ((b as { children?: { text?: string }[] }).children ?? []))
    .map((c) => c.text ?? '')
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (text.length <= maxChars) return text;
  return text.slice(0, text.lastIndexOf(' ', maxChars)).trimEnd() + '…';
}
