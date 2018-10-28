import React from 'react'
import { compose } from 'recompose'
import { Link } from 'react-router-dom'
import { withRouter } from 'react-router'
import {
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@material-ui/core'
import {
  Print,
  DeviceHub,
  Style,
} from '@material-ui/icons'

import patchConfigMutation from './mutations/patchConfig'
import FormDialog from './components/FormDialog'
import PrinterConfigPage from './Printer.page'

const enhance = compose(
  withRouter,
  patchConfigMutation,
)

const ConfigPage = ({
  config,
  printerDialogOpen = false,
  updateSubConfig,
}) => (
  <main>
    <FormDialog
      form="printer"
      Page={PrinterConfigPage}
      open={printerDialogOpen}
      onSubmit={updateSubConfig}
      config={config}
    />

    <List component="nav">
      <ListItem
        button
        divider
        component={props => <Link to="printer/" {...props} />}
      >
        <ListItemIcon>
          <Print />
        </ListItemIcon>
        <ListItemText primary="3D Printer" />
      </ListItem>
      <ListItem
        button
        divider
        component={props => <Link to="components/" {...props} />}
      >
        <ListItemIcon>
          <DeviceHub />
        </ListItemIcon>
        <ListItemText primary="Components" />
      </ListItem>
      <ListItem
        button
        divider
        component={props => <Link to="materials/" {...props} />}
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
