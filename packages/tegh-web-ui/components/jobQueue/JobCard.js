import React from 'react'
import {
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Grid,
  IconButton,
  Typography,
  Switch,
  FormControlLabel,
  Button,
  LinearProgress,
  Divider,
} from 'material-ui'
import {
  Cancel,
  MoreVert,
} from 'material-ui-icons'
import V from 'voca'
import TaskStatusRow from './TaskStatusRow'

const JobCard = ({
  id,
  name,
  quantity,
  tasksCompleted,
  totalTasks,
  status,
  stoppedAt,
  tasks,
  cancelTask,
}) => {
  return (
    <Card>
      <CardHeader
        title={V.truncate(name, 32)}
        subheader={`${tasksCompleted} / ${totalTasks} prints completed`}
      />
      {/*
      action={
        <IconButton>
          <MoreVert />
        </IconButton>
      }
      */}
      <CardContent
        style={{
          paddingTop: 0,
        }}
      >

        {
          /* Task list segment */
          tasks.map(task => (
            <TaskStatusRow
              task={ task }
              cancelTask={ cancelTask }
              key={ task.id }
            />
          ))
        }
      </CardContent>

      {/* Bottom Button Segment */}
      {
        /*
      }
      <CardActions>
        <Button
          size="small"
        >
          MORE DETAILS
        </Button>
      </CardActions>
      {
        */
      }
    </Card>
  )
}

export default JobCard
