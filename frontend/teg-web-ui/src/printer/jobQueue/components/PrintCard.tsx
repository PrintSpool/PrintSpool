import React, { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import truncate from 'truncate'

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Tooltip from '@mui/material/Tooltip'
// import IconButton from '@mui/material/IconButton'
// import Menu from '@mui/material/Menu'
// import MenuItem from '@mui/material/MenuItem'
// import ListItemIcon from '@mui/material/ListItemIcon'
// import ListItemText from '@mui/material/ListItemText'

// import MoreVert from '@mui/icons-material/MoreVert'
// import Delete from '@mui/icons-material/Delete'
// import Reorder from '@mui/icons-material/Reorder'
import CloseIcon from '@mui/icons-material/Close'
import DoneIcon from '@mui/icons-material/Done'
import ErrorIcon from '@mui/icons-material/Error'
import makeStyles from '@mui/styles/makeStyles';

import TaskStatusRow from './TaskStatusRow'
// import useConfirm from '../../../common/_hooks/useConfirm'

const useStyles = makeStyles(theme => ({
  retryPrintButton: {
    // color: theme.palette.error.main,
    // borderColor: theme.palette.error.main,
    marginRight: theme.spacing(2),
  },
  statusIcon: {
    fontSize: 48,
    marginLeft: 16,
  },
  doneIcon: {
    color: theme.palette.success.main,
  },
  abortedIcon: {
    color: theme.palette.error.dark,
  },
}))

const PrintCard = ({
  print,
  cancelTask,
  pausePrint,
  resumePrint,
  // deletePart,
  retryPrint,
  retryPrintMutation,
}) => {
  const classes = useStyles()
  // const confirm = useConfirm()
  // const [menuAnchorEl, setMenuAnchorEl] = useState()

  // const openMenu = useCallback(event => setMenuAnchorEl(event.target), [])
  // const closeMenu = useCallback(() => setMenuAnchorEl(null), [])

  const { task, part } = print
  const machineStatus = task.machine.status

  const shortName = truncate(part.name, 32)
  // console.log({ task } )

  // const confirmedDeletePart = confirm(() => ({
  //   fn: () => {
  //     deletePart({
  //       variables: {
  //         input: {
  //           partID: task.id,
  //         },
  //       },
  //     })
  //     closeMenu()
  //   },
  //   title: 'Are you sure you want to delete this part?',
  //   description: part.name,
  // }))
  let statusSetAt = new Date(Date.parse(task.stoppedAt || task.startedAt))
    .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    .replace(' a.m.', 'am')
    .replace(' p.m.', 'pm')

  const isPrinting = ['SPOOLED', 'STARTED'].includes(task.status)
  const capitalizedStatus = task.status.charAt(0) + task.status.toLowerCase().slice(1)

  const aborted = task.settled && task.status != 'FINISHED'
  let abortInfo = ''
  if (aborted) {
    abortInfo = ` (at ${task.percentComplete.toFixed(1)}% complete)`
  }

  let retryButtonTooltip = ''
  if (machineStatus !== 'READY') {
    retryButtonTooltip = `Cannot print when machine is ${machineStatus.toLowerCase()}`
  } else if (retryPrintMutation.loading) {
    retryButtonTooltip = "Starting print.."
  }

  return (
    <Card style={{
      display: 'grid',
      gridTemplateColumns: task.settled ? 'auto 1fr auto' : null,
      alignItems: 'center',
    }} >
      { task.status === 'FINISHED' && (
          <DoneIcon className={`${classes.statusIcon} ${classes.doneIcon}`} />
      )}
      { aborted && (
          <ErrorIcon className={`${classes.statusIcon} ${classes.abortedIcon}`} />
      )}

      <div>
        <CardHeader
          title={(
            <Link
              to={`./printing/${task.partID}/`}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              {
                ((isPrinting || task.status === 'PAUSED') && 'Printing')
                || (aborted && `${capitalizedStatus} Print:`)
                || (task.status === 'FINISHED' && 'Completed')
                || capitalizedStatus
              }
              {' '}
              {shortName}
              { task.status === 'PAUSED' && ' (Paused)'}
              {/* {!isPrinting && ` ${task.status.toLowerCase()}`} */}
            </Link>
          )}
          subheader={
            `${task.stoppedAt ? `${capitalizedStatus} at` : 'Started at'}`
            + ` ${statusSetAt}${abortInfo}`
            + ` on ${task.machine.name}`
          }
        />

        {/* <Menu
          id="long-menu"
          anchorEl={menuAnchorEl}
          open={menuAnchorEl != null}
          onClose={closeMenu}
        >
          <MenuItem onClick={confirmedDeletePart}>
            <ListItemIcon>
              <Delete />
            </ListItemIcon>
            <ListItemText primary="Delete Part" />
          </MenuItem>
        </Menu> */}

        {!task.settled && (
          <CardContent
            style={{
              paddingTop: 0,
            }}
          >
            <TaskStatusRow
              task={task}
              key={task.id}
              {...{
                cancelTask,
                pausePrint,
                resumePrint,
                machineStatus,
              }}
            />
          </CardContent>
        )}
      </div>
      { aborted && (
        <Tooltip title={retryButtonTooltip}>
          <Button
            variant="outlined"
            className={classes.retryPrintButton}
            style={{
              pointerEvents: "auto",
            }}
            component="div"
            onClick={retryPrint}
            disabled={retryPrintMutation.loading || machineStatus !== 'READY'}
          >
            Retry Print
          </Button>
        </Tooltip>
      )}
    </Card>
  )
}

export default PrintCard
