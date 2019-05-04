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
  Widgets,
} from '@material-ui/icons'

import UpdateDialog, { UPDATE_DIALOG_FRAGMENT } from './components/UpdateDialog/Index'

import withLiveData from '../shared/higherOrderComponents/withLiveData'

import transformComponentSchema from './printerComponents/transformComponentSchema'

const DEVICES_SUBSCRIPTION = gql`
  subscription DevicesSubscription {
    live {
      patch { op, path, from, value }
      query {
        devices {
          id
          type
        }
      }
    }
  }
`

const enhance = compose(
  withRouter,
  withProps(({ match }) => ({
    printerID: match.params.printerID,
    printerDialogOpen: match.path === '/:hostID/:printerID/config/printer/',
    subscription: DEVICES_SUBSCRIPTION,
  })),
  withLiveData,
)

const ConfigPage = ({
  printerID,
  printerDialogOpen = false,
  devices,
  loading,
}) => (
  <main>
    {
      printerDialogOpen && !loading && (
        <UpdateDialog
          title="3D Printer"
          collection="MACHINE"
          open={printerDialogOpen}
          variables={{ printerID }}
          transformSchema={schema => transformComponentSchema({
            schema,
            materials: [],
            devices,
          })}
          query={gql`
            query($printerID: ID!) {
              printers(printerID: $printerID) {
                configForm {
                  ...UpdateDialogFragment
                }
              }
            }
            ${UPDATE_DIALOG_FRAGMENT}
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
        component={props => <Link to="plugins/" {...props} />}
      >
        <ListItemIcon>
          <Widgets />
        </ListItemIcon>
        <ListItemText primary="Plugins" />
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
