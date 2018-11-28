import React from 'react'
import { compose, withProps } from 'recompose'
import { Link } from 'react-router-dom'
import { withRouter } from 'react-router'
import gql from 'graphql-tag'

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
import FormDialog, { FORM_DIALOG_FRAGMENT } from './components/FormDialog'

import withLiveData, { NULL_SUBSCRIPTION } from '../shared/higherOrderComponents/withLiveData'

const enhance = compose(
  withRouter,
  patchConfigMutation,
  withProps(({ match }) => ({
    printerID: match.params.printerID,
    printerDialogOpen: match.path === '/:hostID/:printerID/config/printer/',
    subscription: NULL_SUBSCRIPTION,
  })),
  withLiveData,
)

const ConfigPage = ({
  printerID,
  printerDialogOpen = false,
}) => (
  <main>
    {
      printerDialogOpen && (
        <FormDialog
          title="3D Printer"
          form={`config/printer/${printerID}/packages/tegh-core`}
          open={printerDialogOpen}
          variables={{ printerID }}
          query={gql`
            query($printerID: ID!) {
              printerConfigs(printerID: $printerID) {
                plugins(package: "tegh-core") {
                  ...FormDialogFragment
                }
              }
            }
            ${FORM_DIALOG_FRAGMENT}
          `}
        />
      )
    }
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
