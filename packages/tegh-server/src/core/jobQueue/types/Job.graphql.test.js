import { Map } from 'immutable'

import snapshotTestGraphQLType from '../../util/testing/snapshotTestGraphQLType'

import Job from './Job'
import JobFile from './JobFile'
// import { NORMAL } from './PriorityEnum'

import JobGraphQL from './Job.graphql.js'

const job = Job({
  name: 'test job',
  internal: false,
  // priority: NORMAL,
  data: ['g1 x10', 'g1 y20'],
})

const jobFile = JobFile({
  jobID: job.id,
})

const task = {
  id: '123',
  jobID: job.id,
  jobFileID: jobFile.id,
}

const state = {
  jobQueue: {
    jobs: Map({
      [job.id]: job,
    }),
    jobFiles: Map({
      [jobFile.id]: jobFile,
    }),
  },
  spool: {
    tasks: Map({
      [task.id]: task,
    }),
  },
}

snapshotTestGraphQLType('JobGraphQL', {
  type: JobGraphQL,
  fieldConfigs: {
    id: {
      dynamic: true,
    },
    createdAt: {
      dynamic: true,
    },
    tasks: {
      args: { excludeCompletedTasks: false },
    },
  },
  rootValue: job,
  contextValue: {
    store: {
      getState: () => state,
    },
  },
})
