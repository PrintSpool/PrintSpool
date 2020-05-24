import React from 'react'
import { compose, withProps } from 'recompose'
import { Link } from 'react-router-dom'
import useReactRouter from 'use-react-router'

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
import Videocam from '@material-ui/icons/VideocamRounded'
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
import useLiveSubscription from '../../_hooks/useLiveSubscription'

import useStyles from './PrinterComponents.styles'
import PrinterComponentsView from './PrinterComponents.view'

const COMPONENTS_SUBSCRIPTION = gql`
  subscription ConfigSubscription($machineID: ID!) {
    live {
      patch { op, path, from, value }
      query {
        hasPendingUpdates
        devices {
          id
        }
        videoSources {
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

const PrinterComponentsPage = () => {
  const { match: { params } } = useReactRouter()
  const { componentID, machineID, verb } = params

  const { data, error, loading } = useLiveSubscription(COMPONENTS_SUBSCRIPTION, {
    variables: {
      machineID,
    },
  })

  if (loading) {
    return <div />
  }

  if (error) {
    throw error
  }

  const { machines } = data
  const { components, fixedListComponentTypes, status } = machines[0]

  return (
    <PrinterComponentsView
      {...{
        ...data,
        selectedComponent: components.find(c => c.id === componentID),
        components,
        fixedListComponentTypes,
        status,
        machineID,
        componentID,
        verb,
      }}
    />
  )
}

export default PrinterComponentsPage
