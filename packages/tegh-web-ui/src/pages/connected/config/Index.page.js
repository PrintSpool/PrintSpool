import React from 'react'
import { compose, withProps } from 'recompose'
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
      <ListItem button>
        <ListItemIcon>
          <Print />
        </ListItemIcon>
        <ListItemText primary="3D Printer" />
      </ListItem>
      <ListItem button>
        <ListItemIcon>
          <DeviceHub />
        </ListItemIcon>
        <ListItemText primary="Components" />
      </ListItem>
      <ListItem button>
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
