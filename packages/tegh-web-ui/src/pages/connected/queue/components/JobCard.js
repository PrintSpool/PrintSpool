import React from 'react'
import { compose, withStateHandlers } from 'recompose'
import {
  Card,
  CardHeader,
  CardContent,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@material-ui/core'
import {
  MoreVert,
  Delete,
} from '@material-ui/icons'
import V from 'voca'
import TaskStatusRow from './TaskStatusRow'

const enhance = compose(
  withStateHandlers(
    { menuAnchorEl: null },
    {
      openMenu: () => event => ({ menuAnchorEl: event.target }),
      closeMenu: () => () => ({ menuAnchorEl: null }),
    },
  ),
)

const JobCard = ({
  id,
  name,
  // quantity,
  tasksCompleted,
  totalTasks,
  status,
  // stoppedAt,
  tasks,
  cancelTask,
  deleteJob,
  menuAnchorEl,
  openMenu,
  closeMenu,
}) => (
  <Card>
    <CardHeader
      title={V.truncate(name, 32)}
      subheader={`${tasksCompleted} / ${totalTasks} prints completed`}
      action={
          // hide the delete button when the job is printing
          status !== 'PRINTING'
          && (
          <IconButton
            onClick={openMenu}
          >
            <MoreVert />
          </IconButton>
          )
        }
    />

    <Menu
      id="long-menu"
      anchorEl={menuAnchorEl}
      open={menuAnchorEl != null}
      onClose={closeMenu}
    >
      <MenuItem
        onClick={() => deleteJob({ id }) && closeMenu()}
      >
        <ListItemIcon>
          <Delete />
        </ListItemIcon>
        <ListItemText inset primary="Delete Job" />
      </MenuItem>
    </Menu>

    <CardContent
      style={{
        paddingTop: 0,
      }}
    >

      {
          /* Task list segment */
          tasks.map(task => (
            <TaskStatusRow
              task={task}
              cancelTask={cancelTask}
              key={task.id}
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

export default enhance(JobCard)
