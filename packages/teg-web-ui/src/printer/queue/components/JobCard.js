import React, { useState, useMemo } from 'react'

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

import MoreVert from '@material-ui/icons/MoreVert'
import Delete from '@material-ui/icons/Delete'

import truncate from 'truncate'

import TaskStatusRow from './TaskStatusRow'

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
}) => {
  const [menuAnchorEl, setMenuAnchorEl] = useState()

  const {
    openMenu,
    closeMenu,
  } = useMemo(() => ({
    openMenu: event => setMenuAnchorEl(event.target),
    closeMenu: () => setMenuAnchorEl(null),
  }))

  return (
    <Card>
      <CardHeader
        title={truncate(name, 32)}
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
          onClick={() => deleteJob({ jobID: id }) && closeMenu()}
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
                cancelTask={() => cancelTask({
                  variables: { machineID: task.machine.id },
                })}
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
}

export default JobCard
