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
  // branch(
  //   props => props.open,
  //   compose(
  //     reduxForm(),
  //     formValues({ name: 'name', id: 'id' }),
  //   ),
  // ),
)

console.log("moo21aaasdf2")

const FormDialog = ({
  Page,
  title,
  name,
  id,
  open,
  history,
  onSubmit,
  ...props
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
      <Page {...props} />
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
