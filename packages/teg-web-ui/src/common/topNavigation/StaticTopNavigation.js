import React from 'react'
import { Link } from 'react-router-dom'
import classnames from 'classnames'

import {
  Typography,
  Hidden,
  IconButton,
} from '@material-ui/core'
import MenuIcon from '@material-ui/icons/Menu'

import NavigationAuthLink from '../auth/NavigationAuthLink'

import TopNavigationStyles from './TopNavigationStyles'
import tegLogoNoTextSVG from './images/tegLogoNoText.svg'

const StaticTopNavigation = ({
  title = () => null,
  actions = () => null,
  onMenuButtonClick,
  className,
}) => {
  const classes = TopNavigationStyles()

  const hasMenu = onMenuButtonClick != null

  return (
    <div
      className={classnames(
        classes.root,
        hasMenu && classes.withMenu,
        className,
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
        className={classes.actions}
      >
        {actions({ buttonClass: classes.buttonClass })}
      </div>
      <NavigationAuthLink buttonClass={classes.buttonClass} />
    </div>
  )
}

export default StaticTopNavigation
