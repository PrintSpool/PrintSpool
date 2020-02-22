import React, { useState, useEffect } from 'react'
import { Query } from 'react-apollo'
import gql from 'graphql-tag'
import { GraphQL } from 'graphql-react'
import { useMutation } from 'react-apollo-hooks'

import { getID } from '../../../UserDataProvider'
import userProfileServerFetchOptions from '../../../common/userProfileServer/fetchOptions'

import WithAuth0Token from '../../../common/auth/WithAuth0Token'

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
  auth0Token,
}) => {
  const classes = Step3SetupStyles()
  const [machineDefinitionURL, setMachineDefinitionURL] = useState('placeholder')

  const [consumeInvite] = useMutation(CONSUME_INVITE)

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

  // const {
  //   suggestions,
  //   loading: loadingMachineDefs,
  // } = useMachineDefSuggestions()

  const { isConfigured } = data || {}

  // skip step 3 for configured 3D printers
  useEffect(() => {
    (async () => {
      if (isConfigured) {
        await saveToUserProfile({
          name: data.jobQueue.name,
        })
        await consumeInvite()
        setSkippedStep3(true)
        history.push(`/get-started/4${location.search}`)
      }
    })()
  }, [isConfigured])

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

export default WithAuth0Token(Step3Setup)
