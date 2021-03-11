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
// import Reorder from '@material-ui/icons/Reorder'

import { Link } from 'react-router-dom'
import truncate from 'truncate'

import TaskStatusRow from './TaskStatusRow'
import useConfirm from '../../../common/_hooks/useConfirm'
// import { Typography } from '@material-ui/core'

const PrintCard = ({
  print,
  cancelTask,
  pausePrint,
  resumePrint,
  // deletePart,
}) => {
  // const confirm = useConfirm()
  // const [menuAnchorEl, setMenuAnchorEl] = useState()

  // const openMenu = useCallback(event => setMenuAnchorEl(event.target), [])
  // const closeMenu = useCallback(() => setMenuAnchorEl(null), [])

  const { task, part } = print

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

  return (
    <Card>
      <CardHeader
        title={(
          <Link to={`./printing/${task.partID}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            {shortName}
          </Link>
        )}
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
          }}
        />
      </CardContent>
    </Card>
  )
}

export default PrintCard
