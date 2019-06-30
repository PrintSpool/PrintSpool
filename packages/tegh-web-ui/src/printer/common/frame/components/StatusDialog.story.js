import React from 'react'
import { storiesOf } from '@storybook/react'
import StatusDialog from './StatusDialog'

const machineStatuses = [
  'CONNECTING',
  'READY',
  'PRINTING',
  'DISCONNECTED',
  'ERRORED',
  'ESTOPPED',
]

const error = {
  message: 'The Printer has horrible broken itself in new and interesting ways',
  code: 'FUBAR_001',
}

const stories = storiesOf('StatusDialog', module)

machineStatuses.forEach((status) => {
  stories.add(status, () => {
    const props = {
      open: true,
      machine: {
        status,
        error: status === 'ERRORED' ? error : null,
      },
    }
    return <StatusDialog {...props} />
  })
})
