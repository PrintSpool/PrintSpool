import React, { useState, useEffect } from 'react'
import { gql, useMutation } from '@apollo/client'
import { useAsync } from 'react-async'
import { Link } from 'react-router-dom'

import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'

// import { getID } from '../../../UserDataProvider'
// import { useAuth } from '../../../common/auth'

import Loading from '../../../common/Loading'
import useLiveSubscription from '../../../printer/_hooks/useLiveSubscription'
// import useMachineDefSuggestions from '../../../common/_hooks/useMachineDefSuggestions'
import { CONFIG_FORM_FRAGMENT } from '../../../printer/config/components/ConfigForm/ConfigForm'
import transformComponentSchema from '../../../printer/config/printerComponents/transformComponentSchema'

import Step3SetupForm from './Step3Setup.view'
import useStyles from './Step3Setup.styles'

const QUERY = gql`
  fragment QueryFragment on Query {
    isConfigured
    devices {
      id
    }
    configForm: machineConfigForm {
      ...ConfigFormFragment
    }
  }
  ${CONFIG_FORM_FRAGMENT}
`

const CREATE_MACHINE = gql`
  mutation(
    $input: CreateMachineInput!
  ) {
    createMachine(input: $input) {
      id
    }
  }
`

const Step3Setup = ({
  className,
  history,
  location,
  setSkippedStep3,
}) => {
  const classes = useStyles()
  // const [machineDefinitionURL, setMachineDefinitionURL] = useState('placeholder')
  // const { fetchOptions } = useAuth()

  const { data, error, loading } = useLiveSubscription(QUERY, {
    fetchPolicy: 'network-only',
  });

  // const {
  //   suggestions,
  //   loading: loadingMachineDefs,
  // } = useMachineDefSuggestions()

  // console.log(loadingMachineDefs, connecting)
  // const loading = loadingMachineDefs || connecting
  const {
    isConfigured,
  } = data || {}

  let {
    devices,
    configForm
  } = data || {}

  if (devices && devices.length === 0) {
    devices = [
      { id: '/dev/null' },
    ]
  }

  const schemaWithoutDef = ({ schema }) => {
    const properties = { ...schema.properties }
    delete properties.machineDefinitionURL

    const required = schema.required.filter(fieldName => (
      fieldName !== 'machineDefinitionURL'
    ))

    return {
      ...schema,
      properties,
      required,
    }
  }

  configForm = configForm && {
    ...configForm,
    schema: transformComponentSchema({
      schema: schemaWithoutDef(configForm),
      materials: [],
      devices,
    })
  }

  // skip step 3 for configured 3D printers
  const skipStep3Async = useAsync({
    deferFn: async () => {
      // await consumeInvite()
      setSkippedStep3(true)
      history.push(`/get-started/4${location.search}`)
    },
  })

  useEffect(() => {
    if (isConfigured) skipStep3Async.run()
  }, [isConfigured])

  const [createMachine, mutation] = useMutation(CREATE_MACHINE, {
    update: (mutationResult: any) => {
      if (mutationResult.data != null) {
        const nextURL = `/get-started/4${location.search}`
        // Proceed to the next page
        history.push(nextURL)
      }
    }
  })

  if (skipStep3Async.error) {
    // TODO: error codes instead of error message parsing
    // Checks if the invite has been consumed
    if (skipStep3Async.error.message.includes('consumed')) {
      return (
        <div className={classes.inviteAlreadyConsumed}>
          <Typography variant="h5" paragraph>
            Oh no, it looks like this invite code has already been used.
          </Typography>
          <Button
            variant="outlined"
            component={React.forwardRef((props, ref) => (
              <Link to="/login" innerRef={ref} {...props} />
            ))}
          >
            Back to Home
          </Button>
        </div>
      )
    }
    throw skipStep3Async.error
  }

  if (loading || isConfigured || data == null) {
    return (
      <Loading className={classes.loading}>
        Connecting to Raspberry Pi
      </Loading>
    )
  }

  return (
    <Step3SetupForm
      classes={classes}
      className={className}
      history={history}
      // suggestions={suggestions}
      // machineDefinitionURL={machineDefinitionURL}
      // setMachineDefinitionURL={setMachineDefinitionURL}
      loadingMachineSettings={loading}
      machineSettingsError={error}
      {...{
        mutation,
        configForm,
        onSubmit: ({ model }) => createMachine({
          variables: {
            input: {
              model,
            },
          },
        }),
      }}
    />
  )
}

export default Step3Setup
