import React from 'react'

// import { TextField } from 'formik-material-ui'
import { animated, useSpring } from 'react-spring'
import Measure from 'react-measure'
import classNames from 'classnames'
import { useApolloClient } from '@apollo/client'

import Typography from '@material-ui/core/Typography'

// import Typeahead from '../../../common/Typeahead'
import Loading from '../../../common/Loading'

import ButtonsFooter from '../ButtonsFooter'

import ConfigForm from '../../../printer/config/components/ConfigForm/ConfigForm'
import ConfigFields from '../../../printer/config/components/ConfigForm/ConfigFields'

const Step3SetupView = ({
  classes,
  // machineDefinitionURL,
  // setMachineDefinitionURL,
  // suggestions,
  className,
  loadingMachineSettings,
  machineSettingsError,
  history,
  mutation,
  configForm,
  onSubmit,
}) => {
  const apollo = useApolloClient()
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

  return (
    <ConfigForm {...{
      configForm,
      mutation,
      onSubmit,
    }} >
      <div className={classes.form}>
        { mutation.loading && <Loading /> }

        { !mutation.loading && (
          <>
            <div
              className={classNames([
                className,
                classes.stretchedContent,
              ])}
            >
              <div className={classes.root}>
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
                        <Typography variant="body1">
                          Great! We just need a bit of information to get it set up.
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
            <ButtonsFooter
              step={3}
              // disable={machineIsSet === false || isSubmitting}
              type="submit"
              component="button"
              history={history}
            />
          </>
        )}
      </div>
    </ConfigForm>
  )
}

export default Step3SetupView
