import React from 'react'
import { Link } from 'react-router-dom'
import classnames from 'classnames'

import {
  Typography,
} from '@material-ui/core'

import TopNavigationStyles from './TopNavigationStyles'
import teghLogoNoTextSVG from './images/teghLogoNoText.svg'

const StaticTopNavigation = ({
  title = () => null,
  actions = () => null,
  className,
}) => {
  const classes = TopNavigationStyles()

  return (
    <div className={classnames(classes.root, className)}>
      <Link to="/">
        <img
          alt="Tegh"
          src={teghLogoNoTextSVG}
          className={classes.logo}
        />
      </Link>
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
