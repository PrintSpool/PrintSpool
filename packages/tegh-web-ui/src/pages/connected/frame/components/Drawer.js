import React from 'react'
import {
  Drawer as MaterialUIDrawer,
  withStyles,
  Hidden,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListSubheader,
} from '@material-ui/core'
import {
  Inbox,
  OpenWith,
  Code,
  Keyboard,
  Settings,
  Home,
} from '@material-ui/icons'
import { Link } from 'react-router-dom'
import { withRouter } from 'react-router'
import gql from 'graphql-tag'
import classnames from 'classnames'

export const DrawerFragment = gql`
  fragment DrawerFragment on Query {
    printers {
      id
      name
    }
  }
`

export const drawerWidth = 240

const styles = theme => ({
  // root: {
  //   height: '100%'
  //   width: '100%',
  //   height: 430,
  //   zIndex: 1,
  //   overflow: 'hidden',
  // },
  navIconHide: {
    [theme.breakpoints.up('md')]: {
      display: 'none',
    },
  },
  fullHeight: {
    height: '100%',
  },
  drawerRoot: {
    height: '100%',
  },
  drawerPaper: {
    width: 250,
    height: '100%',
    [theme.breakpoints.up('md')]: {
      width: drawerWidth,
      position: 'inherit',
      top: 'inherit',
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
      icon && (
        <ListItemIcon>
          {icon}
        </ListItemIcon>
      )
    }
    <ListItemText primary={text} />
  </ListItem>
))

const DrawerContents = ({ hostIdentity, printers, classes }) => (
  <div>
    <List>
      <Hidden mdUp>
        <DrawerLink
          text="Home"
          icon={<Home />}
          href="/"
          classes={classes}
        />
      </Hidden>
      <ListSubheader>Print Queue</ListSubheader>
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
              text="Control Panel"
              icon={<OpenWith />}
              href={`/${hostIdentity.id}/${printer.id}/manual-control/`}
              classes={classes}
            />
            <DrawerLink
              text="GraphQL"
              icon={<Code />}
              href={`/${hostIdentity.id}/${printer.id}/terminal/`}
              classes={classes}
            />
            <DrawerLink
              text="Terminal"
              icon={<Keyboard />}
              href={`/${hostIdentity.id}/${printer.id}/terminal/`}
              classes={classes}
            />
            <DrawerLink
              text="Config"
              icon={<Settings />}
              href={`/${hostIdentity.id}/${printer.id}/config/`}
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
  mobileOpen,
  onClose,
  classes,
  className,
}) => (
  <div className={classnames(classes.fullHeight, className)}>
    <Hidden mdUp className={classes.fullHeight}>
      <MaterialUIDrawer
        type="temporary"
        anchor="left"
        open={mobileOpen}
        onClose={onClose}
        classes={{
          root: classes.drawerRoot,
          paper: classes.drawerPaper,
        }}
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
    <Hidden smDown implementation="css" className={classes.fullHeight}>
      <MaterialUIDrawer
        variant="persistent"
        open
        classes={{
          root: classes.drawerRoot,
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
