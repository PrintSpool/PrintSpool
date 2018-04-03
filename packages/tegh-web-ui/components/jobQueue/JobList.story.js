
import React from 'react'
import { storiesOf } from '@storybook/react'
import { JobList } from './JobList'

import {
  drinkingGlass,
  gear,
  reprap,
  robot,
} from './mocks/job.mock.js'

storiesOf('JobList', module)
  .add('with jobs', () => {
    const props = {
      jobs: [
        drinkingGlass,
        reprap,
        gear,
        robot,
      ],
      status: 'READY',
    }
    return <JobList {...props} />
  })
