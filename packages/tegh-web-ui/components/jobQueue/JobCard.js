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

const taskColor = (status) => {
  switch(status) {
    case 'ERRORED':
    case 'CANCELLED': {
      return 'error'
    }
    default: {
      return 'default'
    }
  }
}

const JobCard = ({
  id,
  name,
  quantity,
  tasksCompleted,
  totalTasks,
  status,
  stoppedAt,
  tasks,
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
            <div key={ task.id }>
              <Typography
                variant="body2"
                gutterBottom
                style={{
                  marginBottom: 0,
                }}
              >
                Printing {task.name} on {task.printer.name}
              </Typography>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <Typography
                  variant="body2"
                  style={{
                    marginRight: 12,
                  }}
                >
                  {task.percentComplete}%
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
