import React, { useContext, useEffect, useMemo } from 'react'
import { useGraphQL, GraphQL } from 'graphql-react'

import { Link } from 'react-router-dom'
import { Formik, Field, Form } from 'formik'
import { TextField } from 'formik-material-ui'
import { animated, useSpring } from 'react-spring'
import Measure from 'react-measure'
import { Query, Mutation } from 'react-apollo'
import classNames from 'classnames'
import gql from 'graphql-tag'

import {
  Typography,
} from '@material-ui/core'

import Typeahead from '../../../common/Typeahead'
import Loading from '../../../common/Loading'

import ButtonsFooter from '../ButtonsFooter'

import FormikSchemaForm from '../../../printer/config/components/FormikSchemaForm/index'
import transformComponentSchema from '../../../printer/config/printerComponents/transformComponentSchema'

import useSchemaValidation from '../../../printer/config/components/FormikSchemaForm/useSchemaValidation'

import { getID } from '../../../UserDataProvider'
import userProfileServerFetchOptions from '../../../common/userProfileServer/fetchOptions'

import WithAuth0Token from '../../../common/auth/WithAuth0Token'

const CREATE_MACHINE = gql`
  mutation(
    $createMachine: CreateMachineInput!
  ) {
    createMachine(input: $createMachine) {
      errors { message }
    }
    consumeInvite {
      id
    }
  }
`

const schemaWithoutDef = ({ schema }) => {
  // TODO: temporary hack: manually filtering out advanced properites
  const {
    name,
    serialPortID
  } = schema.properties
  const properties = {
    name,
    serialPortID,
  }

  // const required = schema.required.filter(fieldName => (
  //   fieldName === 'machineDefinitionURL'
  // ))

  return {
    properties,
    required: [
      'name',
      'serialPortID'
    ],
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
  invite,
  auth0Token,
}) => {

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

  const machineDefName = null
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

  const saveToUserProfile = async (values) => {
    const graphql = new GraphQL()

    await graphql.operate({
      fetchOptionsOverride: userProfileServerFetchOptions(auth0Token),
      operation: {
        query: `
          mutation($input: CreateMachine!) {
            createMachine(input: $input) { id }
          }
        `,
        variables: {
          input: {
            publicKey: invite.peerIdentityPublicKey,
            name: values.name,
            slug: getID(invite),
          },
        },
      },
    })
  }

  return (
    <Mutation
      mutation={CREATE_MACHINE}
      onCompleted={() => {
        history.push(nextURL)
      }}
    >
      {(createMachine, { error }) => {
        if (error != null) {
          return (
            <div>
              <Typography variant="h6" paragraph>
                Something went wrong. Here's what we know:
              </Typography>
              <pre>
                {JSON.stringify(error, null, 2)}
              </pre>
            </div>
          )
        }

        return (
          <Formik
            enableReinitialize
            initialValues={{
              machineDefinitionURL,
              automaticPrinting: false,
              beforePrintHook: null,
              afterPrintHook: null,
              ...Object.keys(schema.properties || {}).reduce((acc, k) => {
                acc[k] = null
                return acc
              }, {}),
            }}
            validate={validate}
            onSubmit={async (values, { setSubmitting }) => {
              const variables = {
                createMachine: {
                  model: values,
                },
              }
              try {
                await saveToUserProfile(values)
                await createMachine({ variables })
              } catch (e) {
                setSubmitting(false)
                alert(e)
              }
            }}
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
      }}
    </Mutation>
  )
}

export default WithAuth0Token(Step3SetupForm)
