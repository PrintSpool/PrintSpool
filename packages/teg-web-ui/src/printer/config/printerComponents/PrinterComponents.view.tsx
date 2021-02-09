import React from 'react'

import { Link } from 'react-router-dom'
import { gql } from '@apollo/client'

import Divider from '@material-ui/core/Divider'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import ListSubheader from '@material-ui/core/ListSubheader'
import Tooltip from '@material-ui/core/Tooltip'
import Fab from '@material-ui/core/Fab'

import Usb from '@material-ui/icons/Usb'
import Toys from '@material-ui/icons/Toys'
import VideoLabel from '@material-ui/icons/VideoLabel'
import Videocam from '@material-ui/icons/VideocamRounded'
import Widgets from '@material-ui/icons/Widgets'
import Waves from '@material-ui/icons/Waves'
import CompareArrows from '@material-ui/icons/CompareArrows'
import Add from '@material-ui/icons/Add'

import UpdateDialog, { UPDATE_DIALOG_FRAGMENT } from '../components/UpdateDialog/UpdateDialog.page'
import useDeleteConfig from '../components/useDeleteConfig'
import CreateComponentDialog from '../components/CreateComponentDialog/Index'

import transformComponentSchema from './transformComponentSchema'

import useStyles from './PrinterComponents.styles'

const componentsOfType = (components, ofType) => (
  components.filter(component => component.type === ofType)
)

const CATEGORIES = [
  {
    type: 'CONTROLLER',
    heading: 'Controllers',
    Icon: Usb,
  },
  {
    type: 'AXIS',
    heading: 'Axes',
    Icon: CompareArrows,
  },
  {
    type: 'TOOLHEAD',
    heading: 'Toolheads',
    Icon: Waves,
  },
  {
    type: 'BUILD_PLATFORM',
    heading: 'Build Platform',
    Icon: VideoLabel,
  },
  {
    type: 'FAN',
    heading: 'Fans',
    Icon: Toys,
  },
  {
    type: 'VIDEO',
    heading: 'Video Sources',
    Icon: Videocam,
  },
]

const PrinterComponentsView = ({
  machineID,
  components,
  fixedListComponentTypes,
  status,
  hasPendingUpdates,
  componentID,
  selectedComponent,
  devices,
  materials,
  videoSources,
  verb,
}) => {
  const classes = useStyles()

  useDeleteConfig({
    show: selectedComponent != null && verb === 'delete',
    id: selectedComponent?.id,
    collection: 'COMPONENT',
    machineID,
    type: selectedComponent?.type.toLowerCase(),
    title: selectedComponent?.name,
  })

  return (
    <main className={classes.root}>
      { componentID !== 'new' && selectedComponent != null && verb == null && (
        <UpdateDialog
          title={selectedComponent.name}
          open={selectedComponent != null}
          status={status}
          hasPendingUpdates={hasPendingUpdates}
          deleteButton={
            fixedListComponentTypes.includes(selectedComponent.type) === false
          }
          collection="COMPONENT"
          transformSchema={schema => transformComponentSchema({
            schema,
            materials,
            videoSources,
            devices,
          })}
          variables={{ machineID, componentID: selectedComponent.id }}
          query={gql`
            query($machineID: ID, $componentID: ID) {
              machines(input: {machineID: $machineID}) {
                components(input: {componentID: $componentID}) {
                  configForm {
                    ...UpdateDialogFragment
                  }
                }
              }
            }
            ${UPDATE_DIALOG_FRAGMENT}
          `}
        />
      )}
      { componentID === 'new' && (
        <CreateComponentDialog
          machineID={machineID}
          open
          fixedListComponentTypes={fixedListComponentTypes}
          devices={devices}
          materials={materials}
        />
      )}
      <Tooltip title="Add Component" placement="left">
        <Fab
          disabled={hasPendingUpdates || status === 'PRINTING'}
          component={React.forwardRef((props, ref) => (
            <Link
              to={componentID === 'new' ? './' : 'new/'}
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
        {
          CATEGORIES.map(({
            type,
            heading,
            Icon,
          }) => (
            <div key={type}>
              <ListSubheader>
                {heading}
              </ListSubheader>
              {
                componentsOfType(components, type).map(component => (
                  <ListItem
                    button
                    divider
                    key={component.id}
                    component={React.forwardRef((props, ref) => (
                      <Link
                        to={`${component.id}/`}
                        innerRef={ref}
                        {...props}
                      >
                        <ListItemIcon>
                          {
                            (
                              Icon && <Icon />
                            )
                            || <Widgets />
                          }
                        </ListItemIcon>
                        <ListItemText>
                          {component.name}
                        </ListItemText>
                      </Link>
                    ))}
                  />
                ))
              }
              <Divider />
            </div>
          ))
        }
      </List>
    </main>
  )
}

export default PrinterComponentsView
