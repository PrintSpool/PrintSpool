import React from 'react'
// import { Link } from 'react-router-dom'

import Typography from '@material-ui/core/Typography'
import Card from '@material-ui/core/Card'
// import CardHeader from '@material-ui/core/CardHeader'
import CardContent from '@material-ui/core/CardContent'
// import Breadcrumbs from '@material-ui/core/Breadcrumbs'
// import Button from '@material-ui/core/Button'
// import Tooltip from '@material-ui/core/Tooltip'

// import EditIcon from '@material-ui/icons/Edit'

import TaskStatusRow from '../jobQueue/components/TaskStatusRow'
import useStyles from './Job.styles.js'
import MultiVideoStreamer from '../manualControl/videoStreamer/MultiVideoStreamer.page'
import ComponentControl from '../manualControl/printerComponents/ComponentControl'
import ViewingUsersButton from './ViewingUsersButton'
import PartHeader from './PartHeader'

const JobView = ({
  cancelTask,
  pausePrint,
  resumePrint,
  part,
  execGCodes,
  isReady,
  isPrinting,
  machineStatus,
}) => {
  const classes = useStyles()

  const  {
    name,
    tasks,
    printsCompleted,
    totalPrints,
    startedFinalPrint,
    // history,
  } = part

  const task = tasks.find(t =>
    !['ERRORED', 'CANCELLED', 'FINISHED'].includes(t.status)
  )

  const videoComponents = task?.machine.components.filter(c => c.type === 'VIDEO') || []

  return (
    <div className={classes.root}>
      <PartHeader {...{
        part,
        value: 0,
      }}/>

      <Card>
        <CardContent>
          { task && videoComponents.length > 0 && (
            <MultiVideoStreamer
              machineID={task.machine.id}
              videos={videoComponents}
            />
          ) }

          { task && (
            <ViewingUsersButton
              className={classes.viewingUsersButton}
              machine={task.machine}
            />
          )}

          <Typography variant="body1" paragraph>
            {
              `${printsCompleted} / ${totalPrints} printed`
            }
            { task == null && '. Not currently printing.' }
          </Typography>

          { task && (
            <div key={task.id}>
              <TaskStatusRow
                key={task.id}
                {...{
                  task,
                  cancelTask,
                  pausePrint,
                  resumePrint,
                  machineStatus,
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
