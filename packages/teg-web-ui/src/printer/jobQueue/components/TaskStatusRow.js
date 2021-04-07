import React, { useState, useEffect, useCallback } from 'react'

import IconButton from '@material-ui/core/IconButton'
import Typography from '@material-ui/core/Typography'
import LinearProgress from '@material-ui/core/LinearProgress'
import CircularProgress from '@material-ui/core/CircularProgress'
// import Box from '@material-ui/core/Box'
import Fade from '@material-ui/core/Fade'
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
  machineStatus,
  pausePrint,
  resumePrint,
}) => {
  const confirm = useConfirm()

  const confirmedCancelTask = confirm(() => ({
    fn: async () => {
      await cancelTask({
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

  const isPrinting = ['SPOOLED', 'STARTED'].includes(task.status)
  const blockingHeater = task.machine.components
    // .find(c => c.heater)
    .find(c => c.heater?.blocking)
  // console.log({blockingHeater}, task.machine.components)

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

  const disabled = !['READY', 'PRINTING', 'PAUSED'].includes(machineStatus)

  let heaterOverlay = <div/>
  if (isPrinting && blockingHeater != null) {
    const { actualTemperature, targetTemperature } = blockingHeater.heater

    const temperaturePercent = Math.min((
      100 * actualTemperature / targetTemperature
    ) || 0, 100)

    heaterOverlay = (
      <div
        style={{
          display: 'flex',
          // flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          // position: 'relative',
          // marginTop: 'calc(-1rem - 16px)',
          marginTop: -16,
          background: 'white',
          // background: 'rgba(255, 255, 255, .8)',
          zIndex: 1,
        }}
      >
        <CircularProgress
          variant="determinate"
          value={temperaturePercent}
          size={16*3}
        />
        {/* <Box
          top={0}
          left={0}
          bottom={0}
          right={0}
          position="absolute"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
        </Box> */}
        <Typography
          variant="h6"
          component="div"
          color="textSecondary"
          style={{
            // marginTop: 8,
            marginLeft: 16,
          }}
        >
          {`Heating ${blockingHeater.name} `}
          {/* {`(${Math.round(actualTemperature)} / ${Math.round(targetTemperature*10)/10}°C)`} */}
          {`to ${Math.round(targetTemperature*10)/10}°C`}
        </Typography>
      </div>
    )
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateRows: '1fr',
        gridTemplateAreas: '"a"',
      }}
    >
      <Fade
        style={{
          transitionDelay: `0ms`,
          gridArea: 'a',
        }}
        timeout={ 800 }
        in={isPrinting && blockingHeater != null}
      >
        { heaterOverlay }
      </Fade>
      <div style={{
        gridArea: 'a',
      }}>
        <Typography
          variant="body2"
          gutterBottom
          style={{
            marginBottom: 0,
          }}
        >
          {
            (() => {
              const taskOnMachine = `on ${task.machine.name}`
              // console.log(task.status)

              if (['CANCELLED', 'ERRORED'].includes(task.status)) {
                const stopptedAtText = new Date(Date.parse(task.stoppedAt)).toLocaleString()
                const statusWord = (
                  task.status === 'CANCELLED' ? 'Cancelled' : 'Errored'
                )
                return `${statusWord} ${taskOnMachine} at ${stopptedAtText}`
              }
              if (['FINISHED', 'PAUSED'].includes(task.status)) {
                const stopptedAtText = new Date(Date.parse(task.stoppedAt)).toLocaleString()
                return `Print ${task.status.toLowerCase()} ${taskOnMachine} at ${stopptedAtText}`
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
          { !task.settled && (
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
          )}
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
          { !task.settled && (
            <>
              <IconButton
                aria-label={task.paused ? 'resume print' : 'pause print'}
                disabled={
                  ['CANCELLED', 'ERROR', 'DONE'].includes(task.status) || disabled
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
                  ['CANCELLED', 'ERROR', 'DONE'].includes(task.status) || disabled
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
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default TaskStatusRow
