import React from 'react'
import { compose, withProps } from 'recompose'
import { Link } from 'react-router-dom'
import {
  Grid,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@material-ui/core'
import {
  Print,
  DeviceHub,
  Style,
} from '@material-ui/icons'

const enhance = compose(
)

const ConfigPage = () => (
  <main>
    <List component="nav">
      <ListItem
        button
        divider
        component={props => <Link to={'printer/'} {...props} />}
      >
        <ListItemIcon>
          <Print />
        </ListItemIcon>
        <ListItemText primary="3D Printer" />
      </ListItem>
      <ListItem
        button
        divider
        component={props => <Link to={'components/'} {...props} />}
      >
        <ListItemIcon>
          <DeviceHub />
        </ListItemIcon>
        <ListItemText primary="Components" />
      </ListItem>
      <ListItem
        button
        divider
        component={props => <Link to={'materials/'} {...props} />}
      >
        <ListItemIcon>
          <Style />
        </ListItemIcon>
        <ListItemText primary="Materials" />
      </ListItem>
    </List>
  </main>
)

export const Component = ConfigPage
export default enhance(ConfigPage)
