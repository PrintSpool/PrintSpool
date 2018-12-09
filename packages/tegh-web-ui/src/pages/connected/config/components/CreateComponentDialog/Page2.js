import React from 'react'
import gql from 'graphql-tag'
import { Query } from 'react-apollo'
import { compose } from 'recompose'
import Ajv from 'ajv'
import {
  MenuItem,
} from '@material-ui/core'
import { createSelector } from 'reselect'

const GET_SCHEMA_FORM = gql`
  query GetSchemaForm($input: SchemaFormQueryInput!) {
    schemaForm(input: $input) {
      id
      schema
      form
    }
  }
`

const enhance = compose(
)

const getSchemaBridge = createSelector(
  schema => schema,
  (schema) => {
    const ajv = new Ajv({
      allErrors: true,
      useDefaults: true,
    })

    const validator = ajv.compile(schema)

    const schemaValidator = (model) => {
      validator(model)

      if (validator.errors && validator.errors.length) {
        // eslint-disable-next-line no-throw-literal
        throw { details: validator.errors }
      }
    }

    const schemaBridge = new JSONSchemaBridge(schema, schemaValidator)
    return schemaBridge
  },
)

const Page2 = ({
  printerID,
  values,
  setFieldValue,
}) => (
  <Query
    query={GET_SCHEMA_FORM}
    variables={{
      input: {
        collection: 'COMPONENT',
        printerID,
        schemaFormKey: values.componentType,
      },
    }}
  >
    {({ loading, error, data }) => {
      if (loading) return null
      if (error) return `Error!: ${error}`

      const schemaBridge = getSchemaBridge(data.schemaForm.schema)

      // { JSON.stringify(values.model)}
      return (
        <ValidatedQuickForm
          showInlineError
          schema={schemaBridge}
          model={values.model}
          onChange={
            (key, value) => {
              // Note: we do not yet support nested fields here
              const nextModel = {
                ...values.model,
                [key]: value,
              }
              setFieldValue('model', nextModel)
            }
          }
        />
      )
    }}
  </Query>
)

export const Component = Page2
export default enhance(Page2)
