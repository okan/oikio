export function stripHtmlToPlainText(html: string): string {
  if (!html) return ''
  let s = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
  s = s.replace(/<\/(p|div|br|h[1-6]|li|tr|blockquote|pre)>/gi, ' ')
  s = s.replace(/<br\s*\/?>/gi, ' ')
  s = s.replace(/<[^>]+>/g, ' ')
  s = s.replace(/&nbsp;/gi, ' ')
  s = s.replace(/&amp;/gi, '&')
  s = s.replace(/&lt;/gi, '<')
  s = s.replace(/&gt;/gi, '>')
  s = s.replace(/&quot;/gi, '"')
  s = s.replace(/&#39;/g, "'")
  s = s.replace(/\s+/g, ' ').trim()
  return s
}

export function extractMatchSnippet(
  plainText: string,
  query: string,
  contextBefore = 40,
  contextAfter = 72
): string | undefined {
  const q = query.trim()
  if (!q || !plainText) return undefined
  const lowerPlain = plainText.toLowerCase()
  const lowerQ = q.toLowerCase()
  const idx = lowerPlain.indexOf(lowerQ)
  if (idx === -1) return undefined
  const start = Math.max(0, idx - contextBefore)
  const end = Math.min(plainText.length, idx + q.length + contextAfter)
  let slice = plainText.slice(start, end).trim()
  if (start > 0) slice = `…${slice}`
  if (end < plainText.length) slice = `${slice}…`
  return slice
}
