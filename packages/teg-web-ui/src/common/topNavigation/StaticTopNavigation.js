import React from 'react'
import { Link } from 'react-router-dom'
import classnames from 'classnames'

import {
  Typography,
  Hidden,
  IconButton,
  // Button,
} from '@material-ui/core'
import MenuIcon from '@material-ui/icons/Menu'

import TopNavigationStyles from './TopNavigationStyles'
import tegLogoNoTextSVG from './images/tegLogoNoText.svg'

import UserProfileMenu from './UserProfileMenu'

const StaticTopNavigation = ({
  title = () => null,
  onMenuButtonClick,
  className,
}) => {
  const classes = TopNavigationStyles()

  const hasMenu = onMenuButtonClick != null

  return (
    <div className={className}>
      <div
        className={classnames(
          classes.mainMenu,
          hasMenu && classes.withMenu,
        )}
      >
        <Hidden smDown={hasMenu}>
          <Link to="/">
            <img
              alt="Teg"
              src={tegLogoNoTextSVG}
              className={classes.logo}
            />
          </Link>
        </Hidden>
        <Hidden smDown={!hasMenu} mdUp>
          <IconButton
            className={classes.buttonClass}
            aria-label="Menu"
            onClick={onMenuButtonClick}
          >
            <MenuIcon />
          </IconButton>
        </Hidden>
        <Typography variant="h5" className={classes.title}>
          {title()}
        </Typography>
        <div
          className={classes.userProfileMenu}
        >
          <UserProfileMenu />
        </div>
      </div>
    </div>
  )
}

export default StaticTopNavigation
