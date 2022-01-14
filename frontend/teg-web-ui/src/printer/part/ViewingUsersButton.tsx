import React, { useState, useCallback } from 'react'

import makeStyles from '@mui/styles/makeStyles';
import Button from '@mui/material/Button'
import Avatar from '@mui/material/Avatar'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import ListItemText from '@mui/material/ListItemText'
import DialogTitle from '@mui/material/DialogTitle'
import Dialog from '@mui/material/Dialog'
import PersonIcon from '@mui/icons-material/Person'
import Visibility from '@mui/icons-material/Visibility'
import { blue } from '@mui/material/colors'

// import useStyles from './Job.styles.js'
const useStyles = makeStyles({
  avatar: {
    backgroundColor: blue[100],
    color: blue[600],
  },
})

const ViewingUsersButton = ({
  className = null,
  machine,
}) => {
  const classes = useStyles()

  const [open, setOpen] = useState(false)
  const toggle = useCallback(() => setOpen(open => !open), [])

  // const users = [
  //   { email: "thatotherdude@gmail.com" },
  //   { email: "michelle@michelle.michelle" },
  // ]

  const users = machine.viewers

  const viewers = `${users.length} Viewer${users.length !== 1 ? 's' : ''}`

  return (
    <>
      <Button
        onClick={toggle}
        className={className}
        startIcon={<Visibility />}
      >
        {viewers}
      </Button>
      <Dialog onClose={toggle} aria-labelledby="viewing-users-dialog-title" open={open}>
        <DialogTitle id="viewing-users-dialog-title">
          {viewers}
        </DialogTitle>
        <List>
          {users.map((user) => (
            <ListItem key={user.id}>
              <ListItemAvatar>
                <Avatar className={classes.avatar} src={user.picture}>
                  <PersonIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText primary={user.description} />
            </ListItem>
          ))}
        </List>
      </Dialog>
    </>
  )
}

export default ViewingUsersButton
