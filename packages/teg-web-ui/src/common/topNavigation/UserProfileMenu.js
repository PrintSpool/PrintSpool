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

import { useAuth0 } from '../auth/auth0'
import useStyles from './UserProfileMenuStyles'

const UserProfileMenu = () => {
  const classes = useStyles()

  const [anchorEl, setAnchorEl] = useState(null)
  const { logout, user } = useAuth0()

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  return (
    <>
      <IconButton
        className={classes.buttonClass}
        aria-controls="user-profile-menu"
        aria-haspopup="true"
        onClick={handleClick}
      >
        <Avatar src={user.picture}>{user.name}</Avatar>
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
          {user.name}
        </Avatar>
        <Typography variant="h6" className={classes.largeName}>
          {user.name}
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
            logout({})
          }}
        >
            Log out
        </MenuItem>
      </Menu>
    </>
  )
}

export default UserProfileMenu
