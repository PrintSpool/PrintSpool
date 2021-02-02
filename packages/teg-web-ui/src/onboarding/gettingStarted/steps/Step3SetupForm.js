import React, { useMemo } from 'react'

import { Link } from 'react-router-dom'
import { Formik, Form } from 'formik'
// import { TextField } from 'formik-material-ui'
import { animated, useSpring } from 'react-spring'
import Measure from 'react-measure'
import classNames from 'classnames'
import { gql } from '@apollo/client'
import { useApolloClient } from '@apollo/client'
import { useAsync } from 'react-async'

import {
  Typography,
} from '@material-ui/core'

// import Typeahead from '../../../common/Typeahead'
import Loading from '../../../common/Loading'

import ButtonsFooter from '../ButtonsFooter'

import FormikSchemaForm from '../../../printer/config/components/FormikSchemaForm/index'
import transformComponentSchema from '../../../printer/config/printerComponents/transformComponentSchema'

import useSchemaValidation from '../../../printer/config/components/FormikSchemaForm/useSchemaValidation'

const createMachineMutation = gql`
  mutation(
    $input: CreateMachineInput!
  ) {
    createMachine(input: $input) {
      errors { message }
    }
  }
`


const schemaWithoutDef = ({ schema }) => {
  const properties = { ...schema.properties }
  delete properties.machineDefinitionURL

  const required = schema.required.filter(fieldName => (
    fieldName !== 'machineDefinitionURL'
  ))

  return {
    properties,
    required,
  }
}

const Step3SetupForm = ({
  classes,
  machineDefinitionURL,
  setMachineDefinitionURL,
  suggestions,
  devices,
  className,
  loadingMachineSettings,
  machineSettingsError,
  schemaForm,
  history,
  location,
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

  const { schema = {}, form } = useMemo(() => {
    if (schemaForm == null) {
      return {}
    }

    return {
      schema: transformComponentSchema({
        schema: schemaWithoutDef(schemaForm),
        materials: [],
        devices,
      }),
      form: schemaForm.form,
    }
  }, [schemaForm])

  const validate = useSchemaValidation({ schema })

  const nextURL = `/get-started/4${location.search}`

  const submit = useAsync({
    deferFn: async ([values, { setSubmitting }]) => {
      try {
        console.log({ values })

        // Create the machine's configuration
        const { data: { createMachine } } = await apollo.mutate({
          mutation: createMachineMutation,
          variables: {
            input: {
              model: values,
            },
          },
        })

        if (createMachine.errors != null) {
          throw new Error(JSON.stringify(createMachine.errors, null, 2))
        }

        // Consume the invite token
        await apollo.mutate({
          mutation: gql`
            mutation {
              consumeInvite {
                id
              }
            }
          `,
        })

        // Proceed to the next page
        history.push(nextURL)
      } finally {
        setSubmitting(false)
      }
    },
  })

  if (submit.error) {
    throw submit.error
  }

  return (
    <Formik
      enableReinitialize
      initialValues={{
        // machineDefinitionURL,
        ...Object.keys(schema.properties || {}).reduce((acc, k) => {
          acc[k] = schema.properties[k].default
          return acc
        }, {}),
      }}
      validate={validate}
      onSubmit={submit.run}
    >
      {({ values, isSubmitting }) => (
        <Form className={classes.form}>
          { isSubmitting && <Loading /> }

          { !isSubmitting && (
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
                        <React.Fragment>
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
                          <FormikSchemaForm
                            schema={schema}
                            form={form}
                            path=""
                            className={classes.configForm}
                          />
                          { (values.name || '').endsWith('uuddlrlr') && (
                            <div>
                              Dev Mode Enabled
                              {' '}
                              <Link to={nextURL}>Skip Setup</Link>
                            </div>
                          )}
                        </React.Fragment>
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
        </Form>
      )}
    </Formik>
  )
}

export default Step3SetupForm
