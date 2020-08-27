import React, { useMemo, useCallback } from 'react'

import MaterialUIDrawer from '@material-ui/core/Drawer'
import Hidden from '@material-ui/core/Hidden'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import ListSubheader from '@material-ui/core/ListSubheader'

import Inbox from '@material-ui/icons/Inbox'
import OpenWith from '@material-ui/icons/OpenWith'
import Code from '@material-ui/icons/Code'
import Keyboard from '@material-ui/icons/Keyboard'
import Settings from '@material-ui/icons/Settings'
import Home from '@material-ui/icons/Home'

import { Link } from 'react-router-dom'
import gql from 'graphql-tag'
import useStyles from './Drawer.styles'
import useRouter from 'use-react-router'

export const DrawerFragment = gql`
  fragment DrawerFragment on Query {
    machines {
      id
      name
    }
  }
`

const Drawer = ({
  machineSlug,
  machines,
  mobileOpen,
  onClose,
  className,
}) => {
  const classes = useStyles()
  const { location } = useRouter()

  const DrawerLink = useCallback(({
    text,
    href,
    icon,
  }) => {
    const linkComponent = useMemo(() => React.forwardRef((props, ref) => (
      <Link to={href} innerRef={ref} {...props} />
    )), [href])

    return (
      <ListItem
        button
        component={linkComponent as any}
        onClick={onClose}
        className={location.pathname === href ? classes.activeLink : ''}
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
          />
        </Hidden>
        { machines[0] && (
          <ListSubheader>{machines[0].name}</ListSubheader>
        )}
        <DrawerLink
          text="Printing"
          icon={<Inbox />}
          href={`/q/${machineSlug}/`}
        />
        {
          machines.map(machine => (
            <div
              key={machine.id}
            >
              { machine.length > 1 && (
                <ListSubheader>
                  { machine.name }
                </ListSubheader>
              )}
              <DrawerLink
                text="Maintenance"
                icon={<OpenWith />}
                href={`/m/${machineSlug}/${machine.id}/manual-control/`}
              />
              <DrawerLink
                text="Terminal"
                icon={<Keyboard />}
                href={`/m/${machineSlug}/${machine.id}/terminal/`}
              />
              <DrawerLink
                text="Settings"
                icon={<Settings />}
                href={`/m/${machineSlug}/${machine.id}/config/`}
              />
            </div>
          ))
        }
        <ListSubheader>Dev Tools</ListSubheader>
        <DrawerLink
          text="GraphQL"
          icon={<Code />}
          href={`/q/${machineSlug}/graphql-playground/`}
        />
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
