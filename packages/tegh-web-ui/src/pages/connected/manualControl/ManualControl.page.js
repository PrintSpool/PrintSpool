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
import HeaterControl, { HeaterControlFragment } from './components/heaters/HeaterControl'

const MANUAL_CONTROL_SUBSCRIPTION = gql`
  subscription($printerID: ID!) {
    live {
      patch { op, path, from, value }
      query {
        ...DrawerFragment
        singularPrinter: printers(id: $printerID) {
          ...PrinterStatus
          heaters {
            ...HeaterControlFragment
          }
        }
      }
    }
  }

  # fragments
  ${PrinterStatusGraphQL}
  ${HeaterControlFragment}
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
  withProps(({ singularPrinter }) => ({
    printer: singularPrinter[0],
    isReady: singularPrinter[0].status === 'READY',
  })),
)

const ManualControl = ({ printer, isReady }) => (
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
            <Typography variant="h4" style={{ color: '#fff' }}>
              manual controls disabled while
              {' '}
              {printer.status.toLowerCase()}
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
        {
          printer.heaters.map(heater => (
            <Grid item xs={12} key={heater.id}>
              <HeaterControl
                heater={heater}
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
