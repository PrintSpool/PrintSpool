import React from 'react'
import { compose, withProps } from 'recompose'
import { Link } from 'react-router-dom'
import {
  withStyles,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Fab,
} from '@material-ui/core'
import {
  Style,
  Add,
} from '@material-ui/icons'

import gql from 'graphql-tag'

import withLiveData from '../../shared/higherOrderComponents/withLiveData'

import UpdateDialog, { UPDATE_DIALOG_FRAGMENT } from '../components/UpdateDialog/Index'
import DeleteConfirmationDialog from '../components/DeleteConfirmationDialog'
import CreateMaterialDialog from '../components/CreateMaterialDialog/Index'

const CONFIG_SUBSCRIPTION = gql`
  subscription ConfigSubscription {
    live {
      patch { op, path, from, value }
      query {
        printers {
          id
          status
        }
        materials {
          id
          name
          shortSummary
        }
      }
    }
  }
`

const styles = theme => ({
  title: {
    paddingTop: theme.spacing.unit * 3,
  },
  addFab: {
    position: 'fixed',
    bottom: theme.spacing.unit * 4,
    right: theme.spacing.unit * 2,
  },
})

const enhance = compose(
  withProps(() => ({
    subscription: CONFIG_SUBSCRIPTION,
    variables: {},
  })),
  withLiveData,
  withStyles(styles, { withTheme: true }),
  withProps(({ match: { params } }) => ({
    materialID: params.materialID,
    verb: params.materialID === 'new' ? 'new' : params.verb,
  })),
)

const MaterialsConfigIndex = ({
  classes,
  materials,
  materialID,
  verb,
  printers,
}) => (
  <main>
    {
      materialID != null && verb == null && (
        <UpdateDialog
          title={(materials.find(m => m.id === materialID) || {}).name}
          open
          deleteButton
          status={printers[0].status}
          collection="MATERIAL"
          variables={{ materialID }}
          query={gql`
            query($materialID: ID) {
              materials(materialID: $materialID) {
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
    { materialID != null && verb === 'delete' && (
      <DeleteConfirmationDialog
        type="material"
        title={materialID}
        id={materialID}
        collection="MATERIAL"
        open={materialID != null}
      />
    )}
    <CreateMaterialDialog
      open={verb === 'new'}
    />
    <Tooltip title="Add Component" placement="left">
      <Link to="new/" style={{ textDecoration: 'none' }}>
        <Fab
          component="label"
          className={classes.addFab}
        >
          <Add />
        </Fab>
      </Link>
    </Tooltip>
    <List>
      {
        materials.map(material => (
          <ListItem
            button
            divider
            key={material.id}
            component={props => <Link to={`${material.id}/`} {...props} />}
          >
            <ListItemIcon>
              <Style />
            </ListItemIcon>
            <ListItemText
              primary={material.name}
              secondary={material.shortSummary}
            />
          </ListItem>
        ))
      }
    </List>
  </main>
)

export const Component = withStyles(styles, { withTheme: true })(
  MaterialsConfigIndex,
)
export default enhance(MaterialsConfigIndex)
