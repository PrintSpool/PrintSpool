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
  machine,
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

  const showVideoStreamer = tasks.some(task => (
    task.machine?.components.some(c => c.type === 'VIDEO')
  ))

  return (
    <div className={classes.root}>
      <Card raised className={classes.card}>
        { showVideoStreamer && (
          <div className={classes.videoStreamer}>
            <VideoStreamer />
          </div>
        )}
        <CardContent>
          <Breadcrumbs>
            <Link to="../">
              Print Queue
            </Link>
            <Typography color="textPrimary">
              {name}
            </Typography>
          </Breadcrumbs>

          { tasks.length === 0 && (
            <>
              <Typography variant="h6" color="textSecondary" paragraph>
                This part is not currently being printed
              </Typography>
              <Typography variant="subtitle1" paragraph>
                {
                  `${printsCompleted} / ${totalPrints} prints completed`
                }
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
          <Typography variant="subtitle1" paragraph>
            {
              `${printsCompleted} / ${totalPrints} prints completed`
            }
          </Typography>
          { tasks.map(task => (
            <div key={task.id}>
              <ViewingUsersButton
                className={classes.viewingUsersButton}
                machine={task.machine}
              />
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
          ))}
          {
            machine.components
              .filter(c => ['BUILD_PLATFORM', 'TOOLHEAD', 'FAN'].includes(c.type))
              .map(component => (
                <ComponentControl
                  key={component.id}
                  machine={machine}
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
