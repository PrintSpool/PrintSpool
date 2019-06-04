import React from 'react'
import { Link } from 'react-router-dom'
import classnames from 'classnames'

import {
  Typography,
  Hidden,
  IconButton,
} from '@material-ui/core'
import {
  Menu as MenuIcon,
} from '@material-ui/icons'

import TopNavigationStyles from './TopNavigationStyles'
import teghLogoNoTextSVG from './images/teghLogoNoText.svg'

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
            alt="Tegh"
            src={teghLogoNoTextSVG}
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
      <Typography variant="h5" inline className={classes.title}>
        {title()}
      </Typography>
      <div
        className={classes.actions}
      >
        {actions({ buttonClass: classes.buttonClass })}
      </div>
    </div>
  )
}

export default StaticTopNavigation
