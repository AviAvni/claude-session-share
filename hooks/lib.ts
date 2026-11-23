// Pure helpers: no `$`, so the tests can call them directly.

export type Doc = { id: string; data: Record<string, unknown>; version: number }

/**
 * Reads the documents out of an ArtifactData read result. The tool answers in
 * text: a count line, then one JSON document per line between BEGIN/END
 * markers. Anything else is reported, never silently read as "no documents".
 */
export function parseDocs(text: string): { docs: Doc[]; error?: string } {
  const first = (text.split('\n')[0] ?? '').trim()
  if (/^(no documents?\b|0 documents)/i.test(first)) return { docs: [] }
  if (!/^\d+ documents? (from|in) /i.test(first)) {
    return { docs: [], error: `unrecognized ArtifactData output: ${first.slice(0, 120)}` }
  }
  const docs: Doc[] = []
  let inside = false
  for (const line of text.split('\n')) {
    if (line.startsWith('=== BEGIN ARTIFACT DB')) inside = true
    else if (line.startsWith('=== END ARTIFACT DB')) inside = false
    else if (inside && line.startsWith('{')) {
      try {
        const d = JSON.parse(line)
        if (d && typeof d.id === 'string' && d.data && typeof d.data === 'object') docs.push(d)
      } catch {
        return { docs, error: 'a document line was not valid JSON' }
      }
    }
  }
  const want = Number(/^(\d+)/.exec(first)?.[1] ?? docs.length)
  if (docs.length !== want) return { docs, error: `expected ${want} documents, read ${docs.length}` }
  return { docs }
}

/** The document version a write result reports ("now at version 3"). */
export const versionIn = (text: string): number => Number(/version (\d+)/.exec(text)?.[1] ?? 0)

/** A write the database refused, or a tool error, by its first line. */
export const isFailure = (text: string): boolean => /failed|refused|error|not found/i.test(text.split('\n')[0] ?? '')

export const slug = (s: string): string =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60) || 'someone'

// ---- redaction ------------------------------------------------------------------

const SECRET_PATTERNS: Array<[RegExp, string]> = [
  [/-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/g, '[private key]'],
  [/\b(gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,})\b/g, '[github token]'],
  [/\bsk-ant-[A-Za-z0-9_-]{20,}/g, '[anthropic key]'],
  [/\bsk-[A-Za-z0-9_-]{20,}/g, '[api key]'],
  [/\bAKIA[0-9A-Z]{16}\b/g, '[aws key]'],
  [/\bxox[abprs]-[A-Za-z0-9-]{10,}/g, '[slack token]'],
  [/\beyJ[A-Za-z0-9_-]{8,}\.eyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}/g, '[jwt]'],
  [/\b(Bearer|Basic)\s+[A-Za-z0-9._~+/=-]{16,}/g, '$1 [redacted]'],
  [/:\/\/([^:/\s@]+):([^@\s]+)@/g, '://$1:[redacted]@'],
  [/\b((?:api[_-]?key|secret|token|passw(?:or)?d|pwd|auth)[A-Za-z0-9_]*\s*[=:]\s*)(["']?)[^\s"']{4,}\2/gi, '$1$2[redacted]$2'],
]

/** Removes things that look like credentials from text before it is published. */
export function redact(text: string): string {
  let out = text
  for (const [re, sub] of SECRET_PATTERNS) out = out.replace(re, sub)
  return out
}

// ---- git change summaries -------------------------------------------------------

export type FileChange = { path: string; add: number; del: number; isNew?: boolean; isBinary?: boolean }

/** `git diff --numstat` lines into changes ("-\t-\tpath" is a binary file). */
export function parseNumstat(out: string): FileChange[] {
  const files: FileChange[] = []
  for (const line of out.split('\n')) {
    const m = /^(-|\d+)\t(-|\d+)\t(.+)$/.exec(line)
    if (!m) continue
    const [, a, d, path] = m
    files.push({ path: path!, add: a === '-' ? 0 : Number(a), del: d === '-' ? 0 : Number(d), ...(a === '-' ? { isBinary: true } : {}) })
  }
  return files
}

export const changesKey = (files: FileChange[]): string =>
  files
    .map(f => `${f.path}:${f.add}:${f.del}:${f.isNew ? 'n' : ''}`)
    .sort()
    .join('|')

export function changesLine(files: FileChange[]): string {
  const add = files.reduce((n, f) => n + f.add, 0)
  const del = files.reduce((n, f) => n + f.del, 0)
  return `${files.length} file${files.length === 1 ? '' : 's'} changed, +${add} −${del}`
}

// ---- text helpers ---------------------------------------------------------------

export const clip = (s: string, n: number): string => (s.length > n ? `${s.slice(0, n)} …` : s)

/** What a tool call shows in the room: never file contents, only what was touched. */
export function toolSummary(tool: string, input: Record<string, unknown>): string {
  const s = (k: string) => (typeof input[k] === 'string' ? (input[k] as string) : '')
  if (tool === 'Bash') return clip(redact(s('command')), 300)
  if (['Edit', 'Write', 'MultiEdit', 'NotebookEdit', 'Read'].includes(tool)) return s('file_path') || s('notebook_path')
  return clip(redact(s('pattern') || s('description') || s('url') || s('query') || s('prompt') || ''), 200)
}
