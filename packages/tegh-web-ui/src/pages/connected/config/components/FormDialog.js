import React from 'react'
import { compose, withProps } from 'recompose'
import { withRouter } from 'react-router'
import { SchemaForm } from 'react-schema-form'
import gql from 'graphql-tag'
import { Query, Mutation } from 'react-apollo'
import { Link } from 'react-router-dom'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@material-ui/core'

export const FORM_DIALOG_FRAGMENT = gql`
  fragment FormDialogFragment on ConfigForm {
    __typename
    id
    model
    modelVersion
    schemaForm {
      schema
      form
    }
  }
`

const SUBMIT_FORM_DIALOG = gql`
  mutation submitFormDialog($input: SetConfigInput!) {
    setConfig(input: $input) {
      errors {
        dataPath
        message
      }
    }
  }
`

const enhance = compose(
  withRouter,
  withProps(ownProps => ({
    initialValues: ownProps.data,
  })),
  Component => (({
    query,
    variables,
    open,
    ...props
  }) => {
    if (!open) return <div />
    return (
      <Query
        query={query}
        variables={variables}
        fetchPolicy="network-only"
      >
        {({
          loading,
          error,
          data,
          client,
        }) => {
          if (loading) return <div />
          if (error != null) {
            return (
              <div>
                <h1>Error</h1>
                {JSON.stringify(error)}
              </div>
            )
          }
          const isPrinterConfig = data.materials == null

          let routingMode = 'PRINTER'
          if (!isPrinterConfig) {
            routingMode = 'MATERIAL'
          }

          const configFormModel = (() => {
            if (data.materials != null) return data.materials[0]

            const config = data.printerConfigs[0]
            return (config.plugins || config.components)[0]
          })()

          return (
            <Component
              routingMode={routingMode}
              isPrinterConfig={isPrinterConfig}
              open={open}
              data={configFormModel}
              client={client}
              printerID={variables.printerID}
              {...props}
            />
          )
        }}
      </Query>
    )
  }),
  Component => (props) => {
    const {
      routingMode,
      printerID,
      data,
      isPrinterConfig,
      history,
    } = props

    const input = {
      configFormID: data.id,
      modelVersion: data.modelVersion,
      model: data.model,
      routingMode,
    }

    if (isPrinterConfig) {
      input.printerID = printerID
    }

    return (
      <Mutation
        mutation={SUBMIT_FORM_DIALOG}
        variables={{ input }}
        update={(mutationResult) => {
          if (mutationResult.data != null) {
            const nextURL = history.location.pathname
              .replace(/[^/]+\/$/, '')
              .replace(/materials\/[^/]+\/$/, 'materials/')
            history.push(nextURL)
          }
        }}
      >
        {
          (submitFormDialog, { called, error }) => {
            if (error != null) return <div>{JSON.stringify(error)}</div>
            if (called) return <div />
            return (
              <Component
                onSubmit={submitFormDialog}
                {...props}
              />
            )
          }
        }
      </Mutation>
    )
  },
)

const FormDialog = ({
  title,
  name,
  id,
  open,
  history,
  onSubmit,
  onDelete,
  data,
  client,
  isPrinterConfig,
}) => (
  <Dialog
    open={open}
    onClose={() => history.goBack()}
    aria-labelledby="form-dialog-title"
    maxWidth="md"
    fullWidth
  >
    <DialogTitle id="form-dialog-title">{title || name || id}</DialogTitle>
    <DialogContent>
      <SchemaForm
        schema={data.schemaForm.schema}
        form={data.schemaForm.form}
        model={data.model}
        onModelChange={
          (keypath, value) => {
            // Note: we do not yet support nested fields here
            const nextModel = {
              ...data.model,
              [keypath[0]]: value,
            }
            client.writeFragment({
              id: `${data.__typename}:${data.id}`,
              fragment: FORM_DIALOG_FRAGMENT,
              data: {
                ...data,
                model: nextModel,
              },
            })
          }
        }
      />
    </DialogContent>
    <DialogActions>
      <div style={{ flex: 1 }}>
        <Link to={'delete'} style={{ textDecoration: 'none' }}>
          <Button color="secondary">
            Delete
          </Button>
        </Link>
      </div>
      <Button onClick={() => history.goBack()}>
        Cancel
      </Button>
      <Button onClick={onSubmit} color="primary">
        Save
      </Button>
    </DialogActions>
  </Dialog>
)

export const Component = FormDialog
export default enhance(FormDialog)
