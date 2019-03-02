import tmp from 'tmp-promise'
import { Map } from 'immutable'

import fs from '../../util/promisifiedFS'
import expectToMatchImmutableSnapshot from '../../util/testing/expectToMatchImmutableSnapshot'
import spoolJobFile from './spoolJobFile'

describe('spoolJobFile', () => {
  it('creates a SPOOL_TASK action', async () => {
    const jobFileID = 'test_test_test'
    const tmpFile = await tmp.file()
    const filePath = tmpFile.path
    await fs.writeFileAsync(filePath, 'g1 x10\ng1 y10')

    const dispatch = action => action
    const getState = () => ({
      jobQueue: {
        jobFiles: Map({
          [jobFileID]: {
            id: jobFileID,
            jobID: '123',
            name: 'abc',
            filePath,
          },
        }),
      },
    })

    const result = await spoolJobFile({
      jobFileID,
    })(dispatch, getState)

    expectToMatchImmutableSnapshot({
      result,
      redactions: [
        ['payload', 'task', 'id'],
        ['payload', 'task', 'createdAt'],
      ],
    })

    /* clean up tmp file */
    await fs.unlinkAsync(filePath)
  })
})
