import React from 'react'
import {
  Grid,
  Typography,
} from '@material-ui/core'
import Loader from 'react-loader-advanced'

import Home from './home/Home'
import MotorsEnabled from './MotorsEnabled'
import XYJogButtons from './jog/XYJogButtons'
import ZJogButtons from './jog/ZJogButtons'
import ComponentControl from './printerComponents/ComponentControl'
import VideoStreamer from './videoStreamer/VideoStreamer'

import useStyles from './ManualControl.styles'

const ManualControlView = ({ machine, isReady }) => {
  const classes = useStyles()

  return (
    <div className={classes.root}>
      <div className={classes.videoStreamer}>
        <VideoStreamer />
      </div>

      <div className={classes.controls}>
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
      </div>
    </div>
  )
}

export default ManualControlView
