import React from 'react'
import { compose, withProps } from 'recompose'
import { withRouter } from 'react-router'
import { reduxForm } from 'redux-form'
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
    form: `formDialog/${ownProps.match.printerID}/${ownProps.form}`,
    initialValues: ownProps.config,
  })),
  reduxForm(),
)

const FormDialog = ({
  Page,
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
    <DialogTitle id="form-dialog-title">3D Printer</DialogTitle>
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
