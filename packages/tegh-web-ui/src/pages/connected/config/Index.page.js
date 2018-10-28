import React from 'react'
import { compose, withProps } from 'recompose'
import { Link } from 'react-router-dom'
import { withRouter } from 'react-router'
import {
  Grid,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@material-ui/core'
import {
  Print,
  DeviceHub,
  Style,
} from '@material-ui/icons'

import PrinterConfigPage from './Printer.page'

import { List } from 'immutable'
import { graphql } from 'react-apollo'
import gql from 'graphql-tag'

import fastJsonPatch from 'fast-json-patch'

const patchConfigGraphQL = gql`
  mutation patchConfig($input: PatchConfigInput!) {
    patchConfig(input: $input)
  }
`

const patchConfigMutation = graphql(patchConfigGraphQL, {
  props: ({ mutate, ownProps }) => {
    const patchConfig = ({ patch }) => {
      mutate({
        variables: {
          input: {
            printerID: ownProps.match.printerID,
            patch,
          },
        },
      })
    }

    return {
      patchConfig,
      updateSubConfig: (nextConfig) => {
        // TODO: patch generation
        const patch = fastJsonPatch.compare(ownProps.config, nextConfig)
        patchConfig({ patch })
      },
      addSubConfig: ({ path, value }) => {
        const patch = {
          op: 'add',
          path,
          value,
        }
        patchConfig({ patch })
      },
    }
  },
})

const enhance = compose(
  withRouter,
  patchConfigMutation,
  withProps(ownProps => ({
    printerDialog: {
      open: ownProps.printerDialogOpen,
      onSave: ownProps.updateSubConfig,
    },
  })),
)

const ConfigPage = ({
  config,
  printerDialog: { open, onSave },
  history,
}) => (
  <main>
    <Dialog
      open={open}
      onClose={() => history.goBack()}
      aria-labelledby="form-dialog-title"
    >
      <DialogTitle id="form-dialog-title">3D Printer</DialogTitle>
      <DialogContent>
        <PrinterConfigPage
          config={config}
          initialValues={config}
        />
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => history.goBack()}
          color="primary"
        >
          Cancel
        </Button>
        <Button onClick={onSave} color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>

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
