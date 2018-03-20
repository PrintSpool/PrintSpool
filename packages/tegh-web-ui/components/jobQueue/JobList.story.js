
import React from 'react'
import { storiesOf } from '@storybook/react'
import { JobList } from './JobList'

import {
  gear,
  reprap,
  drinkingGlass,
  robot,
} from './mocks/job.mock.js'

storiesOf('JobList', module)
  .add('with jobs', () => {
    const props = {
      jobs: [
        gear,
        reprap,
        drinkingGlass,
        robot,
      ]
    }
    return <JobList {...props} />
  })
