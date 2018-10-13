import React from 'react'
import {
  AppBar,
  Toolbar,
  Typography,
  withStyles,
} from '@material-ui/core'

import { drawerWidth } from './Drawer'
import EStopResetToggle from './EStopResetToggle'

const styles = theme => ({
  root: {
    width: '100%',
  },
  appBar: {
    position: 'absolute',
    marginLeft: drawerWidth,
    [theme.breakpoints.up('md')]: {
      width: `calc(100% - ${drawerWidth}px)`,
    },
  },
  flex: {
    flex: 1,
  },
  menuButton: {
    marginLeft: -12,
    marginRight: 20,
  },
  verticalReset: {
    marginTop: 88,
    width: '100%',
  },
})

const Header = ({
  classes,
  printer,
}) => (
  <div>
    <AppBar color="inherit" className={classes.appBar}>
      <Toolbar>
        {/*
          <IconButton className={classes.menuButton} color="inherit" aria-label="Menu">
            <MenuIcon />
          </IconButton>
        */}
        <Typography variant="h6" color="inherit" className={classes.flex}>
          {printer.name}
          <span style={{ color: '#999' }}>
            {' '}
            Powered by Tegh
          </span>
        </Typography>
        <EStopResetToggle printer={printer} />
      </Toolbar>
    </AppBar>
    <div className={classes.verticalReset} />
  </div>
)

export default withStyles(styles, { withTheme: true })(Header)
