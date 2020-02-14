import React from 'react'
import { compose, withProps } from 'recompose'
import {
  Grid,
  Typography,
} from '@material-ui/core'
import Loader from 'react-loader-advanced'
import gql from 'graphql-tag'

import withLiveData from '../common/higherOrderComponents/withLiveData'

import PrinterStatusGraphQL from '../common/PrinterStatus.graphql.js'

import Home from './home/Home'
import MotorsEnabled from './MotorsEnabled'
import XYJogButtons from './jog/XYJogButtons'
import ZJogButtons from './jog/ZJogButtons'
import ComponentControl, { ComponentControlFragment } from './printerComponents/ComponentControl'
import VideoStreamer from './videoStreamer/VideoStreamer'

const MANUAL_CONTROL_SUBSCRIPTION = gql`
  subscription ManualControlSubscription($machineID: ID!) {
    live {
      patch { op, path, from, value }
      query {
        singularMachine: machines(machineID: $machineID) {
          ...PrinterStatus
          motorsEnabled
          components {
            ...ComponentControlFragment
          }
        }
      }
    }
  }

  # fragments
  ${PrinterStatusGraphQL}
  ${ComponentControlFragment}
`

const enhance = compose(
  withProps(ownProps => ({
    subscription: MANUAL_CONTROL_SUBSCRIPTION,
    variables: {
      machineID: ownProps.match.params.machineID,
    },
  })),
  withLiveData,
  withProps(({ singularMachine }) => ({
    machine: singularMachine[0],
    isReady: singularMachine[0] && singularMachine[0].status === 'READY',
  })),
)

const ManualControl = ({ machine, isReady }) => (
  <div style={{ paddingLeft: 16, paddingRight: 16 }}>
    <main>
      <Grid
        container
        spacing={2}
      >
        <Grid item xs={12}>
          <VideoStreamer />
        </Grid>
      </Grid>
      <Loader
        show={!isReady}
        message={(
          <Typography variant="h4" style={{ color: '#fff' }}>
            manual controls disabled while
            {' '}
            {machine.status.toLowerCase()}
          </Typography>
        )}
        style={{
          flex: 1,
          margin: 0,
        }}
        backgroundStyle={{
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
        }}
        contentStyle={{
          display: 'flex',
          flexWrap: 'wrap',
        }}
      >
        <Grid
          container
          spacing={2}
          style={{ marginTop: 16, marginBottom: 16 }}
        >
          <Grid item xs={12} lg={6}>
            <Home machine={machine} />
          </Grid>
          <Grid item xs={12} lg={6}>
            <MotorsEnabled machine={machine} />
          </Grid>
          <Grid item xs={12} sm={8}>
            <XYJogButtons machine={machine} form="xyJog" />
          </Grid>
          <Grid item xs={12} sm={4}>
            <ZJogButtons machine={machine} form="zJog" />
          </Grid>
        </Grid>
      </Loader>
      <Grid
        container
        spacing={2}
      >
        {
          machine.components
            .filter(c => ['BUILD_PLATFORM', 'TOOLHEAD', 'FAN'].includes(c.type))
            .map(component => (
              <Grid item xs={12} key={component.id}>
                <ComponentControl
                  machine={machine}
                  component={component}
                  disabled={!isReady}
                />
              </Grid>
            ))
        }
      </Grid>
    </main>
  </div>
)

export default enhance(ManualControl)
