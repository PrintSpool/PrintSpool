import React from 'react'
import { compose, withProps } from 'recompose'
import { withRouter } from 'react-router'
import { SchemaForm } from 'react-schema-form'
import gql from 'graphql-tag'
import { Query } from 'react-apollo'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@material-ui/core'

export const FORM_DIALOG_FRAGMENT = gql`
  fragment FormDialogFragment on ConfigForm {
    id
    model
    schemaForm {
      schema
      form
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
      <Query query={query} variables={variables}>
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
          const configFormModel = (() => {
            if (data.materials != null) return data.materials[0]

            const config = data.printerConfigs[0]
            return (config.plugins || config.components)[0]
          })()

          console.log({ configFormModel})

          return (
            <Component
              open={open}
              data={configFormModel}
              client={client}
              {...props}
            />
          )
        }}
      </Query>
    )
  }),
)

const FormDialog = ({
  title,
  name,
  id,
  open,
  history,
  onSubmit,
  data,
  client,
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
            const changeset = { [keypath[0]]: value }
            client.writeData({ data: { model: changeset } })
          }
        }
      />
    </DialogContent>
    <DialogActions>
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
