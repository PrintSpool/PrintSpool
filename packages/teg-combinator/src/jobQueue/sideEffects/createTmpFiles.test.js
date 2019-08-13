import fs from '../../util/promisifiedFS'
import createTmpFiles from './createTmpFiles'
import { MockJob } from '../types/Job'

describe('createTmpFiles', () => {
  it('creates the tmp files', async () => {
    const job = MockJob()
    const files = [
      {
        name: 'file_A',
        content: 'G28',
      },
      {
        name: 'file_B',
        content: 'G1 X10\nG1 Y10\nG1 Z10',
      },
    ]

    const { job: nextJob, jobFiles } = await createTmpFiles({
      job,
      files,
    })

    const jobFileNames = jobFiles.toList().map(f => f.name).toJS()

    expect(nextJob).toEqual(job)
    expect(jobFileNames).toEqual(['file_A', 'file_B'])

    await Promise.all(
      jobFiles.map(async (jobFile) => {
        const content = await fs.readFileAsync(jobFile.filePath, 'utf8')
        expect(content).toMatchSnapshot()

        /* clean up tmp file */
        await fs.unlinkAsync(jobFile.filePath)
      }),
    )
  })
})
