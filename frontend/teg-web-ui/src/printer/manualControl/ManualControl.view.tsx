import React from 'react'
import Loader from 'react-loader-advanced'

import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import Divider from '@material-ui/core/Divider'
import Hidden from '@material-ui/core/Hidden'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'

import Home from './home/Home'
import MotorsEnabled from './MotorsEnabled'
import XYJogButtons from './jog/XYJogButtons'
import ZJogButtons from './jog/ZJogButtons'
import ComponentControl from './printerComponents/ComponentControl'
import MultiVideoStreamer from './videoStreamer/MultiVideoStreamer.page'

import useStyles from './ManualControl.styles'
import ServerBreadcrumbs from '../common/ServerBreadcrumbs'

const ManualControlView = ({
  machine,
  isReady,
  isPrinting,
  execGCodes,
}) => {
  const classes = useStyles()

  const videos = machine.components.filter(c => c.type === 'VIDEO')

  const components = machine.components
    .filter(c => ['BUILD_PLATFORM', 'TOOLHEAD', 'FAN'].includes(c.type))

  components.sort((a, b) => {
    if (a.heater && !b.heater) return -1
    if (b.heater && !a.heater) return 1
    return (a.address || '').localeCompare(b.address || '')
  })

  return (
    <div className={classes.root}>
      <div className={classes.breadcrumbs}>
        <ServerBreadcrumbs machineName={machine.name}>
          <Typography color="textPrimary">Maintenance</Typography>
        </ServerBreadcrumbs>
      </div>

      <MultiVideoStreamer
        machineID={machine.id}
        videos={videos}
      />
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
            style={{
              margin: 0,
              marginTop: 16,
              marginBottom: 16,
              width: '100%',
            }}
          >
            <Grid item xs={12} sm={12}>
              <Card style={{
                marginBottom: 16,
              }}>
                <CardContent style={{ paddingBottom: 16 }}>
                  <div className={classes.generalControls}>
                    <Home machine={machine} />
                    <MotorsEnabled machine={machine} />
                  </div>
                  <Hidden mdUp>
                    <Divider className={classes.generalAndJogDivider}/>
                  </Hidden>
                  <div className={classes.jogButtons}>
                    <XYJogButtons machine={machine} />
                    <div className={classes.jogDivider}>
                      <Hidden smDown>
                        <Divider orientation="vertical" flexItem />
                      </Hidden>
                      <Hidden mdUp>
                        <Divider />
                      </Hidden>
                    </div>
                    <ZJogButtons machine={machine} />
                  </div>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Loader>
        {
          components
            .map(component => (
              <ComponentControl
                key={component.id}
                machine={machine}
                component={component}
                execGCodes={execGCodes}
                isReady={isReady}
                isPrinting={isPrinting}
              />
            ))
        }
      </div>
    </div>
  )
}

export default ManualControlView
