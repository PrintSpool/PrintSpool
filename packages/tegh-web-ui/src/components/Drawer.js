import {
  Drawer as MaterialUIDrawer,
  withStyles,
  Hidden,
  Divider,
  List,
  ListItem,
  ListItemText,
} from '@material-ui/core'
import Link from 'next/link'
import { withRouter } from 'next/router'

export const drawerWidth = 240

const styles = theme => ({
  root: {
    width: '100%',
    height: 430,
    marginTop: theme.spacing.unit * 3,
    zIndex: 1,
    overflow: 'hidden',
  },
  navIconHide: {
    [theme.breakpoints.up('md')]: {
      display: 'none',
    },
  },
  fullHeight: {
    height: '100vh',
  },
  drawerHeader: theme.mixins.toolbar,
  drawerPaper: {
    width: 250,
    [theme.breakpoints.up('md')]: {
      width: drawerWidth,
      position: 'relative',
      height: '100vh',
    },
  },
  content: {
    backgroundColor: theme.palette.background.default,
    width: '100%',
    padding: theme.spacing.unit * 3,
    height: 'calc(100% - 56px)',
    marginTop: 56,
    [theme.breakpoints.up('sm')]: {
      height: 'calc(100% - 64px)',
      marginTop: 64,
    },
  },
  activeLink: {
    backgroundColor: '#ccc',
  },
})

const DrawerLink = withRouter(({
  classes, text, href, router,
}) => (
  <Link href={href}>
    <ListItem
      button
      className={router.pathname === href ? classes.activeLink : null}
    >
      {/*
        <ListItemIcon>
          <InboxIcon />
        </ListItemIcon>
      */}
      <ListItemText primary={text} />
    </ListItem>
  </Link>
))

const DrawerContents = ({ classes }) => (
  <div>
    <div className={classes.drawerHeader} />
    <Divider />
    <List>
      <DrawerLink
        text="Print"
        href="/"
        classes={classes}
      />
      <DrawerLink
        text="Manual Control"
        href="/manual-control"
        classes={classes}
      />
    </List>
  </div>
)

const Drawer = ({
  mobileOpen = false,
  handleDrawerToggle = () => null,
  classes,
  theme,
}) => (
  <div className={classes.fullHeight}>
    <Hidden mdUp>
      <MaterialUIDrawer
        type="temporary"
        anchor="left"
        open={mobileOpen}
        classes={{
          paper: classes.drawerPaper,
        }}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
      >
        <DrawerContents classes={classes} />
      </MaterialUIDrawer>
    </Hidden>
    <Hidden smDown implementation="css">
      <MaterialUIDrawer
        variant="persistent"
        open
        classes={{
          paper: classes.drawerPaper,
        }}
      >
        <DrawerContents classes={classes} />
      </MaterialUIDrawer>
    </Hidden>
  </div>
)

export default withStyles(styles, { withTheme: true })(Drawer)
