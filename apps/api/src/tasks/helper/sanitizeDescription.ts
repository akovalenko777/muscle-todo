import sanitizeHtml from 'sanitize-html'

const ALLOWED_TAGS = ['p', 'strong', 'em', 'ul', 'ol', 'li', 'code', 'pre', 'br', 'a']

export function sanitizeDescription(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: { a: ['href'] },
    allowedSchemes: ['http', 'https', 'mailto'],
  })
}