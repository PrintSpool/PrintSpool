import React, { useState } from 'react'
import { Query } from 'react-apollo'
import gql from 'graphql-tag'

import Loading from '../../../common/Loading'
import useMachineDefSuggestions from '../../../common/_hooks/useMachineDefSuggestions'

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

const Step3Setup = ({
  connecting,
  data,
  className,
  history,
  location,
}) => {
  const classes = Step3SetupStyles()
  const [machineDefinitionURL, setMachineDefinitionURL] = useState()

  const {
    suggestions,
    loading: loadingMachineDefs,
  } = useMachineDefSuggestions()

  const loading = loadingMachineDefs || connecting

  if (loading) {
    return (
      <div className={classes.root}>
        <Loading>
          Connecting to Raspberry Pi
        </Loading>
      </div>
    )
  }

  return (
    <Query
      query={MACHINE_FORM_QUERY}
      variables={{
        input: {
          collection: 'MACHINE',
          schemaFormKey: machineDefinitionURL,
        },
      }}
      skip={machineDefinitionURL == null}
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
          suggestions={suggestions}
          machineDefinitionURL={machineDefinitionURL}
          setMachineDefinitionURL={setMachineDefinitionURL}
          devices={
            // data.devices.filter(device => device.connected)
            data.devices
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
