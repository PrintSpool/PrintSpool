import React from 'react'

import Typography from '@material-ui/core/Typography'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import Breadcrumbs from '@material-ui/core/Breadcrumbs'
import Button from '@material-ui/core/Button'

import { Link } from 'react-router-dom'

import TaskStatusRow from '../jobQueue/components/TaskStatusRow'
import useStyles from './Job.styles.js'
import VideoStreamer from '../manualControl/videoStreamer/VideoStreamer'
import ComponentControl from '../manualControl/printerComponents/ComponentControl'
import ViewingUsersButton from './ViewingUsersButton'

const JobView = ({
  cancelTask,
  moveToTopOfQueue,
  machine,
  job: {
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
          <ViewingUsersButton
            className={classes.viewingUsersButton}
            machine={machine}
          />
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
          {tasks.length === 0 && (
            <Button
              onClick={moveToTopOfQueue}
              color="primary"
              variant="contained"
            >
              Move to Top of Queue
            </Button>
          )}
          <Typography variant="h6">
            Current Prints
          </Typography>
          {
            tasks.length === 0 && (
              <Typography variant="h6" color="textSecondary" paragraph>
                This job is not currently being printed
              </Typography>
            )
          }
          {
            /* Task list segment */
            tasks.map(task => (
              <>
                <TaskStatusRow
                  task={task}
                  cancelTask={() => {
                    cancelTask({
                      variables: {
                        // Temporary work arounds for current Rust / NodeJS machine ID difference
                        // machineID: task.machine.id,
                        machineID: machine.id,
                      },
                    })
                  }}
                  key={task.id}
                />
                { task.estimatedFilamentMeters != null && (
                  <Typography variant="body2">
                    Estimated filament usage for this print:
                    {` ${task.estimatedFilamentMeters.toFixed(1)} meters`}
                  </Typography>
                )}
              </>
            ))
          }
          {/* <Typography variant="h6">
            History
          </Typography>
          {
            history.length === 0 && (
              <Typography variant="h6" color="textSecondary">
                Nothing yet
              </Typography>
            )
          }
          {
            history.reverse().map(e => (
              <div key={e.id}>
                {`${e.createdAt}: ${e.type}`}
              </div>
            ))
          } */}
        </CardContent>

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
      </Card>
    </div>
  )
}

export default JobView
