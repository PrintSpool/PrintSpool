import React from 'react'
import { compose, withProps, branch } from 'recompose'
import { withRouter } from 'react-router'
import { SchemaForm } from 'react-schema-form'
import gql from 'graphql-tag'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@material-ui/core'

export const FORM_DIALOG_FRAGMENT = gql`
  fragment FormDialogFragment on ConfigurationForm {
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
  // branch(
  //   props => props.open,
  //   compose(
  //     reduxForm(),
  //     formValues({ name: 'name', id: 'id' }),
  //   ),
  // ),
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
