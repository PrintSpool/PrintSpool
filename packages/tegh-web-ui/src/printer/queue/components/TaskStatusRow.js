import React from 'react'
import {
  IconButton,
  Typography,
  LinearProgress,
} from '@material-ui/core'

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
          const taskOnMachine = `${task.name} on ${task.printer.name}`
          if (['CANCELLED', 'ERRORED'].includes(task.status)) {
            return `${task.status} ${taskOnMachine}`
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
          ['CANCELLED', 'ERRORED', 'DONE'].includes(task.status)
        }
        onClick={() => cancelTask(task)}
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
