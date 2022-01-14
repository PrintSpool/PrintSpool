import React from 'react'

import { animated, useSpring } from 'react-spring'
import Measure from 'react-measure'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import { Link, useParams } from 'react-router-dom'

// import Typeahead from '../../../common/Typeahead'
import ServerBreadcrumbs from '../common/ServerBreadcrumbs'
import Loading from '../../common/Loading'
import ConfigForm from '../config/components/ConfigForm/ConfigForm'
import ConfigFields from '../config/components/ConfigForm/ConfigFields'
import AddPrinterStyles from './AddPrinter.styles'
import StaticTopNavigation from '../../common/topNavigation/StaticTopNavigation'

const AddPrinterView = ({
  // machineDefinitionURL,
  // setMachineDefinitionURL,
  // suggestions,
  loadingMachineSettings,
  machineSettingsError,
  mutation,
  configForm,
  onSubmit,
}) => {
  const classes = AddPrinterStyles()
  const { hostID } = useParams()

  // const machineDefName = useMemo(() => {
  //   const suggestion = suggestions.find((suggestion) => (
  //     suggestion.value === machineDefinitionURL
  //   ))
  //
  //   if (suggestion == null) return null
  //
  //   return suggestion.label
  // }, [machineDefinitionURL, suggestions])
  //
  // const machineIsSet = machineDefName != null

  // const machineDefName = null
  const machineIsSet = true

  // const configSpring = useSpring({ x: machineIsSet ? 1 : 0 })
  const configSpring = useSpring({ x: 1 })

  if (loadingMachineSettings) {
    return <Loading fullScreen />
  }

  return (
    <ConfigForm {...{
      configForm,
      developerMode: false,
      mutation,
      onSubmit,
    }} >
      <StaticTopNavigation />
      <div className={classes.form}>
        <ServerBreadcrumbs>
          <Typography color="textPrimary">Add Printer</Typography>
        </ServerBreadcrumbs>

        { mutation.loading && <Loading /> }

        { !mutation.loading && (
          <>
            <div className={classes.stretchedContent} >
              <div>
                <div className={classes.part1}>
                  <Measure bounds>
                    {({ measureRef, contentRect: { bounds } }) => (
                      <animated.div
                        style={{
                          height: configSpring.x
                            .interpolate({
                              range: [0, 0.5, 1],
                              output: [bounds.height, bounds.height, 0],
                            })
                            .interpolate(x => `${x}px`),
                          opacity: configSpring.x.interpolate({
                            range: [0, 0.5],
                            output: [1, 0],
                          }),
                        }}
                      >
                        <div className={classes.introText} ref={measureRef}>
                          <Typography variant="h6" paragraph>
                            Great! we've connected to your Raspberry Pi!
                          </Typography>
                        </div>
                      </animated.div>
                    )}
                  </Measure>
                  {/*
                    <Typography variant="body1" paragraph>
                      Now, what kind of 3D Printer do you have?
                    </Typography>
                    <Typeahead
                      suggestions={suggestions}
                      name="machineDefinitionURL"
                      label="Search printer make and models"
                      onChange={setMachineDefinitionURL}
                    />
                  */}
                </div>
                <animated.div
                  className={classes.config}
                  style={{
                    flex: configSpring.x.interpolate({
                      range: [0, 0.5],
                      output: [0, 1],
                    }),
                    opacity: configSpring.x.interpolate({
                      range: [0, 0.5, 1],
                      output: [0, 0, 1],
                    }),
                  }}
                >
                  { machineIsSet && (() => {
                    if (loadingMachineSettings) {
                      return (
                        <Loading className={classes.loadingPart2}>
                          Loading Printer Settings...
                        </Loading>
                      )
                    }
                    if (machineSettingsError != null) {
                      return (
                        <div>
                          <h1>Error</h1>
                          {JSON.stringify(machineSettingsError)}
                        </div>
                      )
                    }

                    return (
                      <>
                        <Typography variant="h1" className={classes.title}>
                          Add Printer
                        </Typography>
                        {/*
                          <Typography variant="body1" paragraph>
                            { 'aeiouAEIOU'.includes(machineDefName[0]) ? 'An' : 'A'}
                            {' '}
                            <b>
                              {machineDefName}
                            </b>
                            ?
                            {' '}
                            Great. We just need a bit of information to get it set up.
                          </Typography>
                        */}
                        <ConfigFields />
                        {/* { (values.name || '').endsWith('uuddlrlr') && (
                          <div>
                            Dev Mode Enabled
                            {' '}
                            <Link to={nextURL}>Skip Setup</Link>
                          </div>
                        )} */}
                      </>
                    )
                  })()}
                </animated.div>
              </div>
            </div>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              className={classes.submit}
            >
              Add Printer
            </Button>
          </>
        )}
      </div>
    </ConfigForm>
  )
}

export default AddPrinterView
