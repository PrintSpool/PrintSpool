import React, { useState, useCallback } from 'react'

import { makeStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import Avatar from '@material-ui/core/Avatar'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemAvatar from '@material-ui/core/ListItemAvatar'
import ListItemText from '@material-ui/core/ListItemText'
import DialogTitle from '@material-ui/core/DialogTitle'
import Dialog from '@material-ui/core/Dialog'
import PersonIcon from '@material-ui/icons/Person'
import Visibility from '@material-ui/icons/Visibility'
import { blue } from '@material-ui/core/colors'

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
                <Avatar className={classes.avatar}>
                  <PersonIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText primary={user.email} />
            </ListItem>
          ))}
        </List>
      </Dialog>
    </>
  )
}

export default ViewingUsersButton
