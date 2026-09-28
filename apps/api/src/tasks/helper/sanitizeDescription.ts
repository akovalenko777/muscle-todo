import sanitizeHtml from 'sanitize-html'

const ALLOWED_TAGS = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'strong', 'b', 'em', 'i', 'ul', 'ol', 'li', 'code', 'pre', 'br', 'hr', 's', 'span', 'u']

export function sanitizeDescription(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: { p: ['style'], span: ['style'], h1: ['style'], h2: ['style'], h3: ['style'], h4: ['style'], h5: ['style'], h6: ['style'] },
    allowedStyles: {
      '*': {
        'color': [/^#(0x)?[0-9a-f]+$/i, /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/],
        'text-align': [/^left$/, /^right$/, /^center$/]
      }
    }
  })
}

export function isContainText(html: string): boolean {
  return sanitizeHtml(html, {
    allowedTags: []
  }).trim().length !== 0
}