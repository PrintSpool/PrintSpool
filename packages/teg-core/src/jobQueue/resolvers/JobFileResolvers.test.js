import { Map } from 'immutable'
import typeDefs from '@tegapp/schema'

import deterministicTestSetup from '../../util/testing/deterministicTestSetup'
import snapshotTestResolvers from '../../util/testing/snapshotTestResolvers'

import { initialState as jobQueueState } from '../reducers/jobQueueReducer'
import { initialState as spoolState } from '../../spool/reducers/spoolReducer'
import Job from '../types/Job'
import JobFile from '../types/JobFile'
// import { NORMAL } from './PriorityEnum'

import JobFileResolvers from './JobFileResolvers'

describe('JobResolvers', () => {
  it('presents a consistent API', () => {
    deterministicTestSetup()
    const jobID = 'test_job_id'

    const job = Job({
      id: jobID,
      name: 'test job',
      internal: false,
      // priority: NORMAL,
      data: ['g1 x10', 'g1 y20'],
    })

    const jobFile = JobFile({
      id: 'test_job_file_id',
      name: 'gear.gcode',
      quantity: 1,
      jobID,
    })

    const task = {
      id: '123',
      jobID,
      jobFileID: jobFile.id,
    }

    const state = {
      jobQueue: jobQueueState.merge({
        jobs: Map({
          [job.id]: job,
        }),
        jobFiles: Map({
          [jobFile.id]: jobFile,
        }),
      }),
      spool: spoolState.merge({
        tasks: Map({
          [task.id]: task,
        }),
      }),
    }

    snapshotTestResolvers({
      typeDefs,
      typeName: 'JobFile',
      resolvers: JobFileResolvers,
      rootValue: jobFile,
      contextValue: {
        store: {
          getState: () => state,
        },
      },
    })
  })
})
