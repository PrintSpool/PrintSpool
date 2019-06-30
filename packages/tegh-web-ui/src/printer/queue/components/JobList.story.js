import React from 'react'
import { storiesOf } from '@storybook/react'
import { Component as JobList } from './JobList'

import {
  drinkingGlass,
  gear,
  reprap,
  robot,
} from '../mocks/job.mock'

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
  addJob: () => {},
  spoolNextPrint: () => {},
  cancelTask: () => {},
  deleteJob: () => {},
}

storiesOf('JobList', module)
  .add('empty', () => (
    <JobList
      {...baselineProps}
      jobs={[]}
    />
  ))
  .add('printing', () => (
    <JobList
      {...baselineProps}
      machines={[{
        status: 'PRINTING',
      }]}
    />
  ))
  .add('ready to print', () => (
    <JobList
      {...baselineProps}
      jobs={[robot]}
    />
  ))
