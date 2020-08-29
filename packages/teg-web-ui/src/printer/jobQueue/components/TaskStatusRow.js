import React from 'react'
import {
  IconButton,
  Typography,
  LinearProgress,
} from '@material-ui/core'
import moment from 'moment'

import Cancel from '@material-ui/icons/Cancel'

// const taskColor = (status) => {
//   switch (status) {
//     case 'ERRORED':
//     case 'CANCELLED': {
//       return 'error'
//     }
//     default: {
//       return 'index'
//     }
//   }
// }

const TaskStatusRow = ({ task, cancelTask }) => (
  <div>
    <Typography
      variant="body2"
      gutterBottom
      style={{
        marginBottom: 0,
      }}
    >
      {
        (() => {
          const taskOnMachine = `${task.name} on ${task.machine.name}`
          if (['CANCELLED', 'ERROR'].includes(task.status)) {
            const statusWord = (
              task.status === 'CANCELLED' ? 'Cancelled' : 'Errored'
            )
            return `${statusWord} ${taskOnMachine}`
          }
          if (task.status === 'DONE') {
            return `Printed ${taskOnMachine}`
          }
          return `Printing ${taskOnMachine}`
        })()
      }
    </Typography>

    <div
      style={{
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <Typography
        variant="body2"
        style={{
          marginRight: 12,
        }}
      >
        {task.percentComplete.toFixed(1)}
        %
        {(() => {
          // console.log(task)
          if (Date.now() > Date.parse(task.startedAt) + task.estimatedPrintTimeMillis) {
            return '(Over time estimate)'
          }

          const eta = moment(task.startedAt)
            .add(task.estimatedPrintTimeMillis, 'ms')
            .fromNow(true)
          return ` (${eta.charAt(0).toUpperCase() + eta.slice(1)} Remaining)`
        })()}
      </Typography>
      <div
        style={{
          flexGrow: 1,
        }}
      >
        <LinearProgress
          variant="determinate"
          value={task.percentComplete}
        />
      </div>
      <IconButton
        aria-label="cancel"
        disabled={
          ['CANCELLED', 'ERROR', 'DONE'].includes(task.status)
        }
        onClick={cancelTask}
        style={{
          marginTop: -12,
          marginBottom: -12,
          marginRight: -14,
          textAlign: 'right',
        }}
      >
        <Cancel />
      </IconButton>
    </div>
  </div>
)

export default TaskStatusRow
