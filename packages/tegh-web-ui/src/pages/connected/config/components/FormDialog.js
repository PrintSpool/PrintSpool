import React from 'react'
import { compose, withProps, branch } from 'recompose'
import { withRouter } from 'react-router'
import { reduxForm, formValues } from 'redux-form'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@material-ui/core'

const enhance = compose(
  withRouter,
  withProps(ownProps => ({
    initialValues: ownProps.data,
  })),
  branch(
    props => props.open,
    compose(
      reduxForm(),
      formValues('name'),
    ),
  ),
)

const FormDialog = ({
  Page,
  title,
  name,
  open,
  history,
  handleSubmit,
  ...props
}) => (
  <Dialog
    open={open}
    onClose={() => history.goBack()}
    aria-labelledby="form-dialog-title"
  >
    <DialogTitle id="form-dialog-title">{title || name}</DialogTitle>
    <DialogContent>
      <Page {...props} />
    </DialogContent>
    <DialogActions>
      <Button
        onClick={() => history.goBack()}
        color="primary"
      >
        Cancel
      </Button>
      <Button onClick={handleSubmit} color="primary">
        Save
      </Button>
    </DialogActions>
  </Dialog>
)

export const Component = FormDialog
export default enhance(FormDialog)
