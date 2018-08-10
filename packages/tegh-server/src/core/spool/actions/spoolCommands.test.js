import expectToMatchImmutableSnapshot from '../../util/testing/expectToMatchImmutableSnapshot'
import { EMERGENCY } from '../types/PriorityEnum'

import spoolCommands from './spoolCommands'

describe('spoolCommands', () => {
  it('creates a SPOOL_TASK action', () => {
    const name = 'testFile.gcode'
    const content = 'line 1\nline 2'

    const result = spoolCommands({
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
