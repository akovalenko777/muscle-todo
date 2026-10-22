import { compareStatuses } from "./compareStatuses.js"
import { sanitizeDescription } from "./sanitizeDescription.js"

describe('test helper functions', () => {
  it('return description with allowed tags', () => {
    const result = sanitizeDescription('<p>Hello</p><script>alert("foo");</script>')
    expect(result).not.toContain('<script>')
  })

  it('returns undefined when statuses are equal', () => {
    const compareResult = compareStatuses('IN_PROGRESS', 'IN_PROGRESS')
    expect(compareResult).toBe(undefined)
  })

  it('return Date if new status is DONE', () => {
    const compareResult = compareStatuses('IN_PROGRESS', 'DONE')
    expect(compareResult).toBeInstanceOf(Date)
  })

  it('return null when current status is DONE and new status not DONE', () => {
    const compareResult = compareStatuses('DONE', 'IN_PROGRESS')
    expect(compareResult).toBe(null)
  })

  it('return undefined when both statuses are not DONE', () => {
    const compareResult = compareStatuses('PLANNED', 'IN_PROGRESS')
    expect(compareResult).toBe(undefined)
  })
})