import React, { useState, useEffect, useMemo } from 'react'
import { Query, Mutation } from 'react-apollo'
import gql from 'graphql-tag'

import {
  Button,
  Typography,
  Paper,
  MenuItem,
} from '@material-ui/core'

import Loading from '../../common/Loading'

import Step3SetupForm from './Step3SetupForm'

import Step3SetupStyles from './Step3SetupStyles'

import useSchemaValidation from '../../pages/connected/config/components/FormikSchemaForm/useSchemaValidation'

const MACHINE_DEFS_DAT = 'dat://a295acba915cf57a98854f9f4ecf4be0aa03342a1b814bed591592b611f87e66+preview/'

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

  const [machineDefs, setMachineDefs] = useState(null)
  const [machineDefinitionURL, setMachineDefinitionURL] = useState(null)
  const loadingMachineDefs = machineDefs == null

  useEffect(() => {
    (async () => {
      // eslint-disable-next-line no-undef
      const archive = new DatArchive(MACHINE_DEFS_DAT)
      const indexFileContent = await archive.readFile('/index.json')
      const index = JSON.parse(indexFileContent)

      setMachineDefs(index)
    })()
  }, [])

  const suggestions = useMemo(() => (
    Object.entries(machineDefs || {})
      .filter(([, def]) => (
        def.visible && def.fileFormats.includes('text/x-gcode')
      ))
      .map(([filename, def]) => ({
        label: def.name,
        value: `${MACHINE_DEFS_DAT.slice(0, -1)}${filename}`,
      }))
  ), [machineDefs])

  const loading = loadingMachineDefs || connecting
  if (loadingMachineDefs || connecting) {
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
        }
      }}
      skip={machineDefinitionURL == null}
      fetchPolicy="network-only"
    >
      {({
        loading: loadingMachineSettings,
        error:  machineSettingsError,
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
            //data.devices.filter(device => device.connected)
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
