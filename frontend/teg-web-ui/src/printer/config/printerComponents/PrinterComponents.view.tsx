import React from 'react'

import { Link, useParams } from 'react-router-dom'
import { gql } from '@apollo/client'

import Divider from '@mui/material/Divider'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
// import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import ListSubheader from '@mui/material/ListSubheader'
import Tooltip from '@mui/material/Tooltip'
import Fab from '@mui/material/Fab'
import Typography from '@mui/material/Typography'
import MUILink from '@mui/material/Link'

// import Usb from '@mui/icons-material/Usb'
// import Toys from '@mui/icons-material/Toys'
// import VideoLabel from '@mui/icons-material/VideoLabel'
// import Videocam from '@mui/icons-material/VideocamRounded'
// import Widgets from '@mui/icons-material/Widgets'
// import Waves from '@mui/icons-material/Waves'
// import CompareArrows from '@mui/icons-material/CompareArrows'
import Add from '@mui/icons-material/Add'

import UpdateDialog, { UPDATE_DIALOG_FRAGMENT } from '../components/UpdateDialog/UpdateDialog.page'
import CreateComponentDialog from '../components/CreateComponentDialog/CreateComponentDialog.page'

import transformComponentSchema from './transformComponentSchema'

import useStyles from './PrinterComponents.styles'
import ServerBreadcrumbs from '../../common/ServerBreadcrumbs'

const componentsOfType = (components, ofType) => (
  components.filter(component => component.type === ofType)
)

const CATEGORIES = [
  {
    type: 'CONTROLLER',
    heading: 'Controllers',
    // Icon: Usb,
  },
  {
    type: 'AXIS',
    heading: 'Axes',
    // Icon: CompareArrows,
  },
  {
    type: 'TOOLHEAD',
    heading: 'Toolheads',
    // Icon: Waves,
  },
  {
    type: 'BUILD_PLATFORM',
    heading: 'Build Platform',
    // Icon: VideoLabel,
  },
  {
    type: 'FAN',
    heading: 'Fans',
    // Icon: Toys,
  },
  {
    type: 'VIDEO',
    heading: 'Video Sources',
    // Icon: Videocam,
  },
]

const PrinterComponentsView = ({
  machine,
  components,
  fixedListComponentTypes,
  videoSources,
  status,
  updateMutation,
  onSubmit,
  hasPendingUpdates = false,
  componentID,
  selectedComponent,
  devices,
  materials,
  verb,
}) => {
  const classes = useStyles()
  const { hostID, machineID } = useParams()

  const { serialPortID } = selectedComponent?.configForm.model || {}
  const addSerialPortDevice = serialPortID && devices.every(device => device.id !== serialPortID)

  const { source } = selectedComponent?.configForm.model || {}
  const addVideoSource = source && videoSources.every(videoSource => videoSource.id !== source)

  const transformSchema = schema => transformComponentSchema({
    schema,
    materials,
    videoSources: [
      ...videoSources,
      // Add the current video source to the list of devices even if it is not connected
      ...(addVideoSource ? [{ id: source }] : []),
    ],
    devices: [
      ...devices,
      // Add the current serial port ID to the list of devices even if it is not connected
      ...(addSerialPortDevice ? [{ id: serialPortID }] : []),
    ],
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
          transformSchema={transformSchema}
          updateMutation={updateMutation}
          onSubmit={onSubmit}
          variables={{ machineID: machine.id, componentID: selectedComponent.id }}
          query={gql`
            query($machineID: ID, $componentID: ID) {
              machines(input: {machineID: $machineID}) {
                developerMode

                components(input: {componentID: $componentID}) {
                  configForm {
                    ...ConfigFormFragment
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
          open
          developerMode={machine.developerMode}
          fixedListComponentTypes={fixedListComponentTypes}
          transformSchema={transformSchema}
        />
      )}
      <Tooltip title="Add Component" placement="left">
        <Fab
          disabled={hasPendingUpdates}
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

      <div style={{ marginTop: 16, marginLeft: 16, marginRight: 16 }}>
        <ServerBreadcrumbs machineName={machine.name}>
          <MUILink color="inherit" component={Link} to={`/${hostID}/${machineID}/config`}>
            Config
          </MUILink>
          <Typography color="textPrimary">Print Components</Typography>
        </ServerBreadcrumbs>
      </div>
      <List>
        {
          CATEGORIES.map(({
            type,
            heading,
            // Icon,
          }) => (
            <div key={type}>
              <ListSubheader>
                {heading}
              </ListSubheader>
              { componentsOfType(components, type).length === 0 && (
                <ListItem>
                  <ListItemText secondary="None" />
                </ListItem>
              )}
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
                        {/* <ListItemIcon>
                          {
                            (
                              Icon && <Icon />
                            )
                            || <Widgets />
                          }
                        </ListItemIcon> */}
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
