import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  withStyles,
} from 'material-ui'

import { drawerWidth } from './Drawer'

const styles = (theme) => ({
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
  verticalReset: theme.mixins.toolbar
})

const Header = ({
  classes,
  name = 'Lulzbot 5',
}) => (
  <div>
    <AppBar color="inherit" className={ classes.appBar }>
      <Toolbar>
        {/*
          <IconButton className={classes.menuButton} color="inherit" aria-label="Menu">
            <MenuIcon />
          </IconButton>
        */}
        <Typography type="title" color="inherit" className={classes.flex}>
          {name} <span style={{color: '#999'}}>Powered by Tegh</span>
        </Typography>
        <Button color="secondary" raised>ESTOP</Button>
      </Toolbar>
    </AppBar>
    <div className={classes.verticalReset} />
  </div>
)

export default withStyles(styles, { withTheme: true })(Header)
