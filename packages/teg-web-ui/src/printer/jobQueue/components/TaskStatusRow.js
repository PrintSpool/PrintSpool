import React, { useState, useEffect } from 'react'
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

const TaskStatusRow = ({ task, cancelTask }) => {
  const [, setEtaUpdateCounter] = useState(0)
  useEffect(() => {
    const interval = setInterval(() => {
      setEtaUpdateCounter(i => i + 1)
    }, 15 * 1000)
    return () => clearInterval(interval)
  }, [])

  let etaStr = ''

  if (task.startedAt != null && task.estimatedPrintTimeMillis != null) {
    const etaMS = Date.parse(task.startedAt) + task.estimatedPrintTimeMillis - Date.now()
    const eta = new Date(etaMS)
    const hours = Math.floor(Math.abs(etaMS) / 1000 / 3600)
    // const hoursStr = hours > 0 ? `${hours}:` : ''
    const hoursStr = hours > 0 ? `${hours}hr${hours > 1 ? 's ' : ' '}` : ''

    // const twoDigits = n => `${n >= 10 ? '' : '0'}${n}`

    etaStr = (() => {
      // const timeStr = `${hoursStr}${twoDigits(eta.getMinutes())}:${twoDigits(eta.getSeconds())}`
      const timeStr = `${hoursStr}${eta.getMinutes()}m`
      if (etaMS < 0) {
        return ` (${timeStr} over time estimate)`
      }
      return ` (${timeStr} remaining)`
    })()
  }

  return (
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
          {etaStr}
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
}

export default TaskStatusRow
