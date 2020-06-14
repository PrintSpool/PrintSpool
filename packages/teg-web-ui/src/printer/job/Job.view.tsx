import React from 'react'

import Typography from '@material-ui/core/Typography'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import Breadcrumbs from '@material-ui/core/Breadcrumbs'

import { Link } from 'react-router-dom'

import TaskStatusRow from '../jobQueue/components/TaskStatusRow'
import useStyles from './Job.styles.js'
import VideoStreamer from '../manualControl/videoStreamer/VideoStreamer'

const JobView = ({
  cancelTask,
  job: {
    name,
    tasks,
    printsCompleted,
    totalPrints,
    history,
  },
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
              Printing
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
              <TaskStatusRow
                task={task}
                cancelTask={() => {
                  cancelTask({
                    variables: {
                      machineID: task.machine.id,
                    },
                  })
                }}
                key={task.id}
              />
            ))
          }
          <Typography variant="h6">
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
          }
        </CardContent>
      </Card>
    </div>
  )
}

export default JobView
