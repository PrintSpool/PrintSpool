import React from 'react'
import { storiesOf } from '@storybook/react'
import JobQueue from './Starred.view'

import {
  drinkingGlass,
  gear,
  reprap,
  robot,
} from './mocks/job.mock'

const baselineProps = {
  jobs: [
    drinkingGlass,
    reprap,
    gear,
    robot,
  ],
  machines: [{
    status: 'READY',
  }],
  spoolNextPrint: () => {},
  deleteJob: () => {},
  cancelTask: () => {},
}

storiesOf('JobQueue', module)
  .add('empty', () => (
    <JobQueue
      {...baselineProps}
      jobs={[]}
    />
  ))
  .add('printing', () => (
    <JobQueue
      {...baselineProps}
      machines={[{
        status: 'PRINTING',
      }]}
    />
  ))
  .add('ready to print', () => (
    <JobQueue
      {...baselineProps}
      jobs={[robot]}
    />
  ))
