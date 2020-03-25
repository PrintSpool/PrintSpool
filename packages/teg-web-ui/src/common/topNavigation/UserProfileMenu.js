import React, { useState } from 'react'
import { Link } from 'react-router-dom'

import {
  Typography,
  // Hidden,
  IconButton,
  // Button,
  Menu,
  MenuItem,
  Avatar,
  Divider,
} from '@material-ui/core'

import { useAuth } from '../auth'
import useStyles from './UserProfileMenuStyles'

const UserProfileMenu = () => {
  const { user, logOut } = useAuth()

  const classes = useStyles()

  const [anchorEl, setAnchorEl] = useState(null)

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  if (!user) {
    return <div />
  }

  return (
    <>
      <IconButton
        className={classes.buttonClass}
        aria-controls="user-profile-menu"
        aria-haspopup="true"
        onClick={handleClick}
      >
        <Avatar src={user.picture}>{user.displayName[0]}</Avatar>
      </IconButton>
      <Menu
        id="user-profile-menu"
        classes={{ paper: classes.menu }}
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <Avatar
          src={user.picture}
          className={classes.largeAvatar}
        >
          {user.displayName}
        </Avatar>
        <Typography variant="h6" className={classes.largeName}>
          {user.displayName}
        </Typography>
        {user.email && (
          <Typography variant="subtitle1" className={classes.email}>
            {user.email}
          </Typography>
        )}
        <Divider />
        <MenuItem
          onClick={handleClose}
          component={React.forwardRef((props, ref) => (
            <Link
              to="/account"
              innerRef={ref}
              {...props}
            />
          ))}
        >
            My Account
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleClose()
            logOut()
            // history.push('../')
          }}
        >
            Log out
        </MenuItem>
      </Menu>
    </>
  )
}

export default UserProfileMenu
