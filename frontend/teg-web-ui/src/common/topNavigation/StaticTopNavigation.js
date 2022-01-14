import React from 'react'
import { Link } from 'react-router-dom'
import classnames from 'classnames'

import Typography from '@mui/material/Typography'
import Hidden from '@mui/material/Hidden'
import IconButton from '@mui/material/IconButton'
import MenuIcon from '@mui/icons-material/Menu'

import useStyle from './TopNavigationStyles'
import tegLogoNoTextSVG from 'url:./images/tegLogoNoText.svg'

import UserProfileMenu from './UserProfileMenu'

const StaticTopNavigation = ({
  title = () => (
    <span style={{ letterSpacing: 2 }}>
      <span style={{ fontWeight: 'lighter' }}>Print</span>
      <span>Spool</span>
    </span>
  ),
  onMenuButtonClick,
  className,
  avatar = localStorage.getItem('avatar'),
}) => {
  const classes = useStyle()

  const hasMenu = onMenuButtonClick != null

  return (
    <div className={className}>
      <div
        className={classnames(
          classes.mainMenu,
          hasMenu && classes.withMenu,
        )}
      >
        <Hidden mdDown={hasMenu}>
          <Link to="/">
            {/* <img
              alt="Teg"
              src={tegLogoNoTextSVG}
              className={classes.logo}
            /> */}
          </Link>
        </Hidden>
        <Hidden mdDown={!hasMenu} mdUp>
          <IconButton
            className={classes.buttonClass}
            aria-label="Menu"
            onClick={onMenuButtonClick}
            size="large">
            <MenuIcon />
          </IconButton>
        </Hidden>
        <Typography
          variant="h4"
          className={classes.title}
          component={React.forwardRef((props, ref) => (
            <Link to="/" innerRef={ref} {...props} />
          ))}
        >
          {title()}
        </Typography>
        <div
          className={classes.userProfileMenu}
        >
          <UserProfileMenu avatar={avatar}/>
        </div>
      </div>
    </div>
  );
}

export default StaticTopNavigation
