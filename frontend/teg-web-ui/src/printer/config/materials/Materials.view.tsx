import React from 'react'
import { Link } from 'react-router-dom'

import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Tooltip from '@mui/material/Tooltip'
import Fab from '@mui/material/Fab'

import Style from '@mui/icons-material/Style'
import Add from '@mui/icons-material/Add'

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
  updateMutation,
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
            updateMutation={updateMutation}
            variables={{ materialID }}
            query={gql`
              query($materialID: ID) {
                materials(input: { materialID: $materialID }) {
                  configForm {
                    ...ConfigFormFragment
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
