import React from 'react'
import gql from 'graphql-tag'
import { Query } from 'react-apollo'
import { compose } from 'recompose'
import { SchemaForm } from 'react-schema-form'
import {
  MenuItem,
} from '@material-ui/core'

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

const Page2 = ({
  printerID,
  values,
  setFieldValue,
}) => (
  <Query
    query={GET_SCHEMA_FORM}
    variables={{
      input: {
        routingMode: 'PRINTER',
        printerID,
        schemaFormKey: values.componentType,
      },
    }}
  >
    {({ loading, error, data }) => {
      if (loading) return null
      if (error) return `Error!: ${error}`
      return (
        <SchemaForm
          schema={data.schemaForm.schema}
          form={data.schemaForm.form}
          model={values.model}
          onModelChange={
            (keypath, value) => {
              // Note: we do not yet support nested fields here
              const nextModel = {
                ...data.model,
                [keypath[0]]: value,
              }
              setFieldValue('model', nextModel)
              // client.writeFragment({
              //   id: `${data.__typename}:${data.id}`,
              //   fragment: FORM_DIALOG_FRAGMENT,
              //   data: {
              //     ...data,
              //     model: nextModel,
              //   },
              // })
            }
          }
        />
      )
    }}
  </Query>
)

export const Component = Page2
export default enhance(Page2)
