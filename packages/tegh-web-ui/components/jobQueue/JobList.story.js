
import React from 'react'
import { storiesOf } from '@storybook/react'
import { JobList } from './JobList'

import {
  gear,
  reprap,
  robot,
} from './mocks/job.mock.js'

storiesOf('JobList', module)
  .add('with jobs', () => {
    const props = {
      printingJobs: [
        reprap,
      ],
      queuedJobs: [
        gear,
        robot,
      ],
    }
    return <JobList {...props} />
  })
