import React from 'react'
import { storiesOf } from '@storybook/react'
import JobCard from './JobCard'

storiesOf('JobCard', module)
  .add('printing multiple tasks', () => {
    const props = {
      id: '123',
      name: 'reprap.zip',
      quantity: 2,
      tasksCompleted: 3,
      totalTasks: 10,
      status: 'PRINTING',
      stoppedAt: null,
      tasks: [
        {
          name: 'x_carrage.gcode',
          percentComplete: 63,
          startedAt: '2018-03-20T01:19:35.646Z',
          status: 'PRINTING',
          printer: { name: 'Lulzbot 1'},
        },
        {
          name: 'y_carrage.gcode',
          percentComplete: 30,
          startedAt: '2018-03-20T01:19:35.646Z',
          status: 'PRINTING',
          printer: { name: 'MakerGear 3'},
        },
      ],
    }

    return <JobCard {...props} />
  })
