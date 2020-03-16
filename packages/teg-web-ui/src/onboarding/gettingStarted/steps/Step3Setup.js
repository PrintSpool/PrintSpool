import React, { useState, useEffect } from 'react'
import { Query } from 'react-apollo'
import gql from 'graphql-tag'
import { GraphQL } from 'graphql-react'
import { useMutation } from 'react-apollo-hooks'
import { useAsync } from 'react-async'

import { getID } from '../../../UserDataProvider'
import { useAuth } from '../../../common/auth'

import Loading from '../../../common/Loading'
// import useMachineDefSuggestions from '../../../common/_hooks/useMachineDefSuggestions'

import Step3SetupForm from './Step3SetupForm'

import Step3SetupStyles from './Step3SetupStyles'

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
  invite,
}) => {
  const classes = Step3SetupStyles()
  const [machineDefinitionURL, setMachineDefinitionURL] = useState('placeholder')
  const { fetchOptions } = useAuth()

  const [consumeInvite] = useMutation(CONSUME_INVITE)

  const saveToUserProfile = async (values) => {
    const graphql = new GraphQL()

    const { cacheValuePromise } = graphql.operate({
      fetchOptionsOverride: fetchOptions,
      operation: {
        query: `
          mutation($input: CreateMachineInput!) {
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

    const { data: userProfileData, ...errors } = await cacheValuePromise

    if (userProfileData == null) {
      throw new Error(JSON.stringify(errors))
    }
  }

  // const {
  //   suggestions,
  //   loading: loadingMachineDefs,
  // } = useMachineDefSuggestions()

  const { isConfigured } = data || {}

  // skip step 3 for configured 3D printers
  const skipStep3Async = useAsync({
    deferFn: async () => {
      await saveToUserProfile({
        name: data.jobQueue.name,
      })
      await consumeInvite()
      setSkippedStep3(true)
      history.push(`/get-started/4${location.search}`)
    },
  })

  useEffect(() => {
    if (isConfigured) skipStep3Async.run()
  }, [isConfigured])

  if (skipStep3Async.error) {
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
            data.devices
          }
          loadingMachineSettings={loadingMachineSettings}
          machineSettingsError={machineSettingsError}
          schemaForm={settingsData && settingsData.schemaForm}
          saveToUserProfile={saveToUserProfile}
        />
      )}
    </Query>
  )
}

export default Step3Setup
