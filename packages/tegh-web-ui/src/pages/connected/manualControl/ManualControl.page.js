import React from 'react'
import { compose, withProps } from 'recompose'
import {
  Grid,
  Typography,
} from '@material-ui/core'
import Loader from 'react-loader-advanced'
import gql from 'graphql-tag'

import connectionFrame from '../frame/connectionFrame'
import { DrawerFragment } from '../frame/components/Drawer'

import PrinterStatusGraphQL from '../shared/PrinterStatus.graphql'

import Header from '../frame/components/Header'
// import Log from './components/Log'
import Home from './components/home/Home'
import XYJogButtons from './components/jog/XYJogButtons'
import ZJogButtons from './components/jog/ZJogButtons'
import HeaterControl from './components/heaters/HeaterControl'

const MANUAL_CONTROL_SUBSCRIPTION = gql`
  subscription($printerID: ID!) {
    live {
      patch { op, path, from, value }
      query {
        ...DrawerFragment
        printer(id: $printerID) {
          ...PrinterStatus
        }
      }
    }
  }

  # fragments
  ${PrinterStatusGraphQL}
  ${DrawerFragment}
`

const enhance = compose(
  withProps(() => ({
    subscription: MANUAL_CONTROL_SUBSCRIPTION,
    variables: {
      printerID: 'test_printer_id',
    },
  })),
  connectionFrame,
  withProps(({ printer }) => ({
    isReady: printer.status === 'READY',
  })),
)

const ManualControl = ({ printer: { status }, printer, isReady }) => (
  <div>
    <Header printer={printer} />
    <main>
      <Grid
        container
        spacing={24}
      >
        <Loader
          show={!isReady}
          message={(
            <Typography variant="display1" style={{ color: '#fff' }}>
              manual controls disabled while
              {' '}
              {status.toLowerCase()}
            </Typography>
          )}
          style={{
            flex: 1,
            margin: 12,
          }}
          backgroundStyle={{
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
          }}
          contentStyle={{
            display: 'flex',
            flexWrap: 'wrap',
          }}
        >
          <Grid item xs={12}>
            <Home />
          </Grid>
          <Grid item xs={12} sm={8}>
            <XYJogButtons form="xyJog" />
          </Grid>
          <Grid item xs={12} sm={4}>
            <ZJogButtons form="zJog" />
          </Grid>
        </Loader>
        <Grid item xs={12}>
          <HeaterControl
            id="e0"
            isExtruder
            name="Extruder 1"
            disabled={!isReady}
          />
        </Grid>
        <Grid item xs={12}>
          <HeaterControl
            id="b"
            isExtruder={false}
            name="Bed"
            disabled={!isReady}
          />
        </Grid>
      </Grid>
    </main>
  </div>
)

export default enhance(ManualControl)
