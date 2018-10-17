import React from 'react'
import {
  Drawer as MaterialUIDrawer,
  withStyles,
  Hidden,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListSubheader,
} from '@material-ui/core'
import {
  Inbox,
  OpenWith,
  Settings,
} from '@material-ui/icons'
import { Link } from 'react-router-dom'
import { withRouter } from 'react-router'
import gql from 'graphql-tag'

export const DrawerFragment = gql`
  fragment DrawerFragment on QueryRoot {
    printers {
      id
      name
    }
  }
`

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
  classes,
  text,
  href,
  location,
  icon,
}) => (
  <ListItem
    button
    component={props => <Link to={href} {...props} />}
    className={location.pathname === href ? classes.activeLink : null}
  >
    {
      icon &&
      <ListItemIcon>
        {icon}
      </ListItemIcon>
    }
    <ListItemText primary={text} />
  </ListItem>
))

const DrawerContents = ({ hostIdentity, printers, classes }) => (
  <div>
    <div className={classes.drawerHeader} />
    <Divider />
    <List>
      <DrawerLink
        text="Print Queue"
        icon={<Inbox />}
        href={`/${hostIdentity.id}/`}
        classes={classes}
      />
      {
        printers.map(printer => (
          <div
            key={printer.id}
          >
            <ListSubheader>{printer.name}</ListSubheader>
            <DrawerLink
              text="Manual Control"
              icon={<OpenWith />}
              href={`/${hostIdentity.id}/${printer.id}/manual-control`}
              classes={classes}
            />
            <DrawerLink
              text="Config"
              icon={<Settings />}
              href={`/${hostIdentity.id}/${printer.id}/config`}
              classes={classes}
            />
          </div>
        ))
      }
    </List>
  </div>
)

const Drawer = ({
  hostIdentity,
  printers,
  mobileOpen = false,
  handleDrawerToggle = () => null,
  classes,
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
        <DrawerContents
          hostIdentity={hostIdentity}
          printers={printers}
          classes={classes}
        />
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
        <DrawerContents
          hostIdentity={hostIdentity}
          printers={printers}
          classes={classes}
        />
      </MaterialUIDrawer>
    </Hidden>
  </div>
)

export default withStyles(styles, { withTheme: true })(Drawer)
