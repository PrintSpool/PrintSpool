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
import { connect } from 'react-redux'
import { push as pushActionCreator } from '@d1plo1d/connected-react-router'

import TaskStatusRow from './TaskStatusRow'

const enhance = compose(
  withStateHandlers(
    { menuAnchorEl: null },
    {
      openMenu: () => event => ({ menuAnchorEl: event.target }),
      closeMenu: () => () => ({ menuAnchorEl: null }),
    },
  ),
  connect(null, {
    pushLocation: pushActionCreator,
  }),
)

// onClick={() => pushLocation(`jobs/${id}/`)}

const JobCard = ({
  id,
  name,
  // quantity,
  printsCompleted,
  totalPrints,
  status,
  tasks,
  cancelTask,
  deleteJob,
  menuAnchorEl,
  openMenu,
  closeMenu,
  // pushLocation,
}) => (
  <Card>
    <CardHeader
      title={V.truncate(name, 32)}
      subheader={`${printsCompleted} / ${totalPrints} prints completed`}
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
