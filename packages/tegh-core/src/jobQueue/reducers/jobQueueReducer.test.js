import { MockJob } from '../types/Job'
import reducer, { initialState } from './jobQueueReducer'
import { NORMAL } from '../../spool/types/PriorityEnum'
import { DONE } from '../types/JobStatusEnum'
import { DELETE_JOB } from '../actions/deleteJob'
import spoolTask from '../../spool/actions/spoolTask'
import { MockTask } from '../../spool/types/Task'


describe('SPOOL a job file', () => {
  it('deletes the previous job and it\'s tmp files', async () => {
    const previousJob = MockJob({ status: DONE })
    const previousJobFile = MockJobFile({ jobID: previousJob.id })
    const nextJob = MockJob()
    const nextJobFile = MockJobFile({ jobID: nextJob.id })

    const state = initialState.merge({
      jobs: {
        [previousJob.id]: previousJob,
        [nextJob.id]: nextJob,
      },
      jobFiles: {
        [previousJobFile.id]: previousJobFile,
        [nextJobFile.id]: nextJobFile,
      },
    })

    const task = mockTask({
      jobID: nextJob.id,
      jobFileID: 'next_job_file_id',
    })
    const action = spoolTask(task)

    /* a promise that waits for a change to the tmp file */
    let tmpFileDidChange = false
    const tmpFileChangePromise = new Promise((resolve) => {
      const watcher = fs.watch(tmpFile, { persistent: false }, () => {
        watcher.close()
        resolve()
        tmpFileDidChange = true
      })
    })

    const sagaTester = createTester()
    sagaTester.dispatch(action)

    if (tmpFileDidChange === false) {
      await tmpFileChangePromise
    }

    const result = sagaTester.getCalledActions()

    expect(fs.existsSync(tmpFile)).toEqual(false)

    expect(result).toMatchObject([
      action,
      {
        type: DELETE_JOB,
        payload: { jobID: 'mock_job' },
      },
    ])
  })

  afterEach(async () => {
    jest.unmock('../selectors/getJobsByStatus')
    jest.unmock('../selectors/getJobTmpFiles')
    if (fs.existsSync(tmpFile)) {
      fs.unlinkSync(tmpFile)
    }
  })
})
