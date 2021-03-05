import React from 'react'

import Typography from '@material-ui/core/Typography'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import Breadcrumbs from '@material-ui/core/Breadcrumbs'
import Button from '@material-ui/core/Button'

import { Link } from 'react-router-dom'

import TaskStatusRow from '../jobQueue/components/TaskStatusRow'
import useStyles from './Job.styles.js'
import VideoStreamer from '../manualControl/videoStreamer/VideoStreamer.page'
import ComponentControl from '../manualControl/printerComponents/ComponentControl'
import ViewingUsersButton from './ViewingUsersButton'

const JobView = ({
  cancelTask,
  pausePrint,
  resumePrint,
  moveToTopOfQueue,
  part: {
    name,
    tasks,
    printsCompleted,
    totalPrints,
    // history,
  },
  execGCodes,
  isReady,
  isPrinting,
}) => {
  const classes = useStyles()

  const task = tasks.find(t =>
    !['ERRORED', 'CANCELLED', 'FINISHED'].includes(t.status)
  )
  const settledTasks = tasks.filter(t =>
    ['ERRORED', 'CANCELLED', 'FINISHED'].includes(t.status)
  )

  const videoComponents = task?.machine.components.filter(c => c.type === 'VIDEO') || []

  return (
    <div className={classes.root}>
      <Card raised className={classes.card}>
        { videoComponents.length > 0 && (
          <div className={classes.videoStreamer}>
            { videoComponents.map((c) => (
              <VideoStreamer
                machineID={task.machine.id}
                videoID={c.id}
                key={c.id}
              />
            )) }
          </div>
        ) }
        <CardContent>
          { task && (
            <ViewingUsersButton
              className={classes.viewingUsersButton}
              machine={task.machine}
            />
          )}

          <Breadcrumbs>
            <Link to="../">
              Print Queue
            </Link>
            <Typography color="textPrimary">
              {name}
            </Typography>
          </Breadcrumbs>

          <Typography variant="subtitle1" paragraph>
            {
              `${printsCompleted} / ${totalPrints} prints completed`
            }
          </Typography>

          { task == null && (
            <>
              <Typography variant="h6" color="textSecondary" paragraph>
                This part is not currently being printed
              </Typography>
              <Button
                onClick={moveToTopOfQueue}
                color="primary"
                variant="contained"
              >
                Move to Top of Queue
              </Button>
            </>
          )}
          { task && (
            <div key={task.id}>
              <TaskStatusRow
                key={task.id}
                {...{
                  task,
                  cancelTask,
                  pausePrint,
                  resumePrint,
                }}
              />
              { task.estimatedFilamentMeters != null && (
                <Typography variant="body2">
                  Estimated filament usage for this print:
                  {` ${task.estimatedFilamentMeters.toFixed(1)} meters`}
                </Typography>
              )}
            </div>
          ) }
          <Typography variant="h5">
            Print History
          </Typography>
          { settledTasks.map((task) => (
            <Typography variant="body2" key={task.id}>
              {`Print ${task.status.toLowerCase()} at `}
              {new Date(Date.parse(task.stoppedAt)).toLocaleString()}
            </Typography>
          ))}
          { settledTasks.length === 0 && (
            <Typography variant="body2">
              No previous prints
            </Typography>
          )}
          {
            task?.machine.components
              .filter(c => ['BUILD_PLATFORM', 'TOOLHEAD', 'FAN'].includes(c.type))
              .map(component => (
                <ComponentControl
                  key={component.id}
                  machine={task.machine}
                  component={component}
                  execGCodes={execGCodes}
                  isReady={isReady}
                  isPrinting={isPrinting}
                  printOverridesOnly
                />
              ))
          }
        </CardContent>
      </Card>
    </div>
  )
}

export default JobView
