import React, { useMemo, useCallback } from 'react'
import { useLocation, useParams } from 'react-router'
import { Link } from 'react-router-dom'

import MaterialUIDrawer from '@mui/material/Drawer'
import Hidden from '@mui/material/Hidden'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import ListSubheader from '@mui/material/ListSubheader'

import Inbox from '@mui/icons-material/Inbox'
import Star from '@mui/icons-material/Star'
import OpenWith from '@mui/icons-material/OpenWith'
import Code from '@mui/icons-material/Code'
import Keyboard from '@mui/icons-material/Keyboard'
import Settings from '@mui/icons-material/Settings'
import Home from '@mui/icons-material/Home'

import useStyles from './Drawer.styles'

const Drawer = ({
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
    altPrefixes = [],
  }) => {
    let isActive = exact ? location.pathname === href : location.pathname.startsWith(href)

    isActive ||= altPrefixes.some(altPrefix => location.pathname.startsWith(altPrefix))

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
        <ListSubheader>{machine.name}</ListSubheader>
        <DrawerLink
          text="Printing"
          icon={<Inbox />}
          href={`/${hostID}/${machineID}/`}
          altPrefixes={[
            `/${hostID}/${machineID}/printing/`,
            `/${hostID}/${machineID}/print/`,
          ]}
          exact
        />
        <DrawerLink
          text="Starred"
          icon={<Star />}
          href={`/${hostID}/${machineID}/starred/`}
        />
        { machine.length > 1 && (
          <ListSubheader>
            { machine.name }
          </ListSubheader>
        )}
        <DrawerLink
          text="Maintenance"
          icon={<OpenWith />}
          href={`/${hostID}/${machineID}/manual-control/`}
        />
        <DrawerLink
          text="Terminal"
          icon={<Keyboard />}
          href={`/${hostID}/${machineID}/terminal/`}
        />
        <DrawerLink
          text="Settings"
          icon={<Settings />}
          href={`/${hostID}/${machineID}/config/`}
        />
        {machine.developerMode && (
          <>
            <ListSubheader>Dev Tools</ListSubheader>
            <DrawerLink
              text="GraphQL"
              icon={<Code />}
              href={`/${hostID}/${machineID}/graphql-playground/`}
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
      <Hidden mdDown implementation="css">
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
  );
}

export default Drawer
