import tmp from 'tmp-promise'

import fs from '../../util/promisifiedFS'
import expectToMatchImmutableSnapshot from '../../util/testing/expectToMatchImmutableSnapshot'
import createJob from './createJob'

describe('createJob', () => {
  it('creates a CREATE_JOB action', async function() {
    const name = 'test_test_test'
    const files = [
      {
        name: 'file_A',
        content: `G28`,
      },
      {
        name: 'file_B',
        content: `G1 X10\nG1 Y10\nG1 Z10`
      }
    ]

    const dispatch = action => action

    let result = await createJob({
      files,
      name
    })(dispatch)

    expectToMatchImmutableSnapshot({
      result,
      redactions: [
        ['payload', 'job', 'id'],
        ['payload', 'job', 'createdAt'],
        ['payload', 'jobFiles'],
      ],
    })

    const jobFiles = Object.values(result.payload.jobFiles)
    for (const jobFile of jobFiles) {
      expectToMatchImmutableSnapshot({
        result: jobFile,
        redactions: [
          ['id'],
          ['filePath'],
          ['jobID'],
        ],
      })
      const content = await fs.readFileAsync(jobFile.filePath, 'utf8')
      expect(content).toMatchSnapshot()

      /* clean up tmp file */
      await fs.unlinkAsync(jobFile.filePath)
    }

  })
})
