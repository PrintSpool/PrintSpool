import React, { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import truncate from 'truncate'

import Card from '@material-ui/core/Card'
import CardHeader from '@material-ui/core/CardHeader'
import CardContent from '@material-ui/core/CardContent'
import Button from '@material-ui/core/Button'
import Tooltip from '@material-ui/core/Tooltip'
// import IconButton from '@material-ui/core/IconButton'
// import Menu from '@material-ui/core/Menu'
// import MenuItem from '@material-ui/core/MenuItem'
// import ListItemIcon from '@material-ui/core/ListItemIcon'
// import ListItemText from '@material-ui/core/ListItemText'

// import MoreVert from '@material-ui/icons/MoreVert'
// import Delete from '@material-ui/icons/Delete'
// import Reorder from '@material-ui/icons/Reorder'
import { makeStyles } from '@material-ui/core/styles'

import TaskStatusRow from './TaskStatusRow'
// import useConfirm from '../../../common/_hooks/useConfirm'

const useStyles = makeStyles(theme => ({
  retryPrintButton: {
    color: theme.palette.error.main,
    borderColor: theme.palette.error.main,
    marginRight: theme.spacing(2),
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
      gridTemplateColumns: '1fr auto',
      alignItems: 'center',
    }} >
      <div>
        <CardHeader
          title={(
            <Link
              to={`./printing/${task.partID}/`}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              {
                (isPrinting && 'Printing')
                || (aborted && `${capitalizedStatus} Print:`)
                || (task.status === 'FINISHED' && 'Completed')
                || capitalizedStatus
              }
              {' '}
              {shortName}
              {/* {!isPrinting && ` ${task.status.toLowerCase()}`} */}
            </Link>
          )}
          subheader={
            `${task.stoppedAt ? `${capitalizedStatus} at ` : 'Started at'} ${statusSetAt}${abortInfo}`
            + ` on ${task.machine.name}`}
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
