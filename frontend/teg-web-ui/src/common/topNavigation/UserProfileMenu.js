import React, { useState } from 'react'
import { Link } from 'react-router-dom'

import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Avatar from '@mui/material/Avatar'
import Divider from '@mui/material/Divider'

import { useAuth } from '../auth'
import useStyles from './UserProfileMenuStyles'

const UserProfileMenu = ({ avatar }) => {
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

  return <>
    <IconButton
      className={classes.buttonClass}
      aria-controls="user-profile-menu"
      aria-haspopup="true"
      onClick={handleClick}
      size="large">
    <Avatar
      src={avatar}
    >
      {user.email[0]}
    </Avatar>
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
        src={avatar}
        className={classes.largeAvatar}
      >
        {user.email[0]}
      </Avatar>
      <Typography variant="h6" className={classes.largeName}>
        {user.email}
      </Typography>
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
        }}
      >
          Log out
      </MenuItem>
    </Menu>
  </>;
}

export default UserProfileMenu
