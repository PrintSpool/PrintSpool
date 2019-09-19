import expectToMatchImmutableSnapshot from '../../util/testing/expectToMatchImmutableSnapshot'

import spoolGCodes from './spoolGCodes'

describe('spoolGCodes', () => {
  it('creates a SPOOL_TASK action', () => {
    const name = 'testFile.gcode'
    const content = 'line 1\nline 2'

    const result = spoolGCodes({
      file: {
        name,
        content,
      },
    })

    expectToMatchImmutableSnapshot({
      result,
      redactions: [
        ['payload', 'task', 'id'],
        ['payload', 'task', 'createdAt'],
      ],
    })
  })
})
