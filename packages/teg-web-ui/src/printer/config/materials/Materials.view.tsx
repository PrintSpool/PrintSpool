import React from 'react'
import { Link } from 'react-router-dom'

import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import Tooltip from '@material-ui/core/Tooltip'
import Fab from '@material-ui/core/Fab'

import Style from '@material-ui/icons/Style'
import Add from '@material-ui/icons/Add'

import { gql } from '@apollo/client'

import UpdateDialog, { UPDATE_DIALOG_FRAGMENT } from '../components/UpdateDialog/UpdateDialog.page'
import CreateMaterialDialog from '../components/CreateMaterialDialog/CreateMaterialDialog.page'
import useStyles from './Materials.styles'

const MaterialsConfigView = ({
  materialID,
  verb,
  materials,
  hasPendingUpdates,
  update,
}) => {
  const classes = useStyles()

  return (
    <main className={classes.root}>
      {
        materialID != null && verb == null && (
          <UpdateDialog
            title={(materials.find(m => m.id === materialID) || {}).name}
            open
            deleteButton
            status={'READY'}
            hasPendingUpdates={hasPendingUpdates}
            onSubmit={update}
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
      { verb === 'new' && (
        <CreateMaterialDialog open />
      )}
      <Tooltip title="Add Component" placement="left">
        <Fab
          disabled={hasPendingUpdates}
          component={React.forwardRef((props, ref) => (
            <Link
              to={verb === 'new' ? './' : 'new/'}
              innerRef={ref}
              style={{ textDecoration: 'none' }}
              {...props}
            />
          )) as any}
          className={classes.addFab}
        >
          <Add />
        </Fab>
      </Tooltip>
      <List>
        { materials.length === 0 && (
          <ListItem>
            <ListItemText secondary="No Materials Found. Add your first material to get started!" />
          </ListItem>
        )}
        {
          materials.map(material => (
            <ListItem
              button
              divider
              key={material.id}
              component={React.forwardRef((props, ref) => (
                <Link to={`${material.id}/`} innerRef={ref} {...props}>
                  <ListItemIcon>
                    <Style />
                  </ListItemIcon>
                  <ListItemText
                    primary={material.name}
                    secondary={material.shortSummary}
                  />
                </Link>
              ))}
            />
          ))
        }
      </List>
    </main>
  )
}

export default MaterialsConfigView
