import React, { useMemo, useCallback } from 'react'
import { useLocation, useParams } from 'react-router'
import { Link } from 'react-router-dom'

import MaterialUIDrawer from '@material-ui/core/Drawer'
import Hidden from '@material-ui/core/Hidden'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import ListSubheader from '@material-ui/core/ListSubheader'

import Inbox from '@material-ui/icons/Inbox'
import Star from '@material-ui/icons/Star'
import OpenWith from '@material-ui/icons/OpenWith'
import Code from '@material-ui/icons/Code'
import Keyboard from '@material-ui/icons/Keyboard'
import Settings from '@material-ui/icons/Settings'
import Home from '@material-ui/icons/Home'

import useStyles from './Drawer.styles'

const Drawer = ({
  match,
  machine,
  mobileOpen,
  onClose,
  className,
}) => {
  const classes = useStyles()
  const location = useLocation()
  const { hostID, machineID } = useParams()

  const DrawerLink = useCallback(({
    text,
    href,
    icon,
    newTab,
    exact = false,
    altPrefix = null,
  }) => {
    let isActive = exact ? location.pathname === href : location.pathname.startsWith(href)

    if (altPrefix != null) {
      isActive ||= location.pathname.startsWith(altPrefix)
    }

    const linkComponent = useMemo(() => React.forwardRef((props, ref) => (
      <Link
        to={href}
        target={newTab ? '_blank' : null}
        innerRef={ref}
        {...props}
      />
    )), [href])

    return (
      <ListItem
        button
        component={linkComponent as any}
        onClick={onClose}
        className={isActive ? classes.activeLink : ''}
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
    )
  }, [location])

  const drawerContent = () => (
    <div>
      <List className={classes.drawerContents}>
        <Hidden mdUp>
          <DrawerLink
            text="Home"
            icon={<Home />}
            href="/"
            exact
          />
        </Hidden>
        <ListSubheader>{machine.name}</ListSubheader>
        <DrawerLink
          text="Printing"
          icon={<Inbox />}
          href={`/m/${hostID}/${machineID}/`}
          altPrefix={`/m/${hostID}/${machineID}/printing/`}
          exact
        />
        <DrawerLink
          text="Starred"
          icon={<Star />}
          href={`/m/${hostID}/${machineID}/starred/`}
        />
        { machine.length > 1 && (
          <ListSubheader>
            { machine.name }
          </ListSubheader>
        )}
        <DrawerLink
          text="Maintenance"
          icon={<OpenWith />}
          href={`/m/${hostID}/${machineID}/manual-control/`}
        />
        <DrawerLink
          text="Terminal"
          icon={<Keyboard />}
          href={`/m/${hostID}/${machineID}/terminal/`}
        />
        <DrawerLink
          text="Settings"
          icon={<Settings />}
          href={`/m/${hostID}/${machineID}/config/`}
        />
        {machine.developerMode && (
          <>
            <ListSubheader>Dev Tools</ListSubheader>
            <DrawerLink
              text="GraphQL"
              icon={<Code />}
              href={`/m/${hostID}/${machineID}/graphql-playground/`}
              newTab
            />
          </>
        )}
      </List>
    </div>
  )

  return (
    <div className={`${classes.fullHeight} ${className}`}>
      <Hidden mdUp>
        <MaterialUIDrawer
          // type="temporary"
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
          { drawerContent() }
        </MaterialUIDrawer>
      </Hidden>
      <Hidden smDown implementation="css">
        <MaterialUIDrawer
          variant="persistent"
          open
          classes={{
            root: classes.drawerRoot,
            paper: classes.drawerPaper,
          }}
        >
          { drawerContent() }
        </MaterialUIDrawer>
      </Hidden>
    </div>
  )
}

export default Drawer
