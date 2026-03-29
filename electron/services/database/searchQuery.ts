import type {
  Person,
  Meeting,
  ActionItem,
  SearchResults,
  SearchPersonHit,
  SearchMeetingHit,
  SearchActionHit,
} from '../../../src/types'
import { stripHtmlToPlainText, extractMatchSnippet } from '../../../src/lib/searchPlainText'

function personMatchesQuery(p: Person, lowerQuery: string): boolean {
  if ((p.name || '').toLowerCase().includes(lowerQuery)) return true
  if (stripHtmlToPlainText(p.notes || '').toLowerCase().includes(lowerQuery)) return true
  if (stripHtmlToPlainText(p.title || '').toLowerCase().includes(lowerQuery)) return true
  if (stripHtmlToPlainText(p.goals || '').toLowerCase().includes(lowerQuery)) return true
  return false
}

function buildPersonSearchHit(p: Person, rawQuery: string): SearchPersonHit {
  const lq = rawQuery.toLowerCase()
  const notesPlain = stripHtmlToPlainText(p.notes || '')
  const titlePlain = stripHtmlToPlainText(p.title || '')
  const goalsPlain = stripHtmlToPlainText(p.goals || '')
  const nameMatch = (p.name || '').toLowerCase().includes(lq)
  const fieldMatch =
    notesPlain.toLowerCase().includes(lq) ||
    titlePlain.toLowerCase().includes(lq) ||
    goalsPlain.toLowerCase().includes(lq)
  if (nameMatch && !fieldMatch) {
    return { ...p }
  }
  for (const plain of [notesPlain, goalsPlain, titlePlain]) {
    if (!plain.toLowerCase().includes(lq)) continue
    const snippet = extractMatchSnippet(plain, rawQuery)
    if (snippet) return { ...p, searchSnippet: snippet }
    const short = plain.slice(0, 120).trim()
    return { ...p, searchSnippet: plain.length > 120 ? `${short}…` : short }
  }
  return { ...p }
}

function meetingMatchesQuery(m: Meeting, lowerQuery: string): boolean {
  if ((m.title || '').toLowerCase().includes(lowerQuery)) return true
  if (stripHtmlToPlainText(m.notes || '').toLowerCase().includes(lowerQuery)) return true
  if (stripHtmlToPlainText(m.talkingPoints || '').toLowerCase().includes(lowerQuery)) return true
  if (stripHtmlToPlainText(m.nextTopics || '').toLowerCase().includes(lowerQuery)) return true
  return false
}

function buildMeetingSearchHit(m: Meeting, rawQuery: string, personName?: string): SearchMeetingHit {
  const lq = rawQuery.toLowerCase()
  if (m.title?.toLowerCase().includes(lq)) {
    const t = m.title.trim()
    const snippet = extractMatchSnippet(t, rawQuery) || t
    return { ...m, personName, searchSnippet: snippet }
  }
  const blocks: { plain: string }[] = [
    { plain: stripHtmlToPlainText(m.notes || '') },
    { plain: stripHtmlToPlainText(m.talkingPoints || '') },
    { plain: stripHtmlToPlainText(m.nextTopics || '') },
  ]
  for (const { plain } of blocks) {
    if (!plain.toLowerCase().includes(lq)) continue
    const snippet = extractMatchSnippet(plain, rawQuery)
    if (snippet) return { ...m, personName, searchSnippet: snippet }
    const short = plain.slice(0, 120).trim()
    return {
      ...m,
      personName,
      searchSnippet: plain.length > 120 ? `${short}…` : short,
    }
  }
  return { ...m, personName }
}

function actionMatchesQuery(a: ActionItem, lowerQuery: string): boolean {
  if (a.description.toLowerCase().includes(lowerQuery)) return true
  if ((a.tags || []).some((tag) => tag.toLowerCase().includes(lowerQuery))) return true
  if ((a.progressNotes || []).some((n) => n.text.toLowerCase().includes(lowerQuery))) return true
  return false
}

function buildActionSearchHit(
  a: ActionItem,
  rawQuery: string,
  meetingTitle?: string,
  personName?: string
): SearchActionHit {
  const lq = rawQuery.toLowerCase()
  if (a.description.toLowerCase().includes(lq)) {
    const snippet = extractMatchSnippet(a.description, rawQuery) || a.description
    return { ...a, meetingTitle, personName, searchSnippet: snippet }
  }
  const tag = (a.tags || []).find((t) => t.toLowerCase().includes(lq))
  if (tag) {
    return { ...a, meetingTitle, personName, searchSnippet: `#${tag}` }
  }
  for (const n of a.progressNotes || []) {
    if (!n.text.toLowerCase().includes(lq)) continue
    const snippet = extractMatchSnippet(n.text, rawQuery)
    if (snippet) return { ...a, meetingTitle, personName, searchSnippet: snippet }
    const short = n.text.slice(0, 120).trim()
    return {
      ...a,
      meetingTitle,
      personName,
      searchSnippet: n.text.length > 120 ? `${short}…` : short,
    }
  }
  return { ...a, meetingTitle, personName }
}

export function runSearch(
  data: { persons: Person[]; meetings: Meeting[]; actionItems: ActionItem[] },
  query: string
): SearchResults {
  const lowerQuery = query.toLowerCase()
  const persons: SearchPersonHit[] = data.persons
    .filter((p) => personMatchesQuery(p, lowerQuery))
    .map((p) => buildPersonSearchHit(p, query))
  const meetings: SearchMeetingHit[] = data.meetings
    .filter((m) => meetingMatchesQuery(m, lowerQuery))
    .map((m) =>
      buildMeetingSearchHit(
        m,
        query,
        data.persons.find((p) => p.id === m.personId)?.name
      )
    )
  const actions: SearchActionHit[] = data.actionItems
    .filter((a) => actionMatchesQuery(a, lowerQuery))
    .map((a) => {
      const meeting = data.meetings.find((m) => m.id === a.meetingId)
      const person = meeting ? data.persons.find((p) => p.id === meeting.personId) : null
      return buildActionSearchHit(a, query, meeting?.title, person?.name)
    })
  return { persons, meetings, actions }
}
