import React from 'react'
import { compose, withProps } from 'recompose'
import { Link } from 'react-router-dom'
import {
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Tooltip,
  Fab,
} from '@material-ui/core'
import {
  withStyles,
} from '@material-ui/styles'

import Usb from '@material-ui/icons/Usb'
import Toys from '@material-ui/icons/Toys'
import VideoLabel from '@material-ui/icons/VideoLabel'
import Widgets from '@material-ui/icons/Widgets'
import Waves from '@material-ui/icons/Waves'
import CompareArrows from '@material-ui/icons/CompareArrows'
import Add from '@material-ui/icons/Add'

import gql from 'graphql-tag'

import withLiveData from '../../common/higherOrderComponents/withLiveData'

import UpdateDialog, { UPDATE_DIALOG_FRAGMENT } from '../components/UpdateDialog/Index'
import DeleteConfirmationDialog from '../components/DeleteConfirmationDialog'
import CreateComponentDialog from '../components/CreateComponentDialog/Index'

import transformComponentSchema from './transformComponentSchema'

const COMPONENTS_SUBSCRIPTION = gql`
  subscription ConfigSubscription($machineID: ID!) {
    live {
      patch { op, path, from, value }
      query {
        hasPendingUpdates
        devices {
          id
        }
        materials {
          id
          name
        }
        machines(machineID: $machineID) {
          id
          status
          fixedListComponentTypes
          components {
            id
            type
            name
          }
        }
      }
    }
  }
`

const styles = theme => ({
  title: {
    paddingTop: theme.spacing(3),
  },
  addFab: {
    position: 'fixed',
    zIndex: 10,
    bottom: theme.spacing(4),
    right: theme.spacing(2),
  },
})

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
]

const enhance = compose(
  withProps(ownProps => ({
    subscription: COMPONENTS_SUBSCRIPTION,
    variables: {
      machineID: ownProps.match.params.machineID,
    },
  })),
  withLiveData,
  withProps(({ machines, match }) => {
    const { componentID, machineID, verb } = match.params
    const { components, fixedListComponentTypes, status } = machines[0]

    return {
      selectedComponent: components.find(c => c.id === componentID),
      components,
      fixedListComponentTypes,
      status,
      machineID,
      componentID,
      verb,
    }
  }),
  withStyles(styles, { withTheme: true }),
)

const ComponentsConfigIndex = ({
  classes,
  machineID,
  components,
  fixedListComponentTypes,
  status,
  hasPendingUpdates,
  componentID,
  selectedComponent,
  devices,
  materials,
  verb,
}) => (
  <main>
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
          devices,
        })}
        variables={{ machineID, componentID: selectedComponent.id }}
        query={gql`
          query($machineID: ID!, $componentID: ID) {
            machines(machineID: $machineID) {
              components(componentID: $componentID) {
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
    { selectedComponent != null && verb === 'delete' && (
      <DeleteConfirmationDialog
        type={selectedComponent.type.toLowerCase()}
        title={selectedComponent.name}
        id={selectedComponent.id}
        collection="COMPONENT"
        machineID={machineID}
        open={selectedComponent != null}
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
        ))}
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
                    />
                  ))}
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
                </ListItem>
              ))
            }
            <Divider />
          </div>
        ))
      }
    </List>
  </main>
)

export const Component = withStyles(styles, { withTheme: true })(
  ComponentsConfigIndex,
)
export default enhance(ComponentsConfigIndex)
