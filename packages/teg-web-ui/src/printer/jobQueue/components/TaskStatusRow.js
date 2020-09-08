import React, { useState, useEffect, useCallback } from 'react'

import IconButton from '@material-ui/core/IconButton'
import Typography from '@material-ui/core/Typography'
import LinearProgress from '@material-ui/core/LinearProgress'
import Cancel from '@material-ui/icons/Cancel'
import Play from '@material-ui/icons/PlayArrow'
import Pause from '@material-ui/icons/Pause'

import useConfirm from '../../../common/_hooks/useConfirm'

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

const TaskStatusRow = ({
  task,
  cancelTask,
  pausePrint,
  resumePrint,
}) => {
  const confirm = useConfirm()

  const confirmedCancelTask = confirm(() => ({
    fn: () => {
      cancelTask({
        variables: { machineID: task.machine.id.replace('rust-', '') },
      })
    },
    title: 'Are you sure you want to cancel this print?',
    description: 'You will not be able to resume this print once it is cancelled.',
  }))

  const togglePause = useCallback(() => {
    const mutationFn = task.paused ? resumePrint : pausePrint
    mutationFn({
      variables: {
        taskID: task.id,
      },
    })
  })

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
    const eta = new Date(Math.abs(etaMS))
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
          aria-label={task.paused ? 'resume print' : 'pause print'}
          disabled={
            ['CANCELLED', 'ERROR', 'DONE'].includes(task.status)
          }
          onClick={togglePause}
          style={{
            marginTop: -12,
            marginBottom: -12,
          }}
        >
          {task.paused ? <Play /> : <Pause />}
        </IconButton>
        <IconButton
          aria-label="cancel"
          disabled={
            ['CANCELLED', 'ERROR', 'DONE'].includes(task.status)
          }
          onClick={confirmedCancelTask}
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
