import React from 'react'
import { compose, withProps } from 'recompose'
import { Link } from 'react-router-dom'
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Fab,
} from '@material-ui/core'
import {
  withStyles,
} from '@material-ui/styles'

import Style from '@material-ui/icons/Style'
import Add from '@material-ui/icons/Add'

import gql from 'graphql-tag'

import withLiveData from '../../common/higherOrderComponents/withLiveData'

import UpdateDialog, { UPDATE_DIALOG_FRAGMENT } from '../components/UpdateDialog/Index'
import DeleteConfirmationDialog from '../components/DeleteConfirmationDialog'
import CreateMaterialDialog from '../components/CreateMaterialDialog/Index'

const CONFIG_SUBSCRIPTION = gql`
  subscription ConfigSubscription {
    live {
      patch { op, path, from, value }
      query {
        hasPendingUpdates
        machines {
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
  root: {
    overflowY: 'scroll',
  },
  title: {
    paddingTop: theme.spacing(3),
  },
  addFab: {
    position: 'fixed',
    bottom: theme.spacing(4),
    right: theme.spacing(2),
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
  machines,
  hasPendingUpdates,
}) => (
  <main className={classes.root}>
    {
      materialID != null && verb == null && (
        <UpdateDialog
          title={(materials.find(m => m.id === materialID) || {}).name}
          open
          deleteButton
          status={machines[0].status}
          hasPendingUpdates={hasPendingUpdates}
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
    { verb === 'new' && (
      <CreateMaterialDialog open />
    )}
    <Tooltip title="Add Component" placement="left">
      <Fab
        disabled={hasPendingUpdates || machines[0].status === 'PRINTING'}
        component={React.forwardRef((props, ref) => (
          <Link
            to={verb === 'new' ? './' : 'new/'}
            innerRef={ref}
            style={{ textDecoration: 'none' }}
            {...props}
          />
        ))}
        className={classes.addFab}
      >
        <Add />
      </Fab>
    </Tooltip>
    <List>
      {
        materials.map(material => (
          <ListItem
            button
            divider
            key={material.id}
            component={React.forwardRef((props, ref) => (
              <Link to={`${material.id}/`} innerRef={ref} {...props} />
            ))}
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
