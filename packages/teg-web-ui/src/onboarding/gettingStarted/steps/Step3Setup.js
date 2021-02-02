import React, { useState, useEffect } from 'react'
import { Query } from '@apollo/client'
import { gql } from '@apollo/client'
import { GraphQL } from 'graphql-react'
import { useMutation } from '@apollo/client'
import { useAsync } from 'react-async'
import { Link } from 'react-router-dom'

import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'

import { getID } from '../../../UserDataProvider'
import { useAuth } from '../../../common/auth'

import Loading from '../../../common/Loading'
// import useMachineDefSuggestions from '../../../common/_hooks/useMachineDefSuggestions'

import Step3SetupForm from './Step3SetupForm'

import useStyles from './Step3Setup.styles'

const MACHINE_FORM_QUERY = gql`
  query($input: SchemaFormQueryInput!) {
    schemaForm(input: $input) {
      schema
      form
    }
  }
`

const CONSUME_INVITE = gql`
  mutation {
    consumeInvite {
      id
    }
  }
`


const Step3Setup = ({
  connecting,
  data,
  className,
  history,
  location,
  setSkippedStep3,
}) => {
  const classes = useStyles()
  const [machineDefinitionURL, setMachineDefinitionURL] = useState('placeholder')
  const { fetchOptions } = useAuth()

  const [consumeInvite] = useMutation(CONSUME_INVITE)

  // const {
  //   suggestions,
  //   loading: loadingMachineDefs,
  // } = useMachineDefSuggestions()

  const { isConfigured } = data || {}

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

  useEffect(() => {
    if (skipStep3Async.error) {
      console.error('skip 3 error?', skipStep3Async.error.code, skipStep3Async.error.message)
    }
  }, [skipStep3Async.error])

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

  // console.log(loadingMachineDefs, connecting)
  // const loading = loadingMachineDefs || connecting
  const loading = connecting

  if (loading || isConfigured) {
    return (
      <Loading className={classes.loading}>
        Connecting to Raspberry Pi
      </Loading>
    )
  }

  console.log(data.devices)

  let { devices } = data
  if (devices.length === 0) {
    devices = [
      { id: '/dev/null' },
    ]
  }

  return (
    <Query
      query={MACHINE_FORM_QUERY}
      variables={{
        input: {
          collection: 'MACHINE',
          schemaFormKey: 'PLACEHOLDER', // machineDefinitionURL,
        },
      }}
      // skip={machineDefinitionURL == null}
      fetchPolicy="network-only"
    >
      {({
        loading: loadingMachineSettings,
        error: machineSettingsError,
        data: settingsData,
      }) => (
        <Step3SetupForm
          classes={classes}
          className={className}
          history={history}
          location={location}
          // suggestions={suggestions}
          machineDefinitionURL={machineDefinitionURL}
          setMachineDefinitionURL={setMachineDefinitionURL}
          devices={
            // data.devices.filter(device => device.connected)
            devices
          }
          loadingMachineSettings={loadingMachineSettings}
          machineSettingsError={machineSettingsError}
          schemaForm={settingsData && settingsData.schemaForm}
        />
      )}
    </Query>
  )
}

export default Step3Setup
