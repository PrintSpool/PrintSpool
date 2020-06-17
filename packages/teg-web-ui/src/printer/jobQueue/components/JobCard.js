import React, { useState, useCallback } from 'react'

import Card from '@material-ui/core/Card'
import CardHeader from '@material-ui/core/CardHeader'
import CardContent from '@material-ui/core/CardContent'
import IconButton from '@material-ui/core/IconButton'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'

import MoreVert from '@material-ui/icons/MoreVert'
import Delete from '@material-ui/icons/Delete'
import Reorder from '@material-ui/icons/Reorder'

import { Link } from 'react-router-dom'
import truncate from 'truncate'

import TaskStatusRow from './TaskStatusRow'
import useConfirm from '../../../common/_hooks/useConfirm'

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
  moveToTopOfQueue,
}) => {
  const confirm = useConfirm()
  const [menuAnchorEl, setMenuAnchorEl] = useState()

  const openMenu = useCallback(event => setMenuAnchorEl(event.target))
  const closeMenu = useCallback(() => setMenuAnchorEl(null))

  const shortName = truncate(name, 32)

  const confirmedCancelTask = confirm(() => ({
    fn: cancelTask,
    title: 'Are you sure you want to cancel this print?',
    description: 'You will not be able to resume this print once it is cancelled.',
  }))

  const confirmedDeleteJob = confirm(() => ({
    fn: deleteJob,
    title: 'Are you sure you want to delete this job?',
    description: name,
  }))

  const currentTasks = tasks.filter(task => ['CANCELLED', 'ERROR'].includes(task.status) === false)

  return (
    <Card>
      <CardHeader
        title={(
          <Link to={`./printing/${id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            {shortName}
          </Link>
        )}
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
          onClick={() => {
            confirmedDeleteJob({
              variables: {
                input: {
                  jobID: id,
                },
              },
            })
            closeMenu()
          }}
        >
          <ListItemIcon>
            <Delete />
          </ListItemIcon>
          <ListItemText primary="Delete Job" />
        </MenuItem>
        <MenuItem
          onClick={() => {
            moveToTopOfQueue({ jobID: id })
            closeMenu()
          }}
        >
          <ListItemIcon>
            <Reorder />
          </ListItemIcon>
          <ListItemText primary="Move to Top of Queue" />
        </MenuItem>
      </Menu>

      <CardContent
        style={{
          paddingTop: 0,
        }}
      >

        {
            /* Task list segment */
            currentTasks.map(task => (
              <TaskStatusRow
                task={task}
                cancelTask={() => confirmedCancelTask({
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
